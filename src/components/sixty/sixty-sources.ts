/**
 * The files the drawing is made of, for the fingerprint kept next to the
 * video (public/media/cmmc-in-sixty-seconds.json): when any of them changes
 * and the video is not rendered again, a test fails. Paths from the
 * repository root, in a fixed order.
 */
export const sixtySources: readonly string[] = [
  'src/components/sixty/SixtyBoard.tsx',
  'src/components/sixty/sixty-drawing.ts',
  'src/components/sixty/sixty-glyphs.json',
  'src/components/sixty/sixty-layout.ts',
  'src/components/sixty/sixty-model.ts',
  'src/components/sixty/sixty-script.ts',
  'src/components/sixty/sixty-strokes.ts',
  'src/components/sixty/sixty-words.ts',
  'src/components/sixty/sixty.css',
  'src/components/sixty/useSixtyPlayer.ts',
]

/** What the video's fingerprint file records. */
export interface SixtyVideoRecord {
  readonly file: string
  readonly poster: string
  /** SHA-256 of the sources above, in order, each as its path, a newline and its bytes. */
  readonly sha256: string
  readonly sources: readonly string[]
  readonly width: number
  readonly height: number
  readonly fps: number
  readonly frames: number
  readonly seconds: number
  readonly bytes: number
  readonly renderedAt: string
}
