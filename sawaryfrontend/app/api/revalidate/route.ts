import type { NextRequest } from 'next/server'
import { revalidateTag } from 'next/cache'
import { ALL_CACHE_TAGS, type CacheTag } from '@/lib/cacheTags'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5298'

// Purges cached public-page data after an admin write. Called by lib/api.ts (apiFetch)
// with the admin's bearer token, which is checked against the API before anything is purged.
export async function POST(request: NextRequest) {
  const authorization = request.headers.get('authorization')
  if (!authorization) return Response.json({ revalidated: false }, { status: 401 })

  const verify = await fetch(`${API_URL}/api/auth/verify`, {
    headers: { Authorization: authorization },
    cache: 'no-store',
  }).catch(() => null)
  if (!verify?.ok) return Response.json({ revalidated: false }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const requested: unknown[] = Array.isArray(body?.tags) ? body.tags : []
  const tags = requested.filter((t): t is CacheTag => ALL_CACHE_TAGS.includes(t as CacheTag))
  if (tags.length === 0) return Response.json({ revalidated: false }, { status: 400 })

  // Expire immediately (rather than stale-while-revalidate) so the admin sees their
  // change on the very next page load.
  for (const tag of tags) revalidateTag(tag, { expire: 0 })

  return Response.json({ revalidated: true, tags })
}
