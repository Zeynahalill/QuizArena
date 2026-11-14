import { useId } from 'react'

type Props = { className?: string }

/**
 * QuizArena brand mark: a cyan → violet four-point star with a dark diamond
 * cut-out in the centre and a soft glow. Pure SVG; size it with className.
 */
export default function BrandLogo({ className = '' }: Props) {
  const uid = useId().replace(/:/g, '')
  const grad = `brand-grad-${uid}`

  return (
    <svg
      viewBox="80 60 450 485"
      className={`overflow-visible drop-shadow-[0_0_16px_rgba(56,189,248,0.55)] ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={grad} x1="0.25" y1="0" x2="0.65" y2="1">
          <stop offset="0" stopColor="#22e4fd" />
          <stop offset="0.45" stopColor="#3b9bff" />
          <stop offset="0.75" stopColor="#6a3df8" />
          <stop offset="1" stopColor="#7c2df0" />
        </linearGradient>
      </defs>

      {/* star body + diamond cut-out (even-odd) */}
      <path
        fill={`url(#${grad})`}
        fillRule="evenodd"
        d="M305 70Q322 262 520 295Q322 328 298 535Q282 328 88 320Q284 270 305 70Z
           M300 246Q303 292 350 298Q304 305 300 348Q296 305 252 298Q296 291 300 246Z"
      />
    </svg>
  )
}
