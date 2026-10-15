import { expect, test } from '@playwright/test'

const control =
  '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l1-b-1-i&mode=beginner'

/** Every gesture Dash makes is recorded as it is set, since each lasts well under a second. */
async function watchGestures(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    const dash = document.querySelector('.dash')!
    const seen: string[] = []
    ;(window as unknown as { dashGestures: string[] }).dashGestures = seen
    new MutationObserver(() => {
      const gesture = dash.getAttribute('data-gesture')
      if (gesture) seen.push(gesture)
    }).observe(dash, { attributes: true, attributeFilter: ['data-gesture'] })
  })
}
const gestures = (page: import('@playwright/test').Page) =>
  page.evaluate(
    () => (window as unknown as { dashGestures: string[] }).dashGestures,
  )

test('Dash is the white chalk in the tray: blinks, sweeps on Erase, hands over a chalk, and is still when switched off', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(control)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const dash = page.locator('.chalk-tray .dash')
  await expect(dash).toHaveAttribute('aria-hidden', 'true')
  await expect(dash).toHaveCount(1)
  const tray = (await page.locator('.chalk-tray').boundingBox())!
  const box = (await dash.boundingBox())!
  expect(box.y).toBeGreaterThanOrEqual(tray.y - 6)
  expect(box.y + box.height).toBeLessThanOrEqual(tray.y + tray.height + 1)
  expect(await dash.locator('.dash-eye').count()).toBe(2)
  await expect(dash).not.toHaveAttribute('data-gesture', /./)
  await watchGestures(page)
  await page.getByRole('button', { name: /^Next: / }).click()
  await expect.poll(() => gestures(page)).toContain('sweep')
  await expect(dash).not.toHaveAttribute('data-gesture', /./)
  await page
    .getByRole('navigation', { name: 'Pick a chalk' })
    .getByRole('button', { name: /yellow chalk/ })
    .click()
  await expect.poll(() => gestures(page)).toContain('hand')
  // The footer switch: off is a stub, remembered for the next visit.
  const toggle = page.getByRole('switch', { name: 'Dash' })
  await expect(toggle).toHaveAttribute('aria-checked', 'true')
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-checked', 'false')
  await expect(dash).toHaveClass(/is-still/)
  await expect(dash.locator('.dash-eye').first()).toBeHidden()
  await page.reload()
  await expect(page.locator('.chalk-tray .dash')).toHaveClass(/is-still/)
  await page.getByRole('switch', { name: 'Dash' }).click()
  await expect(page.locator('.chalk-tray .dash')).not.toHaveClass(/is-still/)
  // Print: the tray, and Dash with it, is off the sheet.
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('.chalk-tray')).toBeHidden()
})

test.describe('under reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('Dash is a plain stub that makes no gesture', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto(control)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const dash = page.locator('.chalk-tray .dash')
    await expect(dash.locator('.dash-eye').first()).toBeHidden()
    await watchGestures(page)
    const title = page.getByRole('heading', { level: 1 })
    const before = await title.textContent()
    await page.getByRole('button', { name: /^Next: / }).click()
    await expect(title).not.toHaveText(before ?? '')
    expect(await gestures(page)).toEqual([])
  })
})

test('on a phone Dash is the white chalk of the bottom bar', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(control)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const pick = page
    .getByRole('navigation', { name: 'Pick a chalk' })
    .getByRole('button', { name: /white chalk/ })
  const dash = pick.locator('.dash')
  await expect(dash).toHaveCount(1)
  const box = (await dash.boundingBox())!
  expect(box.width).toBeLessThanOrEqual(48)
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390)
})
