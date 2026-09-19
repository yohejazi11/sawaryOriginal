'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { localizedHref } from '@/lib/i18n';

interface HeroSectionProps {
    image?: string;
}

export default function HeroSection({
    image = '/images/hero/finalFrame.jpg',
}: HeroSectionProps) {
    const { t, lang } = useLanguage();
    const { whatsAppNumber } = useSiteSettings();

    return (
        <section
            className="relative w-full overflow-hidden select-none"
            style={{ height: 'calc(100vh - 5rem)', marginTop: '5rem' }}
        >
            {/* Background — single hero photo with a slow one-time zoom-in (classic Ken
                Burns). Pure transform: scale, so it's compositor-only (no layout/paint
                cost) and settles once it reaches its end state rather than looping forever. */}
            <motion.div
                className="absolute inset-0"
                initial={{ scale: 1 }}
                animate={{ scale: 1.08 }}
                transition={{ duration: 24, ease: 'linear' }}
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

            {/* ── Hero content ──────────────────────────────────────────────────── */}
            <div
                className="absolute inset-0 flex flex-col px-8 md:px-20"
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
            >
                <div className="flex flex-1 items-center justify-center">
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
