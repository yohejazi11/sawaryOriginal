'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  motion,
  useScroll,
  useTransform,
  useInView,
} from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Footer from '@/components/sections/Footer'
import DesignCard from '@/components/ui/DesignCard'
import { type ApiProjectList } from '@/lib/projects'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSiteSettings } from '@/contexts/SiteSettingsContext'
import { localizedHref } from '@/lib/i18n'

const EASE = [0.22, 1, 0.36, 1] as const
const WARM_WHITE = 'rgb(244, 239, 227)'

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

export default function ExecutionServiceClient({
  initialProjects,
}: {
  initialProjects: ApiProjectList[]
}) {
  const { t, lang } = useLanguage()
  const { whatsAppNumber } = useSiteSettings()
  const pillars = t('servicesExecution.pillars') as unknown as { title: string; body: string }[]
  const processSteps = t('servicesExecution.process.steps') as unknown as { number: string; title: string; body: string }[]
  const stats = t('servicesExecution.stats') as unknown as { target: number; suffix: string; label: string }[]
  const specialties = [
    {
      title: t('servicesExecution.specialties.residential.title'),
      body: t('servicesExecution.specialties.residential.body'),
      href: '/works/execution/residential',
      image: '/images/services/implement.avif',
    },
    {
      title: t('servicesExecution.specialties.commercial.title'),
      body: t('servicesExecution.specialties.commercial.body'),
      href: '/works/execution/commercial',
      image: '/images/services/commercial.jpg',
    },
  ]
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroImgY    = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])

  return (
    <main className="min-h-screen bg-brand-bg" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

      {/* ── 1. Hero ───────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">

        <motion.div className="absolute inset-0" style={{ y: heroImgY }}>
          <Image
            src="/images/services/implement.avif"
            alt={t('servicesExecution.hero.imageAlt')}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </motion.div>

        {/* Layered overlays — graduated so the eyebrow/back-link (top) and heading
            (bottom) stay legible without flattening the whole photo under one tint. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(18,17,14,0.55) 0%, rgba(18,17,14,0.30) 30%, rgba(18,17,14,0.35) 55%, rgba(18,17,14,0.62) 100%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-bg/75" />

        {/* Content wrapper — pt-20 clears the fixed header (h-20 = 5rem = 80px) */}
        <div className="absolute inset-0 flex flex-col pt-20 px-8 md:px-20">

          {/* Back link — sits just below the header */}
          <motion.div
            className="pt-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
          >
            <Link
              href={localizedHref(lang, '/services')}
              className="inline-flex items-center gap-2 text-sm text-brand-cream/55 transition-colors hover:text-brand-primary"
            >
              <ArrowRight size={14} />
              <span>{t('servicesDesign.backLink')}</span>
            </Link>
          </motion.div>

          {/* Push hero text to the bottom */}
          <div className="flex-1" />

          {/* Hero text — fades out on scroll */}
          <motion.div className="pb-24" style={{ opacity: heroOpacity }}>
            <motion.span
              className="mb-4 block text-sm font-light tracking-[0.4em] text-brand-primary uppercase"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
            >
              {t('nav.services')}
            </motion.span>

            <motion.h1
              className="font-display mb-6 font-bold leading-[0.9]"
              style={{ fontSize: 'clamp(4.5rem, 14vw, 10rem)', color: WARM_WHITE }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
            >
              {t('homeServices.execution.title')}
            </motion.h1>

            <motion.p
              className="max-w-lg text-lg font-light leading-relaxed text-brand-cream/65"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7, ease: EASE }}
            >
              {t('servicesExecution.hero.subtitle')}
            </motion.p>
          </motion.div>
        </div>

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
          <span className="text-sm tracking-[0.35em] text-brand-primary">{t('about.hero.scrollHint')}</span>
        </motion.div>
      </section>

      {/* ── 2. Introduction ───────────────────────────────────────────────── */}
      <section className="px-8 py-28 md:px-20">
        <motion.div
          className="mx-auto max-w-6xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <SectionLabel>{t('servicesExecution.intro.sectionLabel')}</SectionLabel>

          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
            <div>
              <h2
                className="font-display mb-8 font-bold leading-[1.1]"
                style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', color: WARM_WHITE }}
              >
                {t('servicesExecution.intro.heading')}
              </h2>
              <div className="mb-6 h-px w-16 bg-brand-primary" />
              <p className="font-body text-lg font-light leading-[1.9] text-brand-cream/60">
                {t('servicesExecution.intro.body')}
              </p>
            </div>

            <div className="flex flex-col gap-9">
              {pillars.map(({ title, body }, i) => (
                <motion.div
                  key={title}
                  className="flex gap-5"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
                >
                  <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-primary" />
                  <div>
                    <p className="mb-1.5 text-base font-semibold" style={{ color: WARM_WHITE }}>
                      {title}
                    </p>
                    <p className="font-body text-sm font-light leading-[1.8] text-brand-cream/55">
                      {body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── 3. Process ────────────────────────────────────────────────────── */}
      <section
        className="px-8 py-28 md:px-20"
        style={{ background: 'rgb(44, 45, 40)' }}
      >
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="mb-16 text-center"
          >
            <SectionLabel>{t('servicesDesign.process.sectionLabel')}</SectionLabel>
            <h2
              className="font-display font-bold"
              style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: WARM_WHITE }}
            >
              {t('servicesExecution.process.heading')}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-px bg-brand-primary/15 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map(({ number, title, body }, i) => (
              <motion.div
                key={number}
                className="flex flex-col gap-6 p-8 md:p-10"
                style={{ background: 'rgb(44, 45, 40)' }}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.65, delay: i * 0.12, ease: EASE }}
              >
                <span
                  aria-hidden
                  className="block select-none leading-none"
                  style={{
                    fontSize: '4.5rem',
                    fontWeight: 900,
                    WebkitTextStroke: '1px rgb(190, 156, 100)',
                    color: 'transparent',
                    letterSpacing: '-0.04em',
                    lineHeight: 1,
                  }}
                >
                  {number}
                </span>
                <div>
                  <div className="mb-4 h-px w-8 bg-brand-primary" />
                  <h3
                    className="mb-3 text-base font-semibold"
                    style={{ color: WARM_WHITE }}
                  >
                    {title}
                  </h3>
                  <p className="font-body text-sm font-light leading-[1.85] text-brand-cream/50">
                    {body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Portfolio preview ──────────────────────────────────────────── */}
      {initialProjects.length > 0 && (
        <section className="overflow-hidden px-8 py-28 md:px-20">
          <div className="mx-auto mb-14 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASE }}
            >
              <SectionLabel>{t('servicesExecution.portfolio.sectionLabel')}</SectionLabel>
              <h2
                className="font-display font-bold"
                style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: WARM_WHITE }}
              >
                {t('servicesExecution.portfolio.heading')}
              </h2>
            </motion.div>
          </div>

          <div
            className="flex gap-5 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden"
            style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {initialProjects.slice(0, 6).map((p, i) => (
              <DesignCard
                key={p.id}
                name={p.name}
                image={p.coverImageUrl || undefined}
                category={p.category?.slug || p.category?.name}
                type="execution"
                year={p.year}
                delay={i * 0.1}
                href={`/works/project/${p.id}`}
              />
            ))}
          </div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <Link
              href={`${localizedHref(lang, '/works')}#execution-projects`}
              className="inline-flex items-center gap-3 rounded-full border border-brand-primary/60 px-8 py-3.5 text-sm font-medium text-brand-primary transition-all duration-300 hover:border-brand-primary hover:bg-brand-primary hover:text-white"
            >
              {t('servicesExecution.portfolio.viewAll')}
            </Link>
          </motion.div>
        </section>
      )}

      {/* ── 5. Stats ──────────────────────────────────────────────────────── */}
      <section
        className="px-8 py-20 md:px-20"
        style={{ background: 'rgb(35, 36, 32)' }}
      >
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-px bg-brand-primary/15 sm:grid-cols-3">
          {stats.map(({ target, suffix, label }, i) => (
            <motion.div
              key={label}
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
                <CountUp target={target} suffix={suffix} />
              </span>
              <p className="text-sm font-light tracking-wide text-brand-cream/50">
                {label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 6. Sub-service links ──────────────────────────────────────────── */}
      <section className="px-8 py-20 md:px-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
            className="mb-12 text-center"
          >
            <SectionLabel>{t('servicesExecution.specialties.sectionLabel')}</SectionLabel>
            <h2
              className="font-display font-bold"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: WARM_WHITE }}
            >
              {t('servicesExecution.specialties.heading')}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {specialties.map(({ title, body, href, image }, i) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: EASE }}
              >
                <Link
                  href={localizedHref(lang, href)}
                  className="rounded-card group relative flex min-h-[220px] flex-col justify-end overflow-hidden p-8"
                >
                  <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-[rgba(28,28,24,0.68)] transition-colors duration-500 group-hover:bg-[rgba(28,28,24,0.50)]" />
                  <div className="relative z-10">
                    <div className="mb-3 h-px w-8 bg-brand-primary" />
                    <h3
                      className="font-display mb-2 font-bold text-white"
                      style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}
                    >
                      {title}
                    </h3>
                    <p className="text-sm text-brand-cream/60">{body}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. CTA ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-8 py-32 md:px-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='12' cy='12' r='0.8' fill='rgba(140%2C112%2C76%2C0.06)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-brand-primary/15" />

        <motion.div
          className="relative mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.85, ease: EASE }}
        >
          <span className="mb-5 block text-sm font-light tracking-[0.38em] text-brand-primary uppercase">
            {t('servicesDesign.cta.eyebrow')}
          </span>

          <h2
            className="font-display mb-6 font-bold leading-[1.1]"
            style={{ fontSize: 'clamp(2.5rem, 6.5vw, 4.5rem)', color: WARM_WHITE }}
          >
            {t('servicesExecution.cta.heading')}
          </h2>

          <p className="font-body mx-auto mb-12 max-w-xl text-lg font-light leading-[1.85] text-brand-cream/55">
            {t('servicesExecution.cta.body')}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={`https://wa.me/${whatsAppNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-brand-primary px-10 py-4 text-base font-medium text-white transition-all duration-300 hover:brightness-110 active:scale-[0.97]"
            >
              {t('servicesDesign.cta.consultBtn')}
            </a>
            <Link
              href={`${localizedHref(lang, '/works')}#execution-projects`}
              className="rounded-full border border-brand-primary/50 px-10 py-4 text-base font-medium text-brand-primary transition-all duration-300 hover:border-brand-primary hover:bg-brand-primary/10 active:scale-[0.97]"
            >
              {t('servicesDesign.cta.viewWorksBtn')}
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  )
}
