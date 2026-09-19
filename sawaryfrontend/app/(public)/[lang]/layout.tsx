import "../../globals.css";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ConditionalHeader from "@/components/layout/ConditionalHeader";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SiteSettingsProvider } from "@/contexts/SiteSettingsContext";
import { zawi, ibmPlexArabic } from "@/lib/fonts";
import { LOCALES, isLocale, type Locale } from "@/lib/i18n";
import { jsonLdScript } from "@/lib/seo";
import { getContactSettings } from "@/lib/contact";

const SITE_URL = "https://www.sawarydecor.com";

const SITE = {
  ar: {
    name: "سواري للتصميم والتنفيذ",
    template: "%s — سواري للتصميم والتنفيذ",
    description:
      "سواري — شركة سعودية متخصصة في التصميم الداخلي والتنفيذ والتشطيب للمشاريع السكنية والتجارية، نمزج بين أصالة الهوية العربية وروح التصميم المعاصر.",
    ogLocale: "ar_SA",
  },
  en: {
    name: "Sawary Design & Execution",
    template: "%s — Sawary Design & Execution",
    description:
      "Sawary — a Saudi company specialized in interior design, execution, and finishing for residential and commercial projects, blending authentic Arab identity with a contemporary design spirit.",
    ogLocale: "en_US",
  },
} as const;

const KEYWORDS = [
  "سواري",
  "سواري للتصميم والتنفيذ",
  "سواري للديكور",
  "تصميم داخلي",
  "تصميم داخلي الرياض",
  "تصميم داخلي السعودية",
  "تنفيذ وتشطيب",
  "تشطيبات",
  "ديكور",
  "ديكور الرياض",
  "ديكور داخلي",
  "أثاث",
  "أثاث فاخر",
  "مفروشات",
  "تصميم منازل",
  "تصميم فلل",
  "تصميم شقق",
  "تصميم مكاتب",
  "مشاريع سكنية",
  "مشاريع تجارية",
  "تجديد منازل",
  "شركة تصميم داخلي الرياض",
  "الرياض",
  "المملكة العربية السعودية",
  "Sawary",
  "Sawary Design",
  "Sawary Decor",
  "Interior Design Saudi Arabia",
  "Interior Design Riyadh",
  "Interior Decoration Riyadh",
  "Home Design Riyadh",
  "Furniture Saudi Arabia",
  "Fit Out Saudi Arabia",
  "Home Renovation Riyadh",
];

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang: Locale = isLocale(rawLang) ? rawLang : "ar";
  const s = SITE[lang];

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: s.name,
      template: s.template,
    },
    description: s.description,
    keywords: KEYWORDS,
    authors: [{ name: "Sawary" }],
    creator: "Sawary",
    publisher: "Sawary",
    alternates: {
      canonical: lang === "ar" ? "/" : "/en",
      languages: {
        ar: "/",
        en: "/en",
      },
    },
    openGraph: {
      type: "website",
      locale: s.ogLocale,
      url: lang === "ar" ? SITE_URL : `${SITE_URL}/en`,
      siteName: s.name,
      title: s.name,
      description: s.description,
    },
    twitter: {
      card: "summary_large_image",
      title: s.name,
      description: s.description,
      images: [`${SITE_URL}/opengraph-image`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

function organizationJsonLd(lang: Locale, phone: string, email: string) {
  const s = SITE[lang];
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${SITE_URL}/#organization`,
    name: "سواري للتصميم والتنفيذ",
    alternateName: ["Sawary Design & Execution", "سواري", "Sawary Decor"],
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/icon`,
      width: 32,
      height: 32,
    },
    image: `${SITE_URL}/opengraph-image`,
    description: s.description,
    telephone: phone,
    email: email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "8694 شارع خالد بن الوليد - حي الروضة",
      addressLocality: "الرياض",
      addressRegion: "الرياض",
      addressCountry: "SA",
    },
    areaServed: [
      { "@type": "Country", name: "Saudi Arabia" },
      { "@type": "City", name: "الرياض" },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: phone,
      contactType: "customer service",
      areaServed: "SA",
      availableLanguage: ["Arabic", "English"],
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: lang === "ar" ? "خدمات سواري" : "Sawary Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: lang === "ar" ? "التصميم الداخلي" : "Interior Design",
            description:
              lang === "ar"
                ? "تصميم داخلي متكامل للمشاريع السكنية والتجارية"
                : "Comprehensive interior design for residential and commercial projects",
            url: `${SITE_URL}${lang === "ar" ? "" : "/en"}/services/design`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: lang === "ar" ? "التنفيذ والتشطيب" : "Execution & Finishing",
            description:
              lang === "ar"
                ? "تنفيذ هندسي دقيق وتشطيبات عالية الجودة"
                : "Precise engineering execution and high-quality finishing",
            url: `${SITE_URL}${lang === "ar" ? "" : "/en"}/services/execution`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: lang === "ar" ? "الأثاث والمفروشات" : "Furniture & Furnishings",
            description:
              lang === "ar"
                ? "توريد وتركيب الأثاث والمفروشات الفاخرة"
                : "Supply and installation of luxury furniture and furnishings",
            url: `${SITE_URL}${lang === "ar" ? "" : "/en"}/services`,
          },
        },
      ],
    },
    priceRange: "$$",
  };
}

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  if (!isLocale(rawLang)) notFound();
  const lang: Locale = rawLang;
  const dir = lang === "ar" ? "rtl" : "ltr";
  const contactSettings = await getContactSettings();

  return (
    <html
      lang={lang}
      dir={dir}
      className={`${zawi.variable} ${ibmPlexArabic.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdScript(
              organizationJsonLd(
                lang,
                contactSettings.phoneNumbers[0]?.number ?? "+966500175000",
                contactSettings.email,
              ),
            ),
          }}
        />
        <SiteSettingsProvider settings={contactSettings}>
          <LanguageProvider lang={lang}>
            <ConditionalHeader />
            {children}
            <WhatsAppButton />
          </LanguageProvider>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
