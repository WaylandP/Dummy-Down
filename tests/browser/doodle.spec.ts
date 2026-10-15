import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const control =
  '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l1-b-1-i&mode=beginner'
const marks = (page: Page) =>
  page.locator('.doodle-marks:not(.doodle-dust) path:not(.doodle-live)')

async function stroke(
  page: Page,
  from: readonly [number, number],
  to: readonly [number, number],
) {
  await page.mouse.move(from[0], from[1])
  await page.mouse.down()
  await page.mouse.move((from[0] + to[0]) / 2, (from[1] + to[1]) / 2, {
    steps: 4,
  })
  await page.mouse.move(to[0], to[1], { steps: 4 })
  await page.mouse.up()
}

async function openControl(page: Page) {
  await page.goto(control)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(
    page.getByRole('navigation', { name: 'Pick a chalk' }),
  ).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
}

test('the doodle chalk sits in the tray, draws over the content only, and goes back with Escape', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await openControl(page)
  const stick = page.getByRole('button', { name: 'Doodle chalk' })
  const stickBox = (await stick.boundingBox())!
  const smudgeBox = (await page.locator('.smudge').boundingBox())!
  const legendBox = (await page.locator('.tray-legend').boundingBox())!
  // Just left of Smudge, right of the legend, and a 44px target.
  expect(stickBox.x + stickBox.width).toBeLessThanOrEqual(smudgeBox.x + 1)
  expect(stickBox.x).toBeGreaterThanOrEqual(legendBox.x + legendBox.width - 1)
  expect(stickBox.height).toBeGreaterThanOrEqual(44)
  await expect(stick).toHaveAttribute('aria-pressed', 'false')
  const layer = page.locator('.doodle-layer')
  await expect(layer).toHaveCount(0)
  await stick.click()
  await expect(stick).toHaveAttribute('aria-pressed', 'true')
  await expect(layer).toHaveCount(1)
  // The layer is the content's, never the header's, the footer's or the tray's.
  expect(await layer.evaluate((node) => node.parentElement?.id)).toBe('main')
  const main = (await page.locator('#main').boundingBox())!
  const box = (await layer.boundingBox())!
  expect(Math.round(box.x)).toBe(Math.round(main.x))
  expect(Math.round(box.y)).toBe(Math.round(main.y))
  expect(Math.round(box.width)).toBe(Math.round(main.width))
  expect(
    await layer.evaluate((node) => getComputedStyle(node).cursor),
  ).toContain('url(')
  await expect(page.locator('.footer-doodling')).toHaveText(
    'Doodling. Your marks stay on this screen only. Esc or the tray puts the chalk back. Click Smudge to wipe them.',
  )
  await expect(
    page.getByRole('link', { name: 'Assessment objectives' }),
  ).toBeHidden()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  // A stroke: chalk white, about 3px, at .9.
  await stroke(page, [main.x + 200, main.y + 200], [main.x + 420, main.y + 260])
  await expect(marks(page)).toHaveCount(1)
  expect(
    await marks(page)
      .first()
      .evaluate((node) => {
        const style = getComputedStyle(node)
        return [style.stroke, style.strokeWidth, style.strokeOpacity]
      }),
  ).toEqual(['rgb(237, 233, 221)', '3px', '0.9'])
  // Links under the layer are out of reach.
  const explain = page
    .getByRole('navigation', { name: 'Views of this control' })
    .getByRole('link', { name: 'Explain', exact: true })
  const target = (await explain.boundingBox())!
  const at = [target.x + target.width / 2, target.y + target.height / 2]
  expect(
    await page.evaluate(
      ([x, y]) =>
        document.elementFromPoint(x!, y!)?.classList.contains('doodle-layer'),
      at,
    ),
  ).toBe(true)
  await page.mouse.click(at[0]!, at[1]!)
  await page.waitForTimeout(200)
  expect(page.url()).not.toContain('tab=explain')
  // Escape puts the chalk back and reads from the tray.
  await page.keyboard.press('Escape')
  await expect(stick).toHaveAttribute('aria-pressed', 'false')
  await expect(layer).toHaveCount(0)
  await expect(stick).toBeFocused()
  await expect(
    page.getByRole('link', { name: 'Assessment objectives' }),
  ).toBeVisible()
})

