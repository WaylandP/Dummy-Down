import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('on a desktop the board column stands beside the sentences', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/about')
  const aside = page.getByRole('complementary', {
    name: 'What’s next on the board',
  })
  await expect(aside).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  const text = (await page
    .getByRole('heading', { name: 'A little clarity goes a long way.' })
    .boundingBox())!
  const column = (await aside.boundingBox())!
  expect(column.x).toBeGreaterThan(text.x + text.width)
  expect(column.y).toBeLessThan(text.y + text.height)
  await expect(aside.getByRole('list', { name: 'On the board' })).toBeVisible()
  await expect(aside.getByRole('list', { name: 'Later' })).toContainText(
    'NIST SP 800-53',
  )
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
})

test('on a phone the board column follows the sentences without overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/about')
  const aside = page.getByRole('complementary', {
    name: 'What’s next on the board',
  })
  await page.evaluate(() => document.fonts.ready)
  const chalks = (await page
    .getByRole('heading', { name: 'Pick a chalk.' })
    .boundingBox())!
  const column = (await aside.boundingBox())!
  expect(column.y).toBeGreaterThan(chalks.y)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  )
  await aside.scrollIntoViewIfNeeded()
  const suggest = aside.getByRole('link', {
    name: /Suggest something on GitHub/,
  })
  const target = (await suggest.boundingBox())!
  expect(target.height).toBeGreaterThanOrEqual(44)
  expect(
    await suggest.evaluate((node) => getComputedStyle(node).fontSize),
  ).toBe('12px')
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
})

test('at the smallest desktop frame the column stands beside the text and the page still scrolls', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1024, height: 640 })
  await page.goto('/about')
  const aside = page.getByRole('complementary', {
    name: 'What’s next on the board',
  })
  await page.evaluate(() => document.fonts.ready)
  const text = (await page
    .getByRole('heading', { name: 'A little clarity goes a long way.' })
    .boundingBox())!
  const column = (await aside.boundingBox())!
  expect(column.x).toBeGreaterThan(text.x + text.width)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    1024,
  )
  const main = page.locator('#main')
  expect(
    await main.evaluate((node) => node.scrollHeight > node.clientHeight),
  ).toBe(true)
  await page.keyboard.press('PageDown')
  await expect
    .poll(() => main.evaluate((node) => node.scrollTop))
    .toBeGreaterThan(0)
})
