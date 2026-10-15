// Construction du SVG d'export (320×320, rendu à ×5 = 1600×1600) et rasterisation.
import { buildSketchModel, COLORS, type Unit } from './renderSketch'
import type { GarmentDef } from './garments'
import type { MeasureValues } from './shapes'
import { FONT_STYLE } from './fontData'

export interface ExportBranding {
  showWatermark: boolean
  shopName: string
  logoDataUrl: string
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const escAttr = (s: string) => esc(s).replace(/"/g, '&quot;')

function detailStroke(type: string): { fill: string; stroke: string; w: number; dash?: string } {
  switch (type) {
    case 'dark': return { fill: 'none', stroke: COLORS.ink, w: 1.2 }
    case 'line': return { fill: 'none', stroke: COLORS.line, w: 0.8 }
    case 'dash': return { fill: 'none', stroke: COLORS.line, w: 0.8, dash: '1.6 1.6' }
    case 'fold': return { fill: 'none', stroke: COLORS.fold, w: 0.8 }
    case 'leaf': return { fill: '#FFFFFF', stroke: COLORS.ink, w: 1 }
    case 'grayfill': return { fill: '#E3E6EE', stroke: COLORS.line, w: 0.8 }
    default: return { fill: 'none', stroke: COLORS.line, w: 0.8 }
  }
}

/** SVG intérieur du croquis (utilisé aussi par le filigrane) */
function sketchInner(garment: GarmentDef, values: MeasureValues, unit: Unit, showWatermark: boolean, coupe: number): { inner: string; viewBox: string } {
  const model = buildSketchModel(garment, values, unit, null, true, coupe)
  const parts: string[] = []

  if (showWatermark) {
    parts.push(`<defs><pattern id="wm" width="24" height="11" patternUnits="userSpaceOnUse" patternTransform="rotate(-22)">
      <text x="0" y="8" font-family="Plus Jakarta Sans" font-size="3.8" font-weight="800" fill="#7F87A8" opacity="0.5">FitDraw</text>
    </pattern></defs>`)
  }

  // contour : remplissage blanc + filigrane par-dessus
  parts.push(`<path d="${model.contour}" fill="#FFFFFF" stroke="${COLORS.ink}" stroke-width="1.5" stroke-linejoin="round"/>`)
  if (showWatermark) parts.push(`<path d="${model.contour}" fill="url(#wm)" stroke="none"/>`)

  for (const d of model.details) {
    const s = detailStroke(d.type)
    parts.push(`<path d="${d.d}" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.w}"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''} stroke-linecap="round" stroke-linejoin="round"/>`)
  }
  for (const b of model.btns) {
    parts.push(`<circle cx="${b.x}" cy="${b.y}" r="1.3" fill="#FFFFFF" stroke="${COLORS.line}" stroke-width="0.7"/>`)
  }

  for (const a of model.arrows) {
    for (const att of a.attach) {
      parts.push(`<line x1="${att[0].x}" y1="${att[0].y}" x2="${att[1].x}" y2="${att[1].y}" stroke="${COLORS.attach}" stroke-width="0.6" stroke-dasharray="1 1.4" stroke-linecap="round"/>`)
    }
    for (const t of a.ticks) {
      parts.push(`<line x1="${t[0].x}" y1="${t[0].y}" x2="${t[1].x}" y2="${t[1].y}" stroke="${a.color}" stroke-width="0.7" stroke-linecap="round"/>`)
    }
    parts.push(`<line x1="${a.line[0].x}" y1="${a.line[0].y}" x2="${a.line[1].x}" y2="${a.line[1].y}" stroke="${a.color}" stroke-width="${a.width}" stroke-linecap="round"/>`)
    parts.push(`<polygon points="${a.heads[0]}" fill="${a.color}"/><polygon points="${a.heads[1]}" fill="${a.color}"/>`)
    const p = a.pill
    const rx = p.h / 2
    if (p.empty) {
      parts.push(`<rect x="${p.x - p.w / 2}" y="${p.y - p.h / 2}" width="${p.w}" height="${p.h}" rx="${rx}" fill="#FFFFFF" stroke="${COLORS.pillStroke}" stroke-width="0.8" stroke-dasharray="1.6 1.6"/>`)
      parts.push(`<text x="${p.x}" y="${p.y + 1.9}" text-anchor="middle" font-family="Plus Jakarta Sans" font-size="5.4" font-weight="800" fill="${COLORS.emptyText}">?</text>`)
    } else {
      parts.push(`<rect x="${p.x - p.w / 2}" y="${p.y - p.h / 2}" width="${p.w}" height="${p.h}" rx="${rx}" fill="${COLORS.accent}" stroke="#FFFFFF" stroke-width="1.2"/>`)
      parts.push(`<text x="${p.x}" y="${p.y - 0.9}" text-anchor="middle" font-family="Plus Jakarta Sans" font-size="3.1" font-weight="700" fill="#CBD0F5">${esc(p.line1)}</text>`)
      parts.push(`<text x="${p.x}" y="${p.y + 3.6}" text-anchor="middle" font-family="Plus Jakarta Sans" font-size="5.4" font-weight="800" fill="#FFFFFF">${esc(p.line2 ?? '')}</text>`)
    }
  }

  return { inner: parts.join('\n'), viewBox: model.viewBox }
}

export function buildExportSVG(garment: GarmentDef, values: MeasureValues, unit: Unit, branding: ExportBranding, displayTitle = '', coupe = 1): string {
  const { inner, viewBox } = sketchInner(garment, values, unit, branding.showWatermark, coupe)
  const title = displayTitle || garment.name.toUpperCase()
  const shopName = branding.shopName.trim().slice(0, 32)
  const brand = shopName ? esc(shopName) : 'FitDraw'
  const brandColor = shopName ? COLORS.ink : COLORS.accent
  const logo = branding.logoDataUrl
    ? `<image x="20" y="288" width="18" height="18" href="${escAttr(branding.logoDataUrl)}" preserveAspectRatio="xMidYMid meet"/>`
    : ''
  const brandX = branding.logoDataUrl ? 44 : 300
  const brandAnchor = branding.logoDataUrl ? 'start' : 'end'
  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
<style>${FONT_STYLE}</style>
<rect width="320" height="320" fill="#F3F4F8"/>
<text x="20" y="30" font-family="Plus Jakarta Sans" font-size="13" font-weight="800" letter-spacing="1.2" fill="${COLORS.ink}">${esc(title)}</text>
<text x="300" y="30" text-anchor="end" font-family="Plus Jakarta Sans" font-size="11" font-weight="600" fill="#6B7080">Mesures à plat</text>
<svg x="9" y="38" width="302" height="246" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">
${inner}
</svg>
<text x="20" y="306" font-family="Plus Jakarta Sans" font-size="10.5" font-weight="600" fill="#6B7080">Mesures prises à plat, ± 1 cm</text>
${logo}
<text x="${brandX}" y="306" text-anchor="${brandAnchor}" font-family="Plus Jakarta Sans" font-size="13" font-weight="800" fill="${brandColor}">${brand}</text>
</svg>`
}

export async function exportPngBlob(svg: string): Promise<Blob> {
  await document.fonts.ready
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  const img = new Image()
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('svg load failed'))
    img.src = url
  })
  const canvas = document.createElement('canvas')
  canvas.width = 1600
  canvas.height = 1600
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#F3F4F8'
  ctx.fillRect(0, 0, 1600, 1600)
  ctx.drawImage(img, 0, 0, 1600, 1600)
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
  })
}
