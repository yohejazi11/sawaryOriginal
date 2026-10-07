import { CACHE_TAGS, REVALIDATE_SECONDS } from './cacheTags'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5298'

export interface ApiServiceCard {
  id: number
  titleAr: string
  titleEn: string
  descriptionAr: string | null
  descriptionEn: string | null
  // The API maps the card's image to `heroImageUrl` (see ServiceSectionsController.MapCard).
  heroImageUrl: string
  orderIndex: number
  /** @deprecated No longer returned by the API — use titleAr/titleEn. */
  title: string
  /** @deprecated No longer returned by the API — use heroImageUrl. */
  imageUrl: string
}

export interface ApiServiceSection {
  id: number
  titleAr: string
  titleEn: string
  slug: string
  descriptionAr: string | null
  descriptionEn: string | null
  heroImageUrl: string
  orderIndex: number
  cards: ApiServiceCard[]
  /** @deprecated No longer returned by the API — use titleAr/titleEn. */
  title: string
  /** @deprecated No longer returned by the API — use descriptionAr/descriptionEn. */
  description: string | null
}

type Localized = Pick<ApiServiceSection, 'titleAr' | 'titleEn' | 'descriptionAr' | 'descriptionEn'>

// Picks the requested language, falling back to the other one when it's empty.
export function localizeService(item: Localized, lang: string) {
  const ar = lang === 'ar'
  return {
    title: (ar ? item.titleAr || item.titleEn : item.titleEn || item.titleAr) ?? '',
    description: (ar ? item.descriptionAr || item.descriptionEn : item.descriptionEn || item.descriptionAr) ?? '',
  }
}

export async function getServiceSections(): Promise<ApiServiceSection[]> {
  try {
    const res = await fetch(`${API_URL}/api/service-sections`, { next: { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.services] } })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}
