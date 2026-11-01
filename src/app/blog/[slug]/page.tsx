/* eslint-disable @next/next/no-img-element */
import { cache } from 'react'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

// Sitemap.ts wale SITE_URL ke saath same rakho
const SITE_URL = 'https://vedoxa.shop'
const SITE_NAME = 'Vedoxa Premium Library'

// Article 10 minute tak cache rehta hai, phir apne aap naya ho jata hai
export const revalidate = 600

type Props = { params: any }

/* ------------------------------------------------------------------ */
/*  Supabase + helpers                                                 */
/* ------------------------------------------------------------------ */

const BOOK_COLS = 'id, slug, title, cover_path, final_price'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

// Sirf live articles: published ho aur uska time aa chuka ho (schedule wale future me chhupe rehte hain)
function onlyLive(q: any) {
  return q.eq('published', true).or(`published_at.is.null,published_at.lte.${new Date().toISOString()}`)
}

function bookCoverUrl(coverPath?: string | null) {
  if (!coverPath) return null
  if (/^https?:\/\//i.test(coverPath)) return coverPath
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/books-covers/${coverPath}`
}

// Article ki cover image (BlogManager se poora URL save hota hai)
function mediaUrl(value?: string | null) {
  if (!value) return null
  return /^https?:\/\//i.test(value) || value.startsWith('/') ? value : null
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

function formatPrice(value: any) {
  if (value === null || value === undefined || value === '') return ''
  const n = Number(value)
  return Number.isNaN(n) ? `₹${value}` : `₹${n.toLocaleString('en-IN')}`
}

function shorten(text: string, max: number) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim()
  return clean.length > max ? clean.slice(0, max - 1).trimEnd() + '…' : clean
}

// Markdown hata kar saaf text (description / snippets ke liye)
function plainText(md: string) {
  return String(md || '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,3}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^(-|\d+\.)\s+/gm, '')
    .replace(/^---+$/gm, '')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function plainInline(text: string) {
  return text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '')
}

function countWords(text: string) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length
}

function parseTags(value: any): string[] {
  const list = Array.isArray(value) ? value : String(value || '').split(',')
  return list.map((t: any) => String(t).trim()).filter(Boolean).slice(0, 12)
}

// Article /book/<slug> ke jitne links hain, unki keys (order me)
function extractBookKeys(content: string): string[] {
  const keys: string[] = []
  const re = /\/book\/([A-Za-z0-9_-]+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(content || '')) !== null) {
    if (!keys.includes(m[1])) keys.push(m[1])
  }
  return keys
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

// Ek hi request me generateMetadata aur page dono ko wahi article milta hai
const getPost = cache(async (param: string) => {
  const supabase = getSupabase()
  if (!supabase) return null

  try {
    const { data } = await onlyLive(supabase.from('posts').select('*'))
      .eq('slug', safeDecode(param))
      .maybeSingle()
    return data ?? null
  } catch {
    return null
  }
})

// Books: pehle wo jo article me link hain, phir sabse nayi books (kul 3, link zyada hon to 6 tak)
function pickBooks(all: any[], content: string) {
  const linked: any[] = []
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

async function loadExtras(supabase: SupabaseClient, post: any) {
  const out: { related: any[]; books: any[]; prev: any; next: any } = {
    related: [],
    books: [],
    prev: null,
    next: null,
  }

  try {
    const hasDate = !!post.published_at
    const [relRes, bookRes, prevRes, nextRes]: any[] = await Promise.all([
      onlyLive(supabase.from('posts').select('*'))
        .neq('id', post.id)
        .order('published_at', { ascending: false })
        .limit(12),
      supabase.from('books').select(BOOK_COLS).order('created_at', { ascending: false }).limit(100),
      hasDate
        ? onlyLive(supabase.from('posts').select('slug, title'))
            .lt('published_at', post.published_at)
            .order('published_at', { ascending: false })
            .limit(1)
        : Promise.resolve({ data: [] }),
      hasDate
        ? onlyLive(supabase.from('posts').select('slug, title'))
            .gt('published_at', post.published_at)
            .order('published_at', { ascending: true })
            .limit(1)
        : Promise.resolve({ data: [] }),
    ])

    out.prev = (prevRes && prevRes.data && prevRes.data[0]) || null
    out.next = (nextRes && nextRes.data && nextRes.data[0]) || null

    const skip = new Set<string>([out.prev && out.prev.slug, out.next && out.next.slug].filter(Boolean))
    let pool: any[] = ((relRes && relRes.data) || []).filter((r: any) => !skip.has(r.slug))
    if (post.category) {
      pool = [
        ...pool.filter((r) => r.category === post.category),
        ...pool.filter((r) => r.category !== post.category),
      ]
    }
    out.related = pool.slice(0, 3)

    out.books = pickBooks((bookRes && bookRes.data) || [], post.content || '')
  } catch {
    // extras na mile to bhi article dikhna chahiye
  }

  return out
}

export async function generateStaticParams() {
  const supabase = getSupabase()
  if (!supabase) return []
  try {
    const { data } = await onlyLive(supabase.from('posts').select('slug'))
      .order('published_at', { ascending: false })
      .limit(100)
    return (data ?? []).map((p: any) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

/* ------------------------------------------------------------------ */
/*  Article text -> blocks                                             */
/*  ## heading, ### chhota heading, **bold**, *italic*, `code`,       */
/*  [text](link), - bullets, 1. numbered, > quote, ---, ![alt](url)   */
/* ------------------------------------------------------------------ */

type Block =
  | { t: 'h2'; text: string; id: string }
  | { t: 'h3'; text: string }
  | { t: 'p'; text: string }
  | { t: 'ul'; items: string[] }
  | { t: 'ol'; items: string[] }
  | { t: 'quote'; text: string }
  | { t: 'img'; alt: string; src: string }
  | { t: 'hr' }

const IMG_BLOCK_RE = /^!\[([^\]]*)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)$/

function parseBlocks(content: string) {
  const blocks: Block[] = []
  const toc: { id: string; text: string }[] = []
  let h = 0

  const push = (chunk: string): void => {
    const text = chunk.trim()
    if (!text) return

    const img = text.match(IMG_BLOCK_RE)
    if (img) {
      blocks.push({ t: 'img', alt: img[1], src: img[2] })
      return
    }

    if (/^---+$/.test(text)) {
      blocks.push({ t: 'hr' })
      return
    }

    const lines = text.split('\n')
    const first = lines[0].trim()

    if (first.startsWith('### ')) {
      const label = first.slice(4).trim()
      if (label) blocks.push({ t: 'h3', text: label })
      push(lines.slice(1).join('\n'))
      return
    }

    if (first.startsWith('## ')) {
      const label = first.slice(3).trim()
      if (label) {
        h += 1
        const id = `section-${h}`
        toc.push({ id, text: plainInline(label) })
        blocks.push({ t: 'h2', text: label, id })
      }
      push(lines.slice(1).join('\n'))
      return
    }

    if (lines.every((l) => l.trim().startsWith('> '))) {
      blocks.push({ t: 'quote', text: lines.map((l) => l.trim().slice(2)).join(' ') })
      return
    }

    if (lines.every((l) => l.trim().startsWith('- '))) {
      blocks.push({ t: 'ul', items: lines.map((l) => l.trim().slice(2)) })
      return
    }

    if (lines.every((l) => /^\d+\.\s/.test(l.trim()))) {
      blocks.push({ t: 'ol', items: lines.map((l) => l.trim().replace(/^\d+\.\s/, '')) })
      return
    }

    blocks.push({ t: 'p', text: lines.join('\n') })
  }

  String(content || '')
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .forEach((chunk) => push(chunk))

  return { blocks, toc }
}

const LINK_CLS = 'text-amber-400 underline underline-offset-4 hover:text-amber-300'

// Sirf "/" ya http(s) wale links aur images chalte hain
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = []
  const re =
    /(\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\))|(\*\*([^*]+)\*\*)|(\*([^*\n]+)\*)|(`([^`]+)`)|(!\[([^\]]*)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\))/g
  let last = 0
  let i = 0
  let m: RegExpExecArray | null

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    const key = `${keyPrefix}-${i}`

    if (m[1]) {
      const label = m[2]
      const href = m[3]
      parts.push(
        href.startsWith('/') ? (
          <Link key={key} href={href} className={LINK_CLS}>
            {label}
          </Link>
        ) : (
          <a key={key} href={href} target="_blank" rel="noopener noreferrer" className={LINK_CLS}>
            {label}
          </a>
        )
      )
    } else if (m[4]) {
      parts.push(
        <strong key={key} className="font-bold text-white">
          {m[5]}
        </strong>
      )
    } else if (m[6]) {
      parts.push(<em key={key}>{m[7]}</em>)
    } else if (m[8]) {
      parts.push(
        <code key={key} className="rounded bg-white/10 px-1.5 py-0.5 text-[0.9em] text-pink-300">
          {m[9]}
        </code>
      )
    } else {
      parts.push(
        <img
          key={key}
          src={m[12]}
          alt={m[11]}
          loading="lazy"
          decoding="async"
          className="my-2 inline-block max-w-full rounded-lg"
        />
      )
    }

    last = m.index + m[0].length
    i++
  }

  if (last < text.length) parts.push(text.slice(last))
  return parts
}

