import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { GARMENTS, CATEGORIES, type Category } from '../lib/garments'
import GarmentIcon from './GarmentIcon'

interface Props {
  open: boolean
  currentId: string
  usage: Record<string, number>
  mode: 'sheet' | 'popover'
  onClose: () => void
  onSelect: (id: string) => void}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default function GarmentPicker({ open, currentId, usage, mode, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState<Category | 'tous'>('tous')
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || !panelRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const tween = gsap.fromTo(panelRef.current, { opacity: 0, y: mode === 'sheet' ? 28 : 12 }, { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' })
    return () => { tween.kill() }
  }, [open, mode])

  const sorted = useMemo(() => {
    return [...GARMENTS].sort((a, b) => (usage[b.id] ?? 0) - (usage[a.id] ?? 0))
  }, [usage])

  const visible = useMemo(() => {
    const q = norm(query.trim())
    return sorted.filter((g) => {
      if (cat !== 'tous' && g.category !== cat) return false
      if (q && !norm(g.name).includes(q)) return false
      return true
    })
  }, [sorted, cat, query])

  const catsWithResults = useMemo(() => {
    const q = norm(query.trim())
    return CATEGORIES.filter((c) => {
      if (c.id === 'tous') return true
      return GARMENTS.some((g) => g.category === c.id && (!q || norm(g.name).includes(q)))
    })
  }, [query])

  if (!open) return null

  const grid = (
    <>
      <div className="relative mt-3">
        <svg viewBox="0 0 24 24" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" fill="none"
          stroke="#6B7080" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher : jean, chemise, manteau…"
          aria-label="Rechercher un vêtement"
          className="w-full h-12 rounded-2xl t-surface pl-11 pr-4 text-[16px] font-semibold t-ink placeholder:text-[#6B7080] outline-none border-none"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto mt-3 pb-1 -mx-1 px-1" role="tablist" aria-label="Catégories">
        {catsWithResults.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCat(c.id)}
            className={`h-[38px] shrink-0 rounded-full px-4 text-[14px] font-bold ${
              cat === c.id ? 'bg-[#14161F] dark:bg-[#E8EAFB] text-white dark:text-[#14161F]' : 't-surface t-ink'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-[10px] mt-3 overflow-y-auto">
        {visible.map((g) => {
          const sel = g.id === currentId
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => onSelect(g.id)}
              className={`h-[104px] rounded-[18px] flex flex-col items-center justify-center gap-1 ${
                sel ? 'bg-[#E8EAFB] border-2 border-[#3B4CCA]' : 't-surface border-2 border-transparent'
              }`}
            >
              <GarmentIcon id={g.id} className="w-[46px] h-[46px]" color={sel ? '#3B4CCA' : '#8C93A8'} />
              <span className={`text-[13px] font-bold leading-tight text-center px-1 ${sel ? 'text-[#3B4CCA]' : 't-ink'}`}>
                {g.name}
              </span>
            </button>
          )
        })}
        {visible.length === 0 && (
          <p className="col-span-3 text-center text-[14px] t-sub py-6">Aucun vêtement trouvé</p>
        )}
      </div>
      <p className="text-center text-[13px] font-semibold t-sub mt-3">Les plus utilisés en premier</p>
    </>
  )

  if (mode === 'popover') {
    return (
      <div className="fixed inset-0 z-50" onClick={onClose}>
        <div ref={panelRef}
          className="absolute left-1/2 -translate-x-1/2 top-[84px] w-[min(560px,calc(100vw-48px))] max-h-[calc(100vh-120px)] overflow-y-auto t-card rounded-[28px] shadow-[0_8px_40px_rgba(20,22,31,0.18)] p-5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-[19px] font-extrabold t-ink">Choisir un vêtement</h2>
            <button type="button" onClick={onClose} aria-label="Fermer"
              className="w-9 h-9 rounded-full t-surface flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#14161F" strokeWidth={2.5} strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          {grid}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(20,22,31,0.5)]" onClick={onClose}>
      <div ref={panelRef}
        className="absolute bottom-0 left-0 right-0 t-card rounded-t-[28px] px-5 pt-[10px] pb-6 max-h-[85vh] overflow-y-auto"
        style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-[5px] rounded-full bg-[#D5D8E2] mx-auto" />
        <div className="flex items-center justify-between mt-3">
          <h2 className="text-[19px] font-extrabold t-ink">Choisir un vêtement</h2>
          <button type="button" onClick={onClose} aria-label="Fermer"
            className="w-9 h-9 rounded-full t-surface flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#14161F" strokeWidth={2.5} strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        {grid}
      </div>
    </div>
  )
}
