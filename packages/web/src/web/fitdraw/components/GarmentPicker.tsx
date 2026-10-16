import { useMemo, useState } from 'react'
import { CATEGORIES, GARMENTS, type Category } from '../garments'
import type { UsageEntry } from '../store'
import { normalize } from '../rules'

interface Props {
  currentId: string
  usage: UsageEntry[]
  onPick: (id: string) => void
  /** Rendu compact (aside desktop) ou pleine largeur (bottom sheet mobile). */
  compact?: boolean
}

/** Sélecteur de vêtement : recherche sans accents, filtre par catégorie, tri par usage décroissant. */
export default function GarmentPicker({ currentId, usage, onPick, compact = false }: Props) {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState<Category | 'tous'>('tous')

  const list = useMemo(() => {
    const q = normalize(query)
    const count = (id: string) => usage.find((u) => u.garmentId === id)?.count ?? 0
    return GARMENTS.filter((g) => (cat === 'tous' ? true : g.category === cat))
      .filter((g) => (q ? normalize(g.name).includes(q) : true))
      .sort((a, b) => count(b.id) - count(a.id) || a.name.localeCompare(b.name, 'fr'))
  }, [query, cat, usage])

  return (
    <div className="flex min-h-0 flex-col gap-[10px]">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher un vêtement"
        aria-label="Rechercher un vêtement"
        className="h-[42px] w-full rounded-[14px] t-surface2 px-[14px] text-[14px] font-medium t-ink outline-none placeholder:t-sub focus:ring-2 focus:ring-[#3B4CCA]/45"
      />

      <div className="flex flex-wrap gap-[6px]">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={cat === c.id}
            onClick={() => setCat(c.id)}
            className={`h-[30px] rounded-full px-[12px] text-[12px] font-bold transition-colors ${
              cat === c.id ? 'bg-[#E8EAFB] text-[#3B4CCA] dark:bg-[#232847] dark:text-[#A8B2FF]' : 't-surface2 t-sub'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className={`flex min-h-0 flex-col gap-[4px] overflow-y-auto ${compact ? 'max-h-[320px]' : 'flex-1'}`}>
        {list.map((g) => {
          const active = g.id === currentId
          return (
            <button
              key={g.id}
              type="button"
              aria-current={active}
              onClick={() => onPick(g.id)}
              className={`flex items-center justify-between rounded-[14px] px-[13px] py-[11px] text-left transition-colors ${
                active ? 'bg-[#E8EAFB] dark:bg-[#232847]' : 'hover:t-surface2'
              }`}
            >
              <span className={`text-[14px] font-semibold ${active ? 'text-[#3B4CCA] dark:text-[#A8B2FF]' : 't-ink'}`}>
                {g.name}
              </span>
              <span className="text-[11px] font-semibold t-sub">{g.measures.length} mesures</span>
            </button>
          )
        })}
        {list.length === 0 ? <p className="px-[13px] py-[11px] text-[13px] t-sub">Aucun vêtement ne correspond.</p> : null}
      </div>
    </div>
  )
}