function Body({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, idx) => {
        const k = `b${idx}`

        if (b.t === 'h2') {
          return (
            <h2
              key={k}
              id={b.id}
              className="scroll-mt-24 font-serif text-2xl font-bold text-white mt-12 mb-4 border-l-4 border-amber-500/70 pl-3"
            >
              {renderInline(b.text, k)}
            </h2>
          )
        }

        if (b.t === 'h3') {
          return (
            <h3 key={k} className="font-serif text-xl font-bold text-white mt-8 mb-3">
              {renderInline(b.text, k)}
            </h3>
          )
        }

        if (b.t === 'ul') {
          return (
            <ul key={k} className="list-disc pl-6 my-5 space-y-2 leading-8 text-gray-300 marker:text-amber-500">
              {b.items.map((item, j) => (
                <li key={j}>{renderInline(item, `${k}-${j}`)}</li>
              ))}
            </ul>
          )
        }

        if (b.t === 'ol') {
          return (
            <ol key={k} className="list-decimal pl-6 my-5 space-y-2 leading-8 text-gray-300 marker:text-amber-500">
              {b.items.map((item, j) => (
                <li key={j}>{renderInline(item, `${k}-${j}`)}</li>
              ))}
            </ol>
          )
        }

        if (b.t === 'quote') {
          return (
            <blockquote
              key={k}
              className="my-6 rounded-r-2xl border-l-4 border-amber-500/60 bg-white/[0.03] py-3 pl-5 pr-4 italic leading-8 text-gray-300"
            >
              {renderInline(b.text, k)}
            </blockquote>
          )
        }

        if (b.t === 'img') {
          return (
            <figure key={k} className="my-8">
              <img
                src={b.src}
                alt={b.alt}
                loading="lazy"
                decoding="async"
                className="h-auto w-full rounded-2xl border border-white/10"
              />
              {b.alt && <figcaption className="mt-2 text-center text-sm text-gray-500">{b.alt}</figcaption>}
            </figure>
          )
        }

        if (b.t === 'hr') {
          return <hr key={k} className="my-10 border-white/10" />
        }

        return (
          <p key={k} className="my-5 whitespace-pre-line leading-8 text-gray-300">
            {renderInline(b.text, k)}
          </p>
        )
      })}
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Small UI pieces                                                    */
/* ------------------------------------------------------------------ */

