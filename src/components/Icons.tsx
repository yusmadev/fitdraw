interface P { className?: string; stroke?: string }

export const CopyIcon = ({ className, stroke = 'currentColor' }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" />
  </svg>
)

export const DownloadIcon = ({ className, stroke = 'currentColor' }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 4v11" /><path d="m7 11 5 5 5-5" /><path d="M4 20h16" />
  </svg>
)

export const ShareIcon = ({ className, stroke = 'currentColor' }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 15V4" /><path d="m8 8 4-4 4 4" /><path d="M5 13v5.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V13" />
  </svg>
)

export const ChevronDown = ({ className, stroke = 'currentColor' }: P) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke={stroke} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
)
