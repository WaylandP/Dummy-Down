/**
 * The clock's geometry, as the mockup's script generates it: the hub, the
 * stars, the thirty-six month ticks, the sector the hand has swept, and
 * where on the board the still crops to.
 */

/** The clock's centre, in the board's 960×600 coordinates. */
export const CX = 280
export const CY = 335
/** The hand stands still until day one, then turns three years in thirty seconds. */
export const HAND_START = 26
export const HAND_END = 56
/** When the hub glows: a result landing in SPRS. */
export const PULSES = [25.1, 36.4, 43.3, 46.4, 56] as const
/** The board as drawn, and stacked (the clock above the notes) under 640px. */
export const WIDE_VIEWBOX = '0 0 960 600'
export const NARROW_VIEWBOX = '0 0 520 1275'
export const NARROW_WIDTH = 640
/**
 * The still on Home: the dial from "3 yrs: recertify" on the left to the
 * year-one check on the right, and from the C3PAO label down to the dial's
 * foot, in the same coordinates.
 */
export const STILL_VIEWBOX = '44 108 432 408'

export function clamp(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value
}

/** A five-pointed star. */
export function starPath(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
): string {
  let d = ''
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5
    const radius = i % 2 ? inner : outer
    d += `${i ? 'L' : 'M'}${(cx + radius * Math.cos(angle)).toFixed(1)} ${(cy + radius * Math.sin(angle)).toFixed(1)} `
  }
  return `${d}Z`
}

/** The month ticks around the dial, the three year marks left out. */
export const tickPath = (() => {
  let d = ''
  for (let i = 1; i < 36; i += 1) {
    if (i % 12 === 0) continue
    const angle = (i * Math.PI) / 18
    const s = Math.sin(angle)
    const c = Math.cos(angle)
    d += `M${(CX + 167 * s).toFixed(1)} ${(CY - 167 * c).toFixed(1)} L${(CX + 176 * s).toFixed(1)} ${(CY - 176 * c).toFixed(1)} `
  }
  return d.trim()
})()

/** The sector swept from twelve o'clock through this many degrees. */
export function sectorPath(degrees: number): string {
  if (degrees <= 0.05) return ''
  const a = Math.min(degrees, 359.9)
  const r1 = 58
  const r2 = 166
  const rad = (a * Math.PI) / 180
  const s = Math.sin(rad)
  const c = Math.cos(rad)
  const large = a > 180 ? 1 : 0
  return `M${CX} ${CY - r2} A${r2} ${r2} 0 ${large} 1 ${(CX + r2 * s).toFixed(1)} ${(CY - r2 * c).toFixed(1)} L${(CX + r1 * s).toFixed(1)} ${(CY - r1 * c).toFixed(1)} A${r1} ${r1} 0 ${large} 0 ${CX} ${CY - r1} Z`
}

/** Where the hand points at this second; under reduced motion it steps, otherwise it turns. */
export function handAngle(seconds: number, reduced: boolean): number {
  if (reduced)
    return seconds < 36
      ? 0
      : seconds < 42.67
        ? 120
        : seconds < 46
          ? 200
          : seconds < 56
            ? 240
            : 360
  if (seconds < HAND_START) return 0
  if (seconds < HAND_END)
    return ((seconds - HAND_START) / (HAND_END - HAND_START)) * 360
  return 360
}
