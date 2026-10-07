'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Footer from '@/components/sections/Footer'
import BlogCard from '@/components/ui/BlogCard'
import Reveal from '@/components/ui/Reveal'
import { useLanguage } from '@/contexts/LanguageContext'
import { localizedHref } from '@/lib/i18n'
import {
  formatPostDate,
  localizePost,
  parseContent,
  readingMinutes,
  type ApiBlogPost,
  type ApiBlogPostList,
} from '@/lib/blog'

const EASE_ENTER = [0.16, 1, 0.3, 1] as const
const EASE = [0.22, 1, 0.36, 1] as const

export default function BlogPostClient({ post, more }: { post: ApiBlogPost; more: ApiBlogPostList[] }) {
  const { t, lang } = useLanguage()
  const { title, excerpt, content } = localizePost(post, lang)
  const blocks = parseContent(content)
  const meta = [formatPostDate(post.publishedAt, lang), `${readingMinutes(content)} ${t('blog.minRead')}`].filter(Boolean)

  return (
    <main className="flex min-h-screen flex-col bg-[#F4EFE3] text-[#343229]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

      {/* ── Section 1: Header + framed cover ─────────────────────────────── */}
      <section className="flex w-full flex-col gap-[48px] px-[32px] max-sm:px-4 pb-[64px] pt-36 max-sm:pt-28">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: EASE }}>
          <Link
            href={localizedHref(lang, '/blog')}
            className="flex w-fit items-center gap-2 rounded-[15px] border border-[#343229] px-6 py-2 text-[16px] transition-all duration-300 hover:bg-[#343229] hover:text-[#F4EFE3]"
          >
            <ArrowRight size={18} className={lang === 'ar' ? '' : 'rotate-180'} />
            <span>{t('blog.back')}</span>
          </Link>
        </motion.div>

        <div className="flex max-w-[64rem] flex-col gap-6">
          <motion.div
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
          >
            {meta.map(item => (
              <span key={item} className="rounded-[15px] border border-[#343229]/40 px-5 py-1.5 text-[16px]">
                {item}
              </span>
            ))}
          </motion.div>
          <motion.h1
            className="text-[clamp(2.25rem,5.5vw,4.25rem)] leading-tight"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          >
            {title}
          </motion.h1>
          {excerpt && (
            <motion.p
              className="text-[18px] leading-loose opacity-75 md:text-[22px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
            >
              {excerpt}
            </motion.p>
          )}
        </div>

        {post.coverImageUrl && (
          <motion.div
            className="relative h-[70vh] min-h-[320px] w-full overflow-hidden rounded-[25px] border border-[#343229]"
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
              <Image src={post.coverImageUrl} alt={title} fill className="object-cover" sizes="100vw" priority />
            </motion.div>
          </motion.div>
        )}
      </section>

      {/* ── Section 2: Article body ───────────────────────────────────────── */}
      <article className="px-[32px] max-sm:px-4 py-[48px]">
        <div className="mx-auto flex max-w-[48rem] flex-col gap-6">
          {blocks.map((block, i) => (
            <Reveal key={i}>
              {block.type === 'heading' ? (
                <h2 className="mt-6 text-[clamp(1.5rem,3vw,2.25rem)] leading-tight">{block.text}</h2>
              ) : block.type === 'list' ? (
                <ul className="flex list-disc flex-col gap-2 ps-6 text-[18px] leading-loose md:text-[20px]">
                  {block.items.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              ) : (
                <p className="whitespace-pre-line text-[18px] leading-loose md:text-[20px]">{block.text}</p>
              )}
            </Reveal>
          ))}
        </div>
      </article>

      {/* ── Section 3: More articles ──────────────────────────────────────── */}
      {more.length > 0 && (
        <section className="px-[32px] max-sm:px-4 pb-[96px] pt-[64px]">
          <div className="flex w-full items-center justify-between gap-[32px] max-sm:flex-col max-sm:items-start">
            <Reveal>
              <h2 className="text-[clamp(2rem,5vw,4rem)] leading-tight">{t('blog.morePosts')}</h2>
            </Reveal>
            <Reveal delay={0.15}>
              <Link
                href={localizedHref(lang, '/blog')}
                className="block w-fit rounded-[15px] bg-[#343229] px-[46px] py-2 text-[#F4EFE3] transition-opacity duration-300 hover:opacity-85"
              >
                {t('blog.back')}
              </Link>
            </Reveal>
          </div>

          <div className="mt-[64px] grid w-full grid-cols-1 gap-x-2 gap-y-[64px] sm:grid-cols-2 lg:grid-cols-3">
            {more.map((p, i) => (
              <BlogCard key={p.id} post={p} delay={(i % 3) * 0.15} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}
