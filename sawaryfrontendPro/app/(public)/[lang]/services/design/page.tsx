import type { Metadata } from 'next'
import { getProjectsByCategorySlug } from '@/lib/projects'
import DesignServiceClient from './DesignServiceClient'
import { breadcrumbJsonLd, serviceJsonLd, jsonLdScript } from '@/lib/seo'
import { localizedHref, type Locale } from '@/lib/i18n'

const SITE_URL = 'https://www.sawarydecor.com'
const PATH = '/services/design'

const COPY = {
  ar: {
    title: 'خدمة التصميم الداخلي',
    description:
      'نصمم مساحات تعكس شخصيتك وترتقي بأسلوب حياتك. تصميم داخلي متكامل، نمذجة ثلاثية الأبعاد، واختيار المواد من سواري للتصميم والتنفيذ.',
    ogDescription: 'تصميم داخلي راقٍ من خبراء سواري — من الفكرة إلى التسليم.',
    ogAlt: 'سواري — التصميم الداخلي',
    keywords: ['تصميم داخلي متكامل', 'تصميم 3D الرياض', 'تصميم غرف نوم', 'تصميم صالات', 'تصميم مطابخ', 'مصمم داخلي الرياض', 'تصميم فلل وشقق السعودية'],
    breadcrumbs: [
      { name: 'الرئيسية', path: '/' },
      { name: 'خدماتنا', path: '/services' },
      { name: 'التصميم الداخلي', path: PATH },
    ],
    serviceName: 'التصميم الداخلي',
    serviceType: 'تصميم داخلي',
  },
  en: {
    title: 'Interior Design Services',
    description:
      'We design spaces that reflect your personality and elevate your lifestyle. Comprehensive interior design, 3D modeling, and material selection from Sawary Design & Execution.',
    ogDescription: 'Refined interior design from Sawary’s experts — from concept to delivery.',
    ogAlt: 'Sawary — Interior Design',
    keywords: ['comprehensive interior design', '3D design Riyadh', 'bedroom design', 'living room design', 'kitchen design', 'interior designer Riyadh', 'villa and apartment design Saudi Arabia'],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
      { name: 'Interior Design', path: PATH },
    ],
    serviceName: 'Interior Design',
    serviceType: 'Interior Design',
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
      images: [{ url: '/images/services/design.avif', width: 1200, height: 630, alt: c.ogAlt }],
      locale: lang === 'ar' ? 'ar_SA' : 'en_US',
      type: 'website',
    },
  }
}

export default async function DesignServicePage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params
  const c = COPY[lang]
  const projects = await getProjectsByCategorySlug('design')

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
      <DesignServiceClient initialProjects={projects} />
    </>
  )
}
