import { useRef } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { learningActivities } from '../data/learning'
import { controls, referenceControls } from '../data/content'
import { createLessonUrl } from '../state/explorer-state'
import './practice-page.css'
import { hasVisualExplanation } from '../data/visual-lesson-index'
import { useLocalProgress } from '../progress/useLocalProgress'
import { ProgressPreferences } from '../progress/ProgressPreferences'
import { questionsToRevisit } from '../progress/model'

/** An index of actual activities; never mount or track hidden lessons here. */
export default function PracticePage() {
  const results = useRef<HTMLParagraphElement>(null)
  const { entries: progress, mode, store } = useLocalProgress()
  const params = new URLSearchParams(window.location.search)
  const query = params.get('q')?.trim() ?? ''
  const selectedLevel = params.get('level') ?? ''
  const selectedStatus = params.get('status') ?? ''
  const statusOptions = [
    ['continue', 'Continue learning'],
    ['revisit', 'Marked to revisit'],
    ['completed', 'Completed activities'],
    ['review', 'Answers to revisit'],
  ]
  function matchesStatus(activity: (typeof learningActivities)[number]) {
    const saved = progress[activity.id]
    if (!selectedStatus) return true
    if (!saved) return false
    if (selectedStatus === 'continue') return saved.visited && !saved.completed
    if (selectedStatus === 'revisit') return saved.revisit
    if (selectedStatus === 'completed') return saved.completed
    if (selectedStatus === 'review')
      return questionsToRevisit(activity, saved).length > 0
    return false
  }
  const entries = learningActivities.map((activity) => ({
    activity,
    control: [...controls, ...referenceControls].find(
      (control) =>
        control.frameworkId === activity.lesson.frameworkId &&
        control.editionId === activity.lesson.editionId &&
        control.key === activity.lesson.controlKey,
    ),
  }))
  const levels = [
    ...new Set(
      entries
        .filter(({ control }) => control?.contentKind !== 'educational-example')
        .map(({ control }) => control?.level)
        .filter(Boolean),
    ),
  ]
  const filtered = entries.filter(
    ({ activity, control }) =>
      (!selectedLevel ||
        (control?.contentKind !== 'educational-example' &&
          control?.level === selectedLevel)) &&
      matchesStatus(activity) &&
      `${activity.title} ${activity.introduction} ${activity.learningObjective ?? ''} ${activity.plainEnglish ?? ''} ${control?.id ?? ''} ${control?.title ?? ''}`
        .toLocaleLowerCase()
        .includes(query.toLocaleLowerCase()),
  )
  return (
    <div className="practice-page section-shell">
      <header className="practice-page-intro">
        <p className="instruction-eyebrow">The practice room</p>
        <h1>Work through a situation.</h1>
        <p>
          Make a decision. Explore the reasoning. Try again.
          <br />
          Short, fictional exercises with the source close at hand.
        </p>
        <p className="practice-context">
          Educational drafts awaiting qualified human review. Finishing an
          activity does not establish compliance or assessment readiness.
        </p>
      </header>
      <ProgressPreferences />
      <form
        method="get"
        action="/practice"
        className="practice-filters"
        role="search"
        aria-label="Find a practice activity"
      >
        <label>
          Search activities
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="A situation, topic or control ID"
            autoComplete="off"
          />
        </label>
        <label>
          Level
          <select name="level" defaultValue={selectedLevel}>
            <option value="">All levels</option>
            {levels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
            {selectedLevel && !levels.includes(selectedLevel) && (
              <option value={selectedLevel}>Unavailable level</option>
            )}
          </select>
        </label>
        <label>
          Learning status
          <select
            name="status"
            defaultValue={selectedStatus}
            disabled={mode !== 'on'}
          >
            <option value="">All activities</option>
            {statusOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
            {selectedStatus &&
              !statusOptions.some(([value]) => value === selectedStatus) && (
                <option value={selectedStatus}>Unavailable status</option>
              )}
          </select>
        </label>
        <button className="practice-action" type="submit">
          Find activities
        </button>
        {(query || selectedLevel || selectedStatus) && (
          <a href="/practice" className="inline-action">
            Clear filters
          </a>
        )}
      </form>
      {mode !== 'on' && (
        <p className="practice-context">
          Status filters need saving to be available and turned on above.
          Changing filters or leaving this page clears unsaved marks.
        </p>
      )}
      <p
        ref={results}
        tabIndex={-1}
        className="practice-result-count"
        role="status"
        aria-label="Activity results"
      >
        {filtered.length} {filtered.length === 1 ? 'activity' : 'activities'}{' '}
        available
      </p>
      {filtered.length === 0 ? (
        <section className="practice-empty">
          <h2>No matching activities.</h2>
          <p>
            {selectedStatus
              ? 'Your current learning record has no matches for these filters. Start any activity or clear the filters.'
              : 'Try a broader topic or browse all available practice.'}
          </p>
          <a href="/practice" className="text-link">
            Browse all activities
          </a>
        </section>
      ) : (
        <ol className="practice-index">
          {filtered.map(({ activity, control }, index) => {
            const saved = progress[activity.id]
            const destination = createLessonUrl(
              activity.lesson,
              'beginner',
              new URL('/learn', window.location.origin),
            )
            const checkedCount = Object.keys(saved?.checkedAnswers ?? {}).length
            const reviewCount = saved
              ? questionsToRevisit(activity, saved).length
              : 0
            return (
              <li key={activity.id}>
                <span className="practice-index-number" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="instruction-eyebrow">
                    {control?.contentKind === 'educational-example'
                      ? 'Project example'
                      : control?.level}{' '}
                    · {activity.questions.length} questions · Draft
                    {hasVisualExplanation(activity.lesson) &&
                      ' · 40-second visual'}
                  </p>
                  <h2>
                    <a
                      href={createLessonUrl(
                        activity.lesson,
                        'beginner',
                        new URL('/learn', window.location.origin),
                      )}
                    >
                      {activity.title}
                      <ArrowUpRight size={20} aria-hidden="true" />
                    </a>
                  </h2>
                  <p>{activity.learningObjective ?? activity.introduction}</p>
                  <code>{control?.id}</code>
                  <div className="practice-row-actions">
                    <a className="inline-action" href={destination}>
                      {saved?.completed
                        ? 'Review reasoning'
                        : checkedCount
                          ? 'Continue questions'
                          : 'Start questions'}
                      <span className="sr-only">: {activity.title}</span>
                    </a>
                    <button
                      className="inline-action"
                      type="button"
                      aria-pressed={saved?.revisit ?? false}
                      aria-label={`Revisit later: ${activity.title}`}
                      disabled={mode === 'loading'}
                      onClick={() => {
                        if (
                          store.markRevisit(activity.id, !saved?.revisit) &&
                          selectedStatus === 'revisit' &&
                          saved?.revisit
                        )
                          results.current?.focus()
                      }}
                    >
                      {saved?.revisit ? 'Marked to revisit' : 'Revisit later'}
                    </button>
                  </div>
                  {saved?.visited && (
                    <p className="practice-row-status">
                      {saved.completed
                        ? 'Practice complete'
                        : checkedCount
                          ? `${checkedCount} of ${activity.questions.length} answers checked`
                          : 'Visited · Questions not started'}
                      {reviewCount > 0 &&
                        ` · ${reviewCount} ${reviewCount === 1 ? 'answer' : 'answers'} worth another look`}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      )}
      <p className="practice-library-note">
        Looking for the full requirement?{' '}
        <a href="/learn?view=discover&collection=references">
          Browse all controls and sources.
        </a>
      </p>
    </div>
  )
}
