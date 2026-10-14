/** The ring's strokes spell C in Morse: dash dot dash dot. */
export const markDashes = '72 17 14 17 72 17 14 16'

interface MarkProps {
  readonly className?: string
  readonly title?: string
}

/** The chalk ring: r=38, stroke 9, rotated −100° in a 100-unit box. */
export function Mark({ className = 'chalk', title }: MarkProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      focusable="false"
      {...(title
        ? { role: 'img', 'aria-label': title }
        : { 'aria-hidden': true })}
    >
      <circle
        cx="50"
        cy="50"
        r="38"
        fill="none"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={markDashes}
        transform="rotate(-100 50 50)"
      />
    </svg>
  )
}

/** The lockup links home; the accessible name covers both the ring and the words. */
export function Lockup() {
  return (
    <a href="/" className="lockup" aria-label="Cipher & Chalk home">
      <Mark className="lockup-mark chalk" />
      <span className="lockup-name" aria-hidden="true">
        Cipher &amp; Chalk
      </span>
    </a>
  )
}
