import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { gsap } from 'gsap'
import { ImagePlus, ShieldCheck, Trash2 } from 'lucide-react'
import { GARMENTS, SIZES, getGarment, isTopLike, sizeValue, coupeFactor, hasCoupe, type Size, type Coupe } from './lib/garments'
import type { MeasureValues } from './lib/shapes'
import { formatValue, unitLabel, type Unit } from './lib/renderSketch'
import { buildExportSVG, exportPngBlob } from './lib/exportPng'
import Sketch from './components/Sketch'
import MeasureRow from './components/MeasureRow'
import UnitToggle from './components/UnitToggle'
import GarmentPicker from './components/GarmentPicker'
import GarmentIcon from './components/GarmentIcon'
import { CopyIcon, DownloadIcon, ShareIcon, ChevronDown } from './components/Icons'
import FitSelectors from './components/FitSelectors'
import Landing from './components/Landing'
import ThemeToggle from './components/ThemeToggle'
import { useTheme } from './hooks/useTheme'

type Layout = 'mobile' | 'tablet' | 'desktop'
type BrandSettings = { shopName: string; logoDataUrl: string; showWatermark: boolean }
type LocalDraft = { values: MeasureValues; size: Size | null; coupe: Coupe }

const BRAND_KEY = 'fitdraw-branding'
const DRAFT_PREFIX = 'fitdraw-draft:'

function readGarmentId(): string {
  try {
    const saved = localStorage.getItem('fitdraw-garment')
    return saved && GARMENTS.some((g) => g.id === saved) ? saved : 'tshirt'
  } catch {
    return 'tshirt'
  }
}

function readDraft(id: string): LocalDraft {
  const garment = getGarment(id)
  try {
    const parsed = JSON.parse(localStorage.getItem(`${DRAFT_PREFIX}${id}`) ?? '{}') as Partial<LocalDraft>
    const rawValues = parsed.values && typeof parsed.values === 'object' ? parsed.values : {}
    const values: MeasureValues = {}
    for (const measure of garment.measures) {
      const value = (rawValues as Record<string, unknown>)[measure.key]
      if (typeof value === 'number' && Number.isFinite(value) && value > 0) values[measure.key] = value
    }
    return {
      values,
      size: SIZES.includes(parsed.size as Size) ? parsed.size as Size : null,
      coupe: parsed.coupe === 'slim' || parsed.coupe === 'baggy' || parsed.coupe === 'droit' ? parsed.coupe : 'droit',
    }
  } catch {
    return { values: {}, size: null, coupe: 'droit' }
  }
}
const DEFAULT_BRANDING: BrandSettings = { shopName: '', logoDataUrl: '', showWatermark: true }

function readBranding(): BrandSettings {
  try {
    const saved = JSON.parse(localStorage.getItem(BRAND_KEY) ?? '{}') as Partial<BrandSettings>
    return {
      shopName: typeof saved.shopName === 'string' ? saved.shopName.slice(0, 32) : '',
      logoDataUrl: typeof saved.logoDataUrl === 'string' && saved.logoDataUrl.startsWith('data:image/png;base64,') && saved.logoDataUrl.length <= 350_000 ? saved.logoDataUrl : '',
      showWatermark: typeof saved.showWatermark === 'boolean' ? saved.showWatermark : true,
    }
  } catch { return DEFAULT_BRANDING }
}

