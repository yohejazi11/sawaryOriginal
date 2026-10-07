import { CACHE_TAGS, REVALIDATE_SECONDS } from './cacheTags'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5298'

export interface ApiBlogPostList {
  id: number
  titleAr: string
  titleEn: string
  slug: string
  excerptAr: string | null
  excerptEn: string | null
  coverImageUrl: string
  isPublished: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ApiBlogPost extends ApiBlogPostList {
  contentAr: string
  contentEn: string | null
  coverImageWidth: number | null
  coverImageHeight: number | null
}

// Picks the requested language, falling back to Arabic (the only required body).
export function localizePost(post: ApiBlogPostList & Partial<Pick<ApiBlogPost, 'contentAr' | 'contentEn'>>, lang: string) {
  const ar = lang === 'ar'
  return {
    title: (ar ? post.titleAr || post.titleEn : post.titleEn || post.titleAr) ?? '',
    excerpt: (ar ? post.excerptAr || post.excerptEn : post.excerptEn || post.excerptAr) ?? '',
    content: (ar ? post.contentAr || post.contentEn : post.contentEn || post.contentAr) ?? '',
  }
}

export function formatPostDate(iso: string | null, lang: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Rough reading time (~200 words/min), never below 1.
export function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

// Content is plain text: blank line = paragraph, "## " = heading, "- " lines = bullet list.
export type ContentBlock =
  | { type: 'heading'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'paragraph'; text: string }

export function parseContent(content: string): ContentBlock[] {
  return content
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map(chunk => chunk.trim())
    .filter(Boolean)
    .map((chunk): ContentBlock => {
      if (chunk.startsWith('## ')) return { type: 'heading', text: chunk.slice(3).trim() }
      const lines = chunk.split('\n').map(l => l.trim())
      if (lines.every(l => l.startsWith('- '))) return { type: 'list', items: lines.map(l => l.slice(2).trim()) }
      return { type: 'paragraph', text: chunk }
    })
}

export async function getBlogPosts(): Promise<ApiBlogPostList[]> {
  try {
    const res = await fetch(`${API_URL}/api/blog`, { next: { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.blog] } })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function getBlogPost(slug: string): Promise<ApiBlogPost | null> {
  try {
    const res = await fetch(`${API_URL}/api/blog/${encodeURIComponent(slug)}`, {
      next: { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.blog] },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
