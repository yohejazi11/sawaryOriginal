import ar from '@/locales/ar'
import en from '@/locales/en'
import type { Locale } from '@/lib/i18n'

// Matched against a category's stable `slug` (e.g. "commercial"), NOT its free-text
// display `name` — the admin can set `name` to anything in any language (see
// SawaryAPI Models/Category.cs), so it can never be a reliable translation key.
// Callers should pass `category.slug` (falling back to `category.name` only where a
// slug genuinely isn't available); unknown/custom category slugs fall back to
// whatever raw string was passed in, displayed as-is.
const CATEGORY_LABEL_KEYS: Record<string, string> = {
  commercial: 'categories.commercial',
  residential: 'categories.residential',
  design: 'categories.design',
}

export function translateCategory(t: (key: string) => string, slugOrName?: string): string {
  if (!slugOrName) return ''
  const key = CATEGORY_LABEL_KEYS[slugOrName.toLowerCase()]
  return key ? t(key) : slugOrName
}

const DICTS = { ar, en } as const

/** Server-component-safe equivalent of translateCategory (no useLanguage()/t() available there). */
export function translateCategoryServer(lang: Locale, slugOrName?: string): string {
  if (!slugOrName) return ''
  const categories = DICTS[lang].categories as Record<string, string>
  return categories[slugOrName.toLowerCase()] ?? slugOrName
}
