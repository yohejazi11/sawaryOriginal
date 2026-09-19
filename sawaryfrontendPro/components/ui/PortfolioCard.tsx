'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export interface PortfolioCardProps {
  href: string
  image: string
  name: string
  subtitle?: string
  priority?: boolean
}

// A single portfolio tile: full-bleed cropped cover photo with a small centered
// brand mark, a centered project-name title over a darkening scrim, and a metadata
// caption over a dark gradient — the card format used across the whole /works grid.
export default function PortfolioCard({ href, image, name, subtitle, priority }: PortfolioCardProps) {
  const { t } = useLanguage()

  return (
    <Link
      href={href}
      className="group relative block aspect-[4/3] overflow-hidden rounded-card shadow-lg shadow-black/20"
    >
      <Image
        src={image}
        alt={name}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        priority={priority}
        loading={priority ? undefined : 'lazy'}
      />

      {/* Bottom gradient — carries the subtitle caption, leaves the top of the photo clear */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

      {/* Full-card scrim so the centered title stays readable over any photo */}
      <div className="pointer-events-none absolute inset-0 bg-black/32" />

      {/* Small centered brand mark — our own wordmark, not the reference's */}
      <div className="pointer-events-none absolute inset-x-0 top-5 flex flex-col items-center gap-0.5">
        <span className="font-display text-base font-bold text-brand-cream/90">
          {t('header.brand')}
        </span>
        <span className="text-[10px] font-medium tracking-[0.3em] text-brand-primary/80 uppercase">
          {t('header.tagline')}
        </span>
      </div>

      {/* Centered project title */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center">
        <span
          className="font-display line-clamp-2 text-3xl font-bold leading-[1.1] text-brand-cream md:text-5xl"
          style={{ textShadow: '0 3px 20px rgba(0,0,0,0.8), 0 1px 4px rgba(0,0,0,0.65)' }}
        >
          {name}
        </span>
      </div>

      {/* Metadata caption */}
      {subtitle && (
        <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
          <p className="truncate text-sm font-medium tracking-wide text-brand-cream/80">{subtitle}</p>
        </div>
      )}
    </Link>
  )
}
