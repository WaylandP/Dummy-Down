import { expect, test } from '@playwright/test'

test('home defers the Explorer and a failed lesson chunk recovers the exact address', async ({
  page,
}) => {
  const scripts: string[] = []
  page.on('request', (request) => {
    if (request.resourceType() === 'script') scripts.push(request.url())
  })
  await page.goto('/')
  await expect(
    page.getByRole('searchbox', { name: 'Search the control library' }),
  ).toBeVisible()
  expect(scripts.some((url) => /\/LearningPage-/.test(url))).toBe(false)
  expect(scripts.some((url) => /\/VisualExplanation-/.test(url))).toBe(false)
  const address =
    '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ia-l2-3-5-3&mode=compliance#main'
  await page.route('**/assets/LearningPage-*.js', (route) => route.abort())
  await page.goto(address)
  await expect(page.getByRole('status')).toContainText(
    'The learning workspace could not load.',
  )
  await expect(
    page.getByRole('button', { name: 'Reload this lesson or search' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Return home' })).toHaveAttribute(
    'href',
    '/',
  )
  expect(
    new URL(page.url()).pathname +
      new URL(page.url()).search +
      new URL(page.url()).hash,
  ).toBe(address)
  await expect(page.locator('#main')).toBeFocused()
  await page.unroute('**/assets/LearningPage-*.js')
  await page
    .getByRole('button', { name: 'Reload this lesson or search' })
    .click()
  await expect(page.getByRole('tabpanel', { name: 'Compliance' })).toBeVisible()
  await expect(page).toHaveTitle(/IA.L2-3.5.3/)
  expect(
    new URL(page.url()).pathname +
      new URL(page.url()).search +
      new URL(page.url()).hash,
  ).toBe(address)
  expect(scripts.some((url) => /\/LearningPage-/.test(url))).toBe(true)
})
