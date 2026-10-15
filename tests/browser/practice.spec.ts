import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('on a desktop the first situation runs beside the list, an answer shows its feedback, and the question lives in the address', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/practice')
  const list = page.getByRole('region', { name: 'Work through a situation.' })
  const run = page.getByRole('article')
  await expect(list.getByRole('heading', { level: 1 })).toHaveText(
    'Work through a situation.',
  )
  await expect(run.getByRole('heading', { level: 2 })).toHaveText(
    'Who and what can connect?',
  )
  await expect(run).toContainText('Question 1 of 3')
  await expect(
    list.getByRole('link', { name: /^Who and what can connect\?/ }),
  ).toHaveAttribute('aria-current', 'page')
  await page.evaluate(() => document.fonts.ready)
  // The list and the situation scroll on their own; the page stays put.
  const scroll = await page.evaluate(() => {
    const main = document.getElementById('main')!
    const rows = document.querySelector('.practice-list')!
    return {
      main: main.scrollHeight - main.clientHeight,
      rows: rows.scrollHeight - rows.clientHeight,
    }
  })
  expect(scroll.main).toBeLessThanOrEqual(0)
  expect(scroll.rows).toBeGreaterThan(0)
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  // An answer, from the keyboard: its feedback under it, then where next.
  const choices = run.locator('.practice-run-choice')
  await expect(choices).toHaveCount(3)
  await choices.nth(1).focus()
  await page.keyboard.press('Enter')
  const feedback = run.getByRole('status')
  await expect(feedback).toBeVisible()
  await expect(feedback).toBeFocused()
  await expect(choices.nth(1)).toHaveAttribute('aria-pressed', 'true')
  await expect(choices.nth(0)).toBeDisabled()
  await expect(
    run.getByRole('heading', { name: 'A common mix-up' }),
  ).toBeVisible()
  await expect(
    run.getByRole('link', { name: 'Read the requirement' }),
  ).toHaveAttribute('href', /control=ac-l1-b-1-i/)
  await expect(
    run.getByRole('link', { name: 'Watch the 40-second chalk talk' }),
  ).toHaveAttribute('href', /tab=practice/)
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await run.getByRole('button', { name: 'Next question' }).click()
  await expect(page).toHaveURL(
    /\/practice\?activity=level-one-authorized-access&q=2$/,
  )
  await expect(run).toContainText('Question 2 of 3')
  await expect(run.locator('.practice-run-prompt')).toBeFocused()
  // Back looks at the answered question; forward returns.
  await page.goBack()
  await expect(run).toContainText('Question 1 of 3')
  await expect(choices.nth(1)).toHaveAttribute('aria-pressed', 'true')
  await page.goForward()
  await expect(run).toContainText('Question 2 of 3')
  // A level narrows the list in the address; the search narrows it in place.
  await list
    .getByRole('group', { name: 'Level' })
    .getByRole('link', { name: '3', exact: true })
    .click()
  await expect(page).toHaveURL(/level=Level\+3/)
  await expect(
    list.getByRole('status', { name: 'Situation results' }),
  ).toHaveText('3 of 13 situations')
  await list.getByRole('searchbox', { name: 'Find a situation' }).fill('deploy')
  await expect(
    list.getByRole('status', { name: 'Situation results' }),
  ).toHaveText('1 of 13 situations')
  await list
    .getByRole('link', { name: /^Ready to deploy a response team/ })
    .click()
  await expect(page).toHaveURL(/activity=level-three-response-team-deployment/)
  await expect(run.getByRole('heading', { level: 2 })).toBeFocused()
  await expect(run).toContainText('IR.L3-3.6.2e')
})

test('finishing a situation moves focus to the completion line', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/practice?activity=level-one-authorized-access')
  const run = page.getByRole('article')
  for (let index = 0; index < 3; index += 1) {
    await run.locator('.practice-run-choice').first().click()
    await run
      .getByRole('button', {
        name: index === 2 ? 'Finish practice' : 'Next question',
      })
      .click()
  }
  const done = run.getByText('Practice complete. Keep asking why.')
  await expect(done).toBeFocused()
  await expect(
    run.getByRole('button', { name: 'Practice again' }),
  ).toBeVisible()
})

test('on a phone an answered situation keeps its heading order and passes the scan', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/practice?activity=level-one-authorized-access')
  const run = page.getByRole('article')
  await expect(run.getByRole('heading', { level: 1 })).toHaveText(
    'Who and what can connect?',
  )
  await run.locator('.practice-run-choice').nth(1).click()
  await expect(run.getByRole('status')).toBeFocused()
  await expect(
    run.getByRole('heading', { level: 2, name: 'A common mix-up' }),
  ).toBeVisible()
  // The struck claim is struck on every line it wraps to.
  const claim = run.locator('.practice-run-claim s')
  expect(
    await claim.evaluate((node) => getComputedStyle(node).textDecorationLine),
  ).toBe('line-through')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  )
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
})

test.describe('forced colors', () => {
  test.use({ forcedColors: 'active', reducedMotion: 'reduce' })
  test('the practice page keeps its marks under forced colors', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/practice')
    const run = page.getByRole('article')
    await run.locator('.practice-run-choice').nth(1).click()
    await expect(run.getByRole('status')).toBeFocused()
    const claim = run.locator('.practice-run-claim s')
    expect(
      await claim.evaluate((node) => getComputedStyle(node).textDecorationLine),
    ).toBe('line-through')
    const scan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'])
      // axe reports authored chalk colors against the forced canvas, as the
      // accessibility spec notes; Chromium paints system colors.
      .disableRules(['color-contrast'])
      .analyze()
    expect(scan.violations).toEqual([])
  })
})

test('on a phone the situations come first, and one opens full width with a way back', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/practice')
  const list = page.getByRole('region', { name: 'Work through a situation.' })
  await expect(list).toBeVisible()
  await expect(page.getByRole('article')).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  )
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await list.getByRole('link', { name: /^What belongs in public\?/ }).click()
  await expect(page).toHaveURL(/activity=level-one-public-information$/)
  const run = page.getByRole('article')
  await expect(run.getByRole('heading', { level: 1 })).toHaveText(
    'What belongs in public?',
  )
  await expect(run.getByRole('heading', { level: 1 })).toBeFocused()
  await expect(list).toHaveCount(0)
  const box = (await run.boundingBox())!
  expect(box.width).toBeGreaterThan(300)
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await run.getByRole('link', { name: '← All situations' }).click()
  await expect(page).toHaveURL(/\/practice$/)
  await expect(list).toBeVisible()
  await expect(list).toBeFocused()
})
