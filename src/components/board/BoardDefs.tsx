/**
 * The chalk filter and the dust noise are defined once here. The filter is
 * referenced from CSS as `filter: url(#chalk)`, so this SVG stays in the page
 * at zero size even where the dust itself is hidden (print, forced colors).
 */
export function BoardDefs() {
  return (
    <svg className="board-defs" aria-hidden="true" focusable="false">
      <defs>
        <filter id="chalk" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.95"
            numOctaves="2"
            seed="7"
            result="n"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale="1.4"
            xChannelSelector="R"
            yChannelSelector="G"
            result="d"
          />
          <feColorMatrix in="n" type="luminanceToAlpha" result="a" />
          <feComponentTransfer in="a" result="m">
            <feFuncA type="table" tableValues="0 0.55 1 1 1 1" />
          </feComponentTransfer>
          <feComposite in="d" in2="m" operator="in" />
        </filter>
        <filter id="dust">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.7"
            numOctaves="3"
            seed="3"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
    </svg>
  )
}

/** Chalk dust in the board surface: full-bleed noise, screened at 16%. */
export function BoardDust() {
  return (
    <svg className="board-dust" aria-hidden="true" focusable="false">
      <rect width="100%" height="100%" filter="url(#dust)" />
    </svg>
  )
}

/** The slate ground with its wiped lift at the top-left. */
export function BoardGround() {
  return <div className="board-ground" aria-hidden="true" />
}
