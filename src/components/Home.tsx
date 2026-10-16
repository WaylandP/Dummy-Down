import { explorerCatalog, referenceControls } from '../data/content'
import {
  createLessonUrl,
  lessonIdentity,
  lessonIdentityKey,
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
import { playRequest } from '../state/play'
import { SixtySeconds } from './sixty/SixtySeconds'
import { families } from './families'
import { numberWord } from '../data/number-words'
import {
  findControlAction,
  findControlFields,
  reportFindControl,
} from './board/find-control'

function lessonUrl(
  lesson: LessonIdentity,
  mode: ExplanationMode,
  level?: string,
) {
  const url = new URL(
    createLessonUrl(lesson, mode, new URL('/learn', window.location.origin)),
  )
  // Controls filtered to a level, with this control on the board.
  if (level) url.searchParams.set('level', level)
  return url.href.replace(window.location.origin, '')
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

/** The Level 1 basics, in catalog order; the white chalk opens the first. */
const basics = referenceControls.filter(
  (control) => control.level === 'Level 1',
)
const firstBasic = lessonIdentity(basics[0]!)

/** One chalk per reader: who they are, where that starts them, and the chalk it picks. */
const chalks = [
  {
    mode: 'beginner',
    colour: 'white',
    line: 'I’m new to this',
    text: `Level 1’s ${numberWord(basics.length)} basics first.`,
    href: () => lessonUrl(firstBasic, 'beginner', 'Level 1'),
  },
  {
    mode: 'it-cyber',
    colour: 'yellow',
    line: 'I run the systems',
    text: `The ${numberWord(families.length)} families.`,
    href: () => `${browseUrl}&mode=it-cyber`,
  },
  {
    mode: 'compliance',
    colour: 'blue',
    line: 'I’m preparing for an assessment',
    text: 'Every objective, quoted.',
    href: () => '/coverage',
  },
] as const satisfies readonly {
  mode: ExplanationMode
  colour: 'white' | 'yellow' | 'blue'
  line: string
  text: string
  href: () => string
}[]

/**
 * Home (mockups/2026-10-15/HomeHero.html): one thing first, then second,
 * then third. What this is, in a kicker and the page's one headline (it
 * names CMMC on purpose; it is reworded when a second framework ships); one
 * supporting line with the count from the catalog; then "Pick up a chalk to
 * start." with the three chalks as the main action, each picking its chalk
 * and a place to begin; then the search line; and where the visitor left
 * off, when saving remembers it. Beside the hero, from the kicker down to
 * just above "Pick up a chalk to start.", "CMMC in sixty seconds"
 * (mockups/2026-10-15/SixtySeconds.html) plays in its own panel, resting
 * on its finished clock; on a phone it follows the chalks and the search.
 * Nothing plays on its own.
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
      <div className="home-hero">
        <p className="home-kicker hand">
          A free reference desk for cybersecurity compliance
        </p>
        <h1 className="home-title chalk">
          CMMC, <br />
          in plain words.
        </h1>
        <p className="home-lead">
          All {referenceControls.length} controls across the three levels, each
          quoted from the official guide with its page, then explained three
          ways. More frameworks to come.
        </p>
      </div>
      <div className="home-start">
        <p id="home-pick" className="home-pick hand">
          Pick up a chalk to start.
        </p>
        <div className="home-row">
          <ul className="home-chalks" role="list" aria-labelledby="home-pick">
            {chalks.map((chalk) => (
              <li key={chalk.mode}>
                <a
                  className="home-chalk"
                  href={chalk.href()}
                  onClick={() => writeChalkPreference(chalk.mode)}
                >
                  <span
                    className={`home-stick tray-stick tray-stick-${chalk.colour}`}
                    aria-hidden="true"
                  />
                  <span className="home-chalk-words">
                    <span className="home-chalk-line hand">{chalk.line}</span>
                    <span className="home-chalk-text">{chalk.text}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
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
                placeholder="Or find a control…"
                autoComplete="off"
              />
              <button
                type="submit"
                className="home-search-submit"
                aria-label="Find"
              >
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
              </button>
            </div>
            <svg
              className="home-underline chalk"
              viewBox="0 0 270 8"
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M2 5c90-3 180-1 266-2" />
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
      {/* After the chalks and the search in the DOM, as on a phone's screen,
          so Tab reaches the page's main action before the play button; the
          grid puts it beside the hero at desktop widths. */}
      <div className="home-talk">
        <SixtySeconds
          autoplay={playRequest(new URL(window.location.href)) === 'sixty'}
        />
      </div>
    </div>
  )
}
