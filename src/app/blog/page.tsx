import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

// Sitemap.ts wale SITE_URL ke saath same rakho
const SITE_URL = 'https://vedoxa.shop'

// Naya article 10 minute me list me aa jata hai
export const revalidate = 600

export const metadata: Metadata = {
  title: 'Blog – Mindset, Spirituality aur Paise par Hindi lekh',
  description:
    'Vedoxa blog: mindset, spirituality, psychology aur paise ki samajh par saral Hindi me lekh.',
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: 'Vedoxa Blog – Hindi me mindset, spirituality aur paise ki baatein',
    description:
      'Mindset, spirituality, psychology aur paise ki samajh par saral Hindi me lekh.',
    url: `${SITE_URL}/blog`,
    siteName: 'Vedoxa Premium Library',
    type: 'website',
  },
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

function formatDate(value?: string | null) {
  if (!value) return ''
  try {
    return new Date(value).toLocaleDateString('hi-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export default async function BlogIndexPage() {
  let posts: any[] = []

  const supabase = getSupabase()
  if (supabase) {
    const { data } = await supabase
      .from('posts')
      .select('slug, title, description, published_at')
      .eq('published', true)
      .order('published_at', { ascending: false })
    posts = data ?? []
  }

  return (
    <div className="min-h-screen bg-[#07070d] text-gray-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-amber-400 transition-colors">
            Vedoxa
          </Link>
          <span className="mx-2 text-gray-600">/</span>
          <span className="text-gray-300">Blog</span>
        </nav>

        <header className="mb-10">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold leading-snug text-white">
            Vedoxa Blog
          </h1>
          <p className="mt-3 text-gray-400 leading-7 max-w-prose">
            Mindset, spirituality aur paise ki samajh par saral Hindi me lekh.
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="text-gray-400">Pehla lekh jald aayega. Tab tak library dekhein.</p>
        ) : (
          <ul className="divide-y divide-white/10 border-y border-white/10">
            {posts.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="block py-6 group"
                >
                  <h2 className="font-serif text-xl sm:text-2xl font-bold leading-snug text-white group-hover:text-amber-400 transition-colors">
                    {p.title}
                  </h2>
                  {p.description && (
                    <p className="mt-2 text-gray-400 leading-7">{p.description}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">{formatDate(p.published_at)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-base font-bold border border-white/15 text-gray-200 hover:border-amber-500/50 transition"
          >
            Library dekhein
          </Link>
        </div>
      </div>
    </div>
  )
}
