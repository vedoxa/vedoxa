// Place at: src/components/blog/Icon.tsx
// Vedoxa icon set v2: 24px grid, rounded strokes, soft gradient duotone fill, built-in micro-animations.
// Pure SVG + CSS (no client JS, no 'use client'), so it still works in both server and client components.
// Needs React 18+ (useId).
import { useId } from 'react'
import type { ComponentPropsWithoutRef, CSSProperties, SVGProps } from 'react'

export type IconName =
  | 'home'
  | 'book'
  | 'clock'
  | 'file'
  | 'check'
  | 'arrowRight'
  | 'arrowLeft'
  | 'up'
  | 'share'
  | 'link'
  | 'calendar'
  | 'tag'
  | 'sparkles'
  | 'whatsapp'
  | 'telegram'
  | 'x'
  | 'facebook'

/** duotone = default look, outline = no fill, bold = richer fill, gradient = brand sky gradient */
export type IconVariant = 'duotone' | 'outline' | 'bold' | 'gradient'
/** none = static, hover = plays when the icon / its link / button / .group is hovered or focused, loop = always plays */
export type IconAnimation = 'none' | 'hover' | 'loop'

type Motion = 'lift' | 'right' | 'left' | 'up' | 'swing' | 'pulse' | 'wiggle' | 'fly' | 'open'
type AccentMotion = 'hand' | 'twinkle' | 'lines' | 'drop' | 'pop' | 'beat' | 'draw'

type Shape = {
  d: string // main outline
  soft?: string // soft duotone fill layer
  accent?: string // detail layer (clock hand, tick, doc lines...) that can animate on its own
  motion?: Motion // whole-icon motion
  origin?: string // transform origin of the whole-icon motion
  accentMotion?: AccentMotion
  accentOrigin?: string
}

const CIRCLE = 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17z'
const CAL = 'M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V7A1.5 1.5 0 0 1 5 5.5z'
const DOC = 'M7 3.5h6.5L19 9v10.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1z'
const TAG = 'M3.5 12.2V5.5a2 2 0 0 1 2-2h6.7a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.8l-6.7 6.7a2 2 0 0 1-2.8 0L4.1 13.6a2 2 0 0 1-.6-1.4z'
const PAGES =
  'M3.5 5.5c3.2-.2 6 .4 8.5 2v12c-2.5-1.6-5.3-2.2-8.5-2zM20.5 5.5c-3.2-.2-6 .4-8.5 2v12c2.5-1.6 5.3-2.2 8.5-2z'
const HOUSE = 'M5.5 9.5 12 4.2l6.5 5.3V19a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19z'
const BUBBLE = 'M12 3.5a8.5 8.5 0 0 0-7.3 12.9L3.5 20.5l4.2-1.1A8.5 8.5 0 1 0 12 3.5z'
const PLANE = 'M21 4.5 3.5 11.2l5.7 2 2 5.8 2.8-3.7 4.4 3.2z'
const STAR = 'M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z'
const STAR_SM = 'M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z'
const NODES =
  'M6 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM18 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM18 15.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z'
const FB = 'M14 8.5h2.5V5h-2.8C11.5 5 10 6.5 10 8.7V11H7.5v3.5H10V20h3.5v-5.5h2.6l.5-3.5h-3.1V9.2c0-.5.3-.7.6-.7z'
const X_BODY = 'M4.5 4.5h4l11 15h-4z'

