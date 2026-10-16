import { Fragment, useEffect, useRef, useState, type MouseEvent } from 'react'
import { learningActivities } from '../data/learning'
import { controls, referenceControls } from '../data/content'
import { createLessonUrl } from '../state/explorer-state'
import './practice-page.css'
import { hasVisualExplanation } from '../data/visual-lesson-index'
import {
  useActivityProgress,
  useLocalProgress,
} from '../progress/useLocalProgress'
import { readChalkPreference } from '../state/chalk-preference'
import { trackUsage } from '../analytics/usage'
import type { CatalogControl } from '../types/content'
import type { LearningActivity } from '../types/learning'
import { cueSmudge } from './board/tray-state'
import { useDesktop } from './controls/useDesktop'
import { announceAddress } from '../state/address'
import { plainClick } from './families'
import { capitalize, numberWord } from '../data/number-words'

interface Situation {
  readonly activity: LearningActivity
  readonly control: CatalogControl
  /** The activity's title without its "Practice:" prefix. */
  readonly title: string
}

function situationTitle(activity: LearningActivity): string {
  const bare = activity.title.replace(/^Practice:\s*/, '')
  return bare.charAt(0).toLocaleUpperCase('en-US') + bare.slice(1)
}

function controlOf(activity: LearningActivity): CatalogControl {
  const control = [...controls, ...referenceControls].find(
    (item) =>
      item.frameworkId === activity.lesson.frameworkId &&
      item.editionId === activity.lesson.editionId &&
      item.key === activity.lesson.controlKey,
  )
  if (!control)
    throw new Error(`Practice activity ${activity.id} names no known control`)
  return control
}

/** Where a situation sits: the catalog's order; the project's example by its control's ID. */
function catalogOrder(control: CatalogControl): number {
  const at = referenceControls.findIndex(
    (item) => item === control || item.id === control.id,
  )
  return at >= 0 ? at : referenceControls.length
}

/** The thirteen situations in the catalog's order. */
const situations: readonly Situation[] = learningActivities
  .map((activity) => ({
    activity,
    control: controlOf(activity),
    title: situationTitle(activity),
  }))
  .sort(
    (left, right) => catalogOrder(left.control) - catalogOrder(right.control),
  )

const levelChoices = [
  ['', 'All'],
  ['Level 1', '1'],
  ['Level 2', '2'],
  ['Level 3', '3'],
] as const

function matches(situation: Situation, query: string): boolean {
  const { activity, control } = situation
  return `${situation.title} ${activity.introduction} ${activity.learningObjective ?? ''} ${activity.plainEnglish ?? ''} ${control.id} ${control.title}`
    .toLocaleLowerCase('en-US')
    .includes(query.trim().toLocaleLowerCase('en-US'))
}

/**
 * Practice runs in place (mockups/2026-10-15/Practice.html): the situations
 * on the left, the one picked running on the right. The situation and the
 * question live in the address (?activity=, ?q=); the level keeps its
 * parameter; typing a search never touches history. On a phone the list
 * comes first and a situation opens full width with a way back.
 */
