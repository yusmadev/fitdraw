import { useEffect, useState } from 'react'
import type { MeasureDef } from '../garments'
import { formatValue, unitLabel, type Unit } from '../renderSketch'
import type { SoftWarning } from '../rules'

interface Props {
  measure: MeasureDef
  value: number | undefined
  unit: Unit
  warning?: SoftWarning
  onValue: (v: number | undefined) => void
  onFocusKey: (key: string | null) => void
}

/** Une ligne de mesure : libellé + aide + champ numérique, avec alerte douce éventuelle. */
export default function MeasureRow({ measure, value, unit, warning, onValue, onFocusKey }: Props) {
  const [text, setText] = useState('')
  const [focused, setFocused] = useState(false)

  // Le champ affiche la valeur dans l'unité courante ; on ne réécrit pas pendant la frappe.
  useEffect(() => {
    if (!focused) setText(value && value > 0 ? formatValue(value, unit) : '')
  }, [value, unit, focused])

  const commit = (raw: string) => {
    const cleaned = raw.replace(',', '.').trim()
    if (cleaned === '') return onValue(undefined)
    const n = Number(cleaned)
    if (!Number.isFinite(n) || n <= 0) return onValue(undefined)
    onValue(unit === 'cm' ? n : n * 2.54)
  }

  return (
    <div
      className={`rounded-[16px] t-card t-hairline px-[14px] py-[12px] transition-colors ${
        warning ? 'border-[#E8C9C7] dark:border-[#5A3436]' : ''
      }`}
    >
      <div className="flex items-center gap-[10px]">
        <label className="min-w-0 flex-1" htmlFor={`m-${measure.key}`}>
          <span className="block truncate text-[14px] font-semibold t-ink">{measure.label}</span>
          <span className="mt-[2px] block text-[11.5px] font-medium t-sub">{measure.help}</span>
        </label>
        <div className="flex shrink-0 items-center gap-[6px]">
          <input
            id={`m-${measure.key}`}
            type="text"
            inputMode="decimal"
            value={text}
            placeholder="—"
            aria-label={`${measure.label} en ${unitLabel(unit)}`}
            onChange={(e) => {
              setText(e.target.value)
              commit(e.target.value)
            }}
            onFocus={() => {
              setFocused(true)
              onFocusKey(measure.key)
            }}
            onBlur={(e) => {
              setFocused(false)
              commit(e.target.value)
              onFocusKey(null)
            }}
            className="h-[42px] w-[74px] rounded-[12px] t-surface2 px-[10px] text-right text-[15px] font-bold tabular-nums t-ink outline-none transition-shadow focus:ring-2 focus:ring-[#3B4CCA]/45"
          />
          <span className="w-[18px] text-[12px] font-semibold t-sub">{unitLabel(unit)}</span>
        </div>
      </div>
      {warning ? (
        <p className="mt-[8px] flex items-start gap-[6px] text-[11.5px] font-semibold text-[#B4483F] dark:text-[#F2777A]">
          <span aria-hidden="true">!</span>
          <span>{warning.text}</span>
        </p>
      ) : null}
    </div>
  )
}
