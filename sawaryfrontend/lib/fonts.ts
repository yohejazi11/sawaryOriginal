import localFont from 'next/font/local'

// Identity font — headings, buttons, navigation, numerals, brand-facing UI.
// preload applies to the whole family (next/font can't preload a single weight), so all
// three weights are preloaded — this is the site-wide default font, used above the fold.
// adjustFontFallback sizes the Arial fallback to Zawi's metrics so the swap doesn't reflow text.
export const zawi = localFont({
  src: [
    { path: '../public/fonts/29LTZawi-Light.woff2', weight: '300', style: 'normal' },
    { path: '../public/fonts/29LTZawi-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/29LTZawi-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-zawi',
  display: 'swap',
  preload: true,
  adjustFontFallback: 'Arial',
})

// Secondary reading font — long-form paragraphs (about/project descriptions, FAQ
// answers, service intros). Only a Regular weight file is available. Not preloaded:
// it's only used below the fold, so it shouldn't compete with the hero for bandwidth.
export const ibmPlexArabic = localFont({
  src: [
    { path: '../public/fonts/IBMPlexSansArabic-Regular.woff2', weight: '400', style: 'normal' },
  ],
  variable: '--font-ibm-plex-arabic',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
})
