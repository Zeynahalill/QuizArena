import { useId } from 'react'

type Props = { className?: string; tone?: 'brand' | 'soft' }

/** Solid padlock with keyhole. `brand` = violet-blue gradient, `soft` = pale lavender. */
export default function FilledLock({ className = '', tone = 'brand' }: Props) {
  const id = `lock-${useId().replace(/:/g, '')}`
  const soft = tone === 'soft'
  const paint = soft ? '#c7d2fe' : `url(#${id})`

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {!soft && (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8b6cff" />
            <stop offset="1" stopColor="#4a4ff0" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M7.2 10.5V7.4a4.8 4.8 0 0 1 9.6 0v3.1"
        fill="none"
        stroke={paint}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <rect x="3.6" y="10" width="16.8" height="12.4" rx="3.2" fill={paint} />
      <circle cx="12" cy="15.3" r="1.7" fill="#0a1052" />
      <rect x="11.2" y="15.6" width="1.6" height="3.6" rx="0.8" fill="#0a1052" />
    </svg>
  )
}
