// Place at: src/components/blog/Icon.tsx
// Vedoxa custom icon set: 24px grid, rounded strokes, soft duotone fill.
// Pure SVG, so it works in both server and client components.
import type { SVGProps } from 'react'

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

type Shape = { d: string; soft?: string }

const CIRCLE = 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17z'
const CAL = 'M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V7A1.5 1.5 0 0 1 5 5.5z'
const DOC = 'M7 3.5h6.5L19 9v10.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1z'
const TAG = 'M3.5 12.2V5.5a2 2 0 0 1 2-2h6.7a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.8l-6.7 6.7a2 2 0 0 1-2.8 0L4.1 13.6a2 2 0 0 1-.6-1.4z'
const PAGES =
  'M3.5 5.5c3.2-.2 6 .4 8.5 2v12c-2.5-1.6-5.3-2.2-8.5-2zM20.5 5.5c-3.2-.2-6 .4-8.5 2v12c2.5-1.6 5.3-2.2 8.5-2z'
const HOUSE = 'M5.5 9.5 12 4.2l6.5 5.3V19a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19z'
const BUBBLE = 'M12 3.5a8.5 8.5 0 0 0-7.3 12.9L3.5 20.5l4.2-1.1A8.5 8.5 0 1 0 12 3.5z'
const PLANE = 'M21 4.5 3.5 11.2l5.7 2 2 5.8 2.8-3.7 4.4 3.2z'

const SHAPES: Record<IconName, Shape> = {
  home: {
    soft: HOUSE,
    d: 'M3.5 11 12 4l8.5 7M5.5 9.5V19a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5V9.5M10 20.5v-5a2 2 0 0 1 4 0v5',
  },
  book: { soft: PAGES, d: PAGES },
  clock: { soft: CIRCLE, d: `${CIRCLE}M12 7.5V12l3 2` },
  file: { soft: DOC, d: `${DOC}M13.5 3.5V9H19M9.5 13h5M9.5 16.5h3.5` },
  check: { soft: CIRCLE, d: `${CIRCLE}M8.5 12.3l2.4 2.4 4.6-4.9` },
  arrowRight: { d: 'M4.5 12h15M13.5 6l6 6-6 6' },
  arrowLeft: { d: 'M19.5 12h-15M10.5 6l-6 6 6 6' },
  up: { d: 'M12 19.5v-15M6 10.5l6-6 6 6' },
  share: {
    d: 'M6 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM18 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM18 15.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6',
  },
  link: {
    d: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  },
  calendar: { soft: CAL, d: `${CAL}M3.5 10h17M8 3.5V7M16 3.5V7` },
  tag: { soft: TAG, d: `${TAG}M8.5 8.5h.01` },
  sparkles: {
    soft: 'M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z',
    d: 'M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9zM18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z',
  },
  whatsapp: {
    soft: BUBBLE,
    d: `${BUBBLE}M9.2 8.8c.2 2.8 3.2 5.8 6 6l1-1.4-2-1-.9.8c-.9-.4-1.8-1.3-2.2-2.2l.8-.9-1-2z`,
  },
  telegram: { soft: PLANE, d: `${PLANE}M9.2 13.2 21 4.5` },
  x: { d: 'M4.5 4.5h4l11 15h-4zM19 4.5l-6.2 6.9M5 19.5l6.2-6.9' },
  facebook: {
    d: 'M14 8.5h2.5V5h-2.8C11.5 5 10 6.5 10 8.7V11H7.5v3.5H10V20h3.5v-5.5h2.6l.5-3.5h-3.1V9.2c0-.5.3-.7.6-.7z',
  },
}

type IconProps = {
  name: IconName
  size?: number
  strokeWidth?: number
  className?: string
} & Omit<SVGProps<SVGSVGElement>, 'name' | 'width' | 'height' | 'strokeWidth' | 'className'>

export function Icon({ name, size = 16, strokeWidth = 1.8, className, ...rest }: IconProps) {
  const shape = SHAPES[name]
  if (!shape) return null

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      {shape.soft && <path d={shape.soft} fill="currentColor" fillOpacity={0.14} stroke="none" />}
      <path d={shape.d} />
    </svg>
  )
}

// Vedoxa brand mark: a "V" made from an open book. `uid` keeps gradient ids unique when used more than once.
export function LogoMark({ size = 36, uid = 'a', className }: { size?: number; uid?: string; className?: string }) {
  const gid = `vx-logo-${uid}`
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Vedoxa" className={className}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#0369a1" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill={`url(#${gid})`} />
      <path d="M13 16l11 20.5L35 16" fill="none" stroke="#ffffff" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 12.5c2.3-1 4.7-.9 7 .9 2.3-1.8 4.7-1.9 7-.9" fill="none" stroke="#bae6fd" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

export default Icon
