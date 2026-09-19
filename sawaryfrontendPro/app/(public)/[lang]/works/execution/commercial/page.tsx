import type { Metadata } from 'next'
import { getProjectsByCategorySlug, type ApiProjectList } from '@/lib/projects'
import CommercialClient from './CommercialClient'
import { breadcrumbJsonLd, serviceJsonLd, jsonLdScript } from '@/lib/seo'
import { localizedHref, type Locale } from '@/lib/i18n'

const SITE_URL = 'https://www.sawarydecor.com'
const PATH = '/works/execution/commercial'

const COPY = {
  ar: {
    title: 'مشاريع التنفيذ التجارية',
    description:
      'استعرض مشاريع سواري التنفيذية التجارية — مكاتب، فنادق، مراكز تسوق ومجمعات تجارية بإشراف هندسي متكامل وجودة تنفيذ عالية.',
    ogDescription: 'مكاتب وفنادق ومراكز تجارية نفّذتها سواري بدقة هندسية عالية.',
    keywords: ['تصميم مكاتب الرياض', 'ديكور تجاري السعودية', 'تشطيب فنادق', 'تنفيذ مراكز تجارية', 'ديكور محلات', 'مشاريع تجارية الرياض'],
    breadcrumbs: [
      { name: 'الرئيسية', path: '/' },
      { name: 'أعمالنا', path: '/works' },
      { name: 'مشاريع التنفيذ التجارية', path: PATH },
    ],
    serviceName: 'تنفيذ المشاريع التجارية',
    serviceType: 'تنفيذ وتشطيب تجاري',
  },
  en: {
    title: 'Commercial Execution Projects',
    description:
      'Browse Sawary’s commercial execution projects — offices, hotels, shopping centers, and commercial complexes with integrated engineering supervision and high execution quality.',
    ogDescription: 'Offices, hotels, and commercial centers executed by Sawary with high engineering precision.',
    keywords: ['office design Riyadh', 'commercial decor Saudi Arabia', 'hotel finishing', 'commercial center execution', 'shop decor', 'Riyadh commercial projects'],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Works', path: '/works' },
      { name: 'Commercial Execution Projects', path: PATH },
    ],
    serviceName: 'Commercial Project Execution',
    serviceType: 'Commercial Execution & Finishing',
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

export default async function CommercialPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params
  const c = COPY[lang]
  const raw = await getProjectsByCategorySlug('commercial')
  const projects = raw.map((p: ApiProjectList) => ({
    name: p.name,
    id: String(p.id),
    tag: p.category?.slug || p.category?.name || '',
    image: p.coverImageUrl || 'https://picsum.photos/seed/com1/600/400',
  }))

  const jsonLd = [
    breadcrumbJsonLd(c.breadcrumbs.map(({ name, path }) => ({ name, path: localizedHref(lang, path) }))),
    serviceJsonLd({
      name: c.serviceName,
      serviceType: c.serviceType,
      description: c.description,
      path: localizedHref(lang, PATH),
    }),
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <CommercialClient projects={projects} />
    </>
  )
}
