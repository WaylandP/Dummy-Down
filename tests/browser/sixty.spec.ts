import { expect, test, type Locator, type Page } from '@playwright/test'
import { sixtyChapters } from '../../src/components/sixty/sixty-script'
import { sixtyWords } from '../../src/components/sixty/sixty-words'

const sixty = 'CMMC in sixty seconds'
/** The eight widths the panel is checked at, with a screen height for each. */
const sizes = [
  [320, 568],
  [390, 844],
  [768, 1024],
  [1024, 768],
  [1280, 800],
  [1366, 768],
  [1440, 900],
  [1920, 1080],
] as const

/** Every word on the board with its size on the screen: board units times the board's scale. */
async function wordSizes(board: Locator) {
  return board.evaluate((svg: SVGSVGElement) => {
    const outer = svg.getScreenCTM()!
    const scale = Math.hypot(outer.a, outer.b)
    return Array.from(svg.querySelectorAll('.sixty-word')).map((word) => ({
      text: word.getAttribute('data-text'),
      px: Number(word.getAttribute('data-size')) * scale,
    }))
  })
}

/** The drawn state of every mark, by its key, with its scheduled start. */
async function drawn(board: Locator) {
  return board.evaluate((svg) =>
    Array.from(svg.querySelectorAll<SVGElement>('[data-start]')).map((el) => ({
      key: el.getAttribute('data-key'),
      start: Number(el.getAttribute('data-start')),
      drawn: el.getAttribute('data-drawn'),
    })),
  )
}

const opacity = (node: Locator) =>
  node.evaluate((el: SVGElement) => Number(el.style.opacity))
const dashOffset = (node: Locator) =>
  node.evaluate((el: SVGElement) => parseFloat(el.style.strokeDashoffset))

/** One animation frame as recorded in the page: the board's time, the stick, and the mark under way. */
interface Frame {
  readonly t: number
  readonly x: number
  readonly y: number
  readonly op: string
  readonly state: string | null
  readonly key: string | null
  readonly p: number | null
  readonly glyphs: readonly number[]
}

/**
 * Records the stick and the mark under way after every animation frame,
 * inside the page, so a whole minute can be stepped at 1/60 s and read back
 * at once.
 */
function recorder() {
  const frames: unknown[] = []
  ;(window as unknown as { __sixtyFrames: unknown[] }).__sixtyFrames = frames
  const raf = window.requestAnimationFrame.bind(window)
  window.requestAnimationFrame = (callback: FrameRequestCallback) =>
    raf((now) => {
      callback(now)
      const svg = document.querySelector('svg.sixty-board')
      const stick = svg?.querySelector('.sixty-stick')
      if (!svg || !(stick instanceof SVGElement)) return
      const part = svg.querySelector('[data-drawn="part"]')
      frames.push({
        t: Number(svg.getAttribute('data-time')),
        x: Number(stick.getAttribute('data-x')),
        y: Number(stick.getAttribute('data-y')),
        op: stick.style.opacity,
        state: stick.getAttribute('data-state'),
        key: part?.getAttribute('data-key') ?? null,
        p: part ? Number(part.getAttribute('data-p')) : null,
        glyphs: part
          ? Array.from(part.querySelectorAll('.sixty-glyph')).map((glyph) =>
              Number(glyph.getAttribute('data-p')),
            )
          : [],
      })
    })
}

const frames = async (page: Page) =>
  (await page.evaluate(
    () => (window as unknown as { __sixtyFrames: Frame[] }).__sixtyFrames,
  )) as Frame[]

/** Loads Home with the clock in the test's hand, paused once the fonts are in. */
async function openHome(
  page: Page,
  width: number,
  height: number,
  record = false,
) {
  await page.clock.install()
  if (record) await page.addInitScript(recorder)
  await page.setViewportSize({ width, height })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  const talk = page.getByRole('region', { name: sixty })
  await expect(talk).toBeVisible()
  await talk.scrollIntoViewIfNeeded()
  // Resting, the board stands finished.
  await expect
    .poll(async () => (await drawn(talk.locator('svg.sixty-board'))).length)
    .toBeGreaterThan(40)
  await page.clock.pauseAt(Date.now() + 10_000)
  return talk
}

