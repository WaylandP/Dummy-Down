#!/usr/bin/env node
/**
 * Path data a third the size: every coordinate rounded to a whole font unit
 * (under a hundredth of a pixel on the board) and every command relative to
 * the point before it, so the numbers are short. The outline is unchanged
 * to the eye and still fills nonzero.
 */
function compactPath(absolute) {
  let out = ''
  let last = ''
  let pen = [0, 0]
  const emit = (cmd, values) => {
    let text = ''
    for (const [index, value] of values.entries()) {
      const number = String(Math.round(value))
      text += index > 0 && !number.startsWith('-') ? ` ${number}` : number
    }
    if (cmd !== last) out += cmd
    else if (!text.startsWith('-')) out += ' '
    out += text
    last = cmd
  }
  const re = /([MLQCZ])([^MLQCZ]*)/g
  let match
  while ((match = re.exec(absolute))) {
    const cmd = match[1]
    const a = (match[2].match(/-?\d*\.?\d+/g) ?? []).map(Number)
    const to = (x, y) => {
      const p = [Math.round(x), Math.round(y)]
      const d = [p[0] - pen[0], p[1] - pen[1]]
      return { p, d }
    }
    if (cmd === 'M') {
      const { p, d } = to(a[0], a[1])
      // The first move is absolute (from the origin, the numbers are the same).
      emit(out === '' ? 'M' : 'm', d)
      pen = p
    } else if (cmd === 'L') {
      for (let i = 0; i + 1 < a.length; i += 2) {
        const { p, d } = to(a[i], a[i + 1])
        emit('l', d)
        pen = p
      }
    } else if (cmd === 'Q') {
      for (let i = 0; i + 3 < a.length; i += 4) {
        const c = to(a[i], a[i + 1])
        const { p, d } = to(a[i + 2], a[i + 3])
        emit('q', [...c.d, ...d])
        pen = p
      }
    } else if (cmd === 'C') {
      for (let i = 0; i + 5 < a.length; i += 6) {
        const c1 = to(a[i], a[i + 1])
        const c2 = to(a[i + 2], a[i + 3])
        const { p, d } = to(a[i + 4], a[i + 5])
        emit('c', [...c1.d, ...c2.d, ...d])
        pen = p
      }
    } else if (cmd === 'Z') {
      out += 'z'
      last = 'z'
    }
  }
  return out
}

/**
 * Glyph outlines and stroke skeletons for "CMMC in sixty seconds".
 *
 * `npm run sixty:glyphs` reads the board's words (src/components/sixty/
 * sixty-words.ts) and the site's hand font (public/fonts/walter-turncoat-
 * latin-400.woff) and writes src/components/sixty/sixty-glyphs.json, which is
 * committed: for every character the words use, its outline as SVG path data
 * (relative commands, whole font units: a third the size of the absolute form),
 * its advance, bounding box, stroke thickness and an ordered stroke skeleton,
 * plus every word laid out with the font's own advances and kerning. All
 * coordinates are font units with y pointing down and the baseline at y=0, so
 * a glyph drawn at `size` pixels scales by size / unitsPerEm. The animation
 * draws from that file alone; nothing is loaded from off the site.
 *
 * How a skeleton is made, with nothing but Node and opentype.js:
 *   1. The outline is rasterized at 256 px per em (nonzero winding) by a
 *      scanline fill of the flattened contours.
 *   2. The ink is thinned to one pixel (Zhang–Suen), then a sequential pass
 *      drops any pixel whose neighbours stay 8-connected without it.
 *   3. Spurs, branches shorter than 8% of the em that end at a junction, are
 *      pruned until none is left; their tips are remembered.
 *   4. The skeleton becomes a graph of branches between junctions and ends.
 *      Junctions closer than three quarters of the stroke width are one
 *      junction (a stem crossing a bar thins into two T's). At each junction
 *      the two branches that continue most nearly straight (at most 60° off)
 *      join into one stroke; a junction with only two branches is a cusp the
 *      pen runs through. A stroke leaving a junction below a short stub
 *      (under 12% of the em) starts from the stub's tip.
 *   5. Corners: thinning rounds them, so the arms are measured past half a
 *      stroke width from the bend; where they meet at 70° or more, run
 *      straight, and ink lies beyond the local half width along the bisector,
 *      the bend is replaced by the ink's own corner. At a Γ corner (right and
 *      down arms) or a peak between two long arms (over 25% of the em each)
 *      on a stroke that ends low, the stroke is cut, as a hand lifts there.
 *   6. A stroke runs from its top end (its left end when level); a loop starts
 *      at its top and heads left. Free ends are extended along their tangent
 *      to the edge of the ink; a pruned tip the strokes leave bare is visited
 *      as a detour. A blob smaller than two stroke widths (a dot) gets a
 *      scribble from its centre instead. Strokes are ordered by their start,
 *      top to bottom then left to right.
 *   7. Each polyline is simplified (Douglas–Peucker, 1.5 px at 256 px/em) and
 *      converted back to font units, one decimal.
 *   8. `thickness` is twice the largest Euclidean distance transform value in
 *      the ink; `coverage` is the share of ink pixels within thickness × 1.05
 *      / 2 of a stroke drawn with round caps and joins. A glyph under 0.99
 *      fails the run.
 *
 * scripts/sixty-glyph-strokes.json holds hand-authored strokes (1000-unit em,
 * same orientation) for the characters whose automatic skeleton draws in an
 * order no hand would use; they go through the same coverage gate and are
 * marked "hand" in the output.
 *
 * Rerun after changing the words, the font or the overrides:
 *   npm run sixty:glyphs
 * Options: `--preview <dir>` also writes PNG contact sheets of every glyph's
 * strokes (uncovered ink in red, a black square on hand-authored glyphs) to
 * look at; `--dump <chars>` prints the automatic strokes of those characters
 * in the override file's format. The output is deterministic: the same inputs
 * give a byte-identical file.
 */

import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'
import opentype from 'opentype.js'
import { sixtyWords } from '../src/components/sixty/sixty-words.ts'

const FONT_FILE = 'walter-turncoat-latin-400.woff'
/** Raster resolution. The pixel thresholds below are stated at this scale. */
const PX_PER_EM = 256
/** Background around the glyph in the raster, in pixels. */
const PAD = 8
/** Branches shorter than this share of the em that end at a junction go. */
const SPUR_EM = 0.08
/** Douglas–Peucker tolerance, in pixels. */
const SIMPLIFY_PX = 1.5
/** Two branches at a junction join into one stroke when this nearly straight. */
const MERGE_MAX_DEGREES = 60
/** Ends this close in y count as level, and the left one starts. */
const BAND_EM = 0.06
/** How far along a branch its direction at a junction is measured, in pixels. */
const DIRECTION_PX = 8
/** Strokes are judged at this multiple of the thickness. */
const WIDTH_FACTOR = 1.05
const COVERAGE_MIN = 0.99
/** The override file's em. */
const OVERRIDE_EM = 1000

const root = fileURLToPath(new URL('..', import.meta.url))
const fontPath = resolve(root, 'public/fonts', FONT_FILE)
const outPath = resolve(root, 'src/components/sixty/sixty-glyphs.json')
const overridesPath = resolve(root, 'scripts/sixty-glyph-strokes.json')

const args = process.argv.slice(2)
const option = (name) => {
  const at = args.indexOf(name)
  return at === -1 ? null : (args[at + 1] ?? '')
}
const previewDir = option('--preview')
const dumpChars = option('--dump')

