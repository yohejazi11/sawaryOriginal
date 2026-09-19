const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5298'

export interface ApiServiceCard {
  id: number
  title: string
  imageUrl: string
  orderIndex: number
}

export interface ApiServiceSection {
  id: number
  title: string
  slug: string
  description: string | null
  heroImageUrl: string
  orderIndex: number
  cards: ApiServiceCard[]
}

export async function getServiceSections(): Promise<ApiServiceSection[]> {
  try {
    const res = await fetch(`${API_URL}/api/service-sections`, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}