test('d picks the chalk up; Smudge sweeps the marks, as do the next control and a narrower screen', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await openControl(page)
  const stick = page.getByRole('button', { name: 'Doodle chalk' })
  await page.keyboard.press('d')
  await expect(stick).toHaveAttribute('aria-pressed', 'true')
  const main = (await page.locator('#main').boundingBox())!
  await stroke(page, [main.x + 200, main.y + 200], [main.x + 300, main.y + 300])
  await stroke(page, [main.x + 500, main.y + 200], [main.x + 500, main.y + 320])
  await expect(marks(page)).toHaveCount(2)
  // His click: the marks are dust in the same breath, gone after the sweep.
  expect(
    await page.locator('.smudge').evaluate(async (node) => {
      ;(node as HTMLElement).click()
      await new Promise((settle) => setTimeout(settle, 0))
      return [
        node.getAttribute('data-pose'),
        document.querySelectorAll('.doodle-dust path').length,
        document.querySelectorAll(
          '.doodle-marks:not(.doodle-dust) path:not(.doodle-live)',
        ).length,
      ]
    }),
  ).toEqual(['sweep', 2, 0])
  await expect(page.locator('.doodle-dust')).toHaveCount(0)
  await stroke(page, [main.x + 200, main.y + 200], [main.x + 300, main.y + 300])
  await expect(marks(page)).toHaveCount(1)
  await page.keyboard.press('j')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    /Transaction/,
  )
  await expect(marks(page)).toHaveCount(0)
  await expect(page.locator('.doodle-layer')).toHaveCount(1)
  await stroke(page, [main.x + 200, main.y + 200], [main.x + 300, main.y + 300])
  await expect(marks(page)).toHaveCount(1)
  await page.setViewportSize({ width: 1100, height: 800 })
  await expect(marks(page)).toHaveCount(0)
  await page.keyboard.press('d')
  await expect(stick).toHaveAttribute('aria-pressed', 'false')
  await expect(page.locator('.doodle-layer')).toHaveCount(0)
})

test('the wheel still scrolls the content, and the marks go with it', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/about')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.keyboard.press('d')
  const layer = page.locator('.doodle-layer')
  const main = (await page.locator('#main').boundingBox())!
  const before = (await layer.boundingBox())!
  // The layer is as tall as the content, not the frame.
  expect(before.height).toBeGreaterThan(main.height)
  await stroke(page, [main.x + 200, main.y + 200], [main.x + 300, main.y + 300])
  await expect(marks(page)).toHaveCount(1)
  await page.mouse.move(main.x + 300, main.y + 300)
  await page.mouse.wheel(0, 400)
  await expect
    .poll(() => page.locator('#main').evaluate((node) => node.scrollTop))
    .toBeGreaterThan(0)
  const after = (await layer.boundingBox())!
  expect(after.y).toBeLessThan(before.y)
  await expect(marks(page)).toHaveCount(1)
})

test('a phone has no doodle chalk', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/about')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Doodle chalk' })).toBeHidden()
  await page.keyboard.press('d')
  await expect(page.locator('.doodle-layer')).toHaveCount(0)
})

test('print leaves the marks and the stick out', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/about')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.keyboard.press('d')
  const main = (await page.locator('#main').boundingBox())!
  await stroke(page, [main.x + 200, main.y + 200], [main.x + 300, main.y + 300])
  await expect(marks(page)).toHaveCount(1)
  await page.emulateMedia({ media: 'print' })
  expect(
    await page
      .locator('.doodle-layer')
      .evaluate((node) => getComputedStyle(node).display),
  ).toBe('none')
  expect(
    await page
      .locator('.tray-doodle')
      .evaluate((node) => getComputedStyle(node).display),
  ).toBe('none')
})

test.describe('forced colors and reduced motion', () => {
  test.use({ forcedColors: 'active', reducedMotion: 'reduce' })
  test('the marks are CanvasText and every wipe is a cut', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/about')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await page.keyboard.press('d')
    const main = (await page.locator('#main').boundingBox())!
    await stroke(
      page,
      [main.x + 200, main.y + 200],
      [main.x + 300, main.y + 300],
    )
    await expect(marks(page)).toHaveCount(1)
    expect(
      await marks(page)
        .first()
        .evaluate((node) => getComputedStyle(node).stroke),
    ).toBe('rgb(0, 0, 0)')
    // A cut: no dust at any moment.
    expect(
      await page.locator('.smudge').evaluate(async (node) => {
        ;(node as HTMLElement).click()
        await new Promise((settle) => setTimeout(settle, 0))
        return [
          document.querySelectorAll('.doodle-dust').length,
          document.querySelectorAll(
            '.doodle-marks:not(.doodle-dust) path:not(.doodle-live)',
          ).length,
        ]
      }),
    ).toEqual([0, 0])
    await page.keyboard.press('Escape')
    await expect(
      page.getByRole('button', { name: 'Doodle chalk' }),
    ).toBeFocused()
  })
})
