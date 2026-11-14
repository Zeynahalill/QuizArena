import { useId } from 'react'

type Props = { className?: string }

/** Small cyan 4-point sparkle used as a decorative star. */
export default function SparkleIcon({ className = '' }: Props) {
  const id = useId()
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#67e8f9" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <path
        d="M12 0C12.8 7 17 11.2 24 12C17 12.8 12.8 17 12 24C11.2 17 7 12.8 0 12C7 11.2 11.2 7 12 0Z"
        fill={`url(#${id})`}
      />
    </svg>
  )
}
