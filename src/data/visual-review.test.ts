import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Reviewed text and SVG labels: docs/content-review/phase-3-animations-2026-10-14.md.
// A changed hash requires renewed substantive comparison, not an automatic refresh.
describe('visual explanation editorial snapshot', () => {
  it.each([
    [
      'src/data/visual-explanations.ts',
      '248b12d281820993a3f056b1f490da3bb1b612557e6ece84594930955870307d',
    ],
    [
      'src/components/TeachingScene.tsx',
      'f1e8eb803bd3195bb3455b864df01832f394020f7f4a0e0c07bce47e4885f259',
    ],
  ])(
    'keeps the reviewed source-bound text and labels for %s',
    (path, fingerprint) => {
      expect(
        createHash('sha256').update(readFileSync(path)).digest('hex'),
      ).toBe(fingerprint)
    },
  )
})
