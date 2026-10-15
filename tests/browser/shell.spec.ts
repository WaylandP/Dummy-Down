import { expect, test, type Page } from '@playwright/test'

const control =
  '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l1-b-1-i&mode=beginner'
const places = ['Home', 'Controls', 'Glossary', 'Practice', 'Timeline', 'About']
const routes = [
  '/',
  '/learn?view=discover&collection=references',
  control,
  `${control.replace('ac-l1-b-1-i', 'ac-l2-3-1-1')}&tab=evidence`,
  '/glossary',
  '/practice',
  '/timeline',
  '/about',
  '/coverage',
]

async function box(page: Page, selector: string) {
  const found = await page.locator(selector).first().boundingBox()
  if (!found) throw new Error(`${selector} has no box`)
  return found
}

/**
 * Text and controls of the content that are actually under Smudge's wood and
 * felt (his box minus the empty corners), sampled with elementsFromPoint so
 * that what an overflow clips does not count. A point off screen hits no
 * element at all, so the count of those says whether the check saw him.
 */
function underSmudge(page: Page) {
  return page.evaluate(() => {
    const body = document.querySelector('.smudge-body')
    const main = document.getElementById('main')
    if (!body || !main) throw new Error('No Smudge or no main')
    const him = body.getBoundingClientRect()
    // The wood and felt span viewBox x 12–158 and y 24–96 of 170×110.
    const left = him.left + (him.width * 12) / 170
    const right = him.left + (him.width * 158) / 170
    const top = him.top + (him.height * 24) / 110
    const bottom = him.top + (him.height * 96) / 110
    const hits = new Set<string>()
    let offScreen = 0
    for (let i = 0; i <= 8; i++)
      for (let j = 0; j <= 5; j++) {
        const x = left + ((right - left) * i) / 8
        const y = top + ((bottom - top) * j) / 5
        const stack = document.elementsFromPoint(x, y)
        if (stack.length === 0) offScreen += 1
        for (const node of stack) {
          if (!main.contains(node) || node === main) continue
          const hasText = [...node.childNodes].some(
            (child) =>
              child.nodeType === Node.TEXT_NODE && child.textContent?.trim(),
          )
          const interactive = node.matches(
            'a, button, input, select, summary, [tabindex]',
          )
          if (hasText || interactive)
            hits.add(
              `${node.tagName.toLowerCase()} ${node.textContent?.trim().slice(0, 40)}`,
            )
        }
      }
    return { hits: [...hits], offScreen }
  })
}

/** Every scroll position the content can take: its top, its middle and its end. */
async function scrollContent(page: Page, where: 'top' | 'middle' | 'end') {
  await page.evaluate((where) => {
    const main = document.getElementById('main')!
    const share = where === 'top' ? 0 : where === 'middle' ? 0.5 : 1
    // Instant: the page scrolls smoothly, and a sample mid-way sees nothing.
    main.scrollTo({
      top: (main.scrollHeight - main.clientHeight) * share,
      behavior: 'instant',
    })
    const root = document.documentElement
    window.scrollTo({
      top: (root.scrollHeight - window.innerHeight) * share,
      behavior: 'instant',
    })
  }, where)
}

test('the header, the footer line and the tray stay put at desktop sizes while the content scrolls', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/about')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  const nav = page.getByRole('navigation', { name: 'Main' })
  await expect(nav.getByRole('link')).toHaveText(places)
  const header = await box(page, '.site-header')
  const footer = await box(page, '.site-footer')
  const tray = await box(page, '.chalk-tray')
  expect(tray.y + tray.height).toBeCloseTo(800, 0)
  expect(footer.y + footer.height).toBeLessThanOrEqual(tray.y + 1)
  // The page itself never scrolls; the content does.
  const scrolled = await page.evaluate(() => {
    const main = document.getElementById('main')!
    main.scrollTop = 400
    return {
      main: main.scrollTop,
      document: document.scrollingElement?.scrollTop ?? 0,
    }
  })
  expect(scrolled.main).toBeGreaterThan(0)
  expect(scrolled.document).toBe(0)
  expect(await box(page, '.site-header')).toEqual(header)
  expect(await box(page, '.site-footer')).toEqual(footer)
  expect(await box(page, '.chalk-tray')).toEqual(tray)
  // A focused element is scrolled into the content's own view, never under a band.
  const last = page.locator('#main a').last()
  await last.focus()
  const target = (await last.boundingBox())!
  expect(target.y).toBeGreaterThanOrEqual(header.y + header.height)
  expect(target.y + target.height).toBeLessThanOrEqual(footer.y)
})

