import type { Metadata } from 'next'
import { getProjectsByCategorySlug, type ApiProjectList } from '@/lib/projects'
import ResidentialClient from './ResidentialClient'
import { breadcrumbJsonLd, serviceJsonLd, jsonLdScript } from '@/lib/seo'
import { localizedHref, type Locale } from '@/lib/i18n'

const SITE_URL = 'https://www.sawarydecor.com'
const PATH = '/works/execution/residential'

const COPY = {
  ar: {
    title: 'مشاريع التنفيذ السكنية',
    description:
      'استعرض مشاريع سواري التنفيذية السكنية — فلل وشقق ومجمعات سكنية بتشطيبات أنيقة تعكس ذوق ساكنيها وجودة تنفيذ استثنائية.',
    ogDescription: 'فلل وشقق ومجمعات سكنية نفّذتها سواري بأناقة وإتقان.',
    keywords: ['تصميم فلل الرياض', 'تشطيب شقق السعودية', 'ديكور سكني', 'تصميم غرف نوم فاخرة', 'تصميم منازل الرياض', 'مشاريع سكنية منجزة'],
    breadcrumbs: [
      { name: 'الرئيسية', path: '/' },
      { name: 'أعمالنا', path: '/works' },
      { name: 'مشاريع التنفيذ السكنية', path: PATH },
    ],
    serviceName: 'تنفيذ المشاريع السكنية',
    serviceType: 'تنفيذ وتشطيب سكني',
  },
  en: {
    title: 'Residential Execution Projects',
    description:
      'Browse Sawary’s residential execution projects — villas, apartments, and residential complexes with elegant finishes reflecting their residents’ taste and exceptional execution quality.',
    ogDescription: 'Villas, apartments, and residential complexes executed by Sawary with elegance and precision.',
    keywords: ['villa design Riyadh', 'apartment finishing Saudi Arabia', 'residential decor', 'luxury bedroom design', 'home design Riyadh', 'completed residential projects'],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Works', path: '/works' },
      { name: 'Residential Execution Projects', path: PATH },
    ],
    serviceName: 'Residential Project Execution',
    serviceType: 'Residential Execution & Finishing',
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

export default async function ResidentialPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params
  const c = COPY[lang]
  const raw = await getProjectsByCategorySlug('residential')
  const projects = raw.map((p: ApiProjectList) => ({
    name: p.name,
    id: String(p.id),
    tag: p.category?.slug || p.category?.name || '',
    image: p.coverImageUrl || 'https://picsum.photos/seed/res1/600/400',
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
      <ResidentialClient projects={projects} />
    </>
  )
}
