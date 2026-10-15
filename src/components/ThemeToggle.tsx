import type { Theme } from '../hooks/useTheme'

interface Props {
  theme: Theme
  onToggle: () => void
  className?: string
}

export default function ThemeToggle({ theme, onToggle, className = '' }: Props) {
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      className={`w-11 h-11 rounded-full bg-[#F4F5F8] dark:bg-[#232733] flex items-center justify-center ${className}`}
    >
      {dark ? (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#E8EAFB" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="#14161F" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 13.5A8 8 0 0 1 10.5 4 8 8 0 1 0 20 13.5Z" />
        </svg>
      )}
    </button>
  )
}
