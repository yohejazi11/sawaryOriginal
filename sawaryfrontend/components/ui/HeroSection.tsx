'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { localizedHref } from '@/lib/i18n';
import { getYouTubeId } from '@/lib/youtube';
import HeroVideo from './HeroVideo';
interface HeroSectionProps {
    image?: string;
}

// Shown when no video link is set in the admin dashboard.
const DEFAULT_HERO_VIDEO_ID = 'EGoATA7MnBo';

// Intro timeline (seconds) — image reveal, then logo, then the two glass boxes one
// after the other. The header's matching delay lives in components/layout/Header.tsx.
const EASE = [0.22, 1, 0.36, 1] as const;
const INTRO = {
    reveal: { delay: 0, duration: 1.2 },
    logo: { delay: 0.6, duration: 0.8 },
    leftBox: { delay: 0.9, duration: 0.8 },
    rightBox: { delay: 1.05, duration: 0.8 },
};

export default function HeroSection({
    image = '/images/hero/heroImage.webp',
}: HeroSectionProps) {
    const { t, lang } = useLanguage();
    const { whatsAppNumber, heroVideoUrl } = useSiteSettings();
    const heroVideoId = getYouTubeId(heroVideoUrl) ?? DEFAULT_HERO_VIDEO_ID;
    const reduceMotion = useReducedMotion();

    return (
        <section
            className="relative w-[calc(100%-64px)] max-sm:w-[calc(100%-32px)] overflow-hidden select-none mx-[32px] max-sm:mx-4 rounded-[25px]"
            style={{ height: 'calc(100vh - 6.5rem)', marginTop: '6.5rem', marginBottom: '12px' }}
        >
            {/* Intro — the whole background opens from a smaller rounded window in the
                center out to the full hero (clip-path only, so no layout shift). */}
            <motion.div
                className="absolute inset-0"
                initial={{ clipPath: 'inset(18% 24% 18% 24% round 25px)', opacity: 0.4 }}
                animate={{ clipPath: 'inset(0% 0% 0% 0% round 25px)', opacity: 1 }}
                transition={{ ...INTRO.reveal, ease: EASE }}
            >
                {/* Background — "live photo" effect: the still hero image is brought to life with
                    three looping layers, all transform/opacity only (compositor-friendly, no video
                    download). Skipped entirely for visitors who prefer reduced motion. */}

                {/* 1. Camera drift — slow endless zoom + pan that eases back and forth. */}
                <motion.div
                    className="absolute inset-0"
                    initial={{ scale: 1.05, x: '0%', y: '0%' }}
                    animate={reduceMotion ? undefined : {
                        scale: [1.05, 1.12, 1.08, 1.05],
                        x: ['0%', '-1.5%', '1%', '0%'],
                        y: ['0%', '-1%', '0.5%', '0%'],
                    }}
                    transition={{ duration: 30, ease: 'easeInOut', repeat: Infinity }}
                >
                    <Image
                        src={image}
                        alt=""
                        fill
                        className="object-cover"
                        priority
                        sizes="100vw"
                    />
                </motion.div>

                {/* 2. Light sweep — a soft warm band drifting across the room. */}
                <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 mix-blend-soft-light motion-reduce:hidden"
                    style={{
                        background:
                            'linear-gradient(100deg, transparent 0%, rgba(255,236,200,0.55) 50%, transparent 100%)',
                    }}
                    initial={{ x: '0%', opacity: 0 }}
                    animate={{ x: ['0%', '400%'], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 7, ease: 'easeInOut', repeat: Infinity, repeatDelay: 4 }}
                />

                {/* 3. Breathing glow — warm light from the ceiling slowly brightening/dimming. */}
                <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 mix-blend-screen motion-reduce:hidden"
                    style={{
                        background:
                            'radial-gradient(ellipse 55% 40% at 50% 12%, rgba(255,225,170,0.35) 0%, transparent 70%)',
                    }}
                    animate={{ opacity: [0.35, 0.9, 0.35] }}
                    transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
                />

                {/* Contrast vignette — soft dark pool centered on the text column so the
                    heading/CTAs stay readable over any part of the photo. */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(ellipse 62% 58% at 50% 50%, rgba(24,23,18,0.5) 0%, rgba(24,23,18,0.28) 55%, rgba(24,23,18,0.12) 85%)',
                    }}
                />
            </motion.div>

            {/* ── Hero content ──────────────────────────────────────────────────── */}
            <div
                className="w-full absolute inset-0 flex flex-col items-center justify-center px-[64px] max-md:justify-start max-md:pt-10 max-sm:px-5"
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
            >
                <div className="w-full flex items-center justify-center">
                    <motion.div
                        className="w-full flex flex-col items-center justify-between text-center gap-12 pointer-events-auto"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...INTRO.logo, ease: EASE }}
                    >
                        <div className="w-full flex w-full justify-start">
                            <Image src="/logo/logo.svg" alt="Logo" width={385} height={175} className="max-md:h-auto max-md:w-[260px] max-sm:w-[200px]" />

                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Glass boxes — pinned to the bottom-left corner, 32px from both edges.
                dir="ltr" keeps them anchored left in both Arabic and English. */}
            <div
                className="absolute left-[32px] right-[32px] bottom-[32px] flex justify-start gap-6 max-md:flex-col max-md:gap-3 max-sm:left-4 max-sm:right-4 max-sm:bottom-4"
                dir="ltr"
            >
                <motion.div className="h-[200px] w-[25%] max-lg:w-[45%] max-md:h-auto max-md:w-full max-md:py-4 rounded-[25px] p-[12px]"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...INTRO.leftBox, ease: EASE }}
                    style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(20px) saturate(1.8)',
                        WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
                    }}>
                    {/* The row is forced ltr (to anchor the boxes left), so the text sets its own direction. */}
                    <div
                        className="flex h-full flex-col justify-center gap-3 overflow-hidden px-2 text-start"
                        dir={lang === 'ar' ? 'rtl' : 'ltr'}
                    >
                        <h2 className="font-display text-[clamp(1.1rem,1.7vw,1.6rem)] font-bold leading-tight text-[#F4EFE3]">
                            {t('hero.boxTitle')}
                        </h2>
                        <p className="text-[clamp(0.8rem,1vw,1rem)] leading-relaxed text-[#F4EFE3]/85">
                            {t('hero.boxBody')}
                        </p>
                    </div>
                </motion.div>

                <motion.div className="h-[200px] w-[25%] max-lg:w-[45%] max-md:h-[180px] max-md:w-full rounded-[25px] p-[12px]"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...INTRO.rightBox, ease: EASE }}
                    style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(20px) saturate(1.8)',
                        WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
                    }}>
                    {/* YouTube video — link set from the admin dashboard (التواصل والسوشال) */}
                    <div className="relative h-full w-full">
                        <HeroVideo videoId={heroVideoId} title={lang === 'ar' ? 'فيديو سواري' : 'Sawary video'} />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