// ---------------------------------------------------------------------------
// Geometry helpers

const round1 = (value) => Math.round(value * 10) / 10 || 0
const hypot = (dx, dy) => Math.sqrt(dx * dx + dy * dy)

/** Squared distance from (px, py) to the segment a–b. */
function segmentDistanceSquared(px, py, a, b) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len = dx * dx + dy * dy
  let t = len === 0 ? 0 : ((px - a[0]) * dx + (py - a[1]) * dy) / len
  t = t < 0 ? 0 : t > 1 ? 1 : t
  const ex = a[0] + t * dx - px
  const ey = a[1] + t * dy - py
  return ex * ex + ey * ey
}

/** Douglas–Peucker. Keeps the first and last points. */
function simplify(points, tolerance) {
  if (points.length <= 2) return points.slice()
  const keep = new Uint8Array(points.length)
  keep[0] = 1
  keep[points.length - 1] = 1
  const stack = [[0, points.length - 1]]
  while (stack.length) {
    const [a, b] = stack.pop()
    let farthest = -1
    let farthestDistance = tolerance * tolerance
    for (let i = a + 1; i < b; i += 1) {
      const d = segmentDistanceSquared(
        points[i][0],
        points[i][1],
        points[a],
        points[b],
      )
      if (d > farthestDistance) {
        farthestDistance = d
        farthest = i
      }
    }
    if (farthest !== -1) {
      keep[farthest] = 1
      stack.push([a, farthest], [farthest, b])
    }
  }
  return points.filter((_, i) => keep[i])
}

// ---------------------------------------------------------------------------
// Rasterizing the outline

/** How many line segments a curve of this control-polygon length gets. */
const curveSteps = (length) => Math.min(48, Math.max(3, Math.ceil(length / 2)))

/**
 * Fills the glyph's outline on a pixel grid: `mask[y * W + x]` is 1 where the
 * pixel's centre is inside the outline (nonzero winding, as TrueType draws).
 * `toPx` and `toFont` convert between font units and pixel coordinates.
 */
function rasterize(path, unitsPerEm) {
  const scale = PX_PER_EM / unitsPerEm
  const bbox = path.getBoundingBox()
  const ox = bbox.x1
  const oy = bbox.y1
  const W = Math.ceil((bbox.x2 - bbox.x1) * scale) + 2 * PAD
  const H = Math.ceil((bbox.y2 - bbox.y1) * scale) + 2 * PAD
  const toPx = (x, y) => [(x - ox) * scale + PAD, (y - oy) * scale + PAD]
  const toFont = (x, y) => [(x - PAD) / scale + ox, (y - PAD) / scale + oy]

  const edges = []
  let start = null
  let current = null
  const lineTo = (point) => {
    if (current) edges.push([current[0], current[1], point[0], point[1]])
    current = point
  }
  const close = () => {
    if (current && start) lineTo(start)
    current = start
  }
  for (const command of path.commands) {
    if (command.type === 'M') {
      close()
      start = toPx(command.x, command.y)
      current = start
    } else if (command.type === 'L') {
      lineTo(toPx(command.x, command.y))
    } else if (command.type === 'Q') {
      const p0 = current
      const p1 = toPx(command.x1, command.y1)
      const p2 = toPx(command.x, command.y)
      const steps = curveSteps(
        hypot(p1[0] - p0[0], p1[1] - p0[1]) +
          hypot(p2[0] - p1[0], p2[1] - p1[1]),
      )
      for (let i = 1; i <= steps; i += 1) {
        const t = i / steps
        const u = 1 - t
        lineTo([
          u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
          u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
        ])
      }
    } else if (command.type === 'C') {
      const p0 = current
      const p1 = toPx(command.x1, command.y1)
      const p2 = toPx(command.x2, command.y2)
      const p3 = toPx(command.x, command.y)
      const steps = curveSteps(
        hypot(p1[0] - p0[0], p1[1] - p0[1]) +
          hypot(p2[0] - p1[0], p2[1] - p1[1]) +
          hypot(p3[0] - p2[0], p3[1] - p2[1]),
      )
      for (let i = 1; i <= steps; i += 1) {
        const t = i / steps
        const u = 1 - t
        lineTo([
          u * u * u * p0[0] +
            3 * u * u * t * p1[0] +
            3 * u * t * t * p2[0] +
            t * t * t * p3[0],
          u * u * u * p0[1] +
            3 * u * u * t * p1[1] +
            3 * u * t * t * p2[1] +
            t * t * t * p3[1],
        ])
      }
    } else if (command.type === 'Z') {
      close()
    }
  }
  close()

  const mask = new Uint8Array(W * H)
  for (let y = 0; y < H; y += 1) {
    const yc = y + 0.5
    const crossings = []
    for (const [x0, y0, x1, y1] of edges) {
      if (y0 === y1) continue
      if ((yc >= y0 && yc < y1) || (yc >= y1 && yc < y0)) {
        const t = (yc - y0) / (y1 - y0)
        crossings.push([x0 + t * (x1 - x0), y1 > y0 ? 1 : -1])
      }
    }
    crossings.sort((a, b) => a[0] - b[0])
    let winding = 0
    for (let k = 0; k + 1 < crossings.length; k += 1) {
      winding += crossings[k][1]
      if (winding === 0) continue
      const from = Math.max(0, Math.ceil(crossings[k][0] - 0.5))
      const to = Math.min(W, Math.ceil(crossings[k + 1][0] - 0.5))
      for (let x = from; x < to; x += 1) mask[y * W + x] = 1
    }
  }
  return { mask, W, H, scale, toPx, toFont, bbox }
}

// ---------------------------------------------------------------------------
// Distance transform (Felzenszwalb & Huttenlocher), squared distances to the
// nearest background pixel.

function distanceTransform({ mask, W, H }) {
  const INF = 1e20
  const n = Math.max(W, H)
  const f = new Float64Array(n)
  const d = new Float64Array(n)
  const v = new Int32Array(n)
  const z = new Float64Array(n + 1)
  const transform1d = (length) => {
    let k = 0
    v[0] = 0
    z[0] = -INF
    z[1] = INF
    for (let q = 1; q < length; q += 1) {
      let s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k])
      while (s <= z[k]) {
        k -= 1
        s = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k])
      }
      k += 1
      v[k] = q
      z[k] = s
      z[k + 1] = INF
    }
    k = 0
    for (let q = 0; q < length; q += 1) {
      while (z[k + 1] < q) k += 1
      d[q] = (q - v[k]) * (q - v[k]) + f[v[k]]
    }
  }
  const columns = new Float64Array(W * H)
  for (let x = 0; x < W; x += 1) {
    for (let y = 0; y < H; y += 1) f[y] = mask[y * W + x] ? INF : 0
    transform1d(H)
    for (let y = 0; y < H; y += 1) columns[y * W + x] = d[y]
  }
  const squared = new Float64Array(W * H)
  let max = 0
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) f[x] = columns[y * W + x]
    transform1d(W)
    for (let x = 0; x < W; x += 1) {
      squared[y * W + x] = d[x]
      if (d[x] > max) max = d[x]
    }
  }
  return { squared, maxDistance: Math.sqrt(max) }
}

// ---------------------------------------------------------------------------
// Thinning

/** The eight neighbours, clockwise from north: N NE E SE S SW W NW. */
const RING = [
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
]
/** Which ring positions touch each other (ring neighbours, and N–E, E–S, S–W, W–N). */
const RING_ADJACENT = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 0],
  [0, 2],
  [2, 4],
  [4, 6],
  [6, 0],
]

