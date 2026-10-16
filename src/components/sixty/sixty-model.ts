/**
 * The board as the chalk draws it: every mark measured once (lines
 * flattened, wobbled and measured; letters laid out from the glyph data
 * with their pen strokes), then scheduled within its chapter so that each
 * stroke takes the time its length asks for, each letter is written along
 * its own strokes, and the stick has time to travel between marks. The
 * result is a timeline the frames read; they measure nothing.
 */
import {
  CLEAR_SECONDS,
  ERASE_END,
  ERASE_START,
  SCENE_TWO,
  boards,
  loopPath,
  starPath,
  tickPath,
  yearMarks,
  type Arrangement,
} from './sixty-drawing'
import { sixtyGlyphs } from './sixty-glyphs'
import {
  at,
  layouts,
  type Label,
  type MarkKey,
  type Star,
} from './sixty-layout'
import { sixtyChapters, sixtyLength } from './sixty-script'
import {
  arc,
  along,
  distance,
  ease,
  flatten,
  measure,
  pathOf,
  seeded,
  wobble,
  type Point,
  type Stroke,
} from './sixty-strokes'

/** How fast the chalk moves along a line, in board units a second, at 1×. */
export const STROKE_SPEED = 400
/** No stroke of a line takes less than this, however short. */
export const STROKE_FLOOR = 0.2
/** A line's pace when its chapter is short of time. */
const QUICK_STROKE_SPEED = 600
/** The chalk's pace through a letter's ink, in board units a second. */
export const LETTER_SPEED = 650
/** No stroke of a letter takes less than this. */
const LETTER_STROKE_FLOOR = 0.02
/** Small words can go this fast, and no faster. */
export const LETTERS_PER_SECOND = 25
/** The lifts: between the strokes of a letter, between letters, between words, and at least this between the strokes of a line. */
const GLYPH_LIFT = 0.01
const LETTER_LIFT = 0.025
const WORD_LIFT = 0.06
const LINE_LIFT = 0.03
/** The stick's travel between marks: by distance, within these bounds. */
const TRAVEL_SPEED = 1500
export const TRAVEL_MIN = 0.15
export const TRAVEL_MAX = 0.35
/** A hop between two strokes of one line, when they are apart: a little slower. */
const HOP_SPEED = 1200
/** A hand's wobble, in board units. */
const WOBBLE = 1.5
/** The stick comes in from the lower right at 0:00 and leaves the same way before 1:00. */
export const ENTER_SECONDS = 0.8
export const EXIT_SECONDS = 0.7
/** Dust: a speck this often while drawing, each drifting this far and fading within a second. */
const DUST_EVERY = 0.045
export const DUST_MAX = 40

export type Tone = 'y' | 'dim' | undefined

export interface GlyphModel {
  readonly char: string
  /** The outline's placement: translate then scale, from font units. */
  readonly x: number
  readonly y: number
  readonly scale: number
  /** The pen strokes in board units, measured. */
  readonly strokes: readonly Stroke[]
  /** The mask's stroke width: the glyph's thickest stroke, and a little. */
  readonly width: number
  /** The ink along every stroke. */
  readonly length: number
}

export interface WordMark {
  readonly kind: 'word'
  readonly key: MarkKey
  readonly text: string
  readonly tone: Tone
  readonly size: number
  /** The word's box in board units, for its mask. */
  readonly box: { x: number; y: number; width: number; height: number }
  readonly glyphs: readonly GlyphModel[]
}

export interface StrokeMark {
  readonly kind: 'stroke'
  readonly key: MarkKey
  readonly className: string
  /** Path data of the wobbled strokes, one subpath each. */
  readonly d: string
  readonly strokes: readonly Stroke[]
  /** Ticks: many tiny taps that share the mark's time, with no floor. */
  readonly taps: boolean
  /** The grain along the line: a dash pattern with small gaps, or none for a dashed line. */
  readonly grain: string | null
  /** The line's width, for its mask's stroke. */
  readonly width: number
}

export type Mark = WordMark | StrokeMark

