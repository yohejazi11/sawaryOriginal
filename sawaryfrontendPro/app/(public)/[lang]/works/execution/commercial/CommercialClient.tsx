'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ImageOff } from 'lucide-react'
import Footer from '@/components/sections/Footer'
import { useLanguage } from '@/contexts/LanguageContext'
import { translateCategory } from '@/lib/categoryLabels'
import { localizedHref } from '@/lib/i18n'

interface ProjectCard {
  name: string
  id: string
  tag: string
  image: string
}

export default function CommercialClient({ projects }: { projects: ProjectCard[] }) {
  const { t, lang } = useLanguage()

  return (
    <main className="min-h-screen bg-brand-bg" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

      <div className="px-8 pt-28 pb-6 md:px-20">
        <Link href={localizedHref(lang, '/works')} className="inline-flex items-center gap-2 text-sm text-brand-cream/45 transition-colors hover:text-brand-primary">
          <ArrowRight size={14} />
          {t('worksPage.backToWorks')}
        </Link>
      </div>

      <header className="px-8 pb-16 md:px-20">
        <span className="mb-3 block text-sm font-light tracking-[0.3em] text-brand-primary uppercase">
          {t('homeServices.execution.title')}
        </span>
        <h1 className="font-display text-5xl font-bold text-brand-cream md:text-7xl">
          {t('servicesExecution.specialties.commercial.title')}
        </h1>
        <div className="mt-7 h-px bg-brand-primary/25" />
      </header>

      <section className="px-4 pb-20 md:px-8">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-brand-primary/25 py-20 text-center">
            <ImageOff size={28} strokeWidth={1.3} className="text-brand-primary" />
            <p className="text-lg font-semibold text-brand-cream">
              {t('worksPage.noProjectsTitle')}
            </p>
            <p className="max-w-sm text-sm font-light text-brand-cream/50">
              {t('worksPage.noProjectsBody')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {projects.map(({ name, id, tag, image }) => {
              const card = (
                <div className="rounded-card group relative aspect-[3/2] cursor-pointer overflow-hidden">
                  <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(40,41,37,0.6)] via-transparent to-transparent" />
                  <div className="pointer-events-none absolute inset-0 bg-black/20" />
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center">
                    <span
                      className="font-display text-xl font-bold text-brand-cream"
                      style={{ textShadow: '0 2px 16px rgba(0,0,0,0.75), 0 1px 3px rgba(0,0,0,0.6)' }}
                    >
                      {name}
                    </span>
                  </div>
                  <span className="absolute right-4 top-4 rounded-full bg-brand-primary/85 px-3 py-1 text-sm font-medium text-brand-charcoal backdrop-blur-sm">
                    {translateCategory(t, tag)}
                  </span>
                </div>
              )

              return id
                ? <Link key={id} href={localizedHref(lang, `/works/project/${id}`)}>{card}</Link>
                : <div key={name}>{card}</div>
            })}
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}
