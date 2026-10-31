import { useId } from 'react'

export function PulseMark({ size = 32 }) {
  const id = `pf-mark-${useId().replace(/:/g, '')}`
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#C6FF3D" />
          <stop offset="1" stopColor="#22E4FF" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="#0A0D12" />
      <rect x="1" y="1" width="62" height="62" rx="17" fill="none" stroke={`url(#${id})`} strokeOpacity="0.35" strokeWidth="2" />
      <path
        d="M8 34h12l5-12 8 24 6-16 4 4h13"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 0 4px rgba(198,255,61,0.6))' }}
      />
    </svg>
  )
}

export default function Logo({ size = 32, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <PulseMark size={size} />
      <span
        className="font-display font-bold tracking-tight leading-none"
        style={{ fontSize: size * 0.72 }}
      >
        <span className="text-ink">Pulse</span>
        <span className="text-gradient animate-shimmer">Fit</span>
      </span>
    </span>
  )
}
