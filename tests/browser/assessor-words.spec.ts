import { expect, test, type Locator } from '@playwright/test'

const evidence =
  '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l2-3-1-1&mode=beginner&tab=evidence'
const region = { name: 'The assessor’s three words' }

async function box(locator: Locator) {
  const found = await locator.boundingBox()
  if (!found) throw new Error('The element has no box on screen')
  return found
}

test('at 1280×800 the three words are three columns above the compliance chalk', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(evidence)
  const words = page.getByRole('region', region)
  await expect(words).toBeVisible()
  const columns = words.locator('.assessor-word')
  await expect(columns).toHaveCount(3)
  const boxes = [
    await box(columns.nth(0)),
    await box(columns.nth(1)),
    await box(columns.nth(2)),
  ] as const
  expect(boxes[1].y).toBe(boxes[0].y)
  expect(boxes[2].y).toBe(boxes[0].y)
  expect(boxes[1].x).toBeGreaterThan(boxes[0].x + boxes[0].width - 1)
  expect(boxes[2].x).toBeGreaterThan(boxes[1].x + boxes[1].width - 1)
  const ask = (await page.getByRole('heading', { name: 'Ask' }).boundingBox())!
  expect(ask.y).toBeGreaterThan(boxes[0].y + boxes[0].height)
  await expect(page.locator('.control-foot-note')).toContainText(
    'CMMC Assessment Guide – Level 2, v2.13, page 14.',
  )
})

test('at 390px the columns stack without horizontal scroll', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(evidence)
  const columns = page.getByRole('region', region).locator('.assessor-word')
  await expect(columns).toHaveCount(3)
  const boxes = [
    await box(columns.nth(0)),
    await box(columns.nth(1)),
    await box(columns.nth(2)),
  ] as const
  expect(boxes[1].x).toBe(boxes[0].x)
  expect(boxes[1].y).toBeGreaterThan(boxes[0].y + boxes[0].height - 1)
  expect(boxes[2].y).toBeGreaterThan(boxes[1].y + boxes[1].height - 1)
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390)
})
