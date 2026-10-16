/**
 * The board's geometry and timing. The same drawing has two arrangements,
 * picked by the board's width: wide (the clock on the left, its words on
 * the right) beside the hero and on a tablet, narrow (scene 1 stacked, the
 * clock above the bottom line) on a phone. Scene 1 (Who and Levels) is
 * drawn first and wiped off by Smudge before the clock is drawn in its
 * place; before 0:00 a quick pass of his clears the finished board.
 */

export type Arrangement = 'wide' | 'narrow'

/** A board narrower than this many pixels takes the narrow arrangement. */
export const NARROW_BELOW = 395

/** The hand stands still until day one, then turns three years in thirty seconds. */
export const HAND_START = 26
export const HAND_END = 56
/** When the hub glows: a result landing in SPRS. */
export const PULSES = [25.1, 36.4, 43.3, 46.4, 56] as const
/** Smudge's quick pass that clears the finished board, before 0:00. */
export const CLEAR_SECONDS = 0.5
/** Scene 1 is wiped off between these seconds, in three overlapping strokes. */
export const ERASE_START = 15.7
export const ERASE_END = 16.9

export interface Dial {
  readonly cx: number
  readonly cy: number
  /** The rim. */
  readonly r: number
  /** The hub, SPRS. */
  readonly hub: number
}

export interface BoardGeometry {
  readonly width: number
  readonly height: number
  readonly dial: Dial
  /** The strokes Smudge wipes scene 1 with, and their width. */
  readonly erase: string
  readonly eraseWidth: number
  /** The strokes that clear the whole board before 0:00, and their width. */
  readonly clear: string
  readonly clearWidth: number
  /** Smudge's size on this board, as a scale of his 170×110 drawing. */
  readonly eraser: number
  /** No word on this board is smaller than this, in board units. */
  readonly floor: number
}

export const boards: Record<Arrangement, BoardGeometry> = {
  wide: {
    width: 520,
    height: 235,
    dial: { cx: 122, cy: 130, r: 78, hub: 30 },
    erase: 'M548 42 L-28 42 M-28 118 L548 118 M548 194 L-28 194',
    eraseWidth: 84,
    clear: 'M548 60 L-28 60 M-28 180 L548 180',
    clearWidth: 130,
    eraser: 0.85,
    floor: 14.5,
  },
  narrow: {
    width: 300,
    height: 366,
    dial: { cx: 150, cy: 172, r: 96, hub: 33 },
    erase: 'M326 36 L-26 36 M-26 108 L326 108 M326 180 L-26 180',
    eraseWidth: 76,
    clear: 'M326 62 L-26 62 M-26 183 L326 183 M326 304 L-26 304',
    clearWidth: 130,
    eraser: 0.7,
    floor: 12,
  },
}

export function clamp(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value
}

const fixed = (value: number) => value.toFixed(1)

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
    d += `${i ? 'L' : 'M'}${fixed(cx + radius * Math.cos(angle))} ${fixed(cy + radius * Math.sin(angle))} `
  }
  return `${d}Z`
}

/**
 * A circle drawn by hand: four curves from twelve o'clock round to the
 * right, the last one overshooting the start a little, as the mockup's
 * dial does.
 */
export function loopPath(cx: number, cy: number, r: number): string {
  const k = 0.5523 * r
  const w = r * 0.012
  return [
    `M${fixed(cx)} ${fixed(cy - r)}`,
    `C${fixed(cx + k)} ${fixed(cy - r - w)} ${fixed(cx + r + w)} ${fixed(cy - k)} ${fixed(cx + r)} ${fixed(cy)}`,
    `C${fixed(cx + r)} ${fixed(cy + k)} ${fixed(cx + k)} ${fixed(cy + r + w)} ${fixed(cx)} ${fixed(cy + r)}`,
    `C${fixed(cx - k)} ${fixed(cy + r)} ${fixed(cx - r - w)} ${fixed(cy + k)} ${fixed(cx - r)} ${fixed(cy)}`,
    `C${fixed(cx - r + w)} ${fixed(cy - k)} ${fixed(cx - k)} ${fixed(cy - r)} ${fixed(cx + r * 0.04)} ${fixed(cy - r + w)}`,
  ].join(' ')
}

/** The month ticks around the dial, the three year marks left out. */
export function tickPath(dial: Dial): string {
  const { cx, cy, r } = dial
  let d = ''
  for (let i = 1; i < 36; i += 1) {
    if (i % 12 === 0) continue
    const angle = (i * Math.PI) / 18
    const s = Math.sin(angle)
    const c = Math.cos(angle)
    d += `M${fixed(cx + (r - 5) * s)} ${fixed(cy - (r - 5) * c)} L${fixed(cx + r * s)} ${fixed(cy - r * c)} `
  }
  return d.trim()
}

/** The three year marks, at twelve, four and eight o'clock, through the rim. */
export function yearMarks(dial: Dial): string {
  const { cx, cy, r } = dial
  return [0, 120, 240]
    .map((degrees) => {
      const rad = (degrees * Math.PI) / 180
      const s = Math.sin(rad)
      const c = Math.cos(rad)
      return `M${fixed(cx + (r - 5) * s)} ${fixed(cy - (r - 5) * c)} L${fixed(cx + (r + 7) * s)} ${fixed(cy - (r + 7) * c)}`
    })
    .join(' ')
}

/** The hand: from just above the hub to just under the star, with its head. */
export function handPath(dial: Dial): string {
  const { cx, cy, r, hub } = dial
  const foot = cy - hub - 6
  const tip = cy - r + 15
  return `M${cx} ${foot} L${cx} ${tip + 1} M${cx - 8} ${tip + 11} L${cx} ${tip} L${cx + 8} ${tip + 11}`
}

/** The sector swept from twelve o'clock through this many degrees. */
export function sectorPath(dial: Dial, degrees: number): string {
  if (degrees <= 0.05) return ''
  const { cx, cy, r, hub } = dial
  const a = Math.min(degrees, 359.9)
  const r1 = hub + 3
  const r2 = r - 4
  const rad = (a * Math.PI) / 180
  const s = Math.sin(rad)
  const c = Math.cos(rad)
  const large = a > 180 ? 1 : 0
  return `M${cx} ${cy - r2} A${r2} ${r2} 0 ${large} 1 ${fixed(cx + r2 * s)} ${fixed(cy - r2 * c)} L${fixed(cx + r1 * s)} ${fixed(cy - r1 * c)} A${r1} ${r1} 0 ${large} 0 ${cx} ${cy - r1} Z`
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