export default function PracticePage() {
  const desktop = useDesktop()
  const { mode, store, entries, discarded, deletionUnconfirmed } =
    useLocalProgress()
  const [address, setAddress] = useState(() => window.location.search)
  // A pick from the list asks the situation's title for focus; history
  // travel never does.
  const [titleFocus, setTitleFocus] = useState(0)
  useEffect(() => {
    const sync = () => {
      setAddress(window.location.search)
      setTitleFocus(0)
    }
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])
  const params = new URLSearchParams(address)
  const activityId = params.get('activity')
  const level = params.get('level') ?? ''
  // An older index link carried its search as q; with a situation open, q is
  // the question. Either way the search itself never enters history.
  const [query, setQuery] = useState(() =>
    new URLSearchParams(window.location.search).get('activity')
      ? ''
      : (new URLSearchParams(window.location.search).get('q') ?? ''),
  )
  const [hideFinished, setHideFinished] = useState(false)
  const list = useRef<HTMLElement>(null)

  // The level switch is CMMC's; the project's example is no Level 2 control.
  const atLevel = (situation: Situation) =>
    !level ||
    (situation.control.contentKind !== 'educational-example' &&
      situation.control.level === level)
  const listed = situations.filter(
    (situation) =>
      atLevel(situation) &&
      matches(situation, query) &&
      !(
        hideFinished &&
        mode === 'on' &&
        entries[situation.activity.id]?.completed
      ),
  )
  const chosen = activityId
    ? (situations.find((item) => item.activity.id === activityId) ?? null)
    : null
  const unknown = activityId !== null && chosen === null
  // With nothing chosen a desktop runs the first situation at the level in
  // force; typing and hiding never swap it. A phone shows the list.
  const first = situations.find(atLevel) ?? situations[0]!
  const current = chosen ?? (desktop && activityId === null ? first : null)
  const showRun = current !== null && (desktop || activityId !== null)
  const showList = desktop || !showRun

  function searchFor(next: {
    activity?: string | null
    level?: string
    q?: number | null
  }) {
    const out = new URLSearchParams()
    const activity = next.activity === undefined ? activityId : next.activity
    const atLevel = next.level === undefined ? level : next.level
    if (activity) out.set('activity', activity)
    if (atLevel) out.set('level', atLevel)
    if (activity && next.q) out.set('q', String(next.q))
    const search = out.toString()
    return search ? `?${search}` : ''
  }
  function go(search: string) {
    window.history.pushState(null, '', `/practice${search}`)
    announceAddress()
    setAddress(search)
  }
  function follow(search: string, focus?: () => void) {
    return (event: MouseEvent<HTMLAnchorElement>) => {
      if (!plainClick(event)) return
      event.preventDefault()
      go(search)
      focus?.()
    }
  }
  const chalk = readChalkPreference() ?? 'beginner'
  const noteFor =
    mode === 'browser-preference'
      ? 'Your browser’s privacy signal keeps it off.'
      : mode === 'unavailable'
        ? 'Browser storage is unavailable here; practice stays on this page.'
        : mode === 'on'
          ? 'Kept in this browser only, never sent; turning it off deletes it.'
          : ''

  return (
    <div className={`practice-page ${showList ? '' : 'is-running'}`}>
      {showList && (
        <section
          className="practice-nav"
          aria-labelledby="practice-heading"
          ref={list}
          tabIndex={-1}
        >
          <h1 id="practice-heading" className="chalk">
            Work through a situation.
          </h1>
          <p className="practice-lead">
            {capitalize(numberWord(situations.length))} short, fictional
            situations. Pick one; it runs right here.
          </p>
          <form
            className="practice-find"
            role="search"
            aria-label="Find a situation"
            onSubmit={(event) => event.preventDefault()}
          >
            <label htmlFor="practice-q" className="sr-only">
              Find a situation
            </label>
            <span className="practice-find-line">
              <input
                id="practice-q"
                type="search"
                value={query}
                placeholder="A topic or control ID"
                autoComplete="off"
                onChange={(event) => setQuery(event.target.value)}
              />
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
                className="chalk"
              >
                <path d="M4 12.5c5-1 10-1 15 0M14 7l5 5.5-5 5" />
              </svg>
            </span>
            <svg
              className="practice-underline chalk"
              viewBox="0 0 330 8"
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M2 5c110-3 220-1 326-2" />
            </svg>
          </form>
          <div className="practice-levels" role="group" aria-label="Level">
            <span className="practice-levels-label">Level</span>
            {levelChoices.map(([value, label]) => (
              <a
                key={label}
                href={`/practice${searchFor({ level: value })}`}
                aria-current={level === value ? 'true' : undefined}
                onClick={follow(searchFor({ level: value }))}
              >
                {label}
                <svg
                  className="practice-stroke chalk"
                  viewBox="0 0 22 5"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M1 3c7-2 14 0 20-1" />
                </svg>
              </a>
            ))}
          </div>
          <p
            className="practice-count"
            role="status"
            aria-label="Situation results"
          >
            {listed.length === situations.length
              ? `${listed.length} situations`
              : `${listed.length} of ${situations.length} situations`}
          </p>
          <nav className="practice-list" aria-label="Practice situations">
            {listed.length ? (
              <ol>
                {listed.map((situation) => {
                  const search = searchFor({
                    activity: situation.activity.id,
                    q: null,
                  })
                  const finished = Boolean(
                    mode === 'on' && entries[situation.activity.id]?.completed,
                  )
                  return (
                    <li key={situation.activity.id}>
                      <a
                        className="practice-situation"
                        href={`/practice${search}`}
                        aria-current={
                          current?.activity.id === situation.activity.id
                            ? 'page'
                            : undefined
                        }
                        onClick={(event) => {
                          if (!plainClick(event)) return
                          event.preventDefault()
                          setTitleFocus((count) => count + 1)
                          go(search)
                        }}
                      >
                        <span className="practice-situation-title">
                          {situation.title}
                          {finished && (
                            <span className="sr-only"> (finished)</span>
                          )}
                        </span>{' '}
                        <span className="practice-situation-id mono">
                          {situation.control.id}
                        </span>
                      </a>
                    </li>
                  )
                })}
              </ol>
            ) : (
              <div className="practice-empty">
                <p className="chalk">No matching situations.</p>
                <button
                  type="button"
                  className="practice-show-all"
                  onClick={() => {
                    setQuery('')
                    setHideFinished(false)
                    if (level) go(searchFor({ level: '' }))
                  }}
                >
                  Show every situation
                </button>
              </div>
            )}
          </nav>
          <div className="practice-keep">
            <button
              type="button"
              className="practice-keep-switch"
              aria-pressed={mode === 'on'}
              disabled={mode === 'loading' || mode === 'browser-preference'}
              onClick={() => {
                if (mode === 'on') store.deleteAndDisable()
                else store.enable()
              }}
            >
              Keep my progress on this browser:{' '}
              <span className="practice-keep-state">
                {mode === 'on' ? 'on' : 'off'}
              </span>
            </button>
            {mode === 'on' && (
              <label className="practice-hide">
                <input
                  type="checkbox"
                  checked={hideFinished}
                  onChange={(event) => setHideFinished(event.target.checked)}
                />
                Hide finished
              </label>
            )}
            <p className="practice-keep-note" role="status">
              {noteFor}
              {discarded &&
                ' Some saved practice was reset after a content change.'}
              {deletionUnconfirmed &&
                ' The browser did not confirm deleting the saved practice.'}
            </p>
          </div>
        </section>
      )}
      {showRun && current && (
        <PracticeRun
          key={current.activity.id}
          situation={current}
          requested={Number(params.get('q') ?? '')}
          chalk={chalk}
          titleFocus={titleFocus}
          heading={showList ? 'h2' : 'h1'}
          back={
            desktop
              ? undefined
              : {
                  href: `/practice${searchFor({ activity: null })}`,
                  onClick: (event) => {
                    if (!plainClick(event)) return
                    event.preventDefault()
                    go(searchFor({ activity: null }))
                    // The list is back on its next paint; read it from the top.
                    window.setTimeout(() => list.current?.focus(), 0)
                  },
                }
          }
          onQuestion={(q, from) => {
            // The entry left behind names the question it showed, so Back
            // returns to it even from the plain address.
            const here = searchFor({ activity: current.activity.id, q: from })
            if (window.location.search !== here) {
              window.history.replaceState(null, '', `/practice${here}`)
              announceAddress()
            }
            go(searchFor({ activity: current.activity.id, q }))
          }}
        />
      )}
      {unknown && (
        <p className="practice-unknown" role="status">
          That situation isn’t here. Pick one from the list.
        </p>
      )}
    </div>
  )
}

