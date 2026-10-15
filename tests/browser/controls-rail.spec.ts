import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const controls = '/learn?view=discover&collection=references'
const reader =
  '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l1-b-1-i&mode=beginner'

test('on a desktop the rail stands beside the control and scrolls on its own', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(reader)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Authorized Access Control [FCI Data]',
  )
  await page.evaluate(() => document.fonts.ready)
  const rail = page.getByRole('navigation', { name: 'All controls' })
  await expect(rail).toBeVisible()
  await expect(page.getByRole('button', { name: 'All controls' })).toHaveCount(
    0,
  )
  const railBox = (await rail.boundingBox())!
  const article = (await page.locator('.control-page').boundingBox())!
  expect(railBox.x + railBox.width).toBeLessThanOrEqual(article.x)
  // The family list scrolls inside the rail; the page around it stays put.
  const scroll = await page.evaluate(() => {
    const list = document.querySelector('.rail-list')!
    const main = document.getElementById('main')!
    return {
      list: list.scrollHeight - list.clientHeight,
      main: main.scrollHeight - main.clientHeight,
    }
  })
  expect(scroll.list).toBeGreaterThan(0)
  expect(scroll.main).toBeLessThanOrEqual(0)
  // The control on the board is marked in its open family.
  const current = rail.getByRole('link', { name: /^AC\.L1-b\.1\.i Authorized/ })
  await expect(current).toHaveAttribute('aria-current', 'page')
  await expect(
    rail.getByRole('link', { name: /^AC Access Control/ }),
  ).toHaveAttribute('aria-expanded', 'true')
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  // A long view scrolls in the control's column, under the rail, and the
  // scrolling keys reach it with nothing focused.
  await page
    .getByRole('navigation', { name: 'Views of this control' })
    .getByRole('link', { name: 'Practice', exact: true })
    .click()
  await expect(page).toHaveURL(/tab=practice/)
  const column = page.locator('.controls-main')
  const top = () => column.evaluate((node) => node.scrollTop)
  const before = (await rail.boundingBox())!
  await page.evaluate(() => (document.activeElement as HTMLElement)?.blur())
  await page.keyboard.press('PageDown')
  await expect.poll(top).toBeGreaterThan(0)
  expect(await rail.boundingBox()).toEqual(before)
  expect(
    await page.evaluate(() => document.getElementById('main')!.scrollTop),
  ).toBe(0)
})

test('Start here walks the fifteen basics in order, and any other pick leaves the path', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(controls)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Controls' }),
  ).toBeVisible()
  const rail = page.getByRole('navigation', { name: 'All controls' })
  const start = rail.getByRole('link', { name: /^Start here/ })
  await expect(start).toContainText('The fifteen Level 1 basics, in order.')
  await start.click()
  await expect(page).toHaveURL(/path=basics/)
  await expect(page).toHaveURL(/control=ac-l1-b-1-i(?:&|$)/)
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
  await expect(start).toContainText('1 of 15')
  await expect(start.locator('rect.is-current')).toHaveCount(1)
  const next = page.getByRole('button', {
    name: 'Next on the path: AC.L1-b.1.ii →',
  })
  await next.click()
  await expect(page).toHaveURL(/path=basics/)
  await expect(page).toHaveURL(/control=ac-l1-b-1-ii/)
  await expect(start).toContainText('2 of 15')
  await expect(
    page.getByRole('button', { name: 'Next on the path: AC.L1-b.1.iii →' }),
  ).toBeFocused()
  // Back and forward keep the position on the path.
  await page.goBack()
  await expect(start).toContainText('1 of 15')
  await page.goForward()
  await expect(start).toContainText('2 of 15')
  // Another control from the rail leaves the path.
  await rail.getByRole('link', { name: /^AC\.L1-b\.1\.iv / }).click()
  await expect(page).not.toHaveURL(/path=/)
  await expect(start).not.toContainText('of 15')
  await expect(
    page.getByRole('button', { name: /^Next on the path/ }),
  ).toHaveCount(0)
  // Off the path the foot steps through the results instead.
  await expect(page.getByRole('button', { name: /^Next: / })).toBeVisible()
})

test('the find line and the level switch narrow the rail and the results together', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto(controls)
  const rail = page.getByRole('navigation', { name: 'All controls' })
  await rail
    .getByRole('group', { name: 'Level' })
    .getByRole('link', { name: '1', exact: true })
    .click()
  await expect(page).toHaveURL(/level=Level\+1/)
  await expect(
    page.getByRole('status', { name: 'Control search results' }),
  ).toContainText('15 references')
  await expect(
    rail.getByRole('link', { name: /^AC Access Control 4$/ }),
  ).toBeVisible()
  await expect(rail.getByRole('link', { name: /^AT / })).toContainText('0')
  const find = rail.getByRole('searchbox', { name: 'Find controls' })
  await find.fill('media')
  await expect(page).toHaveURL(/q=media/)
  await expect(
    rail.getByRole('link', { name: /^MP Media Protection/ }),
  ).toHaveAttribute('aria-expanded', 'true')
  await expect(
    rail.getByRole('link', { name: /^MP\.L1-b\.1\.vii / }),
  ).toBeVisible()
  await expect(
    rail.getByRole('link', { name: /^AC Access Control/ }),
  ).toHaveCount(0)
})

test('on a phone the rail is a sheet behind an All controls line, with Start here as one line', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(reader)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Authorized Access Control [FCI Data]',
  )
  await page.evaluate(() => document.fonts.ready)
  const line = page.locator('.rail-line')
  await expect(line).toBeVisible()
  const open = page.getByRole('button', { name: 'All controls' })
  const start = line.getByRole('link', { name: /^Start here/ })
  await expect(start).toBeVisible()
  const lineBox = (await line.boundingBox())!
  expect(lineBox.height).toBeLessThanOrEqual(60)
  await expect(
    page.getByRole('navigation', { name: 'All controls' }),
  ).toBeHidden()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await open.click()
  const sheet = page.getByRole('dialog', { name: 'All controls' })
  await expect(sheet).toBeVisible()
  const sheetBox = (await sheet.boundingBox())!
  expect(sheetBox.width).toBe(390)
  expect(sheetBox.height).toBe(844)
  await expect(
    page.getByRole('searchbox', { name: 'Find controls' }),
  ).toBeFocused()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await sheet.getByRole('link', { name: /^AC\.L1-b\.1\.ii / }).click()
  await expect(sheet).toBeHidden()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Transaction & Function Control [FCI Data]',
  )
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
  // Start here from the line puts the first basic on the board, on the path.
  await start.click()
  await expect(page).toHaveURL(/path=basics/)
  await expect(start).toContainText('1 of 15')
})
