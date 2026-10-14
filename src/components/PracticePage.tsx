import { ArrowUpRight } from 'lucide-react'
import { learningActivities } from '../data/learning'
import { controls, referenceControls } from '../data/content'
import { createLessonUrl } from '../state/explorer-state'
import './practice-page.css'
import { hasVisualExplanation } from '../data/visual-lesson-index'

/** An index of actual activities; never mount or track hidden lessons here. */
export default function PracticePage() {
  const params = new URLSearchParams(window.location.search)
  const query = params.get('q')?.trim() ?? ''
  const selectedLevel = params.get('level') ?? ''
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
    ...new Set(entries.map(({ control }) => control?.level).filter(Boolean)),
  ]
  const filtered = entries.filter(
    ({ activity, control }) =>
      (!selectedLevel || control?.level === selectedLevel) &&
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
        <button className="practice-action" type="submit">
          Find activities
        </button>
        {(query || selectedLevel) && (
          <a href="/practice" className="inline-action">
            Clear filters
          </a>
        )}
      </form>
      <p className="practice-result-count" role="status">
        {filtered.length} {filtered.length === 1 ? 'activity' : 'activities'}{' '}
        available
      </p>
      {filtered.length === 0 ? (
        <section className="practice-empty">
          <h2>No matching activities.</h2>
          <p>Try a broader topic or browse all available practice.</p>
          <a href="/practice" className="text-link">
            Browse all activities
          </a>
        </section>
      ) : (
        <ol className="practice-index">
          {filtered.map(({ activity, control }, index) => (
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
              </div>
            </li>
          ))}
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
