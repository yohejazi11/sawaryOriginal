import HeroSection from '@/components/ui/HeroSection';
import HeroCTA from '@/components/sections/HeroCTA';
import ServicesSection from '@/components/sections/ServicesSection';
import Footer from '@/components/sections/Footer';
import { isLocale } from '@/lib/i18n';

const SITE_URL = 'https://www.sawarydecor.com';

const COPY = {
  ar: {
    description:
      'سواري — نَنحَت الفراغات بفنّيّة عالية لنقدّم تجارب بصرية تمزج أصالة الهوية العربية بروح التصميم المعاصر. تصميم داخلي وتنفيذ وتشطيب وأثاث للمشاريع السكنية والتجارية في الرياض والمملكة العربية السعودية.',
    ogDescription: 'منازل تشبه أحلامكم — تصميم داخلي وتنفيذ وتشطيب وأثاث احترافي من سواري.',
    ogAlt: 'سواري للتصميم والتنفيذ',
  },
  en: {
    description:
      'Sawary — we carve spaces with high artistry to deliver visual experiences that blend authentic Arab identity with a contemporary design spirit. Interior design, execution, finishing, and furniture for residential and commercial projects in Riyadh, Saudi Arabia.',
    ogDescription: 'Homes like your dreams — professional interior design, execution, finishing, and furniture from Sawary.',
    ogAlt: 'Sawary Design & Execution',
  },
};

export async function generateMetadata({ params }) {
  const { lang: rawLang } = await params;
  const lang = isLocale(rawLang) ? rawLang : 'ar';
  const c = COPY[lang];
  const path = lang === 'ar' ? '/' : '/en';

  return {
    description: c.description,
    alternates: {
      canonical: path,
      languages: { ar: '/', en: '/en', 'x-default': '/' },
    },
    openGraph: {
      description: c.ogDescription,
      url: `${SITE_URL}${path}`,
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: c.ogAlt }],
    },
  };
}

export default function Home() {
  return (
    <main className="flex flex-col flex-1">
      <HeroSection />
      <HeroCTA />
      <ServicesSection />
      <Footer />
    </main>
  );
}
