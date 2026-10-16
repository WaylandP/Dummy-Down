import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('on a desktop the first situation runs beside the list, an answer shows its feedback, and the question lives in the address', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/practice')
  const list = page.getByRole('region', { name: 'Work through a situation.' })
  const run = page.getByRole('article')
  await expect(list.getByRole('heading', { level: 1 })).toHaveText(
    'Work through a situation.',
  )
  await expect(run.getByRole('heading', { level: 2 })).toHaveText(
    'Who and what can connect?',
  )
  await expect(run).toContainText('Question 1 of 3')
  await expect(
    list.getByRole('link', { name: /^Who and what can connect\?/ }),
  ).toHaveAttribute('aria-current', 'page')
  await page.evaluate(() => document.fonts.ready)
  // The list and the situation scroll on their own; the page stays put.
  const scroll = await page.evaluate(() => {
    const main = document.getElementById('main')!
    const rows = document.querySelector('.practice-list')!
    return {
      main: main.scrollHeight - main.clientHeight,
      rows: rows.scrollHeight - rows.clientHeight,
    }
  })
  expect(scroll.main).toBeLessThanOrEqual(0)
  expect(scroll.rows).toBeGreaterThan(0)
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  // An answer, from the keyboard: its feedback under it, then where next.
  const choices = run.locator('.practice-run-choice')
  await expect(choices).toHaveCount(3)
  await choices.nth(1).focus()
  await page.keyboard.press('Enter')
  const feedback = run.getByRole('status')
  await expect(feedback).toBeVisible()
  await expect(feedback).toBeFocused()
  await expect(choices.nth(1)).toHaveAttribute('aria-pressed', 'true')
  await expect(choices.nth(0)).toBeDisabled()
  await expect(
    run.getByRole('heading', { name: 'A common mix-up' }),
  ).toBeVisible()
  await expect(
    run.getByRole('link', { name: 'Read the requirement' }),
  ).toHaveAttribute('href', /control=ac-l1-b-1-i/)
  await expect(
    run.getByRole('link', { name: 'Watch the 40-second chalk talk' }),
  ).toHaveAttribute('href', /tab=practice/)
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await run.getByRole('button', { name: 'Next question' }).click()
  await expect(page).toHaveURL(
    /\/practice\?activity=level-one-authorized-access&q=2$/,
  )
  await expect(run).toContainText('Question 2 of 3')
  await expect(run.locator('.practice-run-prompt')).toBeFocused()
  // Back looks at the answered question; forward returns.
  await page.goBack()
  await expect(run).toContainText('Question 1 of 3')
  await expect(choices.nth(1)).toHaveAttribute('aria-pressed', 'true')
  await page.goForward()
  await expect(run).toContainText('Question 2 of 3')
  // A level narrows the list in the address; the search narrows it in place.
  await list
    .getByRole('group', { name: 'Level' })
    .getByRole('link', { name: '3', exact: true })
    .click()
  await expect(page).toHaveURL(/level=Level\+3/)
  await expect(
    list.getByRole('status', { name: 'Situation results' }),
  ).toHaveText('3 of 13 situations')
  await list.getByRole('searchbox', { name: 'Find a situation' }).fill('deploy')
  await expect(
    list.getByRole('status', { name: 'Situation results' }),
  ).toHaveText('1 of 13 situations')
  await list
    .getByRole('link', { name: /^Ready to deploy a response team/ })
    .click()
  await expect(page).toHaveURL(/activity=level-three-response-team-deployment/)
  await expect(run.getByRole('heading', { level: 2 })).toBeFocused()
  await expect(run).toContainText('IR.L3-3.6.2e')
})

test('after any answer the feedback keeps focus and Next question stays inside the run at 1280×800, at once under reduced motion', async ({
  browser,
}) => {
  // The tallest question: every one of its answers used to push the button
  // up to 65px below the run.
  const address = '/practice?activity=level-one-authorized-access'
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      reducedMotion,
    })
    const probe = await context.newPage()
    await probe.goto(address)
    await probe.locator('.practice-run-choice').first().waitFor()
    const count = await probe.locator('.practice-run-choice').count()
    expect(count).toBeGreaterThan(1)
    await probe.close()
    for (let index = 0; index < count; index += 1) {
      // A fresh tab per answer: the question is answered once.
      const page = await context.newPage()
      await page.goto(address)
      const run = page.getByRole('article')
      await expect(run.locator('.practice-run-choice').first()).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      await run.locator('.practice-run-choice').nth(index).click()
      const next = run.getByRole('button', { name: /Next question/ })
      await expect(next).toBeVisible()
      await expect(run.getByRole('status')).toBeFocused()
      const inside = async () => {
        const box = (await run.boundingBox())!
        const button = (await next.boundingBox())!
        return button.y + button.height <= box.y + box.height
      }
      // Smoothly by default; under reduced motion the scroll is instant.
      await expect
        .poll(inside, { timeout: reducedMotion === 'reduce' ? 250 : 3000 })
        .toBe(true)
      // The feedback is still in view above it.
      const feedback = (await run.getByRole('status').boundingBox())!
      expect(feedback.y).toBeGreaterThanOrEqual(
        (await run.boundingBox())!.y - 1,
      )
      await page.close()
    }
    await context.close()
  }
})

