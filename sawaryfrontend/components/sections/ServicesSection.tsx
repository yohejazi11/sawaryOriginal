'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { localizedHref } from '@/lib/i18n';
import  ServiceCard  from '../ui/ServiceCard';
import { localizeService, type ApiServiceSection } from '@/lib/services';

const EASE = [0.22, 1, 0.36, 1] as const;

interface Props {
  sections?: ApiServiceSection[];
  executionImage?: string;
  designImage?: string;
  variant?: 'section' | 'page';
}

const PANELS = [
  {
    index: 0,
    number: '01',
    title: 'homeServices.execution.title',
    description: 'homeServices.execution.body',
    href: '/services/design',
    imageKey: 'execution' as const,
  },
  {
    index: 1,
    number: '02',
    title: 'homeServices.design.title',
    description: 'homeServices.design.body',
    href: '/services/design',
    imageKey: 'design' as const,
  },
] as const;

export default function ServicesSection({
  sections = [],
  executionImage = '/images/services/implement.avif',
  designImage = '/images/services/design.avif',
  variant = 'section',
}: Props) {
  const { t, lang } = useLanguage();
  // As a standalone page the heading is the page's <h1> and clears the fixed header.
  const isPage = variant === 'page';
  const Heading = isPage ? motion.h1 : motion.h2;
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
        className={`${isPage ? 'pt-36 max-sm:pt-28 pb-14' : 'py-14'} px-[32px] max-sm:px-4`}
        style={{ background: '#F4EFE3' }}
      >
        <Heading
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="font-display text-[clamp(2.5rem,6vw,4.5rem)]  leading-tight text-[#343229]"
        >
          {t('homeServices.heading')}
        </Heading>

      </div>

      {/* ── Two cinematic panels ─────────────────────────────────────────────── */}
      <div
        className="flex w-full h-fit flex-col gap-[128px] max-md:gap-24 overflow-hidden bg-[#F4EFE3] py-[96px] max-md:pt-20 max-md:pb-12 px-[32px] max-sm:px-4 "
        // style={{ minHeight: 'max(600px, 80vh)' }}
      >
        {sections.length > 0
          ? sections.map((section, i) => {
              const { title, description } = localizeService(section, lang);
              return (
                <ServiceCard
                  key={section.id}
                  id={section.slug}
                  number={String(i + 1).padStart(2, '0')}
                  title={title}
                  subtitle={description}
                  // On the services page each card leads to its own details page and
                  // previews the sub-services it includes.
                  href={localizedHref(lang, isPage ? `/services/${section.slug}` : `/services#${section.slug}`)}
                  highlights={isPage ? (section.cards ?? []).map(c => localizeService(c, lang).title).filter(Boolean) : undefined}
                  image={section.heroImageUrl || images[i % 2 === 0 ? 'execution' : 'design']}
                  cardDirection={i % 2 === 0 ? 'ltr' : 'rtl'}
                />
              );
            })
          : // API unreachable or no sections yet — fall back to the static copy.
            PANELS.map(({ index, number, title, description, href, imageKey }) => (
              <ServiceCard
                key={index}
                number={number}
                title={t(title)}
                subtitle={t(description)}
                href={isPage ? undefined : localizedHref(lang, href)}
                image={images[imageKey]}
                cardDirection={index % 2 === 0 ? 'ltr' : 'rtl'}
              />
            ))}
      </div>

      {/* ── View all (home page only) ────────────────────────────────────────── */}
      {!isPage && (
        <div className="flex justify-center bg-[#F4EFE3] pb-[96px] max-md:pb-16 px-[32px] max-sm:px-4">
          <Link
            href={localizedHref(lang, '/services')}
            className="flex w-fit items-center gap-3 rounded-[15px] border border-[#343229] px-[32px] py-2 text-[24px] max-sm:text-[18px] font-medium text-[#343229] transition-all duration-300 hover:bg-[#343229] hover:text-white"
          >
            {t('homeServices.viewAll')}
          </Link>
        </div>
      )}
    </section>
  );
}
