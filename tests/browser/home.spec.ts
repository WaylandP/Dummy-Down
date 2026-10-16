import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator } from '@playwright/test'

const pick = 'Pick up a chalk to start.'
const sixty = 'CMMC in sixty seconds'

/** The smallest word on a board, in CSS pixels: board units times the board's scale. */
async function smallestWord(board: Locator): Promise<number> {
  return board.evaluate((svg: SVGSVGElement) => {
    const outer = svg.getScreenCTM()!
    return Math.min(
      ...Array.from(svg.querySelectorAll('text')).map(
        (text) =>
          Number(text.getAttribute('font-size')) * Math.hypot(outer.a, outer.b),
      ),
    )
  })
}

test('home puts one thing first on one screen at 1280×800, and a chalk picks the one the next control opens in', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')
  const title = page.getByRole('heading', { level: 1 })
  await expect(title).toHaveText('CMMC, in plain words.')
  await page.evaluate(() => document.fonts.ready)
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  // Sized from the hero's own width beside the still: about 100px here.
  const size = parseFloat(
    await title.evaluate((node) => getComputedStyle(node).fontSize),
  )
  expect(size).toBeGreaterThanOrEqual(96)
  expect(size).toBeLessThanOrEqual(104)
  // One screen: the content fits its frame with nothing to scroll.
  expect(
    await page.evaluate(() => {
      const main = document.getElementById('main')!
      return main.scrollHeight - main.clientHeight
    }),
  ).toBeLessThanOrEqual(0)
  // First, second, third: the kicker, the headline, the line, the chalks, the search.
  const kicker = (await page
    .getByText('A free reference desk for cybersecurity compliance')
    .boundingBox())!
  const headline = (await title.boundingBox())!
  const lead = (await page.getByText(/^All 149 controls/).boundingBox())!
  const chalks = page.getByRole('list', { name: pick })
  const row = (await chalks.boundingBox())!
  const search = (await page.locator('.home-search').boundingBox())!
  expect(kicker.y + kicker.height).toBeLessThanOrEqual(headline.y + 1)
  expect(headline.y + headline.height).toBeLessThanOrEqual(lead.y + 1)
  expect(lead.y + lead.height).toBeLessThanOrEqual(row.y + 1)
  expect(search.x).toBeGreaterThan(row.x + row.width - 1)
  // The search line is a 44px target.
  const input = (await page
    .getByRole('searchbox', { name: 'Find a control' })
    .boundingBox())!
  expect(input.height).toBeGreaterThanOrEqual(44)
  const nav = page.getByRole('navigation', { name: 'Main' })
  await expect(nav.getByRole('link')).toHaveText([
    'Home',
    'Controls',
    'Glossary',
    'Practice',
    'Timeline',
    'About',
  ])
  await expect(nav.getByRole('link', { name: 'Home' })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await expect(chalks.getByRole('link')).toHaveCount(3)
  await expect(chalks.getByRole('link').nth(2)).toContainText(
    'Every objective, quoted.',
  )
  await expect(page.getByRole('contentinfo')).toContainText(
    'Independent and educational.',
  )
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])

  // The stick lifts under the pointer and under keyboard focus; the ring stays.
  const first = chalks.getByRole('link').first()
  const stick = first.locator('.home-stick')
  const lift = () => stick.evaluate((node) => getComputedStyle(node).transform)
  expect(await lift()).toBe('none')
  await first.hover()
  await expect.poll(lift).toBe('matrix(1, 0, 0, 1, 0, -6)')
  await page.mouse.move(0, 0)
  await expect.poll(lift).toBe('none')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  const focused = page.locator(':focus')
  // Tab reaches the first chalk from the header's last control: the play
  // button of "CMMC in sixty seconds" comes after the chalks and the search.
  for (let step = 0; step < 12; step += 1) {
    if (await first.evaluate((node) => node === document.activeElement)) break
    await page.keyboard.press('Tab')
  }
  await expect(first).toBeFocused()
  await expect.poll(lift).toBe('matrix(1, 0, 0, 1, 0, -6)')
  expect(
    await focused.evaluate((node) => getComputedStyle(node).outlineStyle),
  ).toBe('solid')

  // "I run the systems" opens the Controls page in yellow and remembers it.
  await chalks.getByRole('link', { name: /^I run the systems/ }).click()
  await expect(page).toHaveURL(/view=discover/)
  await expect(page).toHaveURL(/mode=it-cyber/)
  const rail = page.getByRole('navigation', { name: 'All controls' })
  await expect(rail.getByRole('link', { name: /^[A-Z]{2} / })).toHaveCount(14)
  await expect(nav.getByRole('link', { name: 'Controls' })).toHaveAttribute(
    'aria-current',
    'page',
  )
  expect(
    await page.evaluate(() =>
      localStorage.getItem('cipher-and-chalk:chalk:v1'),
    ),
  ).toBe('it-cyber')
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])

  // A plain address later still opens in the remembered chalk.
  await page.goto(
    '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l1-b-1-i&tab=explain',
  )
  await expect(
    page.getByRole('tab', { name: 'I run the systems' }),
  ).toHaveAttribute('aria-selected', 'true')
})

