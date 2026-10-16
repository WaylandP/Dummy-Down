import { renderWithProgress as render } from '../test/renderWithProgress'
import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PracticePage from './PracticePage'
import { learningActivities } from '../data/learning'
import { referenceControls } from '../data/content'
import { sitePage } from '../state/site-page'
import { CHALK_PREFERENCE_KEY } from '../state/chalk-preference'
import { trackUsage } from '../analytics/usage'

vi.mock('../analytics/usage', () => ({ trackUsage: vi.fn() }))

const first = learningActivities.find(
  (item) => item.id === 'level-one-authorized-access',
)!
const firstControl = referenceControls.find(
  (control) => control.key === first.lesson.controlKey,
)!

function open(address = '/practice') {
  window.history.replaceState(null, '', address)
  const view = render(<PracticePage />)
  return {
    ...view,
    user: userEvent.setup(),
    list: () =>
      within(screen.getByRole('region', { name: 'Work through a situation.' })),
    run: () => within(screen.getByRole('article')),
    address: () => window.location.pathname + window.location.search,
    choice: (label: RegExp | string) =>
      within(screen.getByRole('article')).getByRole('button', { name: label }),
  }
}
function phone() {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }))
}

beforeEach(() => {
  window.localStorage.clear()
  vi.mocked(trackUsage).mockClear()
})
afterEach(() => {
  vi.unstubAllGlobals()
  window.history.replaceState(null, '', '/')
})

