import type { Point } from './doodle-path'

/**
 * Chalk marks in a link: `#ink=v1…`, the fragment only, never the query.
 * Strokes are simplified, quantized to whole pixels relative to the content
 * area, delta-encoded as zigzag varints, deflated when the browser can, and
 * written as base64url behind one flag byte. The content area's width goes
 * in with them, so a screen of about the same width draws them scaled and a
 * very different one leaves them out.
 */
export interface Ink {
  /** The content area's width when the marks were drawn. */
  readonly width: number
  readonly strokes: readonly (readonly Point[])[]
}

export const inkPrefix = '#ink=v1'
/** The fragment never grows past this: the board is full then. */
export const inkLimit = 4000
/** A width within this of the drawn one shows the marks, scaled. */
export const inkTolerance = 0.15
/** A finger or a pointer this close to a stroke rubs it out. */
export const eraserReach = 12

const flagDeflated = 1
const mostStrokes = 10_000
const mostPoints = 100_000

/** Whole pixels, with the points that add nothing to the line left out. */
export function simplifyStroke(points: readonly Point[], epsilon = 1): Point[] {
  const rounded: Point[] = []
  for (const point of points) {
    const next = { x: Math.round(point.x), y: Math.round(point.y) }
    const last = rounded[rounded.length - 1]
    if (!last || last.x !== next.x || last.y !== next.y) rounded.push(next)
  }
  if (rounded.length < 3) return rounded
  // Ramer–Douglas–Peucker: keep the point farthest from the chord while it
  // is farther than epsilon, on each side, iteratively.
  const keep = new Array<boolean>(rounded.length).fill(false)
  keep[0] = true
  keep[rounded.length - 1] = true
  const stack: [number, number][] = [[0, rounded.length - 1]]
  while (stack.length) {
    const [from, to] = stack.pop()!
    let farthest = 0
    let at = -1
    for (let index = from + 1; index < to; index += 1) {
      const distance = segmentDistance(
        rounded[index]!,
        rounded[from]!,
        rounded[to]!,
      )
      if (distance > farthest) {
        farthest = distance
        at = index
      }
    }
    if (at >= 0 && farthest > epsilon) {
      keep[at] = true
      stack.push([from, at], [at, to])
    }
  }
  return rounded.filter((_, index) => keep[index])
}

/** How far a point is from the segment between two others. */
export function segmentDistance(point: Point, from: Point, to: Point): number {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = dx * dx + dy * dy
  const t =
    length === 0
      ? 0
      : Math.max(
          0,
          Math.min(
            1,
            ((point.x - from.x) * dx + (point.y - from.y) * dy) / length,
          ),
        )
  return Math.hypot(point.x - (from.x + t * dx), point.y - (from.y + t * dy))
}

/** Whether rubbing at this point, with this reach, touches the stroke. */
export function strokeTouches(
  stroke: readonly Point[],
  point: Point,
  reach: number,
): boolean {
  const first = stroke[0]
  if (!first) return false
  if (stroke.length === 1)
    return Math.hypot(point.x - first.x, point.y - first.y) <= reach
  for (let index = 1; index < stroke.length; index += 1)
    if (segmentDistance(point, stroke[index - 1]!, stroke[index]!) <= reach)
      return true
  return false
}

/** The factor that draws marks made at their width on this one, or null when the widths are too far apart. */
export function inkScale(drawnWidth: number, width: number): number | null {
  if (!(drawnWidth > 0) || !(width > 0)) return null
  const scale = width / drawnWidth
  return Math.abs(scale - 1) <= inkTolerance ? scale : null
}

// --- bytes: unsigned varints, zigzag for the signed deltas ---

function zigzag(value: number): number {
  return value < 0 ? -2 * value - 1 : 2 * value
}
function unzigzag(value: number): number {
  return value % 2 === 1 ? -(value + 1) / 2 : value / 2
}

class ByteWriter {
  private bytes: number[] = []
  varint(value: number) {
    let rest = Math.max(0, Math.floor(value))
    while (rest >= 0x80) {
      this.bytes.push((rest % 0x80) | 0x80)
      rest = Math.floor(rest / 0x80)
    }
    this.bytes.push(rest)
  }
  signed(value: number) {
    this.varint(zigzag(Math.round(value)))
  }
  done(): Uint8Array<ArrayBuffer> {
    return Uint8Array.from(this.bytes)
  }
}

class ByteReader {
  private at = 0
  constructor(private readonly bytes: Uint8Array) {}
  get left(): number {
    return this.bytes.length - this.at
  }
  varint(): number | null {
    let value = 0
    let scale = 1
    for (let count = 0; count < 8; count += 1) {
      const byte = this.bytes[this.at]
      if (byte === undefined) return null
      this.at += 1
      value += (byte & 0x7f) * scale
      if (byte < 0x80) return value
      scale *= 0x80
    }
    return null
  }
  signed(): number | null {
    const value = this.varint()
    return value === null ? null : unzigzag(value)
  }
}

