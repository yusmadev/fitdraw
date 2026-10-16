// État central de l'atelier FitDraw. Local d'abord : tout est écrit sur l'appareil
// immédiatement, la synchro cloud se branche dessus via `onDraftChange` / `onBrandingChange`.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GARMENTS, getGarment, sizeValue, coupeFactor, type Coupe, type GarmentDef, type Size } from './garments'
import type { MeasureValues } from './shapes'
import {
  DEFAULT_BRANDING,
  applyTheme,
  bumpUsage,
  isEntered,
  loadBranding,
  loadDraft,
  loadTheme,
  loadUsage,
  markEntered,
  readString,
  saveBranding,
  saveDraft,
  KEYS,
  write,
  type Branding,
  type Draft,
  type UsageEntry,
  type Theme,
} from './store'
import type { Unit } from './renderSketch'
import { exportTitle } from './rules'

export type Layout = 'mobile' | 'tablet' | 'desktop'

/** < 1020 → mobile · pointeur grossier ou < 1360 → tablette · sinon desktop. */
export function useLayout(): Layout {
  const [layout, setLayout] = useState<Layout>('desktop')
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth
      const coarse = window.matchMedia('(pointer: coarse)').matches
      if (w < 1020) setLayout('mobile')
      else if (coarse || w < 1360) setLayout('tablet')
      else setLayout('desktop')
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [])
  return layout
}

export interface FitDrawSync {
  /** Appelé après chaque modification locale du croquis. */
  onDraftChange?: (draft: Draft) => void
  onBrandingChange?: (branding: Branding) => void
  onGarmentChange?: (garmentId: string) => void
}

export function useFitDraw(sync: FitDrawSync = {}) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [garmentId, setGarmentIdState] = useState<string>(GARMENTS[0].id)
  const [unit, setUnitState] = useState<Unit>('cm')
  const [draft, setDraft] = useState<Draft>(() => loadDraft(GARMENTS[0].id))
  const [branding, setBrandingState] = useState<Branding>(DEFAULT_BRANDING)
  const [usage, setUsage] = useState<UsageEntry[]>([])
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const hydrated = useRef(false)

  const syncRef = useRef(sync)
  syncRef.current = sync

  // ── hydratation ────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = loadTheme()
    applyTheme(t)
    setThemeState(t)
    const g = readString(KEYS.garment, GARMENTS[0].id)
    const safeId = GARMENTS.some((x) => x.id === g) ? g : GARMENTS[0].id
    setGarmentIdState(safeId)
    setDraft(loadDraft(safeId))
    const u = readString(KEYS.unit, 'cm')
    setUnitState(u === 'po' ? 'po' : 'cm')
    setBrandingState(loadBranding())
    setUsage(loadUsage())
    hydrated.current = true
  }, [])

  const setTheme = useCallback((t: Theme) => {
    applyTheme(t)
    setThemeState(t)
  }, [])

  const toggleTheme = useCallback(() => setTheme(loadTheme() === 'dark' ? 'light' : 'dark'), [setTheme])

  const setUnit = useCallback((u: Unit) => {
    write(KEYS.unit, u)
    setUnitState(u)
  }, [])

  const garment: GarmentDef = useMemo(() => getGarment(garmentId), [garmentId])

  const setGarmentId = useCallback(
    (id: string) => {
      const next = loadDraft(id)
      setGarmentIdState(id)
      write(KEYS.garment, id)
      setDraft(next)
      setUsage(bumpUsage(id))
      // Changer de vêtement ne modifie aucun croquis : rien à pousser.
      syncRef.current.onGarmentChange?.(id)
    },
    [],
  )

  // ── mesures ────────────────────────────────────────────────────────────────
  const commit = useCallback((updater: (d: Draft) => Draft) => {
    setDraft((prev) => {
      // `saved` porte l'horodatage réel : c'est cette version qu'on garde en mémoire et
      // qu'on pousse, pas celle d'avant l'écriture locale.
      const saved = saveDraft(updater(prev))
      markEntered(saved.garmentId)
      syncRef.current.onDraftChange?.(saved)
      return saved
    })
  }, [])

  const setValue = useCallback(
    (key: string, value: number | undefined) => {
      commit((d) => ({ ...d, values: { ...d.values, [key]: value } }))
    },
    [commit],
  )

  const setSize = useCallback(
    (size: Size | null) => {
      commit((d) => {
        if (size === null) return { ...d, size: null }
        const values: MeasureValues = {}
        garment.measures.forEach((m) => {
          values[m.key] = sizeValue(m.def, m.key, size)
        })
        return { ...d, size, values }
      })
    },
    [commit, garment],
  )

  const setCoupe = useCallback((coupe: Coupe) => commit((d) => ({ ...d, coupe })), [commit])

  const clearValues = useCallback(() => commit((d) => ({ ...d, values: {}, size: null })), [commit])

  const coupe = useMemo(() => coupeFactor(draft.coupe), [draft.coupe])

  const title = useMemo(() => exportTitle(garment, draft.size, draft.coupe === 'droit' ? null : draft.coupe), [garment, draft.size, draft.coupe])

  const filled = useMemo(
    () => garment.measures.filter((m) => (draft.values[m.key] ?? 0) > 0).length,
    [garment, draft.values],
  )

  // ── personnalisation ───────────────────────────────────────────────────────
  const setBranding = useCallback((b: Branding) => {
    setBrandingState(b)
    saveBranding(b)
    syncRef.current.onBrandingChange?.(b)
  }, [])

  /** Applique un lot venu du serveur (connexion, autre appareil). */
  const mergeRemote = useCallback(
    (remote: { drafts?: Draft[]; branding?: Branding; usage?: UsageEntry[] }) => {
      if (remote.branding) {
        setBrandingState(remote.branding)
        saveBranding(remote.branding)
      }
      if (remote.usage) {
        setUsage(remote.usage)
        write(KEYS.usage, remote.usage)
      }
      if (remote.drafts?.length) {
        const current = remote.drafts.find((d) => d.garmentId === garmentId)
        const local = loadDraft(garmentId)
        const winner = current && current.updatedAt > local.updatedAt ? current : local
        remote.drafts.forEach((d) => {
          const mine = loadDraft(d.garmentId)
          // On écrit la version distante telle quelle, horodatage compris : la re-tamponner
          // à l'heure locale ferait croire au serveur que cette copie est plus récente.
          if (d.updatedAt > mine.updatedAt) write(KEYS.draft(d.garmentId), d)
        })
        setDraft(winner)
      }
    },
    [garmentId],
  )

  const allDrafts = useMemo(
    // Le croquis courant vient de la mémoire (plus frais que le stockage), les autres du disque.
    () => GARMENTS.map((g) => (g.id === draft.garmentId ? draft : loadDraft(g.id))),
    [draft],
  )

  return {
    theme,
    setTheme,
    toggleTheme,
    layout: useLayout(),
    garment,
    garmentId,
    setGarmentId,
    unit,
    setUnit,
    draft,
    values: draft.values,
    size: draft.size,
    coupeId: draft.coupe,
    coupe,
    setValue,
    setSize,
    setCoupe,
    clearValues,
    branding,
    setBranding,
    usage,
    activeKey,
    setActiveKey,
    title,
    filled,
    entered: isEntered(garmentId),
    mergeRemote,
    allDrafts,
  }
}

export type FitDrawState = ReturnType<typeof useFitDraw>
