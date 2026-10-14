import { useEffect, useId, useRef, useState } from 'react'
import { CheckCircle2, Lightbulb } from 'lucide-react'
import { findLearningActivity } from '../data/learning'
import type { LessonIdentity } from '../types/content'
import type { LearningActivity } from '../types/learning'
import { trackUsage } from '../analytics/usage'
import { LessonDiagram } from './LessonDiagram'

interface LearningPracticeProps {
  lesson: LessonIdentity
}

function KnowledgeCheck({
  activity,
  lesson,
}: {
  activity: LearningActivity
  lesson: LessonIdentity
}) {
  const prefix = useId()
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [complete, setComplete] = useState(false)
  const prompt = useRef<HTMLSpanElement | null>(null)
  const completion = useRef<HTMLHeadingElement | null>(null)
  const focusRequested = useRef(false)
  const question = activity.questions[questionIndex]
  const selected = question?.choices.find((choice) => choice.id === selectedId)
  const correct = selectedId === question?.correctChoiceId

  useEffect(() => {
    if (focusRequested.current) {
      if (complete) completion.current?.focus()
      else prompt.current?.focus()
      focusRequested.current = false
    }
  }, [questionIndex, complete, checked])

  function reset() {
    trackUsage({ name: 'practice_action', lesson, action: 'reset' })
    focusRequested.current = true
    setSelectedId(null)
    setChecked(false)
    setQuestionIndex(0)
    setComplete(false)
    // Resetting an unanswered first question does not change the effect inputs.
    if (questionIndex === 0 && !checked && !complete) {
      prompt.current?.focus()
      focusRequested.current = false
    }
  }

  function nextQuestion() {
    if (!checked) return
    focusRequested.current = true
    if (questionIndex === activity.questions.length - 1) {
      trackUsage({ name: 'practice_action', lesson, action: 'complete' })
      setComplete(true)
    } else {
      trackUsage({ name: 'practice_action', lesson, action: 'next' })
      setQuestionIndex(questionIndex + 1)
      setSelectedId(null)
      setChecked(false)
    }
  }

  if (!question) return null

  return (
    <div className="knowledge-check">
      <progress
        className="practice-progress-meter"
        aria-label="Question position"
        aria-valuetext={
          complete
            ? 'Practice complete'
            : `Question ${questionIndex + 1} of ${activity.questions.length}`
        }
        value={complete ? activity.questions.length : questionIndex + 1}
        max={activity.questions.length}
      />
      {complete ? (
        <div className="practice-complete">
          <CheckCircle2 className="practice-complete-icon" aria-hidden="true" />
          <h5 ref={completion} tabIndex={-1}>
            Practice complete. Keep asking why.
          </h5>
          <p>
            You’ve explored this activity’s situations. Revisit the activity as
            often as you need. Finishing it does not measure compliance or
            assessment readiness.
          </p>
          <button className="practice-action" type="button" onClick={reset}>
            Practice again
          </button>
        </div>
      ) : (
        <>
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
                    onChange={() => setSelectedId(choice.id)}
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
                  trackUsage({
                    name: 'practice_action',
                    lesson,
                    action: 'check',
                  })
                  setChecked(true)
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
                  trackUsage({
                    name: 'practice_action',
                    lesson,
                    action: 'retry',
                  })
                  focusRequested.current = true
                  setSelectedId(null)
                  setChecked(false)
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

/** Learning state stays local and resets when its complete lesson identity changes. */
export function LearningPractice({ lesson }: LearningPracticeProps) {
  const prefix = useId()
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
          <h4 id={`${prefix}-heading`}>{activity.title}</h4>
        </div>
        <span className="draft-label">Draft learning activity</span>
      </div>
      <p className="practice-introduction">{activity.introduction}</p>
      {activity.plainEnglish && (
        <div className="learning-meaning teaching-note">
          <h5>The idea in plain English</h5>
          <p>{activity.plainEnglish}</p>
        </div>
      )}
      {activity.commonMisunderstanding && (
        <div className="learning-misunderstanding teaching-note">
          <h5>A common misunderstanding</h5>
          <p className="misconception-claim">
            <strong>{activity.commonMisunderstanding.claim}</strong>
          </p>
          <p>{activity.commonMisunderstanding.correction}</p>
        </div>
      )}
      {activity.diagram && <LessonDiagram diagram={activity.diagram} />}
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
              <h5>{step.title}</h5>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>
      </details>
      <details
        className="practice-disclosure practice-questions"
        onToggle={(event) => {
          if (event.currentTarget.open)
            trackUsage({ name: 'practice_action', lesson, action: 'open' })
        }}
      >
        <summary>Check your understanding</summary>
        <KnowledgeCheck key={activity.id} activity={activity} lesson={lesson} />
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
