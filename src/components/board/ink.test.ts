import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  bytesToInk,
  decodeInk,
  encodeInk,
  inkLimit,
  inkPrefix,
  inkScale,
  inkToBytes,
  isInkFragment,
  segmentDistance,
  simplifyStroke,
  strokeTouches,
  type Ink,
} from './ink'

/** A wobbly line: many points, most of them on the way between a few. */
function wobble(count: number, from = 0): { x: number; y: number }[] {
  return Array.from({ length: count }, (_, index) => ({
    x: from + index * 2.4,
    y: 100 + Math.sin(index / 9) * 30 + (index % 2) * 0.3,
  }))
}

afterEach(() => vi.unstubAllGlobals())

describe('chalk marks in a link', () => {
  it('keeps the shape of a stroke with far fewer points, in whole pixels', () => {
    const points = wobble(120)
    const simple = simplifyStroke(points)
    expect(simple.length).toBeLessThan(points.length / 3)
    expect(simple[0]).toEqual({ x: 0, y: 100 })
    expect(simple[simple.length - 1]).toEqual({
      x: Math.round(points[119]!.x),
      y: Math.round(points[119]!.y),
    })
    for (const point of simple) {
      expect(Number.isInteger(point.x)).toBe(true)
      expect(Number.isInteger(point.y)).toBe(true)
    }
    // Every original point stays within a pixel or so of the simpler line.
    for (const point of points) {
      let nearest = Infinity
      for (let index = 1; index < simple.length; index += 1)
        nearest = Math.min(
          nearest,
          segmentDistance(point, simple[index - 1]!, simple[index]!),
        )
      expect(nearest).toBeLessThanOrEqual(1.5)
    }
    // A tap is one point; a straight line is its two ends.
    expect(simplifyStroke([{ x: 3.4, y: 4.6 }])).toEqual([{ x: 3, y: 5 }])
    expect(
      simplifyStroke([
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: 20, y: 20 },
        { x: 30, y: 30 },
      ]),
    ).toEqual([
      { x: 0, y: 0 },
      { x: 30, y: 30 },
    ])
  })

  it('writes the width and the strokes as deltas and reads them back exactly', () => {
    const ink: Ink = {
      width: 1184,
      strokes: [
        [
          { x: 10, y: 20 },
          { x: 15, y: 18 },
          { x: 300, y: -4 },
        ],
        [{ x: 0, y: 0 }],
        [
          { x: 1000, y: 2000 },
          { x: 999, y: 2001 },
        ],
      ],
    }
    const bytes = inkToBytes(ink)
    expect(bytesToInk(bytes)).toEqual(ink)
    // Damage is refused, never thrown: a truncated stream, a trailing byte,
    // and a stroke of no points.
    expect(bytesToInk(bytes.subarray(0, bytes.length - 1))).toBeNull()
    expect(bytesToInk(Uint8Array.from([...bytes, 0]))).toBeNull()
    expect(bytesToInk(Uint8Array.from([5, 1, 0]))).toBeNull()
    expect(bytesToInk(new Uint8Array())).toBeNull()
  })

  it('round-trips through the fragment, deflated when the browser can', async () => {
    const ink: Ink = {
      width: 1184,
      strokes: [simplifyStroke(wobble(80)), simplifyStroke(wobble(40, 300))],
    }
    const fragment = await encodeInk(ink)
    expect(fragment.startsWith(inkPrefix)).toBe(true)
    expect(isInkFragment(fragment)).toBe(true)
    expect(fragment).toMatch(/^#ink=v1[A-Za-z0-9_-]+$/)
    expect(await decodeInk(fragment)).toEqual(ink)
    // Without deflate the same marks still fit the link and read back.
    vi.stubGlobal('CompressionStream', undefined)
    vi.stubGlobal('DecompressionStream', undefined)
    const raw = await encodeInk(ink)
    expect(raw).not.toBe(fragment)
    expect(await decodeInk(raw)).toEqual(ink)
    expect(raw.length).toBeGreaterThanOrEqual(fragment.length)
  })

  it('refuses a fragment that is not ours or is damaged, quietly', async () => {
    expect(await decodeInk('')).toBeNull()
    expect(await decodeInk('#explorer')).toBeNull()
    expect(await decodeInk('#ink=v2AAAA')).toBeNull()
    expect(await decodeInk(`${inkPrefix}`)).toBeNull()
    expect(await decodeInk(`${inkPrefix}not base64url!`)).toBeNull()
    expect(await decodeInk(`${inkPrefix}AQID`)).toBeNull()
    expect(isInkFragment('#ink=v2AAAA')).toBe(false)
  })

  it('keeps a typical page under 2,000 characters and has room for the cap', async () => {
    // Twenty strokes of about forty points each, as a page of notes might.
    const strokes = Array.from({ length: 20 }, (_, index) =>
      simplifyStroke(wobble(40, index * 50)),
    )
    const fragment = await encodeInk({ width: 1184, strokes })
    expect(fragment.length).toBeLessThan(2000)
    expect(inkLimit).toBe(4000)
  })

  it('draws marks scaled on a screen about as wide, and leaves them out on one that is not', () => {
    expect(inkScale(1000, 1000)).toBe(1)
    expect(inkScale(1000, 1100)).toBeCloseTo(1.1)
    expect(inkScale(1000, 900)).toBeCloseTo(0.9)
    expect(inkScale(1000, 1200)).toBeNull()
    expect(inkScale(1000, 800)).toBeNull()
    expect(inkScale(0, 800)).toBeNull()
  })

  it('tells which strokes a rub touches', () => {
    const line = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    ]
    expect(strokeTouches(line, { x: 50, y: 5 }, 12)).toBe(true)
    expect(strokeTouches(line, { x: 50, y: 20 }, 12)).toBe(false)
    expect(strokeTouches(line, { x: -10, y: 0 }, 12)).toBe(true)
    expect(strokeTouches(line, { x: -13, y: 0 }, 12)).toBe(false)
    expect(strokeTouches([{ x: 5, y: 5 }], { x: 10, y: 10 }, 12)).toBe(true)
    expect(strokeTouches([], { x: 10, y: 10 }, 12)).toBe(false)
  })
})
