// Brand SVG icons not available in lucide-react.

import type { ComponentType } from 'react'
import { Link2, X as XIcon } from 'lucide-react'

export function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none"/>
    </svg>
  );
}

export function YoutubeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.498 6.186a2.997 2.997 0 0 0-2.112-2.119C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.386.522A2.997 2.997 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.997 2.997 0 0 0 2.112 2.119c1.881.522 9.386.522 9.386.522s7.505 0 9.386-.522a2.997 2.997 0 0 0 2.112-2.119C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.75 15.5v-7l6 3.5-6 3.5z"/>
    </svg>
  );
}

export function PinterestIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.017 0C5.396 0 0 5.396 0 12.017c0 5.069 3.158 9.396 7.598 11.108-.105-.945-.199-2.398.041-3.432.219-.937 1.406-5.965 1.406-5.965s-.359-.719-.359-1.781c0-1.663.967-2.911 2.175-2.911 1.027 0 1.519.769 1.519 1.688 0 1.031-.653 2.578-.992 4.012-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.412 0-5.412 2.561-5.412 5.207 0 1.031.392 2.137.883 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.222-.173.267-.4.161-1.495-.696-2.431-2.878-2.431-4.633 0-3.776 2.748-7.252 7.92-7.252 4.155 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.749-1.378l-.748 2.853c-.271 1.043-1.001 2.352-1.489 3.146 1.123.345 2.306.531 3.55.531 6.621 0 12.017-5.396 12.017-12.017C24.034 5.396 18.638 0 12.017 0z"/>
    </svg>
  );
}

export function TiktokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.6 8.3A5 5 0 0 1 15.5 7v7A5.5 5.5 0 1 1 10 8.5v3.1a2.4 2.4 0 1 0 2.4 2.4V4h3.1a5 5 0 0 0 4.1 4.1v.2z"/>
    </svg>
  );
}

// Maps a SocialLink.platform string (admin-entered, e.g. "instagram") to an icon —
// covers every platform seeded/known today, with Link2 as the generic fallback so an
// admin adding a not-yet-mapped platform never breaks rendering.
export const SOCIAL_PLATFORM_ICONS: Record<string, ComponentType<{ size?: number }>> = {
  instagram: InstagramIcon,
  x: XIcon,
  twitter: XIcon,
  youtube: YoutubeIcon,
  pinterest: PinterestIcon,
  tiktok: TiktokIcon,
}

export function iconForPlatform(platform: string) {
  return SOCIAL_PLATFORM_ICONS[platform.toLowerCase()] ?? Link2
}
