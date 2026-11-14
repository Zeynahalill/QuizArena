import { useId } from 'react'

type Props = { className?: string }

/** 4-point star used in the QuizArena brand mark. */
export default function SparkleIcon({ className = '' }: Props) {
  const id = useId()
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c4b5fd" />
          <stop offset="0.5" stopColor="#818cf8" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
      <path
        d="M12 0C13 7 17 11 24 12C17 13 13 17 12 24C11 17 7 13 0 12C7 11 11 7 12 0Z"
        fill={`url(#${id})`}
      />
    </svg>
  )
}
