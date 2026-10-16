import { expect, test } from '@playwright/test'

const control =
  '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l2-3-1-1'

for (const width of [390, 1280]) {
  test(`Print and the glossary's source links are 44px targets at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width < 640 ? 844 : 800 })
    await page.goto(control)
    await page.evaluate(() => document.fonts.ready)
    const print = page.getByRole('button', { name: 'Print' })
    await expect(print).toBeVisible()
    const box = (await print.boundingBox())!
    expect(box.width).toBeGreaterThanOrEqual(44)
    expect(box.height).toBeGreaterThanOrEqual(44)

    await page.goto('/glossary')
    await page.evaluate(() => document.fonts.ready)
    const links = page.locator('.word-sources a')
    expect(await links.count()).toBeGreaterThan(0)
    for (const link of (await links.all()).slice(0, 6)) {
      const source = (await link.boundingBox())!
      expect(source.height).toBeGreaterThanOrEqual(44)
    }
    // The words keep their rhythm: the tap area is padding under a negative
    // margin, so the paragraph is still whole lines at its own pitch and a
    // link's text box is a line, not a 44px block.
    const line = page.locator('.word-sources').first()
    const pitch = await line.evaluate((node) =>
      parseFloat(getComputedStyle(node).lineHeight),
    )
    const height = (await line.boundingBox())!.height
    expect(Math.round(height) % Math.round(pitch)).toBe(0)
    expect(
      await links.first().evaluate((node) => {
        // The visible words only, not the screen reader's note beside them.
        const range = document.createRange()
        range.selectNodeContents(node.firstChild!)
        return range.getBoundingClientRect().height
      }),
    ).toBeLessThan(44)
  })
}
