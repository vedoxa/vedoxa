'use client'
// Place at: src/components/blog/ShareBar.tsx
// Working share bar built on the Vedoxa icon set: WhatsApp / Telegram / X / Facebook links,
// copy-link with animated confirmation (and a visible error state), canonical URL cleanup,
// and the phone's native share sheet when available.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Icon, IconButton, IconLink, SHARE_LABELS, SHARE_PLATFORMS, getShareUrl } from './Icon'
import type { SharePlatform } from './Icon'

/** Primary domain. Shared links always use this host (www is folded into it, http becomes https). */
const SITE_URL = 'https://vedoxa.shop'
const TRACKING_PARAMS = new Set([
  'fbclid', 'gclid', 'gbraid', 'wbraid', 'msclkid', 'igshid', 'mc_cid', 'mc_eid',
])

export type ShareBarProps = {
  /** Page URL. Relative paths are fine and resolve against siteUrl. Defaults to the current page. */
  url?: string
  title?: string
  text?: string
  platforms?: readonly SharePlatform[]
  label?: string
  className?: string
  /** Canonical site address. Defaults to https://vedoxa.shop */
  siteUrl?: string
  /** Analytics hook: called with where the reader shared. */
  onShare?: (target: SharePlatform | 'copy' | 'native') => void
}

const CSS =
  '.vx-share{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem}' +
  '.vx-share-label{display:inline-flex;align-items:center;gap:.4rem;margin-right:.25rem;font-size:.875rem;font-weight:600;opacity:.8}' +
  // margin-left cancels the flex gap while the toast is hidden, so it never takes space
  '.vx-toast{display:inline-flex;align-items:center;margin-left:-.5rem;max-width:0;padding:0;overflow:hidden;white-space:nowrap;border-radius:9999px;' +
  'font-size:.75rem;font-weight:700;color:#059669;background:rgba(16,185,129,.12);box-shadow:inset 0 0 0 1px rgba(16,185,129,.3);' +
  'opacity:0;transform:translateX(-4px);transition:max-width .25s ease,margin .25s ease,padding .2s ease,opacity .2s ease,transform .2s ease}' +
  '.vx-toast[data-on]{margin-left:0;max-width:12rem;padding:.25rem .7rem;opacity:1;transform:none}' +
  '.vx-toast[data-k=failed]{color:#dc2626;background:rgba(220,38,38,.1);box-shadow:inset 0 0 0 1px rgba(220,38,38,.3)}' +
  '@media (prefers-color-scheme:dark){.vx-toast{color:#34d399}.vx-toast[data-k=failed]{color:#f87171}}' +
  '.vx-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}' +
  '@media (prefers-reduced-motion:reduce){.vx-toast{transition:none}}'

function parseUrl(value: string, base?: string): URL | null {
  try {
    return new URL(value, base)
  } catch {
    return null
  }
}

/**
 * Always returns a clean, absolute, http(s) URL on the primary domain:
 * relative paths resolve against siteUrl, www/http are folded into the canonical host,
 * ad-tracking params (utm_*, fbclid, gclid ...) are removed, and anything that is not
 * http(s) (javascript:, data: ...) falls back to the home page.
 */
function normalizeShareUrl(raw: string, siteUrl: string): string {
  const site = parseUrl(siteUrl) ?? new URL(SITE_URL)
  const parsed = parseUrl(raw, site.href)
  if (!parsed || (parsed.protocol !== 'https:' && parsed.protocol !== 'http:')) return site.href

  const bare = (host: string) => host.replace(/^www\./, '')
  if (bare(parsed.hostname) === bare(site.hostname)) {
    parsed.protocol = site.protocol
    parsed.hostname = site.hostname
    parsed.port = site.port
  }
  for (const key of Array.from(parsed.searchParams.keys())) {
    if (/^utm_/i.test(key) || TRACKING_PARAMS.has(key.toLowerCase())) parsed.searchParams.delete(key)
  }
  return parsed.href
}

/** Fallback for browsers without the async clipboard API. Keeps iOS happy and restores focus. */
function legacyCopy(value: string) {
  const previous = document.activeElement as HTMLElement | null
  const ta = document.createElement('textarea')
  try {
    ta.value = value
    ta.setAttribute('readonly', '')
    ta.setAttribute('aria-hidden', 'true')
    ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;font-size:16px'
    document.body.appendChild(ta)
    ta.select()
    ta.setSelectionRange(0, value.length)
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    ta.remove()
    previous?.focus?.()
  }
}

