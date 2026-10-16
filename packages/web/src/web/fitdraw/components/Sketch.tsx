// Croquis React — même modèle que l'export, rendu en SVG pour l'écran.
import { buildSketchModel, parseViewBox, COLORS, type SketchModel, type Unit } from '../renderSketch'

/** Même pavage « FitDraw » que l'export PNG : pas de 24 × 11, incliné à −22°. */
function watermarkGrid(viewBox: string) {
  const vb = parseViewBox(viewBox)
  const rows: number[] = []
  const cols: number[] = []
  for (let y = vb.minY - 60; y < vb.minY + vb.h + 60; y += 11) rows.push(y)
  for (let x = vb.minX - 60; x < vb.minX + vb.w + 60; x += 24) cols.push(x)
  return { rows, cols }
}
import type { GarmentDef } from '../garments'
import type { MeasureValues } from '../shapes'

export interface SketchProps {
  garment: GarmentDef
  values: MeasureValues
  unit: Unit
  activeKey?: string | null
  coupe?: number
  className?: string
}

function detailStyle(type: string) {
  switch (type) {
    case 'dark':
      return { fill: 'none', stroke: COLORS.ink, width: 1.2 }
    case 'dash':
      return { fill: 'none', stroke: COLORS.line, width: 0.8, dash: '1.6 1.6' }
    case 'fold':
      return { fill: 'none', stroke: COLORS.fold, width: 0.8 }
    case 'leaf':
      return { fill: '#FFFFFF', stroke: COLORS.ink, width: 1 }
    case 'grayfill':
      return { fill: '#E3E6EE', stroke: COLORS.line, width: 0.8 }
    default:
      return { fill: 'none', stroke: COLORS.line, width: 0.8 }
  }
}

export function SketchSvg({ garment, values, unit, activeKey = null, coupe = 1, className }: SketchProps) {
  const model: SketchModel = buildSketchModel(garment, values, unit, activeKey, false, coupe)
  const watermark = watermarkGrid(model.viewBox)

  return (
    // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- un SVG inline nommé se décrit avec role="img", pas avec une balise <img>
    <svg viewBox={model.viewBox} className={className} role="img" aria-label={`Croquis ${garment.name}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <clipPath id={`fd-contour-${garment.id}`}>
          <path d={model.contour} />
        </clipPath>
      </defs>

      <path d={model.contour} fill="#FFFFFF" />

      {watermark && (
        <g clipPath={`url(#fd-contour-${garment.id})`} opacity={0.5} aria-hidden="true">
          {watermark.rows.map((y, r) => (
            <g key={r}>
              {watermark.cols.map((x, c) => (
                <text
                  key={c}
                  x={0}
                  y={0}
                  fontSize={3.8}
                  fontWeight={800}
                  fill="#7F87A8"
                  transform={`translate(${x} ${y}) rotate(-22)`}
                >
                  FitDraw
                </text>
              ))}
            </g>
          ))}
        </g>
      )}

      <path d={model.contour} fill="none" stroke={COLORS.ink} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />

      {model.details.map((d, i) => {
        const st = detailStyle(d.type)
        return (
          <path
            key={`d${i}`}
            d={d.d}
            fill={st.fill}
            stroke={st.stroke}
            strokeWidth={st.width}
            strokeDasharray={st.dash}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )
      })}

      {model.btns.map((b, i) => (
        <circle key={`b${i}`} cx={b.x} cy={b.y} r={1.3} fill="#FFFFFF" stroke={COLORS.line} strokeWidth={0.7} />
      ))}

      {model.arrows.map((a) => (
        <g key={a.key}>
          {a.attach.map((att, i) => (
            <line
              key={`at${i}`}
              x1={att[0].x}
              y1={att[0].y}
              x2={att[1].x}
              y2={att[1].y}
              stroke={COLORS.attach}
              strokeWidth={0.6}
              strokeDasharray="1 1.4"
            />
          ))}
          {a.ticks.map((t, i) => (
            <line key={`tk${i}`} x1={t[0].x} y1={t[0].y} x2={t[1].x} y2={t[1].y} stroke={a.color} strokeWidth={0.7} />
          ))}
          <line x1={a.line[0].x} y1={a.line[0].y} x2={a.line[1].x} y2={a.line[1].y} stroke={a.color} strokeWidth={a.width} />
          {a.heads.map((h, i) => (
            <polygon key={`hd${i}`} points={h} fill={a.color} />
          ))}
          <g>
            {a.pill.empty ? (
              <rect
                x={a.pill.x - a.pill.w / 2}
                y={a.pill.y - a.pill.h / 2}
                width={a.pill.w}
                height={a.pill.h}
                rx={a.pill.h / 2}
                fill="#FFFFFF"
                stroke={COLORS.pillStroke}
                strokeWidth={0.8}
                strokeDasharray="1.6 1.6"
              />
            ) : (
              <rect
                x={a.pill.x - a.pill.w / 2}
                y={a.pill.y - a.pill.h / 2}
                width={a.pill.w}
                height={a.pill.h}
                rx={a.pill.h / 2}
                fill={COLORS.accent}
                stroke="#FFFFFF"
                strokeWidth={1.2}
              />
            )}
            {a.pill.empty ? (
              <text x={a.pill.x} y={a.pill.y + 1.9} textAnchor="middle" fontSize={5.4} fontWeight={800} fill={COLORS.emptyText}>
                ?
              </text>
            ) : (
              <text x={a.pill.x} y={a.pill.y + 1.9} textAnchor="middle" fontSize={5.4} fontWeight={800} fill="#FFFFFF">
                {a.pill.line1}
              </text>
            )}
          </g>
        </g>
      ))}
    </svg>
  )
}

export default SketchSvg
