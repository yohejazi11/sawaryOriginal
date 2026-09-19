import type { Metadata } from 'next'
import AboutClient from './AboutClient'
import { faqJsonLd, jsonLdScript } from '@/lib/seo'
import { localizedHref, type Locale } from '@/lib/i18n'
import { getAboutContent } from '@/lib/about'

const SITE_URL = 'https://www.sawarydecor.com'
const PATH = '/about'

const COPY = {
  ar: {
    title: 'من نحن',
    description:
      'تعرّف على سواري — رؤيتنا، فريقنا، والأسئلة الشائعة. شركة متخصصة في التصميم الداخلي وتنفيذ المشاريع السكنية والتجارية من قلب المملكة العربية السعودية.',
    keywords: ['من نحن سواري', 'شركة تصميم داخلي الرياض', 'فريق سواري', 'رؤية سواري', 'خبرة تصميم', 'أسئلة شائعة ديكور'],
  },
  en: {
    title: 'About Us',
    description:
      'Get to know Sawary — our vision, our team, and frequently asked questions. A company specialized in interior design and executing residential and commercial projects from the heart of Saudi Arabia.',
    keywords: ['about Sawary', 'interior design company Riyadh', 'Sawary team', 'Sawary vision', 'design experience', 'decor FAQ'],
  },
} as const

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params
  const c = COPY[lang]
  const content = await getAboutContent()
  const ogDescription = lang === 'ar' ? content.heroStatementAr : content.heroStatementEn
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
      description: ogDescription,
      url: canonical,
      locale: lang === 'ar' ? 'ar_SA' : 'en_US',
      type: 'website',
    },
  }
}

export default async function AboutPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params
  const content = await getAboutContent()
  const faq = faqJsonLd(
    content.faqItems.map((item) => ({
      question: lang === 'ar' ? item.questionAr : item.questionEn,
      answer: lang === 'ar' ? item.answerAr : item.answerEn,
    })),
  )
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(faq) }}
      />
      <AboutClient content={content} />
    </>
  )
}
