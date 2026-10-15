import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const control =
  '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l1-b-1-i&mode=beginner'
const marks = (page: Page) =>
  page.locator('.doodle-marks:not(.doodle-dust) path:not(.doodle-live)')
const line = (page: Page) => page.locator('.footer-doodling')
const smudge = (page: Page) =>
  page.getByRole('button', { name: 'Smudge, the eraser' })

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

/** The address carries the marks once the stroke is encoded. */
async function fragment(page: Page) {
  await expect.poll(() => new URL(page.url()).hash).toMatch(/^#ink=v1/)
  return new URL(page.url()).hash
}

test('the doodle chalk sits in the tray, draws over the content only, and goes back with Escape leaving the marks', async ({
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
  // Nothing on the page: Smudge is decorative, nothing to focus.
  await expect(smudge(page)).toHaveCount(0)
  await expect(page.locator('.smudge')).toHaveAttribute('aria-hidden', 'true')
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
  await expect(line(page)).toHaveText(
    'Doodling. Your marks stay on this page and go with its link. Esc or the tray puts the chalk back. Pick up Smudge to erase.',
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
  // Links under the layer are out of reach while the chalk is up.
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
  // That click was a tap on the board: a dot of chalk, not a link.
  await expect(marks(page)).toHaveCount(2)
  // Escape puts the chalk back and reads from the tray; the marks stay,
  // under a layer that lets the page through again.
  await page.keyboard.press('Escape')
  await expect(stick).toHaveAttribute('aria-pressed', 'false')
  await expect(stick).toBeFocused()
  await expect(layer).toHaveCount(1)
  await expect(layer).not.toHaveAttribute('data-mode')
  await expect(marks(page)).toHaveCount(2)
  await expect(
    page.getByRole('link', { name: 'Assessment objectives' }),
  ).toBeVisible()
  expect(
    await page.evaluate(
      ([x, y]) =>
        document.elementFromPoint(x!, y!)?.classList.contains('doodle-layer'),
      at,
    ),
  ).toBe(false)
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
})

test('the marks belong to the page and go in its link: Copy link carries them, a reload keeps them, and the next control has its own', async ({
  browser,
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.addInitScript(() => {
    const copied: string[] = []
    ;(window as unknown as { copied: string[] }).copied = copied
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (text: string) => void copied.push(text) },
    })
  })
  await openControl(page)
  await page.keyboard.press('d')
  const main = (await page.locator('#main').boundingBox())!
  await stroke(page, [main.x + 200, main.y + 200], [main.x + 300, main.y + 300])
  await expect(marks(page)).toHaveCount(1)
  const hash = await fragment(page)
  expect(hash.length).toBeLessThan(400)
  expect(new URL(page.url()).search).not.toContain('ink')
  // Copy reference link and Send this chalk carry the marks.
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Copy reference link' }).click()
  await page.getByRole('button', { name: 'Send this chalk' }).click()
  const copied = await page.evaluate(
    () => (window as unknown as { copied: string[] }).copied,
  )
  expect(copied).toHaveLength(2)
  for (const url of copied) {
    expect(new URL(url).hash).toBe(hash)
    expect(new URL(url).search).not.toContain('ink')
  }
  // A reload: the marks are back, with nothing to say.
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(marks(page)).toHaveCount(1)
  await expect(line(page)).toBeEmpty()
  // The next control is another page: a clean board and address; Back
  // brings the mark and its fragment back.
  await page.keyboard.press('j')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    /Transaction/,
  )
  await expect(marks(page)).toHaveCount(0)
  await expect.poll(() => new URL(page.url()).hash).toBe('')
  await page.goBack()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    /Authorized Access Control/,
  )
  await expect(marks(page)).toHaveCount(1)
  await expect.poll(() => new URL(page.url()).hash).toBe(hash)
  // Someone else opens the chalk link: the explorer tidies its address, and
  // the marks and their line survive that, and a reload.
  const other = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  })
  const theirs = await other.newPage()
  await theirs.goto(copied[1]!)
  await expect(theirs.getByRole('heading', { level: 1 })).toBeVisible()
  await expect
    .poll(() => new URL(theirs.url()).search)
    .toContain('mode=beginner')
  await expect(marks(theirs)).toHaveCount(1)
  await expect(line(theirs)).toContainText(
    'Chalk marks from the link you opened.',
  )
  await expect.poll(() => new URL(theirs.url()).hash).toBe(hash)
  await theirs.reload()
  await expect(marks(theirs)).toHaveCount(1)
  await expect(line(theirs)).toContainText(
    'Chalk marks from the link you opened.',
  )
  await other.close()
})

