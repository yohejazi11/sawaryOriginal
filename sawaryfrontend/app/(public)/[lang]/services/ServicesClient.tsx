'use client'

import Link from 'next/link'
import Image from 'next/image'
import Footer from '@/components/sections/Footer'
import { useLanguage } from '@/contexts/LanguageContext'
import { localizedHref } from '@/lib/i18n'

export default function ServicesClient() {
  const { t, lang } = useLanguage()

  const SERVICES = [
    {
      number: '01',
      title: t('homeServices.design.title'),
      subtitle: t('servicesPage.design.subtitle'),
      href: '/services/design',
      image: '/images/services/design.avif',
    },
    {
      number: '02',
      title: t('homeServices.execution.title'),
      subtitle: t('servicesPage.execution.subtitle'),
      href: '/services/execution',
      image: '/images/services/implement.avif',
    },
  ]

  return (
    <main className="min-h-screen bg-brand-bg" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <header className="flex flex-col items-center justify-center px-8 pb-16 pt-36 md:px-20">
        <span className="mb-4 block text-sm font-light tracking-[0.4em] text-brand-primary uppercase">
          {t('servicesPage.eyebrow')}
        </span>
        <h1
          className="font-display text-center font-bold text-brand-cream"
          style={{ fontSize: 'clamp(3rem, 9vw, 7rem)' }}
        >
          {t('servicesPage.title')}
        </h1>
        <div className="mt-8 h-px w-24 bg-brand-primary/35" />
      </header>

      {/* ── Catalog link ─────────────────────────────────────────────────── */}
      <div className="flex justify-center pb-16">
        <Link
          href={localizedHref(lang, '/services/catalog')}
          className="inline-flex items-center gap-3 rounded-full border border-brand-primary/60 px-8 py-3.5 text-sm font-medium text-brand-primary transition-all duration-300 hover:border-brand-primary hover:bg-brand-primary hover:text-white"
        >
          {t('servicesCatalog.title')}
        </Link>
      </div>

      {/* ── Service panels ────────────────────────────────────────────────── */}
      <section className="flex flex-col lg:flex-row">
        {SERVICES.map(({ number, title, subtitle, href, image }, i) => (
          <Link
            key={href}
            href={localizedHref(lang, href)}
            className="group relative min-h-[480px] flex-1 overflow-hidden"
          >
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority={i === 0}
            />
            <div className="absolute inset-0 bg-[rgba(30,30,26,0.70)] transition-colors duration-500 group-hover:bg-[rgba(30,30,26,0.50)]" />

            <div className="absolute inset-0 flex flex-col justify-between p-10 transition-transform duration-500 group-hover:-translate-y-1.5 lg:p-14">
              <span
                aria-hidden
                className="block select-none leading-none"
                style={{
                  fontSize: 'clamp(4rem, 8vw, 6rem)',
                  fontWeight: 900,
                  WebkitTextStroke: '1px rgb(190, 156, 100)',
                  color: 'transparent',
                  letterSpacing: '-0.04em',
                }}
              >
                {number}
              </span>
              <div>
                <div className="mb-4 h-px w-10 bg-brand-primary" />
                <h2
                  className="font-display mb-3 font-bold text-white"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
                >
                  {title}
                </h2>
                <p className="text-base text-brand-cream/60">{subtitle}</p>
              </div>
            </div>
          </Link>
        ))}
      </section>

      <Footer />
    </main>
  )
}
