'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Plus, MapPin } from 'lucide-react'
import Footer from '@/components/sections/Footer'
import GalleryImage from '@/components/ui/GalleryImage'
import Reveal from '@/components/ui/Reveal'
import { useLanguage } from '@/contexts/LanguageContext'
import { localizedHref } from '@/lib/i18n'
import type { AboutContent } from '@/lib/about'

const EASE_ENTER = [0.16, 1, 0.3, 1] as const
const EASE = [0.22, 1, 0.36, 1] as const

// Home-page design language: cream background, dark text, thin dark borders,
// 25px-rounded frames and 15px-rounded pill buttons.
const DARK = '#343229'
const GOLD = 'rgb(190, 156, 100)'

/*
 * ADD_GOOGLE_MAPS_EMBED_URL_HERE
 * Paste your Google Maps embed URL, e.g.:
 *   https://www.google.com/maps/embed?pb=!1m18!...
 * Leave as empty string to display the placeholder card.
 */
const MAPS_EMBED_URL = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2599.520543264963!2d46.77102910000001!3d24.7513072!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f01bcbe2414e9%3A0x693274b629ed3b0e!2zODY5NCDYtNin2LHYuSDYrtin2YTYryDYqNmGINin2YTZiNmE2YrYr9iMINin2YTYsdmI2LbYqdiMINin2YTYsdmK2KfYtiAxMzIxMw!5e1!3m2!1sar!2ssa!4v1780055849988!5m2!1sar!2ssa'

type FaqItem = { q: string; a: string; actionLabel: string | null; actionHref: string | null }

// ── Shared components ─────────────────────────────────────────────────────────

// Section header in the gallery/works style: big title on one side, small label pill on the other.
function SectionHeader({ label, title }: { label?: string; title: string }) {
  return (
    <div className="mb-[48px] flex w-full items-end justify-between gap-[32px] max-sm:flex-col max-sm:items-start">
      <Reveal>
        <h2 className="text-[clamp(2rem,5vw,4rem)] leading-tight">{title}</h2>
      </Reveal>
      {label && (
        <Reveal delay={0.15}>
          <span className="block w-fit rounded-[15px] border border-[#343229] px-6 py-2 text-[16px]">{label}</span>
        </Reveal>
      )}
    </div>
  )
}