/** One movement of the chalk inside a mark, in the drawing's seconds. */
export interface Piece {
  readonly kind: 'stroke' | 'lift'
  /** The glyph (a word; 0 for a line) and the stroke within it. */
  readonly glyph: number
  readonly stroke: number
  readonly length: number
  /** At the natural pace, before the schedule quickens it. */
  readonly seconds: number
  /** A hop between two strokes of a line keeps its time when the mark is quickened. */
  readonly floor: number
  t0: number
  t1: number
}

export interface Scheduled {
  readonly mark: Mark
  readonly index: number
  /** The chapter the mark belongs to, and stays in. */
  readonly chapter: number
  /** When the mockup draws it, and for how long. */
  readonly declared: number
  readonly slot: number
  /** The clock's hand or a pulse depends on it: it starts when declared. */
  readonly anchor: boolean
  start: number
  end: number
  readonly pieces: Piece[]
  /** Where the chalk lands first, and where it lifts last. */
  readonly from: Point
  readonly to: Point
  /** The ink of the whole mark. */
  readonly length: number
}

export type MoveKind =
  'enter' | 'draw' | 'lift' | 'travel' | 'rest' | 'out' | 'away' | 'in' | 'exit'

/** Where the stick is between two times: drawing a stroke, hopping, travelling, resting or off the board. */
export interface Move {
  readonly kind: MoveKind
  readonly t0: number
  readonly t1: number
  readonly from: Point
  readonly to: Point
  /** 'draw': the stroke under the chalk, its mark, and the width of its bright tip. */
  readonly stroke?: Stroke
  readonly mark?: number
  readonly width?: number
}

/** A speck of dust: born at a time and place, drifting so far, gone within its life. */
export interface Speck {
  readonly t: number
  readonly x: number
  readonly y: number
  readonly dx: number
  readonly dy: number
  readonly life: number
  readonly r: number
}

export interface Wipe {
  readonly strokes: readonly Stroke[]
  readonly length: number
}

export interface BoardModel {
  readonly arrangement: Arrangement
  readonly marks: readonly Scheduled[]
  /** The stick's whole minute, in order, with no gaps from the clearing pass to 1:00. */
  readonly moves: readonly Move[]
  /** Sorted by birth. */
  readonly dust: readonly Speck[]
  /** Smudge's strokes, measured: scene 1's erase and the clearing pass. */
  readonly erase: Wipe
  readonly clear: Wipe
  /** Off the board, at the lower right. */
  readonly offstage: Point
}

/** Where the chalk is at one instant. */
export interface StickState {
  readonly x: number
  readonly y: number
  /** On the board, drawing. */
  readonly drawing: boolean
  /** How far it is lifted: 0 on the board, 1 at the top of a travel. */
  readonly lift: number
  /** Off the board entirely. */
  readonly away: boolean
  readonly move: Move
  /** How far along the stroke under the chalk, in units, while drawing. */
  readonly drawn: number
}

const clampTravel = (seconds: number) =>
  Math.min(TRAVEL_MAX, Math.max(TRAVEL_MIN, seconds))

