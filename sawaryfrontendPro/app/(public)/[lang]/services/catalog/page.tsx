import type { Metadata } from 'next'
import CatalogClient from './CatalogClient'
import { getServiceSections } from '@/lib/services'
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo'
import { localizedHref, type Locale } from '@/lib/i18n'

const SITE_URL = 'https://www.sawarydecor.com'
const PATH = '/services/catalog'

const COPY = {
  ar: {
    title: 'جميع الخدمات',
    description: 'استكشف جميع أقسام خدمات سواري بالتفصيل، من التصميم الداخلي إلى التنفيذ والتشطيب والأثاث والمفروشات.',
    ogDescription: 'استكشف جميع أقسام خدمات سواري بالتفصيل.',
    keywords: ['كتالوج خدمات سواري', 'أقسام سواري', 'تصميم وتنفيذ وأثاث', 'خدمات ديكور شاملة الرياض'],
    breadcrumbs: [
      { name: 'الرئيسية', path: '/' },
      { name: 'خدماتنا', path: '/services' },
      { name: 'جميع الخدمات', path: PATH },
    ],
  },
  en: {
    title: 'All Services',
    description: 'Explore all of Sawary’s service sections in detail, from interior design to execution, finishing, and furniture.',
    ogDescription: 'Explore all of Sawary’s service sections in detail.',
    keywords: ['Sawary service catalog', 'Sawary sections', 'design execution and furniture', 'full-service decor Riyadh'],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
      { name: 'All Services', path: PATH },
    ],
  },
} as const

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params
  const c = COPY[lang]
  const canonical = `${SITE_URL}${localizedHref(lang, PATH)}`
  return {
    title: c.title,
    description: c.description,
    keywords: [...c.keywords],
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
      description: c.ogDescription,
      url: canonical,
      locale: lang === 'ar' ? 'ar_SA' : 'en_US',
      type: 'website',
    },
  }
}

export default async function ServicesCatalogPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params
  const c = COPY[lang]
  const sections = await getServiceSections()
  const breadcrumbs = breadcrumbJsonLd(
    c.breadcrumbs.map(({ name, path }) => ({ name, path: localizedHref(lang, path) }))
  )
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbs) }}
      />
      <CatalogClient sections={sections} />
    </>
  )
}