function ringOf(grid, W, index) {
  return RING.map(([dx, dy]) => grid[index + dy * W + dx])
}

function neighborsOf(grid, W, index) {
  const out = []
  for (const [dx, dy] of RING) {
    const at = index + dy * W + dx
    if (grid[at]) out.push(at)
  }
  return out
}

/** How many 8-connected groups the set neighbours form without the centre. */
function neighborGroups(ring) {
  const parent = [0, 1, 2, 3, 4, 5, 6, 7]
  const find = (i) => {
    while (parent[i] !== i) i = parent[i]
    return i
  }
  for (const [a, b] of RING_ADJACENT)
    if (ring[a] && ring[b]) parent[find(a)] = find(b)
  let groups = 0
  for (let i = 0; i < 8; i += 1) if (ring[i] && find(i) === i) groups += 1
  return groups
}

/** Zhang–Suen thinning of the ink, then a sequential clean-up that leaves no
 * pixel whose neighbours stay connected without it (one pixel wide). */
function thin(mask, W, H) {
  const skel = Uint8Array.from(mask)
  let changed = true
  while (changed) {
    changed = false
    for (let pass = 0; pass < 2; pass += 1) {
      const toDelete = []
      for (let y = 1; y < H - 1; y += 1)
        for (let x = 1; x < W - 1; x += 1) {
          const index = y * W + x
          if (!skel[index]) continue
          const p = ringOf(skel, W, index)
          let count = 0
          for (let i = 0; i < 8; i += 1) count += p[i]
          if (count < 2 || count > 6) continue
          let transitions = 0
          for (let i = 0; i < 8; i += 1)
            if (!p[i] && p[(i + 1) % 8]) transitions += 1
          if (transitions !== 1) continue
          if (pass === 0) {
            if (p[0] && p[2] && p[4]) continue
            if (p[2] && p[4] && p[6]) continue
          } else {
            if (p[0] && p[2] && p[6]) continue
            if (p[0] && p[4] && p[6]) continue
          }
          toDelete.push(index)
        }
      for (const index of toDelete) skel[index] = 0
      if (toDelete.length) changed = true
    }
  }
  cleanUp(skel, W, H)
  return skel
}

function cleanUp(skel, W, H) {
  let changed = true
  while (changed) {
    changed = false
    for (let y = 1; y < H - 1; y += 1)
      for (let x = 1; x < W - 1; x += 1) {
        const index = y * W + x
        if (!skel[index]) continue
        const ring = ringOf(skel, W, index)
        let count = 0
        for (let i = 0; i < 8; i += 1) count += ring[i]
        if (count >= 2 && neighborGroups(ring) === 1) {
          skel[index] = 0
          changed = true
        }
      }
  }
}

/**
 * Removes branches shorter than `maxLength` pixels that end at a junction,
 * repeatedly. Returns the pruned tips and the junction pixel each left from,
 * so a tip the finished strokes leave uncovered can be drawn as a detour.
 */
function prune(skel, W, H, maxLength) {
  const spurs = []
  for (;;) {
    const degree = new Uint8Array(W * H)
    const ends = []
    for (let y = 1; y < H - 1; y += 1)
      for (let x = 1; x < W - 1; x += 1) {
        const index = y * W + x
        if (!skel[index]) continue
        degree[index] = neighborsOf(skel, W, index).length
        if (degree[index] === 1) ends.push(index)
      }
    let removed = false
    for (const end of ends) {
      if (!skel[end]) continue
      const branch = [end]
      let previous = -1
      let current = end
      let length = 0
      let junction = -1
      for (;;) {
        const next = neighborsOf(skel, W, current).find((n) => n !== previous)
        if (next === undefined) break
        if (degree[next] >= 3) {
          junction = next
          break
        }
        if (degree[next] !== 2) break
        length += stepLength(W, current, next)
        if (length >= maxLength) break
        branch.push(next)
        previous = current
        current = next
      }
      if (junction === -1 || length >= maxLength) continue
      for (const index of branch) skel[index] = 0
      spurs.push({ tip: end, from: junction })
      removed = true
    }
    if (!removed) return spurs
    cleanUp(skel, W, H)
  }
}

function stepLength(W, a, b) {
  const dx = (a % W) - (b % W)
  const dy = Math.floor(a / W) - Math.floor(b / W)
  return dx && dy ? Math.SQRT2 : 1
}

function chainLength(points, W) {
  let sum = 0
  for (let i = 1; i < points.length; i += 1)
    sum += stepLength(W, points[i - 1], points[i])
  return sum
}

/** Labels the ink's 8-connected components; returns the id per pixel and the count. */
function components(mask, W, H) {
  const label = new Int32Array(W * H).fill(-1)
  let count = 0
  for (let y = 1; y < H - 1; y += 1)
    for (let x = 1; x < W - 1; x += 1) {
      const index = y * W + x
      if (!mask[index] || label[index] !== -1) continue
      const stack = [index]
      label[index] = count
      while (stack.length) {
        const at = stack.pop()
        for (const n of neighborsOf(mask, W, at))
          if (label[n] === -1) {
            label[n] = count
            stack.push(n)
          }
      }
      count += 1
    }
  return { label, count }
}

// ---------------------------------------------------------------------------
// From skeleton pixels to pen strokes

/** A bend this sharp over eight pixels, in degrees, may be a corner. */
const CORNER_HINT_DEGREES = 45
/** Arms that meet this sharply, measured past the rounding, are a corner. */
const CORNER_DEGREES = 70
/** A peak parts its two arms only when both run at least this share of the
 * em (the flag of a 1 stays with its stem). */
const LONG_ARM_EM = 0.25
/** A dead-end branch no longer than this share of the em above a junction is
 * a stub (the top of an M's stem above where its V leaves); a stroke that
 * leaves the junction starts from the stub's tip instead. */
const STUB_EM = 0.12

const samePoint = (p, q) => p[0] === q[0] && p[1] === q[1]
const distanceSquared = (p, q) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2
const unit = (dx, dy) => {
  const length = hypot(dx, dy) || 1
  return [dx / length, dy / length]
}
const degreesBetween = (u, v) =>
  (Math.acos(Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1]))) * 180) /
  Math.PI

/** Where the stroke heads over its first pixels: 1 straight down, -1 up. */
function downwardness(points) {
  const a = points[0]
  const b = points[Math.min(points.length - 1, DIRECTION_PX)]
  return (b[1] - a[1]) / (hypot(b[0] - a[0], b[1] - a[1]) || 1)
}

function polylineLength(points) {
  let sum = 0
  for (let i = 1; i < points.length; i += 1)
    sum += hypot(
      points[i][0] - points[i - 1][0],
      points[i][1] - points[i - 1][1],
    )
  return sum
}

/** An arm's dominant direction away from its corner. */
function armClass([dx, dy]) {
  if (dy > 0.5) return 'down'
  if (dy < -0.5) return 'up'
  return dx > 0 ? 'right' : 'left'
}

/** How far the ink reaches from `from` along a direction, or null. */
function inkReach(from, direction, { mask, W, H }, maxLength) {
  let farthest = null
  for (let t = 0.5; t <= maxLength; t += 0.5) {
    const x = from[0] + direction[0] * t
    const y = from[1] + direction[1] * t
    const px = Math.floor(x)
    const py = Math.floor(y)
    if (px < 0 || py < 0 || px >= W || py >= H || !mask[py * W + px]) break
    farthest = [x, y]
  }
  return farthest
}

