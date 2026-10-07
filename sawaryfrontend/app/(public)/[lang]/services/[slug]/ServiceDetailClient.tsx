'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Footer from '@/components/sections/Footer'
import GalleryImage from '@/components/ui/GalleryImage'
import PortfolioCard from '@/components/ui/PortfolioCard'
import Reveal from '@/components/ui/Reveal'
import { useLanguage } from '@/contexts/LanguageContext'
import { localizedHref } from '@/lib/i18n'
import { localizeService, type ApiServiceSection } from '@/lib/services'

const EASE_ENTER = [0.16, 1, 0.3, 1] as const
const EASE = [0.22, 1, 0.36, 1] as const

// Same cream treatment as the Services page: dark text, thin dark borders,
// 25px-rounded frames and 15px-rounded pill buttons.
const DARK = '#343229'

export default function ServiceDetailClient({
  section,
  index,
  others,
}: {
  section: ApiServiceSection
  index: number
  others: ApiServiceSection[]
}) {
  const { t, lang } = useLanguage()
  const { title, description } = localizeService(section, lang)
  const cards = [...(section.cards ?? [])].sort((a, b) => a.orderIndex - b.orderIndex)

  return (
    <main className="flex min-h-screen flex-col bg-[#F4EFE3] text-[#343229]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

      {/* ── Section 1: Header + framed cover ─────────────────────────────── */}
      <section className="flex w-full flex-col gap-[48px] px-[32px] max-sm:px-4 pb-[64px] pt-36 max-sm:pt-28">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: EASE }}>
          <Link
            href={localizedHref(lang, '/services')}
            className="flex w-fit items-center gap-2 rounded-[15px] border border-[#343229] px-6 py-2 text-[16px] transition-all duration-300 hover:bg-[#343229] hover:text-[#F4EFE3]"
          >
            <ArrowRight size={18} className={lang === 'ar' ? '' : 'rotate-180'} />
            <span>{t('serviceDetail.back')}</span>
          </Link>
        </motion.div>

        <div className="flex w-full items-end justify-between gap-[32px] max-sm:flex-col max-sm:items-start">
          <motion.h1
            className="text-[clamp(2.5rem,6vw,4.5rem)] leading-tight"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          >
            {title}
          </motion.h1>
          <motion.span
            aria-hidden
            className="select-none text-[clamp(4rem,9vw,7rem)] font-semibold leading-none"
            style={{ color: 'transparent', WebkitTextStroke: `1.5px ${DARK}` }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
          >
            {String(index + 1).padStart(2, '0')}
          </motion.span>
        </div>

        {section.heroImageUrl && (
          <motion.div
            className="relative h-[70vh] min-h-[360px] w-full overflow-hidden rounded-[25px] border border-[#343229]"
            initial={{ clipPath: 'inset(100% 0% 0% 0% round 25px)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0% round 25px)' }}
            transition={{ duration: 1.1, delay: 0.3, ease: EASE_ENTER }}
          >
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.6, delay: 0.3, ease: EASE }}
            >
              <Image src={section.heroImageUrl} alt={title} fill className="object-cover" sizes="100vw" priority />
            </motion.div>
          </motion.div>
        )}
      </section>

      {/* ── Section 2: Statement ──────────────────────────────────────────── */}
      {description && (
        <section className="px-[32px] max-sm:px-4 py-[64px]">
          <Reveal>
            <p className="max-w-[60rem] text-[20px] leading-loose md:text-[24px]">{description}</p>
          </Reveal>
        </section>
      )}

      {/* ── Section 3: What the service includes ──────────────────────────── */}
      <section className="px-[32px] max-sm:px-4 py-[64px]">
        <Reveal className="mb-[48px]">
          <h2 className="text-[clamp(2rem,5vw,4rem)] leading-tight">{t('serviceDetail.includes')}</h2>
        </Reveal>

        {cards.length > 0 ? (
          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card, i) => {
              const c = localizeService(card, lang)
              return (
                <Reveal key={card.id} variant="curtain" delay={(i % 3) * 0.15} duration={1.1} className="h-full">
                  {/* Bordered card, numbered like the service cards; turns dark on hover */}
                  <article className="group flex h-full flex-col gap-2 rounded-[25px] border border-[#343229] p-2 transition-colors duration-300 hover:bg-[#343229] hover:text-[#F4EFE3]">
                    {card.heroImageUrl && (
                      <div className="relative h-[280px] w-full overflow-hidden rounded-[20px]">
                        <GalleryImage
                          src={card.heroImageUrl}
                          alt={c.title}
                          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                          className="rounded-[20px] group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col gap-4 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-[22px] font-medium leading-snug md:text-[24px]">{c.title}</h3>
                        <span
                          aria-hidden
                          className="shrink-0 select-none text-[48px] font-semibold leading-none text-transparent [-webkit-text-stroke:1.5px_#343229] group-hover:[-webkit-text-stroke-color:#F4EFE3]"
                          dir="ltr"
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                      {c.description && (
                        <p className="text-[16px] leading-loose opacity-75">{c.description}</p>
                      )}
                    </div>
                  </article>
                </Reveal>
              )
            })}
          </div>
        ) : (
          <Reveal>
            <p className="rounded-[25px] border border-dashed border-[#343229]/40 py-16 text-center text-[18px] opacity-70">
              {t('serviceDetail.empty')}
            </p>
          </Reveal>
        )}
      </section>

      {/* ── Section 4: Call to action — dark block for contrast ───────────── */}
      <section className="px-[32px] max-sm:px-4 py-[64px]">
        <Reveal className="flex w-full items-center justify-between gap-[32px] rounded-[25px] bg-[#343229] px-8 py-12 text-[#F4EFE3] max-md:flex-col max-md:items-start md:px-14">
          <div className="flex flex-col gap-4">
            <h2 className="text-[clamp(1.75rem,4vw,3rem)] leading-tight">{t('serviceDetail.ctaTitle')}</h2>
            <p className="max-w-[40rem] text-[18px] leading-loose opacity-75">{t('serviceDetail.ctaBody')}</p>
          </div>
          <Link
            href={localizedHref(lang, '/contact')}
            className="block w-fit shrink-0 rounded-[15px] bg-[#F4EFE3] px-[46px] py-2 text-[18px] text-[#343229] transition-opacity duration-300 hover:opacity-85"
          >
            {t('serviceDetail.ctaButton')}
          </Link>
        </Reveal>
      </section>

      {/* ── Section 5: Other services ─────────────────────────────────────── */}
      {others.length > 0 && (
        <section className="px-[32px] max-sm:px-4 pb-[96px] pt-[64px]">
          <div className="flex w-full items-center justify-between gap-[32px] max-sm:flex-col max-sm:items-start">
            <Reveal>
              <h2 className="text-[clamp(2rem,5vw,4rem)] leading-tight">{t('serviceDetail.otherServices')}</h2>
            </Reveal>
            <Reveal delay={0.15}>
              <Link
                href={localizedHref(lang, '/services')}
                className="block w-fit rounded-[15px] bg-[#343229] px-[46px] py-2 text-[#F4EFE3] transition-opacity duration-300 hover:opacity-85"
              >
                {t('homeServices.viewAll')}
              </Link>
            </Reveal>
          </div>

          <div className="mt-[64px] grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {others.filter(s => s.heroImageUrl).slice(0, 3).map((s, i) => (
              <PortfolioCard
                key={s.id}
                href={localizedHref(lang, `/services/${s.slug}`)}
                image={s.heroImageUrl}
                name={localizeService(s, lang).title}
                delay={(i % 3) * 0.15}
              />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}
