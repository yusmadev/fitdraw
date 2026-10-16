import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown } from '../fitdraw/components/Icons'
import AppHeader from '../fitdraw/components/AppHeader'
import AccountPanel from '../fitdraw/components/AccountPanel'
import BrandingPanel from '../fitdraw/components/BrandingPanel'
import FitSelectors from '../fitdraw/components/FitSelectors'
import GarmentPicker from '../fitdraw/components/GarmentPicker'
import MeasureRow from '../fitdraw/components/MeasureRow'
import Sheet from '../fitdraw/components/Sheet'
import SketchSvg from '../fitdraw/components/Sketch'
import { ActionBar, Toast, useExportActions } from '../fitdraw/components/ExportActions'
import { softWarnings } from '../fitdraw/rules'
import { useFitDraw, type FitDrawState } from '../fitdraw/useFitDraw'
import { useSyncBridge } from '../queries/fitdraw'

export type StudioSheet = 'branding' | 'account' | 'garment' | null

interface StageProps {
  fd: FitDrawState
  className?: string
}

function Stage({ fd, className = '' }: StageProps) {
  return (
    <section className={`flex items-center justify-center overflow-hidden rounded-[28px] t-canvas t-hairline p-[16px] ${className}`}>
      <SketchSvg
        garment={fd.garment}
        values={fd.values}
        unit={fd.unit}
        activeKey={fd.activeKey}
        coupe={fd.coupe}
        className="t-sketch-in h-full w-full"
      />
    </section>
  )
}

