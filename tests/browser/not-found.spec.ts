import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

for (const width of [390, 1280]) {
  test(`an unknown path shows the app's own blank board at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width < 640 ? 844 : 800 })
    await page.goto('/nope')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'This board is blank.',
    )
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible()
    await expect(page).toHaveTitle(/Page not found/)
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  })
}

test('the build carries a 404 page that is the app itself, for the host to serve with a 404 status', async ({
  request,
}) => {
  const index = await request.get('/index.html')
  const notFound = await request.get('/404.html')
  expect(notFound.status()).toBe(200)
  expect(await notFound.text()).toBe(await index.text())
  expect(await notFound.text()).toContain('id="root"')
})

test('/controls is the Controls page', async ({ page }) => {
  await page.goto('/controls')
  await expect(page).toHaveURL(/\/learn\?view=discover&collection=references$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Controls')
  await expect(
    page
      .getByRole('navigation', { name: 'Main' })
      .getByRole('link', { name: 'Controls' }),
  ).toHaveAttribute('aria-current', 'page')
})
