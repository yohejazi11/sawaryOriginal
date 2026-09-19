'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizedHref } from '@/lib/i18n';

const EASE = [0.22, 1, 0.36, 1] as const;

interface Props {
  executionImage?: string;
  designImage?: string;
}

const PANELS = [
  {
    index:     0,
    number:    '01',
    titleKey:  'homeServices.execution.title',
    bodyKey:   'homeServices.execution.body',
    href:      '/services/execution',
    imageKey:  'execution' as const,
    enterX:    60,  // visual-right panel → enters from the right
  },
  {
    index:     1,
    number:    '02',
    titleKey:  'homeServices.design.title',
    bodyKey:   'homeServices.design.body',
    href:      '/services/design',
    imageKey:  'design' as const,
    enterX:    -60, // visual-left panel  → enters from the left
  },
] as const;

export default function ServicesSection({
  executionImage = '/images/services/implement.avif',
  designImage    = '/images/services/design.avif',
}: Props) {
  const { t, lang } = useLanguage();
  const [hovered, setHovered] = useState<number | null>(null);

  const images = { execution: executionImage, design: designImage };

  const panelBasis = (i: number) =>
    hovered === null ? '50%' : hovered === i ? '60%' : '40%';

  const overlay = (i: number) =>
    hovered === null
      ? 'rgba(52, 50, 41, 0.72)'
      : hovered === i
        ? 'rgba(52, 50, 41, 0.58)'   // slightly lighter on hovered
        : 'rgba(52, 50, 41, 0.88)';  // darker on the other

  return (
    <section dir={lang === 'ar' ? 'rtl' : 'ltr'} className="overflow-hidden">

      {/* ── Section header ──────────────────────────────────────────────────── */}
      <div
        className="py-14 text-center"
        style={{ background: 'rgb(58, 59, 54)' }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-tight text-brand-primary"
        >
          {t('homeServices.heading')}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          className="mt-3 text-lg font-light text-brand-cream md:text-xl"
        >
          {t('homeServices.subheading')}
        </motion.p>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          className="mx-auto mt-6 h-px w-16 bg-brand-primary/35"
        />
      </div>

      {/* ── Two cinematic panels ─────────────────────────────────────────────── */}
      <div
        className="flex w-full flex-col overflow-hidden lg:flex-row"
        style={{ minHeight: 'max(600px, 80vh)' }}
      >
        {PANELS.map(({ index, number, titleKey, bodyKey, href, imageKey, enterX }) => {
          const title = t(titleKey);
          const body = t(bodyKey);
          return (
          <motion.div
            key={index}
            className="relative min-h-[420px] overflow-hidden lg:min-h-0"
            /* ── Scroll entrance: fade + slide from the panel's natural direction ── */
            initial={{ x: enterX, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            /* ── Hover: flex-basis expands/shrinks ─────────────────────────────── */
            animate={{ flexBasis: panelBasis(index) }}
            transition={{
              x:         { duration: 0.9, delay: index * 0.2, ease: EASE },
              opacity:   { duration: 0.9, delay: index * 0.2 },
              flexBasis: { duration: 0.5, ease: EASE },
            }}
            style={{ flexShrink: 0 }}
            onHoverStart={() => setHovered(index)}
            onHoverEnd={() => setHovered(null)}
          >
          <Link href={localizedHref(lang, href)} className="absolute inset-0 z-10" aria-label={title} />
            {/* Background image */}
            <Image
              src={images[imageKey]}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority={index === 0}
            />

            {/* Dark overlay — shifts on hover */}
            <motion.div
              className="absolute inset-0"
              animate={{ background: overlay(index) }}
              transition={{ duration: 0.5 }}
            />

            {/* ── Content ──────────────────────────────────────────────────────── */}
            <motion.div
              className="absolute inset-0 flex flex-col justify-between p-10 lg:p-16"
              animate={{ y: hovered === index ? -8 : 0 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              {/* Outlined number — top of panel */}
              <div className="self-start">
                <span
                  aria-hidden
                  className="block select-none leading-none"
                  style={{
                    fontSize:         'clamp(5rem, 10vw, 8rem)',
                    fontWeight:       900,
                    WebkitTextStroke: '1px rgb(190, 156, 100)',
                    color:            'transparent',
                    letterSpacing:    '-0.04em',
                  }}
                >
                  {number}
                </span>
              </div>

              {/* Title + body — bottom of panel */}
              <div>
                {/* Thin brand-primary accent line */}
                <div className="mb-5 h-px w-12 bg-brand-primary" />

                <h3
                  className="font-display mb-5 font-bold text-white"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
                >
                  {title}
                </h3>

                <p className="max-w-sm text-base leading-loose text-brand-cream/65">
                  {body}
                </p>

                <motion.div
                  className="mt-8 flex items-center gap-2 text-sm font-light tracking-[0.2em] text-brand-primary"
                  animate={{ x: hovered === index ? -6 : 0, opacity: hovered === index ? 1 : 0.55 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <span>{t('common.discoverMore')}</span>
                  <ArrowLeft size={14} />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
          );
        })}
      </div>
    </section>
  );
}
