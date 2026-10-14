import { renderWithProgress as render } from '../test/renderWithProgress'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { controls } from '../data/controls'
import { referenceControls } from '../data/cmmc-references'
import { findLearningActivity, learningActivities } from '../data/learning'
import type { LessonIdentity } from '../types/content'
import { createProgressCatalog } from '../progress/model'
import { LearningPractice } from './LearningPractice'

const lesson: LessonIdentity = {
  frameworkId: 'cmmc',
  editionId: 'readme-example',
  controlKey: 'authorized-access',
}
const activity = learningActivities[0]!

async function openCheck(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    screen.getByText('Check your understanding', { selector: 'summary' }),
  )
}

afterEach(() => vi.restoreAllMocks())

describe('learning activity integrity', () => {
  it('binds unique draft activities to exact lessons and a safe teaching source', () => {
    expect(createProgressCatalog(learningActivities).size).toBe(
      learningActivities.length,
    )
    const ids = new Set<string>()
    const identities = new Set<string>()
    for (const item of learningActivities) {
      expect(ids.has(item.id)).toBe(false)
      ids.add(item.id)
      const identity = JSON.stringify(item.lesson)
      expect(identities.has(identity)).toBe(false)
      identities.add(identity)
      expect(
        [...controls, ...referenceControls].some(
          (control) =>
            control.frameworkId === item.lesson.frameworkId &&
            control.editionId === item.lesson.editionId &&
            control.key === item.lesson.controlKey,
        ),
      ).toBe(true)
      expect(item.reviewStatus).toBe('draft')
      expect(item.teachingSource.kind).toBe(
        item.lesson.editionId === 'readme-example'
          ? 'project-readme'
          : 'official-publication',
      )
      expect(new URL(item.teachingSource.url).protocol).toBe('https:')
      expect(new Set(item.scenario.map((step) => step.id)).size).toBe(
        item.scenario.length,
      )
      expect(new Set(item.questions.map((question) => question.id)).size).toBe(
        item.questions.length,
      )
      for (const question of item.questions) {
        expect(question.choices.length).toBeGreaterThan(1)
        expect(new Set(question.choices.map((choice) => choice.id)).size).toBe(
          question.choices.length,
        )
        expect(
          question.choices.filter(
            (choice) => choice.id === question.correctChoiceId,
          ),
        ).toHaveLength(1)
        expect(
          question.choices.every((choice) => choice.feedback.length > 0),
        ).toBe(true)
      }
    }
  })

  it.each([
    { ...lesson, frameworkId: 'other-framework' },
    { ...lesson, editionId: 'other-edition' },
    { ...lesson, controlKey: 'AC.L2-3.1.1' },
  ])('refuses a partial match for %o', (address) => {
    expect(findLearningActivity(address)).toBeUndefined()
    const { container } = render(<LearningPractice lesson={address} />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('LearningPractice', () => {
  it('offers an ordered fictional visual flow with persistent draft/source context', async () => {
    const user = userEvent.setup()
    const { container } = render(<LearningPractice lesson={lesson} />)
    expect(screen.getByRole('heading', { name: 'Try the idea' })).toBeVisible()
    expect(screen.getByText('Practice activity')).toBeVisible()
    expect(screen.getByText(activity.disclaimer)).toBeVisible()
    const source = screen.getByRole('link', {
      name: /README simplified example/,
    })
    expect(source).toHaveAttribute('href', activity.teachingSource.url)
    expect(source).toHaveAttribute('rel', 'noopener noreferrer')
    expect(
      screen.getByRole('heading', {
        name: 'Approve the account',
        hidden: true,
      }),
    ).not.toBeVisible()
    await user.click(
      screen.getByText(`Fictional scenario: ${activity.scenarioTitle}`, {
        selector: 'summary',
      }),
    )
    const flow = container.querySelector('ol.scenario-flow')!
    expect(flow).toBeVisible()
    expect(within(flow as HTMLElement).getAllByRole('listitem')).toHaveLength(4)
    expect(
      [...flow.querySelectorAll('h5')].map((heading) => heading.textContent),
    ).toEqual(activity.scenario.map((step) => step.title))
  })

  it('requires a deliberate selection and check before advancing', async () => {
    const user = userEvent.setup()
    render(<LearningPractice lesson={lesson} />)
    await openCheck(user)
    expect(screen.getByText('Question 1 of 3')).toBeVisible()
    expect(screen.getAllByRole('radio')).toHaveLength(3)
    const check = screen.getByRole('button', { name: 'Check answer' })
    const next = screen.getByRole('button', { name: 'Next question' })
    expect(check).toBeDisabled()
    expect(next).toBeDisabled()
    await user.click(
      screen.getByRole('radio', {
        name: activity.questions[0]!.choices[1]!.label,
      }),
    )
    expect(check).toBeEnabled()
    expect(next).toBeDisabled()
    expect(
      screen.getByRole('status', { name: 'Answer feedback' }),
    ).toBeEmptyDOMElement()
    await user.click(check)
    expect(
      screen.getByRole('status', { name: 'Answer feedback' }),
    ).toHaveTextContent('That’s right.')
    expect(
      screen.getByRole('status', { name: 'Answer feedback' }),
    ).toHaveTextContent(activity.questions[0]!.choices[1]!.feedback)
    expect(check).toBeDisabled()
    for (const radio of screen.getAllByRole('radio'))
      expect(radio).toBeDisabled()
    expect(next).toBeEnabled()
  })

  it.each(['correct', 'incorrect'] as const)(
    'identifies the selected answer and explains %s feedback without relying on color',
    async (outcome) => {
      const user = userEvent.setup()
      const question = activity.questions[0]!
      const choice = question.choices.find((item) =>
        outcome === 'correct'
          ? item.id === question.correctChoiceId
          : item.id !== question.correctChoiceId,
      )!
      render(<LearningPractice lesson={lesson} />)
      await openCheck(user)
      const radio = screen.getByRole('radio', { name: choice.label })
      await user.click(radio)
      expect(radio).toBeChecked()
      expect(screen.getByText('Selected')).toBeVisible()
      await user.click(screen.getByRole('button', { name: 'Check answer' }))
      const feedback = screen.getByRole('status', { name: 'Answer feedback' })
      expect(feedback).toHaveTextContent(
        outcome === 'correct' ? 'That’s right.' : 'Not quite.',
      )
      expect(feedback).toHaveTextContent(`Your answer: ${choice.label}`)
      expect(feedback).toHaveTextContent(choice.feedback)
      await user.click(screen.getByRole('button', { name: 'Try again' }))
      expect(screen.queryByText('Selected')).not.toBeInTheDocument()
      expect(feedback).toBeEmptyDOMElement()
      expect(screen.getByText(question.prompt)).toHaveFocus()
    },
  )

  it('explains a wrong answer and allows another attempt without skipping ahead', async () => {
    const user = userEvent.setup()
    render(<LearningPractice lesson={lesson} />)
    await openCheck(user)
    await user.click(
      screen.getByRole('radio', {
        name: activity.questions[0]!.choices[0]!.label,
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Check answer' }))
    expect(
      screen.getByRole('status', { name: 'Answer feedback' }),
    ).toHaveTextContent('Not quite.')
    expect(
      screen.getByRole('status', { name: 'Answer feedback' }),
    ).toHaveTextContent(activity.questions[0]!.choices[0]!.feedback)
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(screen.getByText(activity.questions[0]!.prompt)).toHaveFocus()
    expect(
      screen.getByRole('status', { name: 'Answer feedback' }),
    ).toBeEmptyDOMElement()
    expect(
      screen
        .getAllByRole('radio')
        .every((radio) => !(radio as HTMLInputElement).checked),
    ).toBe(true)
    expect(screen.getByRole('button', { name: 'Check answer' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next question' })).toBeDisabled()
  })

  it('moves focus to the next question and clears previous answer state', async () => {
    const user = userEvent.setup()
    render(<LearningPractice lesson={lesson} />)
    await openCheck(user)
    await user.click(
      screen.getByRole('radio', {
        name: activity.questions[0]!.choices[0]!.label,
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Check answer' }))
    await user.click(screen.getByRole('button', { name: 'Next question' }))
    expect(screen.getByText(activity.questions[1]!.prompt)).toHaveFocus()
    expect(screen.getByText('Question 2 of 3')).toBeVisible()
    expect(
      screen.getByRole('progressbar', { name: 'Questions reviewed' }),
    ).toHaveAttribute('aria-valuetext', '1 of 3 questions reviewed')
    expect(screen.getByText(activity.questions[0]!.prompt)).not.toBeVisible()
    expect(
      screen.getByRole('status', { name: 'Answer feedback' }),
    ).toBeEmptyDOMElement()
    expect(screen.getByRole('button', { name: 'Check answer' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next question' })).toBeDisabled()
  })

  it('completes and restarts without a compliance grade or persisted progress', async () => {
    const user = userEvent.setup()
    const originalUrl = window.location.href
    const push = vi.spyOn(window.history, 'pushState')
    const replace = vi.spyOn(window.history, 'replaceState')
    const store = vi.spyOn(Storage.prototype, 'setItem')
    render(<LearningPractice lesson={lesson} />)
    await openCheck(user)
    for (const [index, question] of activity.questions.entries()) {
      // Incorrect responses may advance after explanatory feedback; this is practice, not an exam.
      await user.click(
        screen.getByRole('radio', { name: question.choices[1]!.label }),
      )
      await user.click(screen.getByRole('button', { name: 'Check answer' }))
      await user.click(
        screen.getByRole('button', {
          name:
            index === activity.questions.length - 1
              ? 'Finish practice'
              : 'Next question',
        }),
      )
    }
    const completion = screen.getByRole('heading', {
      name: 'Practice complete. Keep asking why.',
    })
    expect(completion).toHaveFocus()
    expect(
      screen.getByRole('progressbar', { name: 'Questions reviewed' }),
    ).toHaveAttribute('aria-valuetext', 'Practice complete')
    expect(
      screen.getByText(/Revisit the activity as often as you need/),
    ).toBeVisible()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(window.location.href).toBe(originalUrl)
    expect(push).not.toHaveBeenCalled()
    expect(replace).not.toHaveBeenCalled()
    expect(store).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Practice again' }))
    expect(screen.getByText(activity.questions[0]!.prompt)).toHaveFocus()
    expect(screen.getByText('Question 1 of 3')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Check answer' })).toBeDisabled()
    expect(
      screen.getByRole('status', { name: 'Answer feedback' }),
    ).toBeEmptyDOMElement()
  })

  it('can reset halfway through the activity', async () => {
    const user = userEvent.setup()
    render(<LearningPractice lesson={lesson} />)
    await openCheck(user)
    await user.click(
      screen.getByRole('radio', {
        name: activity.questions[0]!.choices[1]!.label,
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Check answer' }))
    await user.click(screen.getByRole('button', { name: 'Next question' }))
    await user.click(
      screen.getByRole('radio', {
        name: activity.questions[1]!.choices[2]!.label,
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Start over' }))
    expect(screen.getByText(activity.questions[0]!.prompt)).toHaveFocus()
    expect(screen.getByText('Question 1 of 3')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Check answer' })).toBeDisabled()
    expect(
      screen
        .getAllByRole('radio')
        .every((radio) => !(radio as HTMLInputElement).checked),
    ).toBe(true)
  })

  it('keeps progress for the same editorial identity and resets after leaving it', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<LearningPractice lesson={lesson} />)
    await openCheck(user)
    await user.click(
      screen.getByRole('radio', {
        name: activity.questions[0]!.choices[1]!.label,
      }),
    )
    rerender(<LearningPractice lesson={{ ...lesson }} />)
    expect(
      screen.getByRole('radio', {
        name: activity.questions[0]!.choices[1]!.label,
      }),
    ).toBeChecked()
    rerender(
      <LearningPractice lesson={{ ...lesson, editionId: 'unavailable' }} />,
    )
    expect(
      screen.queryByRole('heading', { name: 'Try the idea' }),
    ).not.toBeInTheDocument()
    rerender(<LearningPractice lesson={lesson} />)
    await openCheck(user)
    expect(screen.getByText('Question 1 of 3')).toBeVisible()
    expect(
      screen
        .getAllByRole('radio')
        .every((radio) => !(radio as HTMLInputElement).checked),
    ).toBe(true)
  })

  it('starts at zero, opens questions directly and reviews reasoning without a score', async () => {
    const user = userEvent.setup()
    render(<LearningPractice lesson={lesson} />)
    await user.click(
      screen.getByRole('button', { name: 'Start or return to questions' }),
    )
    expect(screen.getByText(activity.questions[0]!.prompt)).toHaveFocus()
    expect(
      screen.getByRole('progressbar', { name: 'Questions reviewed' }),
    ).toHaveAttribute('value', '0')
    for (const [index, question] of activity.questions.entries()) {
      await user.click(
        screen.getByRole('radio', { name: question.choices[0]!.label }),
      )
      await user.click(screen.getByRole('button', { name: 'Check answer' }))
      expect(
        screen.getByRole('progressbar', { name: 'Questions reviewed' }),
      ).toHaveAttribute('value', String(index + 1))
      await user.click(
        screen.getByRole('button', {
          name: index === 2 ? 'Finish practice' : 'Next question',
        }),
      )
    }
    await user.click(
      screen.getByText('Review the reasoning', { selector: 'summary' }),
    )
    expect(screen.getAllByText('Worth another look').length).toBeGreaterThan(0)
    expect(
      screen.getByText(activity.questions[0]!.choices[0]!.feedback),
    ).toBeVisible()
    for (const question of activity.questions) {
      expect(screen.getByText(question.prompt)).toBeVisible()
      expect(
        screen.getByText(
          question.choices.find(
            (choice) => choice.id === question.correctChoiceId,
          )!.feedback,
        ),
      ).toBeVisible()
    }
    await user.click(
      screen.getByRole('button', { name: 'Start or return to questions' }),
    )
    expect(
      screen.getByRole('heading', {
        name: 'Practice complete. Keep asking why.',
      }),
    ).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Practice again' }))
    expect(
      screen.getByRole('progressbar', { name: 'Questions reviewed' }),
    ).toHaveAttribute('value', '0')
    expect(screen.queryByText('Review the reasoning')).not.toBeInTheDocument()
  })

  it('supports native radio keyboard selection', async () => {
    const user = userEvent.setup()
    render(<LearningPractice lesson={lesson} />)
    await openCheck(user)
    const radios = screen.getAllByRole('radio')
    await user.click(radios[0]!)
    await user.keyboard('{ArrowDown}')
    expect(radios[1]).toHaveFocus()
    expect(radios[1]).toBeChecked()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Check answer' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(
      screen.getByRole('status', { name: 'Answer feedback' }),
    ).toHaveTextContent('That’s right.')
  })
})
