import type { Metadata } from 'next'
import { getProjectsByCategorySlug } from '@/lib/projects'
import ExecutionServiceClient from './ExecutionServiceClient'
import { breadcrumbJsonLd, serviceJsonLd, jsonLdScript } from '@/lib/seo'
import { localizedHref, type Locale } from '@/lib/i18n'

const SITE_URL = 'https://www.sawarydecor.com'
const PATH = '/services/execution'

const COPY = {
  ar: {
    title: 'خدمة التنفيذ والتشطيب',
    description:
      'تنفيذ دقيق تحت إشراف هندسي متكامل لمشاريع سكنية وتجارية. سواري تحوّل مخططات التصميم إلى واقع ملموس بجودة استثنائية.',
    ogDescription: 'تنفيذ هندسي احترافي من خبراء سواري — من الأساس حتى التسليم.',
    ogAlt: 'سواري — التنفيذ والتشطيب',
    keywords: ['تنفيذ تشطيب الرياض', 'مقاول تشطيبات السعودية', 'تشطيب فلل', 'تشطيب شقق', 'إشراف هندسي', 'بناء وتشطيب الرياض', 'تجديد منازل السعودية'],
    breadcrumbs: [
      { name: 'الرئيسية', path: '/' },
      { name: 'خدماتنا', path: '/services' },
      { name: 'التنفيذ والتشطيب', path: PATH },
    ],
    serviceName: 'التنفيذ والتشطيب',
    serviceType: 'تنفيذ وتشطيب',
  },
  en: {
    title: 'Execution & Finishing Services',
    description:
      'Precise execution under integrated engineering supervision for residential and commercial projects. Sawary turns design plans into tangible reality with exceptional quality.',
    ogDescription: 'Professional engineering execution from Sawary’s experts — from foundation to handover.',
    ogAlt: 'Sawary — Execution & Finishing',
    keywords: ['finishing execution Riyadh', 'finishing contractor Saudi Arabia', 'villa finishing', 'apartment finishing', 'engineering supervision', 'construction and finishing Riyadh', 'home renovation Saudi Arabia'],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
      { name: 'Execution & Finishing', path: PATH },
    ],
    serviceName: 'Execution & Finishing',
    serviceType: 'Execution & Finishing',
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
      images: [{ url: '/images/services/implement.avif', width: 1200, height: 630, alt: c.ogAlt }],
      locale: lang === 'ar' ? 'ar_SA' : 'en_US',
      type: 'website',
    },
  }
}

export default async function ExecutionServicePage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params
  const c = COPY[lang]
  const [commercial, residential] = await Promise.all([
    getProjectsByCategorySlug('commercial'),
    getProjectsByCategorySlug('residential'),
  ])
  const projects = [...commercial, ...residential]

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
      <ExecutionServiceClient initialProjects={projects} />
    </>
  )
}
