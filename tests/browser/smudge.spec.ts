import { expect, test, type Page } from '@playwright/test'

const control =
  '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l1-b-1-i&mode=beginner'

/** Every pose Smudge takes is recorded as it is set, since a gesture lasts under a second. */
async function watchPoses(page: Page) {
  await page.evaluate(() => {
    const smudge = document.querySelector('.smudge')!
    const seen: string[] = []
    ;(window as unknown as { smudgePoses: string[] }).smudgePoses = seen
    new MutationObserver(() => {
      const pose = smudge.getAttribute('data-pose')
      if (pose && pose !== 'idle') seen.push(pose)
    }).observe(smudge, { attributes: true, attributeFilter: ['data-pose'] })
  })
}
const poses = (page: Page) =>
  page.evaluate(
    () => (window as unknown as { smudgePoses: string[] }).smudgePoses,
  )
const box = async (page: Page, selector: string) => {
  const found = await page.locator(selector).first().boundingBox()
  if (!found) throw new Error(`${selector} has no box`)
  return found
}

test('Smudge is the eraser on the right end of the tray: nothing to read or focus, a face that stays still between controls and hands over a chalk, and a footer switch that is remembered', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(control)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const smudge = page.locator('.chalk-tray .smudge')
  await expect(smudge).toHaveCount(1)
  await expect(smudge).toHaveAttribute('aria-hidden', 'true')
  await expect(smudge).toHaveAttribute('data-pose', 'idle')
  expect(await smudge.locator('a, button, input, [tabindex]').count()).toBe(0)
  expect(await smudge.locator('.smudge-eye').count()).toBe(2)
  // He sits on the right end of the wood, sized as in Home.html.
  const tray = await box(page, '.chalk-tray')
  const him = await box(page, '.chalk-tray .smudge')
  expect(him.width).toBe(132)
  expect(him.height).toBe(85)
  expect(him.x + him.width).toBeLessThanOrEqual(tray.x + tray.width - 40)
  expect(him.x + him.width).toBeGreaterThan(tray.x + tray.width - 60)
  expect(him.y + him.height).toBeLessThanOrEqual(tray.y + tray.height)
  const legend = await box(page, '.chalk-tray .tray-legend')
  expect(legend.x + legend.width).toBeLessThanOrEqual(him.x)
  // The empty corner of his box is not his: what is underneath keeps its target.
  expect(
    await page.evaluate(
      ({ x, y }) => document.elementFromPoint(x, y)?.closest('.smudge') ?? null,
      { x: him.x + 6, y: him.y + 6 },
    ),
  ).toBeNull()
  // Tab never lands on him: the switch is the only control.
  for (let i = 0; i < 12; i++) await page.keyboard.press('Tab')
  expect(
    await page.evaluate(
      () => document.activeElement?.closest('.smudge') ?? null,
    ),
  ).toBeNull()

  await watchPoses(page)
  const title = page.getByRole('heading', { level: 1 })
  const before = await title.textContent()
  const next = page.getByRole('button', { name: /^Next: / })
  await next.click()
  // No Erase since October 15: the next control is on the board at once,
  // focus stays on the button that was pressed, and he does not sweep.
  await expect(title).not.toHaveText(before ?? '')
  await expect(next).toBeFocused()
  await expect(smudge).toHaveAttribute('data-pose', 'idle')
  expect(await poses(page)).toEqual([])
  await page
    .getByRole('navigation', { name: 'Pick a chalk' })
    .getByRole('button', { name: /yellow chalk/ })
    .click()
  await expect.poll(() => poses(page)).toContain('hand')
  await expect(smudge).toHaveAttribute('data-pose', 'idle')
  // A click on him is a sneeze and nothing else.
  const address = page.url()
  await smudge.click()
  await expect.poll(() => poses(page)).toContain('sneeze')
  expect(page.url()).toBe(address)
  await expect(smudge).toHaveAttribute('data-pose', 'idle')

  // The footer switch: off is the plain eraser, remembered for the next visit.
  const toggle = page.getByRole('switch', { name: 'Smudge' })
  await expect(toggle).toHaveAttribute('aria-checked', 'true')
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-checked', 'false')
  await expect(smudge).toHaveClass(/is-off/)
  await expect(smudge.locator('.smudge-face')).toHaveCount(0)
  await expect(smudge.locator('.smudge-felt')).toBeVisible()
  await page.reload()
  await expect(page.locator('.chalk-tray .smudge')).toHaveClass(/is-off/)
  await page.getByRole('switch', { name: 'Smudge' }).click()
  await expect(page.locator('.chalk-tray .smudge')).not.toHaveClass(/is-off/)
  // Print: the tray, and Smudge with it, is off the sheet.
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('.chalk-tray')).toBeHidden()
})

test.describe('under reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })
  test('Smudge is the plain eraser: no face, no gesture, and the next control is on the board at once', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto(control)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const smudge = page.locator('.chalk-tray .smudge')
    await expect(smudge.locator('.smudge-felt')).toBeVisible()
    await expect(smudge.locator('.smudge-face')).toBeHidden()
    await watchPoses(page)
    const title = page.getByRole('heading', { level: 1 })
    const before = await title.textContent()
    const next = page.getByRole('button', { name: /^Next: / })
    await next.click()
    await expect(title).not.toHaveText(before ?? '')
    await expect(next).toBeFocused()
    expect(await poses(page)).toEqual([])
  })
})

test('on a phone Smudge keeps the right end of the bottom bar, clear of the three chalks', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(control)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  // The bar is the tray once the control is on the board.
  const picks = page
    .getByRole('navigation', { name: 'Pick a chalk' })
    .getByRole('button')
  await expect(picks).toHaveCount(3)
  const bar = await box(page, '.chalk-tray.is-switch')
  const him = await box(page, '.chalk-tray .smudge')
  expect(him.x + him.width).toBeLessThanOrEqual(bar.x + bar.width)
  expect(him.y + him.height).toBeLessThanOrEqual(bar.y + bar.height)
  for (const pick of await picks.all()) {
    const button = await pick.boundingBox()
    if (!button) throw new Error('A chalk has no box')
    expect(button.x + button.width).toBeLessThanOrEqual(him.x + 1)
  }
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390)
})