function ShareBar({ url, title }: { url: string; title: string }) {
  const u = encodeURIComponent(url)
  const t = encodeURIComponent(title)
  const links = [
    { name: 'WhatsApp', href: `https://wa.me/?text=${t}%20${u}`, cls: 'hover:border-green-400/60 hover:text-green-300' },
    { name: 'Telegram', href: `https://t.me/share/url?url=${u}&text=${t}`, cls: 'hover:border-sky-400/60 hover:text-sky-300' },
    { name: 'X', href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`, cls: 'hover:border-white/60 hover:text-white' },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, cls: 'hover:border-blue-400/60 hover:text-blue-300' },
  ]

  return (
    <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <p className="text-sm font-bold text-white">Pasand aaya? Share karo</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {links.map((l) => (
          <a
            key={l.name}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${l.name} par share karo`}
            className={`rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-gray-300 transition-colors ${l.cls}`}
          >
            {l.name}
          </a>
        ))}
      </div>
    </div>
  )
}

const PAGE_CSS = `
.vx-progress{display:none}
@supports (animation-timeline: scroll()){
  .vx-progress{display:block;position:fixed;top:0;left:0;right:0;height:3px;z-index:60;transform:scaleX(0);transform-origin:0 50%;background:linear-gradient(90deg,#f59e0b,#ec4899,#8b5cf6);animation:vx-grow linear both;animation-timeline:scroll(root block)}
}
@keyframes vx-grow{to{transform:scaleX(1)}}
@keyframes vx-fade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.vx-fade{animation:vx-fade .6s cubic-bezier(.22,1,.36,1) both}
.vx-card{transition:transform .25s ease,border-color .25s ease,box-shadow .25s ease}
.vx-card:hover{transform:translateY(-3px);box-shadow:0 16px 40px -18px rgba(245,158,11,.35)}
.vx-toc summary::-webkit-details-marker{display:none}
@media (prefers-reduced-motion:no-preference){html{scroll-behavior:smooth}}
@media (prefers-reduced-motion:reduce){.vx-fade{animation:none}.vx-card{transition:none}.vx-progress{display:none!important}}
`

