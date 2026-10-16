import { COUPES, SIZES, hasCoupe, type Coupe, type Size } from '../garments'

interface Props {
  size: Size | null
  coupe: Coupe
  garmentId: string
  onSize: (s: Size | null) => void
  onCoupe: (c: Coupe) => void
}

function Chip({
  active,
  children,
  onClick,
  label,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`h-[36px] min-w-[46px] rounded-[18px] px-[13px] text-[13px] font-bold transition-colors ${
        active ? 'bg-[#3B4CCA] text-white' : 't-surface2 t-ink hover:opacity-80'
      }`}
    >
      {children}
    </button>
  )
}

/** Choix de la taille (pré-remplit les mesures) et de la coupe (pantalon / short seulement). */
export default function FitSelectors({ size, coupe, garmentId, onSize, onCoupe }: Props) {
  return (
    <div className="flex flex-col gap-[10px]">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] t-sub">Taille</span>
        {size ? (
          <button
            type="button"
            onClick={() => onSize(null)}
            className="text-[11.5px] font-semibold t-sub underline decoration-dotted"
          >
            effacer
          </button>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-[6px]">
        {SIZES.map((s) => (
          <Chip key={s} active={size === s} label={`Taille ${s}`} onClick={() => onSize(s)}>
            {s}
          </Chip>
        ))}
      </div>

      {hasCoupe(garmentId) ? (
        <>
          <span className="mt-[4px] text-[11px] font-bold uppercase tracking-[0.08em] t-sub">Coupe</span>
          <div className="flex flex-wrap gap-[6px]">
            {COUPES.map((c) => (
              <Chip key={c.id} active={coupe === c.id} label={`Coupe ${c.label}`} onClick={() => onCoupe(c.id)}>
                {c.label}
              </Chip>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