export function inkToBytes(ink: Ink): Uint8Array<ArrayBuffer> {
  const writer = new ByteWriter()
  writer.varint(ink.width)
  writer.varint(ink.strokes.length)
  for (const stroke of ink.strokes) {
    writer.varint(stroke.length)
    let last = { x: 0, y: 0 }
    for (const point of stroke) {
      writer.signed(point.x - last.x)
      writer.signed(point.y - last.y)
      last = point
    }
  }
  return writer.done()
}

export function bytesToInk(bytes: Uint8Array): Ink | null {
  const reader = new ByteReader(bytes)
  const width = reader.varint()
  const count = reader.varint()
  if (width === null || count === null || count > mostStrokes) return null
  const strokes: Point[][] = []
  let points = 0
  for (let index = 0; index < count; index += 1) {
    const length = reader.varint()
    if (length === null || length === 0) return null
    points += length
    if (points > mostPoints) return null
    const stroke: Point[] = []
    let last = { x: 0, y: 0 }
    for (let at = 0; at < length; at += 1) {
      const dx = reader.signed()
      const dy = reader.signed()
      if (dx === null || dy === null) return null
      last = { x: last.x + dx, y: last.y + dy }
      stroke.push(last)
    }
    strokes.push(stroke)
  }
  if (reader.left !== 0) return null
  return { width, strokes }
}

// --- base64url ---

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9_-]*$/.test(text)) return null
  const base64 = text.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  try {
    const binary = atob(padded)
    const bytes = new Uint8Array(binary.length)
    for (let index = 0; index < binary.length; index += 1)
      bytes[index] = binary.charCodeAt(index)
    return bytes
  } catch {
    return null
  }
}

// --- deflate, where the browser has it ---

type ByteStream = {
  readonly readable: ReadableStream<Uint8Array>
  readonly writable: WritableStream<BufferSource>
}

/** More than this out of a stream is no page of chalk marks. */
const mostBytes = 1 << 20

async function pump(
  bytes: Uint8Array<ArrayBuffer>,
  stream: ByteStream,
): Promise<Uint8Array<ArrayBuffer>> {
  const writer = stream.writable.getWriter()
  // A damaged stream fails on the reading side; the writer's own failure
  // then says nothing new, and must not go unheard.
  const written = writer
    .write(bytes)
    .then(() => writer.close())
    .catch(() => undefined)
  const reader = stream.readable.getReader()
  const chunks: Uint8Array[] = []
  let length = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    length += value.length
    if (length > mostBytes) {
      await reader.cancel()
      throw new Error('too long')
    }
  }
  await written
  const out = new Uint8Array(length)
  let at = 0
  for (const chunk of chunks) {
    out.set(chunk, at)
    at += chunk.length
  }
  return out
}

async function deflate(
  bytes: Uint8Array<ArrayBuffer>,
): Promise<Uint8Array<ArrayBuffer> | null> {
  if (typeof CompressionStream !== 'function') return null
  try {
    return await pump(bytes, new CompressionStream('deflate-raw'))
  } catch {
    return null
  }
}

async function inflate(
  bytes: Uint8Array<ArrayBuffer>,
): Promise<Uint8Array<ArrayBuffer> | null> {
  if (typeof DecompressionStream !== 'function') return null
  try {
    return await pump(bytes, new DecompressionStream('deflate-raw'))
  } catch {
    return null
  }
}

/** The fragment for these marks, deflated when that is shorter and possible. */
export async function encodeInk(ink: Ink): Promise<string> {
  const raw = inkToBytes(ink)
  const deflated = await deflate(raw)
  const payload =
    deflated && deflated.length < raw.length
      ? Uint8Array.from([flagDeflated, ...deflated])
      : Uint8Array.from([0, ...raw])
  return `${inkPrefix}${toBase64Url(payload)}`
}

/** The marks in a fragment, or null for anything that is not ours or is damaged. */
export async function decodeInk(hash: string): Promise<Ink | null> {
  if (!hash.startsWith(inkPrefix) || hash.length > inkLimit) return null
  const payload = fromBase64Url(hash.slice(inkPrefix.length))
  if (!payload || payload.length < 2) return null
  const flags = payload[0]!
  const body = payload.subarray(1)
  const bytes = flags & flagDeflated ? await inflate(body) : body
  return bytes ? bytesToInk(bytes) : null
}

/** Whether a fragment carries chalk marks. */
export function isInkFragment(hash: string): boolean {
  return hash.startsWith(inkPrefix)
}
