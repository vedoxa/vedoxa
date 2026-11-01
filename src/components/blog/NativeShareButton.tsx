'use client'

// Place at: src/components/blog/NativeShareButton.tsx
// Opens the phone's own share sheet. Renders nothing on browsers that don't support it.
import { useEffect, useState } from 'react'
import { Icon } from './Icon'

type Props = { url: string; title: string; className?: string }

export default function NativeShareButton({ url, title, className }: Props) {
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    setSupported(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

  if (!supported) return null

  async function handleShare() {
    try {
      await navigator.share({ title, url })
    } catch {
      // user closed the share sheet; nothing to do
    }
  }

  return (
    <button type="button" onClick={handleShare} className={className}>
      <Icon name="share" size={16} />
      Share
    </button>
  )
}