/**
 * Corners. Thinning rounds a sharp corner off, so the arms are measured past
 * half a stroke width from the bend; where they meet at 70° or more, run
 * straight, and ink lies beyond the local half width along the bisector,
 * the rounded bend is replaced by the ink's own corner. At a Γ corner (one arm right, one down, as atop an F or P)
 * or at a peak on top of a stroke that ends low (an A's apex, the first
 * corner of an N) a hand lifts the chalk, so the stroke is cut there; a loop
 * with such a corner opens there. The sides of a V, an L, a 7 stay joined.
 */
function shapeCorners(stroke, raster, squared, thicknessPx) {
  const k = DIRECTION_PX
  let { points } = stroke
  const { closed } = stroke
  if (
    closed &&
    points.length > 1 &&
    samePoint(points[0], points[points.length - 1])
  )
    points = points.slice(0, -1)
  const n = points.length
  const reach = Math.round(thicknessPx / 2)
  const span = reach + k
  if (n < 2 * span + 2) return [{ ...stroke, points }]
  const wrap = (i) => ((i % n) + n) % n
  const inRange = (i) => closed || (i >= 0 && i < n)
  const at = (i) => points[closed ? wrap(i) : i]
  const turns = new Float64Array(n)
  for (let i = 0; i < n; i += 1) {
    if (!inRange(i - k) || !inRange(i + k)) continue
    const a = at(i - k)
    const b = at(i)
    const c = at(i + k)
    turns[i] = degreesBetween(
      unit(b[0] - a[0], b[1] - a[1]),
      unit(c[0] - b[0], c[1] - b[1]),
    )
  }
  const topY = Math.min(...points.map((p) => p[1]))
  const band = BAND_EM * PX_PER_EM
  const endsHigh =
    !closed && points[0][1] <= topY + band && points[n - 1][1] <= topY + band
  const corners = []
  for (let i = 0; i < n; i += 1) {
    if (turns[i] < CORNER_HINT_DEGREES) continue
    if (!inRange(i - span) || !inRange(i + span)) continue
    let sharpest = true
    for (let j = i - k; j <= i + k && sharpest; j += 1) {
      if (j === i || !inRange(j)) continue
      const jj = closed ? wrap(j) : j
      if (turns[jj] > turns[i] || (turns[jj] === turns[i] && jj < i))
        sharpest = false
    }
    if (!sharpest) continue
    const b = at(i)
    const before = at(i - reach)
    const after = at(i + reach)
    const arm1 = unit(at(i - span)[0] - before[0], at(i - span)[1] - before[1])
    const arm2 = unit(at(i + span)[0] - after[0], at(i + span)[1] - after[1])
    if (180 - degreesBetween(arm1, arm2) < CORNER_DEGREES) continue
    const straight = (j) =>
      !inRange(j - k) || !inRange(j + k) || turns[closed ? wrap(j) : j] < 40
    if (!straight(i - reach - 4) || !straight(i + reach + 4)) continue
    const classes = [armClass(arm1), armClass(arm2)].sort().join(' ')
    const split =
      classes === 'down right' || (classes === 'down down' && !endsHigh)
    // A corner has ink beyond the local half width along its bisector; a
    // tight curve has not.
    const bisector = [-(arm1[0] + arm2[0]), -(arm1[1] + arm2[1])]
    if (hypot(bisector[0], bisector[1]) < 1e-6) continue
    const tip = inkReach(
      b,
      unit(bisector[0], bisector[1]),
      raster,
      thicknessPx * 1.5,
    )
    if (!tip) continue
    const local = Math.sqrt(
      squared[Math.floor(b[1]) * raster.W + Math.floor(b[0])],
    )
    if (hypot(tip[0] - b[0], tip[1] - b[1]) < local) continue
    corners.push({ i, split, tip, classes })
  }
  // A peak only parts two long arms; the flag of a 1 stays with its stem.
  const longArm = LONG_ARM_EM * PX_PER_EM
  corners.forEach((corner, c) => {
    if (corner.classes !== 'down down') return
    const previous =
      c > 0 ? corners[c - 1].i : closed ? corners[corners.length - 1].i - n : 0
    const next =
      c + 1 < corners.length
        ? corners[c + 1].i
        : closed
          ? corners[0].i + n
          : n - 1
    if (corner.i - previous < longArm || next - corner.i < longArm)
      corner.split = false
  })
  if (!corners.length) return [{ ...stroke, points }]

  if (closed) {
    // Open the loop at a lifting corner, else at any corner, and go on as an
    // open chain whose both ends are that corner.
    const c = corners.find((corner) => corner.split) ?? corners[0]
    const vertex = c.tip
    const cut = reach
    const opened = [vertex]
    for (let j = c.i + cut + 1; j < c.i + n - cut; j += 1)
      opened.push(points[wrap(j)])
    opened.push(vertex)
    const pieces = shapeCorners(
      { points: opened, closed: false, startFree: false, endFree: false },
      raster,
      squared,
      thicknessPx,
    )
    if (!c.split && pieces.length === 1) pieces[0].closed = true
    return pieces
  }

  const pieces = []
  let piece = {
    points: [],
    closed: false,
    startFree: stroke.startFree,
    endFree: false,
  }
  let cursor = 0
  for (const corner of corners) {
    const cutFrom = Math.max(cursor, corner.i - reach)
    for (let j = cursor; j < cutFrom; j += 1) piece.points.push(points[j])
    const vertex = corner.tip
    piece.points.push(vertex)
    if (corner.split) {
      pieces.push(piece)
      piece = {
        points: [vertex],
        closed: false,
        startFree: false,
        endFree: false,
      }
    }
    cursor = Math.max(cursor, corner.i + reach + 1)
  }
  for (let j = cursor; j < n; j += 1) piece.points.push(points[j])
  piece.endFree = stroke.endFree
  pieces.push(piece)
  return pieces.filter((p) => p.points.length >= 2)
}

/** A stroke runs from its top end, or from its left end when level; when both
 * ends meet (an opened loop) it heads down first. */
function orient(stroke) {
  const { points } = stroke
  const band = BAND_EM * PX_PER_EM
  const first = points[0]
  const last = points[points.length - 1]
  let forward
  if (Math.abs(first[1] - last[1]) > band) forward = first[1] < last[1]
  else if (Math.abs(first[0] - last[0]) > band) forward = first[0] < last[0]
  else forward = downwardness(points) >= downwardness([...points].reverse())
  if (forward) return stroke
  return {
    ...stroke,
    points: [...points].reverse(),
    startFree: stroke.endFree,
    endFree: stroke.startFree,
  }
}

/** Pushes a free end along its tangent to where the ink stops. */
function extendEnd(points, atStart, raster, maxLength) {
  const n = points.length
  if (n < 2) return
  const tip = atStart ? points[0] : points[n - 1]
  const back = atStart
    ? points[Math.min(n - 1, 6)]
    : points[Math.max(0, n - 1 - 6)]
  if (hypot(tip[0] - back[0], tip[1] - back[1]) < 1e-6) return
  const direction = unit(tip[0] - back[0], tip[1] - back[1])
  const farthest = inkReach(tip, direction, raster, maxLength)
  if (!farthest) return
  if (atStart) points.unshift(farthest)
  else points.push(farthest)
}

/** The point of segment a–b nearest to p. */
function nearestOnSegment(p, a, b) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len = dx * dx + dy * dy
  let t = len === 0 ? 0 : ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len
  t = t < 0 ? 0 : t > 1 ? 1 : t
  return [a[0] + t * dx, a[1] + t * dy]
}

