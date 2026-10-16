#!/usr/bin/env node
/**
 * Renders "CMMC in sixty seconds" to public/media/cmmc-in-sixty-seconds.mp4
 * (H.264, yuv420p, faststart, 1920×1080, 30 frames a second on the 1×
 * timeline, 6 MB or less) with a poster JPG and, next to them, a JSON
 * record carrying a SHA-256 of the drawing's sources (the board, the
 * script, the glyph data: src/components/sixty/sixty-sources.ts), so a test
 * fails when they change and the video was not rendered again.
 *
 *   npm run build && npm run sixty:video
 *
 * The script serves the build with vite preview on a port of its own, opens
 * Home in Playwright's Chromium with the clock installed, restyles the page
 * for the frame (the yellow title above, the wide board large and centred,
 * each chapter's caption under it as the player shows it; nothing else),
 * presses Play, steps the clock a thirtieth of a second at a time and
 * screenshots every frame, holds the finished board for two seconds with
 * cipherandchalk.vercel.app under it, then encodes with the system ffmpeg,
 * or with npx ffmpeg-static if there is none (it is not a dependency, so CI
 * and Vercel never download it).
 */
/* global document, HTMLElement */
import { spawn, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as sleep } from 'node:timers/promises'
import { chromium } from 'playwright'
import { sixtySources } from '../src/components/sixty/sixty-sources.ts'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const WIDTH = 1920
const HEIGHT = 1080
const FPS = 30
const SECONDS = 60
const HOLD = 2
const OUT = join(root, 'public/media')
const NAME = 'cmmc-in-sixty-seconds'
const SITE = 'cipherandchalk.vercel.app'
const PORT = Number(process.env.SIXTY_VIDEO_PORT || 4499)
/** Six megabytes, the decimal kind, so the file is under 6 MB on any reading. */
const BUDGET = 6_000_000

/** The frame: the panel alone, large and centred, in the site's own styles. */
const frameStyles = `
  .site-header, .site-footer, .chalk-tray, .home-hero, .home-start, .home-glow,
  .skip-link, .sixty-player, .sixty-note { display: none !important; }
  html, body, .board-page { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden !important; }
  .board-main { margin: 0 !important; overflow: hidden !important; }
  .home { display: block !important; padding: 0 !important; min-height: 0 !important; }
  .home-talk { width: 1560px !important; margin: 0 auto !important; padding: 54px 0 0 !important; border: 0 !important; }
  .sixty { width: 1560px !important; max-width: none !important; --sixty-gap: 18px; }
  .sixty-title { font-size: 58px !important; line-height: 1.1 !important; text-align: center; }
  .sixty-screen { cursor: default !important; }
  .sixty-cap { margin-top: 22px !important; text-align: center; }
  .sixty-eyebrow { font-size: 19px !important; }
  .sixty-captions { margin: 8px auto 0 !important; max-width: 1400px; }
  .sixty-caption { font-size: 40px !important; line-height: 1.4 !important; }
  .sixty-site { margin: 0; color: var(--color-chalk-dim); font-family: var(--font-mono); font-size: 34px; line-height: 1.4; }
`

/** SHA-256 of the sources, each as its path, a newline and its bytes. */
function fingerprint() {
  const hash = createHash('sha256')
  for (const path of sixtySources) {
    hash.update(`${path}\n`)
    hash.update(readFileSync(join(root, path)))
  }
  return hash.digest('hex')
}

/** The system ffmpeg, or ffmpeg-static fetched by npx for this run only. */
function findFfmpeg() {
  if (spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0)
    return 'ffmpeg'
  const probe = spawnSync(
    'npx',
    [
      '--yes',
      '--package',
      'ffmpeg-static',
      'node',
      '-p',
      'require("ffmpeg-static")',
    ],
    { encoding: 'utf8' },
  )
  const path = probe.stdout.trim()
  if (probe.status !== 0 || !path)
    throw new Error('No ffmpeg: install it, or let npx fetch ffmpeg-static.')
  return path
}

async function serve() {
  const server = spawn(
    'npx',
    [
      'vite',
      'preview',
      '--host',
      '127.0.0.1',
      '--port',
      String(PORT),
      '--strictPort',
    ],
    { cwd: root, stdio: 'ignore', detached: true },
  )
  const base = `http://127.0.0.1:${PORT}`
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      await fetch(base)
      return { server, base }
    } catch {
      await sleep(200)
    }
  }
  throw new Error(`vite preview did not answer on ${base}`)
}

