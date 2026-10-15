import { Fragment } from 'react'
import { explorerCatalog, referenceControls } from '../data/content'
import {
  createLessonUrl,
  lessonIdentity,
  lessonIdentityKey,
  pathControls,
} from '../state/explorer-state'
import {
  readChalkPreference,
  writeChalkPreference,
} from '../state/chalk-preference'
import { useLocalProgress } from '../progress/useLocalProgress'
import type {
  CatalogControl,
  ExplanationMode,
  LessonIdentity,
} from '../types/content'
import { browseUrl } from './board/SiteHeader'
import { families } from './families'
import { later } from './home-later'
import { numberWord } from './number-words'
import {
  findControlAction,
  findControlFields,
  reportFindControl,
} from './board/find-control'

function lessonUrl(
  lesson: LessonIdentity,
  mode: ExplanationMode,
  path?: 'basics',
) {
  return createLessonUrl(
    lesson,
    mode,
    new URL('/learn', window.location.origin),
    'decode',
    path,
  ).replace(window.location.origin, '')
}

function findControl(lesson: LessonIdentity | null): CatalogControl | null {
  if (!lesson) return null
  const key = lessonIdentityKey(lesson)
  return (
    explorerCatalog.controls.find(
      (control) => lessonIdentityKey(lessonIdentity(control)) === key,
    ) ?? null
  )
}

/** The Level 1 basics: the Start here path begins at the first of them. */
const basics = pathControls('basics', explorerCatalog)
const firstBasic = lessonIdentity(basics[0]!)

/** What is on the board now: each level's controls, counted from the catalog. */
const levels = [
  { name: 'Level 1', note: 'the basics, for contract information' },
  { name: 'Level 2', note: 'for CUI' },
  { name: 'Level 3', note: 'enhanced requirements' },
].map((level) => ({
  ...level,
  count: referenceControls.filter((control) => control.level === level.name)
    .length,
}))

/** One row per chalk: who is reading, where that starts them, and the chalk it picks. */
const rows = [
  {
    mode: 'beginner',
    colour: 'white',
    line: 'I’m new to this.',
    text: `Start with Level 1: ${numberWord(basics.length)} basics, one control at a time, in plain words.`,
    go: 'Start here',
    href: () => lessonUrl(firstBasic, 'beginner', 'basics'),
  },
  {
    mode: 'it-cyber',
    colour: 'yellow',
    line: 'I run the systems.',
    text: `Start with the ${numberWord(families.length)} families and what each one asks of your systems.`,
    go: 'The families',
    href: () => `${browseUrl}&mode=it-cyber`,
  },
  {
    mode: 'compliance',
    colour: 'blue',
    line: 'I’m preparing for an assessment.',
    text: 'Start with the objectives: what gets examined, who gets interviewed, what gets tested.',
    go: 'The objectives',
    href: () => '/coverage',
  },
] as const satisfies readonly {
  mode: ExplanationMode
  colour: 'white' | 'yellow' | 'blue'
  line: string
  text: string
  go: string
  href: () => string
}[]

/**
 * Home, for the stranger who arrives from a shared link: who's reading, three
 * rows that each pick a chalk and a place to start, a search line, where the
 * visitor left off when saving remembers it, and beside them what this is
 * (mockups/2026-10-15/Home.html).
 */
export function Home() {
  const { lastControl } = useLocalProgress()
  const remembered = findControl(lastControl)
  return (
    <div className="home">
      <div className="home-main">
        <svg
          className="home-glow"
          viewBox="0 0 600 420"
          aria-hidden="true"
          focusable="false"
        >
          <ellipse
            cx="300"
            cy="210"
            rx="270"
            ry="120"
            transform="rotate(-8 300 210)"
          />
        </svg>
        <div className="home-head">
          <h1 id="home-title" className="chalk">
            Who’s reading?
          </h1>
        </div>
        <nav className="home-chalks" aria-labelledby="home-title">
          {rows.map((row) => (
            <a
              key={row.mode}
              className="home-row"
              href={row.href()}
              onClick={() => writeChalkPreference(row.mode)}
            >
              <span
                className={`home-stick tray-stick tray-stick-${row.colour}`}
                aria-hidden="true"
              />
              <span className="home-row-words">
                <span className="home-row-line hand">{row.line}</span>
                <span className="home-row-text">{row.text}</span>
              </span>
              <span className="home-row-go">{row.go} →</span>
            </a>
          ))}
        </nav>
        <div className="home-lookup">
          <span className="home-lookup-label hand" aria-hidden="true">
            Or just look something up:
          </span>
          <form
            className="home-search"
            role="search"
            aria-label="Find a control"
            action={findControlAction}
            method="get"
            onSubmit={(event) =>
              reportFindControl(
                String(new FormData(event.currentTarget).get('q') ?? ''),
              )
            }
          >
            {Object.entries(findControlFields).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
            <label htmlFor="home-q" className="sr-only">
              Find a control
            </label>
            <div className="home-search-line">
              <input
                id="home-q"
                type="search"
                name="q"
                placeholder="3.1.1, multifactor, CUI, media…"
                autoComplete="off"
              />
              <button
                type="submit"
                className="home-search-submit"
                aria-label="Find"
              >
                <svg
                  width="26"
                  height="26"
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
              </button>
            </div>
            <svg
              className="home-underline chalk"
              viewBox="0 0 520 10"
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M2 6c90-3 180-2 270-1s180 1 246-2" />
            </svg>
          </form>
        </div>
        {remembered && (
          <p className="home-last">
            <span className="hand">Last time: </span>
            <a
              href={lessonUrl(
                lessonIdentity(remembered),
                readChalkPreference() ?? 'beginner',
              )}
            >
              {remembered.id} {remembered.title}
            </a>
          </p>
        )}
      </div>
      <aside className="home-what" aria-labelledby="home-what-title">
        <h2 id="home-what-title" className="hand">
          What this is
        </h2>
        <p className="home-what-lead">
          Cybersecurity requirements, decoded. The official sentence stays on
          the board word for word, cited to its page. Then it is explained in
          plain language, three ways.
        </p>
        <div className="home-decode">
          <p className="home-decode-id">
            <span className="mono">AC.L2-3.1.1</span>
            <svg
              className="chalk"
              viewBox="0 0 40 24"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M4 12c10-2 20-2 32 0M28 5l8 7-8 7" />
            </svg>
          </p>
          <dl className="home-decode-pieces">
            <dt className="mono">AC</dt>
            <dd>
              Access Control, one of {numberWord(families.length)} families
            </dd>
            <dt className="mono">L2</dt>
            <dd>Level 2</dd>
            <dt className="mono">3.1.1</dt>
            <dd>its NIST SP 800-171 requirement</dd>
          </dl>
        </div>
        <div>
          <h3 className="hand">On the board now</h3>
          <dl className="home-levels">
            {levels.map((level) => (
              <Fragment key={level.name}>
                <dt>CMMC {level.name}</dt>
                <dd className="home-level-count mono">{level.count}</dd>
                <dd className="home-level-note">{level.note}</dd>
              </Fragment>
            ))}
          </dl>
        </div>
        <div>
          <h3 className="hand">Later</h3>
          <p className="home-later">{later}</p>
        </div>
        <p className="home-what-note">
          Free. No account. Made by one person, in the open.
        </p>
      </aside>
    </div>
  )
}