function withinOfStrokes(p, strokes, radius) {
  const r2 = radius * radius
  for (const { points } of strokes)
    for (let i = 1; i < points.length; i += 1)
      if (segmentDistanceSquared(p[0], p[1], points[i - 1], points[i]) <= r2)
        return true
  return false
}

/**
 * A blob (a dot of a colon, a middle dot) has no pen path to speak of: its
 * stroke scribbles from its centre to whatever a round chalk of this radius
 * would otherwise leave bare, each new vertex pulled inward by the radius.
 */
function scribble(centre, pixels, radius) {
  const points = [centre, [centre[0], centre[1]]]
  for (let round = 0; round < 24; round += 1) {
    let far = null
    let farDistance = radius * radius
    let nearest = null
    for (const p of pixels) {
      let best = Infinity
      let bestPoint = null
      for (let i = 1; i < points.length; i += 1) {
        const d = segmentDistanceSquared(p[0], p[1], points[i - 1], points[i])
        if (d < best) {
          best = d
          bestPoint = nearestOnSegment(p, points[i - 1], points[i])
        }
      }
      if (best > farDistance) {
        farDistance = best
        far = p
        nearest = bestPoint
      }
    }
    if (!far) break
    const d = Math.sqrt(farDistance)
    const pull = Math.max(0, radius - 2)
    points.push([
      far[0] + ((nearest[0] - far[0]) / d) * pull,
      far[1] + ((nearest[1] - far[1]) / d) * pull,
    ])
  }
  return points
}

/**
 * Traces the skeleton into polylines of pixel centres: branches between
 * junctions and ends, joined where the pen would carry on, cut where a hand
 * lifts, oriented and ordered the way a hand writes.
 */
