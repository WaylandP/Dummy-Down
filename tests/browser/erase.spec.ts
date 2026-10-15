import { expect, test } from '@playwright/test'

const reader =
  '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l1-b-1-i&mode=beginner'
const title = 'Authorized Access Control [FCI Data]'

/** The frame fills the column beside the rail, and the live page fills the frame. */
async function fillsTheScreen(page: import('@playwright/test').Page) {
  const column = (await page.locator('.controls-main').boundingBox())!
  const frame = (await page.locator('.erase-frame').boundingBox())!
  const live = (await page
    .locator('.control-page:not(.erase-dust)')
    .boundingBox())!
  expect(Math.round(frame.y)).toBe(Math.round(column.y))
  expect(Math.round(frame.y + frame.height)).toBe(
    Math.round(column.y + column.height),
  )
  expect(Math.round(live.height)).toBe(Math.round(frame.height))
}

test('between controls the old chalk sweeps off as dust while the new control is focused at once', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(reader)
  const heading = page.getByRole('heading', { level: 1 })
  await expect(heading).toHaveText(title)
  await expect(page.locator('.erase-dust')).toHaveCount(0)
  await fillsTheScreen(page)
  await page.keyboard.press('j')
  // One read, before the 400 ms are up: the dust and the live page together.
  const seen = await page.evaluate(() => {
    const dust = document.querySelectorAll('.erase-dust')
    const first = dust[0]
    return {
      count: dust.length,
      hidden: first?.getAttribute('aria-hidden'),
      inert: first?.hasAttribute('inert'),
      oldText: first?.textContent ?? '',
      focused: document.activeElement?.id,
      focusInDust: Boolean(document.activeElement?.closest('.erase-dust')),
      liveTitle: document.getElementById('control-title')?.textContent,
      search: window.location.search,
    }
  })
  expect(seen.count).toBe(1)
  expect(seen.hidden).toBe('true')
  expect(seen.inert).toBe(true)
  expect(seen.oldText).toContain(title)
  expect(seen.focused).toBe('control-title')
  expect(seen.focusInDust).toBe(false)
  expect(seen.liveTitle).not.toBe(title)
  expect(seen.search).toMatch(/control=ac-l1-b-1-ii(?:&|$)/)
  // Tab never lands in the dust.
  await page.keyboard.press('Tab')
  expect(
    await page.evaluate(() =>
      Boolean(document.activeElement?.closest('.erase-dust')),
    ),
  ).toBe(false)
  // Gone once its 400 ms are up, and the page still fills the screen.
  await expect(page.locator('.erase-dust')).toHaveCount(0, { timeout: 1500 })
  await fillsTheScreen(page)
})

for (const [name, media] of [
  ['reduced motion', { reducedMotion: 'reduce' }],
  ['forced colours', { forcedColors: 'active' }],
] as const) {
  test(`under ${name} the change is a cut`, async ({ page }) => {
    await page.emulateMedia(media)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(reader)
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toHaveText(title)
    await page.getByRole('button', { name: 'Next: AC.L1-b.1.ii' }).click()
    await expect(heading).not.toHaveText(title)
    expect(await page.locator('.erase-dust').count()).toBe(0)
  })
}