test('e picks up Smudge, who erases only the strokes he touches; Wipe all sweeps the rest', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await openControl(page)
  await page.keyboard.press('d')
  const main = (await page.locator('#main').boundingBox())!
  await stroke(page, [main.x + 200, main.y + 200], [main.x + 300, main.y + 200])
  await stroke(page, [main.x + 200, main.y + 320], [main.x + 300, main.y + 320])
  await expect(marks(page)).toHaveCount(2)
  await fragment(page)
  // With marks on the page Smudge is a button, a 44px target.
  const him = smudge(page)
  await expect(him).toHaveAttribute('aria-pressed', 'false')
  const hisBox = (await him.boundingBox())!
  expect(hisBox.height).toBeGreaterThanOrEqual(44)
  expect(hisBox.width).toBeGreaterThanOrEqual(44)
  await page.keyboard.press('e')
  await expect(him).toHaveAttribute('aria-pressed', 'true')
  await expect(
    page.getByRole('button', { name: 'Doodle chalk' }),
  ).toHaveAttribute('aria-pressed', 'false')
  const layer = page.locator('.doodle-layer')
  await expect(layer).toHaveAttribute('data-mode', 'eraser')
  expect(
    await layer.evaluate((node) => getComputedStyle(node).cursor),
  ).toContain('url(')
  await expect(line(page)).toHaveText(
    'Erasing. Esc or the tray puts Smudge back · Wipe all',
  )
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  // Rubbing across the first stroke takes it, and only it, as dust.
  await page.mouse.move(main.x + 250, main.y + 180)
  await page.mouse.down()
  await page.mouse.move(main.x + 250, main.y + 220, { steps: 6 })
  await page.mouse.up()
  await expect(marks(page)).toHaveCount(1)
  await expect(page.locator('.doodle-dust')).toHaveCount(0)
  // Escape puts him back, focused; e picks him up again; Wipe all sweeps
  // what is left, with his gesture, and the link is clean.
  await page.keyboard.press('Escape')
  await expect(him).toHaveAttribute('aria-pressed', 'false')
  await expect(him).toBeFocused()
  await page.keyboard.press('e')
  // Wiped clean, he is decorative again: a new element that arrives already
  // sweeping, so the tray is watched for his pose rather than the button.
  await page.evaluate(() => {
    const tray = document.querySelector('.chalk-tray')!
    const seen: string[] = []
    ;(window as unknown as { smudgePoses: string[] }).smudgePoses = seen
    new MutationObserver(() => {
      const pose = tray.querySelector('.smudge')?.getAttribute('data-pose')
      if (pose && pose !== 'idle') seen.push(pose)
    }).observe(tray, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-pose'],
    })
  })
  await page.getByRole('button', { name: 'Wipe all' }).click()
  await expect(marks(page)).toHaveCount(0)
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { smudgePoses: string[] }).smudgePoses,
      ),
    )
    .toContain('sweep')
  await expect.poll(() => new URL(page.url()).hash).toBe('')
  await expect(layer).toHaveCount(0)
  await expect(him).toHaveCount(0)
  await expect(line(page)).toBeEmpty()
})

