import { useCallback, useState } from 'react'
import { CopyIcon, DownloadIcon, ShareIcon } from './Icons'
import { exportPngBlob, type ExportBranding } from '../exportPng'
import { copyText, stripAccents } from '../rules'
import type { GarmentDef } from '../garments'
import type { MeasureValues } from '../shapes'
import type { Unit } from '../renderSketch'

export interface ExportArgs {
  garment: GarmentDef
  values: MeasureValues
  unit: Unit
  coupe: number
  size: string | null
  coupeId: string
  branding: ExportBranding
  title: string
}

const slug = (s: string) =>
  stripAccents(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'fitdraw'

async function blobToFile(blob: Blob, name: string) {
  return new File([blob], name, { type: 'image/png' })
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

/** Copier · Partager · Exporter — mêmes trois actions que l'app d'origine. */
export function useExportActions(args: ExportArgs) {
  const [toast, setToast] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const flash = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 2600)
  }, [])

  const makeBlob = useCallback(
    () => exportPngBlob(args.garment, args.values, args.unit, args.branding, args.title, args.coupe),
    [args.garment, args.values, args.unit, args.branding, args.title, args.coupe],
  )

  const fileName = useCallback(
    () => `fitdraw-${slug(args.title)}.png`,
    [args.title],
  )

  const copy = useCallback(async () => {
    const text = copyText(args.garment, args.values, args.unit, args.size, args.coupeId === 'droit' ? null : args.coupeId)
    try {
      await navigator.clipboard.writeText(text)
      flash('Mesures copiées')
    } catch {
      flash('Copie refusée par le navigateur')
    }
  }, [args.garment, args.values, args.unit, args.size, args.coupeId, flash])

  const share = useCallback(async () => {
    setBusy(true)
    try {
      const blob = await makeBlob()
      const file = await blobToFile(blob, fileName())
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
      if (nav.share && nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], title: args.title })
      } else if (nav.share) {
        await nav.share({ title: args.title, text: args.title })
      } else {
        download(blob, fileName())
        flash('PNG téléchargé')
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') flash('Partage impossible')
    } finally {
      setBusy(false)
    }
  }, [makeBlob, fileName, args.title, flash])

  const exportPng = useCallback(async () => {
    setBusy(true)
    try {
      const blob = await makeBlob()
      download(blob, fileName())
      flash('PNG 1600 × 1600 exporté')
    } catch {
      flash('Export impossible')
    } finally {
      setBusy(false)
    }
  }, [makeBlob, fileName, flash])

  return { copy, share, exportPng, toast, busy }
}

interface BarProps {
  onCopy: () => void
  onShare: () => void
  onExport: () => void
  busy?: boolean
  compact?: boolean
}

const base =
  'inline-flex flex-1 items-center justify-center gap-[8px] rounded-full font-bold transition-colors disabled:opacity-60'

/** Barre d'actions : Copier / Partager / Exporter. */
export function ActionBar({ onCopy, onShare, onExport, busy, compact = false }: BarProps) {
  const h = compact ? 'h-[46px]' : 'h-[52px]'
  return (
    <div className="flex w-full items-center gap-[8px]">
      <button type="button" onClick={onCopy} className={`${base} ${h} t-surface t-ink text-[13.5px]`}>
        <CopyIcon className="h-[17px] w-[17px]" />
        Copier
      </button>
      <button type="button" onClick={onShare} disabled={busy} className={`${base} ${h} t-surface t-ink text-[13.5px]`}>
        <ShareIcon className="h-[17px] w-[17px]" />
        Partager
      </button>
      <button
        type="button"
        onClick={onExport}
        disabled={busy}
        className={`${base} ${h} bg-[#3B4CCA] text-[13.5px] text-white hover:bg-[#3341b0]`}
      >
        <DownloadIcon className="h-[17px] w-[17px]" />
        Exporter
      </button>
    </div>
  )
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <output className="pointer-events-none fixed bottom-[24px] left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#14161F] px-[18px] py-[10px] text-[13px] font-semibold text-white shadow-lg dark:bg-[#E8EAFB] dark:text-[#14161F]">
      {message}
    </output>
  )
}
