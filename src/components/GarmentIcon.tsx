import { SHAPES, contourPath, mirrorPath } from '../lib/shapes'

interface Props {
  id: string
  className?: string
  color?: string
}

/** Icône d'un vêtement : contour + traits DARK/LINE/LEAF, sans remplissage. */
export default function GarmentIcon({ id, className, color = '#3B4CCA' }: Props) {
  const s = SHAPES[id]
  if (!s) return null
  const main = contourPath(s.p0, s.nodes)
  const details: string[] = []
  const btns: { x: number; y: number }[] = []
  for (const det of s.details) {
    if (det.type === 'btn' && det.at) { btns.push(...det.at); continue }
    if (!det.d) continue
    if (det.type !== 'dark' && det.type !== 'line' && det.type !== 'leaf') continue
    details.push(det.d)
    if (det.mirror) details.push(mirrorPath(det.d))
  }
  return (
    <svg viewBox="-4 -4 108 108" className={className} fill="none" aria-hidden="true">
      <path d={main} stroke={color} strokeWidth={4.6} strokeLinejoin="round" strokeLinecap="round" />
      {details.map((d, i) => (
        <path key={i} d={d} stroke={color} strokeWidth={2.76} strokeLinejoin="round" strokeLinecap="round" />
      ))}
      {btns.map((b, i) => (
        <circle key={`b${i}`} cx={b.x} cy={b.y} r={2.4} fill={color} stroke="none" />
      ))}
    </svg>
  )
}
