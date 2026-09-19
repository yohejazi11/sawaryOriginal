import localFont from 'next/font/local'

// Identity font — headings, buttons, navigation, numerals, brand-facing UI.
export const zawi = localFont({
  src: [
    { path: '../public/fonts/29LTZawi-Light.otf', weight: '300', style: 'normal' },
    { path: '../public/fonts/29LTZawi-Regular.otf', weight: '400', style: 'normal' },
    { path: '../public/fonts/29LTZawi-Bold.otf', weight: '700', style: 'normal' },
  ],
  variable: '--font-zawi',
  display: 'swap',
})

// Secondary reading font — long-form paragraphs (about/project descriptions, FAQ
// answers, service intros). Only a Regular weight file is available.
export const ibmPlexArabic = localFont({
  src: [
    { path: '../public/fonts/IBMPlexSansArabic-Regular.ttf', weight: '400', style: 'normal' },
  ],
  variable: '--font-ibm-plex-arabic',
  display: 'swap',
})
