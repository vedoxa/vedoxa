// Place at: src/app/sitemap.ts
import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://vedoxa.shop')
  .replace('://www.vedoxa.shop', '://vedoxa.shop')
  .replace(/\/+$/, '')

// Sitemap har 1 ghante me naye sire se banti hai
export const revalidate = 3600

function slugifyText(input?: string | null): string {
  if (!input) return ''
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/['"“”‘’`~!@#$%^&*()+=[\]{};:\\|,.<>/?]+/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function isRandomId(value?: string | null): boolean {
  if (!value) return true
  const v = String(value).trim()
  return /^(book|post)-[a-f0-9]{6,}$/i.test(v) || /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(v)
}

function getCleanSlug(row: any): string {
  const raw = row.slug ? String(row.slug).trim() : ''
  if (raw && !isRandomId(raw)) return raw
  const fromTitle = slugifyText(row.title)
  return fromTitle || raw || String(row.id || '')
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const staticDate = new Date('2026-10-01')

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/explore`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/quiz`, lastModified: staticDate, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/self`, lastModified: staticDate, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/reward-points`, lastModified: staticDate, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/support`, lastModified: staticDate, changeFrequency: 'monthly', priority: 0.5 },
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
      const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })

      // Title bhi select kiya gaya hai taaki agar slug 'book-2dbcc52d' ho toh book ka naam use ho
      const [books, posts] = await Promise.all([
        supabase
          .from('books')
          .select('id, slug, title, created_at')
          .order('created_at', { ascending: false }),
        supabase
          .from('posts')
          .select('id, slug, title, updated_at, published_at, created_at')
          .eq('published', true)
          .or(`published_at.is.null,published_at.lte.${now.toISOString()}`)
          .order('published_at', { ascending: false }),
      ])

      bookPages = (books.data ?? [])
        .map((b: any) => {
          const cSlug = getCleanSlug(b)
          if (!cSlug) return null
          return {
            url: `${SITE_URL}/book/${encodeURIComponent(cSlug)}`,
            lastModified: b.created_at ? new Date(b.created_at) : staticDate,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
          }
        })
        .filter(Boolean) as MetadataRoute.Sitemap

      postPages = (posts.data ?? [])
        .map((p: any) => {
          const cSlug = getCleanSlug(p)
          if (!cSlug) return null
          return {
            url: `${SITE_URL}/blog/${encodeURIComponent(cSlug)}`,
            lastModified: new Date(p.updated_at || p.published_at || p.created_at || staticDate),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
          }
        })
        .filter(Boolean) as MetadataRoute.Sitemap
    }
  } catch (err) {
    console.error('Sitemap: data load nahi hua', err)
  }

  return [...staticPages, ...bookPages, ...postPages]
}
