'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import Footer from '@/components/sections/Footer'
import { useLanguage } from '@/contexts/LanguageContext'
import { type ApiServiceSection, type ApiServiceCard } from '@/lib/services'

const EASE = [0.22, 1, 0.36, 1] as const
const WARM_WHITE = 'rgb(244, 239, 227)'

function ServiceCardTile({ card, delay }: { card: ApiServiceCard; delay: number }) {
  return (
    <motion.div
      className="rounded-card group relative aspect-square overflow-hidden border border-brand-primary/15"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      <Image
        src={card.imageUrl}
        alt={card.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 50vw, 25vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(20,20,18,0.85)] via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="mb-2 h-px w-6 bg-brand-primary" />
        <h3 className="text-sm font-semibold" style={{ color: WARM_WHITE }}>{card.title}</h3>
      </div>
    </motion.div>
  )
}

function ComingSoon() {
  const { t } = useLanguage()
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-brand-primary/25 py-20 text-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <Clock size={28} strokeWidth={1.3} className="text-brand-primary" />
      <p className="text-lg font-semibold" style={{ color: WARM_WHITE }}>
        {t('servicesCatalog.comingSoonTitle')}
      </p>
      <p className="max-w-sm text-sm font-light text-brand-cream/50">
        {t('servicesCatalog.comingSoonBody')}
      </p>
    </motion.div>
  )
}

function SectionBlock({ section, index }: { section: ApiServiceSection; index: number }) {
  return (
    <section className="px-8 py-20 md:px-20">
      <div className="mx-auto max-w-6xl">
        {/* Hero */}
        <motion.div
          className="relative mb-10 h-64 w-full overflow-hidden rounded-sm md:h-80"
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          {section.heroImageUrl ? (
            <Image
              src={section.heroImageUrl}
              alt={section.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority={index === 0}
            />
          ) : (
            <div className="absolute inset-0" style={{ background: 'rgb(44,45,40)' }} />
          )}
          <div className="absolute inset-0 bg-[rgba(28,28,24,0.55)]" />
          <div className="absolute inset-0 flex flex-col items-start justify-end p-8 md:p-12">
            <div className="mb-4 h-px w-10 bg-brand-primary" />
            <h2
              className="font-display font-bold leading-tight"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: WARM_WHITE }}
            >
              {section.title}
            </h2>
          </div>
        </motion.div>

        {section.description && (
          <motion.p
            className="mx-auto mb-12 max-w-3xl text-center text-base font-light leading-[1.9] text-brand-cream/60"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            {section.description}
          </motion.p>
        )}

        {/* Cards */}
        {section.cards.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {section.cards.map((card, i) => (
              <ServiceCardTile key={card.id} card={card} delay={i * 0.08} />
            ))}
          </div>
        ) : (
          <ComingSoon />
        )}
      </div>
    </section>
  )
}

export default function CatalogClient({ sections }: { sections: ApiServiceSection[] }) {
  const { t, lang } = useLanguage()

  return (
    <main className="min-h-screen bg-brand-bg" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Page header */}
      <header className="flex flex-col items-center justify-center px-8 pb-16 pt-36 md:px-20">
        <span className="mb-4 block text-sm font-light tracking-[0.4em] text-brand-primary uppercase">
          {t('servicesCatalog.eyebrow')}
        </span>
        <h1
          className="font-display text-center font-bold text-brand-cream"
          style={{ fontSize: 'clamp(3rem, 9vw, 7rem)' }}
        >
          {t('servicesCatalog.title')}
        </h1>
        <div className="mt-8 h-px w-24 bg-brand-primary/35" />
      </header>

      {sections.length === 0 ? (
        <div className="px-8 pb-32 text-center text-brand-cream/40 md:px-20">
          <ComingSoon />
        </div>
      ) : (
        sections.map((section, i) => (
          <SectionBlock key={section.id} section={section} index={i} />
        ))
      )}

      <Footer />
    </main>
  )
}
