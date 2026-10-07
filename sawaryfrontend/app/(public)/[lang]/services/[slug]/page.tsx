import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ServiceDetailClient from './ServiceDetailClient'
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo'
import { localizedHref, type Locale } from '@/lib/i18n'
import { getServiceSections, localizeService } from '@/lib/services'

const SITE_URL = 'https://www.sawarydecor.com'

const CHROME = {
  ar: { home: 'الرئيسية', services: 'خدماتنا', ogLocale: 'ar_SA' },
  en: { home: 'Home', services: 'Services', ogLocale: 'en_US' },
} as const

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1).trimEnd()}…`
}

async function findSection(slug: string) {
  const sections = await getServiceSections()
  const index = sections.findIndex(s => s.slug === slug)
  return { sections, index, section: index >= 0 ? sections[index] : null }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale; slug: string }>
}): Promise<Metadata> {
  const { lang, slug } = await params
  const { section } = await findSection(slug)
  if (!section) return {}

  const { title, description } = localizeService(section, lang)
  const path = `/services/${slug}`
  const canonical = `${SITE_URL}${localizedHref(lang, path)}`
  const desc = truncate(description || title, 160)

  return {
    title,
    description: desc,
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
      description: desc,
      url: canonical,
      images: section.heroImageUrl ? [{ url: section.heroImageUrl, width: 1200, height: 630, alt: title }] : undefined,
      locale: CHROME[lang].ogLocale,
      type: 'website',
    },
  }
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ lang: Locale; slug: string }>
}) {
  const { lang, slug } = await params
  const { sections, index, section } = await findSection(slug)
  if (!section) notFound()

  const c = CHROME[lang]
  const breadcrumbs = breadcrumbJsonLd([
    { name: c.home, path: localizedHref(lang, '/') },
    { name: c.services, path: localizedHref(lang, '/services') },
    { name: localizeService(section, lang).title, path: localizedHref(lang, `/services/${slug}`) },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbs) }}
      />
      <ServiceDetailClient
        section={section}
        index={index}
        others={sections.filter(s => s.id !== section.id)}
      />
    </>
  )
}