test('a link someone else made shows its marks with a word, scaled on a screen about as wide, and the notice on one that is not', async ({
  browser,
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/about')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.keyboard.press('d')
  const main = (await page.locator('#main').boundingBox())!
  await stroke(page, [main.x + 200, main.y + 200], [main.x + 500, main.y + 260])
  const hash = await fragment(page)
  const link = `/about${hash}`
  // Someone else opens the link: the marks, and the line with its actions.
  const other = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  })
  const theirs = await other.newPage()
  await theirs.goto(link)
  await expect(theirs.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(marks(theirs)).toHaveCount(1)
  await expect(line(theirs)).toHaveText(
    'Chalk marks from the link you opened. They aren’t part of Cipher & Chalk. Pick up Smudge to erase them · Wipe all',
  )
  await expect(theirs.locator('.footer-note')).toHaveCount(0)
  expect((await new AxeBuilder({ page: theirs }).analyze()).violations).toEqual(
    [],
  )
  await theirs
    .getByRole('button', { name: 'Pick up Smudge to erase them' })
    .click()
  await expect(smudge(theirs)).toHaveAttribute('aria-pressed', 'true')
  await theirs.getByRole('button', { name: 'Wipe all' }).click()
  await expect(marks(theirs)).toHaveCount(0)
  await expect(line(theirs)).toBeEmpty()
  await expect(theirs.locator('.footer-note')).toBeVisible()
  await expect.poll(() => new URL(theirs.url()).hash).toBe('')
  // A screen a little narrower draws them scaled; a much narrower one does
  // not, and says so.
  await theirs.setViewportSize({ width: 1180, height: 800 })
  await theirs.goto(link)
  await expect(marks(theirs)).toHaveCount(1)
  expect(
    await marks(theirs)
      .first()
      .evaluate((node) => node.parentElement?.getAttribute('transform')),
  ).toMatch(/^scale\(0\.9/)
  await theirs.setViewportSize({ width: 800, height: 800 })
  await theirs.goto(link)
  await expect(line(theirs)).toHaveText(
    'This link has chalk marks drawn on a different screen size. Open it on a wider screen to see them.',
  )
  await expect(marks(theirs)).toHaveCount(0)
  await expect(smudge(theirs)).toHaveCount(0)
  await other.close()
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

test('a phone has no doodle chalk, and a link’s marks wait for a wider screen', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/about')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Doodle chalk' })).toBeHidden()
  await page.keyboard.press('d')
  await expect(page.locator('.doodle-layer')).toHaveCount(0)
  // A link with marks drawn on a desktop: the line says why they are not here.
  await page.goto('/about#ink=v1AKAJAQKQA5AD2AR4')
  await expect(line(page)).toHaveText(
    'This link has chalk marks drawn on a different screen size. Open it on a wider screen to see them.',
  )
  await expect(marks(page)).toHaveCount(0)
  await expect(smudge(page)).toHaveCount(0)
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390)
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
  test('the marks are CanvasText and every erase is a cut', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/about')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await page.keyboard.press('d')
    const main = (await page.locator('#main').boundingBox())!
    await stroke(
      page,
      [main.x + 200, main.y + 200],
      [main.x + 300, main.y + 200],
    )
    await expect(marks(page)).toHaveCount(1)
    expect(
      await marks(page)
        .first()
        .evaluate((node) => getComputedStyle(node).stroke),
    ).toBe('rgb(0, 0, 0)')
    // A cut: Smudge rubs the stroke out with no dust at any moment.
    await page.keyboard.press('e')
    await expect(smudge(page)).toHaveAttribute('aria-pressed', 'true')
    expect(
      await page.locator('.doodle-layer').evaluate(async (node) => {
        const box = node.getBoundingClientRect()
        const down = new PointerEvent('pointerdown', {
          pointerId: 1,
          pointerType: 'mouse',
          button: 0,
          buttons: 1,
          clientX: box.left + 250,
          clientY: box.top + 204,
          bubbles: true,
        })
        node.dispatchEvent(down)
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
    await expect(smudge(page)).toHaveCount(0)
    await expect(
      page.getByRole('button', { name: 'Doodle chalk' }),
    ).toBeVisible()
  })
})