test('“I’m new to this” opens Controls filtered to Level 1, the first basic on the board in white', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')
  await page
    .getByRole('list', { name: pick })
    .getByRole('link', { name: /^I’m new to this/ })
    .click()
  await expect(page).toHaveURL(/view=lesson/)
  await expect(page).toHaveURL(/control=ac-l1-b-1-i(?:&|$)/)
  await expect(page).toHaveURL(/mode=beginner/)
  await expect(page).toHaveURL(/level=Level\+1/)
  await expect(page).not.toHaveURL(/path=/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Authorized Access Control [FCI Data]',
  )
  const rail = page.getByRole('navigation', { name: 'All controls' })
  await expect(
    rail
      .getByRole('group', { name: 'Level' })
      .getByRole('link', { name: '1', exact: true }),
  ).toHaveAttribute('aria-current', 'true')
  await expect(
    rail.getByRole('link', { name: /^AC Access Control 4$/ }),
  ).toBeVisible()
  await expect(rail.getByRole('link', { name: /^AT / })).toContainText('0')
  await expect(rail.getByRole('link', { name: /^Start here/ })).toHaveCount(0)
  // The foot walks the fifteen basics in order, in the white chalk.
  await expect(page.getByRole('button', { name: /^Previous/ })).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Next: AC.L1-b.1.ii' }),
  ).toBeVisible()
  expect(
    await page.evaluate(() =>
      localStorage.getItem('cipher-and-chalk:chalk:v1'),
    ),
  ).toBe('beginner')
  // Explain opens in the white chalk, and the level filter stays.
  await page
    .getByRole('navigation', { name: 'Views of this control' })
    .getByRole('link', { name: 'Explain', exact: true })
    .click()
  await expect(
    page.getByRole('tab', { name: 'I’m new to this' }),
  ).toHaveAttribute('aria-selected', 'true')
  await expect(page).toHaveURL(/level=Level\+1/)
})

