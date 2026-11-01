/* eslint-disable @next/next/no-img-element */
import { cache } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Baloo_2, Hind } from 'next/font/google'
import { createClient } from '@supabase/supabase-js'
import ArticleContent, { CopyLinkButton } from '@/components/blog/ArticleContent'

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

/* ───────────────────────────── Fonts (Hindi + Latin dono support) ───────────────────────────── */

// Soft, rounded display face for headings; calm reading face for body
const fontDisplay = Baloo_2({
  subsets: ['latin', 'devanagari'],
  weight: ['600', '700', '800'],
  display: 'swap',
  variable: '--font-vx-display',
})

const fontBody = Hind({
  subsets: ['latin', 'devanagari'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-vx-body',
})

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
    return d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })
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
    <section aria-label="Article share karein" className="vx-glass mt-10 rounded-3xl p-5 sm:p-6">
      <p className="vx-ink vx-emboss text-sm font-bold sm:text-base">
        📢 Article pasand aaya? Doston ke saath share karein
      </p>
      <div className="mt-4 flex flex-wrap gap-2.5">
        {links.map((l, i) => (
          <a
            key={l.name}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${l.name} par share karo`}
            className={`vx-pill ${i % 2 ? 'vx-pill-sky' : 'vx-pill-pink'}`}
          >
            {l.name}
          </a>
        ))}
        <span className="vx-copy contents">
          <CopyLinkButton url={url} />
        </span>
      </div>
    </section>
  )
}

/*
  Design tokens
  Pearl  #fff8fc / #f3f9ff   (page wash)      Ink   #232a4a / #414a70 / #5b6488 (text)
  Blush  #ffd6e8 / #f9a8d4   (light pink)     Deep  #c2306f (pink text accent)
  Sky    #cfe9ff / #8fd0ff   (light sky blue) Deep  #1f6fb5 (sky text accent)
  "Ubhre hue" text = layered text-shadow (white top light + coloured soft drop) -> .vx-emboss / .vx-title
*/
const PAGE_CSS = `
.vx-root{--ink:#232a4a;--ink-2:#414a70;--ink-3:#5b6488;--pink:#f9a8d4;--pink-deep:#c2306f;--sky:#8fd0ff;--sky-deep:#1f6fb5;--shadow:0 22px 50px -24px rgba(110,130,220,.45),0 8px 22px -12px rgba(244,114,182,.28);font-family:var(--font-vx-body),'Noto Sans Devanagari',ui-sans-serif,system-ui,sans-serif;color:var(--ink-2);background:linear-gradient(165deg,#fff8fc 0%,#f3f9ff 48%,#fff4fa 100%);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
.vx-root ::selection{background:rgba(249,168,212,.5);color:var(--ink)}
.vx-root :is(a,button):focus-visible{outline:2px solid var(--sky-deep);outline-offset:3px}
.vx-ink{color:var(--ink)}
.vx-ink-3{color:var(--ink-3)}
.vx-title,.vx-h2,.vx-btn,.vx-avatar,.vx-prose :is(h1,h2,h3,h4){font-family:var(--font-vx-display),var(--font-vx-body),sans-serif}

/* reading progress */
.vx-progress{display:none}
@supports (animation-timeline:scroll()){
  .vx-progress{display:block;position:fixed;top:0;left:0;right:0;height:4px;z-index:60;transform:scaleX(0);transform-origin:0 50%;background:linear-gradient(90deg,#ffa3cd,#c9b8ff,#8fd0ff);box-shadow:0 0 14px rgba(255,150,200,.65);animation:vx-grow linear both;animation-timeline:scroll(root block)}
}
@keyframes vx-grow{to{transform:scaleX(1)}}

/* pastel backdrop (glass ko blur karne ke liye rang chahiye) */
.vx-bg{position:sticky;top:0;z-index:0;height:100vh;height:100lvh;margin-bottom:-100vh;margin-bottom:-100lvh;overflow:hidden;pointer-events:none}
.vx-blob{position:absolute;border-radius:50%;will-change:transform}
.vx-b1{width:70vmax;height:70vmax;left:-26vmax;top:-30vmax;background:radial-gradient(circle,rgba(255,176,214,.78),transparent 62%);animation:vx-f1 36s ease-in-out infinite alternate}
.vx-b2{width:64vmax;height:64vmax;right:-28vmax;top:-8vmax;background:radial-gradient(circle,rgba(150,210,255,.82),transparent 62%);animation:vx-f2 44s ease-in-out infinite alternate}
.vx-b3{width:60vmax;height:60vmax;left:6vmax;bottom:-34vmax;background:radial-gradient(circle,rgba(255,214,232,.85),transparent 62%);animation:vx-f3 40s ease-in-out infinite alternate}
.vx-b4{width:50vmax;height:50vmax;right:-14vmax;bottom:-24vmax;background:radial-gradient(circle,rgba(190,228,255,.8),transparent 62%);animation:vx-f1 52s ease-in-out infinite alternate-reverse}
@keyframes vx-f1{to{transform:translate3d(6vmax,5vmax,0) scale(1.08)}}
@keyframes vx-f2{to{transform:translate3d(-7vmax,6vmax,0) scale(1.1)}}
@keyframes vx-f3{to{transform:translate3d(5vmax,-6vmax,0) scale(1.06)}}

/* glass panel */
.vx-glass{position:relative;background:linear-gradient(135deg,rgba(255,255,255,.8),rgba(255,255,255,.44));-webkit-backdrop-filter:blur(18px) saturate(1.6);backdrop-filter:blur(18px) saturate(1.6);box-shadow:var(--shadow),inset 0 1px 0 #fff,inset 0 -1px 0 rgba(255,255,255,.5),inset 0 0 26px rgba(255,255,255,.35)}
.vx-glass::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;pointer-events:none;background:linear-gradient(135deg,#fff,rgba(255,176,214,.45) 38%,rgba(143,208,255,.5) 68%,rgba(255,255,255,.95));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude}
.vx-card{transition:transform .4s cubic-bezier(.22,1,.36,1),box-shadow .4s ease}
.vx-card:hover{transform:translateY(-4px);box-shadow:0 28px 54px -24px rgba(236,120,180,.5),0 12px 26px -14px rgba(100,170,240,.5),inset 0 1px 0 #fff}
.vx-orb{position:absolute;border-radius:50%;pointer-events:none}
.vx-orb-a{width:15rem;height:15rem;right:-4rem;top:-6rem;background:radial-gradient(circle,rgba(255,170,212,.55),transparent 68%)}
.vx-orb-b{width:13rem;height:13rem;left:-4rem;bottom:-6rem;background:radial-gradient(circle,rgba(150,210,255,.55),transparent 68%)}
.vx-rule{height:1px;background:linear-gradient(90deg,transparent,rgba(244,114,182,.4),rgba(143,208,255,.5),transparent)}

/* pills, buttons */
.vx-pill{display:inline-flex;align-items:center;gap:.4rem;padding:.5rem 1rem;border-radius:999px;font-size:.8125rem;font-weight:600;line-height:1.2;color:var(--ink-2);border:1px solid rgba(255,255,255,.95);background:linear-gradient(135deg,rgba(255,255,255,.92),rgba(255,255,255,.55));-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);box-shadow:0 8px 18px -10px rgba(120,140,220,.5),inset 0 1px 0 #fff;text-shadow:0 1px 0 #fff;transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s ease}
.vx-pill-sm{padding:.35rem .8rem;font-size:.75rem}
.vx-pill-pink{color:var(--pink-deep);background:linear-gradient(135deg,rgba(255,238,247,.96),rgba(255,206,228,.62))}
.vx-pill-sky{color:var(--sky-deep);background:linear-gradient(135deg,rgba(238,248,255,.96),rgba(196,228,255,.62))}
a.vx-pill:hover{transform:translateY(-2px);box-shadow:0 14px 24px -12px rgba(236,120,180,.55),inset 0 1px 0 #fff}
.vx-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.8rem 1.7rem;border-radius:999px;font-size:1rem;font-weight:700;color:var(--ink);border:1px solid #fff;background:linear-gradient(135deg,rgba(255,214,232,.95),rgba(255,255,255,.92) 50%,rgba(196,228,255,.95));box-shadow:0 14px 28px -14px rgba(236,120,180,.6),0 6px 16px -8px rgba(100,170,240,.5),inset 0 1px 0 #fff;text-shadow:0 1px 0 #fff,0 3px 8px rgba(236,120,180,.25);transition:transform .4s cubic-bezier(.22,1,.36,1),box-shadow .4s ease}
.vx-btn:hover{transform:translateY(-3px);box-shadow:0 24px 36px -16px rgba(236,120,180,.7),0 10px 22px -10px rgba(100,170,240,.6),inset 0 1px 0 #fff}
.vx-avatar{display:grid;place-items:center;width:2.7rem;height:2.7rem;border-radius:50%;font-size:1.2rem;font-weight:800;color:var(--ink);border:2px solid #fff;background:linear-gradient(135deg,#ffb3d6,#a9dcff);box-shadow:0 10px 20px -8px rgba(236,120,180,.6),inset 0 2px 4px rgba(255,255,255,.8);text-shadow:0 1px 0 rgba(255,255,255,.9)}
.vx-cover{border-radius:1.1rem;padding:.6rem;border:1px solid #fff;background:linear-gradient(160deg,#fff0f7,#eaf6ff);box-shadow:inset 0 2px 8px rgba(120,140,220,.12)}
.vx-cover img{display:block;width:100%;height:11rem;object-fit:contain;filter:drop-shadow(0 12px 14px rgba(110,120,200,.35));transition:transform .5s cubic-bezier(.22,1,.36,1)}
.vx-card:hover .vx-cover img{transform:scale(1.05) translateY(-2px)}

/* raised ("ubhre hue") text */
.vx-emboss{text-shadow:0 1px 0 rgba(255,255,255,.95),0 2px 7px rgba(120,130,200,.22)}
.vx-title{color:var(--ink);letter-spacing:-.01em;text-shadow:0 1px 0 #fff,0 3px 8px rgba(236,120,180,.22),0 10px 22px rgba(110,170,240,.3)}
@supports ((-webkit-background-clip:text) or (background-clip:text)){
  .vx-title{text-shadow:none;color:transparent;-webkit-text-fill-color:transparent;background:linear-gradient(120deg,#232a4a 0%,#4b3fa6 46%,#c2306f 100%);-webkit-background-clip:text;background-clip:text;filter:drop-shadow(-1px -1px 0 rgba(255,255,255,.95)) drop-shadow(0 8px 10px rgba(130,110,220,.32))}
}
.vx-h2{position:relative;display:inline-block;margin-bottom:1.25rem;padding-bottom:.6rem;font-size:1.45rem;font-weight:800;line-height:1.3;color:var(--ink);text-shadow:0 1px 0 #fff,0 4px 10px rgba(236,120,180,.22),0 10px 22px rgba(110,170,240,.28)}
.vx-h2::after{content:"";position:absolute;left:0;bottom:0;height:4px;width:58%;border-radius:99px;background:linear-gradient(90deg,#ffa3cd,#8fd0ff);box-shadow:0 4px 10px -2px rgba(255,150,200,.6)}

/* article body (ArticleContent ke andar ka text) */
.vx-prose{font-size:1.125rem;line-height:1.95;color:var(--ink-2);overflow-wrap:break-word;text-shadow:0 1px 0 rgba(255,255,255,.95),0 2px 10px rgba(110,130,200,.15)}
.vx-prose :is(p,li,span,div,td,th,em,i,small,figcaption,cite){color:inherit}
.vx-prose :is(h1,h2,h3,h4){color:var(--ink);font-weight:800;line-height:1.35;text-shadow:0 1px 0 #fff,0 4px 10px rgba(236,120,180,.22),0 12px 24px rgba(110,170,240,.28)}
.vx-prose :is(strong,b){color:var(--ink);font-weight:700}
.vx-prose a{color:var(--pink-deep);text-decoration:underline;text-decoration-color:rgba(194,48,111,.3);text-underline-offset:4px;transition:color .25s ease}
.vx-prose a:hover{color:var(--sky-deep)}
.vx-prose blockquote{padding:1rem 1.25rem;border:1px solid rgba(255,255,255,.95);border-left:4px solid var(--pink);border-radius:1.1rem;background:linear-gradient(135deg,rgba(255,240,247,.85),rgba(238,248,255,.75));box-shadow:0 14px 30px -20px rgba(236,120,180,.55),inset 0 1px 0 #fff}
.vx-prose img{border-radius:1.25rem;border:1px solid #fff;box-shadow:0 20px 40px -24px rgba(100,130,220,.55)}
.vx-prose hr{border:0;height:1px;background:linear-gradient(90deg,transparent,var(--pink),var(--sky),transparent)}
.vx-prose li::marker{color:#ec6aa8}
.vx-prose :not(pre)>code{padding:.1em .4em;border-radius:.45em;color:var(--pink-deep);background:rgba(249,168,212,.22)}
.vx-prose :is(pre,code){text-shadow:none}
.vx-copy :is(button,a){display:inline-flex!important;align-items:center;gap:.4rem;padding:.5rem 1rem!important;border-radius:999px!important;font-size:.8125rem!important;font-weight:600!important;color:var(--ink-2)!important;border:1px solid rgba(255,255,255,.95)!important;background:linear-gradient(135deg,rgba(255,255,255,.92),rgba(255,255,255,.55))!important;box-shadow:0 8px 18px -10px rgba(120,140,220,.5),inset 0 1px 0 #fff!important;text-shadow:0 1px 0 #fff;transition:transform .35s cubic-bezier(.22,1,.36,1)}
.vx-copy :is(button,a):hover{transform:translateY(-2px)}

/* page-load: ek hi soft entrance */
@keyframes vx-fade{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.vx-fade{animation:vx-fade .9s cubic-bezier(.22,1,.36,1) var(--d,0s) both}

/* fallbacks */
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){.vx-glass{background:rgba(255,255,255,.9)}}
@media (max-width:640px){.vx-glass{-webkit-backdrop-filter:blur(12px) saturate(1.4);backdrop-filter:blur(12px) saturate(1.4)}}
@media (prefers-reduced-transparency:reduce){.vx-glass,.vx-pill{background:rgba(255,255,255,.96);-webkit-backdrop-filter:none;backdrop-filter:none}}
@media (prefers-reduced-motion:no-preference){html{scroll-behavior:smooth}}
@media (prefers-reduced-motion:reduce){.vx-fade,.vx-blob,.vx-progress{animation:none!important}.vx-progress{display:none!important}.vx-card,.vx-pill,.vx-btn,.vx-cover img{transition:none!important}.vx-card:hover,.vx-btn:hover,a.vx-pill:hover{transform:none!important}}
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
    <div id="top" className={`${fontDisplay.variable} ${fontBody.variable} vx-root relative isolate min-h-screen`}>
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />
      <div className="vx-progress" aria-hidden="true" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      {/* soft pastel backdrop — glass panels isi par blur hote hain */}
      <div className="vx-bg" aria-hidden="true">
        <span className="vx-blob vx-b1" />
        <span className="vx-blob vx-b2" />
        <span className="vx-blob vx-b3" />
        <span className="vx-blob vx-b4" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6 md:pt-12">
        <nav aria-label="Breadcrumb" className="vx-fade mb-6">
          <ol className="flex min-w-0 items-center gap-2 text-xs sm:text-sm">
            <li className="shrink-0">
              <Link href="/" className="vx-pill vx-pill-sm">
                🏠 Vedoxa
              </Link>
            </li>
            <li aria-hidden="true" className="vx-ink-3">/</li>
            <li className="shrink-0">
              <Link href="/blog" className="vx-pill vx-pill-sm">
                📚 Blog
              </Link>
            </li>
            <li aria-hidden="true" className="vx-ink-3">/</li>
            <li className="vx-ink-3 vx-emboss min-w-0 flex-1 truncate font-medium" aria-current="page">
              {post.title}
            </li>
          </ol>
        </nav>

        <article>
          {/* Article header */}
          <header className="vx-glass vx-fade overflow-hidden rounded-[2rem] p-6 [--d:.05s] sm:p-10">
            <span className="vx-orb vx-orb-a" aria-hidden="true" />
            <span className="vx-orb vx-orb-b" aria-hidden="true" />

            <div className="relative">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="vx-pill vx-pill-pink vx-pill-sm">✨ {post.category || 'Vedoxa Special'}</span>
                <span className="vx-pill vx-pill-sky vx-pill-sm">⏱️ ~{readMins} min read</span>
                <span className="vx-pill vx-pill-sm">📝 {words.toLocaleString('en-IN')} shabd</span>
              </div>

              <h1 className="vx-title text-[1.85rem] font-extrabold leading-[1.3] [text-wrap:balance] sm:text-[2.8rem] sm:leading-[1.25]">
                {post.title}
              </h1>

              <div className="vx-rule my-6" />

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <div className="vx-avatar">V</div>
                  <div>
                    <p className="vx-ink vx-emboss font-bold leading-none">Vedoxa Editorial</p>
                    {publishedAt && (
                      <time dateTime={publishedAt} className="vx-ink-3 mt-1.5 block text-[11px] sm:text-xs">
                        {formatDate(publishedAt)}
                      </time>
                    )}
                  </div>
                </div>
                {updated && (
                  <span className="vx-pill vx-pill-sky vx-pill-sm">✓ Updated: {formatDate(post.updated_at)}</span>
                )}
              </div>
            </div>
          </header>

          {cover && (
            <div className="vx-glass vx-fade mt-6 rounded-[2rem] p-2 [--d:.15s] sm:p-3">
              <img
                src={cover}
                alt={post.title}
                decoding="async"
                className="aspect-[16/9] w-full rounded-[1.4rem] object-cover"
              />
            </div>
          )}

          <div className="vx-glass vx-fade mt-6 rounded-[2rem] p-5 [--d:.25s] sm:p-10">
            <div className="vx-prose">
              <ArticleContent content={content} />
            </div>
          </div>
        </article>

        {tags.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-2" aria-label="Tags">
            {tags.map((t, i) => (
              <li key={t} className={`vx-pill vx-pill-sm ${i % 2 ? 'vx-pill-sky' : 'vx-pill-pink'}`}>
                #{t}
              </li>
            ))}
          </ul>
        )}

        <ShareBar url={url} title={post.title} />

        {books.length > 0 && (
          <section className="mt-14">
            <div className="vx-rule mb-10" />
            <h2 className="vx-h2">Is vishay par padhne ke liye books</h2>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {books.map((b) => {
                const c = bookCoverUrl(b.cover_path)
                const price = formatPrice(b.final_price)
                return (
                  <li key={b.id}>
                    <Link
                      href={`/book/${b.slug || b.id}`}
                      className="vx-card vx-glass block h-full rounded-3xl p-3"
                    >
                      <div className="vx-cover">
                        {c ? (
                          <img
                            src={c}
                            alt={`${b.title} book cover`}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="grid h-44 w-full place-items-center text-4xl" aria-hidden="true">
                            📘
                          </div>
                        )}
                      </div>
                      <p className="vx-ink vx-emboss mt-3 line-clamp-2 text-sm font-bold leading-snug">{b.title}</p>
                      {price && <span className="vx-pill vx-pill-pink vx-pill-sm mt-2">{price}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
            <div className="mt-8 text-center">
              <Link href="/explore" className="vx-btn">
                Saari books dekho →
              </Link>
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="vx-h2">Ye bhi padhein</h2>
            <ul className="grid gap-3.5">
              {related.map((r) => {
                const rc = mediaUrl(r.cover_image)
                const snippet = r.description ? shorten(r.description, 110) : ''
                const date = formatDate(r.published_at)
                return (
                  <li key={r.slug}>
                    <Link
                      href={`/blog/${r.slug}`}
                      className="vx-card vx-glass flex gap-4 rounded-3xl p-4"
                    >
                      {rc && (
                        <img
                          src={rc}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-20 w-20 shrink-0 rounded-2xl border border-white object-cover shadow-md"
                        />
                      )}
                      <span className="min-w-0">
                        <span className="vx-ink vx-emboss line-clamp-2 block text-base font-bold leading-snug">
                          {r.title}
                        </span>
                        {snippet && (
                          <span className="vx-ink-3 mt-1 line-clamp-2 block text-sm">{snippet}</span>
                        )}
                        {date && <span className="vx-ink-3 mt-2 block text-xs">{date}</span>}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {(prev || next) && (
          <nav aria-label="Pichhla aur agla article" className="mt-12 grid gap-3.5 sm:grid-cols-2">
            {prev ? (
              <Link href={`/blog/${prev.slug}`} className="vx-card vx-glass rounded-3xl p-4">
                <span className="vx-pill vx-pill-pink vx-pill-sm">← Pichhla article</span>
                <span className="vx-ink vx-emboss mt-2.5 line-clamp-2 block font-bold leading-snug">{prev.title}</span>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
            {next && (
              <Link href={`/blog/${next.slug}`} className="vx-card vx-glass rounded-3xl p-4 sm:text-right">
                <span className="vx-pill vx-pill-sky vx-pill-sm">Agla article →</span>
                <span className="vx-ink vx-emboss mt-2.5 line-clamp-2 block font-bold leading-snug">{next.title}</span>
              </Link>
            )}
          </nav>
        )}

        <div className="mt-12 flex items-center justify-between">
          <Link href="/blog" className="vx-pill">
            ← Saare articles
          </Link>
          <a href="#top" className="vx-pill vx-pill-sky">
            ↑ Upar jao
          </a>
        </div>
      </div>
    </div>
  )
}
