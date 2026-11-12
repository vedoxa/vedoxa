import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const SITE_URL = 'https://vedoxa.shop'

// Sitemap har 1 ghante me update hoga
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  // Static pages ke liye fixed date taaki Google ko fake timestamp na lage
  const staticDate = new Date('2026-10-01')

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/explore`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/quiz`, lastModified: staticDate, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/self`, lastModified: staticDate, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: staticDate, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/brand`, lastModified: staticDate, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/contact`, lastModified: staticDate, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/terms`, lastModified: staticDate, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/privacy`, lastModified: staticDate, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/refund`, lastModified: staticDate, changeFrequency: 'yearly', priority: 0.2 },
  ]

  let bookPages: MetadataRoute.Sitemap = []
  let postPages: MetadataRoute.Sitemap = []

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey)

      // Books aur Posts dono ko ek saath fast load karne ke liye Promise.all
      const [booksRes, postsRes] = await Promise.all([
        supabase
          .from('books')
          .select('id, slug, created_at')
          .order('created_at', { ascending: false }),
        supabase
          .from('posts')
          .select('slug, updated_at, published_at')
          .eq('published', true)
          .order('published_at', { ascending: false }),
      ])

      bookPages = (booksRes.data ?? []).map((b: any) => ({
        url: `${SITE_URL}/book/${b.slug || b.id}`,
        lastModified: b.created_at ? new Date(b.created_at) : staticDate,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))

      postPages = (postsRes.data ?? []).map((p: any) => ({
        url: `${SITE_URL}/blog/${p.slug}`,
        lastModified: new Date(p.updated_at || p.published_at || staticDate),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    }
  } catch (err) {
    console.error('Sitemap: data load nahi hua', err)
  }

  return [...staticPages, ...bookPages, ...postPages]
}
