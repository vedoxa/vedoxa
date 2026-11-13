/* eslint-disable @next/next/no-img-element */
// Place at: src/app/blog/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import BlogList, { type BlogItem } from '../../components/blog/BlogList'
import { Icon, LogoMark } from '../../components/blog/Icon'

// FIX 1: Sitemap.ts aur layout.tsx wale SITE_URL ke saath 100% same non-www URL
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://vedoxa.shop')
  .replace('://www.vedoxa.shop', '://vedoxa.shop')
  .replace(/\/+$/, '')
const SITE_NAME = 'Vedoxa Premium Library'

// Naya article 10 minute me list me aa jata hai
export const revalidate = 600

export const metadata: Metadata = {
  title: 'Blog – Mindset, Spirituality, Psychology aur Paise par Hindi Lekh',
  description:
    'Vedoxa blog: mindset, spirituality, relationship, psychology aur paise ki samajh par saral Hindi me practical lekh aur book summaries.',
  keywords: [
    'Vedoxa blog',
    'Hindi blog on mindset',
    'spirituality articles in Hindi',
    'psychology facts in Hindi',
    'Hindi book summaries',
    'self improvement Hindi',
  ],
  alternates: { canonical: `${SITE_URL}/blog` },
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
    title: 'Vedoxa Blog – Hindi me mindset, spirituality aur paise ki baatein',
    description:
      'Mindset, spirituality, psychology aur paise ki samajh par saral Hindi me lekh.',
    url: `${SITE_URL}/blog`,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'hi_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vedoxa Blog – Mindset, Spirituality & Psychology',
    description: 'Mindset, spirituality aur paise ki samajh par saral Hindi me lekh.',
  },
}

type Row = {
  id?: string | number
  slug?: string | null
  title?: string | null
  description?: string | null
  content?: string | null
  category?: string | null
  tags?: string[] | string | null
  cover_image?: string | null
  published_at?: string | null
  created_at?: string | null
}

type BookRow = {
  id: string | number
  slug?: string | null
  title: string
  cover_path?: string | null
  final_price?: number | string | null
}

/* ───────────────────────────── Helpers & Auto-Slug ───────────────────────────── */

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    console.error('[blog] Supabase env vars missing')
    return null
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

// FIX 2: Title se apne aap clean SEO-friendly slug banane ka function
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

function getPostSlug(r: Row): string {
  const raw = r.slug ? String(r.slug).trim() : ''
  if (raw && !isRandomId(raw)) return raw
  const fromTitle = slugifyText(r.title)
  return fromTitle || raw || (r.id ? String(r.id) : '')
}

function getBookSlug(b: BookRow): string {
  const raw = b.slug ? String(b.slug).trim() : ''
  if (raw && !isRandomId(raw)) return raw
  const fromTitle = slugifyText(b.title)
  return fromTitle || raw || String(b.id)
}