test('“CMMC in sixty seconds” plays in its panel beside the hero, every word 11px or more, and Home keeps one screen at 1280×800 and 1366×768', async ({
  page,
}) => {
  for (const [width, height] of [
    [1280, 800],
    [1366, 768],
  ] as const) {
    await page.setViewportSize({ width, height })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    const talk = page.getByRole('region', { name: sixty })
    await expect(talk).toBeVisible()
    // One screen, with the chalks and the search in view.
    expect(
      await page.evaluate(() => {
        const main = document.getElementById('main')!
        return main.scrollHeight - main.clientHeight
      }),
    ).toBeLessThanOrEqual(0)
    await expect(
      page.getByRole('searchbox', { name: 'Find a control' }),
    ).toBeInViewport()
    // A column beside the hero, from the kicker down to above the chalks,
    // with a hairline on its left; nothing in it larger than the headline.
    const column = (await page.locator('.home-talk').boundingBox())!
    const kicker = (await page
      .getByText('A free reference desk for cybersecurity compliance')
      .boundingBox())!
    const headline = (await page
      .getByRole('heading', { level: 1 })
      .boundingBox())!
    const pickBox = (await page.getByText(pick).boundingBox())!
    expect(column.x).toBeGreaterThan(headline.x + headline.width - 1)
    expect(Math.abs(column.y - kicker.y)).toBeLessThanOrEqual(6)
    expect(column.y + column.height).toBeLessThanOrEqual(pickBox.y + 1)
    expect(
      await page
        .locator('.home-talk')
        .evaluate((node) => getComputedStyle(node).borderLeftWidth),
    ).toBe('1px')
    const titleSize = parseFloat(
      await page
        .getByRole('heading', { level: 1 })
        .evaluate((node) => getComputedStyle(node).fontSize),
    )
    for (const text of await talk.locator('h2, p, button, span').all()) {
      const size = parseFloat(
        await text.evaluate((node) => getComputedStyle(node).fontSize),
      )
      expect(size).toBeLessThan(titleSize)
    }
    await expect(talk.getByRole('heading', { level: 2 })).toHaveText(sixty)
    // The panel is 397px wide: the title, the board (an image, the finished
    // clock, every word 11px or more, the wide arrangement), the player row,
    // the caption slot and the note, in that order.
    const panel = (await talk.boundingBox())!
    expect(Math.round(panel.width)).toBe(397)
    const board = talk.locator('svg.sixty-board')
    await expect(board).toHaveAttribute('role', 'img')
    await expect(board).toHaveAttribute('data-arrangement', 'wide')
    expect(await smallestWord(board)).toBeGreaterThanOrEqual(11)
    const boardBox = (await board.boundingBox())!
    expect(boardBox.x).toBeGreaterThanOrEqual(column.x)
    expect(boardBox.x + boardBox.width).toBeLessThanOrEqual(
      column.x + column.width + 1,
    )
    expect(boardBox.height).toBeGreaterThanOrEqual(170)
    const play = talk.getByRole('button', { name: 'Play', exact: true })
    const playBox = (await play.boundingBox())!
    expect(playBox.width).toBeGreaterThanOrEqual(44)
    expect(playBox.height).toBeGreaterThanOrEqual(44)
    expect(playBox.y).toBeGreaterThanOrEqual(boardBox.y + boardBox.height - 1)
    const slider = talk.getByRole('slider', { name: 'Seek' })
    expect((await slider.boundingBox())!.height).toBeGreaterThanOrEqual(44)
    await expect(talk.locator('.sixty-time')).toHaveText('1:00')
    await expect(talk.locator('.sixty-eyebrow')).toHaveText(
      '60 seconds · 8 parts',
    )
    const caption = (await talk
      .locator('.sixty-caption[aria-live]')
      .boundingBox())!
    expect(caption.y).toBeGreaterThanOrEqual(playBox.y + playBox.height - 1)
    await expect(talk.locator('.sixty-caption[aria-live]')).toHaveText(
      'Three years of CMMC Level 2, drawn in one minute.',
    )
    const note = (await talk.locator('.sixty-note').boundingBox())!
    expect(note.y).toBeGreaterThanOrEqual(caption.y + caption.height - 1)
    await expect(talk.locator('.sixty-note')).toContainText(
      'Shown: the Level 2 (C3PAO) cycle. Phase 2, which would require it, has been on hold since July 13, 2026.',
    )
    await expect(
      talk.locator('.sixty-note').getByRole('link', { name: 'Timeline' }),
    ).toHaveAttribute('href', '/timeline')
    // No dialog, no Close, nothing playing on its own.
    await expect(page.locator('dialog')).toHaveCount(0)
    await expect(talk.getByRole('button', { name: 'Close' })).toHaveCount(0)
    await page.waitForTimeout(700)
    await expect(talk.locator('.sixty-time')).toHaveText('1:00')
    await expect(play).toBeVisible()
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  }
})

test('Play clears the board with a pass of Smudge and draws in place: the panel keeps its box, the address stays, its keys stay inside, and focus never leaves the page', async ({
  page,
}) => {
  for (const [width, height] of [
    [1024, 768],
    [1280, 800],
  ] as const) {
    await page.setViewportSize({ width, height })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    const talk = page.getByRole('region', { name: sixty })
    await talk.scrollIntoViewIfNeeded()
    const before = (await talk.boundingBox())!
    const address = page.url()
    const play = talk.getByRole('button', { name: 'Play', exact: true })
    await play.click()
    // Playing from the button, with focus still on it, in the same panel.
    const pause = talk.getByRole('button', { name: 'Pause' })
    await expect(pause).toBeFocused()
    await expect(page.locator('dialog')).toHaveCount(0)
    await expect(talk.locator('.sixty-eyebrow')).toHaveText('Part 1 of 8 · Who')
    // Smudge's pass over, the time moves on and the stick draws at the tip.
    await expect(talk.locator('.sixty-time-now')).toHaveText(/^0:0[1-4]$/)
    await expect
      .poll(() =>
        talk.locator('.sixty-eraser').evaluate((node) => node.style.opacity),
      )
      .toBe('0')
    await expect
      .poll(() =>
        talk.locator('.sixty-stick').evaluate((node) => node.style.opacity),
      )
      .toBe('1')
    const after = (await talk.boundingBox())!
    expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(1)
    expect(Math.abs(after.height - before.height)).toBeLessThanOrEqual(1)
    expect(page.url()).toBe(address)
    // The page behind still scrolls as it did: no dialog holds it.
    expect(
      await page.evaluate(
        () => getComputedStyle(document.getElementById('main')!).overflowY,
      ),
    ).toBe('auto')
    // Its keys: Space pauses, the arrows skip, End reaches the end with Replay.
    await page.keyboard.press('Space')
    await expect(play).toBeVisible()
    await page.keyboard.press('ArrowRight')
    await expect(talk.locator('.sixty-time-now')).toHaveText(/^0:0[5-9]$/)
    await page.keyboard.press('End')
    await expect(talk.locator('.sixty-time-now')).toHaveText('1:00')
    await expect(talk.getByRole('button', { name: 'Replay' })).toBeVisible()
    await expect(talk.locator('.sixty-eyebrow')).toHaveText(
      'Part 8 of 8 · Bottom line',
    )
    // A glossary word in the caption opens its chalk popover; Escape closes
    // the popover and the panel stays.
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
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  }
})

