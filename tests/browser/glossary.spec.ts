import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('every word is on the page by default under its letter, the words scroll on their own, and a letter still filters', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/glossary')
  const all = page.getByRole('button', { name: 'All' })
  await expect(all).toHaveAttribute('aria-pressed', 'true')
  const words = page.getByRole('region', { name: 'All words' })
  await expect(words).toBeVisible()
  const count = page.getByRole('status', { name: 'Glossary search results' })
  const every = (await count.textContent())!
  expect(every).toMatch(/^\d+ words$/)
  // Every word, under letter headings, in two columns.
  expect(await words.locator('.word').count()).toBe(Number(every.split(' ')[0]))
  const letters = await words.locator('.glossary-letter').allTextContents()
  expect(letters.length).toBeGreaterThan(5)
  expect([...letters].sort()).toEqual(letters)
  const [first, second] = await words
    .locator('.word')
    .evaluateAll((nodes) =>
      nodes.slice(0, 2).map((node) => node.getBoundingClientRect()),
    )
  expect(Math.round(first!.top)).toBe(Math.round(second!.top))
  // The words scroll in their own column; the page around them stays put.
  const scroll = await page.evaluate(() => {
    const main = document.getElementById('main')!
    const column = document.querySelector('.glossary-words')!
    return {
      main: main.scrollHeight - main.clientHeight,
      column: column.scrollHeight - column.clientHeight,
    }
  })
  expect(scroll.main).toBeLessThanOrEqual(0)
  expect(scroll.column).toBeGreaterThan(0)
  // "All" and the letters are 44px targets, and All is keyboard reachable.
  const box = (await all.boundingBox())!
  expect(box.height).toBeGreaterThanOrEqual(44)
  expect(box.width).toBeGreaterThanOrEqual(44)
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  // A letter filters as before, in the address; All brings everything back.
  await page
    .getByRole('navigation', { name: 'Jump to a letter' })
    .getByRole('link', { name: 'M', exact: true })
    .click()
  await expect(page).toHaveURL(/\/glossary\?letter=M$/)
  await expect(all).toHaveAttribute('aria-pressed', 'false')
  await expect(
    page.getByRole('region', { name: 'Words under M' }),
  ).toBeFocused()
  expect(await page.locator('.glossary-letter').count()).toBe(0)
  await all.focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/glossary$/)
  await expect(all).toHaveAttribute('aria-pressed', 'true')
  await expect(words).toBeFocused()
  await page.goBack()
  await expect(page).toHaveURL(/letter=M$/)
  await expect(
    page.getByRole('region', { name: 'Words under M' }),
  ).toBeVisible()
})

test('on a phone every word is one column under its letters, and the page scrolls', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/glossary')
  await expect(page.getByRole('button', { name: 'All' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  const words = page.locator('.glossary-words .word')
  const [first, second] = await words.evaluateAll((nodes) =>
    nodes.slice(0, 2).map((node) => node.getBoundingClientRect()),
  )
  expect(second!.top).toBeGreaterThan(first!.bottom - 1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  )
  expect(
    await page.evaluate(
      () => document.documentElement.scrollHeight > window.innerHeight,
    ),
  ).toBe(true)
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
})
