import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { chalkFor } from '../../src/components/board/chalks'

test('coverage filters, ODP labels, missing explanations and native history work', async ({
  page,
}) => {
  await page.goto('/coverage')
  await expect(
    page.getByRole('heading', { name: '468 statements · 149 controls' }),
  ).toBeVisible()
  await expect(page.locator('.coverage-totals')).toContainText('466')
  await expect(page.locator('.coverage-totals')).toContainText('468')
  await page
    .getByRole('combobox', { name: 'Level', exact: true })
    .selectOption('Level 3')
  await page.getByRole('button', { name: 'Apply filters' }).click()
  await expect(
    page.getByRole('heading', { name: '89 statements · 24 controls' }),
  ).toBeVisible()
  await page
    .getByRole('combobox', { name: 'Explanation coverage', exact: true })
    .selectOption('missing')
  await page.getByRole('button', { name: 'Apply filters' }).click()
  await expect(
    page.getByRole('heading', { name: '2 statements · 1 control' }),
  ).toBeVisible()
  await expect(
    page.getByText('SI.L3-3.14.3e[b]', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Unresolved source wording' }),
  ).toHaveCount(2)
  await expect(page.getByText('Read the explanation')).toHaveCount(0)
  await page.goBack()
  await expect(
    page.getByRole('heading', { name: '89 statements · 24 controls' }),
  ).toBeVisible()
  await page.reload()
  await expect(
    page.getByRole('combobox', { name: 'Level', exact: true }),
  ).toHaveValue('Level 3')
  await page.goto('/coverage?control=RA.L3-3.11.2e')
  await expect(
    page.getByText('RA.L3-3.11.2e[ODP4]', { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByText('RA.L3-3.11.2e[ODP1]', { exact: true }),
  ).toHaveCount(0)
})

test('source details lead to the exact perspective and coverage return link', async ({
  page,
}) => {
  await page.goto('/coverage?control=AC.L1-b.1.i')
  await expect(
    page.getByRole('heading', { name: '6 statements · 1 control' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Apply filters' }).click()
  await expect(
    page.getByRole('heading', { name: '6 statements · 1 control' }),
  ).toBeVisible()
  const objective = page.locator('.coverage-statements > li').first()
  await objective.getByText('Read the explanation').click()
  await expect(
    objective.getByText(/Map approved user, process and device identities/),
  ).toBeVisible()
  await expect(objective.getByText(/Selected fictional example/)).toBeVisible()
  await objective
    .getByRole('link', { name: 'Read the IT & Cyber explanation' })
    .click()
  await expect(
    page.getByRole('tab', { name: chalkFor('it-cyber').prompt, exact: true }),
  ).toHaveAttribute('aria-selected', 'true')
  await expect(
    page.getByRole('heading', {
      name: 'Authorized Access Control [FCI Data]',
      exact: true,
    }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Related', exact: true }).click()
  await page.getByRole('link', { name: /See assessment statements/ }).click()
  await expect(
    page.getByRole('heading', { name: '6 statements · 1 control' }),
  ).toBeVisible()
})

test('keyboard pagination, empty recovery and invalid page values stay usable', async ({
  page,
}) => {
  await page.goto('/coverage')
  const next = page.getByRole('link', { name: 'Next controls' })
  await next.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByText('Page 2 of 10', { exact: true })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: '468 statements · 149 controls' }),
  ).toBeFocused()
  await page
    .getByLabel('Find a control or source statement')
    .fill('no-such-control-xyz')
  await page.getByRole('button', { name: 'Apply filters' }).click()
  await expect(
    page.getByRole('heading', { name: 'No statements match this search.' }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Browse all statements' }).click()
  await expect(page.getByText('Page 1 of 10', { exact: true })).toBeVisible()
  await page.goto('/coverage?page=Infinity')
  await expect(page.getByText('Page 1 of 10', { exact: true })).toBeVisible()
  await page.goto('/coverage?control=not-a-control')
  await expect(
    page.getByRole('heading', { name: 'No statements match this search.' }),
  ).toBeVisible()
})

test('coverage is lazy and has recoverable chunk failure', async ({ page }) => {
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  expect(requests.some((url) => /\/CoveragePage-.*\.js/.test(url))).toBe(false)
  await page.route('**/assets/CoveragePage-*.js', (route) => route.abort())
  // Home's third chalk is the stranger's way to the objectives.
  await page
    .getByRole('list', { name: 'Pick up a chalk to start.' })
    .getByRole('link', { name: /^I’m preparing for an assessment/ })
    .click()
  await expect(page.locator('#main').getByRole('status')).toHaveText(
    /coverage report could not load/,
  )
  await expect(page.getByRole('link', { name: 'Browse lessons' })).toBeVisible()
  await page.unroute('**/assets/CoveragePage-*.js')
  await page.getByRole('button', { name: 'Reload report' }).click()
  await expect(
    page.getByRole('heading', { name: '468 statements · 149 controls' }),
  ).toBeVisible()
})

test('expanded source and teaching remain readable and keyboard accessible on mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await page.goto('/coverage?control=CA.L2-3.12.4')
  await expect(page.getByText('CA.L2-3.12.4[d]', { exact: true })).toBeVisible()
  const statement = page
    .locator('.coverage-statements > li')
    .filter({ hasText: 'CA.L2-3.12.4[d]' })
  const toggle = statement.locator('summary')
  await toggle.focus()
  await page.keyboard.press('Enter')
  await expect(
    statement.getByRole('heading', { name: 'Supplementary teaching note' }),
  ).toBeVisible()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320)
  const scan = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .analyze()
  expect(scan.violations).toEqual([])
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
  await toggle.focus()
  expect(
    await toggle.evaluate((node) => getComputedStyle(node).outlineStyle),
  ).not.toBe('none')
  await page.keyboard.press('Enter')
  await expect(toggle).toBeFocused()
})
