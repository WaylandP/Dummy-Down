import { expect, test } from '@playwright/test'

const reader =
  '/learn?view=lesson&framework=cmmc&edition=cmmc-2-13-sep-2024&control=ac-l1-b-1-i&mode=beginner'

test('pagination moves focus to the new results in both directions', async ({
  page,
}) => {
  await page.goto('/learn?view=discover&collection=references')
  const first = page.locator('.control-item').first()
  const original = await first.locator('.control-code').innerText()
  const next = page.getByRole('button', { name: 'Next results' })
  await next.focus()
  await page.keyboard.press('Enter')
  await expect(first).not.toContainText(original)
  await expect(first).toBeFocused()
  await expect(
    page.getByRole('status', { name: 'Control result page' }),
  ).toContainText('Page 2 of 19')
  await page.getByRole('button', { name: 'Previous results' }).focus()
  await page.keyboard.press('Enter')
  await expect(first).toContainText(original)
  await expect(first).toBeFocused()
})

test('checking an answer leaves focus on readable feedback', async ({
  page,
}) => {
  await page.goto(reader)
  await page
    .getByRole('navigation', { name: 'Views of this control' })
    .getByRole('link', { name: 'Practice', exact: true })
    .click()
  await page.getByText('Check your understanding', { exact: true }).click()
  await page.getByRole('radio').first().focus()
  await page.keyboard.press('Space')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Check answer' })).toBeFocused()
  await page.keyboard.press('Enter')
  const feedback = page.getByRole('status', { name: 'Answer feedback' })
  await expect(feedback).toBeFocused()
  await expect(feedback).toContainText('Your answer:')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Try again' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('.practice-prompt')).toBeFocused()
})

test('delayed clipboard failure keeps focus and selects the fallback link', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: () =>
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('Clipboard denied by test')),
              150,
            ),
          ),
      },
    })
  })
  await page.goto(reader)
  await page.getByRole('button', { name: 'Copy reference link' }).focus()
  await page.keyboard.press('Enter')
  const fallback = page.getByRole('textbox', { name: 'Reference link' })
  await expect(fallback).toBeFocused()
  expect(
    await fallback.evaluate(
      (node: HTMLTextAreaElement) => node.selectionEnd - node.selectionStart,
    ),
  ).toBeGreaterThan(0)
})

test('on a phone the All controls sheet opens on its find line and closes back to its line', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(reader)
  const open = page.getByRole('button', { name: 'All controls' })
  await open.focus()
  await page.keyboard.press('Enter')
  const search = page.getByRole('searchbox', { name: 'Find controls' })
  await expect(search).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(
    page
      .getByRole('dialog', { name: 'All controls' })
      .getByRole('group', { name: 'Level' })
      .getByRole('link', { name: 'All' }),
  ).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'All controls' })).toBeHidden()
  await expect(open).toBeFocused()
})