function traceStrokes(skel, raster, squared, thicknessPx, spurs, ink) {
  const { W, H } = raster
  const radius = (thicknessPx * WIDTH_FACTOR) / 2
  const xy = (index) => [(index % W) + 0.5, Math.floor(index / W) + 0.5]

  // Blobs get a scribble instead of a skeleton.
  const strokes = []
  for (const blob of ink.blobs) {
    for (const index of blob.pixels) skel[index] = 0
    strokes.push({
      points: scribble(xy(blob.centre), blob.pixels.map(xy), radius * 0.95),
      closed: false,
      startFree: false,
      endFree: false,
      scribble: true,
    })
  }

  const degree = new Uint8Array(W * H)
  const pixels = []
  for (let y = 1; y < H - 1; y += 1)
    for (let x = 1; x < W - 1; x += 1) {
      const index = y * W + x
      if (!skel[index]) continue
      pixels.push(index)
      degree[index] = neighborsOf(skel, W, index).length
    }

  // Nodes: clusters of junction pixels, and single end or isolated pixels.
  const nodeOf = new Int32Array(W * H).fill(-1)
  const nodes = []
  for (const index of pixels) {
    if (degree[index] === 2 || nodeOf[index] !== -1) continue
    const id = nodes.length
    const members = [index]
    nodeOf[index] = id
    if (degree[index] >= 3) {
      const stack = [index]
      while (stack.length) {
        const at = stack.pop()
        for (const n of neighborsOf(skel, W, at))
          if (degree[n] >= 3 && nodeOf[n] === -1) {
            nodeOf[n] = id
            members.push(n)
            stack.push(n)
          }
      }
    }
    nodes.push({ pixels: members, junction: degree[index] >= 3 })
  }

  // Edges: chains of degree-2 pixels from one node to another, inclusive.
  const visited = new Uint8Array(W * H)
  let edges = []
  const seen = new Set()
  for (let id = 0; id < nodes.length; id += 1)
    for (const p of nodes[id].pixels)
      for (const q of neighborsOf(skel, W, p)) {
        if (nodeOf[q] !== -1) {
          if (nodeOf[q] === id) continue
          const key = p < q ? `${p}:${q}` : `${q}:${p}`
          if (seen.has(key)) continue
          seen.add(key)
          edges.push({ a: id, b: nodeOf[q], points: [p, q] })
          continue
        }
        if (visited[q]) continue
        const points = [p, q]
        visited[q] = 1
        let previous = p
        let current = q
        let end = -1
        for (;;) {
          const next = neighborsOf(skel, W, current).find((n) => n !== previous)
          if (next === undefined) break
          if (nodeOf[next] !== -1) {
            points.push(next)
            end = nodeOf[next]
            break
          }
          if (visited[next]) break
          visited[next] = 1
          points.push(next)
          previous = current
          current = next
        }
        if (end === -1) continue
        if (end === id && points.length <= 3) continue
        edges.push({ a: id, b: end, points })
      }

  // Loops with no node at all (an o).
  for (const index of pixels) {
    if (degree[index] !== 2 || visited[index]) continue
    const points = [index]
    visited[index] = 1
    let previous = -1
    let current = index
    for (;;) {
      const next = neighborsOf(skel, W, current).find(
        (n) => n !== previous && !visited[n],
      )
      if (next === undefined) break
      visited[next] = 1
      points.push(next)
      previous = current
      current = next
    }
    strokes.push({
      points: points.map(xy),
      closed: true,
      startFree: false,
      endFree: false,
    })
  }

  // Junctions closer than the stroke is wide are one junction: a stem
  // crossing a bar thins into two T's a few pixels apart.
  const parent = nodes.map((_, i) => i)
  const find = (i) => {
    while (parent[i] !== i) i = parent[i]
    return i
  }
  const mergeBelow = Math.max(6, thicknessPx * 0.75)
  edges = edges.filter((edge) => {
    if (
      edge.a !== edge.b &&
      nodes[edge.a].junction &&
      nodes[edge.b].junction &&
      chainLength(edge.points, W) < mergeBelow
    ) {
      parent[find(edge.a)] = find(edge.b)
      return false
    }
    return true
  })
  for (const edge of edges) {
    edge.a = find(edge.a)
    edge.b = find(edge.b)
  }

  // At each junction, pair the branch ends that continue most nearly
  // straight; a junction with only two branches is a cusp the pen runs through.
  const endKey = (edge, end) => `${edge}:${end}`
  const endsAt = new Map()
  edges.forEach((edge, i) => {
    for (const [node, end] of [
      [edge.a, 0],
      [edge.b, 1],
    ]) {
      if (!endsAt.has(node)) endsAt.set(node, [])
      endsAt.get(node).push([i, end])
    }
  })
  const directionOf = ([edge, end]) => {
    const { points } = edges[edge]
    const last = points.length - 1
    const k = Math.min(last, DIRECTION_PX)
    const from = xy(end === 0 ? points[0] : points[last])
    const to = xy(end === 0 ? points[k] : points[last - k])
    const length = hypot(to[0] - from[0], to[1] - from[1]) || 1
    return [(to[0] - from[0]) / length, (to[1] - from[1]) / length]
  }
  const partner = new Map()
  const pair = (p, q) => {
    partner.set(endKey(...p), q)
    partner.set(endKey(...q), p)
  }
  for (const [node, ends] of endsAt) {
    if (!nodes[node].junction) continue
    if (ends.length === 2) {
      pair(ends[0], ends[1])
      continue
    }
    const directions = ends.map(directionOf)
    const deviation = (i, j) =>
      degreesBetween(directions[i], [-directions[j][0], -directions[j][1]])
    const candidates = []
    for (let i = 0; i < ends.length; i += 1)
      for (let j = i + 1; j < ends.length; j += 1) {
        const off = deviation(i, j)
        if (off > MERGE_MAX_DEGREES) continue
        // Near-ties go to the pair that carries the pen in from the left.
        const leftward = Math.min(directions[i][0], directions[j][0])
        candidates.push([Math.round(off / 15), leftward, i, j])
      }
    candidates.sort(
      (p, q) => p[0] - q[0] || p[1] - q[1] || p[2] - q[2] || p[3] - q[3],
    )
    const used = new Set()
    for (const [, , i, j] of candidates) {
      if (used.has(i) || used.has(j)) continue
      used.add(i)
      used.add(j)
      pair(ends[i], ends[j])
    }
  }

  // Follow the pairings into strokes.
  const consumed = new Uint8Array(edges.length)
  const walk = (edge, end) => {
    const points = []
    let at = [edge, end]
    const startNode = end === 0 ? edges[edge].a : edges[edge].b
    let endNode
    let closed = false
    for (;;) {
      const [e, s] = at
      consumed[e] = 1
      const chain = s === 0 ? edges[e].points : [...edges[e].points].reverse()
      for (const p of chain) if (points[points.length - 1] !== p) points.push(p)
      endNode = s === 0 ? edges[e].b : edges[e].a
      const next = partner.get(endKey(e, 1 - s))
      if (!next) break
      if (consumed[next[0]]) {
        closed = true
        break
      }
      at = next
    }
    return {
      points: points.map(xy),
      closed,
      startFree: !closed && !nodes[startNode].junction,
      endFree: !closed && !nodes[endNode].junction,
    }
  }
  for (let edge = 0; edge < edges.length; edge += 1)
    for (const end of [0, 1]) {
      if (consumed[edge] || partner.has(endKey(edge, end))) continue
      strokes.push(walk(edge, end))
    }
  for (let edge = 0; edge < edges.length; edge += 1) {
    if (consumed[edge]) continue
    strokes.push({ ...walk(edge, 0), closed: true })
  }
  nodes.forEach((node, id) => {
    if (node.junction || endsAt.has(id)) return
    const point = xy(node.pixels[0])
    strokes.push({
      points: [point, [point[0], point[1]]],
      closed: false,
      startFree: true,
      endFree: true,
    })
  })

  // A hand starts the stroke that leaves a junction from the top of a short
  // stub above it rather than from the junction.
  for (const [node, ends] of endsAt) {
    if (!nodes[node].junction) continue
    for (const [edge, end] of ends) {
      const { a, b, points: chain } = edges[edge]
      if (a === b || chainLength(chain, W) > STUB_EM * PX_PER_EM) continue
      if (nodes[end === 0 ? b : a].junction || !partner.has(endKey(edge, end)))
        continue
      const outward = (end === 0 ? chain : [...chain].reverse()).map(xy)
      const base = outward[0]
      const tip = outward[outward.length - 1]
      if (tip[1] > base[1] - 4) continue
      for (const stroke of strokes) {
        if (stroke.closed || stroke.scribble) continue
        const { points } = stroke
        if (distanceSquared(points[0], base) <= 9) {
          stroke.points = [...outward].reverse().concat(points)
          stroke.startFree = true
        } else if (distanceSquared(points[points.length - 1], base) <= 9) {
          stroke.points = points.concat(outward)
          stroke.endFree = true
        }
      }
    }
  }

  // Cut at corners, orient, and extend free ends to the edge of the ink.
  const polylines = []
  for (const stroke of strokes) {
    if (stroke.scribble) {
      polylines.push(stroke)
      continue
    }
    for (const piece of shapeCorners(stroke, raster, squared, thicknessPx)) {
      let { points } = piece
      if (piece.closed && points.length > 2) {
        if (samePoint(points[0], points[points.length - 1]))
          points = points.slice(0, -1)
        // A loop starts at its top and heads left.
        let top = 0
        for (let i = 1; i < points.length; i += 1)
          if (
            points[i][1] < points[top][1] ||
            (points[i][1] === points[top][1] && points[i][0] > points[top][0])
          )
            top = i
        points = [...points.slice(top), ...points.slice(0, top)]
        const ahead = points[Math.min(points.length - 1, DIRECTION_PX)]
        const behind = points[Math.max(0, points.length - DIRECTION_PX)]
        if (ahead[0] > behind[0])
          points = [points[0], ...points.slice(1).reverse()]
        polylines.push({ points: [...points, points[0]], closed: true })
        continue
      }
      const oriented = orient({
        ...piece,
        points: points.map((p) => [p[0], p[1]]),
      })
      if (oriented.startFree)
        extendEnd(oriented.points, true, raster, thicknessPx)
      if (oriented.endFree)
        extendEnd(oriented.points, false, raster, thicknessPx)
      polylines.push({ points: oriented.points, closed: false })
    }
  }

  // A pruned tip the strokes leave bare is visited as a detour from where it
  // left: the top of a 1 above its flag, the bottom of a v.
  for (const spur of spurs) {
    const tip = xy(spur.tip)
    if (withinOfStrokes(tip, polylines, radius * 0.9)) continue
    const from = xy(spur.from)
    let best = null
    polylines.forEach(({ points }, s) =>
      points.forEach((p, i) => {
        const d = distanceSquared(p, from)
        if (!best || d < best.d) best = { s, i, d }
      }),
    )
    if (!best) continue
    const { points, closed } = polylines[best.s]
    if (!closed && best.i === 0) points.unshift(tip)
    else if (!closed && best.i === points.length - 1) points.push(tip)
    else
      points.splice(best.i + 1, 0, tip, [points[best.i][0], points[best.i][1]])
  }

  // Top to bottom, then left to right, by where each stroke starts; strokes
  // that start together go down before right, and the one that ends lower
  // first (a stem before the bar or bowl that leaves its top).
  const band = BAND_EM * PX_PER_EM
  const level = (u, v) => Math.abs(u - v) <= band
  polylines.sort((p, q) => {
    const a = p.points[0]
    const b = q.points[0]
    if (!level(a[1], b[1])) return a[1] - b[1]
    if (!level(a[0], b[0])) return a[0] - b[0]
    const down = downwardness(q.points) - downwardness(p.points)
    if (Math.abs(down) > 0.1) return down
    const endA = p.points[p.points.length - 1]
    const endB = q.points[q.points.length - 1]
    if (!level(endA[1], endB[1])) return endB[1] - endA[1]
    if (!level(endA[0], endB[0])) return endA[0] - endB[0]
    return polylineLength(q.points) - polylineLength(p.points)
  })
  return polylines
}

/** The ink's components, with the blobs (smaller than two stroke widths) and
 * the widest point of each. */
function inkComponents(raster, squared, thicknessPx) {
  const { mask, W, H } = raster
  const { label, count } = components(mask, W, H)
  const boxes = Array.from({ length: count }, () => [W, H, 0, 0])
  const centre = new Array(count).fill(-1)
  const pixels = Array.from({ length: count }, () => [])
  for (let y = 0; y < H; y += 1)
    for (let x = 0; x < W; x += 1) {
      const index = y * W + x
      const id = label[index]
      if (id === -1) continue
      const box = boxes[id]
      box[0] = Math.min(box[0], x)
      box[1] = Math.min(box[1], y)
      box[2] = Math.max(box[2], x)
      box[3] = Math.max(box[3], y)
      pixels[id].push(index)
      if (centre[id] === -1 || squared[index] > squared[centre[id]])
        centre[id] = index
    }
  const blobs = []
  for (let id = 0; id < count; id += 1) {
    const [x0, y0, x1, y1] = boxes[id]
    if (Math.max(x1 - x0, y1 - y0) + 1 < 2 * thicknessPx)
      blobs.push({ pixels: pixels[id], centre: centre[id] })
  }
  return { label, count, centre, blobs }
}

