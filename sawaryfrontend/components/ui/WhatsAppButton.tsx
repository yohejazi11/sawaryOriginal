'use client'

import { usePathname } from 'next/navigation'
import { useSiteSettings } from '@/contexts/SiteSettingsContext'

export default function WhatsAppButton() {
  const pathname = usePathname()
  const { whatsAppNumber } = useSiteSettings()
  if (pathname?.startsWith('/admin')) return null

  return (
    <a
      href={`https://wa.me/${whatsAppNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary text-brand-cream shadow-lg transition-transform duration-200 hover:scale-110"
    >
      <span className="absolute inset-0 rounded-full bg-brand-primary opacity-75 animate-ping" />
      <svg
        viewBox="0 0 32 32"
        className="relative h-8 w-8"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M16.004 2.667c-7.364 0-13.333 5.97-13.333 13.333 0 2.49.687 4.82 1.88 6.817L2.667 29.333l6.683-1.846a13.27 13.27 0 0 0 6.654 1.78c7.364 0 13.333-5.97 13.333-13.333S23.368 2.667 16.004 2.667Zm0 24.213a11.05 11.05 0 0 1-5.64-1.553l-.404-.24-4.155 1.146 1.117-4.066-.264-.42a10.997 10.997 0 0 1-1.745-5.967c0-6.085 4.953-11.038 11.091-11.038 6.137 0 11.09 4.953 11.09 11.038 0 6.086-4.953 11.1-11.09 11.1Zm6.097-8.302c-.334-.167-1.97-.973-2.275-1.083-.305-.111-.527-.167-.749.166-.222.334-.86 1.083-1.054 1.305-.194.222-.388.25-.72.083-.334-.167-1.41-.52-2.687-1.66-.993-.886-1.663-1.98-1.857-2.314-.194-.334-.02-.515.166-.71.18-.18.388-.473.582-.71.194-.236.26-.402.39-.67.13-.27.064-.5-.07-.667-.13-.166-.638-1.534-.875-2.118-.235-.583-.473-.5-.65-.51-.166-.01-.36-.013-.555-.013a1.07 1.07 0 0 0-.776.36c-.265.286-1.01 1-1.01 2.42 0 1.42 1.038 2.79 1.182 2.985.146.194 2.005 3.06 4.86 4.166 2.857 1.106 2.857.738 3.373.692.515-.046 1.665-.68 1.9-1.336.234-.654.234-1.215.165-1.336-.07-.12-.265-.19-.598-.36Z" />
      </svg>
    </a>
  )
}
