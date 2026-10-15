import { explorerCatalog } from '../data/content'
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

/** The first of the Level 1 basics: where the Start here path begins. */
const firstBasic = lessonIdentity(pathControls('basics', explorerCatalog)[0]!)

/** One row per chalk: who is reading, where that starts them, and the chalk it picks. */
const rows = [
  {
    mode: 'beginner',
    colour: 'white',
    line: 'I’m new to this.',
    text: 'Start with what CUI is and why the DoD cares, then one control at a time in plain words.',
    go: 'Start here',
    href: () => lessonUrl(firstBasic, 'beginner', 'basics'),
  },
  {
    mode: 'it-cyber',
    colour: 'yellow',
    line: 'I run the systems.',
    text: 'Start with the fourteen families and what each one actually asks of your network.',
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
 * rows that each pick a chalk and a place to start, a search line, and where
 * the visitor left off when saving remembers it.
 */
export function Home() {
  const { lastControl } = useLocalProgress()
  const remembered = findControl(lastControl)
  return (
    <div className="home">
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
        <p className="home-lead">
          A reference desk for CMMC Level 2. The 149 controls, quoted and cited,
          then explained for the person in front of the board.
        </p>
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
  )
}
