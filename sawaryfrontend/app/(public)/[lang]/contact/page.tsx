import type { Metadata } from 'next'
import ContactClient from './ContactClient'
import { localizedHref, type Locale } from '@/lib/i18n'

const SITE_URL = 'https://www.sawarydecor.com'
const PATH = '/contact'

const COPY = {
  ar: {
    title: 'تواصل معنا',
    description:
      'تواصل مع سواري للتصميم والتنفيذ — اتصل بنا، راسلنا عبر واتساب أو البريد الإلكتروني، أو زرنا في مقرنا بالرياض. نسعد بمساعدتك في كل تفاصيل التصميم والتنفيذ.',
    ogDescription: 'احجز استشارتك المجانية وتواصل مع فريق سواري للتصميم والتنفيذ.',
    keywords: ['تواصل سواري', 'رقم سواري', 'استشارة مجانية تصميم', 'شركة ديكور الرياض تواصل', 'بريد سواري', 'موقع سواري الرياض'],
  },
  en: {
    title: 'Contact Us',
    description:
      'Get in touch with Sawary Design & Execution — call us, message us on WhatsApp or email, or visit us at our Riyadh office. We are happy to help with every detail of your design and execution project.',
    ogDescription: 'Book your free consultation and get in touch with the Sawary design and execution team.',
    keywords: ['contact Sawary', 'Sawary phone number', 'free design consultation', 'Riyadh decor company contact', 'Sawary email', 'Sawary Riyadh location'],
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

export default function ContactPage() {
  return <ContactClient />
}
