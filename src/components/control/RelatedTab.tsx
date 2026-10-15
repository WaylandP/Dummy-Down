import type {
  ContentEdition,
  ExplanationMode,
  ReferenceControl,
} from '../../types/content'
import { glossaryTerms, referenceControls } from '../../data/content'
import { relatedControls } from '../../data/related-controls'
import { getLevelOneTermIds } from '../../data/level-one-terms'
import { coverageUrl } from '../../state/coverage-url'
import {
  createLessonUrl,
  lessonIdentity,
  lessonIdentityKey,
} from '../../state/explorer-state'
import { trackUsage } from '../../analytics/usage'
import { ContextTerms } from '../ContextTerms'
import { EditorialReviewContext } from '../EditorialReviewContext'

interface RelatedTabProps {
  readonly control: ReferenceControl
  readonly edition: ContentEdition
  readonly mode: ExplanationMode
}

function isHttps(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:'
  } catch {
    return false
  }
}

function ControlList({
  title,
  controls,
  mode,
}: {
  readonly title: string
  readonly controls: readonly ReferenceControl[]
  readonly mode: ExplanationMode
}) {
  if (!controls.length) return null
  return (
    <section className="related-group" aria-label={title}>
      <h2 className="hand">{title}</h2>
      <ul className="related-list">
        {controls.map((item) => (
          <li key={item.id}>
            <a
              href={createLessonUrl(
                lessonIdentity(item),
                mode,
                new URL('/learn', window.location.origin),
              )}
            >
              <span className="related-id mono">{item.id}</span>
              <span>{item.title}</span>
              <span className="related-level">{item.level}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Neighbours by identifier and title, the words, the objectives index and the sources. */
export function RelatedTab({ control, edition, mode }: RelatedTabProps) {
  const lesson = lessonIdentity(control)
  const related = relatedControls(control, referenceControls)
  const coverage = coverageUrl(control)
  return (
    <div className="related">
      <ControlList
        title="The same practice at another level"
        controls={related.siblings}
        mode={mode}
      />
      <ControlList
        title="Builds on this one"
        controls={related.builds}
        mode={mode}
      />
      <ControlList title="Builds on" controls={related.basis} mode={mode} />
      <ControlList
        title={`The rest of ${control.familyName}`}
        controls={related.family}
        mode={mode}
      />
      <ContextTerms
        key={`terms:${lessonIdentityKey(lesson)}`}
        termIds={getLevelOneTermIds(control)}
        terms={glossaryTerms}
      />
      {coverage && (
        <p className="related-coverage">
          <a className="text-link" href={coverage}>
            See assessment statements &amp; explanation coverage
          </a>
        </p>
      )}
      <EditorialReviewContext
        key={`review:${lessonIdentityKey(lesson)}`}
        control={control}
      />
      <details className="source-details">
        <summary>Sources &amp; publication context</summary>
        <div className="source-content">
          <p>{edition.versionContext}</p>
          <p>{control.versionContext}</p>
          <ul>
            {control.sourceDocuments.map((source) => (
              <li key={source.id}>
                <span className="source-kind">Public source document</span>
                <strong>{source.title}</strong>
                <span className="reference-source-meta">
                  Version {source.version} · Published {source.published} ·{' '}
                  {source.documentId}
                </span>
                <span>
                  PDF page {source.pdfPage} (printed page {source.printedPage})
                </span>
                <span className="reference-source-links">
                  {isHttps(source.url) ? (
                    <a
                      href={`${source.url}#page=${source.pdfPage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackUsage({
                          name: 'source_open',
                          lesson,
                          sourceId: source.id,
                          destination: 'publisher',
                        })
                      }
                    >
                      Official publication URL
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    <span>
                      Official publication URL — reference link unavailable.
                    </span>
                  )}
                  {' · '}
                  {isHttps(source.mirrorUrl) ? (
                    <a
                      href={`${source.mirrorUrl}#page=${source.pdfPage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackUsage({
                          name: 'source_open',
                          lesson,
                          sourceId: source.id,
                          destination: 'mirror',
                        })
                      }
                    >
                      Pinned third-party PDF mirror
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    <span>
                      Pinned third-party PDF mirror — reference link
                      unavailable.
                    </span>
                  )}
                </span>
                <span>{source.acquisitionNote}</span>
                <span>{source.extractionNote}</span>
                <span>
                  Retrieved {source.retrievedDate}. SHA-256: {source.sha256}
                </span>
                <span>{source.publicationNotice}</span>
              </li>
            ))}
          </ul>
          <p>{control.disclaimer}</p>
        </div>
      </details>
    </div>
  )
}
