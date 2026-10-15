import {
  cmmcSourceDocuments,
  defaultLesson,
  explorerCatalog,
  referenceControls,
} from '../data/content'
import {
  createLessonUrl,
  lessonIdentity,
  lessonIdentityKey,
  serializeExplorerSearch,
} from '../state/explorer-state'
import { useLocalProgress } from '../progress/useLocalProgress'
import type { CatalogControl, LessonIdentity } from '../types/content'
import {
  findControlAction,
  findControlFields,
  reportFindControl,
} from './board/find-control'

/** Short names for the family column; the catalog keeps the official ones. */
const familyLabels: Readonly<Record<string, string>> = {
  AC: 'Access Control',
  AT: 'Awareness & Training',
  AU: 'Audit & Accountability',
  CA: 'Security Assessment',
  CM: 'Configuration',
  IA: 'Identification',
  IR: 'Incident Response',
  MA: 'Maintenance',
  MP: 'Media Protection',
  PE: 'Physical Protection',
  PS: 'Personnel Security',
  RA: 'Risk Assessment',
  SC: 'System & Comms',
  SI: 'System Integrity',
}

const families = [
  ...referenceControls.reduce((map, control) => {
    const entry = map.get(control.family) ?? {
      code: control.family,
      name: familyLabels[control.family] ?? control.familyName,
      count: 0,
    }
    map.set(control.family, { ...entry, count: entry.count + 1 })
    return map
  }, new Map<string, { code: string; name: string; count: number }>()),
]
  .map(([, family]) => family)
  .sort((left, right) => left.code.localeCompare(right.code, 'en-US'))

function familyUrl(family: string) {
  return (
    '/learn' +
    serializeExplorerSearch({
      view: 'discover',
      mode: 'beginner',
      filters: {
        catalog: 'cmmc',
        collection: 'references',
        query: '',
        family,
        level: '',
      },
    })
  )
}

function lessonUrl(lesson: LessonIdentity) {
  return createLessonUrl(
    lesson,
    'beginner',
    new URL('/learn', window.location.origin),
  )
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

function publicationLabel() {
  const guide = cmmcSourceDocuments.find((document) =>
    document.id.includes('model'),
  )
  if (!guide) return ''
  const [year, month] = guide.published.split('-').map(Number)
  const date = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1))
  const when = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
  return `CMMC v${guide.version}, ${when}`
}

/** The board: one question, a search line, the fourteen families, and where you left off. */
export function Home() {
  const { lastControl } = useLocalProgress()
  const remembered = findControl(lastControl)
  const start = remembered ?? findControl(defaultLesson)
  return (
    <div className="home">
      <svg
        className="home-glow"
        viewBox="0 0 560 420"
        aria-hidden="true"
        focusable="false"
      >
        <ellipse
          cx="280"
          cy="210"
          rx="260"
          ry="120"
          transform="rotate(-8 280 210)"
        />
      </svg>
      <div className="home-board">
        <section className="home-ask" aria-labelledby="home-title">
          <h1 id="home-title" className="chalk">
            What are you <br />
            trying to understand?
          </h1>
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
                  width="28"
                  height="28"
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
              viewBox="0 0 620 10"
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M2 6c90-3 180-2 270-1s180 1 346-2" />
            </svg>
            <p className="home-note">
              {referenceControls.length} controls. Every sentence cited to its
              page.
            </p>
          </form>
        </section>
        <aside className="home-families" aria-labelledby="families-title">
          <h2 id="families-title" className="hand">
            Families
          </h2>
          <nav aria-label="Control families">
            {families.map((family) => (
              <a
                key={family.code}
                className="family"
                href={familyUrl(family.code)}
              >
                <span className="family-code mono">{family.code}</span>
                {family.name}
                <span className="family-count mono">{family.count}</span>
              </a>
            ))}
          </nav>
        </aside>
      </div>
      <div className="home-foot">
        {start && (
          <p className="home-last hand">
            {remembered ? 'Last time: ' : 'Start here: '}
            <a href={lessonUrl(lessonIdentity(start))}>
              {start.id} {start.title}
            </a>
          </p>
        )}
        <span>{publicationLabel()}</span>
      </div>
    </div>
  )
}
