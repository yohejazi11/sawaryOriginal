'use client'

import { createContext, useContext } from 'react'
import type { ContactSettings } from '@/lib/contact'

const SiteSettingsContext = createContext<ContactSettings | null>(null)

export function SiteSettingsProvider({
  settings,
  children,
}: {
  settings: ContactSettings
  children: React.ReactNode
}) {
  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

// Single source of truth for WhatsApp number / phone / email / social links, fetched
// once server-side (app/(public)/[lang]/layout.tsx) from /api/contact-settings and
// provided here so every client component (WhatsAppButton, Footer, ContactClient,
// HeroSection, service-page CTAs) reads the same values instead of each hardcoding
// its own copy.
export function useSiteSettings(): ContactSettings {
  const ctx = useContext(SiteSettingsContext)
  if (!ctx) throw new Error('useSiteSettings must be used within a SiteSettingsProvider')
  return ctx
}
