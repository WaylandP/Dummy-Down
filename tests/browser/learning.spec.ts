import { expect, test } from '@playwright/test'
import { chalkFor } from '../../src/components/board/chalks'

const newTo = chalkFor('beginner').prompt
const runs = chalkFor('it-cyber').prompt
const preparing = chalkFor('compliance').prompt
const reader =
  '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l1-b-1-i&mode=beginner'

test('filters, history, glossary and empty-result recovery keep a reader oriented', async ({
  page,
}) => {
  await page.goto('/learn?view=discover&collection=references')
  await page
    .getByRole('combobox', { name: 'Level', exact: true })
    .selectOption({ label: 'Level 3' })
  await expect(
    page.getByRole('status', { name: 'Control search results' }),
  ).toContainText('24 references')
  await page.locator('.control-item').first().click()
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
  await page.getByRole('link', { name: 'Explain', exact: true }).click()
  await expect(page.getByRole('tabpanel', { name: newTo })).toBeVisible()
  await page.getByRole('tab', { name: preparing, exact: true }).click()
  await expect(
    page.getByRole('tabpanel', { name: preparing, exact: true }),
  ).toBeVisible()
  await page.goBack()
  await expect(
    page.getByRole('tab', { name: newTo, exact: true }),
  ).toHaveAttribute('aria-selected', 'true')
  await page.goForward()
  await expect(
    page.getByRole('tab', { name: preparing, exact: true }),
  ).toHaveAttribute('aria-selected', 'true')
  await page.reload()
  await expect(
    page.getByRole('tabpanel', { name: preparing, exact: true }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: /^Browse & filter controls \(\d+\)$/ })
    .click()
  const search = page.getByRole('searchbox', { name: 'Search controls' })
  await expect(search).toBeFocused()
  await search.fill('no-such-fictional-learning-topic')
  await expect(
    page.getByRole('heading', { name: 'No matching references.' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Clear filters' }).click()
  await expect(search).toBeFocused()
  await expect(
    page.getByRole('status', { name: 'Control search results' }),
  ).toContainText('149 references')
  await page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: 'Glossary' })
    .click()
  const glossary = page.getByRole('searchbox', { name: 'Search glossary' })
  await glossary.fill('no-such-fictional-term')
  await page.getByRole('button', { name: 'Clear glossary search' }).click()
  await expect(glossary).toBeFocused()
  await expect(
    page.getByRole('status', { name: 'Glossary search results' }),
  ).toContainText('54 terms')
})

test('practice keeps answers across perspectives and supports retry, completion and restart', async ({
  page,
}) => {
  await page.goto(reader)
  await page
    .getByRole('navigation', { name: 'Views of this control' })
    .getByRole('link', { name: 'Practice', exact: true })
    .click()
  await expect(page).toHaveURL(/tab=practice/)
  await page.getByText('Check your understanding', { exact: true }).click()
  const first = page.getByRole('radio').first()
  await first.check()
  await page.getByRole('link', { name: 'Explain', exact: true }).click()
  await page.getByRole('tab', { name: runs }).click()
  await expect(page.getByRole('tabpanel', { name: runs })).toBeVisible()
  await page
    .getByRole('navigation', { name: 'Views of this control' })
    .getByRole('link', { name: 'Practice', exact: true })
    .click()
  await expect(first).toBeChecked()
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(
    page.getByRole('status', { name: 'Answer feedback' }),
  ).not.toBeEmpty()
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.locator('.practice-prompt')).toBeFocused()
  await expect(first).not.toBeChecked()
  for (let question = 1; question <= 3; question++) {
    await expect(page.locator('.practice-progress')).toHaveText(
      `Question ${question} of 3`,
    )
    await page.getByRole('radio').last().check()
    await page.getByRole('button', { name: 'Check answer' }).click()
    await expect(
      page.getByRole('status', { name: 'Answer feedback' }),
    ).toBeFocused()
    await page
      .getByRole('button', {
        name: question === 3 ? 'Finish practice' : 'Next question',
      })
      .click()
  }
  await expect(
    page.getByRole('heading', { name: 'Practice complete. Keep asking why.' }),
  ).toBeFocused()
  await page.getByRole('button', { name: 'Practice again' }).click()
  await expect(page.locator('.practice-prompt')).toBeFocused()
  await expect(page.locator('.practice-progress')).toHaveText('Question 1 of 3')
})

test('a failed teaching download preserves the source and reload recovers the same control', async ({
  page,
}) => {
  await page.route('**/assets/cmmc-perspectives-*.js', (route) => route.abort())
  await page.goto(`${reader}&tab=explain`)
  await expect(
    page
      .getByRole('region', { name: 'Explain' })
      .getByText(
        'The teaching perspectives could not load. You can still read the requirement and sources.',
      ),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Decode', exact: true }).click()
  await expect(page.locator('.reference-requirement')).toBeVisible()
  await page.getByRole('link', { name: 'Explain', exact: true }).click()
  await page.unroute('**/assets/cmmc-perspectives-*.js')
  await page.getByRole('button', { name: 'Reload page to retry' }).click()
  await expect(page.getByRole('tabpanel', { name: newTo })).toBeVisible()
  // Moving between views writes the canonical address (it names the collection).
  await expect(page).toHaveURL(/control=ac-l1-b-1-i(?:&|$)/)
  await expect(page).toHaveURL(/mode=beginner(?:&|$)/)
  await expect(page).toHaveURL(/tab=explain(?:&|$)/)
})

test('malformed links recover explicitly without silently substituting a control', async ({
  page,
}) => {
  await page.goto('/learn?view=lesson&framework=cmmc')
  await expect(
    page.getByRole('heading', { name: 'This lesson link is invalid.' }),
  ).toBeVisible()
  await expect(page.getByRole('tabpanel')).toHaveCount(0)
  await page.getByRole('button', { name: 'Browse examples' }).click()
  await expect(
    page.getByRole('searchbox', { name: 'Search controls' }),
  ).toBeFocused()
  await expect(
    page.getByRole('heading', { name: 'This lesson link is invalid.' }),
  ).toHaveCount(0)
})
