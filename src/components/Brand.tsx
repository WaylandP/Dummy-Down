export function CodedMark() {
  return (
    <svg
      className="brand-mark"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M29 7H13L6 14v12l7 7h16"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="miter"
      />
      <path d="M28 14H16l-3 3v6l3 3h12" stroke="currentColor" strokeWidth="2" />
      <path d="M32 17h5v6h-5z" fill="currentColor" />
    </svg>
  )
}

export function Brand() {
  return (
    <a href="#top" className="brand" aria-label="Cipher & Chalk home">
      <CodedMark />
      <span className="brand-wordmark" aria-hidden="true">
        Cipher <span className="brand-ampersand">&amp;</span> Chalk
      </span>
    </a>
  )
}