const SHAPES: Record<IconName, Shape> = {
  home: {
    soft: HOUSE,
    d: 'M3.5 11 12 4l8.5 7M5.5 9.5V19a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5V9.5',
    accent: 'M10 20.5v-5a2 2 0 0 1 4 0v5',
    motion: 'lift',
  },
  book: { soft: PAGES, d: PAGES, motion: 'open' },
  clock: {
    soft: CIRCLE,
    d: `${CIRCLE}M12 12l3 2`,
    accent: 'M12 12V7.5', // minute hand, spins on its own
    accentMotion: 'hand',
    accentOrigin: '12px 12px',
  },
  file: {
    soft: DOC,
    d: `${DOC}M13.5 3.5V9H19`,
    accent: 'M9.5 13h5M9.5 16.5h3.5',
    accentMotion: 'lines',
    accentOrigin: '9.5px 15px',
  },
  check: { soft: CIRCLE, d: CIRCLE, accent: 'M8.5 12.3l2.4 2.4 4.6-4.9', accentMotion: 'draw', motion: 'pulse' },
  arrowRight: { d: 'M4.5 12h15M13.5 6l6 6-6 6', motion: 'right' },
  arrowLeft: { d: 'M19.5 12h-15M10.5 6l-6 6 6 6', motion: 'left' },
  up: { d: 'M12 19.5v-15M6 10.5l6-6 6 6', motion: 'up' },
  share: {
    soft: NODES,
    d: `${NODES}M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6`,
    motion: 'pulse',
  },
  link: {
    d: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
    motion: 'wiggle',
  },
  calendar: {
    soft: CAL,
    d: `${CAL}M3.5 10h17`,
    accent: 'M8 3.5V7M16 3.5V7',
    accentMotion: 'drop',
  },
  tag: {
    soft: TAG,
    d: TAG,
    accent: 'M8.5 8.5h.01',
    motion: 'swing',
    origin: '8.5px 8.5px',
    accentMotion: 'pop',
    accentOrigin: '8.5px 8.5px',
  },
  sparkles: {
    soft: STAR,
    d: STAR,
    accent: STAR_SM,
    motion: 'pulse',
    accentMotion: 'twinkle',
    accentOrigin: '18.5px 18.5px',
  },
  whatsapp: {
    soft: BUBBLE,
    d: BUBBLE,
    accent: 'M9.2 8.8c.2 2.8 3.2 5.8 6 6l1-1.4-2-1-.9.8c-.9-.4-1.8-1.3-2.2-2.2l.8-.9-1-2z',
    motion: 'lift',
    accentMotion: 'beat',
    accentOrigin: '12.7px 11.8px',
  },
  telegram: { soft: PLANE, d: PLANE, accent: 'M9.2 13.2 21 4.5', motion: 'fly' },
  x: { soft: X_BODY, d: 'M4.5 4.5h4l11 15h-4zM19 4.5l-6.2 6.9M5 19.5l6.2-6.9', motion: 'pulse' },
  facebook: { soft: FB, d: FB, motion: 'lift' },
}

/** All icon names, handy for an icon gallery or validating CMS data. */
export const ICON_NAMES = Object.keys(SHAPES) as IconName[]

export function isIconName(value: unknown): value is IconName {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(SHAPES, value)
}

/** Official colors for the social icons (X stays currentColor so it works in dark mode). */
const BRAND: Partial<Record<IconName, string>> = {
  whatsapp: '#25D366',
  telegram: '#229ED9',
  facebook: '#1877F2',
}

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ')

/* ------------------------------------------------------------------ */
/* Animation CSS (generated once at module load, inlined in the SVG)   */
/* ------------------------------------------------------------------ */

const BODY_KF: Record<Motion, string> = {
  lift: '0%,60%,100%{transform:none}28%{transform:translateY(-1.6px) scale(1.07)}',
  right: '0%,60%,100%{transform:none}28%{transform:translateX(2.6px)}',
  left: '0%,60%,100%{transform:none}28%{transform:translateX(-2.6px)}',
  up: '0%,60%,100%{transform:none}28%{transform:translateY(-2.6px)}',
  swing: '0%,70%,100%{transform:rotate(0)}18%{transform:rotate(-16deg)}42%{transform:rotate(10deg)}56%{transform:rotate(-4deg)}',
  pulse: '0%,60%,100%{transform:none}28%{transform:scale(1.12)}',
  wiggle: '0%,70%,100%{transform:rotate(0)}15%{transform:rotate(-9deg)}40%{transform:rotate(9deg)}55%{transform:rotate(-3deg)}',
  fly: '0%,60%,100%{transform:none}28%{transform:translate(2px,-2px) scale(1.05)}',
  open: '0%,60%,100%{transform:none}28%{transform:scale(1.1,1.03)}',
}