/** A small deterministic hash for the wobble's seed. */
function seedOf(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** The grain along a line: a seeded dash pattern, mostly on, with small gaps. */
function grainOf(seed: number, length: number): string {
  const next = seeded(seed)
  const parts: string[] = []
  let total = 0
  while (total < length + 20 && parts.length < 80) {
    const on = 5 + next() * 10
    const off = 0.5 + next() * 0.9
    parts.push(on.toFixed(1), off.toFixed(1))
    total += on + off
  }
  return parts.join(' ')
}

/** The line widths of the board's classes, for the masks that reveal them. */
function lineWidth(className: string): number {
  if (className.includes('tick')) return 1.5
  if (className.includes('dim')) return 2
  return 2.6
}

function strokeMark(
  key: MarkKey,
  d: string,
  className: string,
  options: { taps?: boolean; wobble?: boolean } = {},
): StrokeMark {
  const seed = seedOf(key)
  const polylines = flatten(d)
  const strokes = polylines.map((points, index) =>
    measure(
      options.wobble === false
        ? points
        : wobble(points, WOBBLE, seed + index * 7919),
    ),
  )
  const dashed = className.includes('dash')
  const length = strokes.reduce((sum, stroke) => sum + stroke.length, 0)
  return {
    kind: 'stroke',
    key,
    className,
    d: strokes.map((stroke) => pathOf(stroke.points)).join(' '),
    strokes,
    taps: options.taps ?? false,
    grain: dashed || options.taps ? null : grainOf(seed, length),
    width: lineWidth(className),
  }
}

const { unitsPerEm } = sixtyGlyphs

function wordMark(
  key: MarkKey,
  text: string,
  label: Label,
  tone: Tone,
): WordMark {
  const word = sixtyGlyphs.words.find((item) => item.text === text)
  if (!word) throw new Error(`No glyphs for "${text}"`)
  const scale = label.size / unitsPerEm
  const width = word.width * scale
  const left =
    label.anchor === 'middle'
      ? label.x - width / 2
      : label.anchor === 'end'
        ? label.x - width
        : label.x
  const glyphs: GlyphModel[] = []
  let top = Infinity
  let bottom = -Infinity
  let pad = 0
  for (const placed of word.glyphs) {
    const glyph = sixtyGlyphs.glyphs[placed.char]
    if (!glyph) continue
    const x = left + placed.x * scale
    const y = label.y
    const strokes = glyph.strokes.map((stroke) =>
      measure(stroke.map((p): Point => [x + p[0] * scale, y + p[1] * scale])),
    )
    const penWidth = glyph.thickness * 1.05 * scale
    pad = Math.max(pad, penWidth / 2 + 1)
    top = Math.min(top, y + glyph.bbox.y1 * scale)
    bottom = Math.max(bottom, y + glyph.bbox.y2 * scale)
    glyphs.push({
      char: placed.char,
      x,
      y,
      scale,
      strokes,
      width: penWidth,
      length: strokes.reduce((sum, stroke) => sum + stroke.length, 0),
    })
  }
  return {
    kind: 'word',
    key,
    text,
    tone,
    size: label.size,
    box: {
      x: left - pad,
      y: top - pad,
      width: width + pad * 2,
      height: bottom - top + pad * 2,
    },
    glyphs,
  }
}

/** The marks in writing order, with the words and tones of the board. */
function marksOf(arrangement: Arrangement): Mark[] {
  const l = layouts[arrangement]
  const { dial } = boards[arrangement]
  const star = (s: Star) => starPath(s.x, s.y, s.outer, s.inner)
  return [
    wordMark('dod', 'DoD', l.dod, undefined),
    wordMark('shares', 'shares information', l.shares, 'dim'),
    strokeMark('arrow1', l.arrow1, 'ln y'),
    wordMark('company', 'your company', l.company, undefined),
    wordMark('fci', 'FCI', l.fci, undefined),
    strokeMark('arrowFci', l.arrowFci, 'ln y'),
    wordMark('level1', 'Level 1', l.level1, 'y'),
    wordMark('rule1', '15 rules · self-assess yearly', l.rule1, 'dim'),
    wordMark('cui', 'CUI', l.cui, undefined),
    strokeMark('arrowCui', l.arrowCui, 'ln y'),
    wordMark('level2', 'Level 2', l.level2, 'y'),
    wordMark('rule2', '110 rules · NIST SP 800-171', l.rule2, 'dim'),
    wordMark('critical', 'critical CUI', l.critical, undefined),
    strokeMark('arrowCritical', l.arrowCritical, 'ln y'),
    wordMark('level3', 'Level 3', l.level3, 'y'),
    wordMark('rule3', 'Level 2 + 24 more · DIBCAC', l.rule3, 'dim'),
    strokeMark('circle', l.circle, 'ln y'),
    wordMark('runs', 'Level 2 runs on this clock', l.runs, 'dim'),
    strokeMark('dial', loopPath(dial.cx, dial.cy, dial.r), 'ln'),
    strokeMark('marks', yearMarks(dial), 'ln', { wobble: false }),
    strokeMark('ticks', tickPath(dial), 'ln dim tick', {
      taps: true,
      wobble: false,
    }),
    strokeMark('hub', loopPath(dial.cx, dial.cy, dial.hub), 'ln'),
    wordMark('sprs', 'SPRS', l.sprs, 'y'),
    wordMark('year1', 'year 1', l.year1, 'dim'),
    wordMark('year2', 'year 2', l.year2, 'dim'),
    wordMark('year3', 'year 3', l.year3, 'dim'),
    strokeMark('star', star(l.star), 'ln y'),
    wordMark('c3pao', 'C3PAO', l.c3pao, 'y'),
    strokeMark('certLine', l.certLine, 'ln dim dash'),
    wordMark('current', 'current', l.current, 'dim'),
    strokeMark('check1', l.check1, 'ln y'),
    wordMark('affirm', 'self-assess + affirm', l.affirm, undefined),
    strokeMark('check2', l.check2, 'ln y'),
    strokeMark('result2', l.result2, 'ln dim dash'),
    strokeMark('bolt', l.bolt, 'ln y'),
    strokeMark('burst', star(l.burst), 'ln y dash'),
    strokeMark('result3', l.result3, 'ln dim dash'),
    wordMark('change', 'significant change', l.change, undefined),
    wordMark('reassess', 'reassess now', l.reassess, 'y'),
    strokeMark('check3', l.check3, 'ln y'),
    strokeMark('result4', l.result4, 'ln dim dash'),
    strokeMark('recertArrow', l.recertArrow, 'ln y'),
    wordMark('recert', '3 yrs: recertify', l.recert, 'y'),
    strokeMark('box', l.box, 'ln y'),
    wordMark('bottom', 'no current status = no contract', l.bottom, 'y'),
  ]
}

/** The hop between two strokes of a line: brief when they touch, a travel when they are apart. */
function lineLift(mark: StrokeMark, index: number): number {
  const previous = mark.strokes[index - 1]!
  const next = mark.strokes[index]!
  return Math.min(
    TRAVEL_MAX,
    Math.max(
      LINE_LIFT,
      distance(previous.points[previous.points.length - 1]!, next.points[0]!) /
        HOP_SPEED,
    ),
  )
}

/** The pieces of a mark at their natural pace, from a start of zero. */
function piecesOf(mark: Mark): Piece[] {
  const pieces: Piece[] = []
  let clock = 0
  const add = (
    kind: Piece['kind'],
    glyph: number,
    stroke: number,
    length: number,
    seconds: number,
    floor = 0,
  ) => {
    pieces.push({
      kind,
      glyph,
      stroke,
      length,
      seconds,
      floor,
      t0: clock,
      t1: clock + seconds,
    })
    clock += seconds
  }
  if (mark.kind === 'stroke') {
    if (mark.taps) {
      const each = at[mark.key].seconds / Math.max(1, mark.strokes.length)
      mark.strokes.forEach((stroke, index) =>
        add('stroke', 0, index, stroke.length, each),
      )
      return pieces
    }
    mark.strokes.forEach((stroke, index) => {
      if (index > 0) {
        const hop = lineLift(mark, index)
        add('lift', 0, index, 0, hop, hop)
      }
      add(
        'stroke',
        0,
        index,
        stroke.length,
        Math.max(STROKE_FLOOR, stroke.length / STROKE_SPEED),
      )
    })
    return pieces
  }
  // A word: letter by letter, each along its own strokes, a brief lift
  // between letters and a longer one between words.
  const word = sixtyGlyphs.words.find((item) => item.text === mark.text)!
  let glyphIndex = 0
  let afterSpace = false
  for (const placed of word.glyphs) {
    if (placed.char === ' ') {
      afterSpace = true
      continue
    }
    const glyph = mark.glyphs[glyphIndex]!
    if (glyphIndex > 0)
      add('lift', glyphIndex, 0, 0, afterSpace ? WORD_LIFT : LETTER_LIFT)
    afterSpace = false
    glyph.strokes.forEach((stroke, index) => {
      if (index > 0) add('lift', glyphIndex, index, 0, GLYPH_LIFT)
      add(
        'stroke',
        glyphIndex,
        index,
        stroke.length,
        Math.max(LETTER_STROKE_FLOOR, stroke.length / LETTER_SPEED),
      )
    })
    glyphIndex += 1
  }
  return pieces
}

function strokeAt(mark: Mark, glyph: number, stroke: number): Stroke {
  return mark.kind === 'stroke'
    ? mark.strokes[stroke]!
    : mark.glyphs[glyph]!.strokes[stroke]!
}

function firstPoint(mark: Mark): Point {
  const stroke =
    mark.kind === 'stroke' ? mark.strokes[0] : mark.glyphs[0]?.strokes[0]
  return stroke?.points[0] ?? [0, 0]
}

function lastPoint(mark: Mark): Point {
  const stroke =
    mark.kind === 'stroke'
      ? mark.strokes[mark.strokes.length - 1]
      : mark.glyphs[mark.glyphs.length - 1]?.strokes.at(-1)
  return stroke?.points[stroke.points.length - 1] ?? [0, 0]
}

/**
 * Lays a mark's pieces out from `start` to take `seconds` in all: the
 * strokes and the brief lifts scaled together, the hops between a line's
 * strokes keeping their time.
 */
function place(item: Scheduled, start: number, seconds: number) {
  let natural = 0
  let floors = 0
  for (const piece of item.pieces) {
    natural += piece.seconds
    floors += piece.floor
  }
  const factor =
    natural - floors > 1e-9 ? (seconds - floors) / (natural - floors) : 1
  // To the microsecond, as the player keeps its time, so a frame that lands
  // on a start or an end is not a hair short of it.
  const exact = (value: number) => Math.round(value * 1e6) / 1e6
  let clock = start
  item.start = exact(start)
  for (const piece of item.pieces) {
    piece.t0 = exact(clock)
    clock += piece.floor + (piece.seconds - piece.floor) * factor
    piece.t1 = exact(clock)
  }
  item.end = exact(clock)
}

/** The least time a mark can take: small words at 25 letters a second, lines at a quick pace. */
function fastestOf(mark: Mark, natural: number): number {
  if (mark.kind === 'word') return mark.glyphs.length / LETTERS_PER_SECOND
  if (mark.taps) return natural * 0.5
  return mark.strokes.reduce(
    (sum, stroke, index) =>
      sum +
      Math.max(STROKE_FLOOR, stroke.length / QUICK_STROKE_SPEED) +
      (index ? lineLift(mark, index) : 0),
    0,
  )
}

/**
 * The time a mark would like: a word fills the mockup's slot for it (or
 * its natural time, where that is longer), quickened to the room before
 * the next mark's declared start; a line follows its length; the ticks
 * share their slot.
 */
function preferredOf(
  item: Scheduled,
  natural: number,
  fastest: number,
  room: number,
): number {
  if (item.mark.kind !== 'word') return natural
  return Math.max(fastest, Math.min(Math.max(natural, item.slot), room))
}

/**
 * Lays the marks out in order, each within its chapter. A mark starts when
 * the mockup says, or as soon as the stick can reach it, and takes its
 * preferred time. The anchored marks (the clock's hand and the pulses
 * depend on them) start exactly when declared; nothing crosses a chapter's
 * end, the erase, or the travel before an anchor. Where a run of marks
 * cannot fit, the marks in it start earlier than declared (never before
 * their chapter) and, only if that is not enough, are quickened together,
 * letters never past 25 a second and lines never under a fifth of a second
 * a stroke.
 */
function schedule(marks: Mark[]): Scheduled[] {
  const items: Scheduled[] = marks.map((mark, index) => {
    const timing = at[mark.key]
    const chapter = sixtyChapters.findIndex(
      (item) => timing.start >= item.start && timing.start < item.end,
    )
    const pieces = piecesOf(mark)
    return {
      mark,
      index,
      chapter: chapter < 0 ? sixtyChapters.length - 1 : chapter,
      declared: timing.start,
      slot: timing.seconds,
      anchor: timing.anchor === true,
      start: timing.start,
      end: timing.start + (pieces.at(-1)?.t1 ?? 0),
      pieces,
      from: firstPoint(mark),
      to: lastPoint(mark),
      length:
        mark.kind === 'stroke'
          ? mark.strokes.reduce((sum, stroke) => sum + stroke.length, 0)
          : mark.glyphs.reduce((sum, glyph) => sum + glyph.length, 0),
    }
  })
  const n = items.length
  const natural = items.map((item) => item.pieces.at(-1)?.t1 ?? 0)
  const fastest = items.map((item, index) =>
    Math.min(natural[index]!, fastestOf(item.mark, natural[index]!)),
  )
  const travel = items.map((item, index) =>
    index === 0
      ? 0
      : clampTravel(distance(items[index - 1]!.to, item.from) / TRAVEL_SPEED),
  )
  const beforeErase = (item: Scheduled) => item.declared < ERASE_START
  /** The earliest a mark may start: its chapter, and the clock after the erase. */
  const lo = items.map((item) =>
    Math.max(
      sixtyChapters[item.chapter]!.start,
      beforeErase(item) ? 0 : SCENE_TWO,
    ),
  )
  /** The latest a mark may end: its chapter, the erase, the travel before an anchor, the stick's exit. */
  const hi = items.map((item, index) => {
    let latest = Math.min(
      sixtyChapters[item.chapter]!.end,
      sixtyLength - EXIT_SECONDS,
    )
    if (beforeErase(item)) latest = Math.min(latest, ERASE_START)
    const next = items[index + 1]
    if (next?.anchor)
      latest = Math.min(latest, next.declared - travel[index + 1]!)
    return latest
  })
  const dur = items.map((item, index) => {
    const next = items[index + 1]
    const room =
      next && next.chapter === item.chapter
        ? next.declared - travel[index + 1]! - item.declared
        : Infinity
    return preferredOf(item, natural[index]!, fastest[index]!, room)
  })
  /** The latest start of a mark in a run that had to move, from the run's limit back. */
  const cap: number[] = items.map(() => Infinity)
  const start: number[] = items.map(() => 0)
  const end: number[] = items.map(() => 0)
  /** A run that cannot fit even at its fastest: its overrun is accepted, and the stick hurries. */
  const given = new Set<number>()
  const forward = (): number => {
    let cursor = -Infinity
    let broken = -1
    for (let index = 0; index < n; index += 1) {
      const item = items[index]
      start[index] = item!.anchor
        ? item!.declared
        : Math.max(
            lo[index]!,
            cursor + travel[index]!,
            Math.min(item!.declared, cap[index]!),
          )
      end[index] = start[index]! + dur[index]!
      cursor = end[index]!
      if (broken < 0 && !given.has(index) && end[index]! > hi[index]! + 1e-6)
        broken = index
    }
    return broken
  }
  const fix = (last: number) => {
    const chapter = items[last]!.chapter
    const side = beforeErase(items[last]!)
    let first = last
    while (
      first > 0 &&
      !items[first]!.anchor &&
      !items[first - 1]!.anchor &&
      items[first - 1]!.chapter === chapter &&
      beforeErase(items[first - 1]!) === side
    )
      first -= 1
    const earliest = Math.max(
      lo[first]!,
      first > 0 ? end[first - 1]! + travel[first]! : 0,
    )
    const caps = () => {
      let latest = hi[last]!
      for (let index = last; index >= first; index -= 1) {
        latest = Math.min(latest, hi[index]!)
        cap[index] = latest - dur[index]!
        latest = cap[index]! - travel[index]!
      }
    }
    caps()
    if (cap[first]! >= earliest - 1e-6) return
    // Starting earlier is not enough: quicken the run together, each mark
    // toward its fastest, until it fits (or as near as it can get).
    let travels = 0
    for (let index = first + 1; index <= last; index += 1)
      travels += travel[index]!
    const have = hi[last]! - earliest - travels
    const total = (factor: number) => {
      let sum = 0
      for (let index = first; index <= last; index += 1)
        sum += Math.max(fastest[index]!, dur[index]! * factor)
      return sum
    }
    let low = 0
    let high = 1
    for (let step = 0; step < 40; step += 1) {
      const mid = (low + high) / 2
      if (total(mid) > have) high = mid
      else low = mid
    }
    for (let index = first; index <= last; index += 1)
      dur[index] = Math.max(fastest[index]!, dur[index]! * low)
    caps()
    if (total(0) > have + 1e-6) given.add(last)
  }
  for (let pass = 0; pass < n * 4; pass += 1) {
    const broken = forward()
    if (broken < 0) break
    fix(broken)
  }
  forward()
  items.forEach((item, index) => place(item, start[index]!, dur[index]!))
  return items
}

/** The stick's moves for the whole minute: the enter, each mark's strokes and lifts, the travels, the rests, the erase, the exit. */
function movesOf(items: Scheduled[], offstage: Point): Move[] {
  const moves: Move[] = []
  let clock = -CLEAR_SECONDS
  let here: Point = offstage
  const push = (move: Move) => {
    if (move.t1 <= move.t0 + 1e-9) return
    if (move.t0 > clock + 1e-9)
      moves.push({ kind: 'rest', t0: clock, t1: move.t0, from: here, to: here })
    moves.push(move)
    clock = move.t1
    here = move.to
  }
  // Before 0:00 Smudge clears the board; the stick is off it.
  push({
    kind: 'away',
    t0: -CLEAR_SECONDS,
    t1: 0,
    from: offstage,
    to: offstage,
  })
  const first = items[0]!
  push({
    kind: 'enter',
    t0: 0,
    t1: Math.min(ENTER_SECONDS, first.start),
    from: offstage,
    to: first.from,
  })
  const eraseFrom = items.findIndex((item) => item.declared >= ERASE_END)
  items.forEach((item, index) => {
    const { mark } = item
    if (index === eraseFrom) {
      // Scene 1 is wiped: out to the lower right as Smudge comes in, back
      // as he leaves.
      const out = Math.min(clock + 0.3, ERASE_START + 0.2)
      push({ kind: 'out', t0: clock, t1: out, from: here, to: offstage })
      const back = item.start
      push({
        kind: 'away',
        t0: out,
        t1: Math.max(out, back - TRAVEL_MAX),
        from: offstage,
        to: offstage,
      })
      push({
        kind: 'in',
        t0: Math.max(out, back - TRAVEL_MAX),
        t1: back,
        from: offstage,
        to: item.from,
      })
    } else if (index > 0) {
      const seconds = clampTravel(distance(here, item.from) / TRAVEL_SPEED)
      push({
        kind: 'travel',
        t0: Math.max(clock, item.start - seconds),
        t1: item.start,
        from: here,
        to: item.from,
      })
    }
    for (const piece of item.pieces) {
      const stroke = strokeAt(mark, piece.glyph, piece.stroke)
      if (piece.kind === 'stroke') {
        push({
          kind: 'draw',
          t0: piece.t0,
          t1: piece.t1,
          from: stroke.points[0]!,
          to: stroke.points[stroke.points.length - 1]!,
          stroke,
          mark: index,
          width:
            mark.kind === 'word'
              ? mark.glyphs[piece.glyph]!.width * 0.55
              : mark.width + 0.4,
        })
      } else {
        push({
          kind: 'lift',
          t0: piece.t0,
          t1: piece.t1,
          from: here,
          to: stroke.points[0]!,
        })
      }
    }
  })
  push({
    kind: 'exit',
    t0: Math.max(clock, sixtyLength - EXIT_SECONDS),
    t1: sixtyLength,
    from: here,
    to: offstage,
  })
  return moves
}

/** A speck now and then while the chalk draws, each with its own drift. */
function dustOf(moves: Move[]): Speck[] {
  const random = seeded(0x5eed)
  const specks: Speck[] = []
  let nextAt = 0
  for (const move of moves) {
    if (move.kind !== 'draw' || !move.stroke) continue
    nextAt = Math.max(nextAt, move.t0)
    for (; nextAt < move.t1; nextAt += DUST_EVERY) {
      const t = nextAt
      const p = ease((t - move.t0) / (move.t1 - move.t0))
      const point = along(move.stroke, move.stroke.length * p)
      const angle = (random() - 0.5) * 0.9
      const far = 10 + random() * 20
      specks.push({
        t,
        x: point.x,
        y: point.y,
        dx: Math.sin(angle) * far,
        dy: Math.cos(angle) * far,
        life: 0.5 + random() * 0.4,
        r: 0.7 + random() * 0.8,
      })
    }
  }
  return specks
}

function wipeOf(d: string): Wipe {
  const strokes = flatten(d, 12).map((points) => measure(points))
  return {
    strokes,
    length: strokes.reduce((sum, stroke) => sum + stroke.length, 0),
  }
}

/** The point this far along a wipe's strokes, taken one after another. */
export function alongWipe(wipe: Wipe, length: number): Point {
  let left = Math.max(0, Math.min(wipe.length, length))
  for (const stroke of wipe.strokes) {
    if (left <= stroke.length) {
      const point = along(stroke, left)
      return [point.x, point.y]
    }
    left -= stroke.length
  }
  const last = wipe.strokes[wipe.strokes.length - 1]!
  const point = last.points[last.points.length - 1]!
  return point
}

const models = new Map<Arrangement, BoardModel>()

/** The board model for an arrangement, built once. */
export function boardModel(arrangement: Arrangement): BoardModel {
  const cached = models.get(arrangement)
  if (cached) return cached
  const g = boards[arrangement]
  const offstage: Point = [g.width + 50, g.height + 30]
  const marks = schedule(marksOf(arrangement))
  const moves = movesOf(marks, offstage)
  const model: BoardModel = {
    arrangement,
    marks,
    moves,
    dust: dustOf(moves),
    erase: wipeOf(g.erase),
    clear: wipeOf(g.clear),
    offstage,
  }
  models.set(arrangement, model)
  return model
}

/** The move under way at this time. */
export function moveAt(model: BoardModel, t: number): Move {
  const { moves } = model
  let lo = 0
  let hi = moves.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (moves[mid]!.t0 <= t) lo = mid
    else hi = mid - 1
  }
  return moves[lo]!
}

