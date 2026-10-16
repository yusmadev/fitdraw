import { Link } from 'wouter'
import { BrandMark } from '../fitdraw/components/AppHeader'
import SketchSvg from '../fitdraw/components/Sketch'
import { getGarment, sizeValue } from '../fitdraw/garments'
import type { MeasureValues } from '../fitdraw/shapes'
import { useLayout } from '../fitdraw/useFitDraw'
import { DownloadIcon, ShareIcon, CopyIcon } from '../fitdraw/components/Icons'
import SmoothScroll from '../components/motion/SmoothScroll'
import Reveal, { Parallax } from '../components/motion/Reveal'
import SpotlightCard from '../components/motion/SpotlightCard'
import SyncRive from '../components/motion/SyncRive'

const demo = getGarment('chemise')
const demoValues: MeasureValues = Object.fromEntries(demo.measures.map((m) => [m.key, sizeValue(m.def, m.key, 'M')]))

const steps = [
  { n: '1', t: 'Choisis le vêtement', d: '11 pièces, des hauts aux vestes, avec les mesures qui comptent pour chacune.' },
  { n: '2', t: 'Saisis à plat', d: 'Chaque ligne rappelle comment mesurer. Le croquis se dessine pendant que tu tapes.' },
  { n: '3', t: 'Exporte', d: 'PNG 1600 × 1600 avec ton nom de boutique, prêt pour ta fiche produit ou ta cliente.' },
]

const guarantees = [
  { I: DownloadIcon, t: 'PNG 1600 × 1600' },
  { I: CopyIcon, t: 'Mesures copiables' },
  { I: ShareIcon, t: 'Partage natif' },
]

export default function Landing() {
  const layout = useLayout()
  const compact = layout === 'mobile'

  return (
    <SmoothScroll>
      <div className="min-h-screen t-bg">
        <Reveal as="header" y={-10} duration={0.5} className="mx-auto flex h-[68px] w-full max-w-[1200px] items-center px-[20px]">
          <Link href="/" className="flex items-center gap-[9px]">
            <span className="flex h-[32px] w-[32px] items-center justify-center rounded-[10px] bg-[#3B4CCA] text-white">
              <BrandMark className="h-[18px] w-[18px]" />
            </span>
            <span className="text-[16px] font-extrabold tracking-[-0.02em] t-ink">FitDraw</span>
          </Link>
          <div className="flex-1" />
          <Link
            href="/studio"
            className="inline-flex h-[38px] items-center rounded-full bg-[#3B4CCA] px-[18px] text-[13px] font-bold text-white"
          >
            Ouvrir FitDraw
          </Link>
        </Reveal>

        <main className="mx-auto w-full max-w-[1200px] px-[20px] pb-[80px]">
          <section
            className={`grid items-center gap-[28px] pt-[26px] pb-[54px] ${
              compact ? 'grid-cols-1' : 'grid-cols-[minmax(0,1fr)_minmax(0,460px)]'
            }`}
          >
            <Reveal stagger={0.075} delay={0.05} className="flex flex-col items-start gap-[20px]">
              <span className="inline-flex items-center gap-[7px] rounded-full bg-[#E8EAFB] px-[13px] py-[6px] text-[11.5px] font-bold uppercase tracking-[0.06em] text-[#3B4CCA] dark:bg-[#232847] dark:text-[#A8B2FF]">
                Mesures à plat · cm ou po
              </span>
              <h1 className="max-w-[22ch] text-[40px] font-extrabold leading-[1.05] tracking-[-0.035em] t-ink sm:text-[52px]">
                Le croquis de tes mesures, sans logiciel de dessin.
              </h1>
              <p className="max-w-[52ch] text-[16px] font-medium leading-[1.55] t-sub">
                FitDraw transforme les mesures à plat d'un vêtement en un croquis coté, lisible et exportable. Tu saisis,
                il dessine, tu partages.
              </p>
              <div className="flex flex-wrap items-center gap-[10px]">
                <Link
                  href="/studio"
                  className="inline-flex h-[52px] items-center rounded-full bg-[#3B4CCA] px-[26px] text-[14.5px] font-bold text-white hover:bg-[#3341b0]"
                >
                  Commencer un croquis
                </Link>
                <Link
                  href="/compte"
                  className="inline-flex h-[52px] items-center rounded-full t-surface px-[22px] text-[14.5px] font-bold t-ink"
                >
                  Se connecter
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-[18px] pt-[6px]">
                {guarantees.map(({ I, t }) => (
                  <span key={t} className="inline-flex items-center gap-[7px] text-[12.5px] font-semibold t-sub">
                    <I className="h-[15px] w-[15px]" />
                    {t}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.16} y={26} start="top 92%">
              <Parallax className="flex items-center justify-center rounded-[32px] t-canvas t-hairline p-[20px]">
                <SketchSvg garment={demo} values={demoValues} unit="cm" coupe={1} className="h-auto w-full max-w-[440px]" />
              </Parallax>
            </Reveal>
          </section>

          <Reveal stagger={0.1} className={`grid gap-[16px] ${compact ? 'grid-cols-1' : 'grid-cols-3'}`}>
            {steps.map((s) => (
              <SpotlightCard key={s.n} className="flex flex-col gap-[10px] rounded-[24px] t-card t-hairline p-[22px]">
                <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#3B4CCA] text-[13px] font-extrabold text-white">
                  {s.n}
                </span>
                <h2 className="text-[16px] font-extrabold tracking-[-0.015em] t-ink">{s.t}</h2>
                <p className="text-[13.5px] font-medium leading-[1.55] t-sub">{s.d}</p>
              </SpotlightCard>
            ))}
          </Reveal>

          <Reveal y={22} className="mt-[46px]">
            <SpotlightCard radius={420} className="rounded-[32px] t-card t-hairline p-[28px]">
              <div
                className={`grid items-center gap-[28px] ${
                  compact ? 'grid-cols-1' : 'grid-cols-[minmax(0,1fr)_300px]'
                }`}
              >
                <div className="flex flex-col items-start gap-[16px]">
                  <h2 className="max-w-[26ch] text-[24px] font-extrabold leading-[1.15] tracking-[-0.025em] t-ink">
                    Tes croquis te suivent d'un appareil à l'autre.
                  </h2>
                  <p className="max-w-[60ch] text-[14px] font-medium leading-[1.6] t-sub">
                    L'app enregistre tout sur ton appareil d'abord — elle reste rapide et marche hors ligne.
                    Connecte-toi et tes brouillons, ton nom de boutique et ton logo se synchronisent tout seuls, sur
                    mobile comme sur ordinateur.
                  </p>
                  <Link
                    href="/compte"
                    className="inline-flex h-[46px] items-center rounded-full t-surface px-[20px] text-[13.5px] font-bold t-ink"
                  >
                    Créer un compte
                  </Link>
                </div>
                <SyncRive className="aspect-[7/4] w-full" />
              </div>
            </SpotlightCard>
          </Reveal>
        </main>
      </div>
    </SmoothScroll>
  )
}
