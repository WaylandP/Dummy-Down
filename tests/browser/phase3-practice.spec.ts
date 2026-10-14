import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const lesson =
  '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l1-b-1-i&mode=beginner'

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`practice entry and reasoning review remain usable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto(lesson)
    await page
      .getByRole('button', { name: 'Start or return to questions' })
      .click()
    await expect(page.locator('.practice-prompt')).toBeFocused()
    await expect(
      page.getByRole('progressbar', { name: 'Questions reviewed' }),
    ).toHaveAttribute('value', '0')
    for (let index = 0; index < 3; index++) {
      await page.getByRole('radio').first().check()
      await page.getByRole('button', { name: 'Check answer' }).click()
      await expect(
        page.getByRole('status', { name: 'Answer feedback' }),
      ).toBeFocused()
      await page
        .getByRole('button', {
          name: index === 2 ? 'Finish practice' : 'Next question',
        })
        .click()
    }
    await page.getByText('Review the reasoning', { exact: true }).click()
    await expect(page.locator('.practice-recap li')).toHaveCount(3)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    const accessibility = await new AxeBuilder({ page })
      .include('.learning-practice')
      .analyze()
    expect(accessibility.violations).toEqual([])
    if (process.env.CAPTURE_PHASE3 && [390, 1440].includes(width)) {
      await page.locator('.practice-complete').scrollIntoViewIfNeeded()
      await page.screenshot({
        path: `docs/screenshots/phase3/practice-${width}.png`,
      })
    }
    await page.getByRole('button', { name: 'Practice again' }).click()
    await expect(page.locator('.practice-prompt')).toBeFocused()
    await expect(
      page.getByRole('progressbar', { name: 'Questions reviewed' }),
    ).toHaveAttribute('value', '0')
  })
}
