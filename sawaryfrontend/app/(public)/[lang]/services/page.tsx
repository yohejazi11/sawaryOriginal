import type { Metadata } from 'next'
import ServicesClient from './ServicesClient'
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo'
import { localizedHref, type Locale } from '@/lib/i18n'

const SITE_URL = 'https://www.sawarydecor.com'
const PATH = '/services'

const COPY = {
  ar: {
    title: 'خدماتنا',
    description:
      'اكتشف خدمات سواري في التصميم الداخلي والتنفيذ والتشطيب والأثاث. خبرة تزيد على 12 عاماً في خلق مساحات استثنائية في المملكة العربية السعودية.',
    ogDescription: 'تصميم داخلي وتنفيذ احترافي — سواري تحوّل مساحتك إلى تحفة.',
    keywords: ['خدمات تصميم داخلي', 'تشطيبات الرياض', 'أثاث ومفروشات', 'تنفيذ مشاريع الرياض', 'ديكور سكني وتجاري', 'خدمات سواري'],
    breadcrumbs: [
      { name: 'الرئيسية', path: '/' },
      { name: 'خدماتنا', path: PATH },
    ],
  },
  en: {
    title: 'Our Services',
    description:
      'Discover Sawary’s services in interior design, execution, finishing, and furniture. Over 12 years of experience creating exceptional spaces across Saudi Arabia.',
    ogDescription: 'Professional interior design and execution — Sawary turns your space into a masterpiece.',
    keywords: ['interior design services', 'Riyadh finishing', 'furniture and furnishings', 'Riyadh project execution', 'residential and commercial decor', 'Sawary services'],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Services', path: PATH },
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

export default async function ServicesPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params
  const c = COPY[lang]
  const breadcrumbs = breadcrumbJsonLd(
    c.breadcrumbs.map(({ name, path }) => ({ name, path: localizedHref(lang, path) }))
  )
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbs) }}
      />
      <ServicesClient />
    </>
  )
}
