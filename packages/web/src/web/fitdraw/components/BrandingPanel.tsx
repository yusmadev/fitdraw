import { useRef, useState } from 'react'
import { prepareLogo } from '../rules'
import type { Branding } from '../store'
import { CloseIcon } from './Icons'

interface Props {
  branding: Branding
  onChange: (b: Branding) => void
}

/** Nom de boutique, logo et filigrane de l'export. */
export default function BrandingPanel({ branding, onChange }: Props) {
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const pick = async (file: File | undefined) => {
    if (!file) return
    const res = await prepareLogo(file)
    if (!res.ok || !res.dataUrl) {
      setError(res.error ?? 'Logo refusé.')
      return
    }
    setError(null)
    onChange({ ...branding, logoDataUrl: res.dataUrl })
  }

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex flex-col gap-[8px]">
        <label htmlFor="shop-name" className="text-[11px] font-bold uppercase tracking-[0.08em] t-sub">
          Nom de la boutique
        </label>
        <input
          id="shop-name"
          aria-label="Nom de la boutique"
          type="text"
          maxLength={32}
          value={branding.shopName}
          onChange={(e) => onChange({ ...branding, shopName: e.target.value })}
          placeholder="FitDraw"
          className="h-[46px] w-full rounded-[14px] t-surface2 px-[14px] text-[15px] font-semibold t-ink outline-none placeholder:t-sub focus:ring-2 focus:ring-[#3B4CCA]/45"
        />
        <p className="text-[11.5px] font-medium t-sub">Apparaît en bas à droite de l'export. 32 caractères max.</p>
      </div>

      <div className="flex flex-col gap-[8px]">
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] t-sub">Logo</span>
        <div className="flex items-center gap-[12px]">
          <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center overflow-hidden rounded-[16px] t-surface2">
            {branding.logoDataUrl ? (
              <img src={branding.logoDataUrl} alt="Logo de la boutique" className="h-full w-full object-contain" />
            ) : (
              <span className="text-[11px] font-semibold t-sub">vide</span>
            )}
          </div>
          <div className="flex flex-1 flex-wrap gap-[8px]">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="h-[40px] rounded-full t-surface px-[16px] text-[13px] font-bold t-ink"
            >
              Choisir un fichier
            </button>
            {branding.logoDataUrl ? (
              <button
                type="button"
                onClick={() => onChange({ ...branding, logoDataUrl: '' })}
                className="inline-flex h-[40px] items-center gap-[6px] rounded-full t-surface px-[14px] text-[13px] font-bold t-sub"
              >
                <CloseIcon className="h-[14px] w-[14px]" />
                Retirer
              </button>
            ) : null}
          </div>
        </div>
        <input
          ref={fileRef}
          aria-label="Choisir un logo de boutique"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            void pick(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        <p className="text-[11.5px] font-medium t-sub">PNG, JPG ou WebP · 1 Mo max · redimensionné à 256 px.</p>
        {error ? <p className="text-[11.5px] font-semibold text-[#B4483F] dark:text-[#F2777A]">{error}</p> : null}
      </div>

      <label
        htmlFor="shop-watermark"
        className="flex cursor-pointer items-center justify-between gap-[12px] rounded-[16px] t-surface2 px-[14px] py-[13px]"
      >
        <span className="flex flex-col">
          <span className="text-[14px] font-semibold t-ink">Filigrane FitDraw</span>
          <span className="text-[11.5px] font-medium t-sub">Motif incliné sur le croquis exporté.</span>
        </span>
        <input
          id="shop-watermark"
          aria-label="Filigrane FitDraw sur l'export"
          type="checkbox"
          checked={branding.showWatermark}
          onChange={(e) => onChange({ ...branding, showWatermark: e.target.checked })}
          className="h-[20px] w-[20px] shrink-0 accent-[#3B4CCA]"
        />
      </label>
    </div>
  )
}