test('finishing a situation moves focus to the completion line', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/practice?activity=level-one-authorized-access')
  const run = page.getByRole('article')
  for (let index = 0; index < 3; index += 1) {
    await run.locator('.practice-run-choice').first().click()
    await run
      .getByRole('button', {
        name: index === 2 ? 'Finish practice' : 'Next question',
      })
      .click()
  }
  const done = run.getByText('Practice complete. Keep asking why.')
  await expect(done).toBeFocused()
  await expect(
    run.getByRole('button', { name: 'Practice again' }),
  ).toBeVisible()
})

test('the situation is in view while answering: beside the question at 1280, under it at 1024, an open disclosure on a phone', async ({
  page,
}) => {
  const address = '/practice?activity=level-one-visitors-and-keys'
  await page.setViewportSize({ width: 1280, height: 800 })
  const run = page.getByRole('article')
  const panel = run.getByRole('complementary', { name: 'The situation' })
  // The run fits the frame with nothing to scroll, for a three-step situation
  // and for the longest (four steps, the most words).
  for (const [where, steps] of [
    [address, 3],
    ['/practice?activity=level-one-media-disposal', 4],
  ] as const) {
    await page.goto(where)
    await expect(run.locator('.practice-run-intro')).toBeVisible()
    await expect(panel.getByRole('listitem')).toHaveCount(steps)
    await page.evaluate(() => document.fonts.ready)
    const prompt = (await run.locator('.practice-run-prompt').boundingBox())!
    const beside = (await panel.boundingBox())!
    expect(beside.x).toBeGreaterThan(prompt.x + prompt.width - 1)
    expect(beside.y).toBeLessThan(prompt.y + prompt.height)
    expect(
      await run.evaluate((node) => node.scrollHeight - node.clientHeight),
    ).toBeLessThanOrEqual(0)
  }
  await page.goto(address)
  await expect(
    run.getByText('A returning supplier and a returned key'),
  ).toBeVisible()
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])

  await page.setViewportSize({ width: 1024, height: 768 })
  await page.goto(address)
  await expect(panel.getByRole('listitem')).toHaveCount(3)
  await page.evaluate(() => document.fonts.ready)
  const choices = (await run.locator('.practice-run-choices').boundingBox())!
  const under = (await panel.boundingBox())!
  expect(under.y).toBeGreaterThanOrEqual(choices.y + choices.height - 1)
  expect(under.x).toBeLessThan(choices.x + 1)

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(address)
  const details = run.locator('details.practice-scene')
  await expect(details).toHaveAttribute('open', '')
  const summary = details.locator('summary')
  const summaryBox = (await summary.boundingBox())!
  expect(summaryBox.height).toBeGreaterThanOrEqual(44)
  await expect(details.getByRole('listitem')).toHaveCount(3)
  const steps = (await details.getByRole('list').boundingBox())!
  const question = (await run.locator('.practice-run-prompt').boundingBox())!
  expect(steps.y + steps.height).toBeLessThanOrEqual(question.y + 1)
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await summary.click()
  await expect(details).not.toHaveAttribute('open', '')
  await expect(details.getByRole('list')).toBeHidden()
})

test('on a phone an answered situation keeps its heading order and passes the scan', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/practice?activity=level-one-authorized-access')
  const run = page.getByRole('article')
  await expect(run.getByRole('heading', { level: 1 })).toHaveText(
    'Who and what can connect?',
  )
  await run.locator('.practice-run-choice').nth(1).click()
  await expect(run.getByRole('status')).toBeFocused()
  await expect(
    run.getByRole('heading', { level: 2, name: 'A common mix-up' }),
  ).toBeVisible()
  // The struck claim is struck on every line it wraps to.
  const claim = run.locator('.practice-run-claim s')
  expect(
    await claim.evaluate((node) => getComputedStyle(node).textDecorationLine),
  ).toBe('line-through')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  )
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
})

test.describe('forced colors', () => {
  test.use({ forcedColors: 'active', reducedMotion: 'reduce' })
  test('the practice page keeps its marks under forced colors', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/practice')
    const run = page.getByRole('article')
    await run.locator('.practice-run-choice').nth(1).click()
    await expect(run.getByRole('status')).toBeFocused()
    const claim = run.locator('.practice-run-claim s')
    expect(
      await claim.evaluate((node) => getComputedStyle(node).textDecorationLine),
    ).toBe('line-through')
    const scan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'])
      // axe reports authored chalk colors against the forced canvas, as the
      // accessibility spec notes; Chromium paints system colors.
      .disableRules(['color-contrast'])
      .analyze()
    expect(scan.violations).toEqual([])
  })
})

test('on a phone the situations come first, and one opens full width with a way back', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/practice')
  const list = page.getByRole('region', { name: 'Work through a situation.' })
  await expect(list).toBeVisible()
  await expect(page.getByRole('article')).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  )
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await list.getByRole('link', { name: /^What belongs in public\?/ }).click()
  await expect(page).toHaveURL(/activity=level-one-public-information$/)
  const run = page.getByRole('article')
  await expect(run.getByRole('heading', { level: 1 })).toHaveText(
    'What belongs in public?',
  )
  await expect(run.getByRole('heading', { level: 1 })).toBeFocused()
  await expect(list).toHaveCount(0)
  const box = (await run.boundingBox())!
  expect(box.width).toBeGreaterThan(300)
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  await run.getByRole('link', { name: '← All situations' }).click()
  await expect(page).toHaveURL(/\/practice$/)
  await expect(list).toBeVisible()
  await expect(list).toBeFocused()
})
