export interface Point {
  readonly x: number
  readonly y: number
}

/** A smoothed chalk line through the points: quadratic curves through the midpoints. */
export function strokePath(points: readonly Point[]): string {
  const first = points[0]
  if (!first) return ''
  const at = (point: Point) => `${point.x.toFixed(1)} ${point.y.toFixed(1)}`
  if (points.length === 1) return `M${at(first)}l0.1 0`
  let d = `M${at(first)}`
  for (let index = 1; index < points.length - 1; index += 1) {
    const point = points[index]!
    const next = points[index + 1]!
    const mid = { x: (point.x + next.x) / 2, y: (point.y + next.y) / 2 }
    d += `Q${at(point)} ${at(mid)}`
  }
  return `${d}L${at(points[points.length - 1]!)}`
}
