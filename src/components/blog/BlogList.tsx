'use client'

/* eslint-disable @next/next/no-img-element */
// Place at: src/components/blog/BlogList.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icon } from './Icon'

export type BlogItem = {
  slug: string
  title: string
  excerpt: string
  category: string
  tags: string[]
  cover: string | null
  date: string
  ts: number
  mins: number
  search: string
}

const PAGE = 9
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400'
const SHADOW = 'shadow-[0_20px_50px_-32px_rgba(2,132,199,0.45)]'

type Sort = 'new' | 'old'

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function Cover({ item, priority = false }: { item: BlogItem; priority?: boolean }) {
  if (item.cover) {
    return (
      <img
        src={item.cover}
        alt=""
        width={1280}
        height={720}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
    )
  }
  return (
    <div
      aria-hidden="true"
      className="grid aspect-[16/9] w-full place-items-center bg-gradient-to-br from-sky-100 via-sky-50 to-sky-200 text-sky-500"
    >
      <Icon name="book" size={40} />
    </div>
  )
}

function Meta({ item }: { item: BlogItem }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
      {item.date && (
        <span className="inline-flex items-center gap-1">
          <Icon name="calendar" size={12} />
          {item.date}
        </span>
      )}
      <span className="inline-flex items-center gap-1">
        <Icon name="clock" size={12} />
        {item.mins} min
      </span>
    </div>
  )
}

