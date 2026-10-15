import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('home asks who is reading on one screen at 1280×800, and a row picks the chalk the next control opens in', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Who’s reading?' }),
  ).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  // One screen: the content fits its frame with nothing to scroll.
  expect(
    await page.evaluate(() => {
      const main = document.getElementById('main')!
      return main.scrollHeight - main.clientHeight
    }),
  ).toBeLessThanOrEqual(0)
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
  const rows = page.getByRole('navigation', { name: 'Who’s reading?' })
  await expect(rows.getByRole('link')).toHaveCount(3)
  // The stick, the line and the link read left to right on one row.
  const first = rows.getByRole('link').first()
  const stick = (await first.locator('.home-stick').boundingBox())!
  const go = (await first.locator('.home-row-go').boundingBox())!
  expect(go.x).toBeGreaterThan(stick.x + stick.width)
  expect(
    Math.abs(go.y + go.height / 2 - (stick.y + stick.height / 2)),
  ).toBeLessThan(40)
  await expect(page.getByRole('contentinfo')).toContainText(
    'Independent and educational.',
  )
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])

  // "I run the systems." opens the Controls page in yellow and remembers it.
  await rows.getByRole('link', { name: /^I run the systems\./ }).click()
  await expect(page).toHaveURL(/view=discover/)
  await expect(page).toHaveURL(/mode=it-cyber/)
  await expect(
    page
      .getByRole('navigation', { name: 'Control families' })
      .getByRole('link'),
  ).toHaveCount(15)
  await expect(nav.getByRole('link', { name: 'Controls' })).toHaveAttribute(
    'aria-current',
    'page',
  )
  expect(
    await page.evaluate(() =>
      localStorage.getItem('cipher-and-chalk:chalk:v1'),
    ),
  ).toBe('it-cyber')
  // One screen: the content fits its frame with nothing to scroll.
  expect(
    await page.evaluate(() => {
      const main = document.getElementById('main')!
      return main.scrollHeight - main.clientHeight
    }),
  ).toBeLessThanOrEqual(0)
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])

  // A family filters in place; the next control opens in the yellow chalk.
  await page
    .getByRole('navigation', { name: 'Control families' })
    .getByRole('link', { name: /Media Protection/ })
    .click()
  await expect(page).toHaveURL(/family=MP/)
  await expect(
    page.getByRole('status', { name: 'Control search results' }),
  ).toHaveText('10 references found')
  await page.getByRole('button', { name: /MP\.L1-b\.1\.vii/ }).click()
  await expect(page).toHaveURL(/control=mp-l1-b-1-vii/)
  await expect(page).toHaveURL(/mode=it-cyber/)
  await expect(nav.getByRole('link', { name: 'Controls' })).toHaveAttribute(
    'aria-current',
    'page',
  )

  // A plain address later still opens in the remembered chalk.
  await page.goto(
    '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l1-b-1-i&tab=explain',
  )
  await expect(
    page.getByRole('tab', { name: 'I run the systems' }),
  ).toHaveAttribute('aria-selected', 'true')
})

test('on a phone the rows stack with the stick above the line, and the tray is the bottom bar', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Who’s reading?' }),
  ).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390)
  const first = page
    .getByRole('navigation', { name: 'Who’s reading?' })
    .getByRole('link')
    .first()
  const stick = (await first.locator('.home-stick').boundingBox())!
  const line = (await first.locator('.home-row-line').boundingBox())!
  expect(line.y).toBeGreaterThan(stick.y + stick.height - 1)
  expect(Math.abs(line.x - stick.x)).toBeLessThan(2)
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
