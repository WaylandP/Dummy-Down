import { expect, test } from '@playwright/test'

// The first version taught one README demo lesson beside the references and
// kept it in a second collection. Its links still work: they open
// AC.L2-3.1.1, the control the demo taught, and the address is tidied.
const demo =
  '/?view=lesson&framework=cmmc&edition=readme-example&control=authorized-access'
const title = 'Authorized Access Control [CUI Data]'

test('an old root link to the demo lesson opens AC.L2-3.1.1 in its chalk, with the address rewritten', async ({
  page,
}) => {
  await page.goto(`${demo}&mode=compliance#explorer`)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
  await expect(page).toHaveURL(/edition=cmmc-2-13-sep-2024(?:&|#|$)/)
  await expect(page).toHaveURL(/control=ac-l2-3-1-1(?:&|#|$)/)
  await expect(page).toHaveURL(/mode=compliance(?:&|#|$)/)
  await expect(page).toHaveURL(/collection=references(?:&|#|$)/)
  await expect(page).toHaveURL(/#explorer$/)
  expect(page.url()).not.toContain('readme-example')
  expect(page.url()).not.toContain('authorized-access')
  // The blue chalk is in hand: Explain opens in it.
  await page.getByRole('link', { name: 'Explain', exact: true }).click()
  const pressed = page
    .getByRole('navigation', { name: 'Pick a chalk' })
    .getByRole('button', { pressed: true })
  await expect(pressed).toContainText('blue chalk')
  // The rail marks the control, and Previous/Next step through the results.
  await expect(
    page
      .getByRole('navigation', { name: 'All controls' })
      .getByRole('link', { name: /^AC\.L2-3\.1\.1 / }),
  ).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('button', { name: /^Next: / })).toBeVisible()
})

test('an old link to the demo’s practice opens the activity on the Practice view', async ({
  page,
}) => {
  await page.goto(`/learn${demo}&tab=practice`)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
  await expect(page).toHaveURL(/control=ac-l2-3-1-1(?:&|$)/)
  await expect(page).toHaveURL(/tab=practice(?:&|$)/)
  await expect(
    page.getByRole('heading', { name: 'A working login is not approval' }),
  ).toBeVisible()
  await expect(page.getByText('Practice activity').first()).toBeVisible()
  await expect(
    page.getByRole('link', { name: /CMMC Assessment Guide – Level 2/ }),
  ).toHaveAttribute('href', /#page=22$/)
})

test('the first version’s lessons collection opens the Controls overview', async ({
  page,
}) => {
  await page.goto('/learn?view=discover&collection=lessons')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Controls')
  await expect(
    page.getByRole('status', { name: 'Control search results' }),
  ).toContainText('149 controls')
  await expect(page).toHaveURL(/collection=references(?:&|$)/)
  expect(page.url()).not.toContain('collection=lessons')
  await expect(page.getByRole('combobox')).toHaveCount(0)
})

test('the practice index lists the activity under AC.L2-3.1.1 at Level 2, and its old link still runs it', async ({
  page,
}) => {
  await page.goto('/practice?activity=authorized-access-practice')
  const run = page.getByRole('article')
  await expect(run.getByRole('heading', { level: 2 })).toHaveText(
    'A working login is not approval',
  )
  await expect(run.locator('.practice-run-level')).toHaveText(
    `Level 2 · ${title}`,
  )
  await expect(run.getByText('Project example')).toHaveCount(0)
  await page
    .getByRole('group', { name: 'Level' })
    .getByRole('link', { name: '2', exact: true })
    .click()
  await expect(
    page.getByRole('link', { name: /A working login is not approval/ }),
  ).toBeVisible()
})
