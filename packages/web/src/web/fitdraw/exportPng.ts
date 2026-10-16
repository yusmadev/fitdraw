// Export PNG 1600×1600 — composition identique au SVG d'origine (espace 320×320, ×5),
// dessinée directement au Canvas 2D pour que le texte utilise la police de l'app.
import { buildSketchModel, parseViewBox, COLORS, type Unit } from './renderSketch'
import type { GarmentDef } from './garments'
import type { MeasureValues } from './shapes'

export interface ExportBranding {
  showWatermark: boolean
  shopName: string
  logoDataUrl: string
}

const BG = '#F3F4F8'
const FONT = '"Plus Jakarta Sans", system-ui, sans-serif'
const SIZE = 320
const SCALE = 5

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function detailStyle(type: string): { fill: string | null; stroke: string; w: number; dash?: number[] } {
  switch (type) {
    case 'dark': return { fill: null, stroke: COLORS.ink, w: 1.2 }
    case 'line': return { fill: null, stroke: COLORS.line, w: 0.8 }
    case 'dash': return { fill: null, stroke: COLORS.line, w: 0.8, dash: [1.6, 1.6] }
    case 'fold': return { fill: null, stroke: COLORS.fold, w: 0.8 }
    case 'leaf': return { fill: '#FFFFFF', stroke: COLORS.ink, w: 1 }
    case 'grayfill': return { fill: '#E3E6EE', stroke: COLORS.line, w: 0.8 }
    default: return { fill: null, stroke: COLORS.line, w: 0.8 }
  }
}

async function loadImage(src: string): Promise<HTMLImageElement | null> {
  try {
    const img = new Image()
    img.decoding = 'sync'
    img.src = src
    await img.decode()
    return img
  } catch {
    return null
  }
}

