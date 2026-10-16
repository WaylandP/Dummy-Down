/**
 * Strokes as a hand draws them: a mark's path data flattened to polylines
 * (one per pen stroke), given a small seeded wobble, measured once, and
 * read back at any drawn length for the chalk's tip. Nothing here touches
 * the DOM, so the frames never measure.
 */

export type Point = readonly [number, number]

/** One pen stroke: its points, the running length at each, and the total. */
export interface Stroke {
  readonly points: readonly Point[]
  readonly at: readonly number[]
  readonly length: number
}

/** A small deterministic noise, so the wobble is the same on every visit. */
export function seeded(seed: number): () => number {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13
    s >>>= 0
    s ^= s >>> 17
    s ^= s << 5
    s >>>= 0
    return s / 4294967296
  }
}

const number = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi

/** The commands of absolute path data: M, L, C, Q and Z. */
function commands(d: string): { op: string; args: number[] }[] {
  const out: { op: string; args: number[] }[] = []
  const re = /([MLCQZmlcqz])([^MLCQZmlcqz]*)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(d))) {
    const args = (m[2]!.match(number) ?? []).map(Number)
    out.push({ op: m[1]!, args })
  }
  return out
}

function cubic(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const u = 1 - t
  return [
    u * u * u * p0[0] +
      3 * u * u * t * p1[0] +
      3 * u * t * t * p2[0] +
      t * t * t * p3[0],
    u * u * u * p0[1] +
      3 * u * u * t * p1[1] +
      3 * u * t * t * p2[1] +
      t * t * t * p3[1],
  ]
}

function quadratic(p0: Point, p1: Point, p2: Point, t: number): Point {
  const u = 1 - t
  return [
    u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
    u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
  ]
}

/**
 * The path's subpaths as polylines, curves cut into short straight pieces
 * (about `step` units long), so a stroke can be measured and wobbled.
 */
export function flatten(d: string, step = 3): Point[][] {
  const paths: Point[][] = []
  let current: Point[] = []
  let pen: Point = [0, 0]
  let startOf: Point = [0, 0]
  const push = (p: Point) => {
    current.push(p)
    pen = p
  }
  // A straight line in pieces of about `step`, so it can wobble too.
  const line = (to: Point) => {
    const from = pen
    const n = Math.max(
      1,
      Math.ceil(Math.hypot(to[0] - from[0], to[1] - from[1]) / step),
    )
    for (let k = 1; k <= n; k += 1)
      push([
        from[0] + ((to[0] - from[0]) * k) / n,
        from[1] + ((to[1] - from[1]) * k) / n,
      ])
  }
  for (const { op, args } of commands(d)) {
    const lower = op.toLowerCase()
    const relative = op === lower
    const rel = (x: number, y: number): Point =>
      relative ? [pen[0] + x, pen[1] + y] : [x, y]
    if (lower === 'm') {
      if (current.length > 1) paths.push(current)
      current = []
      const p = rel(args[0]!, args[1]!)
      push(p)
      startOf = p
      // Further pairs after a move are lines.
      for (let i = 2; i + 1 < args.length; i += 2)
        line(rel(args[i]!, args[i + 1]!))
    } else if (lower === 'l') {
      for (let i = 0; i + 1 < args.length; i += 2)
        line(rel(args[i]!, args[i + 1]!))
    } else if (lower === 'c') {
      for (let i = 0; i + 5 < args.length; i += 6) {
        const p0 = pen
        const p1 = rel(args[i]!, args[i + 1]!)
        const p2 = rel(args[i + 2]!, args[i + 3]!)
        const p3 = rel(args[i + 4]!, args[i + 5]!)
        const guess =
          Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) +
          Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) +
          Math.hypot(p3[0] - p2[0], p3[1] - p2[1])
        const n = Math.max(2, Math.ceil(guess / step))
        for (let k = 1; k <= n; k += 1) push(cubic(p0, p1, p2, p3, k / n))
      }
    } else if (lower === 'q') {
      for (let i = 0; i + 3 < args.length; i += 4) {
        const p0 = pen
        const p1 = rel(args[i]!, args[i + 1]!)
        const p2 = rel(args[i + 2]!, args[i + 3]!)
        const guess =
          Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) +
          Math.hypot(p2[0] - p1[0], p2[1] - p1[1])
        const n = Math.max(2, Math.ceil(guess / step))
        for (let k = 1; k <= n; k += 1) push(quadratic(p0, p1, p2, k / n))
      }
    } else if (lower === 'z') {
      line(startOf)
    }
  }
  if (current.length > 1) paths.push(current)
  return paths
}

