import type { MetadataRoute } from 'next'
import { getMetadataBase } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  const metadataBase = getMetadataBase()

  return {
    rules: [
      {
        userAgent: ['OAI-SearchBot', 'OAI-AdsBot'],
        allow: '/',
        disallow: ['/admin', '/api', '/login'],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/login'],
      },
    ],
    sitemap: new URL('/sitemap.xml', metadataBase).toString(),
    host: metadataBase.origin,
  }
}