function PracticeRun({
  situation,
  requested,
  chalk,
  titleFocus,
  heading: Title,
  back,
  onQuestion,
}: {
  readonly situation: Situation
  /** The question the address asks for, 1-based; NaN when it names none. */
  readonly requested: number
  readonly chalk: 'beginner' | 'it-cyber' | 'compliance'
  /** Counts the picks from the list; each one moves focus to the title. */
  readonly titleFocus: number
  /** The page's h1 when the situation stands alone; an h2 beside the list. */
  readonly heading: 'h1' | 'h2'
  readonly back?: {
    readonly href: string
    readonly onClick: (event: MouseEvent<HTMLAnchorElement>) => void
  }
  readonly onQuestion: (q: number, from: number) => void
}) {
  const { activity, control } = situation
  const { lesson } = activity
  const { entry, store, mode, questionIndex } = useActivityProgress(activity)
  const title = useRef<HTMLHeadingElement>(null)
  const prompt = useRef<HTMLParagraphElement>(null)
  const feedback = useRef<HTMLDivElement>(null)
  const done = useRef<HTMLParagraphElement>(null)
  const focusNext = useRef<'prompt' | 'feedback' | 'done' | null>(null)
  // The mix-up's heading sits one level under the title.
  const Sub = Title === 'h1' ? 'h2' : 'h3'

  useEffect(() => {
    if (mode !== 'loading') store.visit(activity.id)
  }, [mode, store, activity.id])
  useEffect(() => {
    if (titleFocus > 0) title.current?.focus()
  }, [titleFocus])

  const last = activity.questions.length - 1
  // The store knows the question in hand; the address may look back at an
  // answered one, never ahead.
  const position = questionIndex < 0 ? 0 : questionIndex
  const wanted =
    Number.isInteger(requested) && requested >= 1 ? requested - 1 : position
  const shown = Math.min(wanted, position, last)
  const question = activity.questions[shown]!
  const answerId = entry.checkedAnswers[question.id]
  const answered = answerId !== undefined
  const live = shown === position && !entry.completed && !answered
  const picked = question.choices.find((choice) => choice.id === answerId)
  const correct = answerId === question.correctChoiceId
  const anyAnswered = Object.keys(entry.checkedAnswers).length > 0

  useEffect(() => {
    if (focusNext.current === 'prompt') prompt.current?.focus()
    if (focusNext.current === 'feedback') feedback.current?.focus()
    if (focusNext.current === 'done') done.current?.focus()
    focusNext.current = null
  }, [shown, answered, entry.completed])

  function choose(choiceId: string) {
    if (!live) return
    if (!store.checkAnswer(activity.id, question.id, choiceId)) return
    trackUsage({ name: 'practice_action', lesson, action: 'check' })
    // A right answer gets a sneeze of dust from the tray.
    if (choiceId === question.correctChoiceId) cueSmudge('sneeze')
    focusNext.current = 'feedback'
  }
  function next() {
    if (shown < position) {
      focusNext.current = 'prompt'
      onQuestion(shown + 2, shown + 1)
      return
    }
    if (!answered) return
    if (!store.next(activity.id)) return
    trackUsage({
      name: 'practice_action',
      lesson,
      action: shown === last ? 'complete' : 'next',
    })
    if (shown < last) {
      focusNext.current = 'prompt'
      onQuestion(shown + 2, shown + 1)
    } else focusNext.current = 'done'
  }
  function again() {
    if (!store.restart(activity.id)) return
    trackUsage({ name: 'practice_action', lesson, action: 'reset' })
    focusNext.current = 'prompt'
    onQuestion(1, shown + 1)
  }

  const readUrl = createLessonUrl(
    lesson,
    chalk,
    new URL('/learn', window.location.origin),
  ).replace(window.location.origin, '')
  const watchUrl = createLessonUrl(
    lesson,
    chalk,
    new URL('/learn', window.location.origin),
    'practice',
  ).replace(window.location.origin, '')
  const count = activity.questions.length

  return (
    <article
      className="practice-run"
      aria-labelledby="practice-title"
      data-scroller=""
    >
      {back && (
        <a className="practice-back" href={back.href} onClick={back.onClick}>
          ← All situations
        </a>
      )}
      <div className="practice-run-head">
        <span className="practice-run-id mono">{control?.id ?? 'Example'}</span>
        <span className="practice-run-level">
          {control?.contentKind === 'educational-example'
            ? 'Project example'
            : control?.level}
          {control ? ` · ${control.title}` : ''}
        </span>
        <span className="practice-run-progress">
          Question {shown + 1} of {count}
          <svg
            className="practice-run-dashes chalk"
            viewBox={`0 0 ${count * 30 - 6} 8`}
            aria-hidden="true"
            focusable="false"
          >
            {activity.questions.map((item, index) => (
              <rect
                key={item.id}
                x={index * 30}
                y="2"
                width="24"
                height="4"
                rx="2"
                className={
                  index === shown
                    ? 'is-current'
                    : entry.checkedAnswers[item.id]
                      ? 'is-done'
                      : undefined
                }
              />
            ))}
          </svg>
        </span>
      </div>
      <Title
        id="practice-title"
        className="practice-run-title hand chalk"
        tabIndex={-1}
        ref={title}
      >
        {situation.title}
      </Title>
      <p className="practice-run-intro">
        <span className="practice-run-scenario hand">
          {activity.scenarioTitle}
        </span>{' '}
        {activity.introduction}
      </p>
      <div className="practice-run-body">
        {/* The situation's steps, from the activity itself: the prompts refer
            to them. A panel beside the question where the column is wide,
            under it where it is not; on a phone a disclosure that starts
            open. */}
        {Title === 'h2' ? (
          <aside
            className="practice-scene"
            aria-labelledby="practice-scene-heading"
          >
            <Sub id="practice-scene-heading" className="hand">
              The situation
            </Sub>
            <SituationSteps activity={activity} />
          </aside>
        ) : (
          <details className="practice-scene" open>
            <summary>
              <Sub id="practice-scene-heading" className="hand">
                The situation
              </Sub>
            </summary>
            <SituationSteps activity={activity} />
          </details>
        )}
        <div className="practice-run-flow">
          <p className="practice-run-prompt" ref={prompt} tabIndex={-1}>
            {question.prompt}
          </p>
          <div
            className="practice-run-choices"
            role="group"
            aria-label={`Question ${shown + 1} of ${count}`}
          >
            {question.choices.map((choice) => {
              const selected = choice.id === answerId
              return (
                <Fragment key={choice.id}>
                  <button
                    type="button"
                    className="practice-run-choice"
                    aria-pressed={selected}
                    disabled={answered && !selected}
                    onClick={() => choose(choice.id)}
                  >
                    <svg
                      className="practice-run-mark chalk"
                      viewBox="0 0 26 26"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path
                        className="practice-run-ring"
                        d="M13 3c6 0 10 4 10 10s-4 10-10 10S3 19 3 13 7 3 13 3z"
                      />
                      {selected && (
                        <path
                          className="practice-run-tick"
                          d="M8 13.5l3.5 3.5L19 9"
                        />
                      )}
                    </svg>
                    <span className="practice-run-choice-text">
                      {choice.label}
                    </span>
                  </button>
                  {selected && picked && (
                    <div
                      className="practice-run-feedback"
                      role="status"
                      tabIndex={-1}
                      ref={feedback}
                      data-outcome={correct ? 'correct' : 'incorrect'}
                    >
                      <p>
                        <strong>
                          {correct ? 'That’s right.' : 'Not quite.'}
                        </strong>{' '}
                        {picked.feedback}
                      </p>
                    </div>
                  )}
                </Fragment>
              )
            })}
          </div>
          {entry.completed && (
            <p className="practice-run-done" ref={done} tabIndex={-1}>
              Practice complete. Keep asking why.
            </p>
          )}
          {answered && (
            <div className="practice-run-actions">
              {entry.completed ? (
                <button
                  type="button"
                  className="practice-run-next"
                  onClick={again}
                >
                  Practice again
                </button>
              ) : (
                <button
                  type="button"
                  className="practice-run-next"
                  onClick={next}
                >
                  {shown === last && shown === position ? (
                    'Finish practice'
                  ) : (
                    <>
                      Next question <span aria-hidden="true">→</span>
                    </>
                  )}
                </button>
              )}
              <a href={readUrl}>Read the requirement</a>
              {hasVisualExplanation(lesson) && (
                <a href={watchUrl}>Watch the 40-second chalk talk</a>
              )}
            </div>
          )}
        </div>
        {anyAnswered && activity.commonMisunderstanding && (
          <div className="practice-run-mixup">
            <Sub className="hand">A common mix-up</Sub>
            <p className="practice-run-claim">
              <s>{activity.commonMisunderstanding.claim}</s>
            </p>
            <p className="practice-run-correction">
              {activity.commonMisunderstanding.correction}
            </p>
          </div>
        )}
        <p className="practice-run-note">
          {activity.disclaimer} Teaching basis:{' '}
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
      </div>
    </article>
  )
}

/** The scenario's steps, each its title and what happens, compact. */
function SituationSteps({ activity }: { readonly activity: LearningActivity }) {
  return (
    <ol className="practice-scene-steps">
      {activity.scenario.map((step) => (
        <li key={step.id}>
          <span className="practice-scene-step">{step.title}.</span>{' '}
          {step.description}
        </li>
      ))}
    </ol>
  )
}
