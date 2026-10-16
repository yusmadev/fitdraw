import { useEffect } from 'react'
import Lenis from 'lenis'
import { motion, reducedMotion } from '../../lib/motion'
import 'lenis/dist/lenis.css'

/**
 * Smooth scrolling for the marketing page only.
 *
 * The studio is a fixed-height app with its own inner scroll areas, so it is left on the
 * native wheel — Lenis drives the document, GSAP's ticker drives Lenis, and ScrollTrigger
 * reads the same clock so scroll-triggered reveals stay in sync with the smoothed position.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (reducedMotion()) return
    const { gsap, ScrollTrigger } = motion()

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      touchMultiplier: 1.6,
    })

    const onScroll = () => ScrollTrigger.update()
    lenis.on('scroll', onScroll)

    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    ScrollTrigger.refresh()

    return () => {
      lenis.off('scroll', onScroll)
      gsap.ticker.remove(tick)
      gsap.ticker.lagSmoothing(500, 33)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
