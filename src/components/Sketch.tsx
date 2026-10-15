import { useMemo } from 'react'
import { buildSketchModel, COLORS, type Unit } from '../lib/renderSketch'
import type { GarmentDef } from '../lib/garments'
import type { MeasureValues } from '../lib/shapes'

interface Props {
  garment: GarmentDef
  values: MeasureValues
  unit: Unit
  activeKey: string | null
  onPillClick: (key: string) => void
  className?: string
  coupe?: number
}

function detailProps(type: string) {
  switch (type) {
    case 'dark': return { fill: 'none', stroke: COLORS.ink, strokeWidth: 1.2 }
    case 'line': return { fill: 'none', stroke: COLORS.line, strokeWidth: 0.8 }
    case 'dash': return { fill: 'none', stroke: COLORS.line, strokeWidth: 0.8, strokeDasharray: '1.6 1.6' }
    case 'fold': return { fill: 'none', stroke: COLORS.fold, strokeWidth: 0.8 }
    case 'leaf': return { fill: '#FFFFFF', stroke: COLORS.ink, strokeWidth: 1 }
    case 'grayfill': return { fill: '#E3E6EE', stroke: COLORS.line, strokeWidth: 0.8 }
    default: return { fill: 'none', stroke: COLORS.line, strokeWidth: 0.8 }
  }
}

export default function Sketch({ garment, values, unit, activeKey, onPillClick, className, coupe = 1 }: Props) {
  const model = useMemo(
    () => buildSketchModel(garment, values, unit, activeKey, false, coupe),
    [garment, values, unit, activeKey, coupe],
  )
  const gid = `g-${garment.id}`

  return (
    <svg viewBox={model.viewBox} className={className} role="img" aria-label={`Croquis de ${garment.name}`}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F4F6FA" />
          <stop offset="1" stopColor="#D9DDE8" />
        </linearGradient>
      </defs>
      <g style={{ transition: 'all 150ms ease' }}>
        <path d={model.contour} fill={`url(#${gid})`} stroke={COLORS.ink} strokeWidth={1.5} strokeLinejoin="round"
          style={{ transition: 'd 150ms ease' }} />
        {model.details.map((d, i) => (
          <path key={i} d={d.d} {...detailProps(d.type)} strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {model.btns.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r={1.3} fill="#FFFFFF" stroke={COLORS.line} strokeWidth={0.7} />
        ))}
      </g>
      {model.arrows.map((a) => (
        <g key={a.key}>
          {a.attach.map((att, i) => (
            <line key={`at${i}`} x1={att[0].x} y1={att[0].y} x2={att[1].x} y2={att[1].y}
              stroke={COLORS.attach} strokeWidth={0.6} strokeDasharray="1 1.4" strokeLinecap="round" />
          ))}
          {a.ticks.map((t, i) => (
            <line key={`t${i}`} x1={t[0].x} y1={t[0].y} x2={t[1].x} y2={t[1].y} stroke={a.color} strokeWidth={0.7} strokeLinecap="round" />
          ))}
          <line x1={a.line[0].x} y1={a.line[0].y} x2={a.line[1].x} y2={a.line[1].y}
            stroke={a.color} strokeWidth={a.width} strokeLinecap="round"
            style={{ transition: 'all 150ms ease' }} />
          <polygon points={a.heads[0]} fill={a.color} />
          <polygon points={a.heads[1]} fill={a.color} />
          <g onClick={() => onPillClick(a.key)} style={{ cursor: 'pointer' }}
            role="button" aria-label={`Saisir ${a.key}`}>
            {a.pill.empty ? (
              <>
                <rect x={a.pill.x - a.pill.w / 2} y={a.pill.y - a.pill.h / 2} width={a.pill.w} height={a.pill.h}
                  rx={a.pill.h / 2} fill="#FFFFFF" stroke={COLORS.pillStroke} strokeWidth={0.8} strokeDasharray="1.6 1.6" />
                <text x={a.pill.x} y={a.pill.y + 1.7} textAnchor="middle" fontFamily="Plus Jakarta Sans, system-ui, sans-serif"
                  fontSize={4.6} fontWeight={700} fill={COLORS.emptyText}>?</text>
              </>
            ) : (
              <>
                <rect x={a.pill.x - a.pill.w / 2} y={a.pill.y - a.pill.h / 2} width={a.pill.w} height={a.pill.h}
                  rx={a.pill.h / 2} fill={COLORS.accent} stroke="#FFFFFF" strokeWidth={1.2} />
                <text x={a.pill.x} y={a.pill.y + (a.pill.active ? 1.9 : 1.6)} textAnchor="middle"
                  fontFamily="Plus Jakarta Sans, system-ui, sans-serif"
                  fontSize={a.pill.active ? 5.4 : 4.6} fontWeight={a.pill.active ? 800 : 700} fill="#FFFFFF">
                  {a.pill.line1}
                </text>
              </>
            )}
          </g>
        </g>
      ))}
    </svg>
  )
}
