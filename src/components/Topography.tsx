/** Decorative terrain, not a map of controls or a compliance progress indicator. */
const contours = Array.from({ length: 13 }, (_, index) => {
  const points = Array.from({ length: 97 }, (_, step) => {
    const angle = (step / 96) * Math.PI * 2
    const ripple =
      1 + 0.13 * Math.sin(3 * angle + 0.8) + 0.06 * Math.cos(5 * angle - 0.5)
    const radius = 92 + index * 28
    const x =
      544 + Math.cos(angle) * radius * ripple * 1.13 + Math.sin(angle * 2) * 18
    const y =
      370 + Math.sin(angle) * radius * ripple * 0.73 + Math.cos(angle) * 39
    return `${step === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
  })
  return `${points.join(' ')} Z`
})

export function Topography() {
  return (
    <div className="topography" aria-hidden="true">
      <svg viewBox="0 0 1000 760" fill="none" focusable="false">
        {contours.map((path, index) => (
          <path
            key={index}
            d={path}
            className={index % 4 === 0 ? 'contour-major' : 'contour-minor'}
          />
        ))}
        <path
          className="terrain-route"
          d="M244 627C316 607 364 574 413 531S454 461 497 439 589 450 610 405 574 356 561 343"
        />
        <circle cx="561" cy="343" r="5" className="terrain-point" />
        <circle cx="561" cy="343" r="14" className="terrain-point-ring" />
      </svg>
    </div>
  )
}
