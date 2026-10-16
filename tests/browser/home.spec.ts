import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

const pick = 'Pick up a chalk to start.'
const sixty = 'CMMC in sixty seconds'
const boardTitle = 'CMMC in sixty seconds: the Level 2 clock'

/** The smallest word on a board, in CSS pixels, counting only the words shown in its layout. */
async function smallestWord(board: Locator): Promise<number> {
  return board.evaluate((svg: SVGSVGElement) => {
    const outer = svg.getScreenCTM()!
    return Math.min(
      ...Array.from(svg.querySelectorAll('text'))
        .filter((text) => getComputedStyle(text).visibility !== 'hidden')
        .map(
          (text) =>
            Number(text.getAttribute('font-size')) *
            Math.hypot(outer.a, outer.b) *
            // The notes scale up where the clock stacks above them.
            (text.getScreenCTM()!.a / outer.a),
        ),
    )
  })
}

async function openSixty(page: Page) {
  await page.getByRole('button', { name: 'Play', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: boardTitle })
  await expect(dialog).toBeVisible()
  return dialog
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

test('“CMMC in sixty seconds” stands beside the hero as a still of the clock, every word 11px or more, and Home keeps one screen at 1280×800 and 1366×768', async ({
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
    // The still: the finished dial, hidden from assistive technology, every
    // word on it at least 11px, inside the column.
    const still = talk.locator('svg.sixty-still-art')
    await expect(still).toHaveAttribute('aria-hidden', 'true')
    const words = await still.evaluate((svg: SVGSVGElement) => {
      const box = svg.getBoundingClientRect()
      const view = svg.viewBox.baseVal
      const scale = Math.min(box.width / view.width, box.height / view.height)
      return Array.from(svg.querySelectorAll('text')).map((text) => ({
        text: text.textContent,
        px: Number(text.getAttribute('font-size')) * scale,
      }))
    })
    expect(words.map((word) => word.text)).toEqual([
      'SPRS',
      'year 1',
      'year 2',
      'year 3',
      'C3PAO',
      'current',
      '3 yrs: recertify',
    ])
    for (const word of words) expect(word.px).toBeGreaterThanOrEqual(11)
    const stillBox = (await still.boundingBox())!
    expect(stillBox.x).toBeGreaterThanOrEqual(column.x)
    expect(stillBox.x + stillBox.width).toBeLessThanOrEqual(
      column.x + column.width + 1,
    )
    expect(stillBox.height).toBeGreaterThanOrEqual(280)
    // Under it, a 44px play button, the length and one line; nothing plays
    // on its own and nothing is announced.
    const play = talk.getByRole('button', { name: 'Play' })
    const playBox = (await play.boundingBox())!
    expect(playBox.width).toBeGreaterThanOrEqual(44)
    expect(playBox.height).toBeGreaterThanOrEqual(44)
    expect(playBox.y).toBeGreaterThanOrEqual(stillBox.y + stillBox.height - 1)
    await expect(talk.getByText('1:00')).toBeVisible()
    await expect(
      talk.getByText('Three years of CMMC Level 2, drawn in one minute.'),
    ).toBeVisible()
    await expect(page.locator('dialog')).toHaveCount(0)
    await expect(talk.locator('[aria-live]')).toHaveCount(0)
  }
})

test('play opens the drawing in a dialog from 0:00 that fits without scrolling at 1024×768 and 1280×800; its keys stay inside; Escape closes it and focus returns', async ({
  page,
}) => {
  for (const [width, height] of [
    [1024, 768],
    [1280, 800],
  ] as const) {
    await page.setViewportSize({ width, height })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    const play = page.getByRole('button', { name: 'Play' })
    const dialog = await openSixty(page)
    await expect(dialog.getByRole('button', { name: 'Pause' })).toBeFocused()
    // From 0:00, playing: the first part, and the time moving on.
    await expect(dialog.locator('.sixty-eyebrow')).toHaveText(
      'Part 1 of 8 · Who',
    )
    await expect(dialog.locator('.sixty-time')).toHaveText(/^0:0[0-2] \/ 1:00$/)
    await expect(dialog.locator('.sixty-time')).not.toHaveText('0:00 / 1:00')
    await expect(dialog.getByRole('slider', { name: 'Seek' })).toHaveAttribute(
      'aria-valuetext',
      /, Who$/,
    )
    // The chalk stick draws at the tip.
    await expect
      .poll(() =>
        dialog
          .locator('.sixty-stick')
          .evaluate((node) => getComputedStyle(node).opacity),
      )
      .toBe('1')
    // Board, player, caption and note all fit without scrolling; the board
    // is no wider than a thousand pixels or 92% of the screen.
    expect(
      await dialog.evaluate((node) => node.scrollHeight - node.clientHeight),
    ).toBeLessThanOrEqual(0)
    const note = (await dialog.locator('.sixty-note').boundingBox())!
    expect(note.y + note.height).toBeLessThanOrEqual(height)
    await expect(dialog.locator('.sixty-note')).toContainText(
      'Shown: the Level 2 (C3PAO) cycle. Phase 2, which would require it, has been on hold since July 13, 2026.',
    )
    await expect(
      dialog.locator('.sixty-note').getByRole('link', { name: 'Timeline' }),
    ).toHaveAttribute('href', '/timeline')
    const board = dialog.locator('svg.sixty-board')
    const boardBox = (await board.boundingBox())!
    expect(boardBox.width).toBeLessThanOrEqual(Math.min(1000, 0.92 * width) + 1)
    expect(boardBox.width).toBeGreaterThan(600)
    await expect(board).toHaveAttribute('viewBox', '0 0 960 600')
    expect(await smallestWord(board)).toBeGreaterThanOrEqual(11)
    // The page behind holds still.
    expect(
      await page.evaluate(
        () => getComputedStyle(document.getElementById('main')!).overflowY,
      ),
    ).toBe('hidden')
    // Every control a 44px target.
    for (const control of [
      dialog.getByRole('button', { name: 'Pause' }),
      dialog.getByRole('button', { name: 'Close' }),
      dialog.getByRole('button', { name: /^Playback speed/ }),
      dialog.getByRole('slider', { name: 'Seek' }),
    ]) {
      const box = (await control.boundingBox())!
      expect(box.height).toBeGreaterThanOrEqual(44)
      expect(box.width).toBeGreaterThanOrEqual(44)
    }
    // Its keys: Space pauses, the arrows skip, End reaches the end with Replay.
    await page.keyboard.press('Space')
    await expect(
      dialog.getByRole('button', { name: 'Play', exact: true }),
    ).toBeVisible()
    await page.keyboard.press('ArrowRight')
    await expect(dialog.locator('.sixty-time')).toHaveText(/^0:0[5-7] \/ 1:00$/)
    await page.keyboard.press('End')
    await expect(dialog.locator('.sixty-time')).toHaveText('1:00 / 1:00')
    await expect(dialog.getByRole('button', { name: 'Replay' })).toBeVisible()
    await expect(dialog.locator('.sixty-eyebrow')).toHaveText(
      'Part 8 of 8 · Bottom line',
    )
    // The site's own keys wait: "?" opens nothing, "/" moves nothing.
    await page.keyboard.press('?')
    await expect(page.getByRole('dialog', { name: 'Keys' })).toHaveCount(0)
    await page.keyboard.press('/')
    await expect(
      page.getByRole('searchbox', { name: 'Find a control' }),
    ).not.toBeFocused()
    // A glossary word in the caption opens its chalk popover, and Escape
    // closes the popover first.
    await dialog
      .locator('.sixty-caption')
      .getByRole('button', { name: 'SPRS' })
      .click()
    await expect(page.locator('.chalk-popover')).toContainText(
      'Supplier Performance Risk System',
    )
    await page.keyboard.press('Escape')
    await expect(page.locator('.chalk-popover')).toHaveCount(0)
    await expect(dialog).toBeVisible()
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(play).toBeFocused()
    expect(
      await page.evaluate(
        () => getComputedStyle(document.getElementById('main')!).overflowY,
      ),
    ).toBe('auto')
  }
})

test('on shorter laptop frames the still never runs into the chalks, and on a phone it follows the search in the DOM', async ({
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
  ).toHaveText('1 reference found')
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
  await expect(talk.getByRole('button', { name: 'Play' })).toBeVisible()
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

test('on a phone the drawing is a full-screen sheet, the clock above the notes, the player docked in reach, no word under 11px at 390', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  const play = page.getByRole('button', { name: 'Play' })
  await play.scrollIntoViewIfNeeded()
  const dialog = await openSixty(page)
  const sheet = (await dialog.boundingBox())!
  expect(sheet.x).toBe(0)
  expect(sheet.y).toBe(0)
  expect(sheet.width).toBe(390)
  expect(sheet.height).toBe(844)
  const board = dialog.locator('svg.sixty-board')
  await expect(board).toHaveAttribute('viewBox', '0 0 520 1275')
  await expect(board).toHaveAttribute('data-narrow', 'true')
  expect(await smallestWord(board)).toBeGreaterThanOrEqual(11)
  // The clock stands above the notes.
  const tops = await board.evaluate((svg) => {
    const top = (label: string) =>
      Array.from(svg.querySelectorAll('text'))
        .find((text) => text.textContent === label)!
        .getBoundingClientRect().top
    return { sprs: top('SPRS'), dod: top('DoD') }
  })
  expect(tops.sprs).toBeLessThan(tops.dod)
  await expect(board.locator('.po')).toHaveCSS('visibility', 'visible')
  await expect(board.locator('.lo')).toHaveCSS('visibility', 'hidden')
  // The sheet scrolls, and the player stays in reach at its foot.
  expect(
    await dialog.evaluate((node) => node.scrollHeight - node.clientHeight),
  ).toBeGreaterThan(0)
  await expect(dialog.locator('.sixty-dock')).toHaveCSS('position', 'sticky')
  const pause = dialog.getByRole('button', { name: 'Pause' })
  const before = (await pause.boundingBox())!
  expect(before.y + before.height).toBeLessThanOrEqual(844)
  await dialog.evaluate((node) => node.scrollTo(0, 400))
  const after = (await pause.boundingBox())!
  expect(after.y).toBeGreaterThanOrEqual(0)
  expect(after.y + after.height).toBeLessThanOrEqual(844)
  for (const control of [
    pause,
    dialog.getByRole('button', { name: 'Close' }),
    dialog.getByRole('button', { name: /^Playback speed/ }),
    dialog.getByRole('slider', { name: 'Seek' }),
  ]) {
    const box = (await control.boundingBox())!
    expect(box.height).toBeGreaterThanOrEqual(44)
    expect(box.width).toBeGreaterThanOrEqual(44)
  }
  expect(
    await page.evaluate(() => getComputedStyle(document.body).overflowY),
  ).toBe('hidden')
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await dialog.getByRole('button', { name: 'Close' }).click()
  await expect(dialog).toHaveCount(0)
  await expect(play).toBeFocused()
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('the drawing shows each part finished as the time runs, with no chalk stick, sector or pulse', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    const dialog = await openSixty(page)
    await expect(dialog.getByRole('button', { name: 'Pause' })).toBeFocused()
    // Paused at the start of part two, everything up to it stands whole and
    // nothing after it has begun.
    await page.keyboard.press('Space')
    await page.keyboard.press('PageDown')
    await expect(dialog.locator('.sixty-eyebrow')).toHaveText(
      'Part 2 of 8 · Levels',
    )
    const board = dialog.locator('svg.sixty-board')
    const items = await board.evaluate((svg) =>
      Array.from(svg.querySelectorAll<SVGElement>('[data-t]')).map((el) => ({
        start: Number(el.getAttribute('data-t')!.split(',')[0]),
        drawn: el.getAttribute('data-drawn'),
        hidden: getComputedStyle(el).visibility === 'hidden',
      })),
    )
    expect(items.length).toBeGreaterThan(40)
    for (const item of items)
      expect(item.drawn).toBe(item.start <= 7 ? 'done' : 'none')
    // A finished stroke has no dash offset left; a finished label's clip is its full width.
    const whole = await board.evaluate((svg) =>
      Array.from(svg.querySelectorAll<SVGElement>('[data-drawn="done"]'))
        .filter((el) => getComputedStyle(el).visibility !== 'hidden')
        .every((el) => {
          const box = el.getBoundingClientRect()
          return box.width > 0 && box.height > 0
        }),
    )
    expect(whole).toBe(true)
    await expect(dialog.locator('.sixty-stick')).toHaveCSS('opacity', '0')
    await expect(dialog.locator('.sixty-wedge')).toHaveCSS('opacity', '0')
    await expect(dialog.locator('.sixty-glow')).toHaveCSS('opacity', '0')
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
