import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const pick = 'Pick up a chalk to start.'

test('home puts one thing first on one screen at 1280×800, and a chalk picks the one the next control opens in', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')
  const title = page.getByRole('heading', { level: 1 })
  await expect(title).toHaveText('CMMC, in plain words.')
  await page.evaluate(() => document.fonts.ready)
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  // Sized from the hero's own width beside the chalk talk: about 100px here.
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
  // Tab reaches the first chalk from the header's last control: the chalk
  // talk's controls come after the chalks and the search.
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

test('“CMMC in sixty seconds” stands beside the hero, plays once from the top, and its dashes jump to a scene', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  const talk = page.getByRole('region', { name: 'CMMC in sixty seconds' })
  await expect(talk).toBeVisible()
  // A column beside the hero, from the kicker down to above the chalks, with
  // a hairline on its left; nothing in it larger than the headline.
  const column = (await page.locator('.home-talk').boundingBox())!
  const kicker = (await page
    .getByText('A free reference desk for cybersecurity compliance')
    .boundingBox())!
  const headline = (await page
    .getByRole('heading', { level: 1 })
    .boundingBox())!
  const pick = (await page
    .getByText('Pick up a chalk to start.')
    .boundingBox())!
  expect(column.x).toBeGreaterThan(headline.x + headline.width - 1)
  expect(Math.abs(column.y - kicker.y)).toBeLessThanOrEqual(6)
  expect(column.y + column.height).toBeLessThanOrEqual(pick.y + 1)
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
  for (const text of await talk.locator('h2, p, li, button, span').all()) {
    const size = parseFloat(
      await text.evaluate((node) => getComputedStyle(node).fontSize),
    )
    expect(size).toBeLessThan(titleSize)
  }
  // Playing from the top: pause is there, the time moves, the drawing is
  // hidden from assistive technology, and nothing is announced.
  const pause = talk.getByRole('button', { name: 'Pause' })
  await expect(pause).toBeVisible()
  const pauseBox = (await pause.boundingBox())!
  expect(pauseBox.width).toBeGreaterThanOrEqual(44)
  expect(pauseBox.height).toBeGreaterThanOrEqual(44)
  await expect(talk.locator('.chalk-talk-drawing')).toHaveAttribute(
    'aria-hidden',
    'true',
  )
  await expect(talk.locator('[aria-live]')).toHaveCount(0)
  await expect(talk.locator('.chalk-talk-time')).not.toHaveText('0:00 / 1:00')
  // Paused, a dash jumps to its scene, which stands drawn.
  await pause.click()
  const playButton = talk.getByRole('button', { name: 'Play' })
  await expect(playButton).toBeVisible()
  const dashes = talk.getByRole('list', { name: 'Scenes' }).getByRole('button')
  await expect(dashes).toHaveCount(8)
  await dashes.nth(5).click()
  await expect(dashes.nth(5)).toHaveAttribute('aria-current', 'step')
  await expect(talk.locator('li[aria-current="step"]')).toContainText(
    'Meeting the minimum score earns a status',
  )
  // A glossary word in the caption carries its popover.
  await talk
    .locator('li[aria-current="step"]')
    .getByRole('button', { name: 'SPRS' })
    .click()
  await expect(page.getByRole('dialog')).toContainText(
    'Supplier Performance Risk System',
  )
  await page.keyboard.press('Escape')
  await playButton.click()
  await expect(pause).toBeVisible()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
})

test('on shorter laptop frames the talk never runs into the chalks, and on a phone it follows the search in the DOM', async ({
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
    const pick = (await page
      .getByText('Pick up a chalk to start.')
      .boundingBox())!
    expect(column.y + column.height).toBeLessThanOrEqual(pick.y + 1)
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
  // The chalk talk follows the search, full width, and waits for play.
  const talk = page.getByRole('region', { name: 'CMMC in sixty seconds' })
  const talkBox = (await talk.boundingBox())!
  expect(talkBox.y).toBeGreaterThanOrEqual(search.y + search.height - 1)
  expect(talkBox.width).toBeGreaterThanOrEqual(340)
  await expect(talk.getByRole('button', { name: 'Play' })).toBeVisible()
  await expect(talk.locator('.chalk-talk-time')).toHaveText('0:00 / 1:00')
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

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('the chalk talk does not play: the finished drawing with the captions stepped by Previous and Next', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    const talk = page.getByRole('region', { name: 'CMMC in sixty seconds' })
    await expect(talk).toBeVisible()
    await expect(talk.getByRole('button', { name: /Play|Pause/ })).toHaveCount(
      0,
    )
    await expect(talk.locator('.chalk-talk-drawing text')).toHaveCount(11)
    for (const text of await talk.locator('.chalk-talk-drawing text').all())
      expect(
        await text.evaluate((node) => getComputedStyle(node).visibility),
      ).toBe('visible')
    for (const part of await talk.locator('.chalk-talk-drawing g[style]').all())
      expect(await part.getAttribute('style')).not.toMatch(/hidden|clip-path/)
    const next = talk.getByRole('button', { name: 'Next' })
    await expect(
      talk.getByRole('button', { name: 'Previous' }),
    ).toHaveAttribute('aria-disabled', 'true')
    await next.click()
    await expect(talk.locator('li[aria-current="step"]')).toContainText(
      'Some of it is Federal Contract Information',
    )
    await expect(talk.locator('.chalk-talk-time')).toHaveText('2 / 8')
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
