// Règles métier FitDraw : alertes douces de cohérence, texte de copie, validation du logo.
import { formatValue, unitLabel, type Unit } from './renderSketch'
import type { GarmentDef } from './garments'
import type { MeasureValues } from './shapes'

export interface SoftWarning {
  key: string
  text: string
}

/**
 * Alertes douces — jamais bloquantes : elles signalent une mesure qui semble incohérente
 * avec les autres, sans empêcher l'export.
 */
export function softWarnings(garment: GarmentDef, v: MeasureValues): SoftWarning[] {
  const out: SoftWarning[] = []
  const { aisselles, epaules, manche, longueur, taille, hanches } = v

  if (aisselles && epaules) {
    if (aisselles < epaules * 0.8) {
      out.push({ key: 'aisselles', text: 'Largeur aux aisselles nettement plus petite que les épaules — vérifie la mesure.' })
    } else if (aisselles > epaules * 1.6) {
      out.push({ key: 'aisselles', text: 'Largeur aux aisselles nettement plus grande que les épaules — vérifie la mesure.' })
    }
  }

  if (manche && longueur && garment.id !== 'debardeur' && manche > longueur) {
    out.push({ key: 'manche', text: 'La manche est plus longue que le vêtement — vérifie la mesure.' })
  }

  if (taille && hanches && (garment.id === 'pantalon' || garment.id === 'short') && hanches < taille) {
    out.push({ key: 'hanches', text: 'Les hanches sont plus étroites que la taille — vérifie la mesure.' })
  }

  return out
}

/** Titre d'export : NOM · TAILLE · COUPE (les parties absentes sont omises). */
export function exportTitle(garment: GarmentDef, size: string | null, coupe: string | null): string {
  return [garment.name.toUpperCase(), size, coupe ? coupe.toUpperCase() : null]
    .filter(Boolean)
    .join(' · ')
}

/** Texte copié dans le presse-papier : titre puis une ligne par mesure. */
export function copyText(garment: GarmentDef, v: MeasureValues, unit: Unit, size: string | null, coupe: string | null): string {
  const head = exportTitle(garment, size, coupe)
  const lines = garment.measures.map((m) => {
    const val = v[m.key]
    const shown = val && val > 0 ? `${formatValue(val, unit)} ${unitLabel(unit)}` : 'non renseignée'
    return `${m.label} : ${shown}`
  })
  return [`${head} — mesures à plat (${unitLabel(unit)})`, ...lines].join('\n')
}

export const MAX_LOGO_CHARS = 350_000
export const MAX_LOGO_BYTES = 1_000_000
const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp']

export interface LogoResult {
  ok: boolean
  error?: string
  dataUrl?: string
}

/**
 * Valide et normalise un logo de boutique : PNG/JPG/WebP, 1 Mo max,
 * redimensionné à 256 px de côté, data URL plafonnée à 350 000 caractères.
 */
export async function prepareLogo(file: File): Promise<LogoResult> {
  if (!LOGO_TYPES.includes(file.type)) return { ok: false, error: 'Format accepté : PNG, JPG ou WebP.' }
  if (file.size > MAX_LOGO_BYTES) return { ok: false, error: 'Le logo doit faire moins de 1 Mo.' }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(new Error('lecture impossible'))
    r.readAsDataURL(file)
  })

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = () => reject(new Error('image illisible'))
    i.src = dataUrl
  })

  const max = 256
  const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight))
  const w = Math.max(1, Math.round(img.naturalWidth * k))
  const h = Math.max(1, Math.round(img.naturalHeight * k))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return { ok: false, error: 'Redimensionnement impossible.' }
  ctx.drawImage(img, 0, 0, w, h)

  const out = canvas.toDataURL('image/png')
  if (out.length > MAX_LOGO_CHARS) return { ok: false, error: 'Logo trop lourd une fois optimisé — essaie une image plus simple.' }
  return { ok: true, dataUrl: out }
}

/** Recherche normalisée (sans accents, sans casse) pour le sélecteur de vêtements. */
export const stripAccents = (s: string) =>
  s
    .normalize('NFD')
    .split('')
    .filter((c) => {
      const n = c.charCodeAt(0)
      return n < 0x300 || n > 0x36f
    })
    .join('')

export const normalize = (s: string) => stripAccents(s).toLowerCase().trim()
