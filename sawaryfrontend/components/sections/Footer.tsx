'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Phone, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { iconForPlatform } from '@/components/ui/SocialIcons';

// ── Dot-grid texture: rgba(190, 156, 100, 0.07) dots on 24px pitch ───────────────
const PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='1' fill='rgba(140%2C112%2C76%2C0.07)'/%3E%3C/svg%3E")`;

const EASE = [0.22, 1, 0.36, 1] as const;

// ── Stagger containers ────────────────────────────────────────────────────────
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12 } },
};

const rise = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Footer() {
  const { t, lang } = useLanguage();
  const { email, phoneNumbers, socialLinks } = useSiteSettings();
  const primaryPhone = phoneNumbers[0]?.number;

  return (
    <footer
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="relative overflow-hidden px-8 py-20 md:px-20"
      style={{ background: 'rgb(40, 41, 37)' }}
    >
      {/* Dot-grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: PATTERN, backgroundRepeat: 'repeat' }}
      />

      <div className="relative mx-auto max-w-7xl">

        {/* ── Row 1 — Top statement ──────────────────────────────────────── */}
        <motion.div
          className="mb-16 text-center"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
        >
          <motion.h2
            variants={rise}
            className="font-display text-[clamp(1.9rem,5vw,3.5rem)] font-bold text-brand-cream"
          >
            {t('footer.heading')}
          </motion.h2>

          <motion.p
            variants={rise}
            className="mt-3 text-base font-light text-brand-cream/55"
          >
            {t('footer.subheading')}
          </motion.p>

          {/* Full-width thin separator */}
          <motion.div
            variants={rise}
            className="mt-10 h-px bg-brand-primary/15"
          />
        </motion.div>

        {/* ── Row 2 — Three columns ──────────────────────────────────────── */}
        <motion.div
          className="grid grid-cols-1 gap-14 md:grid-cols-3 md:gap-10"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >

          {/* Col 1 — Brand logotype + social icons */}
          <motion.div variants={rise} className="flex flex-col gap-7">
            <div>
              <p className="font-display text-[2.2rem] font-bold leading-none text-brand-primary">
                {t('header.brand')}
              </p>
              <p className="mt-2 text-sm font-light tracking-wide text-brand-cream/40">
                {t('footer.brandTagline')}
              </p>
            </div>

            {/* Social icon row */}
            <div className="flex gap-2.5">
              {socialLinks.map((link) => {
                const Icon = iconForPlatform(link.platform);
                return (
                  <Link
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.platform}
                    className="group flex h-9 w-9 shrink-0 items-center justify-center border border-brand-primary/38 text-brand-cream/70 transition-colors duration-250 hover:border-brand-primary hover:text-brand-primary"
                  >
                    <Icon size={15} />
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* Col 2 — Contact info */}
          <motion.div variants={rise} className="flex flex-col gap-5">
            <p className="text-sm font-light tracking-[0.28em] text-brand-primary uppercase">
              {t('common.contactUs')}
            </p>

            {primaryPhone && (
              <Link
                href={`tel:${primaryPhone}`}
                className="flex items-center gap-3 text-brand-cream transition-colors duration-200 hover:text-brand-primary"
              >
                <Phone size={15} strokeWidth={1.4} className="shrink-0" />
                <span dir="ltr" className="text-base">{primaryPhone}</span>
              </Link>
            )}

            <Link
              href={`mailto:${email}`}
              className="flex items-center gap-3 text-brand-cream transition-colors duration-200 hover:text-brand-primary"
            >
              <Mail size={15} strokeWidth={1.4} className="shrink-0" />
              <span dir="ltr" className="text-base">{email}</span>
            </Link>
          </motion.div>

          {/* Col 3 — "12 years" typographic poster element */}
          <motion.div variants={rise} className="flex flex-col">
            <span
              aria-hidden
              className="block select-none leading-none"
              style={{
                fontSize:         '6rem',
                fontWeight:       900,
                WebkitTextStroke: '1px rgb(190, 156, 100)',
                color:            'transparent',
                letterSpacing:    '-0.04em',
                lineHeight:       1,
              }}
            >
              12
            </span>
            <p className="mt-2 text-sm font-light text-brand-cream/45">
              {t('footer.experienceYears')}
            </p>
          </motion.div>

        </motion.div>

        {/* ── Row 3 — Bottom bar ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
        >
          <div className="mt-16 h-px bg-brand-primary/20" />
          <p className="mt-6 text-center text-sm text-brand-cream/38">
            {t('footer.copyright')}
          </p>
        </motion.div>

      </div>
    </footer>
  );
}
