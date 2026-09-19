'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.055'/%3E%3C/svg%3E")`;

const EASE = [0.22, 1, 0.36, 1] as const;

const col = {
    hidden: {},
    show: { transition: { staggerChildren: 0.11, delayChildren: 0.05 } },
};

const up = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};

const appear = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 1.1, ease: EASE } },
};

function useCountUp(target: number, duration = 2400) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });

    useEffect(() => {
        if (!isInView) return;
        const start = performance.now();
        let rafId: number;
        const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [isInView, target, duration]);

    return { count, ref, isInView };
}

export default function HeroCTA() {
    const { t, lang } = useLanguage();
    const clients = useCountUp(7000, 2600);
    const years   = useCountUp(12,   1600);

    return (
        <section
            className="relative overflow-hidden"
            style={{
                backgroundImage: "url('/images/pattern/pattern.avif')",
                backgroundRepeat: 'repeat',
                backgroundSize: 'auto',
                backgroundPosition: 'bottom',
                backgroundColor: 'var(--color-brand-bg)',
            }}
        >
            {/* Dark tint — controls how strongly the pattern shows through */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-brand-bg/55"
            />

            {/* Grain overlay */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ backgroundImage: NOISE, backgroundRepeat: 'repeat' }}
            />

            {/* Top rule */}
            <div className="absolute inset-x-0 top-0 h-px bg-brand-primary/45" />

            <div className="relative mx-auto w-full max-w-7xl px-8 py-8 lg:px-20">
                <div className="flex flex-row gap-6 max-sm:flex-col" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

                    {/* ── Col 1: 7 000 clients ──────────────────────────────── */}
                    <motion.div
                        ref={clients.ref}
                        className="relative flex flex-1 flex-col items-center justify-center gap-3 overflow-hidden  p-8"
                        variants={col}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        <motion.span
                            variants={up}
                            className="text-5xl font-light tracking-[0.28em] text-brand-cream uppercase"
                        >
                            {t('heroCTA.clientsLabel')}
                        </motion.span>

                        <motion.span
                            variants={appear}
                            aria-hidden
                            className="block select-none leading-none"
                            style={{
                                fontSize:           'clamp(5rem, 12vw, 11rem)',
                                fontWeight:         900,
                                WebkitTextStroke:   '1.5px rgb(190, 156, 100)',
                                color:              'transparent',
                                letterSpacing:      '-0.04em',
                                fontVariantNumeric: 'tabular-nums',
                            }}
                        >
                            {clients.count.toLocaleString('en-US')}
                        </motion.span>

                        <motion.span
                            variants={up}
                            className="text-3xl font-light tracking-[0.28em] text-brand-cream uppercase"
                        >
                            {t('heroCTA.clientsUnit')}
                        </motion.span>


                    </motion.div>

                    {/* ── Col 2: 12 years ───────────────────────────────────── */}
                    <motion.div
                        ref={years.ref}
                        className="relative flex flex-1 flex-col items-center justify-center gap-3 overflow-hidden  p-8"
                        variants={col}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.2 }}
                    >
                        <motion.span
                            variants={up}
                            className="text-5xl font-light tracking-[0.28em] text-brand-cream uppercase"
                        >
                            {t('heroCTA.yearsLabel')}
                        </motion.span>

                        <motion.span
                            variants={appear}
                            aria-hidden
                            className="block select-none leading-none"
                            style={{
                                fontSize:           'clamp(5rem, 12vw, 11rem)',
                                fontWeight:         900,
                                WebkitTextStroke:   '1.5px rgb(190, 156, 100)',
                                color:              'transparent',
                                letterSpacing:      '-0.04em',
                                fontVariantNumeric: 'tabular-nums',
                            }}
                        >
                            {years.count}
                        </motion.span>

                        <motion.span
                            variants={up}
                            className="text-3xl font-light tracking-[0.28em] text-brand-cream uppercase"
                        >
                            {t('heroCTA.yearsUnit')}
                        </motion.span>


                    </motion.div>

                </div>
            </div>
        </section>
    );
}
