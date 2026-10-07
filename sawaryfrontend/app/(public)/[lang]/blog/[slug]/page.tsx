import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import BlogPostClient from './BlogPostClient'
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo'
import { localizedHref, type Locale } from '@/lib/i18n'
import { getBlogPost, getBlogPosts, localizePost } from '@/lib/blog'

const SITE_URL = 'https://www.sawarydecor.com'

const CHROME = {
  ar: { home: 'الرئيسية', blog: 'المدونة', ogLocale: 'ar_SA' },
  en: { home: 'Home', blog: 'Blog', ogLocale: 'en_US' },
} as const

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1).trimEnd()}…`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale; slug: string }>
}): Promise<Metadata> {
  const { lang, slug } = await params
  const post = await getBlogPost(slug)
  if (!post) return {}

  const { title, excerpt, content } = localizePost(post, lang)
  const path = `/blog/${slug}`
  const canonical = `${SITE_URL}${localizedHref(lang, path)}`
  const description = truncate((excerpt || content).replace(/\s+/g, ' '), 160)
  const images = post.coverImageUrl ? [{ url: post.coverImageUrl, alt: title }] : undefined

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ar: `${SITE_URL}${path}`,
        en: `${SITE_URL}${localizedHref('en', path)}`,
        'x-default': `${SITE_URL}${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      images,
      locale: CHROME[lang].ogLocale,
      type: 'article',
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ lang: Locale; slug: string }>
}) {
  const { lang, slug } = await params
  const [post, all] = await Promise.all([getBlogPost(slug), getBlogPosts()])
  if (!post) notFound()

  const { title, excerpt } = localizePost(post, lang)
  const c = CHROME[lang]

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: excerpt || undefined,
    image: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.updatedAt,
    inLanguage: lang,
    mainEntityOfPage: `${SITE_URL}${localizedHref(lang, `/blog/${slug}`)}`,
    author: { '@type': 'Organization', name: 'سواري للتصميم والتنفيذ', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'سواري للتصميم والتنفيذ', url: SITE_URL },
  }
  const breadcrumbs = breadcrumbJsonLd([
    { name: c.home, path: localizedHref(lang, '/') },
    { name: c.blog, path: localizedHref(lang, '/blog') },
    { name: title, path: localizedHref(lang, `/blog/${slug}`) },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript([articleJsonLd, breadcrumbs]) }}
      />
      <BlogPostClient post={post} more={all.filter(p => p.id !== post.id).slice(0, 3)} />
    </>
  )
}
