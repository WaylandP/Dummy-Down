import { expect, test } from '@playwright/test'

const control =
  '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l1-b-1-i'

test('from the top of a control page, two Tabs and Enter land on the control, with its views a Tab away and the rail still there', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(control)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Authorized Access Control [FCI Data]',
  )
  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused()
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Skip to the explanation' })
  await expect(skip).toBeFocused()
  await expect(skip).toBeInViewport()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(
    page
      .getByRole('navigation', { name: 'Views of this control' })
      .getByRole('link', { name: 'Decode' }),
  ).toBeFocused()
  // The rail of every control is still there, before the control.
  const rail = page.getByRole('navigation', { name: 'All controls' })
  await expect(rail).toBeVisible()
  await rail.getByRole('link').first().focus()
  await expect(rail.getByRole('link').first()).toBeFocused()
})

test('discovery and Home have no explanation to skip to', async ({ page }) => {
  await page.goto('/learn?view=discover&collection=references')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Controls')
  await expect(
    page.getByRole('link', { name: 'Skip to the explanation' }),
  ).toHaveCount(0)
  await page.goto('/')
  await expect(
    page.getByRole('link', { name: 'Skip to the explanation' }),
  ).toHaveCount(0)
})
