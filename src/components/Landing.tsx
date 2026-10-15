import Sketch from './Sketch'
import GarmentIcon from './GarmentIcon'
import { getGarment } from '../lib/garments'
import { DownloadIcon } from './Icons'

import ThemeToggle from './ThemeToggle'
import type { Theme } from '../hooks/useTheme'

interface Props {
  onStart: () => void
  theme?: Theme
  onToggleTheme?: () => void
}

export default function Landing({ onStart, theme = 'light', onToggleTheme = () => {} }: Props) {
  const tshirt = getGarment('tshirt')
  const demoValues = { longueur: 70, aisselles: 52, epaules: 46, manche: 22 }

  return (
    <div className="min-h-screen t-canvas flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <header className="h-[72px] t-card border-b t-border px-7 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-[34px] h-[34px] rounded-[10px] bg-[#3B4CCA] flex items-center justify-center">
            <GarmentIcon id="tshirt" className="w-[22px] h-[22px]" color="#FFFFFF" />
          </span>
          <span className="text-[22px] font-extrabold t-ink">FitDraw</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button type="button" onClick={onStart}
            className="h-12 rounded-full bg-[#3B4CCA] text-white text-[15px] font-extrabold px-7">
            Créer un croquis
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-7 py-14 grid grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-[46px] leading-[1.08] font-extrabold tracking-[-0.02em] t-ink">
            Un croquis de mesures propre pour vos annonces, en 30 secondes.
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed font-semibold t-sub max-w-[480px]">
            Choisissez un vêtement, entrez 3 ou 4 mesures à plat, et exportez une image claire à ajouter en dernière photo de votre annonce Vinted ou Leboncoin. Gratuit, sans compte.
          </p>
          <button type="button" onClick={onStart}
            className="mt-8 h-14 rounded-full bg-[#3B4CCA] text-white text-[17px] font-extrabold px-9 flex items-center gap-2">
            <DownloadIcon className="w-5 h-5" />Créer mon croquis
          </button>
          <p className="mt-3 text-[13px] font-semibold t-sub">Aucune inscription — tout reste dans votre navigateur.</p>

          <div className="mt-10 grid grid-cols-3 gap-3 max-w-[520px]">
            {[
              { t: '12 vêtements', d: 'T-shirt, jean, robe, veste…' },
              { t: 'Forme réelle', d: 'Le croquis suit vos mesures' },
              { t: 'Export PNG', d: '1600 × 1600, prêt à publier' },
            ].map((f) => (
              <div key={f.t} className="t-card rounded-[20px] p-4 border t-border">
                <p className="text-[15px] font-extrabold t-ink">{f.t}</p>
                <p className="text-[12px] font-semibold t-sub mt-1 leading-snug">{f.d}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="t-card rounded-[32px] shadow-[0_4px_24px_rgba(20,22,31,0.06)] p-8 flex items-center justify-center">
          <Sketch
            garment={tshirt}
            values={demoValues}
            unit="cm"
            activeKey={null}
            onPillClick={() => {}}
            className="w-[min(460px,100%)] h-auto"
          />
        </div>
      </main>

      <footer className="px-7 py-5 text-center text-[13px] font-semibold t-sub border-t t-border t-card">
        FitDraw — mesures prises à plat, ± 1 cm.
      </footer>
    </div>
  )
}