/** When a mark is scheduled, from the board. */
const scheduled = (board: Locator, key: string) =>
  board.locator(`[data-key="${key}"]`).evaluate((el) => ({
    start: Number(el.getAttribute('data-start')),
    end: Number(el.getAttribute('data-end')),
  }))

test('every word on the board is 11px or more at eight widths, and the panel keeps its box and the address when Play is pressed', async ({
  page,
}) => {
  for (const [width, height] of sizes) {
    const talk = await openHome(page, width, height)
    const board = talk.locator('svg.sixty-board')
    // The arrangement follows the board's width: narrow under 395px.
    const boardBox = (await board.boundingBox())!
    await expect(board).toHaveAttribute(
      'data-arrangement',
      boardBox.width < 395 ? 'narrow' : 'wide',
    )
    const words = await wordSizes(board)
    expect(words.map((word) => word.text)).toEqual(sixtyWords)
    for (const word of words) expect(word.px).toBeGreaterThanOrEqual(11)
    // Resting: the finished clock, the length, the blurb; no dialog.
    expect((await drawn(board)).every((item) => item.drawn === 'done')).toBe(
      true,
    )
    await expect(talk.locator('.sixty-time-now')).toHaveText('1:00')
    await expect(talk.locator('.sixty-caption[aria-live]')).toHaveText(
      'Three years of CMMC Level 2, drawn in one minute.',
    )
    await expect(page.locator('dialog')).toHaveCount(0)
    // Play: the panel's box and the address stay where they were.
    const before = (await talk.boundingBox())!
    const address = page.url()
    await talk.getByRole('button', { name: 'Play', exact: true }).click()
    await page.clock.runFor(2500)
    await expect(talk.locator('.sixty-time-now')).toHaveText(/^0:0[12]$/)
    const after = (await talk.boundingBox())!
    expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(1)
    expect(Math.abs(after.height - before.height)).toBeLessThanOrEqual(1)
    expect(Math.abs(after.width - before.width)).toBeLessThanOrEqual(1)
    expect(page.url()).toBe(address)
    await expect(page.locator('dialog')).toHaveCount(0)
    // The same words, at the same sizes, while it draws.
    expect(await wordSizes(board)).toEqual(words)
    // Every control in the row is a 44px target.
    for (const control of [
      talk.getByRole('button', { name: 'Pause' }),
      talk.getByRole('button', { name: /^Playback speed/ }),
      talk.getByRole('slider', { name: 'Seek' }),
    ]) {
      const box = (await control.boundingBox())!
      expect(box.height).toBeGreaterThanOrEqual(44)
      expect(box.width).toBeGreaterThanOrEqual(44)
    }
    // The time: the elapsed part where space is short, dropped under 340px.
    const time = talk.locator('.sixty-time')
    if (width <= 320) await expect(time).toBeHidden()
    else await expect(time).toBeVisible()
  }
})

