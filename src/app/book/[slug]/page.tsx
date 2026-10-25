import { cache } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

// Sitemap.ts wale SITE_URL ke saath same rakho
const SITE_URL = 'https://vedoxa.shop'

// Book page 1 ghante tak cache rehta hai, phir apne aap naya ho jata hai
export const revalidate = 3600

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

function coverUrl(coverPath?: string | null) {
  if (!coverPath) return null
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/books-covers/${coverPath}`
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

// Ek hi request me generateMetadata aur page dono ko wahi book milti hai
const getBook = cache(async (param: string) => {
  const supabase = getSupabase()
  if (!supabase) return null

  const key = safeDecode(param)

  const bySlug = await supabase.from('books').select('*').eq('slug', key).maybeSingle()
  if (bySlug.data) return bySlug.data

  if (UUID_RE.test(key)) {
    const byId = await supabase.from('books').select('*').eq('id', key).maybeSingle()
    if (byId.data) return byId.data
  }

  return null
})

function shorten(text: string, max: number) {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length > max ? clean.slice(0, max - 1).trimEnd() + '…' : clean
}

export async function generateMetadata({ params }: any) {
  const { slug } = await params
  const book: any = await getBook(slug)

  if (!book) {
    return { title: 'Book not found', robots: { index: false, follow: false } }
  }

  const path = `/book/${book.slug || book.id}`
  const cover = coverUrl(book.cover_path)

  const description = book.description
    ? shorten(book.description, 155)
    : `${book.title}: Vedoxa par Hindi digital book. Price ₹${book.final_price}. Payment ke baad turant padhein.`

  const title = `${book.title} – Hindi Digital Book`

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}${path}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      siteName: 'Vedoxa Premium Library',
      type: 'website',
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

  const path = `/book/${book.slug || book.id}`
  const cover = coverUrl(book.cover_path)

  // Baaki books (internal links Google ko aur books dhoondhne me madad karte hain)
  let others: any[] = []
  const supabase = getSupabase()
  if (supabase) {
    const { data } = await supabase
      .from('books')
      .select('id, slug, title, author, cover_path, final_price')
      .neq('id', book.id)
      .order('created_at', { ascending: false })
      .limit(6)
    others = data ?? []
  }

  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: book.title,
    description: book.description || `${book.title} – Vedoxa par Hindi digital book.`,
    brand: { '@type': 'Brand', name: 'Vedoxa' },
    url: `${SITE_URL}${path}`,
  }
  if (cover) jsonLd.image = cover
  if (book.final_price != null) {
    jsonLd.offers = {
      '@type': 'Offer',
      price: String(book.final_price),
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}${path}`,
    }
  }

  // Is book ko site ke andar kholne ka link (wahi popup, payment aur reader ke saath)
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
                alt={`${book.title} book cover`}
                className="w-full h-auto rounded-lg shadow-[0_14px_36px_rgba(0,0,0,0.6)]"
                loading="eager"
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
                href="/"
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
                return (
                  <li key={o.id}>
                    <Link
                      href={`/book/${o.slug || o.id}`}
                      className="block rounded-2xl border border-white/10 bg-white/[0.03] p-3 hover:border-amber-500/40 transition-colors h-full"
                    >
                      {c && (
                        <img
                          src={c}
                          alt={`${o.title} book cover`}
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
      </div>
    </div>
  )
}
