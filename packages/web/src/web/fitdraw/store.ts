// Persistance locale FitDraw — mêmes clés que l'app d'origine, pour que rien ne soit perdu
// si quelqu'un ouvre les deux versions sur le même navigateur.
import type { MeasureValues } from './shapes'
import type { Coupe, Size } from './garments'

export const KEYS = {
  branding: 'fitdraw-branding',
  draft: (id: string) => `fitdraw-draft:${id}`,
  garment: 'fitdraw-garment',
  unit: 'fitdraw-unit',
  entered: 'fitdraw-entered',
  usage: 'fitdraw-usage',
  theme: 'fitdraw-theme',
} as const

export interface Draft {
  garmentId: string
  values: MeasureValues
  size: Size | null
  coupe: Coupe
  updatedAt: number
}

export interface Branding {
  shopName: string
  logoDataUrl: string
  showWatermark: boolean
}

export interface UsageEntry {
  garmentId: string
  count: number
  lastUsed: number
}

export const DEFAULT_BRANDING: Branding = { shopName: '', logoDataUrl: '', showWatermark: true }

export function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function readString(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

export function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
  } catch {
    /* quota plein ou navigation privée : on continue en mémoire */
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

export const emptyDraft = (garmentId: string): Draft => ({
  garmentId,
  values: {},
  size: null,
  coupe: 'droit',
  // 0, pas Date.now() : un brouillon jamais touché ne doit jamais gagner face à une
  // version venue du serveur. C'est ce qui fait qu'un nouvel appareil récupère bien
  // les croquis déjà synchronisés (sinon l'horodatage local les écrase à l'ouverture).
  updatedAt: 0,
})

export function loadDraft(garmentId: string): Draft {
  const d = read<Draft | null>(KEYS.draft(garmentId), null)
  if (!d || d.garmentId !== garmentId) return emptyDraft(garmentId)
  return { ...emptyDraft(garmentId), ...d, values: d.values ?? {} }
}

/**
 * Écrit le brouillon en local et renvoie la version horodatée.
 * L'appelant doit utiliser la valeur renvoyée : c'est elle qui part au serveur, sinon
 * la synchro pousse l'horodatage d'avant l'écriture et la fusion distante l'ignore.
 */
export const saveDraft = (d: Draft): Draft => {
  const stamped = { ...d, updatedAt: Date.now() }
  write(KEYS.draft(d.garmentId), stamped)
  return stamped
}

export const loadBranding = (): Branding => ({ ...DEFAULT_BRANDING, ...read<Partial<Branding>>(KEYS.branding, {}) })
export const saveBranding = (b: Branding) => write(KEYS.branding, b)

export const loadUsage = (): UsageEntry[] => read<UsageEntry[]>(KEYS.usage, [])
export const saveUsage = (u: UsageEntry[]) => write(KEYS.usage, u)

export function bumpUsage(garmentId: string): UsageEntry[] {
  const list = loadUsage()
  const found = list.find((e) => e.garmentId === garmentId)
  if (found) {
    found.count += 1
    found.lastUsed = Date.now()
  } else {
    list.push({ garmentId, count: 1, lastUsed: Date.now() })
  }
  saveUsage(list)
  return list
}

/** Vêtements déjà saisis — sert à ne pas réécraser un croquis en cours avec un pré-remplissage. */
export const loadEntered = (): string[] => read<string[]>(KEYS.entered, [])
export const markEntered = (garmentId: string) => {
  const list = loadEntered()
  if (!list.includes(garmentId)) write(KEYS.entered, [...list, garmentId])
}
export const isEntered = (garmentId: string) => loadEntered().includes(garmentId)

export type Theme = 'light' | 'dark'

export function loadTheme(): Theme {
  const stored = readString(KEYS.theme, '')
  if (stored === 'light' || stored === 'dark') return stored
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
  write(KEYS.theme, theme)
}
