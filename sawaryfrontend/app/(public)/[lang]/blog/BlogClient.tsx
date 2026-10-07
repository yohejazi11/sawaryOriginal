'use client'

import { motion } from 'framer-motion'
import { ImageOff } from 'lucide-react'
import Footer from '@/components/sections/Footer'
import BlogCard from '@/components/ui/BlogCard'
import { useLanguage } from '@/contexts/LanguageContext'
import { type ApiBlogPostList } from '@/lib/blog'

const EASE = [0.22, 1, 0.36, 1] as const

export default function BlogClient({ posts }: { posts: ApiBlogPostList[] }) {
  const { t, lang } = useLanguage()
  const [featured, ...rest] = posts

  return (
    <main className="flex min-h-screen flex-col bg-[#F4EFE3] text-[#343229]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <section className="flex w-full flex-col px-[32px] pb-[96px] pt-36">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex w-full items-end justify-between gap-[32px] max-md:flex-col max-md:items-start">
          <motion.h1
            className="text-[clamp(2.5rem,6vw,4.5rem)] leading-tight"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          >
            {t('blog.title')}
          </motion.h1>
          <motion.p
            className="max-w-[36rem] text-[18px] leading-loose md:text-[20px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
          >
            {t('blog.intro')}
          </motion.p>
        </div>

        {/* ── Posts ───────────────────────────────────────────────────────── */}
        {featured ? (
          <>
            <div className="mt-[64px]">
              <BlogCard post={featured} featured />
            </div>

            {rest.length > 0 && (
              <div className="mt-[96px] grid w-full grid-cols-1 gap-x-2 gap-y-[64px] sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post, i) => (
                  <BlogCard key={post.id} post={post} delay={(i % 3) * 0.15} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="mt-[64px] flex flex-col items-center justify-center gap-3 rounded-[25px] border border-dashed border-[#343229]/40 py-20 text-center">
            <ImageOff size={28} strokeWidth={1.3} />
            <p className="text-lg font-semibold">{t('blog.emptyTitle')}</p>
            <p className="max-w-sm text-sm font-light opacity-60">{t('blog.emptyBody')}</p>
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}
