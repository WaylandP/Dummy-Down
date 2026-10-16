import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const explain = (key: string) =>
  `/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=${key}&mode=beginner&tab=explain`

test('on a desktop a chalk popover sits under the word, above it at the foot of the screen, and closes with Escape', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(explain('ac-l1-b-1-i'))
  const word = page.getByRole('button', { name: 'devices' })
  await expect(word).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  const popover = page.getByRole('dialog', { name: 'Device' })
  // Hover shows it under the word without taking focus.
  await word.hover()
  await expect(popover).toBeVisible()
  const wordBox = (await word.boundingBox())!
  let box = (await popover.boundingBox())!
  expect(box.y).toBeGreaterThanOrEqual(wordBox.y + wordBox.height)
  expect(box.x + box.width).toBeLessThanOrEqual(1280)
  await expect(popover).not.toBeFocused()
  // The pointer can cross into it and back.
  await popover.hover()
  await word.hover()
  await page.waitForTimeout(400)
  await expect(popover).toBeVisible()
  await page.mouse.move(0, 0)
  await expect(popover).toBeHidden()
  // With the word at the foot of the screen it goes above the word instead.
  // A frame this short lays the page out again and scrolls it, so the word
  // is brought to the foot (at once, not smoothly) and measured there before
  // the click.
  await page.setViewportSize({
    width: 1280,
    height: Math.round(wordBox.y + wordBox.height + 40),
  })
  await word.evaluate((node) =>
    node.scrollIntoView({ block: 'end', behavior: 'instant' }),
  )
  const footBox = (await word.boundingBox())!
  expect(footBox.y + footBox.height).toBeLessThanOrEqual(
    await page.evaluate(() => innerHeight),
  )
  await word.click()
  await expect(popover).toBeVisible()
  await expect(popover).toBeFocused()
  box = (await popover.boundingBox())!
  expect(box.y).toBeGreaterThanOrEqual(0)
  expect(box.y + box.height).toBeLessThanOrEqual(footBox.y)
  await expect(popover).toHaveAttribute('data-side', 'above')
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
  await page.keyboard.press('Escape')
  await expect(popover).toBeHidden()
  await expect(word).toBeFocused()
})

test.describe('on a phone', () => {
  test.use({ hasTouch: true })

  test('a tap pins the popover inside the screen and a tap elsewhere closes it', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(explain('ac-l1-b-1-i'))
    const word = page.getByRole('button', { name: 'devices' })
    await expect(word).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await word.tap()
    const popover = page.getByRole('dialog', { name: 'Device' })
    await expect(popover).toBeVisible()
    await expect(popover).toBeFocused()
    const box = (await popover.boundingBox())!
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.y).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(390)
    expect(box.y + box.height).toBeLessThanOrEqual(844)
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
    await page.getByRole('heading', { level: 1 }).tap()
    await expect(popover).toBeHidden()
  })

  test('a phrase wraps like the text around it and never widens the page', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await page.goto(explain('mp-l1-b-1-vii'))
    const phrase = page.getByRole('button', {
      name: 'Federal Contract Information',
    })
    await expect(phrase).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(320)
    // More than one line box: the phrase broke across lines.
    expect(
      await phrase.evaluate((node) => node.getClientRects().length),
    ).toBeGreaterThan(1)
  })
})
