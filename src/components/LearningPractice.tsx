import { useEffect, useId, useRef, useState } from 'react'
import { CheckCircle2, Lightbulb } from 'lucide-react'
import { findLearningActivity } from '../data/learning'
import type { LessonIdentity } from '../types/content'
import type { LearningActivity } from '../types/learning'
import { trackUsage } from '../analytics/usage'
import { LessonDiagram } from './LessonDiagram'
import { ContextTerms } from './ContextTerms'
import { glossaryTerms } from '../data/glossary'
import { useActivityProgress } from '../progress/useLocalProgress'
import { ActivityProgressTools } from '../progress/ActivityProgressTools'
import { cueDash } from './board/tray-state'

interface LearningPracticeProps {
  lesson: LessonIdentity
  /** The heading level under the surface this sits on (2 on the Board, 4 in the demo reader). */
  level?: 2 | 4
}

type PracticeLevel = 2 | 4
const headings = {
  2: { title: 'h2', section: 'h3', item: 'h4' },
  4: { title: 'h4', section: 'h5', item: 'h6' },
} as const

function AnswerReview({
  questions,
  answers,
  level,
}: {
  questions: LearningActivity['questions']
  answers: Readonly<Record<string, string>>
  level: PracticeLevel
}) {
  const Item = headings[level].item
  return (
    <ol>
      {questions.map((item) => {
        const answer = item.choices.find(
          (choice) => choice.id === answers[item.id],
        )
        const best = item.choices.find(
          (choice) => choice.id === item.correctChoiceId,
        )!
        return (
          <li key={item.id}>
            <Item>{item.prompt}</Item>
            <p className="small-label">
              {answer?.id === best.id ? 'Correct choice' : 'Worth another look'}
            </p>
            <p>
              <strong>Your last checked answer:</strong> {answer?.label}
            </p>
            {answer?.id !== best.id && <p>{answer?.feedback}</p>}
            <p>
              <strong>What to take away:</strong> {best.feedback}
            </p>
          </li>
        )
      })}
    </ol>
  )
}

