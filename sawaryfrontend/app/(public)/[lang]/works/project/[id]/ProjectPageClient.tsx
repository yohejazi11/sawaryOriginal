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
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-react'

import { type Project } from '@/lib/projects'
import { getProjectDescription, getCoverImageAlt, getGalleryImageAlt } from '@/lib/projectContent'
import { localizedHref } from '@/lib/i18n'
import FeaturedBadge from '@/components/ui/FeaturedBadge'
import JustifiedGallery from '@/components/ui/JustifiedGallery'
import PortfolioCard from '@/components/ui/PortfolioCard'
import Reveal from '@/components/ui/Reveal'
import Footer from '@/components/sections/Footer'
import { useLanguage } from '@/contexts/LanguageContext'

const EASE_ENTER = [0.16, 1, 0.3, 1] as const
const EASE = [0.22, 1, 0.36, 1] as const

// Home-page design language (gallery / services sections) on the dark background:
// cream text and thin cream borders instead of dark ones.
const DARK = '#343229'
const CREAM = '#F4EFE3'

export interface RelatedProject {
  id: number
  name: string
  isFeatured: boolean
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
  const tagNames = project.tags.map(tg => (lang === 'ar' ? tg.nameAr : tg.nameEn))
  const meta = [...tagNames, project.year, project.location].filter(Boolean)

