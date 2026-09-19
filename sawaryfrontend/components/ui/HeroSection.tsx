'use client';

import { useId, useRef, useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import {
    motion,
    useMotionValue,
    useTransform,
    useSpring,
    animate,
} from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { localizedHref } from '@/lib/i18n';

// ── Blob bounding-box constants (used for parallax range calculation) ─────────
// Approximate envelope across all three shapes: x ∈ [-292, 285], y ∈ [-268, 289]
const CLOUD_W = 577;
const CLOUD_H = 557;

// ── Three organic blob shapes — all centered at (0,0), all exactly 8 C-commands
//    Same number + same command types → Framer Motion can morph between them.
//
//    Each path traces 8 anchor points clockwise. The smoothing handles are chosen
//    so the curve is C1-continuous at every junction (outgoing handle at Pᵢ is
//    the mirror of the incoming handle, giving a smooth tangent everywhere).

// Base shape — wider on the right, slight upward drift on the left
const BLOB_1 =
    'M 10,-240' +
    ' C 85,-262 145,-215 170,-190' +
    ' C 195,-165 248,-108 265,-50' +
    ' C 282,8 285,62 260,110' +
    ' C 235,158 192,210 130,240' +
    ' C 68,270 -12,270 -90,258' +
    ' C -168,246 -218,200 -240,158' +
    ' C -262,48 -275,-65 -235,-155' +
    ' C -158,-235 -65,-218 10,-240 Z';

// Shifted variant — puffed bottom, tighter upper-right, left side swings out
const BLOB_2 =
    'M -10,-228' +
    ' C 65,-255 128,-218 165,-195' +
    ' C 202,-172 268,-102 270,-40' +
    ' C 272,22 275,68 255,105' +
    ' C 235,142 195,215 115,252' +
    ' C 35,289 -32,282 -80,268' +
    ' C -128,254 -202,212 -235,175' +
    ' C -268,138 -292,32 -268,-40' +
    ' C -244,-112 -85,-201 -10,-228 Z';

// Third variant — tall, narrower at top, wide sweeping lower half
const BLOB_3 =
    'M 20,-248' +
    ' C 85,-268 148,-210 185,-175' +
    ' C 222,-140 275,-52 258,15' +
    ' C 241,82 248,148 225,195' +
    ' C 202,242 138,278 55,268' +
    ' C -28,258 -92,258 -155,240' +
    ' C -218,222 -280,142 -272,40' +
    ' C -264,-62 -248,-162 -205,-192' +
    ' C -162,-222 -45,-228 20,-248 Z';

// ── Morph keyframes — loops through all 3 shapes and back ────────────────────
const MORPH_FRAMES = [BLOB_1, BLOB_2, BLOB_3, BLOB_1] as const;

interface HeroSectionProps {
    beforeImage?: string;
    afterImage?: string;
}

export default function HeroSection({
    beforeImage = '/images/hero/crashFrame.jpg',
    afterImage = '/images/hero/finalFrame.jpg',
}: HeroSectionProps) {
    const { t, lang } = useLanguage();
    const { whatsAppNumber } = useSiteSettings();
    const rawId = useId();
    const safeId = rawId.replace(/\W/g, '');
    const maskId = `cloud-mask-${safeId}`;
    const glowId = `cloud-glow-${safeId}`;

    const containerRef = useRef<HTMLDivElement>(null);

    // ── SVG viewBox dimensions — kept in sync with the container via ResizeObserver
    const [svgW, setSvgW] = useState(1440);
    const [svgH, setSvgH] = useState(900);

    const containerW = useMotionValue(1440);
    const containerH = useMotionValue(900);
    const centerX = useMotionValue(720);
    const centerY = useMotionValue(450);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const apply = (w: number, h: number) => {
            setSvgW(w);
            setSvgH(h);
            containerW.set(w);
            containerH.set(h);
            centerX.set(w / 2);
            centerY.set(h / 2);
        };

        const { width, height } = el.getBoundingClientRect();
        if (width > 0) apply(width, height);

        const ro = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            apply(width, height);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [centerX, centerY, containerW, containerH]);

    // ── Mouse — normalized -1 → 1 ─────────────────────────────────────────────
    const mouseNX = useMotionValue(0);
    const mouseNY = useMotionValue(0);

    // Spring followers — add inertia so the blob floats behind the cursor
    // rather than snapping to it. Lower stiffness = more lag = dreamier feel.
    const smoothX = useSpring(mouseNX, { stiffness: 60, damping: 20, mass: 1 });
    const smoothY = useSpring(mouseNY, { stiffness: 60, damping: 20, mass: 1 });

    const gX = useTransform(
        () =>
            centerX.get() +
            smoothX.get() * Math.max(80, (containerW.get() - CLOUD_W) / 2),
    );
    const gY = useTransform(
        () =>
            centerY.get() +
            smoothY.get() * Math.max(50, (containerH.get() - CLOUD_H) / 2),
    );

    const afterLabelY = useTransform(gY, (v) => v - 95);

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const el = containerRef.current;
            if (!el) return;
            const { left, top, width, height } = el.getBoundingClientRect();
            mouseNX.set((e.clientX - left - width / 2) / (width / 2));
            mouseNY.set((e.clientY - top - height / 2) / (height / 2));
        },
        [mouseNX, mouseNY],
    );

    const handleMouseLeave = useCallback(() => {
        animate(mouseNX, 0, { duration: 0.6, ease: 'easeOut' });
        animate(mouseNY, 0, { duration: 0.6, ease: 'easeOut' });
    }, [mouseNX, mouseNY]);

    const handleTouchMove = useCallback(
        (e: React.TouchEvent<HTMLDivElement>) => {
            const el = containerRef.current;
            if (!el) return;
            const touch = e.touches[0];
            const { left, top, width, height } = el.getBoundingClientRect();
            mouseNX.set((touch.clientX - left - width / 2) / (width / 2));
            mouseNY.set((touch.clientY - top - height / 2) / (height / 2));
        },
        [mouseNX, mouseNY],
    );

    const handleTouchEnd = useCallback(() => {
        animate(mouseNX, 0, { duration: 0.8, ease: 'easeOut' });
        animate(mouseNY, 0, { duration: 0.8, ease: 'easeOut' });
    }, [mouseNX, mouseNY]);

    // ── Animation configs ──────────────────────────────────────────────────────

    // Morph: cycles through 3 distinct blob shapes, 6 s loop
    const morphTransition = {
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut' as const,
        times: [0, 0.33, 0.67, 1],
    };

    // Scale breathe: slight inhale → exhale, 4 s loop (out of phase with morph)
    const breatheAnimate = { scale: [1, 1.04, 0.98, 1] as number[] };
    const breatheTransition = {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut' as const,
        times: [0, 0.4, 0.7, 1],
    };

    // Rotation drift: gentle float ±3°, 8 s loop (out of phase with both above)
    const driftAnimate = { rotate: [0, 3, -2, 0] as number[] };
    const driftTransition = {
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut' as const,
        times: [0, 0.35, 0.65, 1],
    };

    // transform-box so scale/rotate happen around the blob's visual center
    const wrapperStyle = {
        transformBox: 'fill-box' as const,
        transformOrigin: '50% 50%' as const,
    };

    return (
        <section
            ref={containerRef}
            className="relative w-full overflow-hidden select-none"
            style={{ height: 'calc(100vh - 5rem)', marginTop: '5rem' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
        >
            {/* ── Before image — bottom HTML layer ──────────────────────────────── */}
            <Image
                src={beforeImage}
                alt="Before renovation"
                fill
                className="object-cover"
                priority
                style={{ filter: 'grayscale(60%) brightness(0.75)' }}
            />

            {/* ── Main SVG — single coordinate space, viewBox = container px ──── */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox={`0 0 ${svgW} ${svgH}`}
                style={{ zIndex: 5 }}
                aria-hidden
            >
                <defs>
                    {/* ── SVG mask — black bg hides everything, white blob reveals ── */}
                    <mask id={maskId} maskUnits="userSpaceOnUse">
                        <rect
                            x={0}
                            y={0}
                            width={svgW}
                            height={svgH}
                            fill="black"
                        />

                        {/* Translate to mouse position */}
                        <motion.g style={{ x: gX, y: gY }}>
                            {/* Scale breathe wrapper */}
                            <motion.g
                                animate={breatheAnimate}
                                transition={breatheTransition}
                                style={wrapperStyle}
                            >
                                {/* Rotation drift wrapper */}
                                <motion.g
                                    animate={driftAnimate}
                                    transition={driftTransition}
                                    style={wrapperStyle}
                                >
                                    {/* Morphing blob — white = visible area */}
                                    <motion.path
                                        d={BLOB_1}
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        animate={{ d: MORPH_FRAMES as any }}
                                        transition={morphTransition}
                                        fill="white"
                                    />
                                </motion.g>
                            </motion.g>
                        </motion.g>
                    </mask>

                    {/* ── Glow filter — blurs the wide stroke to create the halo ──── */}
                    <filter
                        id={glowId}
                        x="-50%"
                        y="-50%"
                        width="200%"
                        height="200%"
                    >
                        <feGaussianBlur
                            in="SourceGraphic"
                            stdDeviation="12"
                            result="blur"
                        />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* ── After image — visible only through the mask's white blob ───── */}
                <image
                    href={afterImage}
                    x={0}
                    y={0}
                    width={svgW}
                    height={svgH}
                    preserveAspectRatio="xMidYMid slice"
                    mask={`url(#${maskId})`}
                />

                {/* ── "After" badge — same mask keeps it inside the window ─────── */}
                <motion.g
                    mask={`url(#${maskId})`}
                    style={{ x: gX, y: afterLabelY }}
                >
                    <rect
                        x={-36}
                        y={-13}
                        width={72}
                        height={26}
                        rx={13}
                        fill="rgba(255,255,255,0.92)"
                    />
                    <circle cx={-20} cy={0} r={4} fill="rgba(55,65,81,0.75)" />
                    <text
                        x={2}
                        y={0}
                        textAnchor="start"
                        dominantBaseline="central"
                        fontSize={13}
                        fontWeight={600}
                        fill="#111827"
                    >
                        {t('hero.badgeAfter')}
                    </text>
                </motion.g>

                {/* ── Glowing blob border — mirrors mask animation exactly ─────── */}
                {/*    Double-stroke: wide blurred halo + crisp thin line on top   */}
                <motion.g style={{ x: gX, y: gY }}>
                    <motion.g
                        animate={breatheAnimate}
                        transition={breatheTransition}
                        style={wrapperStyle}
                    >
                        <motion.g
                            animate={driftAnimate}
                            transition={driftTransition}
                            style={wrapperStyle}
                        >
                            {/* Wide blurred stroke — the soft outer glow halo */}
                            <motion.path
                                d={BLOB_1}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                animate={{
                                    d: MORPH_FRAMES as any,
                                    strokeOpacity: [0.3, 0.5, 0.25, 0.3] as any,
                                }}
                                transition={{
                                    ...morphTransition,
                                    strokeOpacity: breatheTransition,
                                }}
                                fill="rgba(255,248,240,0.04)"
                                stroke="#FFF8F0"
                                strokeWidth={8}
                                strokeOpacity={0.3}
                                filter={`url(#${glowId})`}
                            />

                            {/* Crisp thin stroke — the sharp defined edge */}
                            <motion.path
                                d={BLOB_1}
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                animate={{
                                    d: MORPH_FRAMES as any,
                                    strokeOpacity: [0.6, 1, 0.55, 0.6] as any,
                                }}
                                transition={{
                                    ...morphTransition,
                                    strokeOpacity: breatheTransition,
                                }}
                                fill="none"
                                stroke="#FFF8F0"
                                strokeWidth={1.5}
                                strokeOpacity={0.6}
                            />
                        </motion.g>
                    </motion.g>
                </motion.g>
            </svg>

            {/* ── Contrast vignette — sits above the reveal mask, below the content.
                A soft radial dark pool centered on the text column so the heading/CTA
                stay readable no matter how light the image is underneath at any given
                moment; it fades to nothing well before the section edges so the photo
                itself stays untouched. ──────────────────────────────────────────── */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                    zIndex: 15,
                    background:
                        'radial-gradient(ellipse 62% 58% at 50% 50%, rgba(24,23,18,0.46) 0%, rgba(24,23,18,0.22) 55%, rgba(24,23,18,0) 85%)',
                }}
            />

            {/* ── Hero content ──────────────────────────────────────────────────── */}
            <div
                className="absolute inset-0 flex flex-col px-8 md:px-20"
                style={{ zIndex: 20 }}
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
            >
                <div className="flex flex-1 items-center justify-center">
                    {/* ── Brand content ──────────────────────────────────────────────── */}
                    <motion.div
                        className="flex flex-col items-center text-center gap-6 pointer-events-auto"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <span
                            className="text-sm font-light tracking-[0.3em] text-brand-primary uppercase"
                            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}
                        >
                            {t('footer.brandTagline')}
                        </span>

                        <h1
                            className="font-display font-bold text-white leading-[0.9]"
                            style={{
                                fontSize: 'clamp(4rem, 9vw, 7.5rem)',
                                textShadow: '0 4px 28px rgba(0,0,0,0.75), 0 1px 3px rgba(0,0,0,0.6)',
                            }}
                        >
                            {t('header.brand')}
                        </h1>

                        <p
                            className="text-xl font-light text-white/85 max-w-xs"
                            style={{
                                textShadow: '0 2px 14px rgba(0,0,0,0.65)',
                            }}
                        >
                            {t('hero.tagline')}
                        </p>

                        <div className="flex flex-wrap gap-4 max-sm:justify-center">
                            <a
                                href={`https://wa.me/${whatsAppNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative overflow-hidden rounded-full bg-brand-primary px-9 py-3.5 text-base font-medium text-white transition-shadow duration-300 hover:shadow-[0_0_28px_rgba(190,156,100,0.4)] active:scale-[0.97]"
                            >
                                <span className="relative z-10">
                                    {t('hero.ctaConsultation')}
                                </span>
                                <span className="absolute inset-0 origin-left scale-x-0 bg-white/10 transition-transform duration-300 group-hover:scale-x-100" />
                            </a>
                            <a
                                href={localizedHref(lang, '/works')}
                                className="rounded-full bg-brand-cream px-9 py-3.5 text-base font-medium text-brand-bg transition-opacity duration-300 hover:opacity-90 active:scale-[0.97]"
                            >
                                {t('hero.ctaGallery')}
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
