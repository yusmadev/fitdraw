import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false

/** Registers the GSAP plugins once per session and hands back the gsap instance. */
export function motion() {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger)
    registered = true
  }
  return { gsap, ScrollTrigger }
}

/** True when the visitor asked the OS for less movement — every animation here checks it. */
export function reducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * FitDraw's motion vocabulary: short, decelerating, never bouncy.
 * One entrance per section, a single spotlight on hover — no looping decoration.
 */
export const EASE = 'power3.out'
export const DUR = { enter: 0.72, ui: 0.28, stagger: 0.085 }
