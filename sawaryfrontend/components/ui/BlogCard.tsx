'use client'

import Link from 'next/link'
import { MdArrowOutward } from 'react-icons/md'
import GalleryImage from '@/components/ui/GalleryImage'
import Reveal from '@/components/ui/Reveal'
import { useLanguage } from '@/contexts/LanguageContext'
import { localizedHref } from '@/lib/i18n'
import { formatPostDate, localizePost, type ApiBlogPostList } from '@/lib/blog'

// A /blog tile in the home gallery's style: rounded bordered cover photo with a curtain
// reveal and arrow badge, then date, title and excerpt below (never over) the photo.
// `featured` lays the first post out wide — photo beside the text on desktop.
export default function BlogCard({
  post,
  delay = 0,
  featured = false,
}: {
  post: ApiBlogPostList
  delay?: number
  featured?: boolean
}) {
  const { t, lang } = useLanguage()
  const { title, excerpt } = localizePost(post, lang)
  const date = formatPostDate(post.publishedAt, lang)

  return (
    <Reveal variant="curtain" delay={delay} duration={1.1} className="h-full w-full">
      <Link
        href={localizedHref(lang, `/blog/${post.slug}`)}
        className={`group flex h-full w-full gap-6 text-[#343229] ${featured ? 'flex-col lg:flex-row lg:items-center lg:gap-12' : 'flex-col'}`}
      >
        <div
          className={`relative w-full shrink-0 overflow-hidden rounded-[25px] border border-[#343229] ${
            featured ? 'h-[420px] lg:h-[520px] lg:w-[60%]' : 'h-[300px]'
          }`}
        >
          {post.coverImageUrl && (
            <GalleryImage
              src={post.coverImageUrl}
              alt={title}
              sizes={featured ? '(max-width: 1023px) 100vw, 60vw' : '(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw'}
              className="rounded-[25px] group-hover:scale-105"
            />
          )}
          <span className="absolute bottom-[18px] left-[18px] z-10 flex h-14 w-14 items-center justify-center rounded-full bg-[#F4EFE3] text-[24px] text-[#343229] opacity-75 shadow-lg transition-transform duration-200 group-hover:scale-110">
            <MdArrowOutward />
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {date && <span className="text-[14px] opacity-60">{date}</span>}
          <h2 className={`leading-snug ${featured ? 'text-[clamp(1.75rem,3.5vw,3rem)]' : 'line-clamp-2 text-[22px] md:text-[24px]'}`}>
            {title}
          </h2>
          {excerpt && (
            <p className={`leading-loose opacity-75 ${featured ? 'text-[18px] md:text-[20px]' : 'line-clamp-3 text-[16px]'}`}>
              {excerpt}
            </p>
          )}
          {featured && (
            <span className="mt-4 block w-fit rounded-[15px] border border-[#343229] px-[46px] py-2 transition-all duration-300 group-hover:bg-[#343229] group-hover:text-[#F4EFE3]">
              {t('blog.readMore')}
            </span>
          )}
        </div>
      </Link>
    </Reveal>
  )
}
