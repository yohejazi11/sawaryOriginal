export const LOCALES = ['ar', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'ar'

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

/** Build an internal href for the given locale from a canonical (Arabic-shaped) path. */
export function localizedHref(lang: Locale, path: string): string {
  if (lang === DEFAULT_LOCALE) return path
  return path === '/' ? '/en' : `/en${path}`
}

/** Strip a leading /en or explicit /ar prefix off a browser pathname, returning the canonical (bare ar) path. */
export function stripLocalePrefix(pathname: string): string {
  if (pathname === '/en') return '/'
  if (pathname.startsWith('/en/')) return pathname.slice(3)
  if (pathname === '/ar') return '/'
  if (pathname.startsWith('/ar/')) return pathname.slice(3)
  return pathname
}

/** Swap the locale in a full browser pathname (used by the header language toggle). */
export function swapLocaleInPath(pathname: string, targetLang: Locale): string {
  return localizedHref(targetLang, stripLocalePrefix(pathname))
}