describe('practice runs in place', () => {
  it('lists every situation in the catalog’s order, without the Practice: prefix', () => {
    const { list } = open()
    expect(sitePage(new URL(window.location.href))).toBe('practice')
    const rows = list().getAllByRole('link', { name: /./ })
    const situations = rows.filter((row) =>
      row.classList.contains('practice-situation'),
    )
    expect(situations).toHaveLength(learningActivities.length)
    expect(situations[0]).toHaveTextContent('Who and what can connect?')
    expect(situations[0]).toHaveTextContent(firstControl.id)
    expect(situations[0]).toHaveAttribute(
      'href',
      `/practice?activity=${first.id}`,
    )
    // AC.L2-3.1.1 is the first Level 2 control in the catalog.
    expect(situations[6]).toHaveTextContent('A working login is not approval')
    expect(situations[6]).toHaveTextContent('AC.L2-3.1.1')
    expect(situations[6]).toHaveAttribute(
      'href',
      '/practice?activity=authorized-access-practice',
    )
    expect(situations.at(-1)).toHaveTextContent('SI.L3-3.14.1e')
    for (const row of situations) expect(row).not.toHaveTextContent('Practice:')
    expect(
      screen.getByRole('navigation', { name: 'Practice situations' }),
    ).toContainElement(situations[0]!)
    expect(
      list().getByRole('status', { name: 'Situation results' }),
    ).toHaveTextContent('13 situations')
    expect(
      list().getByText(/Thirteen short, fictional situations/),
    ).toBeVisible()
  })

  it.each([
    ['MFA', 'ia-l2-3-5-3'],
    ['hash', 'si-l3-3-14-1e'],
    ['execution', 'cm-l2-3-4-8'],
  ])(
    'still finds the taught concept %s from an older search link',
    (query, key) => {
      const { list } = open(`/practice?q=${query}`)
      expect(
        list().getByRole('searchbox', { name: 'Find a situation' }),
      ).toHaveValue(query)
      const activity = learningActivities.find(
        (item) => item.lesson.controlKey === key,
      )!
      expect(
        list().getByRole('link', {
          name: new RegExp(activity.title.replace(/^Practice:\s*/, ''), 'i'),
        }),
      ).toBeVisible()
    },
  )

  it('narrows by level in the address and by typing, and brings every situation back', async () => {
    const { user, list, address } = open()
    await user.click(
      within(list().getByRole('group', { name: 'Level' })).getByRole('link', {
        name: '3',
      }),
    )
    expect(address()).toBe('/practice?level=Level+3')
    expect(
      list().getByRole('status', { name: 'Situation results' }),
    ).toHaveTextContent('3 of 13 situations')
    expect(list().queryByText('A working login is not approval')).toBeNull()
    await user.type(
      list().getByRole('searchbox', { name: 'Find a situation' }),
      'no such situation',
    )
    expect(list().getByText('No matching situations.')).toBeVisible()
    expect(address()).toBe('/practice?level=Level+3')
    await user.click(
      list().getByRole('button', { name: 'Show every situation' }),
    )
    expect(address()).toBe('/practice')
    expect(
      list().getByRole('status', { name: 'Situation results' }),
    ).toHaveTextContent('13 situations')
  })

  it('keeps the first situation at the level in force running while the list is typed into or hidden', async () => {
    const { user, list, run, address } = open('/practice?level=Level+2')
    // AC.L2-3.1.1 is the first Level 2 situation in the catalog's order; it
    // is listed at its level like the others.
    expect(run().getByRole('heading', { level: 2 })).toHaveTextContent(
      'A working login is not approval',
    )
    expect(run().getByText('AC.L2-3.1.1')).toBeVisible()
    expect(
      run().getByText(/^Level 2 · Authorized Access Control/),
    ).toBeVisible()
    expect(run().queryByText('Project example')).toBeNull()
    expect(
      list().getByRole('status', { name: 'Situation results' }),
    ).toHaveTextContent('4 of 13 situations')
    await user.type(
      list().getByRole('searchbox', { name: 'Find a situation' }),
      'authentication factor',
    )
    expect(
      list().getByRole('status', { name: 'Situation results' }),
    ).toHaveTextContent('1 of 13 situations')
    expect(run().getByText('AC.L2-3.1.1')).toBeVisible()
    await user.type(
      list().getByRole('searchbox', { name: 'Find a situation' }),
      ' nowhere',
    )
    expect(list().getByText('No matching situations.')).toBeVisible()
    expect(run().getByText('AC.L2-3.1.1')).toBeVisible()
    expect(address()).toBe('/practice?level=Level+2')
  })

  it('runs the first situation on a desktop: an answer shows its feedback, the next question moves the address, and Back looks at an answered one', async () => {
    const { user, run, address, choice } = open()
    expect(run().getByRole('heading', { level: 2 })).toHaveTextContent(
      'Who and what can connect?',
    )
    expect(run().getByText(firstControl.id)).toBeVisible()
    expect(run().getByText(/Question 1 of 3/)).toBeVisible()
    expect(run().getByText(first.questions[0]!.prompt)).toBeVisible()
    const question = first.questions[0]!
    expect(
      run()
        .getAllByRole('button')
        .filter((node) => node.classList.contains('practice-run-choice')),
    ).toHaveLength(question.choices.length)
    expect(run().queryByRole('button', { name: /Next question/ })).toBeNull()
    expect(run().queryByText('A common mix-up')).toBeNull()
    const right = question.choices.find(
      (item) => item.id === question.correctChoiceId,
    )!
    await user.click(choice(right.label))
    expect(trackUsage).toHaveBeenCalledWith({
      name: 'practice_action',
      lesson: first.lesson,
      action: 'check',
    })
    const feedback = run().getByRole('status')
    expect(feedback).toHaveTextContent(`That’s right. ${right.feedback}`)
    expect(feedback).toHaveFocus()
    expect(choice(right.label)).toHaveAttribute('aria-pressed', 'true')
    for (const other of question.choices.filter((item) => item !== right)) {
      expect(choice(other.label)).toBeDisabled()
      expect(choice(other.label)).toHaveAttribute('aria-pressed', 'false')
    }
    // The mix-up, the requirement and the chalk talk this control has.
    expect(
      run().getByRole('heading', { name: 'A common mix-up' }),
    ).toBeVisible()
    expect(run().getByText(first.commonMisunderstanding!.claim).tagName).toBe(
      'S',
    )
    expect(
      run().getByText(first.commonMisunderstanding!.correction),
    ).toBeVisible()
    expect(
      run().getByRole('link', { name: 'Read the requirement' }),
    ).toHaveAttribute(
      'href',
      expect.stringMatching(/control=ac-l1-b-1-i(?!.*tab=)/),
    )
    expect(
      run().getByRole('link', { name: 'Watch the 40-second chalk talk' }),
    ).toHaveAttribute('href', expect.stringContaining('tab=practice'))
    // Next question, in the address; Back looks at the answered one.
    await user.click(run().getByRole('button', { name: 'Next question' }))
    expect(address()).toBe(`/practice?activity=${first.id}&q=2`)
    expect(run().getByText(/Question 2 of 3/)).toBeVisible()
    expect(run().getByText(first.questions[1]!.prompt)).toHaveFocus()
    expect(trackUsage).toHaveBeenLastCalledWith({
      name: 'practice_action',
      lesson: first.lesson,
      action: 'next',
    })
    act(() => {
      window.history.replaceState(
        null,
        '',
        `/practice?activity=${first.id}&q=1`,
      )
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(run().getByText(/Question 1 of 3/)).toBeVisible()
    expect(choice(right.label)).toHaveAttribute('aria-pressed', 'true')
    await user.click(run().getByRole('button', { name: 'Next question' }))
    expect(address()).toBe(`/practice?activity=${first.id}&q=2`)
    expect(vi.mocked(trackUsage).mock.calls).toHaveLength(2)
  })

  it('leaves the chalk talk off situations that have none, and opens the requirement in the chalk picked on Home', async () => {
    window.localStorage.setItem(CHALK_PREFERENCE_KEY, 'compliance')
    const activity = learningActivities.find(
      (item) => item.id === 'level-one-public-information',
    )!
    const { user, run, choice } = open(`/practice?activity=${activity.id}`)
    await user.click(choice(activity.questions[0]!.choices[0]!.label))
    expect(
      run().queryByRole('link', { name: 'Watch the 40-second chalk talk' }),
    ).toBeNull()
    expect(
      run().getByRole('link', { name: 'Read the requirement' }),
    ).toHaveAttribute('href', expect.stringContaining('mode=compliance'))
  })

  it('after an answer keeps focus on the feedback and scrolls only as far as it takes to show Next question, at once under reduced motion', async () => {
    // jsdom has no layout: a 768px-tall page, the feedback at 500px and the
    // button's bottom at the given height.
    const scroll = vi.fn()
    const realRect = Element.prototype.getBoundingClientRect
    let buttonBottom = 904
    Element.prototype.scrollBy = scroll
    Element.prototype.getBoundingClientRect = function (this: Element) {
      const at = (top: number, bottom: number) =>
        ({
          top,
          bottom,
          left: 0,
          right: 0,
          width: 0,
          height: bottom - top,
          x: 0,
          y: top,
          toJSON() {},
        }) as DOMRect
      if (this.classList.contains('practice-run-next'))
        return at(buttonBottom - 44, buttonBottom)
      if (this.classList.contains('practice-run-feedback')) return at(500, 600)
      return realRect.call(this)
    }
    Object.defineProperty(document.documentElement, 'clientHeight', {
      configurable: true,
      value: 768,
    })
    try {
      for (const [reduced, bottom, expected] of [
        [false, 904, 136],
        [true, 904, 136],
        // Already in view: the page stays where it is.
        [false, 700, null],
      ] as const) {
        vi.stubGlobal('matchMedia', (query: string) => ({
          // A desktop, with or without a request for less motion.
          matches: query.includes('reduce') ? reduced : true,
          media: query,
          addEventListener() {},
          removeEventListener() {},
        }))
        buttonBottom = bottom
        scroll.mockClear()
        const { user, run, choice, unmount } = open()
        const question = first.questions[0]!
        await user.click(choice(question.choices[0]!.label))
        // The feedback takes focus without the browser's own scroll.
        expect(run().getByRole('status')).toHaveFocus()
        if (expected === null) expect(scroll).not.toHaveBeenCalled()
        else
          expect(scroll).toHaveBeenCalledExactlyOnceWith({
            top: expected,
            behavior: reduced ? 'instant' : 'smooth',
          })
        unmount()
      }
    } finally {
      delete (Element.prototype as Partial<Element>).scrollBy
      Element.prototype.getBoundingClientRect = realRect
      Reflect.deleteProperty(document.documentElement, 'clientHeight')
    }
  })

  it('finishes a situation and offers it again from the first question', async () => {
    const { user, run, address, choice } = open(
      `/practice?activity=${first.id}`,
    )
    for (const [index, question] of first.questions.entries()) {
      await user.click(choice(question.choices[0]!.label))
      await user.click(
        run().getByRole('button', {
          name:
            index === first.questions.length - 1
              ? 'Finish practice'
              : 'Next question',
        }),
      )
    }
    expect(trackUsage).toHaveBeenLastCalledWith({
      name: 'practice_action',
      lesson: first.lesson,
      action: 'complete',
    })
    expect(run().getByText('Practice complete. Keep asking why.')).toHaveFocus()
    await user.click(run().getByRole('button', { name: 'Practice again' }))
    expect(address()).toBe(`/practice?activity=${first.id}&q=1`)
    expect(run().getByText(/Question 1 of 3/)).toBeVisible()
    expect(run().queryByRole('button', { name: /Next question/ })).toBeNull()
    expect(trackUsage).toHaveBeenLastCalledWith({
      name: 'practice_action',
      lesson: first.lesson,
      action: 'reset',
    })
  })

  it('keeps progress on this browser only when asked, hides what is finished, and deletes it when turned off', async () => {
    const { user, list, run, choice } = open()
    const keep = () =>
      list().getByRole('button', { name: /Keep my progress on this browser/ })
    expect(keep()).toHaveAttribute('aria-pressed', 'false')
    expect(keep()).toHaveTextContent('off')
    expect(list().queryByRole('checkbox', { name: 'Hide finished' })).toBeNull()
    await user.click(keep())
    expect(keep()).toHaveAttribute('aria-pressed', 'true')
    expect(keep()).toHaveTextContent('on')
    expect(
      list().getByText(/Kept in this browser only, never sent/),
    ).toBeVisible()
    for (const [index, question] of first.questions.entries()) {
      await user.click(choice(question.choices[0]!.label))
      await user.click(
        run().getByRole('button', {
          name:
            index === first.questions.length - 1
              ? 'Finish practice'
              : 'Next question',
        }),
      )
    }
    expect(list().getByText('(finished)')).toBeInTheDocument()
    await user.click(list().getByRole('checkbox', { name: 'Hide finished' }))
    expect(
      list().getByRole('status', { name: 'Situation results' }),
    ).toHaveTextContent('12 of 13 situations')
    expect(list().queryByText('Who and what can connect?')).toBeNull()
    await user.click(keep())
    expect(keep()).toHaveAttribute('aria-pressed', 'false')
    expect(
      list().getByRole('status', { name: 'Situation results' }),
    ).toHaveTextContent('13 situations')
    expect(run().getByText(/Question 1 of 3/)).toBeVisible()
    expect(run().queryByText('Practice complete. Keep asking why.')).toBeNull()
  })

  it('on a phone the list comes first, and a situation opens full width with a way back', async () => {
    phone()
    const { user, list, address } = open()
    expect(screen.queryByRole('article')).toBeNull()
    await user.click(
      list().getByRole('link', { name: /Who and what can connect\?/ }),
    )
    expect(address()).toBe(`/practice?activity=${first.id}`)
    expect(
      screen.queryByRole('region', { name: 'Work through a situation.' }),
    ).toBeNull()
    const article = within(screen.getByRole('article'))
    // Alone on the page, the situation's title is its heading; the situation
    // panel heads one level under it.
    expect(article.getByRole('heading', { level: 1 })).toHaveFocus()
    expect(
      screen
        .getAllByRole('heading', { level: 2 })
        .map((node) => node.textContent),
    ).toEqual(['The situation'])
    await user.click(article.getByRole('link', { name: '← All situations' }))
    expect(address()).toBe('/practice')
    expect(screen.queryByRole('article')).toBeNull()
    expect(
      list().getByRole('link', { name: /Who and what can connect\?/ }),
    ).toBeVisible()
  })

  it('shows the situation itself: its title and introduction before the question, and every step in a panel beside it', () => {
    const { run } = open(`/practice?activity=${first.id}`)
    const article = screen.getByRole('article')
    const scenario = run().getByText(first.scenarioTitle)
    const intro = run().getByText(first.introduction, { exact: false })
    const prompt = run().getByText(first.questions[0]!.prompt)
    const follows = (a: Element, b: Element) =>
      Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)
    expect(
      follows(
        run().getByRole('heading', {
          level: 2,
          name: 'Who and what can connect?',
        }),
        scenario,
      ),
    ).toBe(true)
    // The scenario's title opens the introduction.
    expect(intro.firstElementChild).toBe(scenario)
    expect(follows(intro, prompt)).toBe(true)
    // Beside the list the panel is a complementary region, not a disclosure.
    const panel = run().getByRole('complementary', { name: 'The situation' })
    expect(article.querySelector('details.practice-scene')).toBeNull()
    expect(follows(panel, prompt)).toBe(true)
    const steps = within(panel).getAllByRole('listitem')
    expect(steps).toHaveLength(first.scenario.length)
    first.scenario.forEach((step, index) => {
      expect(steps[index]).toHaveTextContent(
        `${step.title}. ${step.description}`,
      )
    })
    // The same activity data the control page's Practice tab shows: nothing
    // of it is reworded here.
    expect(panel.textContent).toContain(first.scenario[0]!.description)
  })

  it('on a phone the situation is a disclosure above the question that starts open', async () => {
    phone()
    const { user, run } = open(`/practice?activity=${first.id}`)
    const panel = screen
      .getByRole('article')
      .querySelector('details.practice-scene')!
    expect(panel).toHaveAttribute('open')
    expect(screen.queryByRole('complementary')).toBeNull()
    const summary = run().getByText('The situation').closest('summary')!
    expect(summary).toBeInTheDocument()
    expect(within(panel as HTMLElement).getAllByRole('listitem')).toHaveLength(
      first.scenario.length,
    )
    expect(
      Boolean(
        panel.compareDocumentPosition(
          run().getByText(first.questions[0]!.prompt),
        ) & Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    ).toBe(true)
    await user.click(summary)
    expect(panel).not.toHaveAttribute('open')
    await user.click(summary)
    expect(panel).toHaveAttribute('open')
  })

  it('says when a situation is not here and keeps the list', () => {
    const { list } = open('/practice?activity=no-such-situation&q=2')
    expect(screen.getByText(/That situation isn’t here/)).toBeVisible()
    expect(screen.queryByRole('article')).toBeNull()
    expect(list().getAllByRole('link').length).toBeGreaterThan(13)
  })

  it('never looks ahead of the question in hand, whatever the address asks for', async () => {
    const { user, run, address, choice } = open(
      `/practice?activity=${first.id}&q=3`,
    )
    expect(run().getByText(/Question 1 of 3/)).toBeVisible()
    expect(address()).toBe(`/practice?activity=${first.id}&q=3`)
    // A question that is not a number is the first one.
    act(() => {
      window.history.replaceState(
        null,
        '',
        `/practice?activity=${first.id}&q=two`,
      )
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(run().getByText(/Question 1 of 3/)).toBeVisible()
    // A finished situation opens on its last question, and q=1 looks back at
    // the first answer without changing it.
    for (const [index, question] of first.questions.entries()) {
      await user.click(choice(question.choices[0]!.label))
      await user.click(
        run().getByRole('button', {
          name:
            index === first.questions.length - 1
              ? 'Finish practice'
              : 'Next question',
        }),
      )
    }
    expect(run().getByText(/Question 3 of 3/)).toBeVisible()
    act(() => {
      window.history.replaceState(
        null,
        '',
        `/practice?activity=${first.id}&q=1`,
      )
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(run().getByText(/Question 1 of 3/)).toBeVisible()
    expect(choice(first.questions[0]!.choices[0]!.label)).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(run().getByText('Practice complete. Keep asking why.')).toBeVisible()
    expect(run().getByRole('button', { name: 'Practice again' })).toBeVisible()
    expect(vi.mocked(trackUsage).mock.calls).toHaveLength(6)
  })

  it('travels Back and Forward between situations without taking focus, and a pick from the list takes it', async () => {
    const { user, list, run, address } = open()
    const second = learningActivities.find(
      (item) => item.id === 'level-one-public-information',
    )!
    await user.click(
      list().getByRole('link', { name: /What belongs in public\?/ }),
    )
    expect(address()).toBe(`/practice?activity=${second.id}`)
    expect(run().getByRole('heading', { level: 2 })).toHaveFocus()
    act(() => {
      window.history.replaceState(null, '', '/practice')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(run().getByRole('heading', { level: 2 })).toHaveTextContent(
      'Who and what can connect?',
    )
    expect(run().getByRole('heading', { level: 2 })).not.toHaveFocus()
    act(() => {
      window.history.replaceState(null, '', `/practice?activity=${second.id}`)
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(run().getByRole('heading', { level: 2 })).toHaveTextContent(
      'What belongs in public?',
    )
    expect(run().getByRole('heading', { level: 2 })).not.toHaveFocus()
    // Picking the situation already running still reads from its title.
    await user.click(
      list().getByRole('link', { name: /What belongs in public\?/ }),
    )
    expect(run().getByRole('heading', { level: 2 })).toHaveFocus()
  })

  it('leaves the switch off under a browser privacy signal and says so', () => {
    Object.defineProperty(navigator, 'globalPrivacyControl', {
      configurable: true,
      value: true,
    })
    const { list } = open()
    const keep = list().getByRole('button', {
      name: /Keep my progress on this browser/,
    })
    expect(keep).toBeDisabled()
    expect(keep).toHaveAttribute('aria-pressed', 'false')
    expect(
      list().getByText('Your browser’s privacy signal keeps it off.'),
    ).toBeVisible()
    expect(window.localStorage.length).toBe(0)
    delete (navigator as { globalPrivacyControl?: boolean })
      .globalPrivacyControl
  })

  it('ignores the learning-status parameter of an older link', () => {
    const { list, run } = open('/practice?status=completed')
    expect(
      list().getByRole('status', { name: 'Situation results' }),
    ).toHaveTextContent('13 situations')
    expect(run().getByText(/Question 1 of 3/)).toBeVisible()
  })

  it('on a phone the mix-up heads one level under the situation’s title', async () => {
    phone()
    const { user, choice } = open(`/practice?activity=${first.id}`)
    const article = within(screen.getByRole('article'))
    expect(article.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Who and what can connect?',
    )
    await user.click(choice(first.questions[0]!.choices[0]!.label))
    expect(
      article.getByRole('heading', { level: 2, name: 'A common mix-up' }),
    ).toBeVisible()
    expect(article.queryByRole('heading', { level: 3 })).toBeNull()
  })
})
