import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'سواري للتصميم والتنفيذ — Sawary Design & Execution',
    short_name: 'سواري',
    description:
      'سواري — شركة سعودية متخصصة في التصميم الداخلي والتنفيذ والتشطيب للمشاريع السكنية والتجارية.',
    start_url: '/',
    display: 'standalone',
    background_color: 'rgb(52, 50, 41)',
    theme_color: 'rgb(52, 50, 41)',
    lang: 'ar',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
