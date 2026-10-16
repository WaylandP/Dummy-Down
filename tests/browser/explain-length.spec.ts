import { expect, test } from '@playwright/test'

const lesson = (control: string, mode: string) =>
  `/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=${control}&mode=${mode}&tab=explain`

/** The five longest explanations, by chalk. */
const longest = [
  ['ia-l2-3-5-3', 'beginner'],
  ['au-l2-3-3-7', 'compliance'],
  ['ia-l2-3-5-10', 'it-cyber'],
  ['ia-l2-3-5-7', 'beginner'],
  ['ir-l2-3-6-1', 'it-cyber'],
] as const

test('the five longest explanations fit their column at 1280×800 without scrolling, stepping the size down', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  for (const [control, mode] of longest) {
    await page.goto(lesson(control, mode))
    const text = page.locator('.explain-panel .explain-text').first()
    await expect(text).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    const measured = await text.evaluate((node) => {
      const panel = node.closest('.explain-panel')!
      const main = document.getElementById('main')!
      const box = node.getBoundingClientRect()
      return {
        size: parseFloat(getComputedStyle(node).fontSize),
        length: node.textContent!.length,
        bottom: box.bottom,
        mainBottom: main.getBoundingClientRect().bottom,
        panelScroll: panel.scrollHeight - panel.clientHeight,
        mainScroll: main.scrollHeight - main.clientHeight,
      }
    })
    // Stepped down from 28px (the exact step follows the text's length, which
    // the unit test checks); what matters here is that it fits.
    expect(measured.size).toBeLessThan(28)
    expect(measured.bottom).toBeLessThanOrEqual(measured.mainBottom + 1)
    expect(measured.panelScroll).toBeLessThanOrEqual(0)
    expect(measured.mainScroll).toBeLessThanOrEqual(0)
  }
  // A short one keeps the full size.
  await page.goto(lesson('sc-l2-3-13-8', 'compliance'))
  const short = page.locator('.explain-panel .explain-text').first()
  await expect(short).toBeVisible()
  expect(
    parseFloat(await short.evaluate((node) => getComputedStyle(node).fontSize)),
  ).toBe(28)
})
