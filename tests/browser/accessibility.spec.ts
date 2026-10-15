import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { chalkFor } from '../../src/components/board/chalks'

const newTo = chalkFor('beginner').prompt
const runs = chalkFor('it-cyber').prompt
const preparing = chalkFor('compliance').prompt

const reader =
  '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l1-b-1-i&mode=beginner'
const routes = [
  ['Home', '/'],
  ['Control Explorer', '/learn?view=discover&collection=references'],
  ['Glossary', '/glossary'],
  ['Practice', '/practice'],
  ['About', '/about'],
  ['Disclaimer', '/disclaimer'],
  ['Assessment objectives', '/coverage?control=SC.L3-3.13.4e'],
  ['AC.L1-b.1.i', reader],
  ['AC.L1-b.1.i Explain', `${reader}&tab=explain`, /AC\.L1-b\.1\.i/],
  ['AC.L1-b.1.i Evidence', `${reader}&tab=evidence`, /AC\.L1-b\.1\.i/],
  ['AC.L1-b.1.i Practice', `${reader}&tab=practice`, /AC\.L1-b\.1\.i/],
  ['AC.L1-b.1.i Related', `${reader}&tab=related`, /AC\.L1-b\.1\.i/],
  [
    'AC.L2-3.1.1 Rev 3',
    `${reader.replace('ac-l1-b-1-i', 'ac-l2-3-1-1')}&tab=rev3`,
    /AC\.L2-3\.1\.1/,
  ],
] as const

