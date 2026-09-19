import type { MetadataRoute } from 'next'
import { getProjects } from '@/lib/projects'
import { localizedHref } from '@/lib/i18n'

const SITE_URL = 'https://www.sawarydecor.com'

const ROUTES: { path: string; changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>; priority: number }[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.6 },
  { path: '/services', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/services/design', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/services/execution', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/services/catalog', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/works', changeFrequency: 'weekly', priority: 0.9 },
]

function entry(
  path: string,
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>,
  priority: number,
  now: Date,
): MetadataRoute.Sitemap {
  const ar = `${SITE_URL}${path}`
  const en = `${SITE_URL}${localizedHref('en', path)}`
  const languages = { ar, en }
  return [
    { url: ar, changeFrequency, priority, lastModified: now, alternates: { languages } },
    { url: en, changeFrequency, priority, lastModified: now, alternates: { languages } },
  ]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticEntries = ROUTES.flatMap((r) => entry(r.path, r.changeFrequency, r.priority, now))

  const projects = await getProjects()
  const projectEntries = projects.flatMap((p) =>
    entry(`/works/project/${p.id}`, 'monthly', 0.65, now)
  )

  return [...staticEntries, ...projectEntries]
}
