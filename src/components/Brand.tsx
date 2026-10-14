export function ChalkMark() {
  return (
    <img
      className="brand-mark"
      src="/brand/chalk-mark.svg"
      alt=""
      width="48"
      height="48"
      aria-hidden="true"
    />
  )
}

export function Brand() {
  return (
    <a href="/" className="brand" aria-label="Cipher & Chalk home">
      <ChalkMark />
      <span className="brand-wordmark" aria-hidden="true">
        Cipher <span className="brand-ampersand">&amp;</span> Chalk
      </span>
    </a>
  )
}