// Real layout and semantics are not exercised by the existing jsdom suite.
// Automated scans do not prove screen-reader usability or WCAG conformance.
for (const width of [1440, 1024, 768, 640, 390, 320]) {
  for (const [name, path, title] of routes) {
    test(`${name}: accessible structure and reflow at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 })
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      await page.goto(path)
      if (path.startsWith('/coverage'))
        await expect(
          page.getByRole('heading', { name: '4 statements · 1 control' }),
        ).toBeVisible()
      if (path === '/practice')
        await expect(
          page.getByRole('heading', { name: 'Work through a situation.' }),
        ).toBeVisible()
      if (path.startsWith(reader))
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(
          'Authorized Access Control [FCI Data]',
        )
      if (path.endsWith('tab=explain'))
        await expect(page.getByRole('tab', { name: newTo })).toBeVisible()
      if (path.endsWith('tab=evidence'))
        await expect(page.getByRole('heading', { name: 'Ask' })).toBeVisible()
      if (path.endsWith('tab=practice'))
        await expect(
          page.getByText('Watch the idea · 40 seconds', { exact: true }),
        ).toBeVisible()
      if (path.endsWith('tab=rev3'))
        await expect(
          page.getByRole('region', { name: /^Rev 3 03\.01\.01/ }),
        ).toBeVisible()
      if (path.endsWith('tab=related'))
        await expect(
          page.getByRole('heading', {
            name: 'The same practice at another level',
          }),
        ).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      await expect(page).toHaveTitle(title ?? new RegExp(name))
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width)
      const scan = await new AxeBuilder({ page })
        .withTags([
          'wcag2a',
          'wcag2aa',
          'wcag21aa',
          'wcag22aa',
          'best-practice',
        ])
        .analyze()
      expect(scan.violations).toEqual([])
      expect(errors).toEqual([])
      if (
        process.env.CAPTURE_PHASE3 &&
        path === '/practice' &&
        [390, 1440].includes(width)
      ) {
        await page.screenshot({
          path: `docs/screenshots/phase3/index-${width}.png`,
        })
      }
    })
  }
}

test.describe('system accessibility preferences', () => {
  test.use({
    forcedColors: 'active',
    reducedMotion: 'reduce',
    viewport: { width: 320, height: 900 },
  })
  test('forced colors and reduced motion retain visible keyboard selection and feedback', async ({
    page,
  }) => {
    // Opening the view by address keeps the next focus keyboard-visible; a
    // pointer click first would make Chromium treat the scripted focus as a click.
    await page.goto(`${reader}&tab=explain`)
    const beginner = page.getByRole('tab', { name: newTo, exact: true })
    await beginner.focus()
    expect(
      await beginner.evaluate((node) => getComputedStyle(node).outlineStyle),
    ).toBe('solid')
    await page.keyboard.press('ArrowRight')
    await expect(page.getByRole('tab', { name: runs })).toBeFocused()
    await expect(page.getByRole('tabpanel', { name: runs })).toBeVisible()
    await page.keyboard.press('End')
    await expect(
      page.getByRole('tab', { name: preparing, exact: true }),
    ).toHaveAttribute('aria-selected', 'true')
    await page.keyboard.press('Home')
    await expect(beginner).toBeFocused()
    expect(
      await page.evaluate(
        () => getComputedStyle(document.documentElement).scrollBehavior,
      ),
    ).toBe('auto')
    await page
      .getByRole('navigation', { name: 'Views of this control' })
      .getByRole('link', { name: 'Practice', exact: true })
      .click()
    await page.getByText('Check your understanding', { exact: true }).click()
    await page.getByRole('radio').first().check()
    await page.getByRole('button', { name: 'Check answer' }).click()
    await expect(
      page.getByRole('status', { name: 'Answer feedback' }),
    ).toContainText('Your answer:')
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(320)
    const scan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'])
      // axe 4.13 reports authored chalk colors against the forced white canvas,
      // although Chromium paints system colors (confirmed by computed styles
      // and screenshot). Normal-color scans below retain this rule unchanged.
      .disableRules(['color-contrast'])
      .analyze()
    expect(scan.violations).toEqual([])
    const painted = await page.evaluate(() => ({
      canvas: getComputedStyle(document.body).backgroundColor,
      text: getComputedStyle(document.body).color,
      feedback: getComputedStyle(document.querySelector('.practice-feedback')!)
        .color,
    }))
    expect(painted).toEqual({
      canvas: 'rgb(255, 255, 255)',
      text: 'rgb(0, 0, 0)',
      feedback: 'rgb(0, 0, 0)',
    })
  })
})

test('expanded quiz feedback meets normal-color accessibility rules', async ({
  page,
}) => {
  await page.goto(reader)
  await page
    .getByRole('navigation', { name: 'Views of this control' })
    .getByRole('link', { name: 'Practice', exact: true })
    .click()
  await page.getByText('Check your understanding', { exact: true }).click()
  await page.getByRole('radio').first().check()
  await page.getByRole('button', { name: 'Check answer' }).click()
  const scan = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .analyze()
  expect(scan.violations).toEqual([])
})

test('page titles follow native navigation and history without including search text', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('searchbox', { name: 'Find a control' }).fill('access')
  await page.getByRole('searchbox', { name: 'Find a control' }).press('Enter')
  await expect(page).toHaveTitle('Control Explorer | Cipher & Chalk')
  await page.locator('.control-item').first().click()
  await expect(page).toHaveTitle(/AC\.L1-b\.1\.i/)
  await page.goBack()
  await expect(page).toHaveTitle('Control Explorer | Cipher & Chalk')
  await page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: 'Glossary' })
    .click()
  await expect(page).toHaveTitle('Glossary | Cipher & Chalk')
})

for (const legacy of ['glossary', 'explorer', 'about', 'approach']) {
  test(`legacy #${legacy} skip link places keyboard focus in the new main content`, async ({
    page,
  }) => {
    await page.goto(`/#${legacy}`)
    await page.keyboard.press('Tab')
    await expect(
      page.getByRole('link', { name: 'Skip to content' }),
    ).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/(learn|glossary|about)#main$/)
    await expect(page.getByRole('main')).toBeFocused()
    await page.keyboard.press('Tab')
    expect(
      await page.evaluate(() => !!document.activeElement?.closest('main')),
    ).toBe(true)
  })
}
