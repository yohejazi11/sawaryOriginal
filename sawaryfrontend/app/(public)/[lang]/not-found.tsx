'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { localizedHref } from '@/lib/i18n'

export default function NotFound() {
  const { t, lang } = useLanguage()
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center bg-brand-bg px-8"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <span
        className="select-none font-bold leading-none"
        style={{
          fontSize: 'clamp(7rem, 20vw, 14rem)',
          fontWeight: 900,
          WebkitTextStroke: '2px rgb(190, 156, 100)',
          color: 'transparent',
          letterSpacing: '-0.04em',
        }}
        aria-hidden
      >
        {t('notFound.code')}
      </span>

      <h1 className="mb-4 text-2xl font-bold text-brand-cream">
        {t('notFound.title')}
      </h1>
      <p className="mb-10 text-center text-base text-brand-cream/55">
        {t('notFound.body')}
      </p>

      <Link
        href={localizedHref(lang, '/')}
        className="rounded-full bg-brand-primary px-9 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        {t('notFound.backHome')}
      </Link>
    </main>
  )
}
