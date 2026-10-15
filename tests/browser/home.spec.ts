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
  await expect(page.getByRole('heading')).toHaveCount(1)
  expect(await title.evaluate((node) => getComputedStyle(node).fontSize)).toBe(
    '112px',
  )
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
  // Tab reaches the first chalk from the header's last control.
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
