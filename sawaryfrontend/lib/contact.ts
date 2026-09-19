const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5298'

export interface ContactPhoneNumber {
  id: number
  number: string
  labelAr: string | null
  labelEn: string | null
  orderIndex: number
}

export interface SocialLink {
  id: number
  platform: string
  url: string
  orderIndex: number
}

export interface ContactSettings {
  whatsAppNumber: string
  email: string
  phoneNumbers: ContactPhoneNumber[]
  socialLinks: SocialLink[]
}

// Static fallback — used only if the API is unreachable, mirroring the values already
// seeded in SawaryAPI/Data/AppDbContext.cs, so a brief backend outage doesn't break the
// WhatsApp button / footer / contact page site-wide.
const FALLBACK: ContactSettings = {
  whatsAppNumber: '966500175000',
  email: 'sawarydecor@gmail.com',
  phoneNumbers: [
    { id: 1, orderIndex: 0, number: '+966500175000', labelAr: null, labelEn: null },
  ],
  socialLinks: [
    { id: 1, orderIndex: 0, platform: 'instagram', url: 'https://www.instagram.com/sawary.de/' },
    { id: 2, orderIndex: 1, platform: 'x', url: 'https://x.com/SawaryDe' },
    { id: 3, orderIndex: 2, platform: 'youtube', url: 'https://www.youtube.com/@SAWARYDE' },
    { id: 4, orderIndex: 3, platform: 'pinterest', url: 'https://www.pinterest.com/sawarydecorproject/' },
    { id: 5, orderIndex: 4, platform: 'tiktok', url: 'https://www.tiktok.com/@sawary.de' },
  ],
}

export async function getContactSettings(): Promise<ContactSettings> {
  try {
    const res = await fetch(`${API_URL}/api/contact-settings`, { cache: 'no-store' })
    if (!res.ok) return FALLBACK
    return await res.json()
  } catch {
    return FALLBACK
  }
}