test('scene 1 is drawn by 0:15 and circled by 0:15.6, Smudge wipes it off between 0:15.7 and 0:16.9 leaving the haze, and the clock is drawn from 0:17', async ({
  page,
}) => {
  const talk = await openHome(page, 1280, 800)
  const board = talk.locator('svg.sixty-board')
  const sceneOne = board.locator('.sixty-scene-one')
  const eraser = board.locator('.sixty-eraser')
  const wipe = board.locator('.sixty-erase-stroke')
  const haze = board.locator('.sixty-haze')
  await talk.getByRole('button', { name: 'Play', exact: true }).click()
  // Half a second of Smudge clears the finished board before 0:00.
  await page.clock.runFor(250)
  expect(await opacity(eraser)).toBe(1)
  await expect(talk.locator('.sixty-time-now')).toHaveText('0:00')
  await page.clock.runFor(300)
  expect(await opacity(eraser)).toBe(0)
  expect((await drawn(board)).every((item) => item.drawn === 'none')).toBe(true)
  // 0:15.0: scene 1 is whole, the circle is next, the clock has not begun.
  await page.clock.runFor(15_000)
  const at15 = await drawn(board)
  for (const item of at15.filter((item) => item.key !== 'circle'))
    expect(item.drawn, `${item.key} at 0:15`).toBe(
      item.start < 15 ? 'done' : 'none',
    )
  const wipeLength = await wipe.evaluate((el: SVGPathElement) =>
    el.getTotalLength(),
  )
  expect(await dashOffset(wipe)).toBeCloseTo(wipeLength, 0)
  expect(await opacity(eraser)).toBe(0)
  // 0:15.65: Level 2 is circled; 0:16.3: Smudge is half way through.
  await page.clock.runFor(650)
  expect(
    (await drawn(board)).find((item) => item.key === 'circle')!.drawn,
  ).toBe('done')
  await page.clock.runFor(650)
  expect(await opacity(eraser)).toBe(1)
  const half = await dashOffset(wipe)
  expect(half).toBeGreaterThan(wipeLength * 0.3)
  expect(half).toBeLessThan(wipeLength * 0.7)
  expect(await dashOffset(haze)).toBeCloseTo(half, 0)
  const him = (await eraser.boundingBox())!
  const slate = (await board.boundingBox())!
  expect(him.width).toBeGreaterThan(40)
  expect(him.x).toBeGreaterThanOrEqual(slate.x - 1)
  expect(him.x + him.width).toBeLessThanOrEqual(slate.x + slate.width + 1)
  // 0:16.95: scene 1 is gone, the haze stays, Smudge has left.
  await page.clock.runFor(650)
  expect(await dashOffset(wipe)).toBe(0)
  expect(await dashOffset(haze)).toBe(0)
  expect(await opacity(eraser)).toBe(0)
  expect(
    await sceneOne.evaluate((el) => getComputedStyle(el).maskImage),
  ).toContain('url(')
  // 0:17.0 to 0:17.6: the words of the clock begin; the dial comes after them.
  await page.clock.runFor(400)
  const at173 = await drawn(board)
  expect(at173.find((item) => item.key === 'runs')!.drawn).not.toBe('none')
  expect(
    at173.filter((item) => item.start >= 17.6).every((i) => i.drawn === 'none'),
  ).toBe(true)
  await page.clock.runFor(2000)
  expect((await drawn(board)).find((item) => item.key === 'dial')!.drawn).toBe(
    'done',
  )
  await expect(talk.locator('.sixty-eyebrow')).toHaveText(
    'Part 3 of 8 · The clock',
  )
})

