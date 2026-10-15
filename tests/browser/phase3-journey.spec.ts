import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { chalks } from '../../src/components/board/chalks'

async function capture(page: Page, name: string, width: number) {
  if (!process.env.CAPTURE_PHASE3) return
  await page.evaluate(() => document.fonts.ready)
  await page.mouse.move(0, 0)
  await page.screenshot({
    path: `docs/screenshots/phase3/journey-${name}-${width}.png`,
  })
}

for (const width of [390, 1440]) {
  test(`complete source-to-practice learner journey at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    let sourceText = ''

    await test.step('1. Start on the homepage', async () => {
      await page.goto('/')
      await expect(
        page.getByRole('heading', {
          name: 'What are you trying to understand?',
        }),
      ).toBeVisible()
      await capture(page, 'home', width)
    })

    await test.step('2. Search for and open the exact source control', async () => {
      await page
        .getByRole('searchbox', { name: 'Find a control' })
        .fill('AC.L1-b.1.i')
      await page.getByRole('button', { name: 'Find', exact: true }).click()
      await page
        .getByRole('button', { name: /AC\.L1-b\.1\.i.*Authorized Access/ })
        .click()
      await expect(page).toHaveURL(/control=ac-l1-b-1-i(?:&|#|$)/)
      await expect(page).toHaveURL(/edition=cmmc-2-13-sep-2024(?:&|#|$)/)
    })

    await test.step('3. Read the attributed requirement and publication context', async () => {
      const source = page.locator('.reference-requirement')
      await expect(source).toBeVisible()
      await expect(source).toContainText('authorized users')
      await expect(source).toContainText('processes acting on behalf')
      sourceText = (await source.textContent())!
      await page.getByRole('link', { name: 'Related', exact: true }).click()
      await page
        .getByText('Sources & publication context', { exact: true })
        .click()
      const context = page.locator('details').filter({
        has: page.getByText('Sources & publication context', { exact: true }),
      })
      await expect(context).toContainText('September 2024')
      await expect(context.getByRole('link').first()).toHaveAttribute(
        'href',
        /^https:\/\//,
      )
      await page
        .getByText('Sources & publication context', { exact: true })
        .click()
    })

    await test.step('4. Compare the three chalks without changing the source', async () => {
      await page.getByRole('link', { name: 'Explain', exact: true }).click()
      const perspectives = new Set<string>()
      for (const chalk of chalks) {
        await page.getByRole('tab', { name: chalk.prompt, exact: true }).click()
        const panel = page.getByRole('tabpanel', {
          name: chalk.prompt,
          exact: true,
        })
        await expect(panel).toBeVisible()
        perspectives.add((await panel.textContent())!)
        expect(await page.locator('.reference-requirement').textContent()).toBe(
          sourceText,
        )
      }
      expect(perspectives.size).toBe(3)
      await page
        .getByRole('tab', { name: chalks[0].prompt, exact: true })
        .click()
    })

    await test.step('5. Work through the visual stages and full transcript', async () => {
      await page
        .getByRole('navigation', { name: 'Views of this control' })
        .getByRole('link', { name: 'Practice', exact: true })
        .click()
      await page
        .getByText('Watch the idea · 40 seconds', { exact: true })
        .click()
      await expect(
        page.getByRole('button', { name: 'Play explanation' }),
      ).toBeVisible()
      for (const name of [
        'Requirement',
        'Plain meaning',
        'Example',
        'Takeaway',
      ]) {
        const stage = page.getByRole('button', { name: new RegExp(name) })
        await stage.click()
        await expect(stage).toHaveAttribute('aria-current', 'step')
        await expect(page.locator('.visual-caption')).toContainText(name)
      }
      await page.locator('.visual-stage').scrollIntoViewIfNeeded()
      await capture(page, 'lesson', width)
      await page.getByText('Read the full transcript', { exact: true }).click()
      await expect(page.locator('.visual-transcript')).toContainText(
        'Permission and access must match.',
      )
      await page
        .getByText('Watch the idea · 40 seconds', { exact: true })
        .click()
    })

    await test.step('6. Look up a term and return to the same lesson', async () => {
      await page.getByRole('link', { name: 'Related', exact: true }).click()
      const term = page.getByRole('button', {
        name: 'Authorization',
        exact: true,
      })
      const address = page.url()
      await term.click()
      await expect(term).toHaveAttribute('aria-expanded', 'true')
      await expect(page.locator('.term-definition-meaning')).not.toBeEmpty()
      await page.keyboard.press('Escape')
      await expect(term).toBeFocused()
      await expect(term).toHaveAttribute('aria-expanded', 'false')
      expect(page.url()).toBe(address)
      await page
        .getByRole('navigation', { name: 'Views of this control' })
        .getByRole('link', { name: 'Practice', exact: true })
        .click()
    })

    await test.step('7. Try a decision and read why the misconception fails', async () => {
      await page
        .getByRole('button', { name: 'Start or return to questions' })
        .click()
      await expect(page.locator('.practice-prompt')).toBeFocused()
      await page
        .getByRole('radio', {
          name: 'Yes. Successful execution proves the process is approved.',
        })
        .check()
      await page.getByRole('button', { name: 'Check answer' }).click()
      const feedback = page.getByRole('status', { name: 'Answer feedback' })
      await expect(feedback).toBeFocused()
      await expect(feedback).toContainText('Not quite.')
      await expect(feedback).toContainText(
        'They do not establish the process’s authorization.',
      )
    })

    await test.step('8. Enable optional saving, resume and complete the activity', async () => {
      const settings = page.locator('.progress-preferences')
      await settings.locator('summary').click()
      await expect(settings).toContainText('not free text or visit times')
      await settings
        .getByRole('button', {
          name: 'Save learning on this browser',
          exact: true,
        })
        .click()
      await expect(settings.getByRole('status')).toBeFocused()
      await expect(settings.getByRole('status')).toContainText('Saving is on')
      await settings.locator('summary').click()
      await page.getByRole('button', { name: 'Next question' }).click()
      await page.reload()
      await page
        .getByRole('button', { name: 'Start or return to questions' })
        .click()
      await expect(
        page.getByText('Question 2 of 3', { exact: true }),
      ).toBeVisible()
      await expect(page.locator('input[type=radio]:checked')).toHaveCount(0)
      await page
        .getByRole('radio', {
          name: 'Whether the scanner is authorized, and whether access reflects that decision.',
        })
        .check()
      await page.getByRole('button', { name: 'Check answer' }).click()
      await page.getByRole('button', { name: 'Next question' }).click()
      await page
        .getByRole('radio', {
          name: 'Identify authorized users, user-acting processes, and devices; limit system access accordingly.',
        })
        .check()
      await page.getByRole('button', { name: 'Check answer' }).click()
      await page.getByRole('button', { name: 'Finish practice' }).click()
      await expect(
        page.getByRole('heading', {
          name: 'Practice complete. Keep asking why.',
        }),
      ).toBeFocused()
      await page.getByText('Review the reasoning', { exact: true }).click()
      await expect(page.locator('.practice-recap li')).toHaveCount(3)
      await expect(page.locator('.practice-recap')).toContainText(
        'Worth another look',
      )
      await expect(page.locator('.practice-recap')).toContainText(
        'What to take away:',
      )
      await page.locator('.practice-complete').scrollIntoViewIfNeeded()
      await capture(page, 'complete', width)
    })

    await test.step('9. Find the completed activity through its revisit mark', async () => {
      await page
        .getByRole('button', { name: 'Revisit later', exact: true })
        .click()
      await page.getByRole('link', { name: 'Choose another situation' }).click()
      await page
        .getByRole('combobox', { name: 'Learning status' })
        .selectOption('revisit')
      await page.getByRole('button', { name: 'Find activities' }).click()
      await expect(
        page.getByRole('status', { name: 'Activity results' }),
      ).toHaveText('1 activity available')
      await expect(page.locator('.practice-row-status')).toContainText(
        'Practice complete',
      )
      await expect(page.locator('.practice-row-status')).toContainText(
        '1 answer worth another look',
      )
      await page.getByRole('link', { name: /^Review reasoning\s*:/ }).click()
      await page
        .getByRole('button', { name: 'Start or return to questions' })
        .click()
      await expect(
        page.getByRole('heading', {
          name: 'Practice complete. Keep asking why.',
        }),
      ).toBeFocused()
    })

    await test.step('10. Continue to another level and retain a usable reading surface', async () => {
      await page
        .getByRole('navigation', { name: 'Main' })
        .getByRole('link', { name: 'Practice', exact: true })
        .click()
      await page
        .getByRole('searchbox', { name: 'Search activities' })
        .fill('IA.L2-3.5.3')
      await page.getByRole('button', { name: 'Find activities' }).click()
      await expect(
        page.getByRole('status', { name: 'Activity results' }),
      ).toHaveText('1 activity available')
      await page.getByRole('link', { name: /^Start questions\s*:/ }).click()
      await expect(page).toHaveURL(/control=ia-l2-3-5-3(?:&|#|$)/)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      await expect(
        page.getByText('Watch the idea · 40 seconds', { exact: true }),
      ).toBeVisible()
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true)
      expect(
        (await new AxeBuilder({ page }).include('main').analyze()).violations,
      ).toEqual([])
      expect(errors).toEqual([])
    })
  })
}
