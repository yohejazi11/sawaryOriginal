// Cache tags for server-side API fetches. Public pages are cached (ISR, 60s) and purged
// on demand via /api/revalidate whenever the admin panel writes to the API.

export const CACHE_TAGS = {
  projects: 'projects',
  tags: 'tags',
  contact: 'contact',
  about: 'about',
  services: 'services',
  blog: 'blog',
} as const

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]

export const ALL_CACHE_TAGS: readonly CacheTag[] = Object.values(CACHE_TAGS)

export const REVALIDATE_SECONDS = 60

// Which cached data an admin write to a given API path can affect. Projects carry their
// tags and tags carry a projectCount, so writes to either purge both.
export function tagsForApiPath(path: string): CacheTag[] {
  if (/^\/api\/(projects|images|sections|tags)(\/|\?|$)/.test(path)) {
    return [CACHE_TAGS.projects, CACHE_TAGS.tags]
  }
  if (path.startsWith('/api/contact-settings')) return [CACHE_TAGS.contact]
  if (path.startsWith('/api/about')) return [CACHE_TAGS.about]
  if (/^\/api\/service-(sections|cards)/.test(path)) return [CACHE_TAGS.services]
  if (/^\/api\/blog(\/|$)/.test(path)) return [CACHE_TAGS.blog]
  return []
}
