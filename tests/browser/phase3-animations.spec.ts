import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { visualLessonIdentities } from '../../src/data/visual-lesson-index'

const visualExplanations = visualLessonIdentities.map((lesson, index) => ({
  lesson,
  scene: ['access-gate', 'factor-proof', 'response-team'][index],
}))

function address(key: string) {
  return `/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=${key}&mode=beginner&tab=practice`
}

for (const explanation of visualExplanations) {
  for (const width of [320, 390, 768, 1024, 1440]) {
    test(`${explanation.scene}: still stages, transcript and reflow at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 })
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      await page.goto(address(explanation.lesson.controlKey))
      await page
        .getByText('Watch the idea · 40 seconds', { exact: true })
        .click()
      await expect(
        page.getByRole('button', { name: 'Play explanation' }),
      ).toBeVisible()
      const transcriptTexts: string[] = []
      for (const name of [
        'Requirement',
        'Plain meaning',
        'Example',
        'Takeaway',
      ]) {
        await page.getByRole('button', { name: new RegExp(name) }).click()
        await expect(
          page.getByRole('button', { name: new RegExp(name) }),
        ).toHaveAttribute('aria-current', 'step')
        await expect(page.locator('.visual-caption')).toContainText(name)
        transcriptTexts.push(
          (await page
            .locator(
              '.visual-caption blockquote, .visual-caption > p:not(.small-label):not(.visual-source-note)',
            )
            .textContent())!,
          (await page
            .locator('.visual-teaching-board figcaption p')
            .textContent())!,
        )
      }
      await page.evaluate(() => document.fonts.ready)
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true)
      const accessibility = await new AxeBuilder({ page })
        .include('.visual-lesson')
        .analyze()
      expect(accessibility.violations).toEqual([])
      if (process.env.CAPTURE_PHASE3 && [390, 1440].includes(width)) {
        await page.locator('.visual-stage').scrollIntoViewIfNeeded()
        await page.mouse.move(0, 0)
        await page.screenshot({
          path: `docs/screenshots/phase3/animation-${explanation.scene}-${width}.png`,
        })
      }
      await page.getByText('Read the full transcript', { exact: true }).click()
      const transcript = page.locator('.visual-transcript')
      for (const text of transcriptTexts) {
        await expect(transcript).toContainText(text)
      }
      expect(errors).toEqual([])
    })
  }

  test(`${explanation.scene}: real 40-second playback, pause and replay`, async ({
    page,
  }) => {
    test.setTimeout(65_000)
    await page.goto(address(explanation.lesson.controlKey))
    await page.getByText('Watch the idea · 40 seconds', { exact: true }).click()
    const progress = page.getByRole('progressbar', {
      name: 'Visual explanation progress',
    })
    await expect(progress).toHaveAttribute('value', '0')
    await page.getByRole('button', { name: 'Play explanation' }).click()
    await expect.poll(() => progress.getAttribute('value')).not.toBe('0')
    await page.getByRole('button', { name: 'Pause', exact: true }).click()
    const stopped = await progress.getAttribute('value')
    await page.waitForTimeout(600)
    await expect(progress).toHaveAttribute('value', stopped!)
    await page.getByRole('button', { name: 'Restart', exact: true }).click()
    await expect(progress).toHaveAttribute('value', '0')
    await page.getByRole('button', { name: 'Play explanation' }).click()
    for (const name of ['Plain meaning', 'Example', 'Takeaway']) {
      await expect(
        page.getByRole('button', { name: new RegExp(name) }),
      ).toHaveAttribute('aria-current', 'step', { timeout: 15_000 })
    }
    await expect(progress).toHaveAttribute('value', '40', { timeout: 15_000 })
    await expect(
      page.getByRole('status', { name: 'Visual explanation status' }),
    ).toContainText('Walkthrough complete')
    await page.getByRole('button', { name: 'Replay explanation' }).click()
    await expect(
      page.getByRole('button', { name: 'Pause', exact: true }),
    ).toBeVisible()
    await page.getByText('Watch the idea · 40 seconds', { exact: true }).click()
    await expect(progress).toHaveCount(0)
    await page.getByText('Watch the idea · 40 seconds', { exact: true }).click()
    await expect(progress).toHaveAttribute('value', '0')
  })
}

test('reduced motion and forced colors retain complete keyboard-operated stages', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' })
  await page.setViewportSize({ width: 320, height: 1000 })
  await page.goto(address('ia-l2-3-5-3'))
  const disclosure = page.getByText('Watch the idea · 40 seconds', {
    exact: true,
  })
  await disclosure.focus()
  await page.keyboard.press('Enter')
  await expect(
    page.getByRole('button', { name: 'Play explanation' }),
  ).toBeDisabled()
  const example = page.getByRole('button', { name: /Example/ })
  await example.focus()
  await page.keyboard.press('Enter')
  await expect(example).toBeFocused()
  await expect(example).toHaveAttribute('aria-current', 'step')
  for (const path of await page.locator('.visual-path-traced').all()) {
    await expect(path).toHaveAttribute('stroke-dashoffset', '0')
  }
  await expect(page.locator('.visual-caption')).toContainText(
    'non-privileged network access',
  )
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
})

test('player loads only on request and recovers a failed chunk without hiding the lesson', async ({
  page,
}) => {
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))
  await page.goto(address('ac-l1-b-1-i'))
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  expect(
    requests.some((url) => /assets\/VisualExplanation-.*\.js/.test(url)),
  ).toBe(false)
  await page.route('**/assets/VisualExplanation-*.js', (route) => route.abort())
  await page.getByText('Watch the idea · 40 seconds', { exact: true }).click()
  await expect(
    page.getByRole('status').filter({ hasText: 'could not load' }),
  ).toContainText('source, perspectives and practice are still available')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.unroute('**/assets/VisualExplanation-*.js')
  await page.getByRole('button', { name: 'Reload this lesson' }).click()
  await page.getByText('Watch the idea · 40 seconds', { exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Play explanation' }),
  ).toBeVisible()
})
