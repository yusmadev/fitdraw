import { useEffect } from 'react'
import { CloseIcon } from './Icons'

interface Props {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  /** Sur mobile : feuille qui glisse du bas. Sur desktop : panneau centré. */
  variant?: 'sheet' | 'dialog'
  footer?: React.ReactNode
}

/** Conteneur modal partagé : bottom sheet sur mobile, dialogue centré ailleurs. */
export default function Sheet({ open, title, onClose, children, variant = 'dialog', footer }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  const body = (
    <>
      <header className="flex shrink-0 items-center justify-between gap-[12px] border-b t-border px-[20px] py-[16px]">
        <h2 className="text-[15px] font-extrabold tracking-[-0.01em] t-ink">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full t-surface2 t-sub hover:t-ink"
        >
          <CloseIcon className="h-[16px] w-[16px]" />
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-[20px] py-[18px]">{children}</div>
      {footer ? <footer className="shrink-0 border-t t-border px-[20px] py-[14px]">{footer}</footer> : null}
    </>
  )

  const panel =
    variant === 'sheet'
      ? 'pointer-events-auto absolute inset-x-0 bottom-0 flex max-h-[86vh] flex-col overflow-hidden rounded-t-[28px] t-card shadow-2xl animate-[fd-sheet_.22s_ease-out]'
      : 'pointer-events-auto flex max-h-[86vh] w-full max-w-[520px] flex-col overflow-hidden rounded-[28px] t-card shadow-2xl animate-[fd-fade_.16s_ease-out]'

  return (
    // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- <dialog> imposerait ses propres styles et sa gestion du focus ; ici la modale est pilotée à la main
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-[#0B0D13]/45" />
      {variant === 'sheet' ? (
        <div className={panel}>{body}</div>
      ) : (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-[16px]">
          <div className={panel}>{body}</div>
        </div>
      )}
    </div>
  )
}
