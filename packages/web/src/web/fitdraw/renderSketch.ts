// Modèle de rendu du croquis, partagé entre l'écran (React) et l'export PNG (chaîne SVG).
import { SHAPES, deformShape, contourPath, transformPath, mirrorPath, pathBBox, type MeasureValues, type DetailDef } from './shapes'
import { computeArrows, arrowBody, type ArrowDef } from './dims'
import type { GarmentDef } from './garments'

export type Unit = 'cm' | 'po'

export const COLORS = {
  ink: '#14161F',
  line: '#8C93A8',
  fold: '#C3C8D6',
  accent: '#3B4CCA',
  empty: '#B5BACB',
  attach: '#8C93C8',
  pillStroke: '#9AA0B2',
  emptyText: '#6B7080',
}

export interface PillModel {
  x: number; y: number; w: number; h: number
  empty: boolean; active: boolean
  line1: string; line2: string | null
}

export interface ArrowModel {
  key: string
  color: string
  width: number
  line: [{ x: number; y: number }, { x: number; y: number }]
  heads: [string, string]
  attach: [ { x: number; y: number }, { x: number; y: number } ][]
  ticks: [ { x: number; y: number }, { x: number; y: number } ][]
  pill: PillModel
}

export interface DetailModel { type: DetailDef['type']; d: string }

export interface SketchModel {
  viewBox: string
  contour: string
  details: DetailModel[]
  btns: { x: number; y: number }[]
  arrows: ArrowModel[]
}

/** Formate une valeur en cm vers l'unité d'affichage. */
export function formatValue(cm: number, unit: Unit): string {
  if (unit === 'cm') {
    const r = Math.round(cm * 2) / 2
    return Number.isInteger(r) ? String(r) : String(r).replace('.', ',')
  }
  return (cm / 2.54).toFixed(1).replace('.', ',')
}

export const unitLabel = (unit: Unit) => (unit === 'cm' ? 'cm' : 'po')

const pts = (arr: { x: number; y: number }[]) => arr.map((p) => `${Math.round(p.x * 100) / 100},${Math.round(p.y * 100) / 100}`).join(' ')

export function buildSketchModel(
  garment: GarmentDef,
  values: MeasureValues,
  unit: Unit,
  activeKey: string | null,
  forExport: boolean,
  coupe = 1,
): SketchModel {
  const defs: Record<string, number> = {}
  garment.measures.forEach((m) => { defs[m.key] = m.def })
  const ds = deformShape(garment.id, values, defs, coupe)
  const shape = SHAPES[garment.id]

  const contour = contourPath(ds.p0, ds.nodes)
  const details: DetailModel[] = []
  const btnPts: { x: number; y: number }[] = []

  for (const det of shape.details) {
    const t = ds.zoneTransform(det.zone ?? 'body')
    if (det.type === 'btn' && det.at) {
      for (const c of det.at) btnPts.push(t(c.x, c.y))
      continue
    }
    if (!det.d) continue
    details.push({ type: det.type, d: transformPath(det.d, t) })
    if (det.mirror) details.push({ type: det.type, d: mirrorPath(transformPath(det.d, t)) })
  }

  // pastilles : tailles selon le contexte
  const pillW = forExport ? 30 : activeKey ? 24 : 24
  const pillH = forExport ? 12 : 10
  const arrowsDef = computeArrows(garment.id, ds, pillW, pillH)

  const arrows: ArrowModel[] = arrowsDef.map((a: ArrowDef) => {
    const mDef = garment.measures.find((m) => m.key === a.key)
    const v = values[a.key]
    const empty = v === undefined || v <= 0
    const active = !forExport && activeKey === a.key
    const body = arrowBody(a)
    const w = forExport ? 30 : active ? 30 : 24
    const h = forExport ? 12 : active ? 12 : 10
    let line1: string, line2: string | null = null
    if (empty) line1 = '?'
    else if (forExport) { line1 = mDef?.short ?? a.key.toUpperCase(); line2 = `${formatValue(v!, unit)} ${unitLabel(unit)}` }
    else line1 = `${formatValue(v!, unit)} ${unitLabel(unit)}`
    return {
      key: a.key,
      color: empty ? COLORS.empty : COLORS.accent,
      width: active ? 1.5 : 0.9,
      line: body.line,
      heads: [pts(body.heads[0]), pts(body.heads[1])],
      attach: a.attach,
      ticks: a.ticks,
      pill: { x: a.pill.x, y: a.pill.y, w, h, empty, active, line1, line2 },
    }
  })

  // boîte englobante : contour + détails + flèches + pastilles, marge 6
  const boxes = [contour, ...details.map((d) => d.d)]
  const bb = pathBBox(boxes)
  for (const a of arrows) {
    const all = [a.line[0], a.line[1], ...a.attach.flat(), ...a.ticks.flat(), a.pill]
    for (const p of all) {
      if (p.x < bb.minX) bb.minX = p.x
      if (p.x > bb.maxX) bb.maxX = p.x
      if (p.y < bb.minY) bb.minY = p.y
      if (p.y > bb.maxY) bb.maxY = p.y
    }
    bb.minX = Math.min(bb.minX, a.pill.x - a.pill.w / 2)
    bb.maxX = Math.max(bb.maxX, a.pill.x + a.pill.w / 2)
    bb.minY = Math.min(bb.minY, a.pill.y - a.pill.h / 2)
    bb.maxY = Math.max(bb.maxY, a.pill.y + a.pill.h / 2)
  }
  const m = 6
  const vb = `${bb.minX - m} ${bb.minY - m} ${bb.maxX - bb.minX + 2 * m} ${bb.maxY - bb.minY + 2 * m}`

  return { viewBox: vb, contour, details, btns: btnPts, arrows }
}

/** Découpe la viewBox en { minX, minY, w, h } (utile au rendu canvas). */
export function parseViewBox(viewBox: string) {
  const [minX, minY, w, h] = viewBox.split(/\s+/).map(Number)
  return { minX, minY, w, h }
}