/** The whole automatic pipeline, in pixel coordinates. */
function autoStrokes(raster, squared, thicknessPx) {
  const { mask, W, H } = raster
  const skel = thin(mask, W, H)
  const spurs = prune(skel, W, H, SPUR_EM * PX_PER_EM)
  const ink = inkComponents(raster, squared, thicknessPx)
  // A component that thinned away entirely keeps its widest point.
  const hasSkeleton = new Uint8Array(ink.count)
  for (let i = 0; i < W * H; i += 1) if (skel[i]) hasSkeleton[ink.label[i]] = 1
  for (let id = 0; id < ink.count; id += 1)
    if (!hasSkeleton[id] && ink.centre[id] !== -1) skel[ink.centre[id]] = 1
  const polylines = traceStrokes(skel, raster, squared, thicknessPx, spurs, ink)
  return polylines.map(({ points }) => simplify(points, SIMPLIFY_PX))
}

// ---------------------------------------------------------------------------
// Coverage

function measureCoverage({ mask, W, H }, strokesPx, radius) {
  const segments = []
  for (const stroke of strokesPx)
    for (let i = 1; i < stroke.length; i += 1)
      segments.push([stroke[i - 1], stroke[i]])
  const uncovered = new Uint8Array(W * H)
  const r2 = radius * radius
  let ink = 0
  let covered = 0
  for (let y = 0; y < H; y += 1)
    for (let x = 0; x < W; x += 1) {
      const index = y * W + x
      if (!mask[index]) continue
      ink += 1
      const px = x + 0.5
      const py = y + 0.5
      let hit = false
      for (const [a, b] of segments)
        if (segmentDistanceSquared(px, py, a, b) <= r2) {
          hit = true
          break
        }
      if (hit) covered += 1
      else uncovered[index] = 1
    }
  return { coverage: ink ? covered / ink : 1, uncovered }
}

// ---------------------------------------------------------------------------
// PNG contact sheets (only with --preview)

const CRC_TABLE = new Int32Array(256)
for (let n = 0; n < 256; n += 1) {
  let c = n
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  CRC_TABLE[n] = c
}
function crc32(bytes) {
  let c = -1
  for (const byte of bytes) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ -1) >>> 0
}
function pngChunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}
function writePng(path, width, height, rgb) {
  const stride = width * 3
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0
    rgb.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8
  header[9] = 2
  writeFileSync(
    path,
    Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      pngChunk('IHDR', header),
      pngChunk('IDAT', deflateSync(raw)),
      pngChunk('IEND', Buffer.alloc(0)),
    ]),
  )
}

const PALETTE = [
  [30, 90, 220],
  [20, 150, 60],
  [230, 120, 20],
  [140, 40, 200],
  [0, 150, 160],
  [150, 90, 30],
  [220, 40, 140],
  [100, 110, 0],
]

function paintDisc(img, width, height, cx, cy, radius, color) {
  for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y += 1)
    for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x += 1) {
      if (x < 0 || y < 0 || x >= width || y >= height) continue
      if (hypot(x + 0.5 - cx, y + 0.5 - cy) > radius) continue
      img.set(color, (y * width + x) * 3)
    }
}

function paintSegment(img, width, height, a, b, halfWidth, color) {
  const x0 = Math.floor(Math.min(a[0], b[0]) - halfWidth)
  const x1 = Math.ceil(Math.max(a[0], b[0]) + halfWidth)
  const y0 = Math.floor(Math.min(a[1], b[1]) - halfWidth)
  const y1 = Math.ceil(Math.max(a[1], b[1]) + halfWidth)
  const r2 = halfWidth * halfWidth
  for (let y = Math.max(0, y0); y <= Math.min(height - 1, y1); y += 1)
    for (let x = Math.max(0, x0); x <= Math.min(width - 1, x1); x += 1)
      if (segmentDistanceSquared(x + 0.5, y + 0.5, a, b) <= r2)
        img.set(color, (y * width + x) * 3)
}

function writeContactSheets(dir, entries) {
  mkdirSync(dir, { recursive: true })
  const columns = 6
  const perSheet = 24
  const cellW = Math.max(...entries.map((e) => e.raster.W)) + 8
  const cellH = Math.max(...entries.map((e) => e.raster.H)) + 8
  for (let sheet = 0; sheet * perSheet < entries.length; sheet += 1) {
    const page = entries.slice(sheet * perSheet, (sheet + 1) * perSheet)
    const rows = Math.ceil(page.length / columns)
    const width = columns * cellW
    const height = rows * cellH
    const img = Buffer.alloc(width * height * 3, 255)
    page.forEach((entry, i) => {
      const { raster, strokesPx, uncovered, source } = entry
      const left = (i % columns) * cellW + 4
      const top = Math.floor(i / columns) * cellH + 4
      for (let y = 0; y < raster.H; y += 1)
        for (let x = 0; x < raster.W; x += 1) {
          const index = y * raster.W + x
          if (!raster.mask[index]) continue
          const at = ((top + y) * width + left + x) * 3
          if (uncovered[index]) img.set([235, 70, 70], at)
          else img.set([205, 205, 205], at)
        }
      strokesPx.forEach((stroke, s) => {
        const color = PALETTE[s % PALETTE.length]
        const shifted = stroke.map((p) => [p[0] + left, p[1] + top])
        for (let k = 1; k < shifted.length; k += 1)
          paintSegment(
            img,
            width,
            height,
            shifted[k - 1],
            shifted[k],
            1.5,
            color,
          )
        paintDisc(img, width, height, shifted[0][0], shifted[0][1], 5, color)
        paintDisc(
          img,
          width,
          height,
          shifted[0][0],
          shifted[0][1],
          2,
          [255, 255, 255],
        )
        const end = shifted[shifted.length - 1]
        paintDisc(img, width, height, end[0], end[1], 3, [0, 0, 0])
      })
      if (source === 'hand')
        for (let y = 0; y < 8; y += 1)
          for (let x = 0; x < 8; x += 1)
            img.set([0, 0, 0], ((top + y) * width + left + x) * 3)
      // Cell frame.
      for (let x = 0; x < cellW; x += 1) {
        img.set([225, 225, 225], ((top - 4) * width + left - 4 + x) * 3)
      }
      for (let y = 0; y < cellH; y += 1) {
        img.set([225, 225, 225], ((top - 4 + y) * width + left - 4) * 3)
      }
    })
    writePng(resolve(dir, `sheet-${sheet + 1}.png`), width, height, img)
  }
}

// ---------------------------------------------------------------------------
// Main

function sha256(data) {
  return createHash('sha256').update(data).digest('hex')
}

function loadFont() {
  const bytes = readFileSync(fontPath)
  const buffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  )
  return { font: opentype.parse(buffer), sha: sha256(bytes) }
}

