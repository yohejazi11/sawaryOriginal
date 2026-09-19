import type { Metadata } from 'next'
import WorksClient from './WorksClient'
import { getProjects } from '@/lib/projects'
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo'
import { localizedHref, type Locale } from '@/lib/i18n'

const SITE_URL = 'https://www.sawarydecor.com'
const PATH = '/works'

const COPY = {
  ar: {
    title: 'أعمالنا',
    description:
      'استعرض معرض أعمال سواري — مشاريع تصميم وتنفيذ سكنية وتجارية منجزة في الرياض والمملكة العربية السعودية بأعلى معايير الجودة والإبداع.',
    ogDescription: 'مشاريع تصميم وتنفيذ سكنية وتجارية تعكس هوية سواري وإتقانها.',
    keywords: ['معرض أعمال تصميم الرياض', 'مشاريع ديكور سعودية', 'تصميم فلل منجزة', 'مشاريع مكاتب الرياض', 'أعمال سواري', 'portfolio تصميم داخلي'],
    breadcrumbs: [
      { name: 'الرئيسية', path: '/' },
      { name: 'أعمالنا', path: PATH },
    ],
  },
  en: {
    title: 'Our Works',
    description:
      'Browse Sawary’s portfolio — completed residential and commercial design and execution projects in Riyadh and across Saudi Arabia, built to the highest standards of quality and creativity.',
    ogDescription: 'Residential and commercial design and execution projects reflecting Sawary’s identity and craftsmanship.',
    keywords: ['design portfolio Riyadh', 'Saudi decor projects', 'completed villa design', 'Riyadh office projects', 'Sawary works', 'interior design portfolio'],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Works', path: PATH },
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

export default async function WorksPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params
  const c = COPY[lang]
  const breadcrumbs = breadcrumbJsonLd(
    c.breadcrumbs.map(({ name, path }) => ({ name, path: localizedHref(lang, path) }))
  )
  const projects = await getProjects()
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbs) }}
      />
      <WorksClient initialProjects={projects} />
    </>
  )
}
