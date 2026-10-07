'use client'

import Footer from '@/components/sections/Footer'
import ServicesSection from '@/components/sections/ServicesSection'
import { type ApiServiceSection } from '@/lib/services'

// Same layout as the home page's services section, rendered as a full page.
export default function ServicesClient({ sections }: { sections: ApiServiceSection[] }) {
  return (
    <main className="flex min-h-screen flex-col bg-[#F4EFE3]">
      <ServicesSection sections={sections} variant="page" />
      <Footer />
    </main>
  )
}
