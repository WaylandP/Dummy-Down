import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { sixtyGlyphs } from './sixty-glyphs'
import { sixtyWords } from './sixty-words'

const sha256 = (data: Buffer | string) =>
  createHash('sha256').update(data).digest('hex')

/** The characters the board writes, the space left out. */
const inked = [...new Set(sixtyWords.join(''))].filter((char) => char !== ' ')

describe('the sixty-seconds lettering', () => {
  it('spells every word of the board, in order', () => {
    expect(sixtyGlyphs.words.map((word) => word.text)).toEqual([...sixtyWords])
    expect(
      sixtyGlyphs.words.map((word) =>
        word.glyphs.map((placed) => placed.char).join(''),
      ),
    ).toEqual([...sixtyWords])
  })

  it('has strokes for every character, with no ink for the space', () => {
    expect(inked.length).toBeGreaterThan(0)
    for (const char of inked) {
      const glyph = sixtyGlyphs.glyphs[char]
      if (!glyph) throw new Error(`No glyph for ${JSON.stringify(char)}`)
      expect(glyph.path, char).toMatch(/^M/)
      expect(glyph.advance, char).toBeGreaterThan(0)
      expect(glyph.thickness, char).toBeGreaterThan(0)
      expect(glyph.strokes.length, char).toBeGreaterThan(0)
      for (const stroke of glyph.strokes) {
        expect(stroke.length, char).toBeGreaterThanOrEqual(2)
        for (const point of stroke) expect(point, char).toHaveLength(2)
      }
      expect(glyph.coverage, char).toBeGreaterThanOrEqual(0.99)
      expect(['auto', 'hand'], char).toContain(glyph.source)
    }
    expect(sixtyGlyphs.glyphs[' ']).toBeUndefined()
  })

  it("lays each word out with the font's advances", () => {
    for (const word of sixtyGlyphs.words) {
      let previous = -Infinity
      for (const placed of word.glyphs) {
        expect(placed.x, word.text).toBeGreaterThanOrEqual(previous)
        previous = placed.x
      }
      const last = word.glyphs.at(-1)
      if (!last) throw new Error(`"${word.text}" has no glyphs`)
      const glyph = sixtyGlyphs.glyphs[last.char]
      if (!glyph) throw new Error(`No glyph for ${JSON.stringify(last.char)}`)
      expect(
        Math.abs(word.width - (last.x + glyph.advance)),
        word.text,
      ).toBeLessThanOrEqual(0.5)
    }
  })

  it('is as fresh as the font and the words (else rerun npm run sixty:glyphs)', () => {
    const font = readFileSync(
      path.resolve(
        process.cwd(),
        'public/fonts/walter-turncoat-latin-400.woff',
      ),
    )
    expect(sixtyGlyphs.font).toBe('walter-turncoat-latin-400.woff')
    expect(sixtyGlyphs.fontSha256).toBe(sha256(font))
    expect(sixtyGlyphs.wordsSha256).toBe(sha256(JSON.stringify(sixtyWords)))
    expect(sixtyGlyphs.unitsPerEm).toBeGreaterThan(0)
  })

  it('loads nothing from off the site', () => {
    expect(JSON.stringify(sixtyGlyphs)).not.toMatch(
      /https?:|\/\/|url\(|@import/i,
    )
  })
})
