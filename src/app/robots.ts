import type { MetadataRoute } from 'next'

// Sitemap.ts wale SITE_URL ke saath same rakho
const SITE_URL = 'https://vedoxa.shop'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
