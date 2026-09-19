'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { localizedHref } from '@/lib/i18n'

const EASE = [0.22, 1, 0.36, 1] as const

export const CARD_NOISE =
  `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E` +
  `%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E` +
  `%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E%23noise")`

export interface DesignCardProps {
  name: string
  seed?: string
  image?: string
  /** Already-localized display text (e.g. a project tag's name) — pass pre-translated text. */
  category?: string
  type?: 'design' | 'execution'
  year?: string
  delay?: number
  href?: string
}

export default function DesignCard({
  name,
  seed,
  image,
  category,
  type = 'design',
  year = '2024',
  delay = 0,
  href,
}: DesignCardProps) {
  const { t, lang } = useLanguage()
  const imgSrc = image || `https://picsum.photos/seed/${seed ?? 'default'}/500/700`
  const displayCategory = category || t('designCard.defaultCategory')
  const cornerLabel = t(`designCard.types.${type}`)

  const card = (
    <motion.div
      className="shrink-0"
      style={{ scrollSnapAlign: 'start' }}
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      <motion.div
        className="rounded-card group relative cursor-pointer overflow-hidden"
        style={{ width: 320, height: 420 }}
        initial="rest"
        whileHover="hover"
        animate="rest"
      >
        {/* Image — scales on hover */}
        <motion.div
          className="absolute inset-0"
          variants={{ rest: { scale: 1 }, hover: { scale: 1.08 } }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Image src={imgSrc} alt={name} fill className="object-cover" sizes="320px" />
        </motion.div>

        {/* Bottom vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(30,30,26,0.92) 0%, transparent 55%)' }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Full-card scrim so the centered title stays readable over any photo */}
        <div className="pointer-events-none absolute inset-0 bg-black/20" />

        {/* Centered project title */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center">
          <span
            className="font-display text-xl font-bold text-brand-cream"
            style={{ textShadow: '0 2px 16px rgba(0,0,0,0.75), 0 1px 3px rgba(0,0,0,0.6)' }}
          >
            {name}
          </span>
        </div>

        {/* Gold grain overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'rgba(190, 156, 100, 0.04)', filter: CARD_NOISE, opacity: 0.35 }}
        />

        {/* Top line — draws on hover */}
        <motion.span
          className="absolute inset-x-0 top-0 h-px origin-left bg-brand-primary"
          variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
          transition={{ duration: 0.4, ease: EASE }}
        />

        {/* Film-edge label */}
        <span
          aria-hidden
          className="pointer-events-none absolute text-sm font-light tracking-[0.25em] text-brand-primary uppercase"
          style={{ top: '3rem', right: '12px', writingMode: 'vertical-rl' }}
        >
          {cornerLabel}
        </span>

        {/* Bottom content — category/year metadata */}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="mb-3 h-px w-8 bg-brand-primary" />
          <div className="flex items-center justify-between">
            <p className="text-sm text-brand-cream/70">
              {displayCategory} • {year}
            </p>
            <motion.div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-brand-primary transition-colors duration-300"
              variants={{
                rest: { rotate: 0, borderColor: 'rgba(190, 156, 100, 0.5)' },
                hover: { rotate: 45, borderColor: 'rgb(190, 156, 100)' },
              }}
              transition={{ duration: 0.3 }}
            >
              <ArrowUpRight size={14} strokeWidth={1.5} />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )

  return href ? <Link href={localizedHref(lang, href)}>{card}</Link> : card
}