function bookCoverUrl(coverPath?: string | null) {
  if (!coverPath) return null
  if (/^https?:\/\//i.test(coverPath)) return coverPath
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/books-covers/${coverPath}`
}

function formatPrice(value: unknown) {
  if (value === null || value === undefined || value === '') return ''
  const n = Number(value)
  return Number.isNaN(n) ? `₹${String(value)}` : `₹${n.toLocaleString('en-IN')}`
}

function formatDate(value?: string | null) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  try {
    return d.toLocaleDateString('hi-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Kolkata',
    })
  } catch {
    return ''
  }
}

function mediaUrl(value?: string | null) {
  if (!value) return null
  return /^https?:\/\//i.test(value) || value.startsWith('/') ? value : null
}

function shorten(text: string, max: number) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim()
  return clean.length > max ? clean.slice(0, max - 1).trimEnd() + '…' : clean
}

function plainText(md: string) {
  return String(md || '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^(💬|👉)\s*/gm, '')
    .replace(/^([-•*]|\d+[.)])\s+/gm, '')
    .replace(/^---+$/gm, '')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseTags(value: unknown): string[] {
  const list = Array.isArray(value) ? value : String(value || '').split(',')
  return list.map((t) => String(t).trim()).filter(Boolean).slice(0, 12)
}

function toItem(r: Row): BlogItem | null {
  if (!r.title) return null
  const finalSlug = getPostSlug(r)
  if (!finalSlug) return null

  const body = plainText(r.content || '')
  const tags = parseTags(r.tags)
  const category = (r.category || '').trim() || 'Vedoxa Special'
  const excerpt = shorten(r.description || body, 140)
  const when = r.published_at || r.created_at || null
  const t = when ? new Date(when).getTime() : NaN
  const words = body ? body.split(' ').length : 0

  return {
    slug: finalSlug,
    title: r.title,
    excerpt,
    category,
    tags,
    cover: mediaUrl(r.cover_image),
    date: formatDate(when),
    ts: Number.isNaN(t) ? 0 : t,
    mins: Math.max(1, Math.ceil(words / 200)),
    search: `${r.title} ${excerpt} ${category} ${tags.join(' ')}`.toLowerCase(),
  }
}

async function loadPosts(): Promise<{ rows: Row[]; failed: boolean }> {
  const supabase = getSupabase()
  if (!supabase) return { rows: [], failed: true }

  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('published', true)
      // hide scheduled posts: they would 404 on the article page
      .or(`published_at.is.null,published_at.lte.${new Date().toISOString()}`)
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(500)

    if (error) {
      console.error('[blog] failed to load posts:', error.message)
      return { rows: [], failed: true }
    }
    return { rows: (data as Row[] | null) ?? [], failed: false }
  } catch (e) {
    console.error('[blog] failed to load posts:', e)
    return { rows: [], failed: true }
  }
}

// FIX 3: Books ko bhi crawl aur index karwane ke liye Featured Books loader
async function loadFeaturedBooks(): Promise<BookRow[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  try {
    const { data } = await supabase
      .from('books')
      .select('id, slug, title, cover_path, final_price')
      .order('created_at', { ascending: false })
      .limit(6)
    return (data as BookRow[] | null) ?? []
  } catch {
    return []
  }
}

const PAGE_CSS = `
.vx-display{font-family:var(--font-vx-display,var(--font-vx-body,ui-sans-serif)),'Noto Sans Devanagari',ui-sans-serif,system-ui,sans-serif}
@keyframes vx-fade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.vx-fade{animation:vx-fade .6s cubic-bezier(.22,1,.36,1) both}
.vx-card{transition:border-color .2s ease,box-shadow .25s ease,transform .25s ease}
.vx-card:hover{box-shadow:0 16px 36px -22px rgba(2,132,199,.5);transform:translateY(-2px)}
@media (prefers-reduced-motion:no-preference){html{scroll-behavior:smooth}}
@media (prefers-reduced-motion:reduce){.vx-fade{animation:none}.vx-card{transition:none}.vx-card:hover{transform:none}}
`

const CRUMB =
  'inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-white px-3 py-1 font-medium transition-colors hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400'

/* ───────────────────────────── Page ───────────────────────────── */

export default async function BlogIndexPage() {
  const [{ rows, failed }, featuredBooks] = await Promise.all([
    loadPosts(),
    loadFeaturedBooks(),
  ])
  const items = rows.map(toItem).filter((p): p is BlogItem => p !== null)
  const categoryCount = new Set(items.map((p) => p.category)).size

  // FIX 4: Complete Schema Markup (Sabhi blogs + ItemList taaki Googlebot ek bhi blog na chhode)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Blog',
        '@id': `${SITE_URL}/blog#blog`,
        url: `${SITE_URL}/blog`,
        name: 'Vedoxa Blog',
        description: 'Mindset, spirituality aur paise ki samajh par saral Hindi me lekh.',
        inLanguage: 'hi-IN',
        publisher: { '@type': 'Organization', name: 'Vedoxa', url: SITE_URL },
        blogPost: items.map((item) => ({
          '@type': 'BlogPosting',
          headline: item.title,
          description: item.excerpt,
          url: `${SITE_URL}/blog/${encodeURIComponent(item.slug)}`,
          image: item.cover || undefined,
        })),
      },
      {
        '@type': 'ItemList',
        name: 'Vedoxa Hindi Blog Articles',
        numberOfItems: items.length,
        itemListElement: items.map((item, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: item.title,
          url: `${SITE_URL}/blog/${encodeURIComponent(item.slug)}`,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Vedoxa', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
        ],
      },
    ],
  }

  return (
    <div
      id="top"
      className="relative min-h-screen text-slate-700 selection:bg-sky-200"
      style={{ background: 'linear-gradient(180deg,#ffffff 0%,#f4faff 38%,#e4f3fd 100%)' }}
    >
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem]"
        style={{ background: 'radial-gradient(60% 60% at 50% 0%, rgba(125,211,252,0.35), transparent)' }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-5xl px-4 py-6 sm:px-6 md:py-10">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs text-slate-500 sm:text-sm">
            <li>
              <Link href="/" className={CRUMB}>
                <Icon name="home" size={14} />
                Vedoxa
              </Link>
            </li>
            <li aria-hidden="true" className="text-slate-300">/</li>
            <li aria-current="page">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 font-semibold text-sky-800">
                <Icon name="book" size={14} />
                Blog
              </span>
            </li>
          </ol>
        </nav>

        <header className="vx-fade relative mb-8 overflow-hidden rounded-3xl border border-sky-100 bg-white p-6 shadow-[0_20px_50px_-32px_rgba(2,132,199,0.45)] sm:p-10">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-100/80 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative flex items-start gap-4">
            <LogoMark size={52} uid="blog" className="hidden shrink-0 sm:block" />
            <div className="min-w-0">
              <h1 className="vx-display text-3xl font-extrabold leading-snug text-slate-900 sm:text-5xl">
                Vedoxa Blog
              </h1>
              <p className="mt-3 max-w-prose text-base leading-7 text-slate-600 sm:text-lg">
                Mindset, spirituality aur paise ki samajh par saral Hindi me lekh.
              </p>
              {items.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50/70 px-3 py-1 text-xs font-semibold text-slate-600">
                    <Icon name="file" size={13} />
                    {items.length} lekh
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50/70 px-3 py-1 text-xs font-semibold text-slate-600">
                    <Icon name="tag" size={13} />
                    {categoryCount} category
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>

        <BlogList items={items} failed={failed} />

        {/* FIX 3 UI: Books internal linking section taaki Googlebot har book ko crawl aur index kare */}
        {featuredBooks.length > 0 && (
          <section aria-label="Popular Digital Books" className="mt-14 border-t border-sky-100 pt-10">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="vx-display flex items-center gap-2 text-xl font-extrabold text-slate-900 sm:text-2xl">
                <Icon name="book" size={22} className="text-sky-600" />
                Vedoxa Library ki Pramukh Kitabein
              </h2>
              <Link
                href="/explore"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-sky-700 hover:text-sky-900"
              >
                Sabhi kitabein dekhein
                <Icon name="arrowRight" size={15} />
              </Link>
            </div>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {featuredBooks.map((b) => {
                const cover = bookCoverUrl(b.cover_path)
                const price = formatPrice(b.final_price)
                const bSlug = getBookSlug(b)
                return (
                  <li key={b.id}>
                    <Link
                      href={`/book/${encodeURIComponent(bSlug)}`}
                      className="vx-card flex h-full flex-col rounded-2xl border border-sky-100 bg-white p-3 hover:border-sky-300"
                    >
                      {cover ? (
                        <img
                          src={cover}
                          alt={`${b.title} – Hindi Digital Book`}
                          width={220}
                          height={320}
                          loading="lazy"
                          decoding="async"
                          className="h-36 w-full rounded-xl bg-sky-50 object-contain p-1.5"
                        />
                      ) : (
                        <div className="grid h-36 w-full place-items-center rounded-xl bg-sky-50 text-sky-600" aria-hidden="true">
                          <Icon name="book" size={32} />
                        </div>
                      )}
                      <p className="mt-2.5 line-clamp-2 text-xs font-bold leading-snug text-slate-900 sm:text-sm">
                        {b.title}
                      </p>
                      {price && <p className="mt-auto pt-1.5 text-xs font-bold text-sky-700">{price}</p>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        <section
          aria-label="Library"
          className="mt-14 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-sky-100 bg-white p-6 shadow-[0_20px_50px_-32px_rgba(2,132,199,0.45)] sm:p-8"
        >
          <div className="min-w-0 flex-1 basis-56">
            <p className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Icon name="sparkles" size={20} className="text-sky-600" />
              Lekh pasand aaye?
            </p>
            <p className="mt-1 text-slate-600">Library me aur bhi bahut kuch hai.</p>
          </div>
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-sky-700 px-6 py-3 text-base font-bold text-white transition-colors hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
          >
            Library dekhein
            <Icon name="arrowRight" size={16} />
          </Link>
        </section>

        <div className="mt-10 text-center text-sm">
          <a href="#top" className="inline-flex items-center gap-1.5 text-slate-600 transition-colors hover:text-sky-700">
            Upar jayein
            <Icon name="up" size={14} />
          </a>
        </div>
      </div>
    </div>
  )
}
