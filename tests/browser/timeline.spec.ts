import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('the timeline is one screen at 1280×800, with its sources a disclosure away', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/timeline')
  await expect(page.getByRole('list', { name: 'CMMC dates' })).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight),
  ).toBeLessThanOrEqual(800)
  const first = page.locator('.timeline-sources').first()
  await first.locator('summary').focus()
  await page.keyboard.press('Enter')
  await expect(first).toHaveJSProperty('open', true)
  await expect(first.getByRole('link').first()).toBeVisible()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
})

for (const width of [320, 390]) {
  test(`at ${width}px the seven places to go are reachable and the timeline stacks`, async ({
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
      'Learn',
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
