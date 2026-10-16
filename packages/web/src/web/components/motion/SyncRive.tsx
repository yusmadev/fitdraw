import { useEffect, useRef, useState } from 'react'
import { useRive } from '@rive-app/react-canvas'
import { reducedMotion } from '../../lib/motion'

/**
 * The cloud-sync illustration, authored in Rive (source project: /rive/fitdraw-sync).
 *
 * The runtime is only mounted once the card is actually on screen, and the animation never
 * starts at all when the visitor prefers reduced motion — no wasted bytes, no unsolicited
 * movement.
 */
export default function SyncRive({ className = '' }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const still = reducedMotion()

  useEffect(() => {
    const el = hostRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={hostRef} className={className}>
      {visible && !still ? <RiveCanvas /> : null}
    </div>
  )
}

function RiveCanvas() {
  const { rive, RiveComponent } = useRive({
    src: '/rive/fitdraw-sync.riv',
    stateMachines: 'State Machine 1',
    autoplay: true,
  })

  useEffect(() => {
    if (!rive) return
    // Rive keeps its own render loop — stop it while the tab is hidden.
    const onVisibility = () => (document.hidden ? rive.pause() : rive.play())
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [rive])

  return <RiveComponent className="h-full w-full" />
}
