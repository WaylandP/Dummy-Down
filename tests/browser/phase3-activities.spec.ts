import { expect, test } from '@playwright/test'
import { expandedLearningActivities } from '../../src/data/expanded-learning'
import { chalkFor } from '../../src/components/board/chalks'

for (const activity of expandedLearningActivities) {
  test(`source-bound practice: ${activity.id}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1000 })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    const params = new URLSearchParams({
      view: 'lesson',
      framework: activity.lesson.frameworkId,
      edition: activity.lesson.editionId,
      control: activity.lesson.controlKey,
      mode: 'beginner',
      tab: 'practice',
    })
    await page.goto(`/learn?${params}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(
      page.getByText(activity.learningObjective, { exact: false }).first(),
    ).toBeVisible()
    await page
      .getByRole('button', { name: 'Start or return to questions' })
      .click()
    const terms = page.locator('.learning-practice .context-terms')
    await terms.locator('.term-trigger').first().click()
    await expect(terms.locator('.term-definition')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(terms.locator('.term-trigger').first()).toBeFocused()
    for (const [index, question] of activity.questions.entries()) {
      const choice = question.choices.find(
        (choice) => choice.id !== question.correctChoiceId,
      )!
      await page.getByRole('radio', { name: choice.label, exact: true }).check()
      if (index === 0) {
        await page.getByRole('link', { name: 'Explain', exact: true }).click()
        await page
          .getByRole('tab', {
            name: chalkFor('compliance').prompt,
            exact: true,
          })
          .click()
        await page
          .getByRole('navigation', { name: 'Views of this control' })
          .getByRole('link', { name: 'Practice', exact: true })
          .click()
        await expect(
          page.getByRole('radio', { name: choice.label, exact: true }),
        ).toBeChecked()
      }
      await page.getByRole('button', { name: 'Check answer' }).click()
      await expect(
        page.getByRole('status', { name: 'Answer feedback' }),
      ).toContainText(choice.feedback)
      await page
        .getByRole('button', {
          name: index === 2 ? 'Finish practice' : 'Next question',
        })
        .click()
    }
    await page.getByText('Review the reasoning', { exact: true }).click()
    await expect(
      page.getByText('Worth another look', { exact: true }),
    ).toHaveCount(3)
    await expect(
      page.getByRole('link', { name: 'Choose another situation' }),
    ).toHaveAttribute('href', '/practice')
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    expect(errors).toEqual([])
  })
}

test('practice index filters, history, empty recovery and chunk failure', async ({
  page,
}) => {
  await page.goto('/practice')
  await expect(
    page.getByRole('status').filter({ hasText: 'activities available' }),
  ).toHaveText('13 activities available')
  await page
    .getByRole('combobox', { name: 'Level', exact: true })
    .selectOption('Level 3')
  await page.getByRole('button', { name: 'Find activities' }).click()
  await expect(page.getByRole('status')).toHaveText('3 activities available')
  await page
    .getByRole('searchbox', { name: 'Search activities' })
    .fill('no-such-situation')
  await page.getByRole('button', { name: 'Find activities' }).click()
  await expect(
    page.getByRole('heading', { name: 'No matching activities.' }),
  ).toBeVisible()
  await page.goBack()
  await expect(page.getByRole('status')).toHaveText('3 activities available')
  await page.route('**/assets/PracticePage-*.js', (route) => route.abort())
  await page.reload()
  await expect(
    page.getByText(
      'The practice index could not load. Your lessons are still available.',
    ),
  ).toBeVisible()
  await page.unroute('**/assets/PracticePage-*.js')
  await page.getByRole('button', { name: 'Reload practice' }).click()
  await expect(page.getByRole('status')).toHaveText('3 activities available')
})