test('a word is written letter by letter along each letter’s strokes: the tip rises and falls inside every letter, and no letter is half shown before the one before it is done', async ({
  page,
}) => {
  const talk = await openHome(page, 1280, 800, true)
  const board = talk.locator('svg.sixty-board')
  // No wipes remain: every word is its glyph outlines, one per letter,
  // showing through a mask of round-capped pen strokes along the skeletons.
  const built = await board.evaluate((svg) => ({
    wipes: svg.querySelectorAll(
      '.sixty-word [clip-path], clipPath rect[width="0"]',
    ).length,
    words: svg.querySelectorAll('.sixty-word').length,
    glyphs: svg.querySelectorAll('.sixty-word use.sixty-glyph').length,
    pens: svg.querySelectorAll('.sixty-word mask path.sixty-pen').length,
    round: Array.from(svg.querySelectorAll('mask path.sixty-pen')).every(
      (pen) => getComputedStyle(pen).strokeLinecap === 'round',
    ),
    text: svg.querySelectorAll('text').length,
  }))
  expect(built.wipes).toBe(0)
  expect(built.words).toBe(24)
  expect(built.glyphs).toBeGreaterThan(200)
  expect(built.pens).toBeGreaterThanOrEqual(built.glyphs)
  expect(built.round).toBe(true)
  expect(built.text).toBe(0)
  const dod = await scheduled(board, 'dod')
  await talk.getByRole('button', { name: 'Play', exact: true }).click()
  await page.clock.runFor(500 + Math.round(dod.end * 1000) + 200)
  const writing = (await frames(page)).filter((frame) => frame.key === 'dod')
  expect(writing.length).toBeGreaterThan(20)
  // The tip rides each letter's strokes: inside each letter its height
  // moves by at least 30% of the cap height (752 of 1024 units, at 24).
  const cap = (752 / 1024) * 24
  for (let letter = 0; letter < 3; letter += 1) {
    const inside = writing.filter(
      (frame) => frame.glyphs[letter]! > 0 && frame.glyphs[letter]! < 1,
    )
    expect(inside.length, `letter ${letter}`).toBeGreaterThan(1)
    const ys = inside.map((frame) => frame.y)
    expect(
      Math.max(...ys) - Math.min(...ys),
      `letter ${letter}`,
    ).toBeGreaterThanOrEqual(0.3 * cap)
    expect(
      inside.every((frame) => frame.state === 'draw' || frame.state === 'lift'),
    ).toBe(true)
  }
  // Letter by letter: none is more than half shown before the one before
  // it is finished, and none goes backwards.
  let previous = [0, 0, 0]
  for (const frame of writing) {
    for (let letter = 1; letter < 3; letter += 1)
      if (frame.glyphs[letter]! > 0.5)
        expect(frame.glyphs[letter - 1], `at ${frame.t}`).toBe(1)
    for (let letter = 0; letter < 3; letter += 1)
      expect(frame.glyphs[letter], `at ${frame.t}`).toBeGreaterThanOrEqual(
        previous[letter]!,
      )
    previous = [...frame.glyphs]
  }
  expect(previous[0]).toBe(1)
  expect(previous[1]).toBe(1)
  expect(previous[2]).toBeGreaterThan(0.9)
  // Fully revealed: the word stands done, every letter whole.
  await expect(board.locator('.sixty-word[data-text="DoD"]')).toHaveAttribute(
    'data-drawn',
    'done',
  )
  expect(
    await board
      .locator('.sixty-word[data-text="DoD"] .sixty-glyph')
      .evaluateAll((glyphs) => glyphs.map((g) => g.getAttribute('data-p'))),
  ).toEqual(['1', '1', '1'])
})

test('the stick is a hand: on the board every frame from 0:00.5 to 0:59, never jumping more than 40 units a frame except around the erase, in from the lower right and out the same way; each stroke eases in', async ({
  page,
}) => {
  const talk = await openHome(page, 1280, 800, true)
  const board = talk.locator('svg.sixty-board')
  const dial = await scheduled(board, 'dial')
  const current = await scheduled(board, 'current')
  await talk.getByRole('button', { name: 'Play', exact: true }).click()
  await page.clock.runFor(500 + 60_600)
  const all = await frames(page)
  // One record a frame, a sixtieth of a second apart.
  const seen = new Set<number>()
  const steps = all.filter((frame) => {
    if (seen.has(frame.t)) return false
    seen.add(frame.t)
    return true
  })
  expect(steps.length).toBeGreaterThan(3500)
  for (let index = 1; index < steps.length; index += 1)
    expect(steps[index]!.t - steps[index - 1]!.t).toBeLessThanOrEqual(0.02)
  // In from the lower right at 0:00.
  const entering = steps.find((frame) => frame.t > 0.05 && frame.t < 0.2)!
  expect(entering.state).toBe('enter')
  expect(entering.x).toBeGreaterThan(300)
  expect(entering.y).toBeGreaterThan(150)
  // From 0:00.5 to 0:59, on the board and never jumping, except while
  // Smudge wipes, when it leaves to the lower right and comes back.
  let previous: Frame | null = null
  const states = new Set<string | null>()
  const problems: string[] = []
  const inErase = (t: number) => t > 15.3 && t < 17.05
  for (const frame of steps) {
    if (frame.t < 0.5 || frame.t > 59) continue
    if (!inErase(frame.t)) {
      if (frame.op !== '1') problems.push(`hidden at ${frame.t}`)
      if (frame.x < 0 || frame.x > 520 || frame.y < 0 || frame.y > 235)
        problems.push(`off the board at ${frame.t}: ${frame.x},${frame.y}`)
      if (previous && !inErase(previous.t)) {
        const step = Math.hypot(frame.x - previous.x, frame.y - previous.y)
        if (step > 40) problems.push(`jumped ${step.toFixed(1)} at ${frame.t}`)
      }
      states.add(frame.state)
    } else if (frame.t > 15.9 && frame.t < 16.5) {
      if (frame.op !== '0' || frame.state !== 'away')
        problems.push(`not away at ${frame.t}: ${frame.state} ${frame.op}`)
    }
    previous = frame
  }
  expect(problems).toEqual([])
  for (const state of ['draw', 'lift', 'travel', 'rest'])
    expect(states.has(state), state).toBe(true)
  // It rests by the last mark while the script waits: at 0:28, by "current",
  // where it lifted off.
  const resting = steps.find((frame) => frame.t > 28 && frame.t < 28.1)!
  expect(resting.state).toBe('rest')
  const last = steps
    .filter((frame) => frame.t > current.end - 0.05 && frame.t <= current.end)
    .at(-1)!
  expect(Math.hypot(resting.x - last.x, resting.y - last.y)).toBeLessThan(6)
  // Out the same way by 1:00.
  const leaving = steps.find((frame) => frame.t > 59.5 && frame.t < 60)!
  expect(leaving.state).toBe('exit')
  expect(steps.at(-1)!.t).toBe(60)
  // Each stroke eases in: a tenth of the way into the dial's time, under a tenth of it is drawn.
  const tenth = steps.find(
    (frame) => frame.t >= dial.start + (dial.end - dial.start) * 0.1,
  )!
  expect(tenth.key).toBe('dial')
  expect(tenth.p).toBeLessThan(0.1)
  const half = steps.find(
    (frame) => frame.t >= dial.start + (dial.end - dial.start) * 0.5,
  )!
  expect(half.p).toBeGreaterThan(0.4)
  expect(half.p).toBeLessThan(0.6)
})

