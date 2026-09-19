const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5298'

// ── API response shapes ───────────────────────────────────────────────────────

export interface ApiProjectImage {
  id: number
  url: string
  publicId: string
  width: number | null
  height: number | null
  orderIndex: number
}

export interface ApiCategory {
  id: number
  name: string
  slug: string
  type: string
  orderIndex: number
  projectCount?: number
}

export interface ApiProject {
  id: number
  slug: string
  name: string
  description: string
  location: string
  year: string
  isFeatured: boolean
  orderIndex: number
  coverImageUrl: string
  coverImageWidth: number | null
  coverImageHeight: number | null
  category: ApiCategory
  images: ApiProjectImage[]
}

export interface ApiProjectList extends Omit<ApiProject, 'images'> {
  imageCount: number
}

// ── Legacy shape kept for the cinematic page.tsx ──────────────────────────────
export type ProjectCategory = 'تنفيذ تجاري' | 'تنفيذ سكني' | 'تصميم'

export interface ProjectImage {
  src: string
  width: number | null
  height: number | null
}

export interface Project {
  slug: string
  name: string
  category: ProjectCategory
  /**
   * Stable, language-neutral category identifier (e.g. "commercial"). Prefer this
   * over `category` for translation lookups (lib/categoryLabels.ts) — `category` is
   * the category's free-text display Name and is not guaranteed to match the
   * translation dictionary's keys (it can be any language the admin typed).
   */
  categorySlug: string
  year: string
  location: string
  description: string
  coverImage: string
  images: ProjectImage[]
}

function apiToProject(p: ApiProject): Project {
  return {
    slug: p.slug,
    name: p.name,
    category: p.category?.name as ProjectCategory,
    categorySlug: p.category?.slug ?? '',
    year: p.year,
    location: p.location,
    description: p.description,
    coverImage: p.coverImageUrl,
    images: p.images
      .filter(i => i.url !== p.coverImageUrl)
      .map(i => ({ src: i.url, width: i.width, height: i.height })),
  }
}

// ── Server-side fetch helpers (used in Server Components) ─────────────────────

export async function getProjects(params?: { categoryId?: number; type?: string }): Promise<ApiProjectList[]> {
  const search = new URLSearchParams()
  if (params?.categoryId) search.set('categoryId', String(params.categoryId))
  if (params?.type) search.set('type', params.type)
  const qs = search.toString() ? `?${search.toString()}` : ''
  try {
    const res = await fetch(`${API_URL}/api/projects${qs}`, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

// Resolves a category by its (internal, non-editable) slug and returns its projects.
export async function getProjectsByCategorySlug(slug: string): Promise<ApiProjectList[]> {
  const categories = await getCategories()
  const category = categories.find(c => c.slug === slug)
  if (!category) return []
  return getProjects({ categoryId: category.id })
}

export async function getProjectById(id: number): Promise<Project | undefined> {
  try {
    const res = await fetch(`${API_URL}/api/projects/${id}`, { cache: 'no-store' })
    if (!res.ok) return undefined
    const data: ApiProject = await res.json()
    return apiToProject(data)
  } catch {
    return undefined
  }
}

export async function getProject(slug: string): Promise<Project | undefined> {
  try {
    const res = await fetch(`${API_URL}/api/projects/${slug}`, { cache: 'no-store' })
    if (!res.ok) return undefined
    const data: ApiProject = await res.json()
    return apiToProject(data)
  } catch {
    return undefined
  }
}

export async function getCategories(): Promise<ApiCategory[]> {
  try {
    const res = await fetch(`${API_URL}/api/categories`, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function getFeaturedProjects(): Promise<ApiProjectList[]> {
  try {
    const res = await fetch(`${API_URL}/api/projects?featured=true`, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

