import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getProjectById, getProjects, type ApiProjectList } from '@/lib/projects'
import ProjectPageClient from './ProjectPageClient'
import { breadcrumbJsonLd, jsonLdScript } from '@/lib/seo'
import { localizedHref, type Locale } from '@/lib/i18n'
import { getProjectDescription, getCoverImageAlt } from '@/lib/projectContent'

const SITE_URL = 'https://www.sawarydecor.com'

const CHROME = {
  ar: {
    keywords: ['سواري', 'تصميم داخلي الرياض', 'ديكور السعودية'],
    home: 'الرئيسية',
    works: 'أعمالنا',
    ogLocale: 'ar_SA',
  },
  en: {
    keywords: ['Sawary', 'Interior Design Riyadh', 'Decor Saudi Arabia'],
    home: 'Home',
    works: 'Works',
    ogLocale: 'en_US',
  },
} as const

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1).trimEnd()}…`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale; id: string }>
}): Promise<Metadata> {
  const { lang, id } = await params
  const numId = Number(id)
  if (isNaN(numId)) return {}

  const project = await getProjectById(numId)
  if (!project) return {}

  const c = CHROME[lang]
  const path = `/works/project/${id}`
  const canonical = `${SITE_URL}${localizedHref(lang, path)}`

  // project.name/description come from the CMS with no localized field —
  // they stay identical in both locales; only the surrounding chrome is bilingual.
  // getProjectDescription falls back to a truthful generic sentence (built only
  // from name/category/location) when the CMS description is empty.
  const title = project.name
  const description = truncate(getProjectDescription(project, lang), 160)

  return {
    title,
    description,
    keywords: [
      project.name,
      ...project.tags.map(tag => (lang === 'ar' ? tag.nameAr : tag.nameEn)),
      project.location ?? '',
      ...c.keywords,
    ].filter(Boolean),
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
      description,
      url: canonical,
      images: project.coverImage ? [{ url: project.coverImage, width: 1200, height: 630, alt: getCoverImageAlt(project) }] : undefined,
      locale: c.ogLocale,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: project.coverImage ? [project.coverImage] : undefined,
    },
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ lang: Locale; id: string }>
}) {
  const { lang, id } = await params
  const numId = Number(id)

  if (isNaN(numId)) notFound()

  const [project, allProjects] = await Promise.all([
    getProjectById(numId),
    getProjects(),
  ])

  if (!project) notFound()

  const index = allProjects.findIndex((p: ApiProjectList) => p.id === numId)

  const related = allProjects
    .filter((p: ApiProjectList) => p.id !== numId)
    .slice(0, 3)
    .map((p: ApiProjectList) => ({
      id: p.id,
      name: p.name,
      coverImageUrl: p.coverImageUrl,
      tags: (p.tags ?? []).map(tag => ({ nameAr: tag.nameAr, nameEn: tag.nameEn })),
      year: p.year,
    }))

  const projectJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.name,
    description: getProjectDescription(project, lang),
    image: [project.coverImage, ...project.images.map(i => i.src)].filter(Boolean),
    locationCreated: project.location ? { '@type': 'Place', name: project.location } : undefined,
    dateCreated: project.year,
    creator: {
      '@type': 'Organization',
      name: 'سواري للتصميم والتنفيذ',
      url: SITE_URL,
    },
  }

  const c = CHROME[lang]
  const breadcrumbs = breadcrumbJsonLd([
    { name: c.home, path: localizedHref(lang, '/') },
    { name: c.works, path: localizedHref(lang, '/works') },
    { name: project.name, path: localizedHref(lang, `/works/project/${id}`) },
  ])

  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-bg" />}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript([projectJsonLd, breadcrumbs]) }}
      />
      <ProjectPageClient
        project={project}
        index={Math.max(0, index)}
        related={related}
      />
    </Suspense>
  )
}