const ACCENT_KF: Record<AccentMotion, string> = {
  hand: '0%{transform:rotate(0)}100%{transform:rotate(360deg)}',
  twinkle: '0%,60%,100%{transform:scale(1);opacity:1}30%{transform:scale(.45) rotate(45deg);opacity:.4}',
  lines: '0%{transform:scaleX(.1);opacity:.3}30%,100%{transform:none;opacity:1}',
  drop: '0%,60%,100%{transform:none}25%{transform:translateY(-1.6px)}45%{transform:translateY(.7px)}',
  pop: '0%,60%,100%{transform:scale(1)}30%{transform:scale(1.9)}',
  beat: '0%,60%,100%{transform:scale(1)}30%{transform:scale(1.18)}',
  draw: '0%{stroke-dasharray:1;stroke-dashoffset:1.02}45%,100%{stroke-dasharray:1;stroke-dashoffset:0}',
}

// Hover also fires when the icon sits inside a hovered / focused link, button or Tailwind `.group`.
const HOST = [
  '.vx-ic:hover',
  'a:hover .vx-ic',
  'button:hover .vx-ic',
  '.group:hover .vx-ic',
  'a:focus-visible .vx-ic',
  'button:focus-visible .vx-ic',
]
const onHover = (part: string) => HOST.map((h) => `${h}[data-a=hover] ${part}`).join(',')

// Shared rules. Each shape only sets --vb / --va (its keyframe name), so the rules stay small.
const ICON_BASE =
  '.vx-ic{overflow:visible}.vx-b,.vx-a{transform-box:view-box}' +
  `${onHover('.vx-b')}{animation:var(--vb,none) .8s ease-in-out both}` +
  `${onHover('.vx-a')}{animation:var(--va,none) .8s ease-in-out both}` +
  '.vx-ic[data-a=loop] .vx-b{animation:var(--vb,none) 2.6s ease-in-out infinite}' +
  '.vx-ic[data-a=loop] .vx-a{animation:var(--va,none) 2.6s ease-in-out infinite}' +
  '@media (prefers-reduced-motion:reduce){.vx-ic *{animation:none!important}}'

const HAND_CSS =
  `${onHover('.vx-a')}{animation-duration:.9s;animation-timing-function:cubic-bezier(.45,0,.2,1)}` +
  '.vx-ic[data-a=loop] .vx-a{animation-duration:4s;animation-timing-function:linear}'

const DRAW_CSS =
  '@keyframes vx-in{from{stroke-dashoffset:1.02}to{stroke-dashoffset:0}}@keyframes vx-fade{from{opacity:0}to{opacity:1}}' +
  '.vx-ic[data-d] .vx-s{stroke-dasharray:1;animation:vx-in .9s cubic-bezier(.65,0,.35,1) both}' +
  '.vx-ic[data-d] .vx-soft{animation:vx-fade .7s ease .3s both}'

// Only the keyframes this icon actually uses are inlined (about 1.3 KB per icon).
const cssCache = new Map<string, string>()
function iconCss(name: IconName, draw: boolean) {
  const key = `${name}|${draw}`
  let css = cssCache.get(key)
  if (css === undefined) {
    const s = SHAPES[name]
    css = ICON_BASE
    if (s.motion) css += `@keyframes vxb-${s.motion}{${BODY_KF[s.motion]}}`
    if (s.accentMotion) css += `@keyframes vxa-${s.accentMotion}{${ACCENT_KF[s.accentMotion]}}`
    if (s.accentMotion === 'hand') css += HAND_CSS
    if (draw) css += DRAW_CSS
    cssCache.set(key, css)
  }
  return css
}

