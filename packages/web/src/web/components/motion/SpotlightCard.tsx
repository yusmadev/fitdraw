import { useCallback, useRef, type ReactNode } from 'react'

interface SpotlightCardProps {
  children: ReactNode
  className?: string
  /** Spotlight radius in px. */
  radius?: number
}

/**
 * React Bits' `SpotlightCard`, restyled for FitDraw: the pointer position is written into
 * CSS variables and a single accent-tinted radial highlight follows it. Pure CSS afterwards —
 * no per-frame React state, and it degrades to a plain card on touch devices.
 */
export default function SpotlightCard({ children, className = '', radius = 260 }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el || event.pointerType === 'touch') return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--spot-x', `${event.clientX - rect.left}px`)
    el.style.setProperty('--spot-y', `${event.clientY - rect.top}px`)
  }, [])

  const onPointerLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--spot-x', '-9999px')
    el.style.setProperty('--spot-y', '-9999px')
  }, [])

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ '--spot-size': `${radius}px` } as React.CSSProperties}
      className={`t-spotlight group relative overflow-hidden ${className}`}
    >
      {children}
    </div>
  )
}