export default function BlogList({ items, failed = false }: { items: BlogItem[]; failed?: boolean }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('all')
  const [sort, setSort] = useState<Sort>('new')
  const [visible, setVisible] = useState(PAGE)

  // Press "/" anywhere to jump to search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return
      const el = e.target as HTMLElement | null
      const tag = el?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el?.isContentEditable) return
      e.preventDefault()
      inputRef.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of items) counts.set(p.category, (counts.get(p.category) || 0) + 1)
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
  }, [items])

  const q = query.trim().toLowerCase()

  const filtered = useMemo(() => {
    const list = items.filter((p) => (cat === 'all' || p.category === cat) && (!q || p.search.includes(q)))
    return list.sort((a, b) => (sort === 'new' ? b.ts - a.ts : a.ts - b.ts))
  }, [items, cat, q, sort])

  const filtersActive = Boolean(q) || cat !== 'all' || sort !== 'new'
  const showFeatured = !filtersActive && filtered.length > 1
  const featured = showFeatured ? filtered[0] : null
  const rest = showFeatured ? filtered.slice(1) : filtered
  const shown = rest.slice(0, visible)
  const remaining = rest.length - shown.length

  function pickCat(c: string) {
    setCat(c)
    setVisible(PAGE)
  }

  function onQuery(v: string) {
    setQuery(v)
    setVisible(PAGE)
  }

  function reset() {
    setQuery('')
    setCat('all')
    setSort('new')
    setVisible(PAGE)
  }

  function surprise() {
    if (!items.length) return
    const p = items[Math.floor(Math.random() * items.length)]
    router.push(`/blog/${p.slug}`)
  }

  if (items.length === 0) {
    return (
      <div className={`rounded-3xl border border-sky-100 bg-white p-8 text-center ${SHADOW}`}>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-sky-100 text-sky-600">
          <Icon name="book" size={28} />
        </div>
        <p className="mt-4 text-lg font-bold text-slate-900">
          {failed ? 'Lekh abhi load nahi ho paye' : 'Pehla lekh jald aayega'}
        </p>
        <p className="mt-1 text-slate-600">
          {failed ? 'Thodi der baad page dobara kholein.' : 'Tab tak library dekhein.'}
        </p>
        <Link
          href="/"
          className={`mt-5 inline-flex items-center gap-2 rounded-full bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-800 ${FOCUS}`}
        >
          Library dekhein
          <Icon name="arrowRight" size={15} />
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Search */}
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sky-600">
          <SearchIcon />
        </span>
        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onQuery('')
          }}
          aria-label="Lekh khojein"
          placeholder="Lekh khojein: mindset, paisa, dhyan…"
          className="w-full rounded-2xl border border-sky-200 bg-white py-3.5 pl-12 pr-14 text-base text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              onQuery('')
              inputRef.current?.focus()
            }}
            aria-label="Khoj saaf karein"
            className={`absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-sky-100 text-sky-700 hover:bg-sky-200 ${FOCUS}`}
          >
            <CloseIcon />
          </button>
        ) : (
          <kbd className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700 sm:block">
            /
          </kbd>
        )}
      </div>

      {/* Category chips */}
      {categories.length > 1 && (
        <div
          role="group"
          aria-label="Category chunein"
          className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {[['all', items.length] as [string, number], ...categories].map(([name, count]) => {
            const active = cat === name
            return (
              <button
                key={name}
                type="button"
                aria-pressed={active}
                onClick={() => pickCat(name)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${FOCUS} ${
                  active
                    ? 'border-sky-600 bg-sky-600 text-white'
                    : 'border-sky-200 bg-white text-slate-700 hover:border-sky-400 hover:text-sky-700'
                }`}
              >
                {name === 'all' ? 'Sabhi' : name}
                <span className={`text-xs ${active ? 'text-sky-100' : 'text-slate-400'}`}>{count}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Toolbar */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm font-medium text-slate-600">
          {filtered.length} lekh
          {filtersActive && (
            <button
              type="button"
              onClick={reset}
              className={`ml-3 rounded-full text-sky-700 underline underline-offset-2 hover:text-sky-900 ${FOCUS}`}
            >
              Filter hatayein
            </button>
          )}
        </p>
        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as Sort)
              setVisible(PAGE)
            }}
            aria-label="Lekh ka kram"
            className={`rounded-full border border-sky-200 bg-white py-2 pl-4 pr-8 text-sm font-semibold text-slate-700 ${FOCUS}`}
          >
            <option value="new">Naye pehle</option>
            <option value="old">Purane pehle</option>
          </select>
          <button
            type="button"
            onClick={surprise}
            className={`inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-sky-400 hover:text-sky-700 ${FOCUS}`}
          >
            <Icon name="sparkles" size={15} className="text-sky-600" />
            Koi ek lekh
          </button>
        </div>
      </div>

      {/* Featured */}
      {featured && (
        <Link
          href={`/blog/${featured.slug}`}
          className={`vx-card group mt-5 block overflow-hidden rounded-3xl border border-sky-100 bg-white ${SHADOW} ${FOCUS}`}
        >
          <div className="relative overflow-hidden">
            <Cover item={featured} priority />
            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-sky-800 shadow-sm">
              <Icon name="sparkles" size={13} />
              Naya lekh
            </span>
          </div>
          <div className="p-5 sm:p-7">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">
              <Icon name="tag" size={12} />
              {featured.category}
            </span>
            <h2 className="vx-display mt-3 text-xl font-extrabold leading-snug text-slate-900 [text-wrap:balance] group-hover:text-sky-800 sm:text-3xl">
              {featured.title}
            </h2>
            {featured.excerpt && (
              <p className="mt-2 line-clamp-3 text-base leading-7 text-slate-600">{featured.excerpt}</p>
            )}
            <div className="mt-4 flex items-center justify-between gap-3">
              <Meta item={featured} />
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-sky-700">
                Padhein
                <Icon name="arrowRight" size={15} />
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* Grid */}
      {shown.length > 0 ? (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/blog/${p.slug}`}
                className={`vx-card group flex h-full flex-col overflow-hidden rounded-2xl border border-sky-100 bg-white hover:border-sky-300 ${FOCUS}`}
              >
                <div className="overflow-hidden">
                  <Cover item={p} />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <span className="inline-flex w-fit items-center rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-bold text-sky-800">
                    {p.category}
                  </span>
                  <h3 className="vx-display mt-2 line-clamp-2 text-lg font-bold leading-snug text-slate-900 group-hover:text-sky-800">
                    {p.title}
                  </h3>
                  {p.excerpt && <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-slate-600">{p.excerpt}</p>}
                  <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                    <Meta item={p} />
                    <Icon name="arrowRight" size={15} className="shrink-0 text-sky-600" />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        !featured && (
          <div className={`mt-5 rounded-3xl border border-sky-100 bg-white p-8 text-center ${SHADOW}`}>
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-sky-100 text-sky-600">
              <SearchIcon />
            </div>
            <p className="mt-3 text-lg font-bold text-slate-900">Is khoj se koi lekh nahi mila</p>
            <p className="mt-1 text-sm text-slate-600">Doosra shabd try karein ya filter hata dein.</p>
            <button
              type="button"
              onClick={reset}
              className={`mt-4 inline-flex items-center rounded-full bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-800 ${FOCUS}`}
            >
              Filter hatayein
            </button>
          </div>
        )
      )}

      {remaining > 0 && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE)}
            className={`inline-flex items-center gap-2 rounded-full border border-sky-300 bg-white px-6 py-3 text-sm font-bold text-sky-800 transition-colors hover:bg-sky-50 ${FOCUS}`}
          >
            Aur lekh dikhayein ({remaining})
          </button>
        </div>
      )}
    </div>
  )
}
