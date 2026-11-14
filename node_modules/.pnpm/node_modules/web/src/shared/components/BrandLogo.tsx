import { useId } from 'react'

type Props = { className?: string }

const STAR =
  'M50 2C54 34 66 46 98 50C66 54 54 66 50 98C46 66 34 54 2 50C34 46 46 34 50 2Z'

/**
 * Glossy 3D faceted star used as the QuizArena brand mark.
 * Pure SVG (no assets). Size it with className, e.g. "size-14".
 */
export default function BrandLogo({ className = '' }: Props) {
  const uid = useId().replace(/:/g, '')
  const id = (name: string) => `${name}-${uid}`

  return (
    <span className={`relative inline-block ${className}`} aria-hidden="true">
      {/* soft outer halo */}
      <span className="pointer-events-none absolute -inset-5 rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.55)_0%,rgba(124,58,237,0.25)_45%,transparent_70%)] blur-md" />

      <svg
        viewBox="0 0 100 100"
        className="relative size-full overflow-visible drop-shadow-[0_0_14px_rgba(139,92,246,0.9)]"
      >
        <defs>
          <clipPath id={id('clip')}>
            <path d={STAR} />
          </clipPath>

          {/* base body: light cyan-lavender (top-left) -> violet -> deep blue (bottom-right) */}
          <linearGradient id={id('body')} x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0" stopColor="#e0f2fe" />
            <stop offset="0.3" stopColor="#a5b4fc" />
            <stop offset="0.6" stopColor="#7c3aed" />
            <stop offset="1" stopColor="#1d4ed8" />
          </linearGradient>

          {/* centre glow */}
          <radialGradient id={id('core')} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="0.35" stopColor="#c7d2fe" stopOpacity="0.8" />
            <stop offset="1" stopColor="#818cf8" stopOpacity="0" />
          </radialGradient>

          {/* glossy sheen on the upper-left arm */}
          <linearGradient id={id('gloss')} x1="0" y1="0" x2="0.6" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* rim light */}
          <linearGradient id={id('rim')} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="0.5" stopColor="#a5b4fc" stopOpacity="0.5" />
            <stop offset="1" stopColor="#38bdf8" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        <g clipPath={`url(#${id('clip')})`}>
          <rect width="100" height="100" fill={`url(#${id('body')})`} />

          {/* 8 facets: light from the top-left, shade toward the bottom-right */}
          <polygon points="50,50 50,2 40,40" fill="#fff" fillOpacity="0.38" />
          <polygon points="50,50 2,50 40,40" fill="#fff" fillOpacity="0.26" />
          <polygon points="50,50 50,2 60,40" fill="#fff" fillOpacity="0.1" />
          <polygon points="50,50 60,40 98,50" fill="#312e81" fillOpacity="0.1" />
          <polygon points="50,50 98,50 60,60" fill="#1e1b4b" fillOpacity="0.3" />
          <polygon points="50,50 60,60 50,98" fill="#1e1b4b" fillOpacity="0.4" />
          <polygon points="50,50 50,98 40,60" fill="#312e81" fillOpacity="0.2" />
          <polygon points="50,50 40,60 2,50" fill="#312e81" fillOpacity="0.08" />

          {/* facet edges */}
          <g stroke="#fff" strokeOpacity="0.35" strokeWidth="0.6" fill="none">
            <path d="M50 50L50 2M50 50L98 50M50 50L50 98M50 50L2 50" />
            <path d="M50 50L60 40M50 50L60 60M50 50L40 60M50 50L40 40" strokeOpacity="0.2" />
          </g>

          {/* gloss highlight on the top-left arms */}
          <path d="M50 4C48 22 42 34 30 42C38 38 46 30 50 4Z" fill={`url(#${id('gloss')})`} />
          <path d="M4 50C22 48 34 42 42 30C38 38 30 46 4 50Z" fill={`url(#${id('gloss')})`} fillOpacity="0.6" />

          {/* bright glowing core */}
          <circle cx="50" cy="50" r="22" fill={`url(#${id('core')})`} />
        </g>

        {/* glossy rim */}
        <path d={STAR} fill="none" stroke={`url(#${id('rim')})`} strokeWidth="1.4" strokeLinejoin="round" />

        {/* specular glint */}
        <g transform="translate(44 40)" fill="#fff" opacity="0.95">
          <path d="M0 -5C0.4 -1.5 1.5 -0.4 5 0C1.5 0.4 0.4 1.5 0 5C-0.4 1.5 -1.5 0.4 -5 0C-1.5 -0.4 -0.4 -1.5 0 -5Z" />
        </g>
      </svg>
    </span>
  )
}
