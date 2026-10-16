import { useLayoutEffect, useRef, type ElementType, type ReactNode } from 'react'
import { DUR, EASE, motion, reducedMotion } from '../../lib/motion'

interface RevealProps {
  children: ReactNode
  className?: string
  /** Seconds of delay before the tween starts. */
  delay?: number
  /** Travel distance in px — keep it small, this is a technical tool, not a landing page trick. */
  y?: number
  /** When > 0, animates the element's direct children one after another instead of the block itself. */
  stagger?: number
  duration?: number
  /** ScrollTrigger start, e.g. 'top 88%'. */
  start?: string
  as?: ElementType
}

/**
 * React Bits' `AnimatedContent`, adapted to FitDraw: one staggered entrance per section,
 * skipped entirely when the visitor prefers reduced motion (content then renders as-is).
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 16,
  stagger = 0,
  duration = DUR.enter,
  start = 'top 88%',
  as: Tag = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || reducedMotion()) return
    const { gsap } = motion()

    const targets = stagger > 0 ? Array.from(el.children) : el
    const tween = gsap.fromTo(
      targets,
      { autoAlpha: 0, y, filter: 'blur(5px)' },
      {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
        duration,
        delay,
        ease: EASE,
        stagger,
        clearProps: 'filter',
        scrollTrigger: { trigger: el, start, once: true },
      },
    )

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [delay, y, stagger, duration, start])

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}

interface ParallaxProps {
  children: ReactNode
  className?: string
  /** Total px travelled from the moment the element enters to the moment it leaves. */
  distance?: number
}

/** Gentle scrub parallax — used on the hero sketch so the drawing drifts behind the copy. */
export function Parallax({ children, className, distance = 46 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || reducedMotion()) return
    const { gsap } = motion()

    const tween = gsap.fromTo(
      el,
      { y: distance / 2 },
      {
        y: -distance / 2,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      },
    )

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [distance])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