test('the keys work only with focus in the player, and the captions are the chapters, word for word', async ({
  page,
}) => {
  const talk = await openHome(page, 1280, 800)
  const time = talk.locator('.sixty-time-now')
  // With focus on the search line, Space and K are the page's.
  const search = page.getByRole('searchbox', { name: 'Find a control' })
  await search.focus()
  await page.keyboard.press('Space')
  await page.keyboard.press('k')
  await page.clock.runFor(300)
  await expect(
    talk.getByRole('button', { name: 'Play', exact: true }),
  ).toBeVisible()
  await expect(time).toHaveText('1:00')
  // With focus on the seek bar, they are the player's.
  const slider = talk.getByRole('slider', { name: 'Seek' })
  await slider.focus()
  await page.keyboard.press('Space')
  await expect(talk.getByRole('button', { name: 'Pause' })).toBeVisible()
  await page.keyboard.press('k')
  await expect(
    talk.getByRole('button', { name: 'Play', exact: true }),
  ).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expect(time).toHaveText('0:05')
  await page.keyboard.press('PageDown')
  await expect(time).toHaveText('0:07')
  await expect(slider).toHaveAttribute('aria-valuetext', '0:07, Levels')
  await page.keyboard.press('Home')
  await expect(time).toHaveText('0:00')
  // Each part's caption, word for word, with its glossary words as popovers.
  for (const [index, chapter] of sixtyChapters.entries()) {
    await expect(talk.locator('.sixty-eyebrow')).toHaveText(
      `Part ${index + 1} of ${sixtyChapters.length} · ${chapter.name}`,
    )
    await expect(talk.locator('.sixty-caption[aria-live]')).toHaveText(
      chapter.caption,
    )
    for (const word of chapter.words)
      await expect(
        talk
          .locator('.sixty-caption[aria-live]')
          .getByRole('button', { name: word.phrase }),
      ).toBeVisible()
    if (index < sixtyChapters.length - 1) await page.keyboard.press('PageDown')
  }
  await expect(time).toHaveText('0:56')
  await page.keyboard.press('End')
  await expect(time).toHaveText('1:00')
  await expect(talk.getByRole('button', { name: 'Replay' })).toBeVisible()
  // A popover in the caption takes Escape; the panel stays.
  await talk
    .locator('.sixty-caption[aria-live]')
    .getByRole('button', { name: 'SPRS' })
    .click()
  await expect(page.locator('.chalk-popover')).toContainText(
    'Supplier Performance Risk System',
  )
  await page.keyboard.press('Escape')
  await expect(page.locator('.chalk-popover')).toHaveCount(0)
  await expect(talk).toBeVisible()
  // The site's own keys still answer from the panel: "?" shows the keys.
  await slider.focus()
  await page.keyboard.press('?')
  await expect(page.getByRole('dialog', { name: 'Keys' })).toBeVisible()
})

