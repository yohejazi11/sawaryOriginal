import type { Metadata } from 'next'
import BlogClient from './BlogClient'
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo'
import { localizedHref, type Locale } from '@/lib/i18n'
import { getBlogPosts } from '@/lib/blog'

const SITE_URL = 'https://www.sawarydecor.com'
const PATH = '/blog'

const COPY = {
  ar: {
    title: 'المدونة',
    description: 'مقالات سواري في التصميم الداخلي والتنفيذ والتشطيب والأثاث — أفكار ونصائح وإلهام لمساحتك.',
    breadcrumbs: [
      { name: 'الرئيسية', path: '/' },
      { name: 'المدونة', path: PATH },
    ],
    ogLocale: 'ar_SA',
  },
  en: {
    title: 'Blog',
    description: 'Sawary articles on interior design, execution, finishing and furniture — ideas, tips and inspiration for your space.',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Blog', path: PATH },
    ],
    ogLocale: 'en_US',
  },
} as const

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params
  const c = COPY[lang]
  const canonical = `${SITE_URL}${localizedHref(lang, PATH)}`
  return {
    title: c.title,
    description: c.description,
    alternates: {
      canonical,
      languages: {
        ar: `${SITE_URL}${PATH}`,
        en: `${SITE_URL}${localizedHref('en', PATH)}`,
        'x-default': `${SITE_URL}${PATH}`,
      },
    },
    openGraph: {
      title: c.title,
      description: c.description,
      url: canonical,
      locale: c.ogLocale,
      type: 'website',
    },
  }
}

export default async function BlogPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params
  const c = COPY[lang]
  const posts = await getBlogPosts()
  const breadcrumbs = breadcrumbJsonLd(
    c.breadcrumbs.map(({ name, path }) => ({ name, path: localizedHref(lang, path) }))
  )
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbs) }}
      />
      <BlogClient posts={posts} />
    </>
  )
}
