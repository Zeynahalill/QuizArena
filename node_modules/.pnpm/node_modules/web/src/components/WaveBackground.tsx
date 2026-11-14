/** Decorative violet (left) and blue (right) wave ribbons behind the admin login. */
export default function WaveBackground() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 size-full"
      viewBox="0 0 1440 900"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="wv-tl-dark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3a0ca3" />
          <stop offset="1" stopColor="#5b21d6" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id="wv-tl-bright" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5b1fe0" />
          <stop offset="1" stopColor="#a855f7" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="wv-bl" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#5a10e8" />
          <stop offset="1" stopColor="#7c3aed" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="wv-tr" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d4ed8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#1d4ed8" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="wv-br-dark" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a4be0" />
          <stop offset="1" stopColor="#0a3fd1" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="wv-br-bright" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1aa3ff" />
          <stop offset="1" stopColor="#22a6fd" stopOpacity="0.5" />
        </linearGradient>
        <filter id="wv-soft" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      {/* top-left violet */}
      <path d="M0 0H470C400 100 200 165 0 300Z" fill="url(#wv-tl-dark)" />
      <path d="M0 0H270C200 60 100 115 0 175Z" fill="url(#wv-tl-bright)" />
      <path d="M0 175C100 115 200 60 270 0" fill="none" stroke="#c084fc" strokeOpacity="0.7" strokeWidth="2" filter="url(#wv-soft)" />
      <path d="M0 300C200 165 400 100 470 0" fill="none" stroke="#a78bfa" strokeOpacity="0.35" strokeWidth="1.5" />

      {/* bottom-left violet */}
      <path d="M0 690C150 715 300 800 360 900H0Z" fill="url(#wv-bl)" />
      <path d="M0 785C100 795 200 850 250 900H0Z" fill="#6d28f0" fillOpacity="0.65" />
      <path d="M0 690C150 715 300 800 360 900" fill="none" stroke="#a78bfa" strokeOpacity="0.6" strokeWidth="2" filter="url(#wv-soft)" />

      {/* top-right blue */}
      <path d="M1090 0H1440V170C1350 125 1190 60 1090 0Z" fill="url(#wv-tr)" />
      <path d="M1090 0C1190 60 1350 125 1440 170" fill="none" stroke="#3b82f6" strokeOpacity="0.45" strokeWidth="1.5" />

      {/* bottom-right blue */}
      <path d="M980 900C1150 850 1320 790 1440 600V900Z" fill="url(#wv-br-dark)" />
      <path d="M1130 900C1250 880 1360 830 1440 730V900Z" fill="url(#wv-br-bright)" />
      <path d="M980 900C1150 850 1320 790 1440 600" fill="none" stroke="#38bdf8" strokeOpacity="0.5" strokeWidth="2" filter="url(#wv-soft)" />
    </svg>
  )
}
