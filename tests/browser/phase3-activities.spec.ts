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

test('practice situations narrow by level in the address and by typing, recover, and survive a chunk failure', async ({
  page,
}) => {
  await page.goto('/practice')
  const count = page.getByRole('status', { name: 'Situation results' })
  await expect(count).toHaveText('13 situations')
  await page
    .getByRole('group', { name: 'Level' })
    .getByRole('link', { name: '3', exact: true })
    .click()
  await expect(page).toHaveURL(/level=Level\+3/)
  await expect(count).toHaveText('3 of 13 situations')
  await page
    .getByRole('searchbox', { name: 'Find a situation' })
    .fill('no-such-situation')
  await expect(page.getByText('No matching situations.')).toBeVisible()
  await page.getByRole('button', { name: 'Show every situation' }).click()
  await expect(page).toHaveURL(/\/practice$/)
  await expect(count).toHaveText('13 situations')
  await page.goBack()
  await expect(count).toHaveText('3 of 13 situations')
  await page.route('**/assets/PracticePage-*.js', (route) => route.abort())
  await page.reload()
  await expect(
    page.getByText(
      'The practice index could not load. The controls are still available.',
    ),
  ).toBeVisible()
  await page.unroute('**/assets/PracticePage-*.js')
  await page.getByRole('button', { name: 'Reload practice' }).click()
  await expect(count).toHaveText('3 of 13 situations')
})