async function main() {
  const ffmpeg = findFfmpeg()
  const frames = mkdtempSync(join(tmpdir(), 'sixty-video-'))
  const { server, base } = await serve()
  const browser = await chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
  })
  // Frames as JPEGs at a quality the encoder cannot tell from PNG: the
  // chalk filter makes each paint the slow part, not the file.
  let count = 0
  const frameFile = (index) =>
    join(frames, `${String(index).padStart(5, '0')}.jpg`)
  const shot = async (page) => {
    await page.screenshot({
      path: frameFile(count),
      type: 'jpeg',
      quality: 95,
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
    })
    count += 1
  }
  try {
    const page = await browser.newPage({
      viewport: { width: WIDTH, height: HEIGHT },
      deviceScaleFactor: 1,
    })
    await page.clock.install()
    await page.goto(`${base}/`)
    await page.evaluate(() => document.fonts.ready)
    await sleep(300)
    await page.clock.pauseAt(Date.now() + 5000)
    // Play first, then the frame's styles (they hide the player row).
    await page.getByRole('button', { name: 'Play', exact: true }).click()
    await page.addStyleTag({ content: frameStyles })
    await sleep(200)
    // Smudge's clearing pass runs before 0:00; the video starts on the empty board.
    await page.clock.runFor(500)
    const total = SECONDS * FPS
    let elapsed = 0
    for (let frame = 0; frame < total; frame += 1) {
      await shot(page)
      const next = Math.round(((frame + 1) * 1000) / FPS)
      await page.clock.runFor(next - elapsed)
      elapsed = next
      if (frame % 150 === 149) console.log(`  ${frame + 1} of ${total} frames`)
    }
    // 1:00: the finished board holds for two seconds, the site's address under it.
    await page.clock.runFor(100)
    await page.evaluate((site) => {
      const eyebrow = document.querySelector('.sixty-eyebrow')
      if (eyebrow instanceof HTMLElement) eyebrow.style.visibility = 'hidden'
      const caption = document.querySelector('.sixty-caption[aria-live]')
      if (caption) {
        caption.textContent = ''
        const line = document.createElement('span')
        line.className = 'sixty-site'
        line.textContent = site
        caption.appendChild(line)
      }
    }, SITE)
    await sleep(100)
    await shot(page)
    const last = frameFile(count - 1)
    for (let frame = 1; frame < HOLD * FPS; frame += 1) {
      copyFileSync(last, frameFile(count))
      count += 1
    }
    mkdirSync(OUT, { recursive: true })
    const video = join(OUT, `${NAME}.mp4`)
    const poster = join(OUT, `${NAME}.jpg`)
    // H.264 at a quality that keeps the chalk's grain, within the budget.
    let bytes = Infinity
    for (const crf of [23, 25, 27, 29, 31]) {
      const encode = spawnSync(
        ffmpeg,
        [
          '-y',
          '-loglevel',
          'error',
          '-framerate',
          String(FPS),
          '-i',
          join(frames, '%05d.jpg'),
          '-c:v',
          'libx264',
          '-preset',
          'slow',
          '-crf',
          String(crf),
          '-pix_fmt',
          'yuv420p',
          '-movflags',
          '+faststart',
          video,
        ],
        { stdio: 'inherit' },
      )
      if (encode.status !== 0) throw new Error(`ffmpeg failed at crf ${crf}`)
      bytes = statSync(video).size
      console.log(`  crf ${crf}: ${(bytes / 1024 / 1024).toFixed(2)} MB`)
      if (bytes <= BUDGET) break
    }
    if (bytes > BUDGET) throw new Error('The video is over 6 MB at crf 31.')
    const still = spawnSync(
      ffmpeg,
      ['-y', '-loglevel', 'error', '-i', last, '-q:v', '3', poster],
      { stdio: 'inherit' },
    )
    if (still.status !== 0) throw new Error('ffmpeg failed on the poster')
    const record = {
      file: `${NAME}.mp4`,
      poster: `${NAME}.jpg`,
      sha256: fingerprint(),
      sources: sixtySources,
      width: WIDTH,
      height: HEIGHT,
      fps: FPS,
      frames: count,
      seconds: SECONDS + HOLD,
      bytes,
      renderedAt: new Date().toISOString(),
    }
    writeFileSync(
      join(OUT, `${NAME}.json`),
      `${JSON.stringify(record, null, 2)}\n`,
    )
    console.log(
      `Wrote ${video} (${(bytes / 1024 / 1024).toFixed(2)} MB), ${poster} and the record.`,
    )
  } finally {
    await browser.close()
    try {
      process.kill(-server.pid)
    } catch {
      // The preview server has already gone.
    }
    rmSync(frames, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