/** Compose le croquis d'export dans un contexte 320×320 (déjà mis à l'échelle ×5). */
export async function paintExport(
  ctx: CanvasRenderingContext2D,
  garment: GarmentDef,
  values: MeasureValues,
  unit: Unit,
  branding: ExportBranding,
  displayTitle = '',
  coupe = 1,
) {
  ctx.fillStyle = BG
  ctx.fillRect(0, 0, SIZE, SIZE)

  const title = displayTitle || garment.name.toUpperCase()
  const model = buildSketchModel(garment, values, unit, null, true, coupe)
  const vb = parseViewBox(model.viewBox)

  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  // titre
  ctx.fillStyle = COLORS.ink
  ctx.font = `800 13px ${FONT}`
  ;(ctx as unknown as { letterSpacing: string }).letterSpacing = '1.2px'
  ctx.fillText(title, 20, 30)
  ;(ctx as unknown as { letterSpacing: string }).letterSpacing = '0px'

  // sous-titre
  ctx.fillStyle = '#6B7080'
  ctx.font = `600 11px ${FONT}`
  ctx.textAlign = 'right'
  ctx.fillText('Mesures à plat', 300, 30)

  // cadre du croquis : x 9, y 38, 302 × 246, fit « meet »
  const box = { x: 9, y: 38, w: 302, h: 246 }
  const s = Math.min(box.w / vb.w, box.h / vb.h)
  const offX = box.x + (box.w - vb.w * s) / 2
  const offY = box.y + (box.h - vb.h * s) / 2

  ctx.save()
  ctx.translate(offX - vb.minX * s, offY - vb.minY * s)
  ctx.scale(s, s)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  const contour = new Path2D(model.contour)

  // contour : remplissage blanc
  ctx.fillStyle = '#FFFFFF'
  ctx.fill(contour)

  // filigrane, découpé sur le contour
  if (branding.showWatermark) {
    ctx.save()
    ctx.clip(contour)
    ctx.globalAlpha = 0.5
    ctx.fillStyle = '#7F87A8'
    ctx.font = `800 3.8px ${FONT}`
    ctx.textAlign = 'left'
    const startX = vb.minX - 60
    const startY = vb.minY - 60
    for (let y = startY; y < vb.minY + vb.h + 60; y += 11) {
      for (let x = startX; x < vb.minX + vb.w + 60; x += 24) {
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate((-22 * Math.PI) / 180)
        ctx.fillText('FitDraw', 0, 8)
        ctx.restore()
      }
    }
    ctx.restore()
  }

  ctx.strokeStyle = COLORS.ink
  ctx.lineWidth = 1.5
  ctx.stroke(contour)

  // détails
  for (const d of model.details) {
    const st = detailStyle(d.type)
    const p = new Path2D(d.d)
    if (st.fill) { ctx.fillStyle = st.fill; ctx.fill(p) }
    ctx.strokeStyle = st.stroke
    ctx.lineWidth = st.w
    ctx.setLineDash(st.dash ?? [])
    ctx.stroke(p)
  }
  ctx.setLineDash([])

  // boutons
  for (const b of model.btns) {
    ctx.beginPath()
    ctx.arc(b.x, b.y, 1.3, 0, Math.PI * 2)
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()
    ctx.strokeStyle = COLORS.line
    ctx.lineWidth = 0.7
    ctx.stroke()
  }

  // cotations
  for (const a of model.arrows) {
    for (const att of a.attach) {
      ctx.beginPath()
      ctx.moveTo(att[0].x, att[0].y)
      ctx.lineTo(att[1].x, att[1].y)
      ctx.strokeStyle = COLORS.attach
      ctx.lineWidth = 0.6
      ctx.setLineDash([1, 1.4])
      ctx.stroke()
    }
    ctx.setLineDash([])
    for (const t of a.ticks) {
      ctx.beginPath()
      ctx.moveTo(t[0].x, t[0].y)
      ctx.lineTo(t[1].x, t[1].y)
      ctx.strokeStyle = a.color
      ctx.lineWidth = 0.7
      ctx.stroke()
    }
    ctx.beginPath()
    ctx.moveTo(a.line[0].x, a.line[0].y)
    ctx.lineTo(a.line[1].x, a.line[1].y)
    ctx.strokeStyle = a.color
    ctx.lineWidth = a.width
    ctx.stroke()

    for (const head of a.heads) {
      const points = head.split(' ').map((pair) => pair.split(',').map(Number))
      ctx.beginPath()
      ctx.moveTo(points[0][0], points[0][1])
      ctx.lineTo(points[1][0], points[1][1])
      ctx.lineTo(points[2][0], points[2][1])
      ctx.closePath()
      ctx.fillStyle = a.color
      ctx.fill()
    }

    const p = a.pill
    ctx.textAlign = 'center'
    if (p.empty) {
      roundRect(ctx, p.x - p.w / 2, p.y - p.h / 2, p.w, p.h, p.h / 2)
      ctx.fillStyle = '#FFFFFF'
      ctx.fill()
      ctx.strokeStyle = COLORS.pillStroke
      ctx.lineWidth = 0.8
      ctx.setLineDash([1.6, 1.6])
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = COLORS.emptyText
      ctx.font = `800 5.4px ${FONT}`
      ctx.fillText('?', p.x, p.y + 1.9)
    } else {
      roundRect(ctx, p.x - p.w / 2, p.y - p.h / 2, p.w, p.h, p.h / 2)
      ctx.fillStyle = COLORS.accent
      ctx.fill()
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 1.2
      ctx.stroke()
      if (p.line2) {
        ctx.fillStyle = '#CBD0F5'
        ctx.font = `700 3.1px ${FONT}`
        ctx.fillText(p.line1, p.x, p.y - 0.9)
        ctx.fillStyle = '#FFFFFF'
        ctx.font = `800 5.4px ${FONT}`
        ctx.fillText(p.line2, p.x, p.y + 3.6)
      } else {
        ctx.fillStyle = '#FFFFFF'
        ctx.font = `800 5.4px ${FONT}`
        ctx.fillText(p.line1, p.x, p.y + 1.9)
      }
    }
  }

  ctx.restore()

  // pied de page
  ctx.textAlign = 'left'
  ctx.fillStyle = '#6B7080'
  ctx.font = `600 10.5px ${FONT}`
  ctx.fillText('Mesures prises à plat, ± 1 cm', 20, 306)

  const shopName = branding.shopName.trim().slice(0, 32)
  if (branding.logoDataUrl) {
    const logo = await loadImage(branding.logoDataUrl)
    if (logo) {
      const lw = logo.naturalWidth || logo.width
      const lh = logo.naturalHeight || logo.height
      const k = Math.min(18 / lw, 18 / lh)
      const w = lw * k
      const h = lh * k
      ctx.drawImage(logo, 20 + (18 - w) / 2, 288 + (18 - h) / 2, w, h)
    }
  }
  ctx.fillStyle = shopName ? COLORS.ink : COLORS.accent
  ctx.font = `800 13px ${FONT}`
  ctx.textAlign = branding.logoDataUrl ? 'left' : 'right'
  ctx.fillText(shopName || 'FitDraw', branding.logoDataUrl ? 44 : 300, 306)
}

/** Rasterise le croquis d'export en PNG 1600 × 1600. */
export async function exportPngBlob(
  garment: GarmentDef,
  values: MeasureValues,
  unit: Unit,
  branding: ExportBranding,
  displayTitle = '',
  coupe = 1,
): Promise<Blob> {
  await document.fonts.ready
  const canvas = document.createElement('canvas')
  canvas.width = SIZE * SCALE
  canvas.height = SIZE * SCALE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas indisponible')
  ctx.scale(SCALE, SCALE)
  await paintExport(ctx, garment, values, unit, branding, displayTitle, coupe)
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
  })
}
