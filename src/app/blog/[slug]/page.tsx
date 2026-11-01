/* eslint-disable @next/next/no-img-element */
import { cache } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import ArticleContent, { CopyLinkButton } from '../../../components/blog/ArticleContent'

const SITE_URL = 'https://vedoxa.shop'
const SITE_NAME = 'Vedoxa Premium Library'

export const revalidate = 600

type Props = { params: Promise<{ slug: string }> }

type Post = {
  id?: string | number
  slug: string
  title: string
  description?: string | null
  content?: string | null
  category?: string | null
  tags?: string[] | string | null
  cover_image?: string | null
  published_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}

type Book = {
  id: string | number
  slug?: string | null
  title: string
  cover_path?: string | null
  final_price?: number | string | null
}

type PostLink = { slug: string; title: string }

const BOOK_COLS = 'id, slug, title, cover_path, final_price'
const RELATED_COLS = 'slug, title, description, cover_image, category, published_at'

/* ───────────────────────────── Data helpers ───────────────────────────── */

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    console.error('[blog] Supabase env vars missing (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)')
    return null
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

type Supa = NonNullable<ReturnType<typeof getSupabase>>

// PostgREST "or" filter: post is live when it has no publish date or the date has passed
function liveOr() {
  return `published_at.is.null,published_at.lte.${new Date().toISOString()}`
}

