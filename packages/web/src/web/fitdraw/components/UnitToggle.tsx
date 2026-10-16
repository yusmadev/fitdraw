import type { Unit } from '../renderSketch'

interface Props {
  unit: Unit
  onChange: (u: Unit) => void
  size?: 'sm' | 'lg'
}

export default function UnitToggle({ unit, onChange, size = 'sm' }: Props) {
  const h = size === 'sm' ? 'h-[34px]' : 'h-[38px]'
  const txt = size === 'sm' ? 'text-[13px]' : 'text-[14px]'
  return (
    // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- role="group" est le rôle ARIA correct pour un segmented control
    <div className="flex rounded-full t-surface p-[3px]" role="group" aria-label="Unité de mesure">
      {(['cm', 'po'] as Unit[]).map((u) => (
        <button
          key={u}
          type="button"
          onClick={() => onChange(u)}
          aria-pressed={unit === u}
          className={`${h} ${txt} rounded-full px-[14px] font-bold transition-colors ${
            unit === u ? 'bg-[#14161F] dark:bg-[#E8EAFB] text-white dark:text-[#14161F]' : 't-ink'
          }`}
        >
          {u}
        </button>
      ))}
    </div>
  )
}
