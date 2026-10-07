import type { MetadataRoute } from 'next'
import { getProjects } from '@/lib/projects'
import { getServiceSections } from '@/lib/services'
import { getBlogPosts } from '@/lib/blog'
import { localizedHref } from '@/lib/i18n'

const SITE_URL = 'https://www.sawarydecor.com'

const ROUTES: { path: string; changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>; priority: number }[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.6 },
  { path: '/services', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/services/design', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/services/execution', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/works', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/blog', changeFrequency: 'weekly', priority: 0.8 },
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

  const [projects, serviceSections, posts] = await Promise.all([getProjects(), getServiceSections(), getBlogPosts()])
  const projectEntries = projects.flatMap((p) =>
    entry(`/works/project/${p.id}`, 'monthly', 0.65, now)
  )

  const staticPaths = new Set(ROUTES.map((r) => r.path))
  const serviceEntries = serviceSections
    .map((s) => `/services/${s.slug}`)
    .filter((path) => !staticPaths.has(path))
    .flatMap((path) => entry(path, 'monthly', 0.75, now))

  const postEntries = posts.flatMap((p) =>
    entry(`/blog/${p.slug}`, 'monthly', 0.7, new Date(p.updatedAt))
  )

  return [...staticEntries, ...serviceEntries, ...projectEntries, ...postEntries]
}