/* ------------------------------------------------------------------ */
/*  SEO metadata                                                       */
/* ------------------------------------------------------------------ */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post: any = await getPost(slug)

  if (!post) {
    return { title: 'Article not found', robots: { index: false, follow: false } }
  }

  const url = `${SITE_URL}/blog/${post.slug}`
  const description = post.description
    ? shorten(post.description, 155)
    : shorten(plainText(post.content), 155)
  const cover = mediaUrl(post.cover_image)
  const tags = parseTags(post.tags)

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
      publishedTime: post.published_at,
      modifiedTime: post.updated_at || post.published_at,
      section: post.category || undefined,
      tags: tags.length ? tags : undefined,
      images: cover ? [{ url: cover, alt: post.title }] : undefined,
    },
    twitter: {
      card: cover ? 'summary_large_image' : 'summary',
      title: post.title,
      description,
      images: cover ? [cover] : undefined,
    },
  }
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post: any = await getPost(slug)

  if (!post) notFound()

  const url = `${SITE_URL}/blog/${post.slug}`
  const content: string = post.content || ''

  const supabase = getSupabase()
  const { related, books, prev, next } = supabase
    ? await loadExtras(supabase, post)
    : { related: [] as any[], books: [] as any[], prev: null as any, next: null as any }

  const { blocks, toc } = parseBlocks(content)
  const words = countWords(content)
  const readMins = Math.max(1, Math.ceil(words / 200))
  const cover = mediaUrl(post.cover_image)
  const tags = parseTags(post.tags)
  const description = post.description || shorten(plainText(content), 155)

  const updated =
    post.updated_at &&
    post.published_at &&
    new Date(post.updated_at).getTime() - new Date(post.published_at).getTime() > 24 * 60 * 60 * 1000

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: post.title,
        description,
        datePublished: post.published_at,
        dateModified: post.updated_at || post.published_at,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        image: cover ? [cover] : undefined,
        wordCount: words,
        articleSection: post.category || undefined,
        keywords: tags.length ? tags.join(', ') : undefined,
        author: { '@type': 'Organization', name: 'Vedoxa' },
        publisher: { '@type': 'Organization', name: 'Vedoxa' },
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
    <div id="top" className="relative min-h-screen bg-[#07070d] text-gray-200 selection:bg-amber-500/30">
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />
      <div className="vx-progress" aria-hidden="true" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-80"
        style={{ background: 'radial-gradient(60% 60% at 50% 0%, rgba(245,158,11,0.10), transparent)' }}
        aria-hidden="true"
      />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        <nav aria-label="Breadcrumb" className="text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-amber-400 transition-colors">
            Vedoxa
          </Link>
          <span className="mx-2 text-gray-600">/</span>
          <Link href="/blog" className="hover:text-amber-400 transition-colors">
            Blog
          </Link>
        </nav>

        <article>
          <header className="vx-fade">
            {post.category && (
              <span className="mb-3 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
                {post.category}
              </span>
            )}
            <h1 className="font-serif text-3xl sm:text-4xl font-bold leading-snug text-white">
              {post.title}
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
              <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
              <span aria-hidden="true">•</span>
              <span>~{readMins} min padhne me</span>
              <span aria-hidden="true">•</span>
              <span>{words} shabd</span>
              {updated && (
                <>
                  <span aria-hidden="true">•</span>
                  <span>Updated: {formatDate(post.updated_at)}</span>
                </>
              )}
            </p>
          </header>

          {cover && (
            <img
              src={cover}
              alt={post.title}
              decoding="async"
              className="vx-fade mt-8 h-auto w-full rounded-2xl border border-white/10 object-cover"
            />
          )}

          {toc.length >= 3 && (
            <details className="vx-toc group mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-white">
                Is article me
                <span aria-hidden="true" className="text-amber-400 transition-transform group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <ol className="mt-4 space-y-2 text-sm text-gray-400">
                {toc.map((item, i) => (
                  <li key={item.id} className="flex gap-3">
                    <span className="text-amber-500/80">{i + 1}.</span>
                    <a href={`#${item.id}`} className="hover:text-amber-300 transition-colors">
                      {item.text}
                    </a>
                  </li>
                ))}
              </ol>
            </details>
          )}

          <div className="mt-6 max-w-prose">
            <Body blocks={blocks} />
          </div>
        </article>

        {tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
                #{t}
              </span>
            ))}
          </div>
        )}

        <ShareBar url={url} title={post.title} />

        {books.length > 0 && (
          <section className="mt-14 border-t border-white/10 pt-10">
            <h2 className="font-serif text-xl font-bold text-white mb-5">
              Is vishay par padhne ke liye books
            </h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {books.map((b) => {
                const c = bookCoverUrl(b.cover_path)
                const price = formatPrice(b.final_price)
                return (
                  <li key={b.id}>
                    <Link
                      href={`/book/${b.slug || b.id}`}
                      className="vx-card block h-full rounded-2xl border border-white/10 bg-white/[0.03] p-3 hover:border-amber-500/40"
                    >
                      {c ? (
                        <img
                          src={c}
                          alt={`${b.title} book cover`}
                          className="w-full h-44 object-contain rounded-lg"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="grid h-44 w-full place-items-center rounded-lg bg-white/5 text-4xl">📘</div>
                      )}
                      <p className="mt-3 text-sm font-bold text-white line-clamp-2">{b.title}</p>
                      {price && <p className="mt-1 text-sm text-amber-400 font-bold">{price}</p>}
                    </Link>
                  </li>
                )
              })}
            </ul>
            <div className="mt-5 text-center">
              <Link
                href="/explore"
                className="inline-block rounded-full border border-amber-500/40 px-5 py-2.5 text-sm font-bold text-amber-300 transition-colors hover:bg-amber-500/10"
              >
                Saari books dekho →
              </Link>
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="font-serif text-xl font-bold text-white mb-4">Ye bhi padhein</h2>
            <ul className="grid gap-3">
              {related.map((r) => {
                const rc = mediaUrl(r.cover_image)
                const snippet = r.description
                  ? shorten(r.description, 110)
                  : shorten(plainText(r.content || ''), 110)
                return (
                  <li key={r.slug}>
                    <Link
                      href={`/blog/${r.slug}`}
                      className="vx-card flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-amber-500/40"
                    >
                      {rc && (
                        <img
                          src={rc}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-20 w-20 shrink-0 rounded-xl object-cover"
                        />
                      )}
                      <span className="min-w-0">
                        <span className="block font-serif text-base font-bold text-white line-clamp-2">{r.title}</span>
                        {snippet && <span className="mt-1 block text-sm text-gray-400 line-clamp-2">{snippet}</span>}
                        <span className="mt-2 block text-xs text-gray-500">{formatDate(r.published_at)}</span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {(prev || next) && (
          <nav aria-label="Pichhla aur agla article" className="mt-12 grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link
                href={`/blog/${prev.slug}`}
                className="vx-card rounded-2xl border border-white/10 p-4 hover:border-amber-500/40"
              >
                <span className="text-xs text-gray-500">← Pichhla article</span>
                <span className="mt-1 block font-bold text-white line-clamp-2">{prev.title}</span>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
            {next && (
              <Link
                href={`/blog/${next.slug}`}
                className="vx-card rounded-2xl border border-white/10 p-4 hover:border-amber-500/40 sm:text-right"
              >
                <span className="text-xs text-gray-500">Agla article →</span>
                <span className="mt-1 block font-bold text-white line-clamp-2">{next.title}</span>
              </Link>
            )}
          </nav>
        )}

        <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-6 text-sm">
          <Link href="/blog" className="text-gray-400 transition-colors hover:text-amber-400">
            ← Saare articles
          </Link>
          <a href="#top" className="text-gray-400 transition-colors hover:text-amber-400">
            ↑ Upar jao
          </a>
        </div>
      </div>
    </div>
  )
}
