import { useEffect } from 'react'
import timeline from '../data/cmmc-timeline.json'
import './timeline.css'

interface Citation {
  readonly source: string
  readonly where: string
  readonly quote: string
}
interface SourcedLine {
  readonly key: string
  readonly name: string
  readonly citations: readonly Citation[]
}
const sources = timeline.sources as Readonly<
  Record<
    string,
    {
      readonly title: string
      readonly version: string
      readonly officialUrl: string
    }
  >
>

function isHttps(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:'
  } catch {
    return false
  }
}

function longDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** One disclosure per section: the words each line paraphrases, under the line's name. */
function Sources({
  label,
  lines,
}: {
  readonly label: string
  readonly lines: readonly SourcedLine[]
}) {
  return (
    <details className="timeline-sources">
      <summary>Sources: {label}</summary>
      {lines.map((line) => (
        <div className="timeline-source-group" key={line.key}>
          <h3>{line.name}</h3>
          <ul role="list">
            {line.citations.map((citation, index) => {
              const source = sources[citation.source]!
              return (
                <li key={index}>
                  <p className="timeline-cite">
                    {isHttps(source.officialUrl) ? (
                      <a
                        href={source.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {source.title}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : (
                      source.title
                    )}
                    , {source.version}, {citation.where}.
                  </p>
                  <blockquote className="timeline-quote">
                    {citation.quote}
                  </blockquote>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </details>
  )
}

/** One screen of the dates that matter, each paraphrased from a quoted source. */
export default function TimelinePage() {
  // The printed page carries the sources: every disclosure opens for print.
  useEffect(() => {
    const all = () =>
      document.querySelectorAll<HTMLDetailsElement>('.timeline-sources')
    const open = () => {
      for (const node of all()) {
        node.dataset.wasOpen = node.open ? 'true' : 'false'
        node.open = true
      }
    }
    const restore = () => {
      for (const node of all()) {
        node.open = node.dataset.wasOpen === 'true'
        delete node.dataset.wasOpen
      }
    }
    window.addEventListener('beforeprint', open)
    window.addEventListener('afterprint', restore)
    return () => {
      window.removeEventListener('beforeprint', open)
      window.removeEventListener('afterprint', restore)
    }
  }, [])
  return (
    <div className="timeline-page page">
      <h1 className="chalk">The dates that matter.</h1>
      <p className="page-lead">
        When the program rule took effect, when the clause reaches contracts,
        how long a status stays current, and what DoD has said about Revision 3.
        Each line paraphrases the rule, the clause or DoD guidance, quoted under
        Sources.
      </p>
      <section className="timeline-section" aria-labelledby="timeline-dates">
        <h2 id="timeline-dates" className="sr-only">
          The dates
        </h2>
        <ol className="timeline" role="list" aria-label="CMMC dates">
          {timeline.dates.map((entry) => (
            <li className="timeline-date" key={entry.id}>
              <time className="mono timeline-when" dateTime={entry.date}>
                {longDate(entry.date)}
              </time>
              <h3 className="hand">{entry.title}</h3>
              <p>{entry.text}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="timeline-section" aria-labelledby="timeline-statuses">
        <h2 id="timeline-statuses" className="hand">
          How long a status stays current
        </h2>
        <ul className="timeline-statuses" role="list">
          {timeline.durations.map((entry) => (
            <li key={entry.id}>
              <p className="timeline-status">
                <span className="timeline-status-name">{entry.status}</span>
                <span className="sr-only">: </span>
                <span className="mono timeline-lasts">{entry.lasts}</span>
              </p>
              <p>{entry.text}</p>
            </li>
          ))}
        </ul>
      </section>
      <section
        className="timeline-section timeline-rev3"
        aria-labelledby="timeline-rev3"
      >
        <h2 id="timeline-rev3" className="hand">
          {timeline.rev3.title}
        </h2>
        <p>{timeline.rev3.text}</p>
      </section>
      <section
        className="timeline-sources-row"
        aria-labelledby="timeline-sources-heading"
      >
        <h2 id="timeline-sources-heading" className="sr-only">
          Sources
        </h2>
        <Sources
          label="the dates"
          lines={timeline.dates.map((entry) => ({
            key: entry.id,
            name: `${longDate(entry.date)}: ${entry.title}`,
            citations: entry.citations,
          }))}
        />
        <Sources
          label="the statuses"
          lines={timeline.durations.map((entry) => ({
            key: entry.id,
            name: entry.status,
            citations: entry.citations,
          }))}
        />
        <Sources
          label="Rev 3"
          lines={[
            {
              key: 'rev3',
              name: timeline.rev3.title,
              citations: timeline.rev3.citations,
            },
          ]}
        />
      </section>
      <p className="page-foot">
        <span>
          Dates after today are DoD’s stated plan, not a promise; the sources
          control wherever a line and a source differ. Read on{' '}
          {longDate(timeline.comparedOn)}.
        </span>
      </p>
    </div>
  )
}
