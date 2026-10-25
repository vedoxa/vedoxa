import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

// Browser me jo address final rehta hai, wahi yahan likho.
const SITE_URL = 'https://vedoxa.shop'

// Sitemap har 1 ghante me naye sire se banti hai
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/explore`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/brand`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/refund`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ]

  let bookPages: MetadataRoute.Sitemap = []
  let postPages: MetadataRoute.Sitemap = []

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey)

      const books = await supabase
        .from('books')
        .select('id, slug, created_at')
        .order('created_at', { ascending: false })

      bookPages = (books.data ?? []).map((b: any) => ({
        url: `${SITE_URL}/book/${b.slug || b.id}`,
        lastModified: b.created_at ? new Date(b.created_at) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))

      // Table 'posts' abhi na bani ho to bhi sitemap chalti rahegi
      const posts = await supabase
        .from('posts')
        .select('slug, updated_at, published_at')
        .eq('published', true)
        .order('published_at', { ascending: false })

      postPages = (posts.data ?? []).map((p: any) => ({
        url: `${SITE_URL}/blog/${p.slug}`,
        lastModified: new Date(p.updated_at || p.published_at || now),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    }
  } catch (err) {
    console.error('Sitemap: data load nahi hua', err)
  }

  return [...staticPages, ...bookPages, ...postPages]
}
