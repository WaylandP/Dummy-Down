import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const lesson =
  '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l2-3-1-1'

test('a chalk link opens Explain in that chalk and the address is rewritten', async ({
  page,
}) => {
  await page.goto(`${lesson}&chalk=yellow`)
  await expect(
    page.getByRole('tab', { name: 'I run the systems' }),
  ).toHaveAttribute('aria-selected', 'true')
  await expect(page).toHaveURL(/mode=it-cyber(?:&|$)/)
  await expect(page).toHaveURL(/tab=explain(?:&|$)/)
  await expect(page).not.toHaveURL(/chalk=/)
})

test('Send this chalk copies a link that names the chalk in hand', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto(`${lesson}&mode=compliance&tab=evidence`)
  await page.getByRole('button', { name: 'Send this chalk' }).click()
  await expect(page.getByText('Chalk link copied.')).toBeVisible()
  const copied = await page.evaluate(() => navigator.clipboard.readText())
  expect(copied).toMatch(/[?&]chalk=blue(?:&|#|$)/)
  expect(copied).not.toMatch(/[?&](?:mode|tab)=/)
})

test('on a narrow phone the three actions wrap, and the chalk link can be selected when copying is unavailable', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    })
  })
  await page.setViewportSize({ width: 320, height: 640 })
  await page.goto(`${lesson}&mode=compliance&tab=explain`)
  const send = page.getByRole('button', { name: 'Send this chalk' })
  await send.scrollIntoViewIfNeeded()
  await page.evaluate(() => document.fonts.ready)
  for (const name of ['Print', 'Copy reference link', 'Send this chalk']) {
    const action = page.getByRole('button', { name })
    await expect(action).toBeVisible()
    const box = (await action.boundingBox())!
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(320)
    expect(box.height).toBeGreaterThanOrEqual(44)
  }
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320)
  await send.click()
  const fallback = page.getByRole('textbox', { name: 'Chalk link' })
  await expect(fallback).toBeFocused()
  expect(await fallback.inputValue()).toMatch(/chalk=blue/)
  await expect(
    page.getByText("Copy isn't available. Select the link below."),
  ).toBeVisible()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320)
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})