test('/?play=sixty opens Home with the panel in view and plays from 0:00, the address kept; Share copies that link, offers the download, and gives focus back', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.clock.install()
  await page.setViewportSize({ width: 1280, height: 800 })
  // The clock stands before the page loads, so the drawing waits for the test.
  await page.clock.pauseAt(Date.now() + 10_000)
  await page.goto('/?play=sixty')
  await page.evaluate(() => document.fonts.ready)
  const talk = page.getByRole('region', { name: sixty })
  await expect(talk).toBeInViewport()
  // Playing, from the clearing pass; the address keeps the parameter.
  await expect(talk.getByRole('button', { name: 'Pause' })).toBeVisible()
  await expect(talk.locator('.sixty-time-now')).toHaveText('0:00')
  expect(new URL(page.url()).search).toBe('?play=sixty')
  await page.clock.runFor(500 + 3200)
  await expect(talk.locator('.sixty-time-now')).toHaveText(/^0:0[34]$/)
  await expect(talk.locator('.sixty-word[data-text="DoD"]')).toHaveAttribute(
    'data-drawn',
    'done',
  )
  // Share: a 44px button at the end of the row; its menu, in the chalk
  // popover's style, with the link and the download (no file sharing on a
  // desktop browser); Escape gives focus back.
  const share = talk.getByRole('button', { name: 'Share' })
  const box = (await share.boundingBox())!
  expect(box.width).toBeGreaterThanOrEqual(44)
  expect(box.height).toBeGreaterThanOrEqual(44)
  await share.click()
  const menu = talk.getByRole('menu', { name: 'Share' })
  await expect(menu).toBeVisible()
  await expect(menu.getByRole('menuitem')).toHaveText([
    'Copy link',
    /Download the video/,
  ])
  await expect(menu.getByRole('menuitem', { name: 'Copy link' })).toBeFocused()
  const download = menu.getByRole('menuitem', { name: /Download the video/ })
  await expect(download).toHaveAttribute(
    'href',
    '/media/cmmc-in-sixty-seconds.mp4',
  )
  await expect(download).toHaveAttribute(
    'download',
    'cmmc-in-sixty-seconds.mp4',
  )
  await expect(download).toContainText('MP4 · 1:00')
  // The file is on the site.
  const head = await page.request.head('/media/cmmc-in-sixty-seconds.mp4')
  expect(head.ok()).toBe(true)
  await menu.getByRole('menuitem', { name: 'Copy link' }).click()
  await expect(menu.getByRole('status')).toHaveText('Link copied')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    `${new URL(page.url()).origin}/?play=sixty`,
  )
  await page.keyboard.press('Escape')
  await expect(menu).toHaveCount(0)
  await expect(share).toBeFocused()
  // A click outside closes it too, and focus comes back.
  await share.click()
  await expect(talk.getByRole('menu', { name: 'Share' })).toBeVisible()
  await page.getByRole('heading', { level: 1 }).click()
  await expect(talk.getByRole('menu', { name: 'Share' })).toHaveCount(0)
  await expect(share).toBeFocused()
  // Still playing underneath; nothing else moved.
  await expect(talk.getByRole('button', { name: 'Pause' })).toBeVisible()
})

test.describe('the deep link under reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('shows the finished board instead of playing', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/?play=sixty')
    await page.evaluate(() => document.fonts.ready)
    const talk = page.getByRole('region', { name: sixty })
    await expect(talk).toBeInViewport()
    await expect(
      talk.getByRole('button', { name: 'Play', exact: true }),
    ).toBeVisible()
    await expect(talk.locator('.sixty-time-now')).toHaveText('1:00')
    expect(
      (await drawn(talk.locator('svg.sixty-board'))).every(
        (item) => item.drawn === 'done',
      ),
    ).toBe(true)
    await expect(talk.locator('.sixty-stick')).toHaveCSS('opacity', '0')
  })
})