test('the scrolling keys reach the content from a fresh load and from the header', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/about')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const top = () =>
    page.evaluate(() => document.getElementById('main')!.scrollTop)
  expect(await top()).toBe(0)
  await page.keyboard.press('PageDown')
  await expect.poll(top).toBeGreaterThan(0)
  await page.keyboard.press('Home')
  await expect.poll(top).toBe(0)
  // From a link in the header the space bar pages the content...
  await page
    .getByRole('navigation', { name: 'Main' })
    .getByRole('link', { name: 'About' })
    .focus()
  await page.keyboard.press('Space')
  await expect.poll(top).toBeGreaterThan(0)
  // ...and on the footer's switch it is the switch's own key. (The content is
  // put at a known place first, instantly, so no smooth scroll is in flight.)
  await page.evaluate(() =>
    document
      .getElementById('main')!
      .scrollTo({ top: 300, behavior: 'instant' }),
  )
  const before = await top()
  expect(before).toBe(300)
  const smudge = page.getByRole('switch', { name: 'Smudge' })
  await smudge.focus()
  await page.keyboard.press('Space')
  await expect(smudge).toHaveAttribute('aria-checked', 'false')
  expect(await top()).toBe(before)
  await page.keyboard.press('Space')
  await expect(smudge).toHaveAttribute('aria-checked', 'true')
})

test('a long control page scrolls inside the frame, its tabs and foot clear of the content', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto(`${control}&tab=practice`)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  // The content's own scroller when the page has one (the Controls column).
  const main = await page.evaluate(() => {
    const node =
      document.querySelector<HTMLElement>('#main [data-scroller]') ??
      document.getElementById('main')!
    return { client: node.clientHeight, scroll: node.scrollHeight }
  })
  expect(main.scroll).toBeGreaterThan(main.client)
  const tabs = await box(page, '.control-tabs')
  const panel = await box(page, '.control-panel:not([hidden])')
  const foot = await box(page, '.control-foot')
  expect(tabs.y + tabs.height).toBeLessThanOrEqual(panel.y + 1)
  expect(panel.y + panel.height).toBeLessThanOrEqual(foot.y + 1)
  // A click on a view lands on the view.
  await page
    .getByRole('navigation', { name: 'Views of this control' })
    .getByRole('link', { name: 'Explain', exact: true })
    .click()
  await expect(page).toHaveURL(/tab=explain/)
})

test('below desktop sizes the tray ends the page and the footer line sits just above it', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1000, height: 800 })
  await page.goto('/about')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  const tray = page.locator('.chalk-tray')
  await tray.scrollIntoViewIfNeeded()
  const bar = (await tray.boundingBox())!
  const pageEnd = await page.evaluate(
    () => document.documentElement.scrollHeight - window.scrollY,
  )
  expect(bar.y + bar.height).toBeCloseTo(pageEnd, 0)
  const footer = (await page.locator('.site-footer').boundingBox())!
  expect(footer.y + footer.height).toBeLessThanOrEqual(bar.y + 1)
  expect(
    await page.evaluate(() => document.scrollingElement?.scrollTop),
  ).toBeGreaterThan(0)
})

for (const [width, height] of [
  [1280, 800],
  [1024, 640],
  [900, 700],
] as const) {
  test(`nothing sits under Smudge at ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height })
    for (const route of routes) {
      await page.goto(route)
      await expect(page.locator('.smudge')).toHaveCount(1)
      await page.evaluate(() => document.fonts.ready)
      for (const where of ['top', 'middle', 'end'] as const) {
        await scrollContent(page, where)
        const { hits, offScreen } = await underSmudge(page)
        expect(hits, `${route} at the ${where}`).toEqual([])
        // At the end of the page he is on screen, so the check has seen him;
        // in the desktop frame he always is.
        if (where === 'end' || width >= 1024)
          expect(
            offScreen,
            `${route} at the ${where}: samples off screen`,
          ).toBe(0)
      }
    }
  })
}

test('Controls is lit for every learn address, and the tray has three chalks and no stub', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  for (const route of [
    '/learn',
    '/learn?view=discover&collection=references',
    control,
  ]) {
    await page.goto(route)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const nav = page.getByRole('navigation', { name: 'Main' })
    await expect(nav.getByRole('link', { name: 'Controls' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(nav.getByRole('link', { name: 'Learn' })).toHaveCount(0)
  }
  await expect(page.locator('.chalk-tray .tray-stick')).toHaveCount(3)
  await expect(page.locator('.chalk-tray .tray-stub')).toHaveCount(0)
  await expect(page.getByRole('contentinfo')).toContainText(
    'Independent and educational. Not legal advice; not affiliated with DoD or NIST. Disclaimer & terms',
  )
})
