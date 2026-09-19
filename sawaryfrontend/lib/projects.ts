const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5298'

// ── API response shapes ───────────────────────────────────────────────────────

export interface ApiProjectImage {
  id: number
  url: string
  publicId: string
  width: number | null
  height: number | null
  orderIndex: number
  sectionId: number | null
}

export interface ApiProjectSection {
  id: number
  nameAr: string
  nameEn: string
  orderIndex: number
  images: ApiProjectImage[]
}

export interface ApiTag {
  id: number
  nameAr: string
  nameEn: string
  slug: string
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
  tags: ApiTag[]
  images: ApiProjectImage[]
  sections: ApiProjectSection[]
}

export interface ApiProjectList extends Omit<ApiProject, 'images' | 'sections'> {
  imageCount: number
}

export interface ProjectImage {
  src: string
  width: number | null
  height: number | null
}

export interface ProjectSection {
  id: number
  nameAr: string
  nameEn: string
  orderIndex: number
  images: ProjectImage[]
}

export interface ProjectTag {
  id: number
  nameAr: string
  nameEn: string
  slug: string
}

export interface Project {
  slug: string
  name: string
  tags: ProjectTag[]
  year: string
  location: string
  description: string
  coverImage: string
  images: ProjectImage[]
  sections: ProjectSection[]
}

function apiToProject(p: ApiProject): Project {
  return {
    slug: p.slug,
    name: p.name,
    tags: (p.tags ?? []).map(t => ({ id: t.id, nameAr: t.nameAr, nameEn: t.nameEn, slug: t.slug })),
    year: p.year,
    location: p.location,
    description: p.description,
    coverImage: p.coverImageUrl,
    images: p.images
      .filter(i => i.url !== p.coverImageUrl)
      .map(i => ({ src: i.url, width: i.width, height: i.height })),
    sections: (p.sections ?? []).map(s => ({
      id: s.id,
      nameAr: s.nameAr,
      nameEn: s.nameEn,
      orderIndex: s.orderIndex,
      images: s.images
        .filter(i => i.url !== p.coverImageUrl)
        .map(i => ({ src: i.url, width: i.width, height: i.height })),
    })),
  }
}

// ── Server-side fetch helpers (used in Server Components) ─────────────────────

export async function getProjects(params?: { tagId?: number; featured?: boolean }): Promise<ApiProjectList[]> {
  const search = new URLSearchParams()
  if (params?.tagId) search.set('tagId', String(params.tagId))
  if (params?.featured) search.set('featured', 'true')
  const qs = search.toString() ? `?${search.toString()}` : ''
  try {
    const res = await fetch(`${API_URL}/api/projects${qs}`, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

// Resolves a tag by its (internal, non-editable) slug and returns projects carrying it.
export async function getProjectsByTagSlug(slug: string): Promise<ApiProjectList[]> {
  const tags = await getTags()
  const tag = tags.find(t => t.slug === slug)
  if (!tag) return []
  return getProjects({ tagId: tag.id })
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

export async function getTags(): Promise<ApiTag[]> {
  try {
    const res = await fetch(`${API_URL}/api/tags`, { cache: 'no-store' })
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
