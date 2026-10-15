import { ArrowRight, ArrowUpRight, Search } from 'lucide-react'
import { referenceControls, defaultLesson } from '../data/content'
import { findLearningActivity } from '../data/learning'
import {
  createLessonUrl,
  serializeExplorerSearch,
} from '../state/explorer-state'
import { trackUsage } from '../analytics/usage'
import type { LessonIdentity } from '../types/content'
import {
  findControlAction,
  findControlFields,
  reportFindControl,
} from './board/find-control'

const starts = [
  {
    key: 'ac-l1-b-1-i',
    title: 'Who and what can connect?',
    description: 'Separate a working login from permission to use it.',
    topic: 'Access control',
  },
  {
    key: 'ac-l1-b-1-iv',
    title: 'What belongs in public?',
    description: 'Think through what a team can safely publish.',
    topic: 'Public information',
  },
  {
    key: 'mp-l1-b-1-vii',
    title: 'Before a device leaves.',
    description: 'Understand what happens to the information left behind.',
    topic: 'Media protection',
  },
] as const

function studyLessonUrl(lesson: LessonIdentity) {
  return createLessonUrl(
    lesson,
    'beginner',
    new URL('/learn', window.location.origin),
  )
}
function discoveryUrl(query = '', level = '') {
  return (
    '/learn' +
    serializeExplorerSearch({
      view: 'discover',
      mode: 'beginner',
      filters: {
        catalog: 'cmmc',
        collection: 'references',
        query,
        family: '',
        level,
      },
    })
  )
}

/** A useful index of real drafts; this page never mounts or tracks a hidden lesson. */
export function StudyHome() {
  const misconception =
    findLearningActivity(defaultLesson)?.commonMisunderstanding
  return (
    <div className="study-home section-shell">
      <div className="desk-masthead">
        <span>A field guide to cybersecurity</span>
        <span>Independent. Open source.</span>
      </div>
      <section className="desk-intro" aria-labelledby="study-title">
        <div>
          <h1 id="study-title">
            What are you trying <br />
            <span>to understand?</span>
          </h1>
          <p>CMMC controls, explained through everyday situations.</p>
        </div>
        <p className="desk-margin-note">
          Complex language.
          <br />
          <span>Clear explanations.</span>
          <svg viewBox="0 0 90 50" aria-hidden="true">
            <path d="M78 4C65 38 32 41 7 36m0 0 13-11M7 36l16 7" />
          </svg>
        </p>
      </section>
      <form
        className="desk-search"
        action={findControlAction}
        method="get"
        role="search"
        aria-label="Find a security control"
        onSubmit={(event) =>
          reportFindControl(
            String(new FormData(event.currentTarget).get('q') ?? ''),
          )
        }
      >
        {Object.entries(findControlFields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <label htmlFor="desk-search">Search the control library</label>
        <div className="desk-search-field">
          <Search size={22} aria-hidden="true" />
          <input
            id="desk-search"
            type="search"
            name="q"
            placeholder="A topic, a term, or a control ID…"
            autoComplete="off"
          />
          <button type="submit">
            Search controls <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="desk-search-hints">
          <span>Try</span>
          {['access', 'public information', 'media'].map((query) => (
            <a key={query} href={discoveryUrl(query)}>
              {query}
              <ArrowUpRight size={12} aria-hidden="true" />
            </a>
          ))}
        </div>
      </form>
      <div className="desk-lessons">
        <section className="lesson-index" aria-labelledby="start-title">
          <div className="desk-section-heading">
            <h2 id="start-title">Start with a real situation.</h2>
            <span>Level 1 · Practice</span>
          </div>
          <ol>
            {starts.map((item, index) => {
              const control = referenceControls.find(
                (control) => control.key === item.key,
              )!
              const lesson = {
                frameworkId: control.frameworkId,
                editionId: control.editionId,
                controlKey: control.key,
              }
              return (
                <li key={item.key}>
                  <a
                    href={studyLessonUrl(lesson)}
                    onClick={() => trackUsage({ name: 'control_open', lesson })}
                  >
                    <span className="index-number" aria-hidden="true">
                      0{index + 1}
                    </span>
                    <span className="index-copy">
                      <span className="index-topic">{item.topic}</span>
                      <h3>{item.title}</h3>
                      <span className="index-description">
                        {item.description}
                      </span>
                      <code>{control.id}</code>
                    </span>
                    <ArrowUpRight
                      className="index-arrow"
                      size={20}
                      aria-hidden="true"
                    />
                  </a>
                </li>
              )
            })}
          </ol>
          <a className="desk-library-link" href="/practice">
            Browse practice activities{' '}
            <span>Fictional situations, explained answers</span>
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </section>
        <aside className="teaching-board" aria-labelledby="board-title">
          <div className="board-heading">
            <h2 id="board-title">On the board</h2>
            <span>01 / Access</span>
          </div>
          <p className="board-equation">
            <span>“It works”</span>
            <span
              className="chalk-not-equal"
              role="img"
              aria-label="does not mean"
            >
              <i />
              <i />
              <i />
            </span>
            <span>“It’s allowed”</span>
          </p>
          <p className="board-caption">
            A working login is not proof of permission.
          </p>
          {misconception && (
            <details className="board-distinction">
              <summary>
                Why the distinction matters <span aria-hidden="true">+</span>
              </summary>
              <p>{misconception.correction}</p>
            </details>
          )}
          <a className="board-lesson-link" href={studyLessonUrl(defaultLesson)}>
            Try a short lesson <ArrowRight size={18} aria-hidden="true" />
          </a>
          <div className="board-source">
            <code>AC.L1-b.1.i</code>
            <span>Read the full source in the lesson</span>
          </div>
          <div className="chalk-ledge" aria-hidden="true">
            <span />
          </div>
        </aside>
      </div>
      <section className="reference-shelf" aria-labelledby="shelf-title">
        <div>
          <span className="desk-section-number" aria-hidden="true">
            REF.
          </span>
          <h2 id="shelf-title">Keep the source close.</h2>
          <p>CMMC v2.13 · September 2024 snapshot.</p>
        </div>
        <nav aria-label="Browse CMMC reference levels">
          {['Level 1', 'Level 2', 'Level 3'].map((level) => (
            <a key={level} href={discoveryUrl('', level)}>
              <span>{level}</span>{' '}
              <small>
                {
                  referenceControls.filter((control) => control.level === level)
                    .length
                }{' '}
                references
              </small>
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          ))}
        </nav>
        <a className="wordbook-link" href="/glossary">
          <span>Stuck on a word?</span>
          <strong>
            Open the wordbook <ArrowUpRight size={18} aria-hidden="true" />
          </strong>
          <small>Plain-language definitions.</small>
        </a>
      </section>
    </div>
  )
}
