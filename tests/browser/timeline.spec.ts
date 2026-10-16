import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('the timeline is one screen at 1280×800, with its sources a disclosure away', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/timeline')
  await expect(page.getByRole('list', { name: 'CMMC dates' })).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  // One screen: the content fits its frame with nothing to scroll.
  expect(
    await page.evaluate(() => {
      const main = document.getElementById('main')!
      return main.scrollHeight - main.clientHeight
    }),
  ).toBeLessThanOrEqual(0)
  const first = page.locator('.timeline-sources').first()
  await first.locator('summary').focus()
  await page.keyboard.press('Enter')
  await expect(first).toHaveJSProperty('open', true)
  await expect(first.getByRole('link').first()).toBeVisible()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
})

test('the suspended phases are struck and marked "On hold", under forced colours and in print too, and the page stays one screen', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/timeline')
  const list = page.getByRole('list', { name: 'CMMC dates' })
  await expect(list).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  const held = list.locator('[data-status="suspended"]')
  await expect(held).toHaveCount(3)
  const marks = held.locator('.timeline-hold')
  await expect(marks).toHaveCount(3)
  for (const mark of await marks.all()) await expect(mark).toBeVisible()
  const strike = held.first().locator('h3 s')
  const decoration = () =>
    strike.evaluate((node) => getComputedStyle(node).textDecorationLine)
  expect(await decoration()).toBe('line-through')
  await expect(
    page.getByText(/^Phases 2–4 show the rule’s original schedule/),
  ).toBeVisible()
  expect(
    await page.evaluate(() => {
      const main = document.getElementById('main')!
      return main.scrollHeight - main.clientHeight
    }),
  ).toBeLessThanOrEqual(0)
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  // Forced colours: the mark keeps its border and the strike its line.
  await page.emulateMedia({ forcedColors: 'active' })
  expect(
    await marks
      .first()
      .evaluate((node) => parseFloat(getComputedStyle(node).borderTopWidth)),
  ).toBeGreaterThanOrEqual(1)
  expect(await decoration()).toBe('line-through')
  // Print: black on white, the mark and the strike still there.
  await page.emulateMedia({ forcedColors: 'none', media: 'print' })
  expect(
    await marks.first().evaluate((node) => {
      const style = getComputedStyle(node)
      return [style.color, style.borderTopColor]
    }),
  ).toEqual(['rgb(0, 0, 0)', 'rgb(0, 0, 0)'])
  expect(await decoration()).toBe('line-through')
})

for (const width of [320, 390]) {
  test(`at ${width}px the six places to go are reachable and the timeline stacks`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 700 })
    await page.goto('/timeline')
    await expect(page.getByRole('list', { name: 'CMMC dates' })).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width)
    const nav = page.getByRole('navigation', { name: 'Main' })
    for (const name of [
      'Home',
      'Controls',
      'Glossary',
      'Practice',
      'Timeline',
      'About',
    ])
      await expect(nav.getByRole('link', { name })).toBeVisible()
    // On a phone the places wrap onto a second row, as the control page's tabs do.
    const box = (await nav.boundingBox())!
    expect(box.height).toBeLessThanOrEqual(96)
  })
}
