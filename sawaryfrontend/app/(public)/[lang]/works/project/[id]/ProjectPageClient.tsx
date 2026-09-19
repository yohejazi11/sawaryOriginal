'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import {
  motion,
  useTransform,
  useMotionValue,
  useInView,
  animate,
  AnimatePresence,
} from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react'

import { type Project } from '@/lib/projects'
import { getProjectDescription, getCoverImageAlt, getGalleryImageAlt } from '@/lib/projectContent'
import DesignCard from '@/components/ui/DesignCard'
import JustifiedGallery from '@/components/ui/JustifiedGallery'
import Footer from '@/components/sections/Footer'
import { useLanguage } from '@/contexts/LanguageContext'

const EASE_ENTER = [0.16, 1, 0.3, 1] as const
const EASE = [0.22, 1, 0.36, 1] as const
const BRAND_PRIMARY = 'rgb(190, 156, 100)'
const WARM_WHITE = 'rgb(244, 239, 227)'

export interface RelatedProject {
  id: number
  name: string
  coverImageUrl: string
  tags: { nameAr: string; nameEn: string }[]
  year: string
}

export default function ProjectPageClient({
  project,
  index,
  related,
}: {
  project: Project
  index: number
  related: RelatedProject[]
}) {
  const { t, lang } = useLanguage()
  const [isExiting, setIsExiting] = useState(false)
  const router = useRouter()

  const handleBack = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => router.back(), 700)
  }, [router])

  const orderedGroups = [
    ...project.sections.map(s => ({
      id: s.id as number | null,
      name: lang === 'ar' ? s.nameAr : s.nameEn,
      images: s.images,
    })),
    ...(project.images.length > 0 ? [{ id: null, name: null, images: project.images }] : []),
  ]
  let runningOffset = 0
  const groupsWithOffset = orderedGroups.map(g => {
    const offset = runningOffset
    runningOffset += g.images.length
    return { ...g, offset }
  })
  const flatImages = orderedGroups.flatMap(g => g.images)

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const total = flatImages.length

  const openLightbox = useCallback((i: number) => setLightboxIndex(i), [])
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const showPrev = useCallback(() => {
    setLightboxIndex(i => (i === null ? null : (i - 1 + total) % total))
  }, [total])
  const showNext = useCallback(() => {
    setLightboxIndex(i => (i === null ? null : (i + 1) % total))
  }, [total])

  const description = getProjectDescription(project, lang)
  const tagNames = project.tags.map(t => (lang === 'ar' ? t.nameAr : t.nameEn)).join(lang === 'ar' ? '، ' : ', ')

  return (
    <main className="min-h-screen bg-brand-bg" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

      {/* Fixed back button */}
      {/* top-24 = 6rem = 96px clears the fixed header (h-20 = 80px) */}
      <button
        onClick={handleBack}
        className="fixed right-6 top-24 z-50 flex items-center gap-2 text-sm text-brand-cream/70 transition-colors hover:text-brand-primary"
        style={{ textShadow: '0 1px 8px rgba(0,0,0,0.55)' }}
      >
        <span>{t('projectDetail.back')}</span>
        <ArrowRight size={14} />
      </button>

      {/* ── Section 1: Cinematic Hero (100vh) ────────────────────────────── */}
      <section className="relative h-screen overflow-hidden">

        {/* Cover image — entry/exit animation */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={isExiting ? { scale: 0.85, opacity: 0 } : { scale: 1, opacity: 1 }}
          transition={{ duration: isExiting ? 0.65 : 0.8, ease: EASE_ENTER }}
        >
          <Image
            src={project.coverImage || `https://picsum.photos/seed/${project.slug}-cover/1920/1080`}
            alt={getCoverImageAlt(project)}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </motion.div>

        {/* Cinematic overlay — graduated rather than flat: darkest where the back
            button/metadata sit (top) and where the title sits (bottom), lighter
            through the middle so the photo itself still reads through. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(18,17,14,0.62) 0%, rgba(18,17,14,0.22) 32%, rgba(18,17,14,0.28) 58%, rgba(18,17,14,0.75) 100%)',
          }}
        />

        {/* Top-right: thin vertical line + metadata stack */}
        {/* top-36 clears both the fixed header (h-20 = 80px) and the fixed back button at top-24 */}
        <motion.div
          className="absolute right-8 top-36 flex items-start gap-3"
          dir="ltr"
          initial={{ opacity: 0, y: -12 }}
          animate={isExiting ? { opacity: 0 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: isExiting ? 0 : 0.9, ease: EASE }}
        >
          <div className="mt-1 w-px bg-brand-primary" style={{ height: 64 }} />
          <div className="flex flex-col gap-1.5" dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ textShadow: '0 1px 8px rgba(0,0,0,0.55)' }}>
            {tagNames && <span className="text-sm tracking-[0.25em] text-brand-primary">{tagNames}</span>}
            <span className="text-sm tracking-[0.25em] text-brand-primary">{project.year}</span>
            <span className="text-sm tracking-[0.25em] text-brand-primary">{project.location}</span>
          </div>
        </motion.div>

        {/* Bottom: massive project name */}
        <motion.h1
          className="font-display absolute inset-x-0 select-none font-bold"
          style={{
            bottom: 'clamp(5rem, 12vh, 9rem)',
            fontSize: 'clamp(3rem, 10vw, 8rem)',
            lineHeight: 1,
            color: WARM_WHITE,
            paddingLeft: 'clamp(1.5rem, 5vw, 4rem)',
            paddingRight: 'clamp(1.5rem, 5vw, 4rem)',
            textShadow: '0 4px 32px rgba(0,0,0,0.5)',
          }}
          initial={{ opacity: 0, y: 50 }}
          animate={isExiting ? { opacity: 0, y: 50 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: isExiting ? 0 : 0.7, ease: EASE }}
        >
          {project.name}
        </motion.h1>

        {/* Bottom-right: circular scroll indicator */}
        <motion.div
          className="absolute bottom-10 right-8 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={isExiting ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.6, delay: isExiting ? 0 : 1.3 }}
        >
          <div
            className="flex items-center justify-center rounded-full border border-brand-primary/60"
            style={{ width: 48, height: 48 }}
          >
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown size={16} className="text-brand-primary" />
            </motion.div>
          </div>
          <span className="text-sm tracking-[0.3em] text-brand-primary">{t('about.hero.scrollHint')}</span>
        </motion.div>
      </section>

      {/* ── Section 2: Project Statement ──────────────────────────────────── */}
      <section className="bg-brand-bg px-8 py-24 md:px-20">
        <motion.div
          className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 md:grid-cols-2"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <div>
            <div className="mb-6 h-px w-24 bg-brand-primary" />
            <p className="font-body text-lg leading-loose" style={{ color: WARM_WHITE, direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
              {description}
            </p>
          </div>

          <div className="flex items-center justify-center">
            <span
              aria-hidden
              className="select-none"
              style={{
                fontSize: '10rem',
                fontWeight: 900,
                WebkitTextStroke: `2px ${BRAND_PRIMARY}`,
                color: 'transparent',
                lineHeight: 1,
                letterSpacing: '-0.04em',
              }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>
        </motion.div>
      </section>
      {/* ── Section 4: Details Bar ────────────────────────────────────────── */}
      <DetailsBar project={project} imageCount={total} />
      {/* ── Section 3: Project Gallery (Justified Rows — no cropping) ──────── */}
      {groupsWithOffset.map(group => group.images.length > 0 && (
        <section key={group.id ?? 'ungrouped'} className="px-3 py-10 md:px-6">
          {group.name && (
            <h2 className="mb-6 px-3 text-2xl font-bold text-brand-cream md:px-0">{group.name}</h2>
          )}
          <JustifiedGallery
            images={group.images.map((img, i) => ({
              src: img.src,
              width: img.width,
              height: img.height,
              alt: getGalleryImageAlt(project, lang, group.offset + i + 1, total),
            }))}
            onImageClick={i => openLightbox(group.offset + i)}
          />
        </section>
      ))}



      {/* ── Section 5: Related Projects ───────────────────────────────────── */}
      {related.length > 0 && (
        <section className="bg-brand-bg px-8 py-24 md:px-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE }}
            className="mb-14 flex items-center gap-5"
          >
            <span className="h-px flex-1 bg-brand-primary/35" />
            <span className="shrink-0 text-sm font-light tracking-[0.3em] text-brand-primary uppercase">
              {t('projectDetail.relatedProjects')}
            </span>
            <span className="h-px flex-1 bg-brand-primary/35" />
          </motion.div>

          <div className="flex flex-wrap justify-center gap-5">
            {related.map((p, i) => (
              <DesignCard
                key={String(p.id)}
                name={p.name}
                image={p.coverImageUrl}
                category={p.tags[0] ? (lang === 'ar' ? p.tags[0].nameAr : p.tags[0].nameEn) : undefined}
                year={p.year}
                delay={i * 0.1}
                href={`/works/project/${p.id}`}
              />
            ))}
          </div>
        </section>
      )}

      <Footer />

      {/* ── Lightbox ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            images={flatImages.map(img => img.src)}
            index={lightboxIndex}
            onClose={closeLightbox}
            onPrev={showPrev}
            onNext={showNext}
          />
        )}
      </AnimatePresence>
    </main>
  )
}

// ── Lightbox ────────────────────────────────────────────────────────────────

function Lightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  images: string[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, onPrev, onNext])

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <button
        onClick={e => { e.stopPropagation(); onClose() }}
        className="absolute right-6 top-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-brand-primary/30 text-brand-cream transition-colors hover:border-brand-primary hover:text-brand-primary"
        aria-label="إغلاق"
      >
        <X size={20} />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); onPrev() }}
            className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-brand-primary/30 text-brand-cream transition-colors hover:border-brand-primary hover:text-brand-primary md:left-8"
            aria-label="الصورة السابقة"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onNext() }}
            className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-brand-primary/30 text-brand-cream transition-colors hover:border-brand-primary hover:text-brand-primary md:right-8"
            aria-label="الصورة التالية"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      <motion.div
        key={index}
        className="relative h-[80vh] w-[90vw]"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.25, ease: EASE }}
        onClick={e => e.stopPropagation()}
      >
        <Image src={images[index]} alt="" fill className="object-contain" sizes="90vw" priority />
      </motion.div>

      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-sm text-brand-primary" dir="ltr">
          {String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
        </div>
      )}
    </motion.div>
  )
}

// ── Details bar (Section 4) ───────────────────────────────────────────────────

function DetailsBar({ project, imageCount }: { project: Project; imageCount: number }) {
  const { t, lang } = useLanguage()
  const tagNames = project.tags.map(tg => (lang === 'ar' ? tg.nameAr : tg.nameEn)).join(lang === 'ar' ? '، ' : ', ')
  const stats = [
    ...(tagNames ? [{ label: t('projectDetail.stats.type'), value: tagNames }] : []),
    { label: t('projectDetail.stats.year'), value: project.year },
    { label: t('projectDetail.stats.location'), value: project.location },
    { label: t('projectDetail.stats.imageCount'), value: String(imageCount) },
  ]

  return (
    <section style={{ background: 'rgb(35, 36, 32)' }}>
      <div className="flex flex-wrap justify-center" dir="ltr">
        {stats.map(({ label, value }, i) => (
          <motion.div
            key={label}
            className="flex flex-col items-center gap-2 px-10 py-12"
            style={i > 0 ? { borderLeft: '1px solid rgba(190, 156, 100, 0.2)' } : undefined}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
          >
            <span className="text-sm font-light uppercase tracking-[0.25em]" style={{ color: BRAND_PRIMARY }}>
              {label}
            </span>
            <StatCountUp value={value} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ── Count-up stat ─────────────────────────────────────────────────────────────

function StatCountUp({ value }: { value: string }) {
  const num = parseInt(value, 10)
  const isNumeric = !isNaN(num) && String(num) === value
  const motionVal = useMotionValue(0)
  const rounded = useTransform(motionVal, Math.round)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView && isNumeric) {
      const controls = animate(motionVal, num, { duration: 1.5, ease: 'easeOut' })
      return () => controls.stop()
    }
  }, [isInView, isNumeric, num, motionVal])

  if (!isNumeric) {
    return <span ref={ref} className="text-2xl font-bold" style={{ color: WARM_WHITE }}>{value}</span>
  }

  return (
    <motion.span ref={ref} className="text-2xl font-bold tabular-nums" style={{ color: WARM_WHITE }}>
      {rounded}
    </motion.span>
  )
}
