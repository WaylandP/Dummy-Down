/**
 * The board's lettering for "CMMC in sixty seconds": every character the
 * words in `sixty-words.ts` use, as an outline plus the pen strokes that
 * write it, and every word laid out with the hand font's own advances and
 * kerning. `npm run sixty:glyphs` (scripts/sixty-glyphs.mjs) generates
 * `sixty-glyphs.json` from the font and the words; it is committed, and
 * `sixty-glyphs.test.ts` fails when either input has changed since.
 *
 * Everything is in font units with y pointing down and the baseline at y=0
 * (a cap top is near -752, a descender positive). To draw a glyph at `size`
 * pixels, scale every value by `size / unitsPerEm`; to place a word, offset
 * each glyph by its `x`.
 */
import data from './sixty-glyphs.json'

/** A point of a stroke: x and y in font units, y down. */
export type SixtyPoint = readonly [number, number]

export interface SixtyGlyphBox {
  readonly x1: number
  readonly y1: number
  readonly x2: number
  readonly y2: number
}

export interface SixtyGlyph {
  /** How far the pen moves on to the next glyph, before kerning. */
  readonly advance: number
  /** The outline as SVG path data, nonzero fill, in font units. */
  readonly path: string
  /** The outline's extent, in the same units. */
  readonly bbox: SixtyGlyphBox
  /**
   * The widest stroke in the glyph: twice the largest distance from a point
   * of the ink to its edge. Strokes drawn this wide, with round caps and
   * joins and clipped to `path`, cover the glyph.
   */
  readonly thickness: number
  /**
   * The pen's path, in writing order: each stroke starts where the chalk
   * lands and has at least two points; a loop repeats its first point last;
   * a stroke may double back on itself (the top of a 1, the point of a 3).
   * Free ends reach the edge of the ink, so a round cap overshoots it by half
   * the thickness unless the drawing is clipped to `path`.
   */
  readonly strokes: readonly (readonly SixtyPoint[])[]
  /**
   * The share of the ink the strokes cover at thickness × 1.05 with round
   * caps and joins; the generator refuses anything under 0.99.
   */
  readonly coverage: number
  /** Whether the strokes were traced automatically or authored by hand. */
  readonly source: 'auto' | 'hand'
}

/**
 * A character placed in a word. A space has an entry here (its advance moved
 * the following glyph) but no entry in `glyphs`, having no ink.
 */
export interface SixtyPlacedGlyph {
  readonly char: string
  /** The glyph's origin from the word's start, kerning applied. */
  readonly x: number
}

export interface SixtyWord {
  readonly text: string
  /** The last glyph's x plus its advance. */
  readonly width: number
  readonly glyphs: readonly SixtyPlacedGlyph[]
}

export interface SixtyGlyphData {
  /** The font file under public/fonts, and its SHA-256 when generated. */
  readonly font: string
  readonly fontSha256: string
  readonly unitsPerEm: number
  readonly ascender: number
  readonly descender: number
  readonly capHeight: number | null
  readonly xHeight: number | null
  /** SHA-256 of `JSON.stringify(sixtyWords)` when generated. */
  readonly wordsSha256: string
  /** By character; absent for the space. */
  readonly glyphs: Readonly<Record<string, SixtyGlyph>>
  /** In the order of `sixtyWords`. */
  readonly words: readonly SixtyWord[]
}

export const sixtyGlyphs: SixtyGlyphData = data as unknown as SixtyGlyphData
