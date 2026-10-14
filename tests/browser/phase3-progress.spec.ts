import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const lesson =
  '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l1-b-1-i&mode=beginner'
const consent = 'dummy-down:learning-saving:v1'
const data = 'dummy-down:learning-progress:v1'
async function settings(page: Page) {
  const panel = page.locator('.progress-preferences')
  if (!(await panel.evaluate((node) => (node as HTMLDetailsElement).open)))
    await panel.locator('summary').click()
  return panel
}
async function enable(page: Page) {
  const panel = await settings(page)
  await panel
    .getByRole('button', { name: 'Save learning on this browser', exact: true })
    .click()
  await expect(panel.getByRole('status')).toContainText('Saving is on')
  await expect(panel.getByRole('status')).toBeFocused()
}
async function start(page: Page) {
  await page
    .getByRole('button', { name: 'Start or return to questions' })
    .click()
}
async function wrong(page: Page) {
  // The source-bound L1 activity's first choice is the documented misunderstanding.
  await page.getByRole('radio').first().check()
  await page.getByRole('button', { name: 'Check answer' }).click()
  await expect(
    page.getByRole('status', { name: 'Answer feedback' }),
  ).toContainText('Not quite.')
}

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`optional progress resumes and reviews at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto(lesson)
    await enable(page)
    await start(page)
    await wrong(page)
    await page.getByRole('button', { name: 'Next question' }).click()
    await page.getByRole('radio').first().check()
    await page.reload()
    await start(page)
    await expect(page.locator('.practice-prompt')).toBeFocused()
    await expect(
      page.getByText('Question 2 of 3', { exact: true }),
    ).toBeVisible()
    await expect(page.locator('input[type=radio]:checked')).toHaveCount(0)
    await page.getByText('Review earlier answers', { exact: true }).click()
    await expect(page.locator('.practice-recap')).toContainText(
      'Worth another look',
    )
    await expect(page.locator('.practice-recap')).toContainText(
      'What to take away:',
    )
    if (process.env.CAPTURE_PHASE3 && [390, 1440].includes(width)) {
      await page.locator('.knowledge-check').scrollIntoViewIfNeeded()
      await page.screenshot({
        path: `docs/screenshots/phase3/progress-resume-${width}.png`,
      })
    }
    for (let index = 1; index < 3; index++) {
      await page.getByRole('radio').first().check()
      await page.getByRole('button', { name: 'Check answer' }).click()
      await page
        .getByRole('button', {
          name: index === 2 ? 'Finish practice' : 'Next question',
        })
        .click()
    }
    await page
      .getByRole('button', { name: 'Revisit later', exact: true })
      .click()
    await page.getByRole('link', { name: 'Choose another situation' }).click()
    await page
      .getByRole('combobox', { name: 'Learning status' })
      .selectOption('completed')
    await page.getByRole('button', { name: 'Find activities' }).click()
    await expect(
      page.getByRole('status', { name: 'Activity results' }),
    ).toHaveText('1 activity available')
    await expect(page.locator('.practice-row-status')).toContainText(
      'Practice complete',
    )
    await expect(
      page.getByRole('button', { name: /^Revisit later:/, pressed: true }),
    ).toBeVisible()
    await expect(page.getByText(/answers worth another look/)).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    expect(
      (await new AxeBuilder({ page }).include('.practice-page').analyze())
        .violations,
    ).toEqual([])
    if (process.env.CAPTURE_PHASE3 && [390, 1440].includes(width)) {
      await page.screenshot({
        path: `docs/screenshots/phase3/progress-index-${width}.png`,
      })
    }
    await page.getByRole('link', { name: /^Review reasoning\s*:/ }).click()
    await start(page)
    await expect(
      page.getByRole('heading', {
        name: 'Practice complete. Keep asking why.',
      }),
    ).toBeFocused()
    await page.getByText('Review the reasoning', { exact: true }).click()
    await expect(page.locator('.practice-recap li')).toHaveCount(3)
    const panel = await settings(page)
    await panel
      .getByRole('button', { name: 'Delete progress and stop saving' })
      .click()
    await expect(
      page.getByText('Question 1 of 3', { exact: true }),
    ).toBeVisible()
    expect(
      await page.evaluate(
        ([c, d]) => [localStorage.getItem(c!), localStorage.getItem(d!)],
        [consent, data],
      ),
    ).toEqual([null, null])
  })
}

test('checked feedback restores, deletion synchronizes and stale selections cannot restore it', async ({
  page,
  context,
}) => {
  await page.goto(lesson)
  await enable(page)
  await start(page)
  await wrong(page)
  await page.reload()
  await start(page)
  await expect(
    page.getByRole('status', { name: 'Answer feedback' }),
  ).toContainText('Not quite.')
  const second = await context.newPage()
  await second.goto(lesson)
  await start(second)
  await expect(
    second.getByRole('status', { name: 'Answer feedback' }),
  ).toContainText('Not quite.')
  await second.getByRole('button', { name: 'Next question' }).click()
  await second.getByRole('radio').first().check()
  const panel = await settings(page)
  await panel
    .getByRole('button', { name: 'Delete progress and stop saving' })
    .click()
  await expect(
    second.getByText('Question 1 of 3', { exact: true }),
  ).toBeVisible()
  await expect(second.locator('input[type=radio]:checked')).toHaveCount(0)
  await wrong(second)
  expect(
    await second.evaluate(
      ([c, d]) => [localStorage.getItem(c!), localStorage.getItem(d!)],
      [consent, data],
    ),
  ).toEqual([null, null])
})

for (const signal of [
  'globalPrivacyControl',
  'doNotTrack',
  'storage',
] as const) {
  test(`${signal} retains usable unsaved practice`, async ({ page }) => {
    await page.addInitScript((signal) => {
      if (signal === 'storage') {
        Storage.prototype.getItem = () => {
          throw new DOMException('Blocked', 'SecurityError')
        }
        Storage.prototype.setItem = () => {
          throw new DOMException('Blocked', 'SecurityError')
        }
      } else
        Object.defineProperty(navigator, signal, {
          configurable: true,
          value: signal === 'doNotTrack' ? '1' : true,
        })
    }, signal)
    await page.goto(lesson)
    const panel = await settings(page)
    await expect(panel.getByRole('status')).toContainText(
      signal === 'storage' ? 'storage is unavailable' : 'privacy signal is on',
    )
    await start(page)
    await wrong(page)
    await page.getByRole('button', { name: 'Next question' }).click()
    await expect(
      page.getByText('Question 2 of 3', { exact: true }),
    ).toBeVisible()
  })
}

test('a changed content version resets saved answers and explains why', async ({
  page,
}) => {
  await page.goto(lesson)
  await enable(page)
  await start(page)
  await wrong(page)
  await page.evaluate((key) => {
    const value = JSON.parse(localStorage.getItem(key)!)
    value.entries[0].contentVersion = 'old-content'
    localStorage.setItem(key, JSON.stringify(value))
  }, data)
  await page.reload()
  await start(page)
  await expect(page.locator('input[type=radio]:checked')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'Check answer' }),
  ).toBeDisabled()
  const panel = await settings(page)
  await expect(panel.getByText(/Some saved practice was reset/)).toBeVisible()
})

test('progress controls work with keyboard, forced colors and reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' })
  await page.goto(lesson)
  const summary = page.locator('.progress-preferences summary')
  await summary.focus()
  await page.keyboard.press('Enter')
  await page.keyboard.press('Tab')
  await expect(
    page.getByRole('button', {
      name: 'Save learning on this browser',
      exact: true,
    }),
  ).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(
    page.locator('.progress-preferences [role=status]'),
  ).toBeFocused()
  await start(page)
  await page.keyboard.press('Tab')
  await page.keyboard.press('Space')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Check answer' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(
    page.getByRole('status', { name: 'Answer feedback' }),
  ).toBeFocused()
  expect(
    (
      await new AxeBuilder({ page })
        .include('.learning-practice')
        // Axe reads authored colors, not the user-selected forced palette.
        .disableRules(['color-contrast'])
        .analyze()
    ).violations,
  ).toEqual([])
  if (process.env.CAPTURE_PHASE3)
    await page.screenshot({
      path: 'docs/screenshots/phase3/progress-forced-colors.png',
    })
})

test('two unsaved tabs retain distinct work when saving is first enabled', async ({
  page,
  context,
}) => {
  await page.goto(lesson)
  await start(page)
  await wrong(page)
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([])
  const second = await context.newPage()
  await second.goto(lesson.replace('ac-l1-b-1-i', 'ac-l1-b-1-ii'))
  await start(second)
  await second.getByRole('radio').first().check()
  await second.getByRole('button', { name: 'Check answer' }).click()
  await enable(page)
  await expect(second.locator('.activity-progress-tools')).toContainText(
    'Practice is saved on this browser.',
  )
  await expect
    .poll(() =>
      second.evaluate(
        (key) =>
          JSON.parse(localStorage.getItem(key)!).entries.filter(
            (item: { checkedAnswers: object }) =>
              Object.keys(item.checkedAnswers).length > 0,
          ).length,
        data,
      ),
    )
    .toBe(2)
  await second.reload()
  await start(second)
  await expect(
    second.getByRole('button', { name: 'Check answer' }),
  ).toBeDisabled()
  await expect(second.locator('input[type=radio]:checked')).toHaveCount(1)
})

test('removing the last revisit mark keeps focus on recoverable results', async ({
  page,
}) => {
  await page.goto('/practice')
  await expect(
    page.getByRole('combobox', { name: 'Learning status' }),
  ).toBeDisabled()
  await enable(page)
  await page
    .getByRole('button', { name: /^Revisit later:/ })
    .first()
    .click()
  await page
    .getByRole('combobox', { name: 'Learning status' })
    .selectOption('revisit')
  await page.getByRole('button', { name: 'Find activities' }).click()
  await expect(
    page.getByRole('status', { name: 'Activity results' }),
  ).toHaveText('1 activity available')
  await page
    .getByRole('button', { name: /^Revisit later:/, pressed: true })
    .click()
  await expect(
    page.getByRole('status', { name: 'Activity results' }),
  ).toHaveText('0 activities available')
  await expect(
    page.getByRole('status', { name: 'Activity results' }),
  ).toBeFocused()
  await expect(
    page.getByRole('link', { name: 'Browse all activities' }),
  ).toBeVisible()
})
