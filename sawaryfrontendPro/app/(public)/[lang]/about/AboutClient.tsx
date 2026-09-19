'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useInView,
} from 'framer-motion'
import { Plus, MapPin } from 'lucide-react'
import Footer from '@/components/sections/Footer'
import { useLanguage } from '@/contexts/LanguageContext'
import { localizedHref } from '@/lib/i18n'
import type { AboutContent } from '@/lib/about'

// ── Design tokens ─────────────────────────────────────────────────────────────
const EASE          = [0.22, 1, 0.36, 1] as const
const WARM_WHITE    = 'rgb(244, 239, 227)'
const BRAND_PRIMARY = 'rgb(190, 156, 100)'
const FAQ_BG        = 'rgb(245, 235, 221)'
const FAQ_CARD_BG   = 'rgb(255, 252, 248)'
const DARK_BROWN    = 'rgb(45, 28, 12)'

/*
 * ADD_GOOGLE_MAPS_EMBED_URL_HERE
 * Paste your Google Maps embed URL, e.g.:
 *   https://www.google.com/maps/embed?pb=!1m18!...
 * Leave as empty string to display the placeholder card.
 */
const MAPS_EMBED_URL = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2599.520543264963!2d46.77102910000001!3d24.7513072!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f01bcbe2414e9%3A0x693274b629ed3b0e!2zODY5NCDYtNin2LHYuSDYrtin2YTYryDYqNmGINin2YTZiNmE2YrYr9iMINin2YTYsdmI2LbYqdiMINin2YTYsdmK2KfYtiAxMzIxMw!5e1!3m2!1sar!2ssa!4v1780055849988!5m2!1sar!2ssa'

// ── FAQ data ──────────────────────────────────────────────────────────────────
type FaqItem = { q: string; a: string; actionLabel: string | null; actionHref: string | null }

