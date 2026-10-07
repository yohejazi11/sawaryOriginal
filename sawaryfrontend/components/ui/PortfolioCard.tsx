'use client'

import Link from 'next/link'
import { MdArrowOutward } from 'react-icons/md'
import FeaturedBadge from '@/components/ui/FeaturedBadge'
import GalleryImage from '@/components/ui/GalleryImage'
import Reveal from '@/components/ui/Reveal'

export interface PortfolioCardProps {
  href: string
  image: string
  name: string
  delay?: number
  /** "dark" = card sits on the dark background, so the border flips to cream. */
  tone?: 'light' | 'dark'
  /** Admin-marked featured project — shows the "Featured" pill in the top corner. */
  featured?: boolean
}

// A /works tile in the home gallery's style (see GallerySection): rounded cover photo
// with a thin dark border, curtain reveal on scroll, arrow badge in the corner — but a
// fixed height for every card and the project name centered over the photo.
export default function PortfolioCard({ href, image, name, delay = 0, tone = 'light', featured = false }: PortfolioCardProps) {
  return (
    <Reveal variant="curtain" delay={delay} duration={1.1} className="w-full">
      <Link
        href={href}
        className={`group relative block h-[430px] w-full overflow-hidden rounded-[25px] border ${tone === 'dark' ? 'border-[#F4EFE3]/40' : 'border-[#343229]'}`}
      >
        <GalleryImage
          src={image}
          alt={name}
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
          className="rounded-[25px] group-hover:scale-105"
        />

        {featured && <FeaturedBadge />}

        {/* Soft shade so the title stays readable on bright photos */}
        <div className="pointer-events-none absolute inset-0 rounded-[25px] bg-black/25 transition-colors duration-500 group-hover:bg-black/35" />

        {/* Centered project title */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center">
          <span
            className="font-display line-clamp-2 text-xl font-bold leading-snug text-[#F4EFE3] md:text-2xl"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.7)' }}
          >
            {name}
          </span>
        </div>

        <Reveal variant="pop" delay={delay + 0.6} duration={0.5} className="absolute bottom-[18px] left-[18px] z-10">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F4EFE3] text-[24px] text-[#343229] opacity-75 shadow-lg transition-transform duration-200 group-hover:scale-110">
            <MdArrowOutward />
          </span>
        </Reveal>
      </Link>
    </Reveal>
  )
}
