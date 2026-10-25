import { cache } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

// Sitemap.ts wale SITE_URL ke saath same rakho
const SITE_URL = 'https://vedoxa.shop'

// Article 10 minute tak cache rehta hai, phir apne aap naya ho jata hai
export const revalidate = 600

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

function shorten(text: string, max: number) {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length > max ? clean.slice(0, max - 1).trimEnd() + '…' : clean
}

// Ek hi request me generateMetadata aur page dono ko wahi article milta hai
const getPost = cache(async (param: string) => {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', safeDecode(param))
    .eq('published', true)
    .maybeSingle()

  return data ?? null
})

// [text](/link) ko link banata hai. Sirf "/" ya http(s) wale links chalte hain.
function renderInline(text: string) {
  const parts: any[] = []
  const re = /\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g
  let last = 0
  let i = 0
  let m: RegExpExecArray | null

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    const label = m[1]
    const href = m[2]
    const cls = 'text-amber-400 underline underline-offset-4 hover:text-amber-300'

    if (href.startsWith('/')) {
      parts.push(
        <Link key={`l${i}`} href={href} className={cls}>
          {label}
        </Link>
      )
    } else {
      parts.push(
        <a key={`l${i}`} href={href} target="_blank" rel="noopener noreferrer" className={cls}>
          {label}
        </a>
      )
    }
    last = m.index + m[0].length
    i++
  }

  if (last < text.length) parts.push(text.slice(last))
  return parts
}

// Article ka text: ## heading, ### chhota heading, - bullets, baaki paragraph
function renderContent(content: string) {
  const blocks = content.replace(/\r\n/g, '\n').split(/\n{2,}/)

  return blocks.map((block, idx) => {
    const text = block.trim()
    if (!text) return null

    if (text.startsWith('### ')) {
      return (
        <h3 key={idx} className="font-serif text-xl font-bold text-white mt-8 mb-3">
          {renderInline(text.slice(4))}
        </h3>
      )
    }

    if (text.startsWith('## ')) {
      return (
        <h2 key={idx} className="font-serif text-2xl font-bold text-white mt-10 mb-4">
          {renderInline(text.slice(3))}
        </h2>
      )
    }

    const lines = text.split('\n')
    if (lines.every((l) => l.trim().startsWith('- '))) {
      return (
        <ul key={idx} className="list-disc pl-6 my-5 space-y-2 leading-8 text-gray-300">
          {lines.map((l, j) => (
            <li key={j}>{renderInline(l.trim().slice(2))}</li>
          ))}
        </ul>
      )
    }

    return (
      <p key={idx} className="my-5 leading-8 text-gray-300 whitespace-pre-line">
        {renderInline(lines.join('\n'))}
      </p>
    )
  })
}

export async function generateMetadata({ params }: any) {
  const { slug } = await params
  const post: any = await getPost(slug)

  if (!post) {
    return { title: 'Article not found', robots: { index: false, follow: false } }
  }

  const url = `${SITE_URL}/blog/${post.slug}`
  const description = post.description
    ? shorten(post.description, 155)
    : shorten(post.content, 155)

  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description,
      url,
      siteName: 'Vedoxa Premium Library',
      type: 'article',
      publishedTime: post.published_at,
      modifiedTime: post.updated_at || post.published_at,
    },
    twitter: { card: 'summary', title: post.title, description },
  }
}

export default async function BlogPostPage({ params }: any) {
  const { slug } = await params
  const post: any = await getPost(slug)

  if (!post) notFound()

  const url = `${SITE_URL}/blog/${post.slug}`

  let related: any[] = []
  let books: any[] = []
  const supabase = getSupabase()
  if (supabase) {
    const rel = await supabase
      .from('posts')
      .select('slug, title')
      .eq('published', true)
      .neq('id', post.id)
      .order('published_at', { ascending: false })
      .limit(3)
    related = rel.data ?? []

    const bk = await supabase
      .from('books')
      .select('id, slug, title, cover_path, final_price')
      .order('created_at', { ascending: false })
      .limit(3)
    books = bk.data ?? []
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description || shorten(post.content, 155),
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    mainEntityOfPage: url,
    author: { '@type': 'Organization', name: 'Vedoxa' },
    publisher: { '@type': 'Organization', name: 'Vedoxa' },
  }

  return (
    <div className="min-h-screen bg-[#07070d] text-gray-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 md:py-10">
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
          <header>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold leading-snug text-white">
              {post.title}
            </h1>
            <p className="mt-3 text-sm text-gray-500">{formatDate(post.published_at)}</p>
          </header>

          <div className="mt-6 max-w-prose">{renderContent(post.content)}</div>
        </article>

        {books.length > 0 && (
          <section className="mt-14 border-t border-white/10 pt-10">
            <h2 className="font-serif text-xl font-bold text-white mb-5">
              Is vishay par padhne ke liye books
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {books.map((b) => {
                const c = coverUrl(b.cover_path)
                return (
                  <li key={b.id}>
                    <Link
                      href={`/book/${b.slug || b.id}`}
                      className="block rounded-2xl border border-white/10 bg-white/[0.03] p-3 hover:border-amber-500/40 transition-colors h-full"
                    >
                      {c && (
                        <img
                          src={c}
                          alt={`${b.title} book cover`}
                          className="w-full h-44 object-contain rounded-lg"
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                      <p className="mt-3 text-sm font-bold text-white line-clamp-2">{b.title}</p>
                      <p className="mt-1 text-sm text-amber-400 font-bold">₹{b.final_price}</p>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="font-serif text-xl font-bold text-white mb-4">Ye bhi padhein</h2>
            <ul className="space-y-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/blog/${r.slug}`}
                    className="text-amber-400 underline underline-offset-4 hover:text-amber-300"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
