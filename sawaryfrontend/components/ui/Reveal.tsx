'use client';

import type { ReactNode } from 'react';
import { motion, MotionConfig, type TargetAndTransition } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

// Scroll-in animations, playing once when the element enters the viewport.
// - rise:    fades in while rising
// - curtain: uncovers bottom→top (clip-path) while rising slightly — for image cards
// - pop:     fades in while scaling up — for small badges/buttons
const VARIANTS: Record<'rise' | 'curtain' | 'pop', { hidden: TargetAndTransition; show: TargetAndTransition }> = {
    rise: {
        hidden: { opacity: 0, y: 32 },
        show: { opacity: 1, y: 0 },
    },
    curtain: {
        hidden: { clipPath: 'inset(100% 0% 0% 0% round 25px)', y: 40 },
        show: { clipPath: 'inset(0% 0% 0% 0% round 25px)', y: 0 },
    },
    pop: {
        hidden: { opacity: 0, scale: 0.4 },
        show: { opacity: 1, scale: 1 },
    },
};

interface RevealProps {
    children: ReactNode;
    variant?: keyof typeof VARIANTS;
    delay?: number;
    duration?: number;
    className?: string;
}

// Lets server components (e.g. GallerySection) opt into scroll animations without
// becoming client components themselves.
export default function Reveal({ children, variant = 'rise', delay = 0, duration = 0.9, className }: RevealProps) {
    const { hidden, show } = VARIANTS[variant];
    const transition = { duration, delay, ease: EASE };

    return (
        // reducedMotion="user": visitors who prefer reduced motion get fades only, no movement.
        <MotionConfig reducedMotion="user">
            {variant === 'curtain' ? (
                // The in-view check must run on an unclipped wrapper: a fully clipped element
                // counts as having no visible area, so it would never be "in view" (and lazy
                // images inside it would never load). The clip goes on the inner element.
                <motion.div
                    className={className}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    <motion.div variants={{ hidden, show }} transition={transition}>
                        {children}
                    </motion.div>
                </motion.div>
            ) : (
                <motion.div
                    className={className}
                    initial={hidden}
                    whileInView={show}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={transition}
                >
                    {children}
                </motion.div>
            )}
        </MotionConfig>
    );
}
