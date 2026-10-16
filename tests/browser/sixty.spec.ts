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
    return Array.from(svg.querySelectorAll('text')).map((text) => ({
      text: text.textContent,
      px: Number(text.getAttribute('font-size')) * scale,
    }))
  })
}

/** The drawn state of every timed mark, by its words or its start time. */
async function drawn(board: Locator) {
  return board.evaluate((svg) =>
    Array.from(svg.querySelectorAll<SVGElement>('[data-t]')).map((el) => ({
      text: el.textContent,
      start: Number(el.getAttribute('data-t')!.split(',')[0]),
      drawn: el.getAttribute('data-drawn'),
    })),
  )
}

const opacity = (node: Locator) =>
  node.evaluate((el: SVGElement) => Number(el.style.opacity))
const dashOffset = (node: Locator) =>
  node.evaluate((el: SVGElement) => parseFloat(el.style.strokeDashoffset))

/** Loads Home with the clock in the test's hand, paused once the fonts are in. */
async function openHome(page: Page, width: number, height: number) {
  await page.clock.install()
  await page.setViewportSize({ width, height })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  const talk = page.getByRole('region', { name: sixty })
  await expect(talk).toBeVisible()
  await talk.scrollIntoViewIfNeeded()
  // The board reads itself once the fonts are in; resting, it stands finished.
  await expect
    .poll(async () => (await drawn(talk.locator('svg.sixty-board'))).length)
    .toBeGreaterThan(40)
  await page.clock.pauseAt(Date.now() + 10_000)
  return talk
}

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
  // 0:15.0: scene 1 is whole, the circle has begun, the clock has not.
  await page.clock.runFor(15_000)
  const at15 = await drawn(board)
  for (const item of at15.filter((item) => item.start !== 15))
    expect(item.drawn, `${item.text ?? item.start} at 0:15`).toBe(
      item.start < 15 ? 'done' : 'none',
    )
  const wipeLength = await wipe.evaluate((el: SVGPathElement) =>
    el.getTotalLength(),
  )
  expect(await dashOffset(wipe)).toBeCloseTo(wipeLength, 0)
  expect(await opacity(eraser)).toBe(0)
  // 0:15.6: Level 2 is circled; 0:16.3: Smudge is half way through.
  await page.clock.runFor(650)
  expect(
    (await drawn(board)).filter((item) => item.start === 15)[0]!.drawn,
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
  // 0:16.9: scene 1 is gone, the haze stays, Smudge has left.
  await page.clock.runFor(650)
  expect(await dashOffset(wipe)).toBe(0)
  expect(await dashOffset(haze)).toBe(0)
  expect(await opacity(eraser)).toBe(0)
  expect(
    await sceneOne.evaluate((el) => getComputedStyle(el).maskImage),
  ).toContain('url(')
  // 0:17.0 to 0:17.6: the words of the clock begin; the dial from 0:17.6.
  await page.clock.runFor(400)
  const at173 = await drawn(board)
  expect(
    at173.find((item) => item.text === 'Level 2 runs on this clock')!.drawn,
  ).not.toBe('none')
  expect(
    at173.filter((item) => item.start >= 17.6).every((i) => i.drawn === 'none'),
  ).toBe(true)
  await page.clock.runFor(2000)
  expect((await drawn(board)).find((item) => item.start === 17.6)!.drawn).toBe(
    'done',
  )
  await expect(talk.locator('.sixty-eyebrow')).toHaveText(
    'Part 3 of 8 · The clock',
  )
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