type Toast = { kind: 'copied' | 'failed'; on: boolean }

export default function ShareBar({
  url,
  title = '',
  text,
  platforms = SHARE_PLATFORMS,
  label = 'Share',
  className,
  siteUrl = SITE_URL,
  onShare,
}: ShareBarProps) {
  // With a `url` prop the address is known on the server too, so share links are real before hydration.
  const [currentUrl, setCurrentUrl] = useState('')
  const [docTitle, setDocTitle] = useState('')
  const [canNativeShare, setCanNativeShare] = useState(false)
  const [toast, setToast] = useState<Toast>({ kind: 'copied', on: false })
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pageUrl = useMemo(() => (url ? normalizeShareUrl(url, siteUrl) : currentUrl), [url, siteUrl, currentUrl])
  const resolvedTitle = title || docTitle
  const ready = pageUrl !== ''

  // Runs after mount so server and client HTML match (no hydration warnings).
  useEffect(() => {
    if (!url) setCurrentUrl(normalizeShareUrl(window.location.href, siteUrl))
  }, [url, siteUrl])
  useEffect(() => {
    if (!title) setDocTitle(document.title)
  }, [title])
  useEffect(() => {
    setCanNativeShare(typeof navigator.share === 'function')
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const flash = useCallback((kind: Toast['kind']) => {
    setToast({ kind, on: true })
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast((t) => ({ ...t, on: false })), kind === 'copied' ? 2200 : 3200)
  }, [])

  const copy = useCallback(async () => {
    if (!pageUrl) return
    let ok = false
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(pageUrl)
        ok = true
      }
    } catch {
      // permission denied or insecure context: try the legacy way below
    }
    if (!ok) ok = legacyCopy(pageUrl)
    if (ok) onShare?.('copy')
    flash(ok ? 'copied' : 'failed')
  }, [pageUrl, onShare, flash])

  const nativeShare = useCallback(async () => {
    if (!pageUrl) return
    const data: ShareData = { url: pageUrl }
    if (resolvedTitle) data.title = resolvedTitle
    if (text) data.text = text
    try {
      await navigator.share(data)
      onShare?.('native')
    } catch (err) {
      // Closing the share sheet is not an error; any other failure falls back to copying the link.
      if ((err as { name?: string } | null)?.name !== 'AbortError') void copy()
    }
  }, [pageUrl, resolvedTitle, text, onShare, copy])

  const copied = toast.on && toast.kind === 'copied'
  const message = toast.kind === 'failed' ? 'Copy failed' : 'Link copied!'
  const announce = toast.on ? (toast.kind === 'failed' ? 'Could not copy the link' : 'Link copied') : ''

  return (
    <div className={['vx-share', className].filter(Boolean).join(' ')} role="group" aria-label={label}>
      <span className="vx-share-label">
        <Icon name="share" size={16} />
        {label}
      </span>

      {platforms.map((p) => (
        <IconLink
          key={p}
          name={p}
          label={`Share on ${SHARE_LABELS[p]}`}
          href={ready ? getShareUrl(p, { url: pageUrl, title: resolvedTitle, text }) : undefined}
          aria-disabled={ready ? undefined : true}
          target="_blank"
          rel="noopener noreferrer"
          brand
          onClick={() => onShare?.(p)}
        />
      ))}

      {/* key remounts the icon so the check mark draws itself every time */}
      <IconButton
        key={copied ? 'copied' : 'copy'}
        name={copied ? 'check' : 'link'}
        label={copied ? 'Link copied' : 'Copy link'}
        active={copied}
        disabled={!ready}
        iconProps={copied ? { draw: true } : undefined}
        onClick={copy}
      />

      {canNativeShare && <IconButton name="share" label="More share options" disabled={!ready} onClick={nativeShare} />}

      {/* visual pill is hidden from assistive tech; the live region below announces it once */}
      <span className="vx-toast" data-on={toast.on ? '' : undefined} data-k={toast.kind} aria-hidden="true">
        {message}
      </span>
      <span className="vx-sr" role="status" aria-live="polite">
        {announce}
      </span>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
    </div>
  )
}