  return (
    <main className="flex min-h-screen flex-col" style={{ background: DARK, color: CREAM }} dir={lang === 'ar' ? 'rtl' : 'ltr'}>

      {/* ── Section 1: Header + framed cover ─────────────────────────────── */}
      <section className="flex w-full flex-col gap-[48px] px-[32px] pb-[64px] pt-36">
        <motion.button
          onClick={handleBack}
          className="flex w-fit items-center gap-2 rounded-[15px] border border-[#F4EFE3]/60 px-6 py-2 text-[16px] transition-all duration-300 hover:bg-[#F4EFE3] hover:text-[#343229]"
          initial={{ opacity: 0 }}
          animate={isExiting ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <ArrowRight size={18} className={lang === 'ar' ? '' : 'rotate-180'} />
          <span>{t('projectDetail.back')}</span>
        </motion.button>

        <div className="flex w-full items-end justify-between gap-[32px] max-sm:flex-col max-sm:items-start">
          <motion.h1
            className="text-[clamp(2.5rem,6vw,4.5rem)] leading-tight"
            initial={{ opacity: 0, y: 32 }}
            animate={isExiting ? { opacity: 0, y: 32 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: isExiting ? 0 : 0.2, ease: EASE }}
          >
            {project.name}
          </motion.h1>

          {(meta.length > 0 || project.isFeatured) && (
            <motion.div
              className="flex flex-wrap items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={isExiting ? { opacity: 0 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: isExiting ? 0 : 0.35, ease: EASE }}
            >
              {project.isFeatured && <FeaturedBadge inline />}
              {meta.map(item => (
                <span key={item} className="rounded-[15px] border border-[#F4EFE3]/40 px-5 py-1.5 text-[16px] text-[#F4EFE3]/85">
                  {item}
                </span>
              ))}
            </motion.div>
          )}
        </div>

        {/* Cover — uncovers bottom→top like the home gallery cards */}
        <motion.div
          className="relative h-[75vh] min-h-[360px] w-full overflow-hidden rounded-[25px] border border-[#F4EFE3]/40"
          initial={{ clipPath: 'inset(100% 0% 0% 0% round 25px)' }}
          animate={
            isExiting
              ? { clipPath: 'inset(0% 0% 100% 0% round 25px)' }
              : { clipPath: 'inset(0% 0% 0% 0% round 25px)' }
          }
          transition={{ duration: isExiting ? 0.65 : 1.1, delay: isExiting ? 0 : 0.3, ease: EASE_ENTER }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.6, delay: 0.3, ease: EASE }}
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
        </motion.div>
      </section>

      {/* ── Section 2: Project Statement ──────────────────────────────────── */}
      {description && (
        <section className="px-[32px] py-[64px]">
          <div className="grid w-full grid-cols-1 items-center gap-12 md:grid-cols-[1fr_auto]">
            <Reveal>
              <p className="text-[20px] leading-loose text-[#F4EFE3]/90 md:text-[24px]">{description}</p>
            </Reveal>
            <Reveal variant="pop" delay={0.2} className="flex justify-center md:px-[64px]">
              <span
                aria-hidden
                className="select-none text-[clamp(5rem,12vw,10rem)] font-semibold leading-none"
                style={{ color: 'transparent', WebkitTextStroke: `1.5px ${CREAM}` }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── Section 3: Details Bar ────────────────────────────────────────── */}
      <DetailsBar project={project} imageCount={total} />

      {/* ── Section 4: Project Gallery (Justified Rows — no cropping) ──────── */}
      {groupsWithOffset.map(group => group.images.length > 0 && (
        <section key={group.id ?? 'ungrouped'} className="px-[32px] py-[48px]">
          {group.name && (
            <Reveal className="mb-[32px]">
              <h2 className="text-[clamp(1.75rem,4vw,3rem)] leading-tight">{group.name}</h2>
            </Reveal>
          )}
          <JustifiedGallery
            gap={8}
            rounded
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
        <section className="px-[32px] py-[96px]">
          <div className="flex w-full items-center justify-between gap-[32px] max-sm:flex-col max-sm:items-start">
            <Reveal>
              <h2 className="text-[clamp(2rem,5vw,4rem)] leading-tight">{t('projectDetail.relatedProjects')}</h2>
            </Reveal>
            <Reveal delay={0.15}>
              <Link
                href={localizedHref(lang, '/works')}
                className="block w-fit rounded-[15px] bg-[#F4EFE3] px-[46px] py-2 text-[#343229] transition-opacity duration-300 hover:opacity-85"
              >
                {t('nav.works')}
              </Link>
            </Reveal>
          </div>

          <div className="mt-[64px] grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <PortfolioCard
                key={p.id}
                href={localizedHref(lang, `/works/project/${p.id}`)}
                image={p.coverImageUrl}
                name={p.name}
                delay={(i % 3) * 0.15}
                tone="dark"
                featured={p.isFeatured}
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

  const navButton =
    'absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#F4EFE3]/40 text-[#F4EFE3] transition-colors hover:bg-[#F4EFE3] hover:text-[#343229]'

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1e1d18]/95 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <button
        onClick={e => { e.stopPropagation(); onClose() }}
        className="absolute right-6 top-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#F4EFE3]/40 text-[#F4EFE3] transition-colors hover:bg-[#F4EFE3] hover:text-[#343229]"
        aria-label="إغلاق"
      >
        <X size={20} />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); onPrev() }}
            className={`${navButton} left-4 md:left-8`}
            aria-label="الصورة السابقة"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onNext() }}
            className={`${navButton} right-4 md:right-8`}
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
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-sm text-[#F4EFE3]/70" dir="ltr">
          {String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
        </div>
      )}
    </motion.div>
  )
}

// ── Details bar ───────────────────────────────────────────────────────────────

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
    <section className="px-[32px] py-[32px]">
      <Reveal className="flex w-full flex-wrap overflow-hidden rounded-[25px] border border-[#F4EFE3]/40">
        {stats.map(({ label, value }, i) => (
          <div
            key={label}
            // Two per row on mobile, one row on desktop — works for 3 or 4 stats.
            className={`flex flex-1 basis-1/2 flex-col items-center gap-2 px-6 py-10 text-center md:basis-0 ${
              i > 0 ? 'border-[#F4EFE3]/20 md:border-s' : ''
            } ${i % 2 === 1 ? 'border-s border-[#F4EFE3]/20' : ''} ${i >= 2 ? 'max-md:border-t max-md:border-[#F4EFE3]/20' : ''}`}
          >
            <span className="text-[16px] text-[#F4EFE3]/60">{label}</span>
            <StatCountUp value={value} />
          </div>
        ))}
      </Reveal>
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
    return <span ref={ref} className="text-[24px] font-bold" style={{ color: CREAM }}>{value}</span>
  }

  return (
    <motion.span ref={ref} className="text-[24px] font-bold tabular-nums" style={{ color: CREAM }}>
      {rounded}
    </motion.span>
  )
}
