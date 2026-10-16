import { describe, expect, it } from 'vitest'
import { ERASE_END, ERASE_START, boards } from './sixty-drawing'
import { sixtyGlyphs } from './sixty-glyphs'
import { at } from './sixty-layout'
import {
  DUST_MAX,
  LETTERS_PER_SECOND,
  STROKE_FLOOR,
  TRAVEL_MAX,
  TRAVEL_MIN,
  boardModel,
  dustAt,
  moveAt,
  stickAt,
  type Scheduled,
} from './sixty-model'
import { sixtyChapters, sixtyLength } from './sixty-script'
import { along, ease, flatten, measure, wobble } from './sixty-strokes'
import { sixtyWords } from './sixty-words'

const arrangements = ['wide', 'narrow'] as const
const keys = Object.keys(at)

describe('the board model', () => {
  it.each(arrangements)(
    '%s: has every mark in writing order, the words of the board among them',
    (arrangement) => {
      const model = boardModel(arrangement)
      expect(model.marks.map((item) => item.mark.key)).toEqual(keys)
      expect(
        model.marks
          .filter((item) => item.mark.kind === 'word')
          .map((item) => (item.mark.kind === 'word' ? item.mark.text : '')),
      ).toEqual([...sixtyWords])
      // Each word rebuilt from its glyphs is the word.
      for (const item of model.marks) {
        if (item.mark.kind !== 'word') continue
        expect(item.mark.glyphs.map((glyph) => glyph.char).join('')).toBe(
          item.mark.text.replaceAll(' ', ''),
        )
        for (const glyph of item.mark.glyphs) {
          expect(glyph.strokes.length).toBeGreaterThan(0)
          expect(glyph.width).toBeGreaterThan(0)
          // The pen is just wider than the glyph's thickest stroke.
          const data = sixtyGlyphs.glyphs[glyph.char]!
          expect(glyph.width).toBeCloseTo(
            data.thickness * 1.05 * glyph.scale,
            6,
          )
          expect(data.coverage).toBeGreaterThanOrEqual(0.99)
        }
      }
    },
  )

  it.each(arrangements)(
    '%s: keeps every mark in its chapter, clear of the erase, the anchors where declared, and the stick able to travel between them',
    (arrangement) => {
      const model = boardModel(arrangement)
      let previous: Scheduled | null = null
      for (const item of model.marks) {
        const chapter = sixtyChapters[item.chapter]!
        expect(item.chapter, item.mark.key).toBe(
          sixtyChapters.findIndex(
            (ch) => item.declared >= ch.start && item.declared < ch.end,
          ),
        )
        expect(item.start, item.mark.key).toBeGreaterThanOrEqual(
          chapter.start - 1e-6,
        )
        expect(item.end, item.mark.key).toBeLessThanOrEqual(chapter.end + 1e-6)
        expect(item.end, item.mark.key).toBeGreaterThan(item.start)
        if (item.declared < ERASE_START)
          expect(item.end, item.mark.key).toBeLessThanOrEqual(
            ERASE_START + 1e-6,
          )
        else
          expect(item.start, item.mark.key).toBeGreaterThanOrEqual(
            ERASE_END - 1e-6,
          )
        if (item.anchor) expect(item.start, item.mark.key).toBe(item.declared)
        if (previous) {
          // Room for the travel between marks, except across the erase,
          // where the stick leaves and comes back.
          const across =
            previous.declared < ERASE_START && item.declared >= ERASE_END
          if (!across)
            expect(
              item.start - previous.end,
              item.mark.key,
            ).toBeGreaterThanOrEqual(TRAVEL_MIN - 1e-6)
        }
        previous = item
      }
      expect(model.marks.at(-1)!.end).toBeLessThanOrEqual(sixtyLength - 0.5)
    },
  )

  it.each(arrangements)(
    '%s: writes letters one after another, never faster than 25 a second, with lifts between them; lines take their length at about 400 units a second and never under a fifth of a second a stroke',
    (arrangement) => {
      const model = boardModel(arrangement)
      for (const item of model.marks) {
        const { mark, pieces } = item
        // Pieces run end to end, in order.
        let clock = item.start
        for (const piece of pieces) {
          expect(piece.t0, mark.key).toBeCloseTo(clock, 6)
          expect(piece.t1, mark.key).toBeGreaterThanOrEqual(piece.t0)
          clock = piece.t1
        }
        expect(clock, mark.key).toBeCloseTo(item.end, 6)
        if (mark.kind === 'word') {
          const seconds = item.end - item.start
          expect(mark.glyphs.length / seconds, mark.text).toBeLessThanOrEqual(
            LETTERS_PER_SECOND + 1e-6,
          )
          // A lift before every letter but the first, longer after a space.
          let glyph = 0
          for (const piece of pieces) {
            if (piece.kind === 'lift' && piece.stroke === 0) {
              expect(piece.glyph, mark.text).toBe(glyph + 1)
              glyph += 1
            }
          }
          expect(glyph, mark.text).toBe(mark.glyphs.length - 1)
          continue
        }
        if (mark.taps) continue
        for (const piece of pieces) {
          if (piece.kind !== 'stroke') continue
          const seconds = piece.t1 - piece.t0
          expect(seconds, mark.key).toBeGreaterThanOrEqual(STROKE_FLOOR - 1e-6)
          // About 400 units a second, quickened at most to 600 where a chapter is short of time.
          if (piece.length / 400 > STROKE_FLOOR)
            expect(piece.length / seconds, mark.key).toBeLessThanOrEqual(
              600 + 1e-6,
            )
        }
      }
    },
  )

  it('draws the dial as one loop that overshoots its start, an arrowhead as two short strokes after the shaft, a check as one stroke and the star as one', () => {
    const model = boardModel('wide')
    const mark = (key: string) => {
      const item = model.marks.find((item) => item.mark.key === key)!
      return item.mark.kind === 'stroke' ? item.mark : null
    }
    const dial = mark('dial')!
    expect(dial.strokes).toHaveLength(1)
    const [first] = dial.strokes[0]!.points
    const last = dial.strokes[0]!.points.at(-1)!
    expect(last[0]).toBeGreaterThan(first![0])
    expect(Math.abs(last[1] - first![1])).toBeLessThan(4)
    expect(dial.strokes[0]!.length).toBeGreaterThan(
      2 * Math.PI * boards.wide.dial.r,
    )
    for (const key of [
      'arrow1',
      'arrowFci',
      'arrowCui',
      'arrowCritical',
      'recertArrow',
    ]) {
      const arrow = mark(key)!
      expect(arrow.strokes, key).toHaveLength(3)
      expect(arrow.strokes[0]!.length, key).toBeGreaterThan(
        arrow.strokes[1]!.length,
      )
      expect(arrow.strokes[1]!.length, key).toBeLessThan(20)
      expect(arrow.strokes[2]!.length, key).toBeLessThan(20)
    }
    for (const key of ['check1', 'check2', 'check3']) {
      const check = mark(key)!
      expect(check.strokes, key).toHaveLength(1)
      const points = check.strokes[0]!.points
      // Down, then up.
      expect(points[0]![1]).toBeLessThan(
        points[Math.floor(points.length / 2)]![1],
      )
      expect(points.at(-1)![1]).toBeLessThan(
        points[Math.floor(points.length / 2)]![1],
      )
    }
    expect(mark('star')!.strokes).toHaveLength(1)
    expect(mark('burst')!.strokes).toHaveLength(1)
    // Lines carry a grain; dashed lines keep their own pattern.
    expect(mark('arrow1')!.grain).toMatch(/^[\d. ]+$/)
    expect(mark('certLine')!.grain).toBeNull()
    expect(mark('ticks')!.taps).toBe(true)
  })

  it('wobbles a line a little, its ends fixed, the same every time', () => {
    const points = flatten('M0 0 L300 0')
    expect(points).toHaveLength(1)
    const straight = points[0]!
    const bent = wobble(straight, 1.5, 7)
    expect(bent[0]).toEqual(straight[0])
    expect(bent.at(-1)).toEqual(straight.at(-1))
    let most = 0
    for (const [, y] of bent) most = Math.max(most, Math.abs(y))
    expect(most).toBeGreaterThan(0.2)
    expect(most).toBeLessThanOrEqual(1.5)
    expect(wobble(straight, 1.5, 7)).toEqual(bent)
    expect(wobble(straight, 1.5, 8)).not.toEqual(bent)
    const stroke = measure(bent)
    expect(stroke.length).toBeGreaterThanOrEqual(300)
    expect(along(stroke, 0)).toMatchObject({ x: 0, y: 0 })
    expect(along(stroke, stroke.length).x).toBeCloseTo(300, 6)
  })

  it('eases each stroke in and out: a tenth of the way into its time, under a tenth of it is drawn', () => {
    expect(ease(0.1)).toBeLessThan(0.1)
    expect(ease(0.5)).toBe(0.5)
    expect(ease(0.9)).toBeGreaterThan(0.9)
    const model = boardModel('wide')
    const dial = model.marks.find((item) => item.mark.key === 'dial')!
    const piece = dial.pieces[0]!
    const state = stickAt(model, piece.t0 + (piece.t1 - piece.t0) * 0.1)
    expect(state.drawing).toBe(true)
    expect(state.drawn / piece.length).toBeLessThan(0.1)
  })

  it.each(arrangements)(
    '%s: keeps the stick on the board from 0:00.5 to 0:59, moving at most 40 units a frame except around the erase, in from the lower right at 0:00 and out the same way by 1:00',
    (arrangement) => {
      const model = boardModel(arrangement)
      const { width, height } = boards[arrangement]
      // Moves run end to end from the clearing pass to 1:00.
      let clock = -0.5
      for (const move of model.moves) {
        expect(move.t0).toBeCloseTo(clock, 6)
        clock = move.t1
      }
      expect(clock).toBe(sixtyLength)
      expect(moveAt(model, -0.2).kind).toBe('away')
      expect(moveAt(model, 0).kind).toBe('enter')
      expect(moveAt(model, 0).from).toEqual(model.offstage)
      expect(model.offstage[0]).toBeGreaterThan(width)
      expect(model.offstage[1]).toBeGreaterThan(height)
      expect(moveAt(model, sixtyLength - 0.1).kind).toBe('exit')
      expect(moveAt(model, sixtyLength - 0.1).to).toEqual(model.offstage)
      let previous = stickAt(model, 0.5)
      let worst = 0
      const kinds = new Set<string>()
      for (let frame = 31; frame <= 59 * 60; frame += 1) {
        const t = frame / 60
        const state = stickAt(model, t)
        kinds.add(state.move.kind)
        const inErase = t > ERASE_START - 0.4 && t < ERASE_END + 0.2
        if (!inErase) {
          expect(state.away, `at ${t}`).toBe(false)
          expect(state.x).toBeGreaterThanOrEqual(-1)
          expect(state.x).toBeLessThanOrEqual(width + 1)
          worst = Math.max(
            worst,
            Math.hypot(state.x - previous.x, state.y - previous.y),
          )
        }
        previous = state
      }
      expect(worst).toBeLessThanOrEqual(40)
      for (const kind of ['draw', 'lift', 'travel', 'rest', 'out', 'in'])
        expect(kinds.has(kind), kind).toBe(true)
      // Travels between marks take 0.15 to 0.35 seconds.
      for (const move of model.moves)
        if (move.kind === 'travel') {
          expect(move.t1 - move.t0).toBeGreaterThanOrEqual(TRAVEL_MIN - 1e-6)
          expect(move.t1 - move.t0).toBeLessThanOrEqual(TRAVEL_MAX + 1e-6)
        }
      // It rests by the last mark while the script waits (between "current" and the first check).
      const rest = stickAt(model, 28)
      expect(rest.move.kind).toBe('rest')
      expect(rest.drawing).toBe(false)
      const current = model.marks.find((item) => item.mark.key === 'current')!
      expect([rest.x, rest.y]).toEqual(current.to)
    },
  )

  it.each(arrangements)(
    '%s: sheds dust only while drawing, never more than 40 specks at once, each fading within a second after drifting 10 to 30 units',
    (arrangement) => {
      const model = boardModel(arrangement)
      expect(model.dust.length).toBeGreaterThan(200)
      for (const speck of model.dust) {
        expect(moveAt(model, speck.t).kind).toBe('draw')
        expect(speck.life).toBeLessThanOrEqual(1)
        const far = Math.hypot(speck.dx, speck.dy)
        expect(far).toBeGreaterThanOrEqual(10)
        expect(far).toBeLessThanOrEqual(30)
      }
      const slots: { x: number; y: number; r: number; opacity: number }[] = []
      let most = 0
      for (let frame = 0; frame <= 60 * 60; frame += 1) {
        const count = dustAt(model, frame / 60, slots)
        most = Math.max(most, count)
        expect(count).toBeLessThanOrEqual(DUST_MAX)
      }
      expect(most).toBeGreaterThan(5)
      // Resting at 0:28 (nothing drawn for a second) there is none.
      expect(dustAt(model, 28, slots)).toBe(0)
    },
  )
})