function bookCoverUrl(coverPath?: string | null) {
  if (!coverPath) return null
  if (/^https?:\/\//i.test(coverPath)) return coverPath
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/books-covers/${coverPath}`
}

function mediaUrl(value?: string | null) {
  if (!value) return null
  return /^https?:\/\//i.test(value) || value.startsWith('/') ? value : null
}

function absoluteUrl(value: string) {
  return value.startsWith('/') ? `${SITE_URL}${value}` : value
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function formatDate(value?: string | null) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  try {
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return ''
  }
}

function formatPrice(value: unknown) {
  if (value === null || value === undefined || value === '') return ''
  const n = Number(value)
  return Number.isNaN(n) ? `₹${String(value)}` : `₹${n.toLocaleString('en-IN')}`
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

function countWords(text: string) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length
}

function parseTags(value: unknown): string[] {
  const list = Array.isArray(value) ? value : String(value || '').split(',')
  return list.map((t) => String(t).trim()).filter(Boolean).slice(0, 12)
}

function extractBookKeys(content: string): string[] {
  const keys: string[] = []
  const re = /\/book\/([A-Za-z0-9_-]+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(content || '')) !== null) {
    if (!keys.includes(m[1])) keys.push(m[1])
  }
  return keys
}

const getPost = cache(async (param: string): Promise<Post | null> => {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .or(liveOr())
    .eq('slug', safeDecode(param))
    .limit(1)
    .maybeSingle()

  // Real DB / network failure => throw, so a temporary outage is never cached as a 404
  if (error) throw new Error(`[blog] failed to load post "${param}": ${error.message}`)
  return (data as Post | null) ?? null
})

function pickBooks(all: Book[], content: string): Book[] {
  const linked: Book[] = []
  for (const key of extractBookKeys(content)) {
    const b = all.find((x) => String(x.slug) === key || String(x.id) === key)
    if (b && !linked.includes(b)) linked.push(b)
  }
  const picked = [...linked]
  for (const b of all) {
    if (picked.length >= 3) break
    if (!picked.includes(b)) picked.push(b)
  }
  return picked.slice(0, Math.max(3, Math.min(linked.length, 6)))
}

async function adjacentPost(supabase: Supa, post: Post, dir: 'prev' | 'next'): Promise<PostLink | null> {
  if (!post.published_at) return null
  try {
    const base = supabase.from('posts').select('slug, title').eq('published', true).or(liveOr())
    const { data } =
      dir === 'prev'
        ? await base.lt('published_at', post.published_at).order('published_at', { ascending: false }).limit(1)
        : await base.gt('published_at', post.published_at).order('published_at', { ascending: true }).limit(1)
    return data && data[0] ? (data[0] as PostLink) : null
  } catch {
    return null
  }
}

async function loadRelated(supabase: Supa, post: Post): Promise<Post[]> {
  try {
    const { data } = await supabase
      .from('posts')
      .select(RELATED_COLS)
      .eq('published', true)
      .or(liveOr())
      .neq('slug', post.slug)
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(12)
    return (data as Post[] | null) ?? []
  } catch {
    return []
  }
}

async function loadBooks(supabase: Supa, post: Post): Promise<Book[]> {
  try {
    const { data } = await supabase
      .from('books')
      .select(BOOK_COLS)
      .order('created_at', { ascending: false })
      .limit(100)
    return pickBooks((data as Book[] | null) ?? [], post.content || '')
  } catch {
    return []
  }
}

async function loadExtras(supabase: Supa, post: Post) {
  const [relatedAll, books, prev, next] = await Promise.all([
    loadRelated(supabase, post),
    loadBooks(supabase, post),
    adjacentPost(supabase, post, 'prev'),
    adjacentPost(supabase, post, 'next'),
  ])

  const skip = new Set<string>([prev?.slug, next?.slug].filter((s): s is string => Boolean(s)))
  let pool = relatedAll.filter((r) => !skip.has(r.slug))
  if (post.category) {
    pool = [
      ...pool.filter((r) => r.category === post.category),
      ...pool.filter((r) => r.category !== post.category),
    ]
  }

  return { related: pool.slice(0, 3), books, prev, next }
}

export async function generateStaticParams() {
  const supabase = getSupabase()
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('slug')
      .eq('published', true)
      .or(liveOr())
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(100)
    if (error || !data) return []
    return data.map((p: { slug: string }) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

/* ───────────────────────────── UI pieces ───────────────────────────── */

const PILL =
  'inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-sky-400 hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400'

const SURFACE =
  'rounded-3xl border border-sky-100 bg-white shadow-[0_20px_50px_-32px_rgba(2,132,199,0.45)]'

function ShareBar({ url, title }: { url: string; title: string }) {
  const u = encodeURIComponent(url)
  const t = encodeURIComponent(title)
  const links = [
    { name: 'WhatsApp', href: `https://wa.me/?text=${t}%20${u}` },
    { name: 'Telegram', href: `https://t.me/share/url?url=${u}&text=${t}` },
    { name: 'X', href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
  ]

  return (
    <section aria-label="Share this article" className={`vx-noprint mt-10 p-5 sm:p-6 ${SURFACE}`}>
      <p className="text-base font-bold text-slate-900">Enjoyed this article? Share it with your friends</p>
      <div className="mt-4 flex flex-wrap gap-2.5">
        <NativeShareButton url={url} title={title} className={PILL} />
        {links.map((l) => (
          <a
            key={l.name}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${l.name}`}
            className={PILL}
          >
            {l.name}
          </a>
        ))}
        <CopyLinkButton url={url} className={PILL} />
      </div>
    </section>
  )
}

const PAGE_CSS = `
.vx-display{font-family:var(--font-vx-display,var(--font-vx-body,ui-sans-serif)),'Noto Sans Devanagari',ui-sans-serif,system-ui,sans-serif}
@keyframes vx-fade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.vx-fade{animation:vx-fade .6s cubic-bezier(.22,1,.36,1) both}
.vx-card{transition:border-color .2s ease,box-shadow .25s ease}
.vx-card:hover{box-shadow:0 16px 36px -22px rgba(2,132,199,.5)}
@media (prefers-reduced-motion:no-preference){html{scroll-behavior:smooth}}
@media (prefers-reduced-motion:reduce){.vx-fade{animation:none}.vx-card{transition:none}}
@media print{.vx-noprint{display:none!important}}
`

/* ───────────────────────────── Metadata ───────────────────────────── */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    return { title: 'Article not found', robots: { index: false, follow: false } }
  }

  const url = `${SITE_URL}/blog/${post.slug}`
  const description = post.description
    ? shorten(post.description, 155)
    : shorten(plainText(post.content || ''), 155)
  const cover = mediaUrl(post.cover_image)
  const coverAbs = cover ? absoluteUrl(cover) : null
  const tags = parseTags(post.tags)
  const publishedAt = post.published_at || post.created_at || undefined

  return {
    title: post.title,
    description,
    keywords: tags.length ? tags : undefined,
    alternates: { canonical: url },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    openGraph: {
      title: post.title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'article',
      locale: 'hi_IN',
      publishedTime: publishedAt,
      modifiedTime: post.updated_at || publishedAt,
      section: post.category || undefined,
      tags: tags.length ? tags : undefined,
      images: coverAbs ? [{ url: coverAbs, alt: post.title }] : undefined,
    },
    twitter: {
      card: coverAbs ? 'summary_large_image' : 'summary',
      title: post.title,
      description,
      images: coverAbs ? [coverAbs] : undefined,
    },
  }
}

/* ───────────────────────────── Page ───────────────────────────── */

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) notFound()

  const url = `${SITE_URL}/blog/${post.slug}`
  const content = post.content || ''

  const supabase = getSupabase()
  const { related, books, prev, next } = supabase
    ? await loadExtras(supabase, post)
    : { related: [] as Post[], books: [] as Book[], prev: null as PostLink | null, next: null as PostLink | null }

  const text = plainText(content)
  const words = countWords(text)
  const readMins = Math.max(1, Math.ceil(words / 200))
  const cover = mediaUrl(post.cover_image)
  const coverAbs = cover ? absoluteUrl(cover) : null
  const tags = parseTags(post.tags)
  const description = post.description || shorten(text, 155)
  const publishedAt = post.published_at || post.created_at || null

  const updated = Boolean(
    post.updated_at &&
      publishedAt &&
      new Date(post.updated_at).getTime() - new Date(publishedAt).getTime() > 24 * 60 * 60 * 1000
  )

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: post.title,
        description,
        inLanguage: 'hi-IN',
        datePublished: publishedAt || undefined,
        dateModified: post.updated_at || publishedAt || undefined,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        image: coverAbs ? [coverAbs] : undefined,
        wordCount: words,
        articleSection: post.category || undefined,
        keywords: tags.length ? tags.join(', ') : undefined,
        isAccessibleForFree: true,
        author: { '@type': 'Organization', name: 'Vedoxa', url: SITE_URL },
        publisher: {
          '@type': 'Organization',
          name: 'Vedoxa',
          url: SITE_URL,
          logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.svg` },
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Vedoxa', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
          { '@type': 'ListItem', position: 3, name: post.title, item: url },
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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem]"
        style={{ background: 'radial-gradient(60% 60% at 50% 0%, rgba(125,211,252,0.35), transparent)' }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-3xl px-4 py-6 sm:px-6 md:py-10">
        <nav aria-label="Breadcrumb" className="vx-noprint mb-6">
          <ol className="flex min-w-0 items-center gap-2 text-xs text-slate-500 sm:text-sm">
            <li className="shrink-0">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-white px-3 py-1 font-medium transition-colors hover:text-sky-700"
              >
                <Icon name="home" size={14} />
                Vedoxa
              </Link>
            </li>
            <li aria-hidden="true" className="text-slate-300">/</li>
            <li className="shrink-0">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-white px-3 py-1 font-medium transition-colors hover:text-sky-700"
              >
                <Icon name="book" size={14} />
                Blog
              </Link>
            </li>
            <li aria-hidden="true" className="text-slate-300">/</li>
            <li className="min-w-0 flex-1 truncate text-slate-400" aria-current="page">
              {post.title}
            </li>
          </ol>
        </nav>

        <article>
          {/* Article header */}
          <header className={`vx-fade relative overflow-hidden p-5 sm:p-8 ${SURFACE}`}>
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky-100/80 blur-2xl"
              aria-hidden="true"
            />

            <div className="relative">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">
                  {post.category || 'Vedoxa Special'}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50/70 px-3 py-1 text-xs font-semibold text-slate-600">
                  <Icon name="clock" size={13} />
                  {readMins} min read
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50/70 px-3 py-1 text-xs font-semibold text-slate-600">
                  <Icon name="file" size={13} />
                  {words.toLocaleString('en-IN')} words
                </span>
              </div>

              <h1 className="vx-display text-2xl font-extrabold leading-[1.3] text-slate-900 [text-wrap:balance] sm:text-4xl sm:leading-[1.25]">
                {post.title}
              </h1>

              {post.description && (
                <p className="mt-3 line-clamp-3 text-base leading-relaxed text-slate-600 sm:text-lg">
                  {post.description}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-sky-100 pt-4 text-xs text-slate-500 sm:text-sm">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-sky-600 font-black text-white">
                    V
                  </div>
                  <div>
                    <p className="font-bold leading-none text-slate-900">Vedoxa Editorial</p>
                    {publishedAt && (
                      <time dateTime={publishedAt} className="mt-1 block text-[11px] text-slate-500">
                        {formatDate(publishedAt)}
                      </time>
                    )}
                  </div>
                </div>
                {updated && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <Icon name="check" size={13} />
                    Updated {formatDate(post.updated_at)}
                  </span>
                )}
              </div>
            </div>
          </header>

          {cover && (
            <img
              src={cover}
              alt={post.title}
              decoding="async"
              className="vx-fade mt-6 aspect-[16/9] w-full rounded-3xl border border-sky-100 object-cover shadow-[0_20px_50px_-30px_rgba(2,132,199,0.5)]"
            />
          )}

          <div className="mt-6">
            <ArticleContent content={content} articleId={post.slug} />
          </div>
        </article>

        {tags.length > 0 && (
          <ul className="vx-noprint mt-8 flex flex-wrap gap-2" aria-label="Tags">
            {tags.map((t) => (
              <li
                key={t}
                className="rounded-full border border-sky-100 bg-white px-3 py-1 text-xs font-medium text-slate-600"
              >
                #{t}
              </li>
            ))}
          </ul>
        )}

        <ShareBar url={url} title={post.title} />

        {/* Author card */}
        <section
          aria-label="About the author"
          className={`vx-noprint mt-6 flex items-center gap-4 p-5 sm:p-6 ${SURFACE}`}
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-lg font-black text-white">
            V
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-900">Written by Vedoxa Editorial</p>
            <p className="mt-0.5 text-sm text-slate-500">Discover more guides, stories and books from the Vedoxa library.</p>
          </div>
          <Link
            href="/explore"
            className="hidden shrink-0 items-center gap-1.5 rounded-full bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-800 sm:inline-flex"
          >
            Explore
            <Icon name="arrowRight" size={15} />
          </Link>
        </section>

        {books.length > 0 && (
          <section className="vx-noprint mt-14 border-t border-sky-100 pt-10">
            <h2 className="vx-display mb-5 text-xl font-extrabold text-slate-900">
              Recommended books on this topic
            </h2>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {books.map((b) => {
                const c = bookCoverUrl(b.cover_path)
                const price = formatPrice(b.final_price)
                return (
                  <li key={b.id}>
                    <Link
                      href={`/book/${b.slug || b.id}`}
                      className="vx-card block h-full rounded-2xl border border-sky-100 bg-white p-3 hover:border-sky-300"
                    >
                      {c ? (
                        <img
                          src={c}
                          alt={`${b.title} book cover`}
                          className="h-44 w-full rounded-xl bg-sky-50 object-contain p-2"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="grid h-44 w-full place-items-center rounded-xl bg-sky-50 text-sky-600" aria-hidden="true">
                          <Icon name="book" size={36} />
                        </div>
                      )}
                      <p className="mt-3 line-clamp-2 text-sm font-bold leading-snug text-slate-900">{b.title}</p>
                      {price && <p className="mt-1 text-sm font-bold text-sky-700">{price}</p>}
                    </Link>
                  </li>
                )
              })}
            </ul>
            <div className="mt-6 text-center">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-full border border-sky-300 bg-white px-5 py-2.5 text-sm font-bold text-sky-800 transition-colors hover:bg-sky-50"
              >
                Browse all books
                <Icon name="arrowRight" size={15} />
              </Link>
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="vx-noprint mt-12">
            <h2 className="vx-display mb-4 text-xl font-extrabold text-slate-900">You might also like</h2>
            <ul className="grid gap-3">
              {related.map((r) => {
                const rc = mediaUrl(r.cover_image)
                const snippet = r.description ? shorten(r.description, 110) : ''
                const date = formatDate(r.published_at)
                return (
                  <li key={r.slug}>
                    <Link
                      href={`/blog/${r.slug}`}
                      className="vx-card flex gap-4 rounded-2xl border border-sky-100 bg-white p-4 hover:border-sky-300"
                    >
                      {rc && (
                        <img
                          src={rc}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-24 w-24 shrink-0 rounded-xl object-cover sm:h-28 sm:w-28"
                        />
                      )}
                      <span className="min-w-0 flex-1">
                        {r.category && (
                          <span className="inline-block rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-bold text-sky-800">
                            {r.category}
                          </span>
                        )}
                        <span className="vx-display mt-1.5 line-clamp-2 block text-base font-bold leading-snug text-slate-900">
                          {r.title}
                        </span>
                        {snippet && (
                          <span className="mt-1 line-clamp-2 block text-sm text-slate-600">{snippet}</span>
                        )}
                        {date && <span className="mt-2 block text-xs text-slate-500">{date}</span>}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {(prev || next) && (
          <nav aria-label="Previous and next articles" className="vx-noprint mt-12 grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link
                href={`/blog/${prev.slug}`}
                className="vx-card rounded-2xl border border-sky-100 bg-white p-4 hover:border-sky-300"
              >
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Icon name="arrowLeft" size={13} />
                  Previous article
                </span>
                <span className="mt-1 line-clamp-2 block font-bold leading-snug text-slate-900">{prev.title}</span>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
            {next && (
              <Link
                href={`/blog/${next.slug}`}
                className="vx-card rounded-2xl border border-sky-100 bg-white p-4 hover:border-sky-300 sm:text-right"
              >
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  Next article
                  <Icon name="arrowRight" size={13} />
                </span>
                <span className="mt-1 line-clamp-2 block font-bold leading-snug text-slate-900">{next.title}</span>
              </Link>
            )}
          </nav>
        )}

        <div className="vx-noprint mt-12 flex items-center justify-between border-t border-sky-100 pt-6 text-sm">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-slate-600 transition-colors hover:text-sky-700">
            <Icon name="arrowLeft" size={14} />
            All articles
          </Link>
          <a href="#top" className="inline-flex items-center gap-1.5 text-slate-600 transition-colors hover:text-sky-700">
            Back to top
            <Icon name="up" size={14} />
          </a>
        </div>
      </div>
    </div>
  )
}