function GarmentButton({ fd, onOpen, full = false }: { fd: FitDrawState; onOpen: () => void; full?: boolean }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Changer de vêtement — actuellement ${fd.garment.name}`}
      className={`flex items-center justify-between gap-[12px] rounded-[16px] t-card t-hairline px-[14px] py-[13px] text-left transition-colors hover:t-surface2 ${
        full ? 'w-full' : ''
      }`}
    >
      <span className="flex min-w-0 flex-col">
        <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] t-sub">Vêtement</span>
        <span className="truncate text-[15px] font-bold t-ink">{fd.garment.name}</span>
      </span>
      <span className="flex shrink-0 items-center gap-[8px]">
        <span className="text-[11.5px] font-semibold t-sub">
          {fd.filled}/{fd.garment.measures.length}
        </span>
        <ChevronDown className="h-[16px] w-[16px] t-sub" />
      </span>
    </button>
  )
}

function MeasureList({ fd }: { fd: FitDrawState }) {
  const warnings = useMemo(() => softWarnings(fd.garment, fd.values), [fd.garment, fd.values])
  const byKey = useMemo(() => new Map(warnings.map((w) => [w.key, w])), [warnings])

  return (
    <div className="flex flex-col gap-[8px]">
      {fd.garment.measures.map((m) => (
        <MeasureRow
          key={m.key}
          measure={m}
          value={fd.values[m.key]}
          unit={fd.unit}
          warning={byKey.get(m.key)}
          onValue={(v) => fd.setValue(m.key, v)}
          onFocusKey={fd.setActiveKey}
        />
      ))}
    </div>
  )
}

function SecondaryActions({ fd, onBranding }: { fd: FitDrawState; onBranding: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-[8px]">
      <button
        type="button"
        onClick={onBranding}
        className="h-[42px] rounded-full t-surface px-[16px] text-[13px] font-bold t-ink"
      >
        Personnaliser l'export
      </button>
      <button
        type="button"
        onClick={fd.clearValues}
        className="h-[42px] rounded-full px-[16px] text-[13px] font-bold t-sub hover:t-ink"
      >
        Effacer les mesures
      </button>
    </div>
  )
}

export default function Studio({ initialSheet = null }: { initialSheet?: StudioSheet }) {
  const sync = useSyncBridge()
  const fd = useFitDraw({
    onDraftChange: sync.pushDraft,
    onBrandingChange: sync.pushBranding,
    onGarmentChange: sync.bump,
  })

  const [sheet, setSheet] = useState<StudioSheet>(initialSheet)
  const mergeRef = useRef(fd.mergeRemote)
  mergeRef.current = fd.mergeRemote

  // À la connexion : on tire l'état distant et on le fusionne, une fois.
  const signedIn = sync.signedIn
  const pull = sync.pull
  useEffect(() => {
    if (!signedIn) return
    void pull((remote) => mergeRef.current(remote))
  }, [signedIn, pull])

  const actions = useExportActions({
    garment: fd.garment,
    values: fd.values,
    unit: fd.unit,
    coupe: fd.coupe,
    size: fd.size,
    coupeId: fd.coupeId,
    branding: fd.branding,
    title: fd.title,
  })

  const isMobile = fd.layout === 'mobile'
  const picker = (
    <GarmentPicker
      currentId={fd.garmentId}
      usage={fd.usage}
      compact={!isMobile}
      onPick={(id) => {
        fd.setGarmentId(id)
        setSheet(null)
      }}
    />
  )

  const panelBody = (
    <div className="flex flex-col gap-[16px]">
      {isMobile ? null : <GarmentButton fd={fd} onOpen={() => setSheet('garment')} full />}
      <FitSelectors
        size={fd.size}
        coupe={fd.coupeId}
        garmentId={fd.garmentId}
        onSize={fd.setSize}
        onCoupe={fd.setCoupe}
      />
      <MeasureList fd={fd} />
      <SecondaryActions fd={fd} onBranding={() => setSheet('branding')} />
    </div>
  )

  const header = (
    <AppHeader
      unit={fd.unit}
      onUnit={fd.setUnit}
      theme={fd.theme}
      onToggleTheme={fd.toggleTheme}
      onBranding={() => setSheet('branding')}
      onAccount={() => setSheet('account')}
      compact={isMobile}
    />
  )

  return (
    <div className="min-h-screen t-bg">
      {header}

      {fd.layout === 'mobile' ? (
        <main className="mx-auto flex w-full max-w-[720px] flex-col gap-[14px] px-[16px] pb-[32px] pt-[14px]">
          <GarmentButton fd={fd} onOpen={() => setSheet('garment')} full />
          <Stage fd={fd} className="aspect-square" />
          <ActionBar compact onCopy={actions.copy} onShare={actions.share} onExport={actions.exportPng} busy={actions.busy} />
          {panelBody}
        </main>
      ) : fd.layout === 'tablet' ? (
        <main className="mx-auto grid w-full max-w-[1360px] grid-cols-[minmax(0,1fr)_380px] items-start gap-[18px] px-[20px] py-[18px]">
          <div className="flex flex-col gap-[14px]">
            <Stage fd={fd} className="aspect-square" />
            <ActionBar onCopy={actions.copy} onShare={actions.share} onExport={actions.exportPng} busy={actions.busy} />
          </div>
          <aside className="rounded-[28px] t-card t-hairline p-[18px]">{panelBody}</aside>
        </main>
      ) : (
        <main className="mx-auto grid w-full max-w-[1440px] grid-cols-[420px_minmax(0,1fr)] items-start gap-[22px] px-[24px] py-[22px]">
          <aside className="rounded-[28px] t-card t-hairline p-[20px]">{panelBody}</aside>
          <div className="flex flex-col gap-[16px]">
            <Stage fd={fd} className="min-h-[520px]" />
            <ActionBar onCopy={actions.copy} onShare={actions.share} onExport={actions.exportPng} busy={actions.busy} />
          </div>
        </main>
      )}

      <Sheet
        open={sheet === 'garment'}
        title="Choisir un vêtement"
        onClose={() => setSheet(null)}
        variant={isMobile ? 'sheet' : 'dialog'}
      >
        {picker}
      </Sheet>

      <Sheet
        open={sheet === 'branding'}
        title="Personnaliser l'export"
        onClose={() => setSheet(null)}
        variant={isMobile ? 'sheet' : 'dialog'}
      >
        <BrandingPanel branding={fd.branding} onChange={fd.setBranding} />
      </Sheet>

      <Sheet
        open={sheet === 'account'}
        title="Compte"
        onClose={() => setSheet(null)}
        variant={isMobile ? 'sheet' : 'dialog'}
      >
        <AccountPanel localCount={fd.allDrafts.filter((d) => Object.keys(d.values).length > 0).length} syncState={sync.state} />
      </Sheet>

      <Toast message={actions.toast} />
    </div>
  )
}
