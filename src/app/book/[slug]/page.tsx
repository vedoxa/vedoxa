/* eslint-disable @next/next/no-img-element */
// Place at: src/app/book/[slug]/page.tsx
import { cache } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

// Sitemap.ts aur layout.tsx wale SITE_URL ke saath 100% same rakho
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://vedoxa.shop')
  .replace('://www.vedoxa.shop', '://vedoxa.shop')
  .replace(/\/+$/, '')

// Book page 1 ghante tak cache rehta hai, phir apne aap naya ho jata hai
export const revalidate = 3600

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

function coverUrl(coverPath?: string | null) {
  if (!coverPath) return null
  if (/^https?:\/\//i.test(coverPath)) return coverPath
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/books-covers/${coverPath}`
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

// FIX 1: Book ke title ko SEO-friendly URL naam (slug) mein badalne ka function
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

// Check karta hai ki slug kahin 'book-2dbcc52d' jaisa random code toh nahi hai
function isRandomBookId(value?: string | null): boolean {
  if (!value) return true
  const v = String(value).trim()
  return /^book-[a-f0-9]{6,}$/i.test(v) || UUID_RE.test(v)
}

// Hamesha book ka clean naam (slug) return karega, random ID nahi
function getBookSlug(book: any): string {
  if (!book) return ''
  const rawSlug = book.slug ? String(book.slug).trim() : ''
  if (rawSlug && !isRandomBookId(rawSlug)) {
    return rawSlug
  }
  const fromTitle = slugifyText(book.title)
  if (fromTitle) {
    return fromTitle
  }
  return rawSlug || String(book.id)
}

// FIX 2: 3-Step Smart Book Finder (Naam wala URL, purana random ID URL, ya UUID - sabhi par book khulegi)
const getBook = cache(async (param: string) => {
  const supabase = getSupabase()
  if (!supabase) return null

  const key = safeDecode(param).trim()
  if (!key) return null

  // Step 1: Direct slug column match
  const bySlug = await supabase.from('books').select('*').eq('slug', key).maybeSingle()
  if (bySlug.data) return bySlug.data

  // Step 2: Direct ID match (UUID ya 'book-2dbcc52d' dono ke liye safe)
  try {
    const byId = await supabase.from('books').select('*').eq('id', key).maybeSingle()
    if (byId.data) return byId.data
  } catch {
    // Agar id column strict UUID ho aur key text ho toh error ignore karke Step 3 par jaye
  }

  // Step 3: Title-based slug match (Jab URL mein book ka naam ho par DB mein slug khali ya random ID ho)
  try {
    const { data: allBooks } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)

    if (allBooks && allBooks.length > 0) {
      const normalizedKey = slugifyText(key)
      const matched = allBooks.find(
        (b: any) =>
          String(b.id) === key ||
          String(b.slug) === key ||
          getBookSlug(b) === key ||
          slugifyText(b.title) === normalizedKey
      )
      if (matched) return matched
    }
  } catch (err) {
    console.error('[book] fallback search error:', err)
  }

  return null
})

// FIX 3: Build time par sabhi books ke naam wale URLs pre-generate karne ke liye
export async function generateStaticParams() {
  const supabase = getSupabase()
  if (!supabase) return []
  try {
    const { data } = await supabase
      .from('books')
      .select('id, slug, title')
      .order('created_at', { ascending: false })
      .limit(500)

    if (!data) return []
    return data
      .map((b: any) => ({ slug: getBookSlug(b) }))
      .filter((item) => Boolean(item.slug))
  } catch {
    return []
  }
}

function shorten(text: string, max: number) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim()
  return clean.length > max ? clean.slice(0, max - 1).trimEnd() + '…' : clean
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { slug } = await params
  const book: any = await getBook(slug)

  if (!book) {
    return { title: 'Book not found', robots: { index: false, follow: false } }
  }

  // Canonical URL hamesha book ke clean naam par banega, random ID par nahi
  const cleanSlug = getBookSlug(book)
  const path = `/book/${encodeURIComponent(cleanSlug)}`
  const cover = coverUrl(book.cover_path)

  const description = book.description
    ? shorten(book.description, 155)
    : `${book.title}: Vedoxa par Hindi digital book${book.author ? ` by ${book.author}` : ''}. Price ₹${book.final_price}. Payment ke baad turant padhein.`

  const title = `${book.title} – Hindi Digital Book (PDF Summary & Guide)`

  return {
    title,
    description,
    keywords: [
      book.title,
      `${book.title} Hindi book`,
      `${book.title} PDF in Hindi`,
      book.author || 'Vedoxa',
      'Hindi digital books',
      'spirituality and psychology books Hindi',
    ],
    alternates: { canonical: `${SITE_URL}${path}` },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      siteName: 'Vedoxa Premium Library',
      locale: 'hi_IN',
      type: 'book',
      ...(cover ? { images: [{ url: cover, alt: `${book.title} book cover` }] } : {}),
    },
    twitter: {
      card: cover ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(cover ? { images: [cover] } : {}),
    },
  }
}

export default async function BookPage({ params }: any) {
  const { slug } = await params
  const book: any = await getBook(slug)

  if (!book) notFound()

  const cleanSlug = getBookSlug(book)
  const path = `/book/${encodeURIComponent(cleanSlug)}`
  const cover = coverUrl(book.cover_path)

  // Baaki books + Related Blogs (internal links Google ko sabhi pages dhoondhne me madad karte hain)
  let others: any[] = []
  let relatedBlogs: any[] = []
  const supabase = getSupabase()
  if (supabase) {
    try {
      const [booksRes, blogsRes] = await Promise.all([
        supabase
          .from('books')
          .select('id, slug, title, author, cover_path, final_price')
          .neq('id', book.id)
          .order('created_at', { ascending: false })
          .limit(12),
        supabase
          .from('posts')
          .select('slug, title, description, category')
          .eq('published', true)
          .order('published_at', { ascending: false })
          .limit(4),
      ])
      others = booksRes.data ?? []
      relatedBlogs = blogsRes.data ?? []
    } catch {
      // Ignore error so book page still renders safely
    }
  }

  // FIX 4: Product + Book + BreadcrumbList Schema taaki Google Search me Price aur Stock dikhe
  const productSchema: any = {
    '@type': ['Product', 'Book'],
    '@id': `${SITE_URL}${path}#book`,
    name: book.title,
    headline: book.title,
    description: book.description || `${book.title} – Vedoxa par Hindi digital book.`,
    bookFormat: 'https://schema.org/EBook',
    inLanguage: 'hi-IN',
    brand: { '@type': 'Brand', name: 'Vedoxa' },
    publisher: { '@type': 'Organization', name: 'Vedoxa', url: SITE_URL },
    url: `${SITE_URL}${path}`,
  }
  if (book.author) {
    productSchema.author = { '@type': 'Person', name: book.author }
  }
  if (cover) productSchema.image = cover
  if (book.final_price != null) {
    productSchema.offers = {
      '@type': 'Offer',
      price: String(book.final_price),
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}${path}`,
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      productSchema,
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Vedoxa', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Books', item: `${SITE_URL}/explore` },
          { '@type': 'ListItem', position: 3, name: book.title, item: `${SITE_URL}${path}` },
        ],
      },
    ],
  }

  // Is book ko site ke andar kholne ka link (wahi popup, payment aur reader ke saath - untouched!)
  const openInLibrary = `/?book=${book.id}`

  return (
    <div className="min-h-screen bg-[#07070d] text-gray-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-amber-400 transition-colors">
            Vedoxa
          </Link>
          <span className="mx-2 text-gray-600">/</span>
          <Link href="/explore" className="hover:text-amber-400 transition-colors">
            Books
          </Link>
          <span className="mx-2 text-gray-600">/</span>
          <span className="text-gray-300">{book.title}</span>
        </nav>

        <article className="grid md:grid-cols-[minmax(0,17rem)_1fr] gap-8 md:gap-12 items-start">
          <div className="w-full max-w-[17rem] mx-auto md:mx-0 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            {cover ? (
              <img
                src={cover}
                alt={`${book.title} – Hindi Digital Book Cover`}
                width={400}
                height={560}
                className="w-full h-auto rounded-lg shadow-[0_14px_36px_rgba(0,0,0,0.6)]"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            ) : (
              <div className="aspect-[3/4] flex items-center justify-center text-gray-500 text-sm">
                Cover jald aayega
              </div>
            )}
          </div>

          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold leading-snug text-white">
              {book.title}
            </h1>
            {book.author && <p className="mt-2 text-gray-400">Author: {book.author}</p>}

            <div className="mt-6 flex items-end gap-3">
              <span className="text-4xl font-black text-white">₹{book.final_price}</span>
              {book.discount > 0 && book.base_price != null && (
                <>
                  <span className="text-lg text-gray-500 line-through">₹{book.base_price}</span>
                  <span className="text-sm font-bold text-amber-400">{book.discount}% off</span>
                </>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={openInLibrary}
                className="inline-flex items-center justify-center rounded-2xl px-7 py-3.5 text-base font-extrabold text-[#150800] bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 shadow-[0_8px_28px_rgba(212,146,26,0.35)] hover:brightness-110 transition"
              >
                Buy or read this book
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center justify-center rounded-2xl px-6 py-3.5 text-base font-bold border border-white/15 text-gray-200 hover:border-amber-500/50 transition"
              >
                See all books
              </Link>
            </div>

            <ul className="mt-6 space-y-1.5 text-sm text-gray-400">
              <li>Payment ke baad turant access, bina intezaar ke</li>
              <li>Razorpay se surakshit payment (UPI, card, netbanking)</li>
              <li>Website ke reader me padhein, login se kisi bhi device par</li>
            </ul>

            <section className="mt-10">
              <h2 className="font-serif text-xl font-bold text-white mb-3">Is book ke baare me</h2>
              {book.description ? (
                <p className="whitespace-pre-line leading-8 text-gray-300 max-w-prose">
                  {book.description}
                </p>
              ) : (
                <p className="leading-8 text-gray-400 max-w-prose">
                  {book.title} Vedoxa Premium Library ki Hindi digital book hai. Poori jankari ke liye
                  book ko library me kholein.
                </p>
              )}
            </section>
          </div>
        </article>

        {others.length > 0 && (
          <section className="mt-16">
            <h2 className="font-serif text-xl font-bold text-white mb-5">Aur books</h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {others.map((o) => {
                const c = coverUrl(o.cover_path)
                const otherSlug = getBookSlug(o)
                return (
                  <li key={o.id}>
                    <Link
                      href={`/book/${encodeURIComponent(otherSlug)}`}
                      className="block rounded-2xl border border-white/10 bg-white/[0.03] p-3 hover:border-amber-500/40 transition-colors h-full"
                    >
                      {c && (
                        <img
                          src={c}
                          alt={`${o.title} book cover`}
                          width={300}
                          height={420}
                          className="w-full h-44 object-contain rounded-lg"
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                      <p className="mt-3 text-sm font-bold text-white line-clamp-2">{o.title}</p>
                      <p className="mt-1 text-sm text-amber-400 font-bold">₹{o.final_price}</p>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* FIX 5: Book page se Blogs ko internal link dene ke liye Related Blogs section */}
        {relatedBlogs.length > 0 && (
          <section className="mt-16 border-t border-white/10 pt-10">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2 className="font-serif text-xl font-bold text-white">
                Vedoxa Blog ke Naye Lekh
              </h2>
              <Link href="/blog" className="text-sm font-bold text-amber-400 hover:underline">
                Sabhi lekh padhein →
              </Link>
            </div>
            <ul className="grid sm:grid-cols-2 gap-4">
              {relatedBlogs.map((post: any) => {
                const pSlug = post.slug || slugifyText(post.title)
                if (!pSlug) return null
                return (
                  <li key={pSlug}>
                    <Link
                      href={`/blog/${encodeURIComponent(pSlug)}`}
                      className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-amber-500/40 transition-colors h-full"
                    >
                      {post.category && (
                        <span className="text-xs font-bold text-amber-400">{post.category}</span>
                      )}
                      <h3 className="mt-1 text-base font-bold text-white line-clamp-2">
                        {post.title}
                      </h3>
                      {post.description && (
                        <p className="mt-1.5 text-sm text-gray-400 line-clamp-2">
                          {post.description}
                        </p>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
