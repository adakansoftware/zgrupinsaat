import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Z GRUP İNŞAAT',
    short_name: 'Z GRUP',
    description: 'Adana merkezli hafriyat, damperli nakliyat, lowbed ve arazöz hizmetleri.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    lang: 'tr-TR',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
  }
}