/** How far a lifted stick rises during a move, by its kind and how far through it is. */
function liftOf(move: Move, p: number): number {
  const seconds = move.t1 - move.t0
  switch (move.kind) {
    case 'draw':
      return 0
    case 'rest':
      return 0.5 * ease(seconds > 0 ? Math.min(1, (p * seconds) / 0.12) : 1)
    case 'lift':
      return Math.min(1, seconds / 0.08) * Math.sin(Math.PI * p)
    case 'travel':
      return p < 0.5 ? 0.5 + 0.5 * Math.sin(Math.PI * p) : Math.sin(Math.PI * p)
    case 'enter':
    case 'in':
      return 1 - 0.5 * ease(p)
    case 'exit':
    case 'out':
      return 0.5 + 0.5 * ease(p)
    default:
      return 1
  }
}

/** Where the stick is at this time, and what it is doing. */
export function stickAt(model: BoardModel, t: number): StickState {
  const move = moveAt(model, t)
  const span = move.t1 - move.t0
  const p = span > 0 ? Math.max(0, Math.min(1, (t - move.t0) / span)) : 1
  if (move.kind === 'draw' && move.stroke) {
    const drawn = move.stroke.length * ease(p)
    const point = along(move.stroke, drawn)
    return {
      x: point.x,
      y: point.y,
      drawing: true,
      lift: 0,
      away: false,
      move,
      drawn,
    }
  }
  if (move.kind === 'rest' || move.kind === 'away') {
    return {
      x: move.from[0],
      y: move.from[1],
      drawing: false,
      lift: liftOf(move, p),
      away: move.kind === 'away',
      move,
      drawn: 0,
    }
  }
  const point = arc(move.from, move.to, ease(p))
  return {
    x: point[0],
    y: point[1],
    drawing: false,
    lift: liftOf(move, p),
    away: false,
    move,
    drawn: 0,
  }
}

