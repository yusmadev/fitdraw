import { useState } from 'react'
import { authClient } from '../../lib/auth'

type Mode = 'signin' | 'signup'

const input =
  'h-[46px] w-full rounded-[14px] t-surface2 px-[14px] text-[14.5px] font-medium t-ink outline-none placeholder:t-sub focus:ring-2 focus:ring-[#3B4CCA]/45'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6Z" />
      <path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.4 1.1-3.9 1.1-3 0-5.6-2-6.5-4.8H1.7v3A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.5 14.6a7.2 7.2 0 0 1 0-4.6v-3H1.7a12 12 0 0 0 0 10.6l3.8-3Z" />
      <path fill="#EA4335" d="M12 4.7c1.7 0 3.2.6 4.4 1.7l3.3-3.3A12 12 0 0 0 1.7 7l3.8 3c.9-2.8 3.5-4.8 6.5-4.8Z" />
    </svg>
  )
}

interface Props {
  /** Nombre de brouillons déjà présents localement — rassure avant connexion. */
  localCount: number
  syncState?: 'idle' | 'syncing' | 'synced' | 'error'
}

/** Compte : connexion Google (managed) ou e-mail / mot de passe, et état de la synchro. */
export default function AccountPanel({ localCount, syncState = 'idle' }: Props) {
  const { data: session, isPending } = authClient.useSession()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const google = async () => {
    setError(null)
    setBusy(true)
    try {
      const res = await authClient.managedAuth.signIn({ provider: 'google' })
      if (res.error && res.error.code !== 'POPUP_CLOSED') setError(res.error.message ?? 'Connexion Google impossible.')
    } catch {
      setError('Connexion Google impossible.')
    } finally {
      setBusy(false)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const res =
        mode === 'signin'
          ? await authClient.signIn.email({ email, password })
          : await authClient.signUp.email({ email, password, name: name || email.split('@')[0] })
      if (res.error) setError(res.error.message ?? 'Connexion refusée.')
    } catch {
      setError('Connexion refusée.')
    } finally {
      setBusy(false)
    }
  }

  if (isPending) {
    return <p className="text-[13.5px] font-medium t-sub">Vérification de la session…</p>
  }

  if (session) {
    const label =
      syncState === 'syncing' ? 'Synchronisation…' : syncState === 'error' ? 'Synchro interrompue' : 'Synchronisé'
    const dot =
      syncState === 'error' ? 'bg-[#D9534F]' : syncState === 'syncing' ? 'bg-[#E0A93B]' : 'bg-[#2E9E6B]'
    return (
      <div className="flex flex-col gap-[18px]">
        <div className="flex items-center gap-[12px]">
          <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#3B4CCA] text-[15px] font-extrabold text-white">
            {(session.user.name || session.user.email).slice(0, 1).toUpperCase()}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[14.5px] font-bold t-ink">{session.user.name || 'Ton compte'}</span>
            <span className="truncate text-[12.5px] font-medium t-sub">{session.user.email}</span>
          </span>
        </div>

        <div className="flex items-center gap-[9px] rounded-[16px] t-surface2 px-[14px] py-[12px]">
          <span className={`h-[8px] w-[8px] rounded-full ${dot}`} />
          <span className="text-[13px] font-semibold t-ink">{label}</span>
        </div>

        <p className="text-[12.5px] font-medium t-sub">
          Tes {localCount} brouillons sont enregistrés sur cet appareil et se copient automatiquement sur tes autres
          appareils. Rien à faire.
        </p>

        <button
          type="button"
          onClick={() => void authClient.signOut()}
          className="h-[46px] rounded-full t-surface text-[13.5px] font-bold t-ink"
        >
          Se déconnecter
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[18px]">
      <p className="text-[13px] font-medium t-sub">
        Connecte-toi pour retrouver tes {localCount} croquis sur tous tes appareils. Tes brouillons actuels sont
        conservés et envoyés à la connexion.
      </p>

      <button
        type="button"
        onClick={() => void google()}
        disabled={busy}
        className="flex h-[50px] w-full items-center justify-center gap-[10px] rounded-full t-surface text-[14px] font-bold t-ink disabled:opacity-60"
      >
        <GoogleIcon />
        Continuer avec Google
      </button>

      <div className="flex items-center gap-[10px]">
        <span className="h-px flex-1 t-border bg-[rgb(var(--t-border))]" />
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] t-sub">ou</span>
        <span className="h-px flex-1 bg-[rgb(var(--t-border))]" />
      </div>

      <div className="flex rounded-full t-surface p-[3px]">
        {(['signin', 'signup'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m)
              setError(null)
            }}
            className={`h-[34px] flex-1 rounded-full text-[13px] font-bold transition-colors ${
              mode === m ? 't-card t-ink shadow-sm' : 't-sub'
            }`}
          >
            {m === 'signin' ? 'Se connecter' : 'Créer un compte'}
          </button>
        ))}
      </div>

      <form className="flex flex-col gap-[10px]" onSubmit={submit}>
        {mode === 'signup' ? (
          <input
            type="text"
            aria-label="Nom affiché"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom"
            className={input}
          />
        ) : null}
        <input
          type="email"
          aria-label="Adresse e-mail"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="adresse@exemple.fr"
          className={input}
        />
        <input
          type="password"
          aria-label="Mot de passe"
          required
          minLength={8}
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe (8 caractères min.)"
          className={input}
        />
        {error ? <p className="text-[12px] font-semibold text-[#B4483F] dark:text-[#F2777A]">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="h-[50px] rounded-full bg-[#3B4CCA] text-[14px] font-bold text-white disabled:opacity-60"
        >
          {mode === 'signin' ? 'Se connecter' : 'Créer mon compte'}
        </button>
      </form>
    </div>
  )
}
