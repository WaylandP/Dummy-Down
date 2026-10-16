import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator } from '@playwright/test'

const control =
  '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l2-3-1-1&tab=rev3'

/** The tops of a row's links: one row means one value. */
const rows = (locator: Locator) =>
  locator.evaluateAll(
    (nodes) =>
      new Set(nodes.map((node) => Math.round(node.getBoundingClientRect().top)))
        .size,
  )

for (const width of [320, 390, 768, 1024, 1280, 1440]) {
  test(`the six places and the six tabs each keep to one row at ${width}px, scrolling sideways when they must`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width < 640 ? 844 : 800 })
    await page.goto(control)
    const tabs = page.getByRole('navigation', { name: 'Views of this control' })
    await expect(tabs.getByRole('link')).toHaveCount(6)
    await page.evaluate(() => document.fonts.ready)
    const nav = page.getByRole('navigation', { name: 'Main' })
    await expect(nav.getByRole('link')).toHaveCount(6)
    expect(await rows(nav.getByRole('link'))).toBe(1)
    expect(await rows(tabs.getByRole('link'))).toBe(1)
    // Every target is 44px tall and at least 44px wide.
    for (const link of [
      ...(await nav.getByRole('link').all()),
      ...(await tabs.getByRole('link').all()),
    ]) {
      const box = (await link.boundingBox())!
      expect(box.height).toBeGreaterThanOrEqual(44)
      expect(box.width).toBeGreaterThanOrEqual(44)
    }
    // The active tab keeps its chalk stroke.
    await expect(
      tabs.getByRole('link', { name: 'Rev 3' }).locator('.control-tab-stroke'),
    ).toBeVisible()
    // Where a row does not fit it scrolls, fades at the hidden edge, and still
    // brings its last link into view for the keyboard; where it fits, no fade.
    for (const [row, last] of [
      [nav, 'About'],
      [tabs, 'Rev 3'],
    ] as const) {
      const overflow = await row.evaluate(
        (node) => node.scrollWidth - node.clientWidth,
      )
      if (overflow > 1) {
        expect(width).toBeLessThan(390)
        await expect(row).toHaveAttribute('data-fade', 'end')
        await row.getByRole('link', { name: last }).focus()
        await expect(row.getByRole('link', { name: last })).toBeInViewport()
        await expect(row).toHaveAttribute('data-fade', 'start')
      } else {
        await expect(row).toHaveAttribute('data-fade', 'none')
      }
    }
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  })
}
