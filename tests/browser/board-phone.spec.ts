import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const reader =
  '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l1-b-1-i&mode=beginner'
const title = 'Authorized Access Control [FCI Data]'

test('on a phone the tray is the bottom bar and its chalks pick the perspective', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(reader)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
  const tray = page.getByRole('navigation', { name: 'Pick a chalk' })
  await page.evaluate(() => document.fonts.ready)
  await tray.scrollIntoViewIfNeeded()
  await expect(tray).toBeVisible()
  // The bar ends the page, full width, on screen once scrolled to.
  const box = (await tray.boundingBox())!
  expect(Math.round(box.height)).toBe(72)
  expect(Math.round(box.width)).toBe(390)
  expect(box.y + box.height).toBeLessThanOrEqual(845)
  const pageEnd = await page.evaluate(
    () => document.documentElement.scrollHeight - window.scrollY,
  )
  expect(box.y + box.height).toBeCloseTo(pageEnd, 0)
  const picks = tray.getByRole('button')
  await expect(picks).toHaveText([
    'white chalk: new to this',
    'yellow chalk: runs systems',
    'blue chalk: assessment',
  ])
  for (const pick of await picks.all()) {
    const box = (await pick.boundingBox())!
    expect(box.height).toBeGreaterThanOrEqual(44)
    expect(box.width).toBeGreaterThanOrEqual(44)
  }
  // The visible label is the mockup's short form; the colour is read out first.
  expect(
    await tray
      .locator('.tray-pick-label')
      .nth(1)
      .evaluate((node) =>
        [...node.childNodes]
          .filter((child) => child.nodeType === Node.TEXT_NODE)
          .map((child) => child.textContent)
          .join(''),
      ),
  ).toBe('runs systems')
  await expect(tray.locator('.tray-pick-label .sr-only').nth(1)).toHaveText(
    'yellow chalk: ',
  )
  await picks.nth(1).click()
  await expect(page).toHaveURL(/mode=it-cyber(?:&|$)/)
  await expect(page).toHaveURL(/tab=explain(?:&|$)/)
  await expect(picks.nth(1)).toHaveAttribute('aria-pressed', 'true')
  await expect(
    page.getByRole('tab', { name: 'I run the systems' }),
  ).toHaveAttribute('aria-selected', 'true')
  const text = page.locator('.control-panel-explain .explain-text')
  await expect(text).toBeVisible()
  expect(await text.evaluate((node) => getComputedStyle(node).color)).toBe(
    'rgb(242, 209, 107)',
  )
  expect(
    await tray
      .locator('.tray-stick-yellow')
      .evaluate((node) => getComputedStyle(node).transform),
  ).not.toBe('none')
  expect(
    await tray
      .locator('.tray-stick-white')
      .evaluate((node) => getComputedStyle(node).transform),
  ).toBe('none')
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
})

test('the keys: ? shows them, j and k step, 1 2 3 pick a chalk, / finds', async ({
  page,
}) => {
  await page.goto(reader)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
  await page.keyboard.type('?')
  const dialog = page.getByRole('dialog', { name: 'Keys' })
  await expect(dialog).toBeVisible()
  const close = dialog.getByRole('button', { name: 'Close' })
  await expect(close).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(close).toBeFocused()
  await expect(dialog.locator('kbd')).toHaveText([
    'j',
    'k',
    '1',
    '2',
    '3',
    '/',
    'd',
    'e',
    '?',
    'Esc',
  ])
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()

  const nextId = (await page
    .getByRole('button', { name: /^Next: / })
    .textContent())!.replace('Next: ', '')
  await page.keyboard.type('j')
  await expect(page.locator('.control-page .control-id')).toHaveText(nextId)
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
  await page.keyboard.type('k')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused()

  await page.keyboard.type('2')
  await expect(page).toHaveURL(/mode=it-cyber(?:&|$)/)
  await expect(page).toHaveURL(/tab=explain(?:&|$)/)
  await expect(
    page.getByRole('tab', { name: 'I run the systems' }),
  ).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.type('3')
  await expect(page).toHaveURL(/mode=compliance(?:&|$)/)
  await expect(
    page.getByRole('navigation', { name: 'Pick a chalk' }).getByRole('button', {
      name: 'blue chalk: assessment',
    }),
  ).toHaveAttribute('aria-pressed', 'true')

  await page.keyboard.type('/')
  const find = page.getByRole('searchbox', { name: 'Find a control' })
  await expect(find).toBeFocused()
  await expect(find).toHaveValue('')
  await page.keyboard.type('j?')
  await expect(find).toHaveValue('j?')
  await expect(dialog).toBeHidden()
  await expect(page).toHaveURL(/control=ac-l1-b-1-i(?:&|$)/)
  await page.keyboard.press('Escape')
  await expect(
    page.getByRole('button', { name: 'Find a control' }),
  ).toBeFocused()
})

test('printing a control gives a one-page sheet in black on white without the tray', async ({
  page,
}) => {
  // A4 less the sheet's margins, at 96dpi.
  await page.setViewportSize({ width: 673, height: 1017 })
  await page.goto(`${reader}&tab=explain`)
  await expect(page.getByRole('tab', { name: 'I’m new to this' })).toBeVisible()
  await page.emulateMedia({ media: 'print' })
  for (const selector of [
    '.chalk-tray',
    '.site-nav',
    '.site-footer',
    '.control-tabs',
    '.control-actions',
    '.control-prevnext',
    '.chalk-picker',
    '.rail-line',
    '.board-dust',
  ])
    await expect(page.locator(selector).first()).toBeHidden()
  await expect(page.locator('.lockup')).toBeVisible()
  await expect(page.locator('.control-panel-decode')).toBeVisible()
  await expect(page.locator('.control-panel-explain')).toBeVisible()
  await expect(page.locator('.control-panel-practice')).toBeHidden()
  await expect(page.locator('.control-panel-related')).toBeHidden()
  const citation = page.locator('.control-print-citation')
  await expect(citation).toBeVisible()
  await expect(citation).toContainText(
    'Verbatim. CMMC Assessment Guide – Level 1, v2.13, page',
  )
  expect(
    await page.evaluate(() => getComputedStyle(document.body).backgroundColor),
  ).toBe('rgb(255, 255, 255)')
  for (const selector of [
    'h1',
    '.control-panel-explain .explain-text',
    '.control-id',
    '.decode-sentence',
  ])
    expect(
      await page
        .locator(selector)
        .evaluate((node) => getComputedStyle(node).color),
    ).toBe('rgb(0, 0, 0)')
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight),
  ).toBeLessThanOrEqual(1017)
})