function loadOverrides() {
  const file = JSON.parse(readFileSync(overridesPath, 'utf8'))
  if (file.unitsPerEm !== OVERRIDE_EM)
    throw new Error(`Overrides must be in a ${OVERRIDE_EM}-unit em`)
  for (const [char, entry] of Object.entries(file.glyphs)) {
    if (!Array.isArray(entry.strokes) || !entry.strokes.length)
      throw new Error(`Override for ${JSON.stringify(char)} has no strokes`)
    for (const stroke of entry.strokes) {
      if (!Array.isArray(stroke) || stroke.length < 2)
        throw new Error(
          `A stroke of ${JSON.stringify(char)} has fewer than two points`,
        )
      for (const point of stroke)
        if (
          !Array.isArray(point) ||
          point.length !== 2 ||
          !point.every(Number.isFinite)
        )
          throw new Error(`A point of ${JSON.stringify(char)} is not [x, y]`)
    }
  }
  return file
}

function main() {
  const { font, sha: fontSha256 } = loadFont()
  const unitsPerEm = font.unitsPerEm
  const scale = PX_PER_EM / unitsPerEm
  const overrides = loadOverrides()
  const os2 = font.tables.os2 ?? {}
  const chars = [...new Set(sixtyWords.join(''))]
    .filter((char) => char !== ' ')
    .sort((a, b) => a.codePointAt(0) - b.codePointAt(0))

  const glyphOf = (char) => {
    const index = font.charToGlyphIndex(char)
    if (!index)
      throw new Error(
        `The font has no glyph for ${JSON.stringify(char)} (U+${char
          .codePointAt(0)
          .toString(16)
          .toUpperCase()
          .padStart(4, '0')}); nothing is substituted.`,
      )
    return font.glyphs.get(index)
  }

  const glyphs = {}
  const previews = []
  const failures = []
  const dump = {}
  for (const char of chars) {
    const glyph = glyphOf(char)
    const path = glyph.getPath(0, 0, unitsPerEm)
    const raster = rasterize(path, unitsPerEm)
    const { squared, maxDistance } = distanceTransform(raster)
    const thicknessPx = 2 * maxDistance
    const override = overrides.glyphs[char]
    let strokes
    if (override) {
      const factor = unitsPerEm / OVERRIDE_EM
      strokes = override.strokes.map((stroke) =>
        stroke.map(([x, y]) => [round1(x * factor), round1(y * factor)]),
      )
    } else {
      strokes = autoStrokes(raster, squared, thicknessPx).map((stroke) =>
        stroke.map(([x, y]) => raster.toFont(x, y).map(round1)),
      )
    }
    if (dumpChars !== null && dumpChars.includes(char))
      dump[char] = {
        why: '',
        strokes: strokes.map((stroke) =>
          stroke.map(([x, y]) => [
            Math.round((x * OVERRIDE_EM) / unitsPerEm),
            Math.round((y * OVERRIDE_EM) / unitsPerEm),
          ]),
        ),
      }
    const strokesPx = strokes.map((stroke) =>
      stroke.map(([x, y]) => raster.toPx(x, y)),
    )
    const { coverage, uncovered } = measureCoverage(
      raster,
      strokesPx,
      (thicknessPx * WIDTH_FACTOR) / 2,
    )
    const bbox = raster.bbox
    glyphs[char] = {
      advance: glyph.advanceWidth,
      path: compactPath(path.toPathData(1)),
      bbox: {
        x1: round1(bbox.x1),
        y1: round1(bbox.y1),
        x2: round1(bbox.x2),
        y2: round1(bbox.y2),
      },
      thickness: round1(thicknessPx / scale),
      strokes,
      coverage: Math.round(coverage * 10000) / 10000,
      source: override ? 'hand' : 'auto',
    }
    if (coverage < COVERAGE_MIN) failures.push([char, coverage])
    previews.push({
      char,
      raster,
      strokesPx,
      uncovered,
      source: glyphs[char].source,
    })
  }

  const words = sixtyWords.map((text) => {
    const placed = []
    let x = 0
    let previous = null
    for (const char of text) {
      const glyph = glyphOf(char)
      if (previous) x += font.getKerningValue(previous, glyph)
      placed.push({ char, x: round1(x) })
      x += glyph.advanceWidth
      previous = glyph
    }
    return { text, width: round1(x), glyphs: placed }
  })

  const data = {
    font: FONT_FILE,
    fontSha256,
    unitsPerEm,
    ascender: font.ascender,
    descender: font.descender,
    capHeight: Number.isFinite(os2.sCapHeight) ? os2.sCapHeight : null,
    xHeight: Number.isFinite(os2.sxHeight) ? os2.sxHeight : null,
    wordsSha256: sha256(JSON.stringify(sixtyWords)),
    glyphs,
    words,
  }

  const table = chars.map((char) => {
    const g = glyphs[char]
    return `  ${JSON.stringify(char).padEnd(5)} ${g.source.padEnd(4)} strokes ${String(g.strokes.length).padStart(2)}  thickness ${String(g.thickness).padStart(6)}  coverage ${g.coverage.toFixed(4)}`
  })
  console.log(table.join('\n'))

  if (previewDir !== null) {
    writeContactSheets(resolve(previewDir), previews)
    console.log(
      `Contact sheets in ${resolve(previewDir)}: ${chars.map((c, i) => `${i + 1}=${c}`).join(' ')}`,
    )
  }
  if (dumpChars !== null) console.log(JSON.stringify(dump, null, 2))

  if (failures.length)
    throw new Error(
      `Coverage under ${COVERAGE_MIN}: ${failures
        .map(
          ([char, coverage]) =>
            `${JSON.stringify(char)} ${coverage.toFixed(4)}`,
        )
        .join(', ')}`,
    )

  const json = formatJson(data)
  writeFileSync(outPath, json)
  console.log(
    `Wrote ${outPath} (${(Buffer.byteLength(json) / 1024).toFixed(1)} KB, ${chars.length} glyphs, ${words.length} words)`,
  )
}

/** Compact but readable: one stroke per line, one placed word per line. */
function formatJson(data) {
  const lines = ['{']
  const scalar = (key, value) =>
    `  ${JSON.stringify(key)}: ${JSON.stringify(value)},`
  for (const key of [
    'font',
    'fontSha256',
    'unitsPerEm',
    'ascender',
    'descender',
    'capHeight',
    'xHeight',
    'wordsSha256',
  ])
    lines.push(scalar(key, data[key]))
  lines.push('  "glyphs": {')
  const chars = Object.keys(data.glyphs).sort(
    (a, b) => a.codePointAt(0) - b.codePointAt(0),
  )
  chars.forEach((char, i) => {
    const g = data.glyphs[char]
    lines.push(`    ${JSON.stringify(char)}: {`)
    lines.push(`      "advance": ${JSON.stringify(g.advance)},`)
    lines.push(`      "path": ${JSON.stringify(g.path)},`)
    lines.push(`      "bbox": ${JSON.stringify(g.bbox)},`)
    lines.push(`      "thickness": ${JSON.stringify(g.thickness)},`)
    lines.push('      "strokes": [')
    g.strokes.forEach((stroke, s) => {
      lines.push(
        `        ${JSON.stringify(stroke)}${s + 1 < g.strokes.length ? ',' : ''}`,
      )
    })
    lines.push('      ],')
    lines.push(`      "coverage": ${JSON.stringify(g.coverage)},`)
    lines.push(`      "source": ${JSON.stringify(g.source)}`)
    lines.push(`    }${i + 1 < chars.length ? ',' : ''}`)
  })
  lines.push('  },')
  lines.push('  "words": [')
  data.words.forEach((word, i) => {
    lines.push(
      `    ${JSON.stringify(word)}${i + 1 < data.words.length ? ',' : ''}`,
    )
  })
  lines.push('  ]')
  lines.push('}')
  return `${lines.join('\n')}\n`
}

main()
