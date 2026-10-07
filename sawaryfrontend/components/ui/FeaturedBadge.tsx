'use client'

import { Star } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

// "Featured" pill for projects the admin marked as featured. Sits in the card's top
// corner (opposite the arrow badge); `inline` drops the absolute positioning so it can
// sit in a row of meta pills instead.
export default function FeaturedBadge({ inline = false }: { inline?: boolean }) {
  const { t } = useLanguage()

  return (
    <span
      className={`flex w-fit items-center gap-1.5 rounded-[15px] bg-[#F4EFE3] px-4 py-1.5 text-[14px] font-medium text-[#343229] shadow-lg ${
        inline ? '' : 'absolute right-[18px] top-[18px] z-10'
      }`}
    >
      <Star size={14} className="fill-[rgb(190,156,100)] text-[rgb(190,156,100)]" />
      {t('projectDetail.featured')}
    </span>
  )
}
