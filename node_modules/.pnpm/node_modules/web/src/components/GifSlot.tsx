import { ImageOff } from 'lucide-react'
import { useState } from 'react'

type Props = { src?: string; alt: string; className?: string }

/** Questions and answers use GIFs instead of photos. Shows a fallback if missing/broken. */
export default function GifSlot({ src, alt, className = '' }: Props) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div
        className={`grid place-items-center bg-gradient-to-br from-arena-primary/30 to-arena-accent/30 text-white/60 ${className}`}
        aria-label={alt}
      >
        <ImageOff className="size-8" />
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  )
}