test('on shorter laptop frames the panel never runs into the chalks, and on a phone it follows the search in the DOM', async ({
  page,
}) => {
  for (const [width, height] of [
    [1280, 720],
    [1024, 768],
  ] as const) {
    await page.setViewportSize({ width, height })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    const column = (await page.locator('.home-talk').boundingBox())!
    const pickBox = (await page.getByText(pick).boundingBox())!
    expect(column.y + column.height).toBeLessThanOrEqual(pickBox.y + 1)
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  expect(
    await page.evaluate(
      () =>
        document
          .querySelector('.home-search')!
          .compareDocumentPosition(document.querySelector('.home-talk')!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ),
  ).toBeTruthy()
})

test('the search line finds a control from Home', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')
  const search = page.getByRole('searchbox', { name: 'Find a control' })
  await expect(search).toHaveAttribute('placeholder', 'Or find a control…')
  await search.fill('MP.L1-b.1.vii')
  await search.press('Enter')
  await expect(page).toHaveURL(/view=discover/)
  await expect(page).toHaveURL(/q=MP\.L1-b\.1\.vii/)
  await expect(
    page.getByRole('status', { name: 'Control search results' }),
  ).toHaveText('1 control')
})

test('on a phone the headline is two lines, as large as the width allows, the chalks are rows, and the search follows them', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const title = page.getByRole('heading', { level: 1 })
  await expect(title).toHaveText('CMMC, in plain words.')
  await page.evaluate(() => document.fonts.ready)
  const size = parseFloat(
    await title.evaluate((node) => getComputedStyle(node).fontSize),
  )
  expect(size).toBeGreaterThanOrEqual(48)
  expect(size).toBeLessThanOrEqual(56)
  // Two lines: "CMMC," and "in plain words.", the second not wrapping.
  const headline = (await title.boundingBox())!
  expect(headline.height).toBeGreaterThan(size * 0.95 * 1.5)
  expect(headline.height).toBeLessThan(size * 0.95 * 2.5)
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390)
  const chalks = page.getByRole('list', { name: pick })
  for (const link of await chalks.getByRole('link').all()) {
    const box = (await link.boundingBox())!
    expect(box.height).toBeGreaterThanOrEqual(44)
    const stick = (await link.locator('.home-stick').boundingBox())!
    const line = (await link.locator('.home-chalk-line').boundingBox())!
    expect(line.x).toBeGreaterThan(stick.x + stick.width - 1)
  }
  const row = (await chalks.boundingBox())!
  const search = (await page.locator('.home-search').boundingBox())!
  expect(search.y).toBeGreaterThanOrEqual(row.y + row.height - 1)
  await expect(
    page.getByRole('searchbox', { name: 'Find a control' }),
  ).toBeVisible()
  // "CMMC in sixty seconds" follows the search, full width, and waits for play.
  const talk = page.getByRole('region', { name: sixty })
  const talkBox = (await talk.boundingBox())!
  expect(talkBox.y).toBeGreaterThanOrEqual(search.y + search.height - 1)
  expect(talkBox.width).toBeGreaterThanOrEqual(340)
  await expect(
    talk.getByRole('button', { name: 'Play', exact: true }),
  ).toBeVisible()
  await expect(talk.getByText('1:00')).toBeVisible()
  await expect(page.locator('dialog')).toHaveCount(0)
  const tray = page.locator('.chalk-tray')
  await tray.scrollIntoViewIfNeeded()
  const box = (await tray.boundingBox())!
  const height = await page.evaluate(
    () => document.documentElement.scrollHeight,
  )
  expect(
    Math.round(
      box.y + box.height + (await page.evaluate(() => window.scrollY)),
    ),
  ).toBe(height)
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
})

