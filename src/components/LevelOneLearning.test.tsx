import { renderWithProgress as render } from '../test/renderWithProgress'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { referenceControls } from '../data/cmmc-references'
import { findLearningActivity } from '../data/learning'
import { levelOneLearningActivities } from '../data/level-one-learning'
import { LearningPractice } from './LearningPractice'

const expectedSources = [
  { controlKey: 'ac-l1-b-1-i', id: 'AC.L1-b.1.i', pdfPage: 16 },
  { controlKey: 'ac-l1-b-1-iv', id: 'AC.L1-b.1.iv', pdfPage: 24 },
  { controlKey: 'mp-l1-b-1-vii', id: 'MP.L1-b.1.vii', pdfPage: 31 },
] as const

describe('Level 1 learning coverage', () => {
  it('binds three complete activities to their own Level 1 publication pages', () => {
    expect(levelOneLearningActivities).toHaveLength(3)
    for (const source of expectedSources) {
      const activity = levelOneLearningActivities.find(
        (item) => item.lesson.controlKey === source.controlKey,
      )!
      const control = referenceControls.find((item) => item.id === source.id)!
      expect(activity.lesson).toEqual({
        frameworkId: control.frameworkId,
        editionId: control.editionId,
        controlKey: control.key,
      })
      expect(control.level).toBe('Level 1')
      expect(activity.teachingSource.kind).toBe('official-publication')
      expect(activity.teachingSource.url).toBe(
        `https://dodcio.defense.gov/Portals/0/Documents/CMMC/AssessmentGuideL1v2.pdf#page=${source.pdfPage}`,
      )
      expect(activity.teachingSource.versionContext).toContain('September 2024')
      expect(activity.reviewStatus).toBe('draft')
      expect(activity.disclaimer).toContain('fictional practice activity')
      expect(activity.plainEnglish).toBeTruthy()
      expect(activity.commonMisunderstanding?.claim).toBeTruthy()
      expect(activity.commonMisunderstanding?.correction).toBeTruthy()
      expect(activity.scenario.length).toBeGreaterThan(1)
      expect(activity.questions).toHaveLength(3)
      for (const question of activity.questions) {
        expect(question.choices).toHaveLength(3)
        expect(
          question.choices.filter(
            (choice) => choice.id === question.correctChoiceId,
          ),
        ).toHaveLength(1)
        expect(question.choices.every((choice) => choice.feedback.trim())).toBe(
          true,
        )
      }
      expect(activity.diagram?.textEquivalent).toBeTruthy()
      expect(
        new Set([
          ...activity.diagram!.steps.map((step) => step.id),
          ...(activity.diagram!.branches ?? []).map((branch) => branch.id),
        ]).size,
      ).toBe(
        activity.diagram!.steps.length +
          (activity.diagram!.branches?.length ?? 0),
      )
      expect(
        findLearningActivity({
          ...activity.lesson,
          editionId: 'another-cmmc-edition',
        }),
      ).toBeUndefined()
      expect(
        findLearningActivity({ ...activity.lesson, frameworkId: 'other' }),
      ).toBeUndefined()
    }
  })

  it.each(levelOneLearningActivities)(
    'shows understandable draft source context and a text-equivalent diagram for $id',
    async (activity) => {
      const user = userEvent.setup()
      render(<LearningPractice lesson={activity.lesson} />)
      expect(screen.getByText(activity.plainEnglish!)).toBeVisible()
      expect(
        screen.getByText(activity.commonMisunderstanding!.correction),
      ).toBeVisible()
      const diagram = screen.getByRole('figure', {
        name: activity.diagram!.title,
      })
      expect(within(diagram).getByText('Diagram')).toBeVisible()
      expect(diagram).toHaveTextContent(activity.diagram!.textEquivalent)
      expect(within(diagram).getAllByRole('listitem')).toHaveLength(
        activity.diagram!.steps.length +
          (activity.diagram!.branches?.length ?? 0),
      )
      const source = screen.getByRole('link', {
        name: /CMMC Assessment Guide – Level 1/,
      })
      expect(source).toHaveAttribute('href', activity.teachingSource.url)
      expect(source).toHaveAttribute('rel', 'noopener noreferrer')
      await user.click(
        screen.getByText(`Fictional scenario: ${activity.scenarioTitle}`, {
          selector: 'summary',
        }),
      )
      for (const step of activity.scenario) {
        expect(screen.getByText(step.description)).toBeVisible()
      }
    },
  )

  it.each(levelOneLearningActivities)(
    'explains every answer and supports completion without a grade for $id',
    async (activity) => {
      const user = userEvent.setup()
      render(<LearningPractice lesson={activity.lesson} />)
      await user.click(
        screen.getByText('Check your understanding', { selector: 'summary' }),
      )
      for (const [questionIndex, question] of activity.questions.entries()) {
        expect(screen.getByText(question.prompt)).toBeVisible()
        for (const [choiceIndex, choice] of question.choices.entries()) {
          expect(
            screen.getByRole('button', { name: 'Check answer' }),
          ).toBeDisabled()
          await user.click(screen.getByRole('radio', { name: choice.label }))
          await user.click(screen.getByRole('button', { name: 'Check answer' }))
          const feedback = screen.getByRole('status', {
            name: 'Answer feedback',
          })
          expect(feedback).toHaveTextContent(choice.feedback)
          expect(feedback).toHaveTextContent(
            choice.id === question.correctChoiceId
              ? 'That’s right.'
              : 'Not quite.',
          )
          if (choiceIndex < question.choices.length - 1) {
            await user.click(screen.getByRole('button', { name: 'Try again' }))
            expect(screen.getByText(question.prompt)).toHaveFocus()
            expect(feedback).toBeEmptyDOMElement()
          }
        }
        await user.click(
          screen.getByRole('button', {
            name:
              questionIndex < activity.questions.length - 1
                ? 'Next question'
                : 'Finish practice',
          }),
        )
      }
      expect(
        screen.getByRole('heading', {
          name: 'Practice complete. Keep asking why.',
        }),
      ).toHaveFocus()
      expect(
        screen.getByText(/Revisit the activity as often as you need/),
      ).toBeVisible()
      expect(screen.queryByRole('radio')).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Practice again' }))
      expect(screen.getByText(activity.questions[0]!.prompt)).toHaveFocus()
      expect(
        screen.getByRole('button', { name: 'Check answer' }),
      ).toBeDisabled()
    },
  )

  it('preserves a selected answer for the same identity and resets between Level 1 lessons', async () => {
    const user = userEvent.setup()
    const first = levelOneLearningActivities[0]!
    const second = levelOneLearningActivities[1]!
    const { rerender } = render(<LearningPractice lesson={first.lesson} />)
    await user.click(
      screen.getByText('Check your understanding', { selector: 'summary' }),
    )
    await user.click(
      screen.getByRole('radio', {
        name: first.questions[0]!.choices[0]!.label,
      }),
    )
    rerender(<LearningPractice lesson={{ ...first.lesson }} />)
    expect(
      screen.getByRole('radio', {
        name: first.questions[0]!.choices[0]!.label,
      }),
    ).toBeChecked()
    rerender(<LearningPractice lesson={second.lesson} />)
    expect(screen.getByText(second.questions[0]!.prompt)).toBeVisible()
    expect(screen.getByRole('button', { name: 'Check answer' })).toBeDisabled()
    expect(
      screen
        .getAllByRole('radio')
        .every((radio) => !(radio as HTMLInputElement).checked),
    ).toBe(true)
    expect(
      screen.queryByText(first.questions[0]!.prompt),
    ).not.toBeInTheDocument()
  })
})
