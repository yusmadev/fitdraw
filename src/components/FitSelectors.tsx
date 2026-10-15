import { SIZES, COUPES, hasCoupe, type Size, type Coupe } from '../lib/garments'

interface Props {
  garmentId: string
  size: Size | null
  coupe: Coupe
  onSize: (s: Size) => void
  onCoupe: (c: Coupe) => void
  compact?: boolean
}

export default function FitSelectors({ garmentId, size, coupe, onSize, onCoupe, compact = false }: Props) {
  if (compact) {
    // une seule rangée à défilement horizontal pour préserver la hauteur mobile
    return (
      <div className="flex items-center gap-1 overflow-x-auto pb-1" role="group" aria-label="Taille et coupe">
        <span className="text-[11px] font-semibold t-sub shrink-0 pr-1">Taille</span>
        {SIZES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSize(s)}
            aria-pressed={size === s}
            className={`h-8 min-w-[36px] shrink-0 rounded-full px-2 text-[12px] font-bold transition-colors ${
              size === s ? 'bg-[#14161F] dark:bg-[#E8EAFB] text-white dark:text-[#14161F]' : 't-surface t-ink'
            }`}
          >
            {s}
          </button>
        ))}
        {hasCoupe(garmentId) && (
          <>
            <span className="text-[11px] font-semibold t-sub shrink-0 pl-2 pr-1">Coupe</span>
            {COUPES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onCoupe(c.id)}
                aria-pressed={coupe === c.id}
                className={`h-8 shrink-0 rounded-full px-3 text-[12px] font-bold transition-colors ${
                  coupe === c.id ? 'bg-[#3B4CCA] text-white' : 't-surface t-ink'
                }`}
              >
                {c.label}
              </button>
            ))}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div>
        <p className="text-[12px] font-semibold t-sub mb-1">Taille (pré-remplit les mesures, modifiables)</p>
        <div className="flex gap-1 flex-wrap" role="group" aria-label="Taille du vêtement">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSize(s)}
              aria-pressed={size === s}
              className={`h-9 min-w-[44px] rounded-full px-3 text-[13px] font-bold transition-colors ${
                size === s ? 'bg-[#14161F] dark:bg-[#E8EAFB] text-white dark:text-[#14161F]' : 't-surface t-ink'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      {hasCoupe(garmentId) && (
        <div>
          <p className="text-[12px] font-semibold t-sub mb-1">Coupe</p>
          <div className="flex gap-1" role="group" aria-label="Coupe du vêtement">
            {COUPES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onCoupe(c.id)}
                aria-pressed={coupe === c.id}
                className={`h-9 flex-1 rounded-full px-3 text-[13px] font-bold transition-colors ${
                  coupe === c.id ? 'bg-[#3B4CCA] text-white' : 't-surface t-ink'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
