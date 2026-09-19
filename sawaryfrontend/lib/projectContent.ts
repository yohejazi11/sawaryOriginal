import type { Project } from '@/lib/projects'
import { translateCategoryServer } from '@/lib/categoryLabels'
import type { Locale } from '@/lib/i18n'

const SITE_NAME = {
  ar: 'سواري للتصميم والتنفيذ',
  en: 'Sawary Design & Execution',
} as const

/**
 * Real project descriptions are frequently empty in the CMS. When that happens,
 * fall back to a short, truthful sentence built only from fields the API actually
 * returns (name, category, location) — never invented details like room type,
 * materials, or architectural style.
 */
export function getProjectDescription(project: Project, lang: Locale): string {
  const trimmed = project.description?.trim()
  if (trimmed) return trimmed

  const category = translateCategoryServer(lang, project.categorySlug || project.category)
  const site = SITE_NAME[lang]

  if (lang === 'ar') {
    return category
      ? `${project.name} — مشروع ${category}${project.location ? ` في ${project.location}` : ''} من تنفيذ ${site}.`
      : `${project.name} — مشروع من تنفيذ ${site}.`
  }

  return category
    ? `${project.name} — a ${category} project${project.location ? ` in ${project.location}` : ''} by ${site}.`
    : `${project.name} — a project by ${site}.`
}

/** Alt text for the single cover/hero image — uses only confirmed real fields (name, location). */
export function getCoverImageAlt(project: Project): string {
  return project.location ? `${project.name} — ${project.location}` : project.name
}

/**
 * Alt text for undifferentiated gallery/lightbox photos. The API stores no
 * per-image metadata (no room, angle, or caption), so every photo in a project
 * gets the same truthful generic phrase, disambiguated by position — never a
 * fabricated room name or location.
 */
export function getGalleryImageAlt(project: Project, lang: Locale, position: number, total: number): string {
  const category = translateCategoryServer(lang, project.categorySlug || project.category)

  const base = lang === 'ar'
    ? (category ? `منظر داخلي لمشروع ${category} من تنفيذ سواري` : 'منظر داخلي لمشروع من تنفيذ سواري')
    : (category ? `Interior view of a ${category} project by Sawary` : 'Interior view of a project by Sawary')

  const suffix = lang === 'ar' ? `— صورة ${position} من ${total}` : `— image ${position} of ${total}`

  return `${base} ${suffix}`
}