// ── Shared components ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-12 flex items-center gap-5">
      <span className="h-px flex-1 bg-brand-primary/35" />
      <span className="shrink-0 text-sm font-light tracking-[0.3em] text-brand-primary uppercase">
        {children}
      </span>
      <span className="h-px flex-1 bg-brand-primary/35" />
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
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: EASE }}
      className="mb-2 overflow-hidden rounded-sm px-6"
      style={{ background: FAQ_CARD_BG }}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-6 text-right"
        aria-expanded={isOpen}
      >
        <span
          className="text-base font-medium transition-colors duration-200"
          style={{ color: isOpen ? BRAND_PRIMARY : DARK_BROWN }}
        >
          {item.q}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.22, ease: EASE }}
          className="shrink-0"
        >
          <Plus size={18} style={{ color: BRAND_PRIMARY }} />
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
            <div className="border-t border-brand-primary/20 pb-8 pt-5">
              <p
                className="font-body mb-5 font-light leading-[1.95]"
                style={{
                  fontSize: 'clamp(0.9rem, 1.6vw, 1.05rem)',
                  color: `rgba(45,28,12,0.72)`,
                }}
              >
                {item.a}
              </p>
              {item.actionLabel && item.actionHref && (
                <Link
                  href={localizedHref(lang, item.actionHref)}
                  className="inline-flex items-center gap-2 rounded-full border border-brand-primary/50 px-6 py-2.5 text-sm text-brand-primary transition-all duration-250 hover:border-brand-primary hover:bg-brand-primary/10 active:scale-[0.97]"
                >
                  {item.actionLabel}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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

  // Hero parallax setup
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroImgY    = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0])

  return (
    <main className="min-h-screen bg-brand-bg" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

      {/* ══════════════════════════════════════════════════════════════════════
          Section 1 — Hero Statement
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-24 pt-28 md:px-20"
      >
        {/*
         * Parallax background — NOTE: the source photo has a shopfront sign baked
         * into the frame (the "SAWARY / سواري" wordmark plus "مقاولات / ديكور
         * داخلي / إنارة / جلسات خارجية" service labels are printed on the awning
         * itself, not added by this code). That can't be removed without editing
         * or replacing the source asset, and no clean untexted replacement exists
         * in the project's local media library, so it's flagged in the design
         * report as an asset follow-up. The blur + heavier graduated tint below
         * is the code-only mitigation: it softens the baked-in lettering into an
         * unreadable texture so "في سواري" doesn't collide with it, while still
         * reading as an ambient interior photo.
         */}
        <motion.div className="absolute inset-0" style={{ y: heroImgY }}>
          <Image
            src="/images/about/building.avif"
            alt=""
            fill
            className="object-cover"
            style={{ filter: 'blur(5px) brightness(0.65) saturate(0.9)' }}
            sizes="100vw"
            priority
          />
        </motion.div>

        {/* Overlays — graduated: heaviest through the middle band where the baked-in
            shopfront signage sits, easing off toward the very top. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(18,18,14,0.60) 0%, rgba(18,18,14,0.72) 30%, rgba(18,18,14,0.84) 55%, rgba(18,18,14,0.80) 75%, rgba(18,18,14,0.94) 100%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-bg" />

        {/* Content fades on scroll */}
        <motion.div
          className="relative z-10 max-w-5xl text-center"
          style={{ opacity: heroOpacity }}
        >
          {/* ── "في ســـواري" — largest element on the page ── */}
          <motion.h1
            className="font-display mb-8 font-bold"
            style={{
              fontSize: 'clamp(4.5rem, 17vw, 11.5rem)',
              lineHeight: 1.05,
              color: WARM_WHITE,
              letterSpacing: '-0.01em',
              textShadow: '0 8px 60px rgba(0,0,0,0.55)',
            }}
            initial={{ opacity: 0, y: 55 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, ease: EASE }}
          >
            {pick(content.heroTitleAr, content.heroTitleEn)}
          </motion.h1>

          {/* Gold divider */}
          <motion.div
            className="mx-auto mb-10 h-px bg-brand-primary"
            style={{ width: 'clamp(3rem, 10vw, 6rem)' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.65, delay: 0.65, ease: EASE }}
          />

          {/* Statement paragraph — secondary reading font for long-form editorial copy */}
          <motion.p
            className="font-body mx-auto font-light leading-[2.1]"
            style={{
              fontSize: 'clamp(1rem, 2.1vw, 1.42rem)',
              color: 'rgba(244, 239, 227, 0.78)',
              maxWidth: '54rem',
            }}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
          >
            {pick(content.heroStatementAr, content.heroStatementEn)}
          </motion.p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.3 }}
        >
          <motion.div
            className="h-10 w-px origin-top bg-brand-primary"
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="text-sm tracking-[0.35em] text-brand-primary">{pick(content.heroScrollHintAr, content.heroScrollHintEn)}</span>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          Section 2 — Vision (رؤيتنا)
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        className="px-8 py-28 md:px-20"
        style={{ background: 'rgb(44, 45, 40)' }}
      >
        <motion.div
          className="mx-auto max-w-5xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.85, ease: EASE }}
        >
          <SectionLabel>{pick(content.sectionLabelWhoWeAreAr, content.sectionLabelWhoWeAreEn)}</SectionLabel>

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[auto_1fr] lg:gap-20">

            {/* Outlined title */}
            <motion.h2
              className="font-display shrink-0 font-bold leading-none"
              style={{
                fontSize: 'clamp(3.8rem, 9vw, 7rem)',
                WebkitTextStroke: '1.5px rgb(190, 156, 100)',
                color: 'transparent',
                letterSpacing: '-0.02em',
              }}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.75, delay: 0.1, ease: EASE }}
            >
              {pick(content.visionTitleAr, content.visionTitleEn)}
            </motion.h2>

            {/* Body text */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.75, delay: 0.2, ease: EASE }}
            >
              <div className="mb-6 h-px w-14 bg-brand-primary" />
              <p
                className="font-body font-light leading-[2.05]"
                style={{
                  fontSize: 'clamp(1rem, 1.9vw, 1.3rem)',
                  color: 'rgba(244, 239, 227, 0.68)',
                }}
              >
                {pick(content.visionBodyAr, content.visionBodyEn)}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          Section 2.5 — Stats (بالأرقام)
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        className="px-8 py-20 md:px-20"
        style={{ background: 'rgb(35, 36, 32)' }}
      >
        <motion.div
          className="mx-auto max-w-5xl"
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <SectionLabel>{pick(content.sectionLabelStatsAr, content.sectionLabelStatsEn)}</SectionLabel>

          <div className="grid grid-cols-1 gap-px bg-brand-primary/15 sm:grid-cols-3">
            {content.statItems.map((item, i) => (
              <motion.div
                key={item.id}
                className="flex flex-col items-center gap-3 py-14 text-center"
                style={{ background: 'rgb(35, 36, 32)' }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, delay: i * 0.12, ease: EASE }}
              >
                <span
                  className="block leading-none"
                  style={{
                    fontSize: '4.5rem',
                    fontWeight: 900,
                    WebkitTextStroke: '1.5px rgb(190, 156, 100)',
                    color: 'transparent',
                    letterSpacing: '-0.04em',
                  }}
                >
                  <CountUp target={item.value} suffix={item.suffix ?? ''} />
                </span>
                <p className="text-sm font-light tracking-wide text-brand-cream/50">
                  {pick(item.labelAr, item.labelEn)}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          Section 3 — Team (الفريـــق)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-8 py-28 md:px-20">
        {/* Pattern background — full cover, same treatment as reference */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/images/pattern/pattern.avif')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Dark overlay to keep content legible */}
        <div className="absolute inset-0 bg-brand-bg/80" />

        <motion.div
          className="relative z-10 mx-auto max-w-6xl"
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.85, ease: EASE }}
        >
          <SectionLabel>{pick(content.sectionLabelTeamStructureAr, content.sectionLabelTeamStructureEn)}</SectionLabel>

          <motion.h2
            className="font-display mb-14 text-center font-bold"
            style={{
              fontSize: 'clamp(2.8rem, 8vw, 5.5rem)',
              color: WARM_WHITE,
              letterSpacing: '-0.01em',
            }}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.12, ease: EASE }}
          >
            {pick(content.teamTitleAr, content.teamTitleEn)}
          </motion.h2>

          {/* Org-chart image with cinematic frame */}
          <motion.div
            className="relative mx-auto overflow-hidden "
            style={{ maxWidth: '1000px' }}
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ duration: 0.9, ease: EASE }}
          >

            <Image
              src={content.teamPhotoUrl}
              alt={pick(content.teamImageAltAr, content.teamImageAltEn)}
              width={content.teamPhotoWidth ?? 1200}
              height={content.teamPhotoHeight ?? 900}
              className="h-auto w-full"
              sizes="(max-width: 768px) 100vw, 1000px"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          Section 4 — FAQ (الأسئلة الشائعة)
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        className="px-8 py-28 md:px-20"
        style={{ background: FAQ_BG }}
      >
        <motion.div
          className="mx-auto max-w-3xl"
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <SectionLabel>{pick(content.sectionLabelFaqAr, content.sectionLabelFaqEn)}</SectionLabel>

          <motion.h2
            className="font-display mb-14 text-center font-bold"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: DARK_BROWN }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          >
            {pick(content.faqTitleAr, content.faqTitleEn)}
          </motion.h2>

          <div>
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
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          Section 5 — Location (موقعنا)
          Layout: gallery image on the LEFT, Google Maps on the RIGHT.
          In RTL grid, items render right-to-left, so Maps is first in HTML
          (→ right column) and gallery is second (→ left column).
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="px-8 py-28 md:px-20" style={{ background: 'rgb(139, 111, 75)' }}>
        <motion.div
          className="mx-auto max-w-6xl"
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <SectionLabel>{pick(content.sectionLabelVisitUsAr, content.sectionLabelVisitUsEn)}</SectionLabel>

          <motion.h2
            className="font-display mb-4 text-center font-bold"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: WARM_WHITE }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          >
            {pick(content.locationTitleAr, content.locationTitleEn)}
          </motion.h2>

          <motion.p
            className="mb-10 text-right font-light"
            style={{ color: 'rgba(244, 239, 227, 0.75)', fontSize: 'clamp(0.9rem, 1.6vw, 1.05rem)' }}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.18, ease: EASE }}
          >
            {pick(content.locationAddressAr, content.locationAddressEn)}
          </motion.p>

          {/* Two-column grid — RTL renders col-1 on the right, col-2 on the left */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

            {/* ── RIGHT column (HTML first in RTL): Google Maps ── */}
            <motion.div
              className="relative min-h-[420px] overflow-hidden rounded-sm border border-brand-primary/20"
              style={{ background: 'rgb(38,39,35)' }}
              initial={{ opacity: 0, x: -22 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              {MAPS_EMBED_URL ? (
                /* ADD_GOOGLE_MAPS_EMBED_URL_HERE — replace MAPS_EMBED_URL above */
                <iframe
                  src={MAPS_EMBED_URL}
                  className="h-full w-full border-0"
                  style={{ minHeight: '420px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={pick(content.locationMapTitleAr, content.locationMapTitleEn)}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-5 p-10 text-center">
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-full border border-brand-primary/30"
                    style={{ background: 'rgba(190, 156, 100, 0.06)' }}
                  >
                    <MapPin size={26} style={{ color: BRAND_PRIMARY, opacity: 0.7 }} />
                  </div>
                  <p className="text-sm tracking-widest text-brand-cream/35 uppercase">
                    {/* ADD_GOOGLE_MAPS_EMBED_URL_HERE */}
                    {pick(content.locationMapComingSoonAr, content.locationMapComingSoonEn)}
                  </p>
                </div>
              )}
            </motion.div>

            {/* ── LEFT column (HTML second in RTL): Gallery image ── */}
            <motion.div
              className="group relative min-h-[420px] overflow-hidden rounded-sm"
              initial={{ opacity: 0, x: 22 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
            >
              <Image
                src="/images/about/building.avif"
                alt={pick(content.locationGalleryAltAr, content.locationGalleryAltEn)}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Subtle gradient so text edges stay readable */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(25,25,20,0.45)]" />

              {/* Corner accents */}
              <span className="pointer-events-none absolute right-4 top-4 h-6 w-6 border-r-2 border-t-2 border-brand-primary/55" />
              <span className="pointer-events-none absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-brand-primary/55" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  )
}