test('on a phone the panel is the width of the page, the board stacks the clock under scene 1, and no word is under 11px at 390 or 320', async ({
  page,
}) => {
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    const talk = page.getByRole('region', { name: sixty })
    await talk.scrollIntoViewIfNeeded()
    const panel = (await talk.boundingBox())!
    expect(Math.round(panel.width)).toBe(width - 40)
    const board = talk.locator('svg.sixty-board')
    await expect(board).toHaveAttribute('data-arrangement', 'narrow')
    expect(await smallestWord(board)).toBeGreaterThanOrEqual(11)
    // The clock stands under the words of scene 1, above the bottom line.
    const tops = await board.evaluate((svg) => {
      const top = (label: string) =>
        Array.from(svg.querySelectorAll('text'))
          .find((text) => text.textContent === label)!
          .getBoundingClientRect().top
      return {
        dod: top('DoD'),
        sprs: top('SPRS'),
        bottom: top('no current status = no contract'),
      }
    })
    expect(tops.dod).toBeLessThan(tops.sprs)
    expect(tops.sprs).toBeLessThan(tops.bottom)
    await expect(page.locator('dialog')).toHaveCount(0)
    for (const control of [
      talk.getByRole('button', { name: 'Play', exact: true }),
      talk.getByRole('button', { name: /^Playback speed/ }),
      talk.getByRole('slider', { name: 'Seek' }),
    ]) {
      const box = (await control.boundingBox())!
      expect(box.height).toBeGreaterThanOrEqual(44)
      expect(box.width).toBeGreaterThanOrEqual(44)
    }
    // Under 340px the time drops out; the slider keeps its value text.
    if (width === 320) await expect(talk.locator('.sixty-time')).toBeHidden()
    else await expect(talk.locator('.sixty-time')).toHaveText('1:00')
    await expect(talk.getByRole('slider', { name: 'Seek' })).toHaveAttribute(
      'aria-valuetext',
      '0:00, Who',
    )
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width)
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  }
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('the drawing starts at 0:00 with no pass and shows each part finished as the time runs, with no chalk stick, Smudge, sector or pulse', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    const talk = page.getByRole('region', { name: sixty })
    await talk.getByRole('button', { name: 'Play', exact: true }).click()
    await expect(talk.getByRole('button', { name: 'Pause' })).toBeFocused()
    // Paused at the start of part two, everything up to it stands whole and
    // nothing after it has begun.
    await page.keyboard.press('Space')
    await page.keyboard.press('PageDown')
    await expect(talk.locator('.sixty-eyebrow')).toHaveText(
      'Part 2 of 8 · Levels',
    )
    const board = talk.locator('svg.sixty-board')
    const items = await board.evaluate((svg) =>
      Array.from(svg.querySelectorAll<SVGElement>('[data-t]')).map((el) => ({
        start: Number(el.getAttribute('data-t')!.split(',')[0]),
        drawn: el.getAttribute('data-drawn'),
      })),
    )
    expect(items.length).toBeGreaterThan(40)
    for (const item of items)
      expect(item.drawn).toBe(item.start <= 7 ? 'done' : 'none')
    // A finished stroke has no dash offset left; a finished label's clip is its full width.
    const whole = await board.evaluate((svg) =>
      Array.from(svg.querySelectorAll<SVGElement>('[data-drawn="done"]')).every(
        (el) => {
          const box = el.getBoundingClientRect()
          return box.width > 0 && box.height > 0
        },
      ),
    )
    expect(whole).toBe(true)
    await expect(talk.locator('.sixty-stick')).toHaveCSS('opacity', '0')
    await expect(talk.locator('.sixty-eraser')).toHaveCSS('opacity', '0')
    await expect(talk.locator('.sixty-wedge')).toHaveCSS('opacity', '0')
    await expect(talk.locator('.sixty-glow')).toHaveCSS('opacity', '0')
    // The end stands whole too.
    await page.keyboard.press('End')
    const unfinished = await board.evaluate(
      (svg) => svg.querySelectorAll('[data-t]:not([data-drawn="done"])').length,
    )
    expect(unfinished).toBe(0)
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  })
  test('the stick stays put and the focus ring still shows', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    const first = page
      .getByRole('list', { name: pick })
      .getByRole('link')
      .first()
    await first.hover()
    await page.waitForTimeout(200)
    expect(
      await first
        .locator('.home-stick')
        .evaluate((node) => getComputedStyle(node).transform),
    ).toBe('none')
    await first.focus()
    expect(
      await first.evaluate((node) => getComputedStyle(node).outlineStyle),
    ).not.toBe('none')
  })
})