/* ------------------------------------------------------------------ */
/* Icon                                                                */
/* ------------------------------------------------------------------ */

export type IconProps = {
  name: IconName
  size?: number
  strokeWidth?: number
  className?: string
  /** Visual style. Default 'duotone'. */
  variant?: IconVariant
  /** Default 'hover'. Respects prefers-reduced-motion. */
  animate?: IconAnimation
  /** Draw the icon in (stroke animation) when it mounts. */
  draw?: boolean
  /** Second color for the detail layer + soft fill, e.g. accent="#38bdf8". */
  accent?: string
  /** Use the official brand color for whatsapp / telegram / facebook. */
  brand?: boolean
  /** Accessible name. When set (or aria-label is passed) the icon is exposed to screen readers. */
  title?: string
  /** Extra CSS to inline together with the icon CSS (used by IconButton). */
  inlineCss?: string
} & Omit<
  SVGProps<SVGSVGElement>,
  'name' | 'width' | 'height' | 'strokeWidth' | 'className' | 'ref' | 'title' | 'accent' | 'animate'
>

export function Icon({
  name,
  size = 16,
  strokeWidth = 1.8,
  className,
  variant = 'duotone',
  animate = 'hover',
  draw = false,
  accent,
  brand = false,
  title,
  inlineCss,
  style,
  ...rest
}: IconProps) {
  const uid = useId().replace(/:/g, '') // hooks must run before any early return
  const shape = SHAPES[name]
  if (!shape) return null

  const isGradient = variant === 'gradient'
  const softOn = variant !== 'outline' && Boolean(shape.soft)
  const [s0, s1] = variant === 'bold' ? [0.5, 0.2] : isGradient ? [0.3, 0.1] : [0.26, 0.07]
  const gradId = `vx-g-${uid}`
  const softId = `vx-s-${uid}`

  const stroke = isGradient ? `url(#${gradId})` : 'currentColor'
  const accentStroke = accent ?? stroke
  const softColor = accent ?? (isGradient ? '#38bdf8' : 'currentColor')
  const brandColor = brand ? BRAND[name] : undefined
  const labelled = Boolean(title || rest['aria-label'] || rest['aria-labelledby'])
  const bodyStyle = {
    ...(shape.motion ? { '--vb': `vxb-${shape.motion}` } : null),
    ...(shape.origin ? { transformOrigin: shape.origin } : null),
  } as CSSProperties
  const accentStyle = {
    ...(shape.accentMotion ? { '--va': `vxa-${shape.accentMotion}` } : null),
    ...(shape.accentOrigin ? { transformOrigin: shape.accentOrigin } : null),
  } as CSSProperties
  const css = animate !== 'none' || draw || inlineCss ? iconCss(name, draw) + (inlineCss ?? '') : ''

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={labelled ? 'img' : undefined}
      aria-hidden={labelled ? undefined : true}
      focusable="false"
      className={cx('vx-ic', className)}
      data-a={animate}
      data-d={draw ? '' : undefined}
      style={brandColor ? { color: brandColor, ...style } : style}
      {...rest}
    >
      {title && <title>{title}</title>}
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      {(isGradient || softOn) && (
        <defs>
          {isGradient && (
            <linearGradient id={gradId} x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#38bdf8" />
              <stop offset="1" stopColor="#0284c7" />
            </linearGradient>
          )}
          {softOn && (
            <linearGradient id={softId} x1="4" y1="3" x2="20" y2="21" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor={softColor} stopOpacity={s0} />
              <stop offset="1" stopColor={softColor} stopOpacity={s1} />
            </linearGradient>
          )}
        </defs>
      )}
      <g className="vx-b" style={bodyStyle}>
        {softOn && <path className="vx-soft" d={shape.soft} fill={`url(#${softId})`} stroke="none" />}
        <path className={draw ? 'vx-s' : undefined} d={shape.d} pathLength={draw ? 1 : undefined} />
        {shape.accent && (
          <path
            className={cx('vx-a', draw && 'vx-s')}
            d={shape.accent}
            stroke={accentStroke}
            pathLength={draw || shape.accentMotion === 'draw' ? 1 : undefined}
            style={accentStyle}
          />
        )}
      </g>
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* IconButton / IconLink: accessible, animated icon-only controls      */
/* ------------------------------------------------------------------ */

const BTN_CSS =
  '.vx-btn{display:inline-flex;align-items:center;justify-content:center;flex:none;width:2.5rem;height:2.5rem;padding:0;border-radius:.9rem;' +
  'border:1px solid rgba(127,127,127,.22);background:rgba(127,127,127,.08);color:inherit;font:inherit;line-height:0;text-decoration:none;cursor:pointer;' +
  'transition:transform .2s cubic-bezier(.3,.7,.4,1),background-color .2s,border-color .2s,color .2s,box-shadow .2s;-webkit-tap-highlight-color:transparent}' +
  '.vx-btn[data-t=ghost]{border-color:transparent;background:transparent}' +
  '.vx-btn[data-t=solid]{border-color:transparent;color:#fff;background:linear-gradient(135deg,#38bdf8,#0369a1);box-shadow:0 6px 16px -6px rgba(3,105,161,.6)}' +
  '.vx-btn:hover{transform:translateY(-1px);color:#0ea5e9;background:rgba(14,165,233,.12);border-color:rgba(14,165,233,.35)}' +
  '.vx-btn[data-t=solid]:hover{color:#fff;background:linear-gradient(135deg,#7dd3fc,#0284c7);box-shadow:0 10px 22px -8px rgba(3,105,161,.7)}' +
  '.vx-btn[data-b]:hover{color:var(--vx-brand);background:color-mix(in srgb,var(--vx-brand) 13%,transparent);border-color:color-mix(in srgb,var(--vx-brand) 40%,transparent)}' +
  '.vx-btn:active{transform:scale(.94)}' +
  '.vx-btn:focus-visible{outline:2px solid #38bdf8;outline-offset:2px}' +
  '.vx-btn[data-s=done]{color:#10b981;background:rgba(16,185,129,.12);border-color:rgba(16,185,129,.4)}' +
  '.vx-btn:disabled,.vx-btn[aria-disabled=true]{opacity:.5;pointer-events:none}' +
  '@media (prefers-reduced-motion:reduce){.vx-btn{transition:none}.vx-btn:hover,.vx-btn:active{transform:none}}'

type ButtonBase = {
  name: IconName
  /** Required: used as aria-label and tooltip because the control has no visible text. */
  label: string
  size?: number
  tone?: 'soft' | 'ghost' | 'solid'
  /** Brand color on hover (whatsapp / telegram / facebook). */
  brand?: boolean
  /** Shows the green "done" state, e.g. after copying a link. */
  active?: boolean
  iconProps?: Partial<Omit<IconProps, 'name'>>
}

function btnAttrs(
  { name, tone = 'soft', brand = false, active = false }: Pick<ButtonBase, 'name' | 'tone' | 'brand' | 'active'>,
  className?: string,
  style?: CSSProperties,
) {
  const color = brand ? BRAND[name] : undefined
  return {
    className: cx('vx-btn', className),
    'data-t': tone,
    'data-b': color ? '' : undefined,
    'data-s': active ? 'done' : undefined,
    style: color ? ({ '--vx-brand': color, ...style } as CSSProperties) : style,
  }
}

export function IconButton({
  name,
  label,
  size = 18,
  tone,
  brand,
  active,
  iconProps,
  className,
  style,
  type = 'button',
  ...rest
}: ButtonBase & Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'aria-label'>) {
  return (
    <button type={type} aria-label={label} title={label} {...btnAttrs({ name, tone, brand, active }, className, style)} {...rest}>
      <Icon name={name} size={size} inlineCss={BTN_CSS} {...iconProps} />
    </button>
  )
}

export function IconLink({
  name,
  label,
  size = 18,
  tone,
  brand,
  active,
  iconProps,
  className,
  style,
  target,
  rel,
  ...rest
}: ButtonBase & Omit<ComponentPropsWithoutRef<'a'>, 'children' | 'aria-label'>) {
  return (
    <a
      aria-label={label}
      title={label}
      target={target}
      rel={target === '_blank' ? (rel ?? 'noopener noreferrer') : rel}
      {...btnAttrs({ name, tone, brand, active }, className, style)}
      {...rest}
    >
      <Icon name={name} size={size} inlineCss={BTN_CSS} {...iconProps} />
    </a>
  )
}

/* ------------------------------------------------------------------ */
/* Share helpers (pure functions, work on the server too)              */
/* ------------------------------------------------------------------ */

export type SharePlatform = 'whatsapp' | 'telegram' | 'x' | 'facebook'
export const SHARE_PLATFORMS: readonly SharePlatform[] = ['whatsapp', 'telegram', 'x', 'facebook']
export const SHARE_LABELS: Record<SharePlatform, string> = {
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  x: 'X',
  facebook: 'Facebook',
}

export function getShareUrl(platform: SharePlatform, input: { url: string; title?: string; text?: string }): string {
  const { url, title = '' } = input
  const text = input.text ?? title
  const u = encodeURIComponent(url)
  const t = encodeURIComponent(text)
  switch (platform) {
    case 'whatsapp':
      return `https://wa.me/?text=${encodeURIComponent([text, url].filter(Boolean).join(' '))}`
    case 'telegram':
      return `https://t.me/share/url?url=${u}&text=${t}`
    case 'x':
      return `https://twitter.com/intent/tweet?url=${u}&text=${t}`
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${u}`
  }
}

/* ------------------------------------------------------------------ */
/* Brand mark                                                          */
/* ------------------------------------------------------------------ */

const LOGO_HOST = [
  '.vx-lg:hover',
  '.vx-logo:hover .vx-lg',
  'a:hover .vx-lg',
  'button:hover .vx-lg',
  '.group:hover .vx-lg',
  'a:focus-visible .vx-lg',
  'button:focus-visible .vx-lg',
]
const logoHover = (part: string) => LOGO_HOST.map((h) => `${h}[data-a=hover] ${part}`).join(',')

const LOGO_CSS =
  '.vx-lg{overflow:visible}.vx-lg *{transform-box:view-box}' +
  '.vx-lv{transform-origin:24px 36.5px}.vx-lb{transform-origin:24px 12px}.vx-bg{transform-origin:24px 24px}' +
  '@keyframes vx-in{from{stroke-dashoffset:1.02}to{stroke-dashoffset:0}}' +
  '@keyframes vxl-v{0%,100%{transform:none}30%{transform:translateY(1.4px) scale(1.05,.93)}58%{transform:translateY(-1px) scale(.98,1.04)}}' +
  '@keyframes vxl-b{0%,100%{transform:none;opacity:1}40%{transform:translateY(-1.8px);opacity:.7}}' +
  '@keyframes vxl-sheen{from{transform:translateX(0)}to{transform:translateX(96px)}}' +
  '@keyframes vxl-pop{from{transform:scale(.72);opacity:0}to{transform:none;opacity:1}}' +
  `${logoHover('.vx-lv')}{animation:vxl-v .7s ease-in-out}` +
  `${logoHover('.vx-lb')}{animation:vxl-b .7s ease-in-out}` +
  `${logoHover('.vx-sheen')}{animation:vxl-sheen .85s ease-out}` +
  '.vx-lg[data-d] .vx-s{stroke-dasharray:1;animation:vx-in .9s cubic-bezier(.65,0,.35,1) both}' +
  '.vx-lg[data-d] .vx-s2{animation-delay:.35s}' +
  '.vx-lg[data-d] .vx-bg{animation:vxl-pop .6s cubic-bezier(.2,.9,.3,1.25) both}' +
  '@media (prefers-reduced-motion:reduce){.vx-lg *{animation:none!important}}'

export type LogoMarkProps = {
  size?: number
  /** Optional manual id suffix. Not needed anymore: ids are unique automatically via useId. */
  uid?: string
  className?: string
  /** Hover animation (squash, page lift, light sweep). Default true. */
  animated?: boolean
  /** Draw the mark in on mount. */
  intro?: boolean
  /** Soft brand glow under the mark. */
  glow?: boolean
  /** Hide from screen readers (use when the "Vedoxa" text is already next to it). */
  decorative?: boolean
  style?: CSSProperties
}

// Vedoxa brand mark: a "V" made from an open book. Ids are unique per instance, so it can be used any number of times.
export function LogoMark({
  size = 36,
  uid,
  className,
  animated = true,
  intro = false,
  glow = false,
  decorative = false,
  style,
}: LogoMarkProps) {
  const auto = useId().replace(/:/g, '')
  const gid = `vx-logo-${uid ?? auto}`
  const css = animated || intro ? LOGO_CSS : ''
  const sw = intro ? 1 : undefined

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : 'Vedoxa'}
      aria-hidden={decorative ? true : undefined}
      focusable="false"
      className={cx('vx-lg', className)}
      data-a={animated ? 'hover' : 'none'}
      data-d={intro ? '' : undefined}
      style={glow ? { filter: 'drop-shadow(0 6px 14px rgba(3,105,161,.35))', ...style } : style}
    >
      {!decorative && <title>Vedoxa</title>}
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id={`${gid}-h`} x1="0" y1="0" x2="0" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${gid}-c`}>
          <rect width="48" height="48" rx="14" />
        </clipPath>
      </defs>
      <rect className="vx-bg" width="48" height="48" rx="14" fill={`url(#${gid})`} />
      <rect width="48" height="26" rx="14" fill={`url(#${gid}-h)`} />
      <rect x="0.6" y="0.6" width="46.8" height="46.8" rx="13.4" fill="none" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="1.2" />
      {animated && (
        <g clipPath={`url(#${gid}-c)`}>
          <g className="vx-sheen">
            <rect x="-24" y="-6" width="14" height="60" fill="#ffffff" fillOpacity="0.28" transform="skewX(-20)" />
          </g>
        </g>
      )}
      <path
        className="vx-lv vx-s"
        pathLength={sw}
        d="M13 16l11 20.5L35 16"
        fill="none"
        stroke="#ffffff"
        strokeWidth="4.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="vx-lb vx-s vx-s2"
        pathLength={sw}
        d="M17 12.5c2.3-1 4.7-.9 7 .9 2.3-1.8 4.7-1.9 7-.9"
        fill="none"
        stroke="#bae6fd"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export type LogoProps = Omit<LogoMarkProps, 'decorative'> & {
  /** Show the "Vedoxa" text next to the mark. Default true. */
  wordmark?: boolean
}

/** Mark + wordmark, ready for headers and footers. Wrap it in your <Link>. */
export function Logo({ size = 36, wordmark = true, className, ...mark }: LogoProps) {
  return (
    <span className={cx('vx-logo', className)} style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(size * 0.3) }}>
      <LogoMark size={size} decorative={wordmark} {...mark} />
      {wordmark && (
        <span
          style={{
            fontSize: Math.round(size * 0.58),
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            background: 'linear-gradient(135deg,#38bdf8,#0284c7)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
          }}
        >
          Vedoxa
        </span>
      )}
    </span>
  )
}

export default Icon
