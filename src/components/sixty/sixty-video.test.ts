import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { sixtySources, type SixtyVideoRecord } from './sixty-sources'

const media = path.resolve(process.cwd(), 'public/media')
const read = (name: string) => path.join(media, name)

/** The fingerprint as scripts/sixty-video.mjs writes it: each path, a newline, its bytes. */
function fingerprint(): string {
  const hash = createHash('sha256')
  for (const source of sixtySources) {
    hash.update(`${source}\n`)
    hash.update(readFileSync(path.resolve(process.cwd(), source)))
  }
  return hash.digest('hex')
}

describe('the video of the chalk talk', () => {
  it('is there with its poster, 6 MB or less, a minute at 30 frames a second with two seconds held at the end', () => {
    const record = JSON.parse(
      readFileSync(read('cmmc-in-sixty-seconds.json'), 'utf8'),
    ) as SixtyVideoRecord
    expect(record.file).toBe('cmmc-in-sixty-seconds.mp4')
    expect(record.poster).toBe('cmmc-in-sixty-seconds.jpg')
    expect(existsSync(read(record.file))).toBe(true)
    expect(existsSync(read(record.poster))).toBe(true)
    const bytes = statSync(read(record.file)).size
    expect(bytes).toBe(record.bytes)
    expect(bytes).toBeLessThanOrEqual(6_000_000)
    expect(bytes).toBeGreaterThan(100_000)
    expect(record.width).toBe(1920)
    expect(record.height).toBe(1080)
    expect(record.fps).toBe(30)
    expect(record.seconds).toBe(62)
    expect(record.frames).toBe(62 * 30)
    // An MP4 with the moov atom first (faststart): "ftyp" in the first bytes.
    const head = readFileSync(read(record.file))
      .subarray(0, 12)
      .toString('latin1')
    expect(head).toContain('ftyp')
    expect(readFileSync(read(record.poster)).subarray(0, 3)).toEqual(
      Buffer.from([0xff, 0xd8, 0xff]),
    )
  })

  it('was rendered from the drawing as it is now (else rerun npm run sixty:video)', () => {
    const record = JSON.parse(
      readFileSync(read('cmmc-in-sixty-seconds.json'), 'utf8'),
    ) as SixtyVideoRecord
    expect(record.sources).toEqual([...sixtySources])
    expect(record.sha256).toBe(fingerprint())
  })
})