/**
 * A hand's wobble: each point moved a little across the line, the amount
 * drifting smoothly along it (a seeded random walk, pulled back toward
 * zero), never more than `amount` units. The ends stay put, so joins and
 * arrowheads still meet.
 */
export function wobble(
  points: readonly Point[],
  amount: number,
  seed: number,
): Point[] {
  if (points.length < 3 || amount <= 0) return [...points]
  const random = seeded(seed)
  const out: Point[] = [points[0]!]
  let drift = 0
  for (let i = 1; i < points.length - 1; i += 1) {
    const prev = points[i - 1]!
    const next = points[i + 1]!
    const dx = next[0] - prev[0]
    const dy = next[1] - prev[1]
    const length = Math.hypot(dx, dy) || 1
    // Across the line, with the drift wandering and coming back.
    drift = drift * 0.82 + (random() - 0.5) * amount * 0.9
    drift = Math.max(-amount, Math.min(amount, drift))
    out.push([
      points[i]![0] - (dy / length) * drift,
      points[i]![1] + (dx / length) * drift,
    ])
  }
  out.push(points[points.length - 1]!)
  return out
}

/** The polyline measured: the running length at each point and the total. */
export function measure(points: readonly Point[]): Stroke {
  const at: number[] = [0]
  let length = 0
  for (let i = 1; i < points.length; i += 1) {
    length += Math.hypot(
      points[i]![0] - points[i - 1]![0],
      points[i]![1] - points[i - 1]![1],
    )
    at.push(length)
  }
  return { points, at, length }
}

/** The point this far along the stroke, and the direction there. */
export function along(
  stroke: Stroke,
  distance: number,
): { x: number; y: number; dx: number; dy: number } {
  const { points, at, length } = stroke
  if (points.length === 1)
    return { x: points[0]![0], y: points[0]![1], dx: 1, dy: 0 }
  const s = Math.max(0, Math.min(length, distance))
  // Binary search the segment.
  let lo = 0
  let hi = at.length - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (at[mid]! <= s) lo = mid
    else hi = mid
  }
  const a = points[lo]!
  const b = points[hi]!
  const span = at[hi]! - at[lo]! || 1
  const f = (s - at[lo]!) / span
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const n = Math.hypot(dx, dy) || 1
  return { x: a[0] + dx * f, y: a[1] + dy * f, dx: dx / n, dy: dy / n }
}

/** Path data for a polyline. */
export function pathOf(points: readonly Point[]): string {
  return points
    .map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(' ')
}

/** An ease in and out: slow to start, slow to stop, like a pen. */
export function ease(t: number): number {
  const x = t < 0 ? 0 : t > 1 ? 1 : t
  return x * x * (3 - 2 * x)
}

/** An ease out: quick to start, slow to settle, like dust drifting. */
export function easeOut(t: number): number {
  const x = t < 0 ? 0 : t > 1 ? 1 : t
  return 1 - (1 - x) * (1 - x)
}

/** The straight distance between two points. */
export function distance(a: Point, b: Point): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1])
}

/**
 * Where a lifted chalk is, `p` of the way (0 to 1) along a short arc from
 * one point to another: a straight line with a rise above it that grows
 * with the distance, so the stick hops rather than slides.
 */
export function arc(from: Point, to: Point, p: number): Point {
  const q = p < 0 ? 0 : p > 1 ? 1 : p
  const rise = 3 + Math.min(8, distance(from, to) * 0.08)
  return [
    from[0] + (to[0] - from[0]) * q,
    from[1] + (to[1] - from[1]) * q - rise * Math.sin(Math.PI * q),
  ]
}

/** The points of a polyline between two distances along it, for a short bright tip. */
export function between(stroke: Stroke, start: number, end: number): Point[] {
  const a = along(stroke, start)
  const b = along(stroke, end)
  const out: Point[] = [[a.x, a.y]]
  for (let i = 0; i < stroke.at.length; i += 1) {
    const d = stroke.at[i]!
    if (d > start && d < end) out.push(stroke.points[i]!)
  }
  out.push([b.x, b.y])
  return out
}