function AccordionItem({
  item, isOpen, onToggle, index, lang,
}: {
  item: FaqItem
  isOpen: boolean
  onToggle: () => void
  index: number
  lang: 'ar' | 'en'
}) {
  return (
    <Reveal delay={index * 0.07}>
      <div
        className={`overflow-hidden rounded-[25px] border border-[#343229] px-8 transition-colors duration-300 ${
          isOpen ? 'bg-[#343229] text-[#F4EFE3]' : 'text-[#343229]'
        }`}
      >
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 py-6 text-start"
          aria-expanded={isOpen}
        >
          <span className="text-[18px] font-medium md:text-[20px]">{item.q}</span>
          <motion.span
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-current"
          >
            <Plus size={18} />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="answer"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="border-t border-[#F4EFE3]/20 pb-8 pt-5">
                <p className="mb-6 text-[16px] leading-loose text-[#F4EFE3]/80 md:text-[18px]">{item.a}</p>
                {item.actionLabel && item.actionHref && (
                  <Link
                    href={localizedHref(lang, item.actionHref)}
                    className="block w-fit rounded-[15px] bg-[#F4EFE3] px-[46px] py-2 text-[#343229] transition-opacity duration-300 hover:opacity-85"
                  >
                    {item.actionLabel}
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  )
}

// ── Animated count-up number ──────────────────────────────────────────────────
function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    const DURATION = 2000
    const start = performance.now()
    let raf: number
    const tick = (now: number) => {
      const progress = Math.min((now - start) / DURATION, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isInView, target])

  return (
    <span ref={ref} className="tabular-nums">
      {count}{suffix}
    </span>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function AboutClient({ content }: { content: AboutContent }) {
  const { lang } = useLanguage()
  const pick = (ar: string, en: string) => (lang === 'ar' ? ar : en)

  const faqItems: FaqItem[] = content.faqItems.map((item) => ({
    q: pick(item.questionAr, item.questionEn),
    a: pick(item.answerAr, item.answerEn),
    actionLabel: item.actionLabelAr && item.actionLabelEn ? pick(item.actionLabelAr, item.actionLabelEn) : null,
    actionHref: item.actionHref,
  }))
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <main className="flex min-h-screen flex-col bg-[#F4EFE3] text-[#343229]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

      {/* ── Section 1: Hero — title + statement, framed cover ─────────────── */}
      <section className="flex w-full flex-col gap-[48px] px-[32px] pb-[64px] pt-36">
        <div className="flex w-full items-end justify-between gap-[32px] max-md:flex-col max-md:items-start">
          <motion.h1
            className="font-display shrink-0 text-[clamp(3rem,8vw,6rem)] font-bold leading-tight"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          >
            {pick(content.heroTitleAr, content.heroTitleEn)}
          </motion.h1>

          <motion.p
            className="max-w-[46rem] text-[18px] leading-loose md:text-[20px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
          >
            {pick(content.heroStatementAr, content.heroStatementEn)}
          </motion.p>
        </div>

        {/* Cover — uncovers bottom→top like the home gallery cards */}
        <motion.div
          className="relative h-[75vh] min-h-[360px] w-full overflow-hidden rounded-[25px] border border-[#343229]"
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
            <Image
              src="/images/about/building.avif"
              alt={pick(content.locationGalleryAltAr, content.locationGalleryAltEn)}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Section 2: Vision — outlined title beside the body ────────────── */}
      <section className="px-[32px] py-[64px]">
        <Reveal className="mb-[48px]">
          <span className="block w-fit rounded-[15px] border border-[#343229] px-6 py-2 text-[16px]">
            {pick(content.sectionLabelWhoWeAreAr, content.sectionLabelWhoWeAreEn)}
          </span>
        </Reveal>
        <div className="grid w-full grid-cols-1 items-center gap-12 md:grid-cols-[auto_1fr] md:gap-20">
          <Reveal variant="pop" className="flex justify-center md:px-[32px]">
            <h2
              className="font-display select-none text-[clamp(3.5rem,9vw,7rem)] font-bold leading-none"
              style={{ color: 'transparent', WebkitTextStroke: `1.5px ${DARK}` }}
            >
              {pick(content.visionTitleAr, content.visionTitleEn)}
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-[20px] leading-loose md:text-[24px]">
              {pick(content.visionBodyAr, content.visionBodyEn)}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Section 3: Stats — one bordered bar, like the project details bar ── */}
      {content.statItems.length > 0 && (
        <section className="px-[32px] py-[64px]">
          <SectionHeader title={pick(content.sectionLabelStatsAr, content.sectionLabelStatsEn)} />
          <Reveal className="grid w-full grid-cols-1 overflow-hidden rounded-[25px] border border-[#343229] sm:grid-cols-3">
            {content.statItems.map((item, i) => (
              <div
                key={item.id}
                className={`flex flex-col items-center gap-3 px-6 py-14 text-center ${
                  i > 0 ? 'border-[#343229]/25 max-sm:border-t sm:border-s' : ''
                }`}
              >
                <span
                  className="block leading-none"
                  style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', fontWeight: 900, color: GOLD, letterSpacing: '-0.04em' }}
                >
                  <CountUp target={item.value} suffix={item.suffix ?? ''} />
                </span>
                <p className="text-[18px] text-[#343229]/70">{pick(item.labelAr, item.labelEn)}</p>
              </div>
            ))}
          </Reveal>
        </section>
      )}

      {/* ── Section 4: Team — framed org chart ────────────────────────────── */}
      <section className="px-[32px] py-[64px]">
        <SectionHeader
          label={pick(content.sectionLabelTeamStructureAr, content.sectionLabelTeamStructureEn)}
          title={pick(content.teamTitleAr, content.teamTitleEn)}
        />
        <Reveal variant="curtain" duration={1.1}>
          <div className="overflow-hidden rounded-[25px] border border-[#343229] bg-white/40 p-4 md:p-8">
            <Image
              src={content.teamPhotoUrl}
              alt={pick(content.teamImageAltAr, content.teamImageAltEn)}
              width={content.teamPhotoWidth ?? 1200}
              height={content.teamPhotoHeight ?? 900}
              className="mx-auto h-auto w-full max-w-[1100px]"
              sizes="(max-width: 768px) 100vw, 1100px"
            />
          </div>
        </Reveal>
      </section>

      {/* ── Section 5: FAQ ────────────────────────────────────────────────── */}
      {faqItems.length > 0 && (
        <section className="px-[32px] py-[64px]">
          <SectionHeader
            label={pick(content.sectionLabelFaqAr, content.sectionLabelFaqEn)}
            title={pick(content.faqTitleAr, content.faqTitleEn)}
          />
          <div className="flex flex-col gap-2">
            {faqItems.map((item, i) => (
              <AccordionItem
                key={i}
                item={item}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                index={i}
                lang={lang}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Section 6: Location — map beside the building photo ───────────── */}
      <section className="px-[32px] pb-[96px] pt-[64px]">
        <SectionHeader
          label={pick(content.sectionLabelVisitUsAr, content.sectionLabelVisitUsEn)}
          title={pick(content.locationTitleAr, content.locationTitleEn)}
        />

        <Reveal className="mb-[32px]">
          <p className="flex items-center gap-2 text-[18px] md:text-[20px]">
            <MapPin size={20} className="shrink-0" />
            {pick(content.locationAddressAr, content.locationAddressEn)}
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          <Reveal variant="curtain" duration={1.1}>
            <div className="relative h-[480px] overflow-hidden rounded-[25px] border border-[#343229] bg-[#343229]/10">
              {MAPS_EMBED_URL ? (
                <iframe
                  src={MAPS_EMBED_URL}
                  className="absolute inset-0 h-full w-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={pick(content.locationMapTitleAr, content.locationMapTitleEn)}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-5 p-10 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#343229]">
                    <MapPin size={26} />
                  </span>
                  <p className="text-[16px] text-[#343229]/60">
                    {pick(content.locationMapComingSoonAr, content.locationMapComingSoonEn)}
                  </p>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal variant="curtain" delay={0.15} duration={1.1}>
            <div className="group relative h-[480px] overflow-hidden rounded-[25px] border border-[#343229]">
              <GalleryImage
                src="/images/about/building.avif"
                alt={pick(content.locationGalleryAltAr, content.locationGalleryAltEn)}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="rounded-[25px] group-hover:scale-105"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  )
}