/** The specks alive at this time: at most DUST_MAX, with where each is and how faded. */
export function dustAt(
  model: BoardModel,
  t: number,
  out: { x: number; y: number; r: number; opacity: number }[],
): number {
  const { dust } = model
  // The first speck that could still be alive: born within the last second.
  let lo = 0
  let hi = dust.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (dust[mid]!.t < t - 1) lo = mid + 1
    else hi = mid
  }
  let count = 0
  for (let index = lo; index < dust.length && count < DUST_MAX; index += 1) {
    const speck = dust[index]!
    if (speck.t > t) break
    const age = (t - speck.t) / speck.life
    if (age >= 1) continue
    const drift = 1 - (1 - age) * (1 - age)
    const slot = out[count] ?? { x: 0, y: 0, r: 0, opacity: 0 }
    slot.x = speck.x + speck.dx * drift
    slot.y = speck.y + speck.dy * drift
    slot.r = speck.r
    slot.opacity = (1 - age) * 0.55
    out[count] = slot
    count += 1
  }
  return count
}

/** The chapter a scheduled mark was moved within, for tests. */
export function chapterOf(start: number): number {
  for (let index = sixtyChapters.length - 1; index > 0; index -= 1)
    if (start >= sixtyChapters[index]!.start) return index
  return 0
}
