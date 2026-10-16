import { Link } from 'wouter'
import { MoonIcon, SunIcon } from './Icons'
import UnitToggle from './UnitToggle'
import type { Unit } from '../renderSketch'
import type { Theme } from '../store'

/** Icône vêtement — reprise de la marque FitDraw. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <path d="M9 3 5 5.4 3.4 10l3 .9V21h11.2V10.9l3-.9L19 5.4 15 3a3 3 0 0 1-6 0Z" />
    </svg>
  )
}

interface Props {
  unit: Unit
  onUnit: (u: Unit) => void
  theme: Theme
  onToggleTheme: () => void
  onBranding: () => void
  onAccount: () => void
  compact?: boolean
}

export default function AppHeader({ unit, onUnit, theme, onToggleTheme, onBranding, onAccount, compact = false }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b t-border bg-[rgb(var(--t-bg)/0.86)] backdrop-blur-md">
      <div className={`mx-auto flex items-center gap-[10px] px-[16px] ${compact ? 'h-[58px]' : 'h-[68px]'} ${compact ? '' : 'max-w-[1440px]'}`}>
        <Link href="/" className="flex items-center gap-[9px]">
          <span className="flex h-[32px] w-[32px] items-center justify-center rounded-[10px] bg-[#3B4CCA] text-white">
            <BrandMark className="h-[18px] w-[18px]" />
          </span>
          <span className="text-[16px] font-extrabold tracking-[-0.02em] t-ink">FitDraw</span>
        </Link>

        <div className="flex-1" />

        <UnitToggle unit={unit} onChange={onUnit} />

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre'}
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full t-surface t-sub hover:t-ink"
        >
          {theme === 'dark' ? <SunIcon className="h-[16px] w-[16px]" /> : <MoonIcon className="h-[16px] w-[16px]" />}
        </button>

        <button
          type="button"
          onClick={onBranding}
          className="hidden h-[34px] items-center rounded-full t-surface px-[14px] text-[12.5px] font-bold t-ink sm:inline-flex"
        >
          Personnaliser
        </button>

        <button
          type="button"
          onClick={onAccount}
          aria-label="Compte"
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full t-surface2 text-[12px] font-bold t-ink"
        >
          <svg viewBox="0 0 24 24" className="h-[16px] w-[16px]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="8.5" r="3.6" />
            <path d="M4.8 20a7.4 7.4 0 0 1 14.4 0" />
          </svg>
        </button>
      </div>
    </header>
  )
}