function KnowledgeCheck({
  activity,
  lesson,
  level,
}: {
  activity: LearningActivity
  lesson: LessonIdentity
  level: PracticeLevel
}) {
  const prefix = useId()
  const Section = headings[level].section
  const progress = useActivityProgress(activity)
  const { entry, store, resetEpoch, questionIndex, checked } = progress
  const complete = entry.completed
  const answers = entry.checkedAnswers
  const [selection, setSelection] = useState<{
    questionId: string
    choiceId: string
    epoch: number
  } | null>(null)
  const selectedId = checked
    ? (answers[entry.currentQuestionId] ?? null)
    : selection?.questionId === entry.currentQuestionId &&
        selection.epoch === resetEpoch
      ? selection.choiceId
      : null
  const prompt = useRef<HTMLSpanElement | null>(null)
  const completion = useRef<HTMLHeadingElement | null>(null)
  const feedback = useRef<HTMLDivElement | null>(null)
  const focusRequested = useRef(false)
  const question = activity.questions[questionIndex]
  const selected = question?.choices.find((choice) => choice.id === selectedId)
  const correct = selectedId === question?.correctChoiceId

  useEffect(() => {
    if (focusRequested.current) {
      if (complete) completion.current?.focus()
      else if (checked) feedback.current?.focus()
      else prompt.current?.focus()
      focusRequested.current = false
    }
  }, [questionIndex, complete, checked])

  function reset() {
    focusRequested.current = true
    if (!store.restart(activity.id)) {
      focusRequested.current = false
      return
    }
    trackUsage({ name: 'practice_action', lesson, action: 'reset' })
    setSelection(null)
    // An unanswered first question may not change the effect's inputs.
    if (questionIndex === 0 && !checked && !complete) {
      prompt.current?.focus()
      focusRequested.current = false
    }
  }

  function nextQuestion() {
    if (!checked) return
    focusRequested.current = true
    if (!store.next(activity.id)) {
      focusRequested.current = false
      return
    }
    const finished = questionIndex === activity.questions.length - 1
    trackUsage({
      name: 'practice_action',
      lesson,
      action: finished ? 'complete' : 'next',
    })
    // Dot visits once, when the activity is finished here.
    if (finished) cueDash('dot')
    setSelection(null)
  }

  if (progress.mode === 'loading')
    return <p role="status">Restoring this browser’s practice setting…</p>

  if (!question) return null

  return (
    <div className="knowledge-check">
      <progress
        className="practice-progress-meter"
        aria-label="Questions reviewed"
        aria-valuetext={
          complete
            ? 'Practice complete'
            : `${Object.keys(answers).length} of ${activity.questions.length} questions reviewed`
        }
        value={Object.keys(answers).length}
        max={activity.questions.length}
      />
      {complete ? (
        <div className="practice-complete">
          <CheckCircle2 className="practice-complete-icon" aria-hidden="true" />
          <Section ref={completion} tabIndex={-1}>
            Practice complete. Keep asking why.
          </Section>
          <p>
            You’ve explored this activity’s situations. Revisit the activity as
            often as you need.
          </p>
          <details className="practice-disclosure practice-recap">
            <summary>Review the reasoning</summary>
            <AnswerReview
              questions={activity.questions}
              answers={answers}
              level={level}
            />
          </details>
          <button className="practice-action" type="button" onClick={reset}>
            Practice again
          </button>
          <p className="practice-context">
            <a href="/practice" className="text-link">
              Choose another situation
            </a>
          </p>
        </div>
      ) : (
        <>
          {questionIndex > 0 && (
            <details className="practice-disclosure practice-recap">
              <summary>Review earlier answers</summary>
              <AnswerReview
                questions={activity.questions.slice(0, questionIndex)}
                answers={answers}
                level={level}
              />
            </details>
          )}
          <fieldset className="practice-question" disabled={checked}>
            <legend>
              <span className="practice-progress">
                Question {questionIndex + 1} of {activity.questions.length}
              </span>
              <span className="practice-prompt" ref={prompt} tabIndex={-1}>
                {question.prompt}
              </span>
            </legend>
            <div className="practice-choices">
              {question.choices.map((choice, index) => (
                <label
                  className="practice-choice"
                  key={choice.id}
                  data-selected={selectedId === choice.id}
                  data-answer-state={
                    checked && selectedId === choice.id
                      ? correct
                        ? 'correct'
                        : 'incorrect'
                      : undefined
                  }
                >
                  <input
                    type="radio"
                    name={`${prefix}-${question.id}`}
                    value={choice.id}
                    checked={selectedId === choice.id}
                    onChange={() =>
                      setSelection({
                        questionId: question.id,
                        choiceId: choice.id,
                        epoch: resetEpoch,
                      })
                    }
                  />
                  <span className="practice-choice-letter" aria-hidden="true">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="practice-choice-text">{choice.label}</span>
                  {selectedId === choice.id && (
                    <span
                      className="practice-choice-selected"
                      aria-hidden="true"
                    >
                      Selected
                    </span>
                  )}
                </label>
              ))}
            </div>
          </fieldset>
          <div
            className="practice-feedback"
            data-outcome={
              checked ? (correct ? 'correct' : 'incorrect') : undefined
            }
            role="status"
            ref={feedback}
            tabIndex={-1}
            aria-label="Answer feedback"
            aria-live="polite"
            aria-atomic="true"
          >
            {checked && selected && (
              <>
                <div className="practice-feedback-heading">
                  {correct ? (
                    <CheckCircle2 size={22} aria-hidden="true" />
                  ) : (
                    <Lightbulb size={22} aria-hidden="true" />
                  )}
                  <strong>{correct ? 'That’s right.' : 'Not quite.'}</strong>
                </div>
                <p className="practice-answer-recap">
                  <strong>Your answer:</strong> {selected.label}
                </p>
                <p>{selected.feedback}</p>
              </>
            )}
          </div>
          <div className="practice-actions">
            <button
              className="practice-action"
              type="button"
              disabled={!selected || checked}
              onClick={() => {
                if (selected) {
                  focusRequested.current = true
                  if (
                    store.checkAnswer(activity.id, question.id, selected.id)
                  ) {
                    trackUsage({
                      name: 'practice_action',
                      lesson,
                      action: 'check',
                    })
                  } else focusRequested.current = false
                }
              }}
            >
              Check answer
            </button>
            {checked && (
              <button
                className="practice-action practice-secondary"
                type="button"
                onClick={() => {
                  focusRequested.current = true
                  if (store.retry(activity.id)) {
                    trackUsage({
                      name: 'practice_action',
                      lesson,
                      action: 'retry',
                    })
                    setSelection(null)
                  } else focusRequested.current = false
                }}
              >
                Try again
              </button>
            )}
            <button
              className="practice-action practice-secondary"
              type="button"
              disabled={!checked}
              onClick={nextQuestion}
            >
              {questionIndex === activity.questions.length - 1
                ? 'Finish practice'
                : 'Next question'}
            </button>
            {questionIndex > 0 && (
              <button
                className="practice-action practice-secondary"
                type="button"
                onClick={reset}
              >
                Start over
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

/** Exact-identity practice; optional version-bound saving is owned by the local provider. */
export function LearningPractice({ lesson, level = 2 }: LearningPracticeProps) {
  const Title = headings[level].title
  const Section = headings[level].section
  const prefix = useId()
  const questions = useRef<HTMLDetailsElement | null>(null)
  const activity = findLearningActivity(lesson)
  if (!activity) return null

  return (
    <section
      className="learning-practice"
      aria-labelledby={`${prefix}-heading`}
    >
      <div className="practice-heading">
        <div className="practice-heading-copy">
          <p className="instruction-eyebrow">Put it into practice</p>
          <Title id={`${prefix}-heading`}>{activity.title}</Title>
        </div>
        <span className="draft-label">Practice activity</span>
      </div>
      <p className="practice-introduction">{activity.introduction}</p>
      {activity.learningObjective && (
        <p className="practice-goal">
          <strong>Your aim:</strong> {activity.learningObjective}
        </p>
      )}
      <div className="practice-start">
        <p>
          {activity.questions.length} questions · Go at your own pace.
          <br />
          Read the situation, choose an answer, then explore why. You can retry
          any question.
        </p>
        <button
          type="button"
          className="practice-action"
          onClick={() => {
            if (!questions.current) return
            questions.current.open = true
            questions.current
              .querySelector<HTMLElement>(
                '.practice-complete h3, .practice-complete h5, .practice-feedback[data-outcome], .practice-prompt',
              )
              ?.focus()
          }}
        >
          Start or return to questions
        </button>
      </div>
      <ActivityProgressTools activity={activity} />
      {activity.plainEnglish && (
        <div className="learning-meaning teaching-note">
          <Section>The idea in plain English</Section>
          <p>{activity.plainEnglish}</p>
        </div>
      )}
      {activity.commonMisunderstanding && (
        <div className="learning-misunderstanding teaching-note">
          <Section>A common misunderstanding</Section>
          <p className="misconception-claim">
            <strong>{activity.commonMisunderstanding.claim}</strong>
          </p>
          <p>{activity.commonMisunderstanding.correction}</p>
        </div>
      )}
      {activity.diagram && (
        <LessonDiagram diagram={activity.diagram} level={level === 2 ? 3 : 5} />
      )}
      {activity.glossaryTermIds && (
        <ContextTerms
          termIds={activity.glossaryTermIds}
          terms={glossaryTerms}
          level={level === 2 ? 3 : 5}
        />
      )}
      <details
        className="practice-disclosure practice-scenario"
        onToggle={(event) => {
          if (event.currentTarget.open)
            trackUsage({ name: 'practice_action', lesson, action: 'open' })
        }}
      >
        <summary>Fictional scenario: {activity.scenarioTitle}</summary>
        <ol className="scenario-flow">
          {activity.scenario.map((step) => (
            <li key={step.id}>
              <Section>{step.title}</Section>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </details>
      <details
        className="practice-disclosure practice-questions"
        ref={questions}
        onToggle={(event) => {
          if (event.currentTarget.open)
            trackUsage({ name: 'practice_action', lesson, action: 'open' })
        }}
      >
        <summary>Check your understanding</summary>
        <KnowledgeCheck
          key={activity.id}
          activity={activity}
          lesson={lesson}
          level={level}
        />
      </details>
      <p className="practice-context">{activity.disclaimer}</p>
      <p className="practice-source">
        Teaching basis:{' '}
        <a
          href={activity.teachingSource.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {activity.teachingSource.kind === 'project-readme'
            ? 'README simplified example'
            : activity.teachingSource.title}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </p>
    </section>
  )
}
