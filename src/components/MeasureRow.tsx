import { useEffect, useRef, useState } from 'react'
import type { MeasureDef } from '../lib/garments'
import { formatValue, type Unit } from '../lib/renderSketch'

interface Props {
  measure: MeasureDef
  value: number | undefined // cm
  unit: Unit
  active: boolean
  variant: 'mobile' | 'panel'
  onActivate: () => void
  onChange: (cm: number | undefined) => void
}

const parseNum = (s: string): number | undefined => {
  // tolère "52,5" comme "52.5", ignore tout ce qui n'est pas un nombre
  const cleaned = s.replace(/[^0-9.,-]/g, '').replace(',', '.')
  const v = parseFloat(cleaned)
  return Number.isFinite(v) && v > 0 ? v : undefined
}

export default function MeasureRow({ measure, value, unit, active, variant, onActivate, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Pendant la frappe on garde le texte brut du champ (sinon la valeur contrôlée
  // reformate/flotte la saisie : la virgule de « 52, » est avalée, « 52,5 » devient 525).
  // null = pas en cours d'édition → afficher la valeur formatée.
  const [text, setText] = useState<string | null>(null)
  // true entre le commit local et l'écho du parent (onChange → prop value) : évite
  // de réinitialiser le texte à la valeur précédente pendant notre propre frappe.
  const [selfCommitted, setSelfCommitted] = useState(false)
  const [prevValue, setPrevValue] = useState(value)

  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [active])

  // Changement externe (taille pré-remplie, changement d'unité) → abandonner
  // l'édition locale, pendant le rendu (motif officiel "adjust state on prop
  // change") pour éviter tout rendu à l'ancienne valeur.
  if (value !== prevValue) {
    setPrevValue(value)
    if (!selfCommitted) setText(null)
    setSelfCommitted(false)
  }

  const toDisplay = (cm: number) => (unit === 'cm' ? formatValue(cm, 'cm') : (cm / 2.54).toFixed(1).replace('.', ','))

  const commit = (raw: string) => {
    const v = parseNum(raw)
    setSelfCommitted(true)
    onChange(unit === 'cm' ? v : v !== undefined ? v * 2.54 : undefined)
  }

  const handleText = (s: string) => {
    setText(s)
    commit(s)
  }

  const step = (dir: 1 | -1) => {
    const base = value !== undefined && value > 0 ? value : measure.def
    let next: number
    if (unit === 'cm') next = Math.round((base + dir * 0.5) * 2) / 2
    else next = Math.round(((base / 2.54) + dir * 0.5) * 2) / 2 * 2.54
    if (next <= 0) return
    setText(null)
    setSelfCommitted(false)
    onChange(next)
    inputRef.current?.focus()
  }

  const m = variant === 'mobile'
  const rowCls = active
    ? 'bg-[#E8EAFB] border-2 border-[#3B4CCA]'
    : 't-card border t-border'
  const boxCls = m
    ? `min-h-[62px] rounded-2xl px-4 py-2 pl-4 pr-[6px]`
    : `min-h-[72px] rounded-[20px] py-[10px] pl-5 pr-[9px]`
  const labelCls = m
    ? `flex-1 pr-2 text-[14px] leading-[1.25] ${active ? 'font-bold text-[#3B4CCA]' : 'font-semibold t-ink'}`
    : `flex-1 pr-2 text-[16px] leading-[1.25] ${active ? 'font-bold text-[#3B4CCA]' : 'font-bold t-ink'}`
  const btnCls = m
    ? `w-[46px] h-[46px] rounded-xl text-[20px] font-semibold ${active ? 't-card' : 't-surface'} t-ink`
    : `w-[54px] h-[54px] rounded-2xl text-[24px] font-semibold ${active ? 't-card' : 't-surface2'} t-ink`
  const inputCls = m
    ? `w-[52px] h-[46px] text-center text-[17px] ${active ? 'font-extrabold' : 'font-bold'}`
    : `w-[58px] h-[54px] text-center text-[22px] font-extrabold`
  const display = text !== null ? text : value !== undefined && value > 0 ? toDisplay(value) : ''

  return (
    <div ref={ref}>
      <div className={`flex items-center justify-between box-border ${boxCls} ${rowCls}`}>
        <label htmlFor={`m-${measure.key}`} className={labelCls}>{measure.label}</label>
        <div className="flex items-center gap-1 shrink-0">
          <button type="button" aria-label={`Diminuer ${measure.label}`} onClick={() => step(-1)} className={btnCls}>−</button>
          <input
            ref={inputRef}
            id={`m-${measure.key}`}
            inputMode="decimal"
            placeholder="—"
            value={display}
            onFocus={onActivate}
            onChange={(e) => handleText(e.target.value)}
            onBlur={() => setText(null)}
            className={`${inputCls} bg-transparent border-none outline-none ${
              // ligne active = fond lavande clair constant (même en dark) → texte
              // encre foncée fixe, sinon le t-ink blanc de fin dark devient
              // illisible sur ce fond.
              active ? 'text-[#14161F] placeholder:text-[#9BA1B5]' : 't-ink placeholder:text-[#B5BACB]'
            }`}
          />
          <button type="button" aria-label={`Augmenter ${measure.label}`} onClick={() => step(1)} className={btnCls}>+</button>
        </div>
      </div>
      {active && (
        <p className={`text-[#3B4CCA] ${m ? 'text-[12px] mt-1 px-1' : 'text-[13px] font-semibold mt-1 px-1'}`}>
          {measure.help}
        </p>
      )}
    </div>
  )
}