function useLayout(): Layout {
  const compute = (): Layout => {
    const w = window.innerWidth
    const coarse = window.matchMedia('(pointer: coarse)').matches
    if (w < 1020) return 'mobile'
    if (coarse || w < 1360) return 'tablet'
    return 'desktop'
  }
  const [layout, setLayout] = useState<Layout>(compute)
  useEffect(() => {
    const onResize = () => setLayout(compute())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return layout
}

const store = {
  get(key: string): string | null {
    try { return localStorage.getItem(key) } catch { return null }
  },
  set(key: string, value: string) {
    try { localStorage.setItem(key, value) } catch { /* sans compte, tant pis */ }
  },
}

export default function App() {
  const layout = useLayout()
  const [theme, toggleTheme] = useTheme()
  const [garmentId, setGarmentId] = useState(readGarmentId)
  const [unit, setUnit] = useState<Unit>(() => (store.get('fitdraw-unit') === 'po' ? 'po' : 'cm'))
  const [values, setValues] = useState<MeasureValues>(() => readDraft(readGarmentId()).values)
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [proOpen, setProOpen] = useState(false)
  const [branding, setBranding] = useState<BrandSettings>(readBranding)
  const [size, setSize] = useState<Size | null>(() => readDraft(readGarmentId()).size)
  const [coupe, setCoupe] = useState<Coupe>(() => readDraft(readGarmentId()).coupe)
  const [entered, setEntered] = useState(() => store.get('fitdraw-entered') === '1')
  const toastTimer = useRef<number>(0)
  const proDialogRef = useRef<HTMLElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [usage, setUsage] = useState<Record<string, number>>(() => {
    try { return JSON.parse(store.get('fitdraw-usage') ?? '{}') } catch { return {} }
  })

  const garment = getGarment(garmentId)

  useEffect(() => {
    store.set(BRAND_KEY, JSON.stringify(branding))
  }, [branding])

  useEffect(() => {
    store.set(`${DRAFT_PREFIX}${garmentId}`, JSON.stringify({ values, size, coupe } satisfies LocalDraft))
  }, [garmentId, values, size, coupe])

  useEffect(() => {
    if (!proOpen || !proDialogRef.current) return
    const animation = gsap.fromTo(proDialogRef.current, { opacity: 0, y: 18, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.28, ease: 'power2.out' })
    return () => { animation.kill() }
  }, [proOpen])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 4000)
  }, [])

  const changeUnit = (u: Unit) => { setUnit(u); store.set('fitdraw-unit', u) }

  const selectGarment = (id: string) => {
    setGarmentId(id)
    store.set('fitdraw-garment', id)
    const u = { ...usage, [id]: (usage[id] ?? 0) + 1 }
    store.set('fitdraw-usage', JSON.stringify(u))
    setUsage(u)
    const draft = readDraft(id)
    setValues(draft.values)
    setActiveKey(null)
    setSize(draft.size)
    setCoupe(draft.coupe)
    setPickerOpen(false)
  }

  const applySize = (s: Size) => {
    setSize(s)
    const next: MeasureValues = {}
    garment.measures.forEach((m) => { next[m.key] = sizeValue(m.def, m.key, s) })
    setValues(next)
  }

  const enterApp = () => {
    setEntered(true)
    store.set('fitdraw-entered', '1')
  }

  const setValue = (key: string, cm: number | undefined) =>
    setValues((v) => ({ ...v, [key]: cm }))

  // alertes douces
  const alerts = useMemo(() => {
    const out: string[] = []
    const v = (k: string) => values[k]
    if (isTopLike(garmentId) || garmentId === 'debardeur') {
      const a = v('aisselles'), s = v('epaules'), mch = v('manche'), l = v('longueur')
      const def = (k: string) => garment.measures.find((m) => m.key === k)?.def ?? 1
      const A = a ?? def('aisselles'), S = s ?? def('epaules')
      if (a !== undefined && A < S * 0.8) out.push('Largeur aux aisselles faible par rapport aux épaules — vérifiez les mesures.')
      if (a !== undefined && A > S * 1.6) out.push('Largeur aux aisselles très large par rapport aux épaules — coupe oversize assumée ?')
      if (mch !== undefined && l !== undefined && garmentId !== 'debardeur' && mch > l)
        out.push('Manche plus longue que le vêtement : vérifiez la longueur.')
    }
    if (garmentId === 'pantalon' || garmentId === 'short') {
      const h = v('hanches'), t = v('taille')
      if (h !== undefined && t !== undefined && h < t)
        out.push('Hanches plus étroites que la taille : peu courant, vérifiez les mesures.')
    }
    return out
  }, [garmentId, values, garment])

  const missing = garment.measures.filter((m) => values[m.key] === undefined || (values[m.key] ?? 0) <= 0)

  const fitSuffix = () => {
    const parts: string[] = []
    if (size) parts.push(`taille ${size}`)
    if (hasCoupe(garmentId) && coupe !== 'droit') parts.push(`coupe ${coupe}`)
    return parts.length ? ` — ${parts.join(' — ')}` : ''
  }

  const exportTitle = () =>
    `${garment.name.toUpperCase()}${size ? ` · ${size}` : ''}${hasCoupe(garmentId) && coupe !== 'droit' ? ` · ${coupe.toUpperCase()}` : ''}`

  const copyText = () => {
    const u = unitLabel(unit)
    const lines = garment.measures.map((m) => {
      const v = values[m.key]
      const val = v !== undefined && v > 0 ? `${formatValue(v, unit)} ${u}` : 'non renseignée'
      return `${m.label} : ${val}`
    })
    return `${garment.name.toUpperCase()}${fitSuffix()} — mesures à plat (${u})\n${lines.join('\n')}`
  }

  const doCopy = async () => {
    const text = copyText()
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const copiedText = document.execCommand('copy')
      ta.remove()
      if (!copiedText) {
        showToast('Copie impossible : autorisez l’accès au presse-papiers.')
        return
      }
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const makePng = async (): Promise<Blob> => {
    const svg = buildExportSVG(garment, values, unit, branding, exportTitle(), coupeFactor(coupe))
    return exportPngBlob(svg)
  }

  const download = (blob: Blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fitdraw-${garment.id}.png`
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 5000)
  }

  const doExport = async () => {
    try {
      if (missing.length > 0)
        showToast(`${missing.length} mesure(s) non saisie(s) : elles apparaîtront avec un '?'.`)
      const blob = await makePng()
      const file = new File([blob], `fitdraw-${garment.id}.png`, { type: 'image/png' })
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
      if (layout === 'mobile' && nav.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'FitDraw' })
        return
      }
      download(blob)
    } catch (error) {
      showToast(error instanceof Error ? `Export impossible : ${error.message}` : 'Export impossible.')
    }
  }

  const onLogoSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { showToast('Choisissez un fichier PNG, JPG ou WebP.'); return }
    if (file.size > 1024 * 1024) { showToast('Le logo doit peser moins de 1 Mo.'); return }
    const reader = new FileReader()
    reader.onload = () => {
      const image = new Image()
      image.onload = () => {
        const canvas = document.createElement('canvas')
        const scale = Math.min(1, 256 / Math.max(image.width, image.height))
        canvas.width = Math.max(1, Math.round(image.width * scale))
        canvas.height = Math.max(1, Math.round(image.height * scale))
        const context = canvas.getContext('2d')
        if (!context) { showToast('Impossible de préparer le logo.'); return }
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        try {
          const logoDataUrl = canvas.toDataURL('image/png')
          if (logoDataUrl.length > 350_000) { showToast('Le logo compressé dépasse la limite de stockage.'); return }
          setBranding((current) => ({ ...current, logoDataUrl }))
        } catch {
          showToast('Impossible de compresser ce logo.')
        }
      }
      image.onerror = () => showToast('Ce fichier image ne peut pas être lu.')
      image.src = String(reader.result)
    }
    reader.onerror = () => showToast('Impossible de lire le fichier image.')
    reader.readAsDataURL(file)
  }

  const resetBranding = () => {
    setBranding(DEFAULT_BRANDING)
    showToast('Personnalisation remise à zéro.')
  }

  const doShare = async () => {
    try {
      const blob = await makePng()
      const file = new File([blob], `fitdraw-${garment.id}.png`, { type: 'image/png' })
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
      if (nav.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'FitDraw' })
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') return
          throw error
        }
        return
      }
      download(blob)
    } catch (error) {
      showToast(error instanceof Error ? `Partage impossible : ${error.message}` : 'Partage impossible.')
    }
  }

  const sketch = (
    <Sketch
      garment={garment}
      values={values}
      unit={unit}
      activeKey={activeKey}
      onPillClick={(key) => setActiveKey(key)}
      className="max-w-full max-h-full w-full h-full"
      coupe={coupeFactor(coupe)}
    />
  )

  const rows = (variant: 'mobile' | 'panel') => (
    <>
      {garment.measures.map((m) => (
        <MeasureRow
          key={`${garment.id}-${m.key}`}
          measure={m}
          value={values[m.key]}
          unit={unit}
          active={activeKey === m.key}
          variant={variant}
          onActivate={() => setActiveKey(m.key)}
          onChange={(cm) => setValue(m.key, cm)}
        />
      ))}
      {alerts.length > 0 && (
        <div className="px-1 pt-1 space-y-1">
          {alerts.map((a, i) => (
            <p key={i} className="text-[12px] leading-snug t-sub">{a}</p>
          ))}
        </div>
      )}
    </>
  )

  const tip = (
    <div className="mt-auto rounded-[18px] t-surface2 p-4 text-[13px] font-semibold t-sub">
      Pose le vêtement à plat, sans étirer le tissu, et mesure avec un mètre ruban.
    </div>
  )

  const selectorPill = (pillCls: string, nameSize: string, sub: boolean) => (
    <>
      <span className={`${pillCls} flex items-center justify-center shrink-0`}>
        <GarmentIcon id={garment.id} className="w-[70%] h-[70%]" color="#3B4CCA" />
      </span>
      <span className="flex-1 text-left min-w-0">
        <span className={`block font-extrabold t-ink truncate ${nameSize}`}>{garment.name}</span>
        {sub && <span className="block text-[12px] font-semibold t-sub">Changer de vêtement</span>}
      </span>
      <ChevronDown className="w-5 h-5 shrink-0 t-sub" />
    </>
  )

  if (layout === 'desktop' && !entered) return <Landing onStart={enterApp} theme={theme} onToggleTheme={toggleTheme} />

  return (
    <div className="min-h-screen t-bg t-ink" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {layout === 'mobile' && (
        <div className="flex flex-col h-[100dvh] t-card">
          <header className="px-5 pt-4 pb-1 flex items-center justify-between shrink-0"
            style={{ paddingTop: 'calc(16px + env(safe-area-inset-top))' }}>
            <h1 className="text-[21px] font-extrabold tracking-[-0.02em]">FitDraw</h1>
            <div className="flex items-center gap-2">
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <button type="button" onClick={() => setProOpen(true)} aria-label="Personnaliser l’export" className="w-11 h-11 rounded-full t-surface flex items-center justify-center text-[#3B4CCA]"><ImagePlus className="w-5 h-5" /></button>
              <UnitToggle unit={unit} onChange={changeUnit} />
            </div>
          </header>

          <div className="px-5 pt-1 pb-2 shrink-0">
            <button type="button" onClick={() => setPickerOpen(true)}
              className="w-full h-[52px] rounded-2xl t-surface flex items-center gap-3 px-2"
              aria-label="Choisir un vêtement">
              {selectorPill('w-[38px] h-[38px] rounded-xl t-card', 'text-[16px]', true)}
            </button>
          </div>

          <div className="mx-5 t-surface rounded-3xl h-[300px] shrink-0 flex items-center justify-center p-2">
            <div className="w-[330px] max-w-full h-full flex items-center justify-center">{sketch}</div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pt-2 space-y-2 pb-24">
            <FitSelectors compact garmentId={garmentId} size={size} coupe={coupe} onSize={applySize} onCoupe={setCoupe} />
            {rows('mobile')}
          </div>

          <div className="fixed bottom-0 left-0 right-0 t-card border-t t-border px-5 pt-3 flex gap-3"
            style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}>
            <button type="button" onClick={doCopy}
              className="h-[52px] rounded-full border-[1.5px] t-border-strong t-card px-[18px] text-[14px] font-bold flex items-center gap-2">
              <CopyIcon className="w-5 h-5" />{copied ? 'Mesures copiées !' : 'Copier'}
            </button>
            <button type="button" onClick={doExport}
              className="flex-1 h-[52px] rounded-full bg-[#3B4CCA] text-white text-[16px] font-extrabold flex items-center justify-center gap-2">
              <DownloadIcon className="w-5 h-5" />Exporter en PNG
            </button>
          </div>
        </div>
      )}

      {layout === 'tablet' && (
        <div className="relative h-[100dvh] t-canvas overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 right-[428px] flex items-center justify-center p-8">
            <div className="w-[min(680px,100%)] h-full flex items-center justify-center">{sketch}</div>
          </div>

          <button type="button" onClick={() => setPickerOpen(true)}
            className="absolute left-7 top-7 h-[60px] rounded-full t-card shadow-[0_2px_14px_rgba(20,22,31,0.09)] pl-[10px] pr-5 flex items-center gap-3"
            aria-label="Choisir un vêtement">
            {selectorPill('w-10 h-10 rounded-full bg-[#E8EAFB]', 'text-[17px]', false)}
          </button>

          <div className="absolute bottom-8 left-0 right-[428px] flex justify-center">
            <div className="h-[76px] rounded-full t-card shadow-[0_4px_24px_rgba(20,22,31,0.12)] px-[10px] flex items-center gap-[10px]">
              <button type="button" onClick={doCopy}
                className="h-14 rounded-full border-[1.5px] t-border-strong t-card px-6 text-[15px] font-bold flex items-center gap-2">
                <CopyIcon className="w-5 h-5" />{copied ? 'Mesures copiées !' : 'Copier'}
              </button>
              <button type="button" onClick={doShare}
                className="h-14 rounded-full border-[1.5px] t-border-strong t-card px-6 text-[15px] font-bold flex items-center gap-2">
                <ShareIcon className="w-5 h-5" />Partager
              </button>
              <button type="button" onClick={doExport}
                className="h-14 rounded-full bg-[#3B4CCA] text-white px-[34px] text-[17px] font-extrabold flex items-center gap-2">
                <DownloadIcon className="w-5 h-5" />Exporter en PNG
              </button>
            </div>
          </div>

          <div className="absolute top-7 right-7 flex gap-2">
            <button type="button" onClick={() => setProOpen(true)} aria-label="Personnaliser l’export" className="w-11 h-11 rounded-full t-card flex items-center justify-center text-[#3B4CCA] shadow-[0_2px_14px_rgba(20,22,31,0.09)]"><ImagePlus className="w-5 h-5" /></button>
            <ThemeToggle theme={theme} onToggle={toggleTheme} className="shadow-[0_2px_14px_rgba(20,22,31,0.09)]" />
          </div>
          <aside className="absolute right-6 top-6 bottom-6 w-[380px] t-card rounded-[32px] shadow-[0_4px_24px_rgba(20,22,31,0.08)] px-[22px] py-[26px] flex flex-col gap-[10px]">
            <div className="flex items-center justify-between shrink-0">
              <h2 className="text-[22px] font-extrabold">Mesures</h2>
              <UnitToggle unit={unit} onChange={changeUnit} size="lg" />
            </div>
            <div className="flex-1 overflow-y-auto space-y-[10px] min-h-0">
              <FitSelectors garmentId={garmentId} size={size} coupe={coupe} onSize={applySize} onCoupe={setCoupe} />
              {rows('panel')}
            </div>
            {tip}
          </aside>
        </div>
      )}

      {layout === 'desktop' && (
        <div className="min-h-screen t-canvas flex flex-col">
          <header className="h-[72px] t-card border-b t-border px-7 grid grid-cols-[minmax(180px,1fr)_auto_minmax(0,1fr)] items-center gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-[34px] h-[34px] rounded-[10px] bg-[#3B4CCA] flex items-center justify-center">
                <GarmentIcon id="tshirt" className="w-[22px] h-[22px]" color="#FFFFFF" />
              </span>
              <span className="text-[22px] font-extrabold">FitDraw</span>
            </div>
            <button type="button" onClick={() => setPickerOpen(true)}
              className="h-[52px] rounded-full t-surface2 pl-[6px] pr-5 flex items-center gap-3"
              aria-label="Choisir un vêtement">
              {selectorPill('w-10 h-10 rounded-full bg-[#E8EAFB]', 'text-[17px]', false)}
            </button>
            <div className="flex items-center justify-end gap-3 min-w-0">
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <UnitToggle unit={unit} onChange={changeUnit} size="lg" />
              <button type="button" onClick={() => setProOpen(true)}
                className="h-12 whitespace-nowrap rounded-full border-[1.5px] border-[#3B4CCA] t-card text-[#3B4CCA] text-[15px] font-bold px-6">
                Personnaliser
              </button>
            </div>
          </header>

          <div className="flex-1 flex min-h-0">
            <aside className="w-[420px] t-card border-r t-border p-7 flex flex-col gap-[10px] shrink-0 overflow-y-auto">
              <h2 className="text-[22px] font-extrabold">Mesures</h2>
              <FitSelectors garmentId={garmentId} size={size} coupe={coupe} onSize={applySize} onCoupe={setCoupe} />
              {rows('panel')}
              {tip}
            </aside>
            <main className="flex-1 p-7 min-w-0">
              <div className="h-full t-card rounded-[32px] shadow-[0_4px_24px_rgba(20,22,31,0.06)] p-6 flex flex-col">
                <div className="flex-1 min-h-0 flex items-center justify-center">
                  <div className="w-[min(660px,100%)] h-full flex items-center justify-center">{sketch}</div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setProOpen(true)}
                    className="h-14 rounded-full border-[1.5px] border-[#3B4CCA] t-card text-[#3B4CCA] px-6 text-[15px] font-bold">
                    Personnaliser l’export
                  </button>
                  <button type="button" onClick={doCopy}
                    className="h-14 rounded-full border-[1.5px] t-border-strong t-card px-[26px] text-[15px] font-bold flex items-center gap-2">
                    <CopyIcon className="w-5 h-5" />{copied ? 'Mesures copiées !' : 'Copier les mesures'}
                  </button>
                      <button type="button" onClick={doShare}
                    className="h-14 rounded-full border-[1.5px] t-border-strong t-card px-[26px] text-[15px] font-bold flex items-center gap-2">
                    <ShareIcon className="w-5 h-5" />Partager
                  </button>
                  <button type="button" onClick={doExport}
                    className="h-14 rounded-full bg-[#3B4CCA] text-white px-9 text-[16px] font-extrabold flex items-center gap-2">
                    <DownloadIcon className="w-5 h-5" />Exporter en PNG
                  </button>
                </div>
              </div>
            </main>
          </div>
        </div>
      )}

      <GarmentPicker
        open={pickerOpen}
        currentId={garmentId}
        usage={usage}
        mode={layout === 'mobile' ? 'sheet' : 'popover'}
        onClose={() => setPickerOpen(false)}
        onSelect={selectGarment}
      />

      {proOpen && (
        <div className="fixed inset-0 z-50 bg-[rgba(20,22,31,0.62)] backdrop-blur-sm flex items-center justify-center p-4 sm:p-6" onClick={() => setProOpen(false)}>
          <section ref={proDialogRef} role="dialog" aria-modal="true" aria-labelledby="branding-title"
            className="t-card rounded-[28px] p-6 sm:p-8 max-w-[480px] w-full max-h-[90dvh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-[#3B4CCA]">Personnalisation de l’export</p>
                <h2 id="branding-title" className="text-[23px] font-extrabold t-ink mt-1">Votre signature de boutique</h2>
              </div>
              <button type="button" onClick={() => setProOpen(false)} aria-label="Fermer"
                className="w-10 h-10 shrink-0 rounded-full t-surface t-ink text-xl">×</button>
            </div>
            <p className="text-[14px] t-sub mt-2 leading-relaxed">Ajoutez votre nom et votre logo aux PNG. Vos réglages et votre logo restent sur cet appareil ; aucun compte ni envoi de données.</p>

            <label className="block mt-6 text-[13px] font-bold t-ink" htmlFor="shop-name">Nom de boutique</label>
            <input id="shop-name" value={branding.shopName} maxLength={32} placeholder="Ex. Atelier Camille"
              onChange={(e) => setBranding((current) => ({ ...current, shopName: e.target.value }))}
              className="mt-2 w-full h-12 rounded-xl t-surface px-4 text-[15px] t-ink outline-none focus:ring-2 focus:ring-[#3B4CCA]" />

            <div className="mt-5 flex items-center gap-4">
              <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onLogoSelected} />
              {branding.logoDataUrl ? <img src={branding.logoDataUrl} alt="Aperçu du logo" className="w-14 h-14 object-contain rounded-xl t-surface p-1" />
                : <div className="w-14 h-14 rounded-xl t-surface flex items-center justify-center text-[#8C93A8]"><ImagePlus className="w-6 h-6" /></div>}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold t-ink">Logo de boutique</p>
                <p className="text-[12px] t-sub mt-1">PNG, JPG ou WebP · 1 Mo max. Redimensionné localement.</p>
              </div>
              <button type="button" onClick={() => logoInputRef.current?.click()} className="shrink-0 rounded-full bg-[#3B4CCA] text-white px-4 h-10 text-[13px] font-bold">Choisir</button>
            </div>
            {branding.logoDataUrl && <button type="button" onClick={() => setBranding((current) => ({ ...current, logoDataUrl: '' }))} className="mt-2 text-[12px] font-semibold text-[#B42318]">Retirer le logo</button>}

            <label className="mt-6 flex items-start gap-3 rounded-2xl t-surface p-4 cursor-pointer">
              <input type="checkbox" checked={branding.showWatermark} onChange={(e) => setBranding((current) => ({ ...current, showWatermark: e.target.checked }))} className="mt-1 h-4 w-4 accent-[#3B4CCA]" />
              <span><span className="block text-[14px] font-bold t-ink">Filigrane FitDraw</span><span className="block text-[12px] t-sub mt-1">Visible uniquement dans le croquis exporté, jamais dans vos données.</span></span>
            </label>

            <div className="mt-6 flex items-center gap-3">
              <button type="button" onClick={resetBranding} className="h-11 px-4 rounded-full t-surface t-ink text-[13px] font-bold flex items-center gap-2"><Trash2 className="w-4 h-4" />Réinitialiser</button>
              <button type="button" onClick={() => setProOpen(false)} className="flex-1 h-11 rounded-full bg-[#3B4CCA] text-white text-[14px] font-extrabold flex items-center justify-center gap-2"><ShieldCheck className="w-4 h-4" />Terminé</button>
            </div>
          </section>
        </div>
      )}

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-[110px] z-50 bg-[#14161F] dark:bg-[#E8EAFB] text-white dark:text-[#14161F] text-[13px] font-semibold rounded-full px-5 py-3 shadow-lg max-w-[calc(100vw-40px)] text-center">
          {toast}
        </div>
      )}
    </div>
  )
}
