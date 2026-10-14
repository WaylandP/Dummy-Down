import { useId } from 'react'
import { ArrowUpRight } from 'lucide-react'
import type {
  ContentEdition,
  ExplanationMode,
  Framework,
  ReferenceControl,
  RequirementQuote,
  SourceDocumentCitation,
} from '../types/content'
import { ShareLesson } from './ShareLesson'
import { lessonIdentity } from '../state/explorer-state'
import { trackUsage } from '../analytics/usage'
import { ReferencePerspectives } from './ReferencePerspectives'
import { ContextTerms } from './ContextTerms'
import { glossaryTerms } from '../data/content'
import { getLevelOneTermIds } from '../data/level-one-terms'
import { lessonIdentityKey } from '../state/explorer-state'
import { LearningPractice } from './LearningPractice'
import { EditorialReviewContext } from './EditorialReviewContext'
import { findLearningActivity } from '../data/learning'

interface ReferenceDetailProps {
  control: ReferenceControl
  framework: Framework
  edition: ContentEdition
  shareUrl: string
  excludedByFilters: boolean
  onBack: () => void
  onShowInResults: () => void
  headingRef?: (node: HTMLHeadingElement | null) => void
  mode: ExplanationMode
  onModeChange: (mode: ExplanationMode) => void
}

function isHttps(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:'
  } catch {
    return false
  }
}

function DocumentLink({
  url,
  label,
  onOpen,
}: {
  url: string
  label: string
  onOpen: () => void
}) {
  return isHttps(url) ? (
    <a href={url} target="_blank" rel="noopener noreferrer" onClick={onOpen}>
      {label}
      <ArrowUpRight size={14} aria-hidden="true" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  ) : (
    <span>{label} — reference link unavailable.</span>
  )
}

function PageCitation({
  quote,
  source,
}: {
  quote: RequirementQuote
  source: SourceDocumentCitation | undefined
}) {
  return (
    <p className="reference-citation">
      {source ? `${source.title} · Version ${source.version} · ` : ''}
      PDF page {quote.pdfPage} (printed page {quote.printedPage})
    </p>
  )
}

/** Public-document quotations do not imply that teaching content has been reviewed. */
export function ReferenceDetail({
  control,
  framework,
  edition,
  shareUrl,
  excludedByFilters,
  onBack,
  onShowInResults,
  headingRef,
  mode,
  onModeChange,
}: ReferenceDetailProps) {
  const readerId = useId()
  const sourceId = `${readerId}-source`
  const explanationId = `${readerId}-explanation`
  const practiceId = `${readerId}-practice`
  const lesson = lessonIdentity(control)
  const hasPractice = Boolean(findLearningActivity(lesson))
  const guideSource = control.sourceDocuments.find(
    (source) => source.id === control.requirement.sourceId,
  )
  const modelSource = control.sourceDocuments.find(
    (source) => source.id === control.modelRequirement.sourceId,
  )

  return (
    <article
      className="control-detail reference-detail"
      aria-labelledby="control-title"
    >
      <button
        type="button"
        className="back-to-results inline-action"
        onClick={onBack}
      >
        Back to results
      </button>
      <div className="control-kicker">
        <span>
          {[framework.shortName, control.level, control.familyName]
            .filter(Boolean)
            .join(' / ')}
        </span>
        <span className="draft-tag">
          Source reference{guideSource ? ` · v${guideSource.version}` : ''}
        </span>
      </div>
      {excludedByFilters && (
        <div className="lesson-mismatch">
          <p>This lesson is outside the current results.</p>
          <button
            type="button"
            className="inline-action"
            onClick={onShowInResults}
          >
            Show this lesson in results
          </button>
        </div>
      )}
      <div className="lesson-heading-row">
        <div>
          <h3 id="control-title" tabIndex={-1} ref={headingRef}>
            {control.title}
          </h3>
          <p className="control-reference">{control.id}</p>
          <p className="edition-context">
            Publication snapshot: {edition.title}
          </p>
        </div>
        <ShareLesson
          url={shareUrl}
          subject="reference"
          lesson={lessonIdentity(control)}
        />
      </div>
      <nav className="reader-outline" aria-label="On this page">
        <span className="reader-outline-label">On this page</span>
        <ol>
          <li>
            <a href={`#${sourceId}`}>
              <span className="reader-outline-number">01</span> Source
            </a>
          </li>
          <li>
            <a href={`#${explanationId}`}>
              <span className="reader-outline-number">02</span> Explain it
            </a>
          </li>
          {hasPractice && (
            <li>
              <a href={`#${practiceId}`}>
                <span className="reader-outline-number">03</span> Practice
              </a>
            </li>
          )}
        </ol>
      </nav>
      <div
        className="reference-requirement reader-jump-target"
        id={sourceId}
        tabIndex={-1}
      >
        <span className="small-label source-label">
          Requirement from the assessment guide
        </span>
        <blockquote className="reference-quote">
          {control.requirement.text}
        </blockquote>
        <PageCitation quote={control.requirement} source={guideSource} />
      </div>
      <div className="reader-jump-target" id={explanationId} tabIndex={-1}>
        <ReferencePerspectives
          control={control}
          mode={mode}
          onChange={onModeChange}
        />
      </div>
      <ContextTerms
        key={`terms:${lessonIdentityKey(lessonIdentity(control))}`}
        termIds={getLevelOneTermIds(control)}
        terms={glossaryTerms}
      />
      {hasPractice && (
        <div className="reader-jump-target" id={practiceId} tabIndex={-1}>
          <LearningPractice lesson={lesson} />
        </div>
      )}
      <EditorialReviewContext
        key={`review:${lessonIdentityKey(lessonIdentity(control))}`}
        control={control}
      />
      {control.modelRequirement.differsFromGuide && (
        <details className="source-details reference-comparison">
          <summary>Compare model wording</summary>
          <div className="source-content">
            <p>
              The model overview and assessment guide use different wording for
              this requirement in this snapshot. Both quotations are preserved;
              this project does not reconcile the difference.
            </p>
            <blockquote className="reference-quote">
              {control.modelRequirement.text}
            </blockquote>
            <PageCitation
              quote={control.modelRequirement}
              source={modelSource}
            />
          </div>
        </details>
      )}
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
                  <DocumentLink
                    url={`${source.url}#page=${source.pdfPage}`}
                    label="Official publication URL"
                    onOpen={() =>
                      trackUsage({
                        name: 'source_open',
                        lesson: lessonIdentity(control),
                        sourceId: source.id,
                        destination: 'publisher',
                      })
                    }
                  />
                  {' · '}
                  <DocumentLink
                    url={`${source.mirrorUrl}#page=${source.pdfPage}`}
                    label="Pinned third-party PDF mirror"
                    onOpen={() =>
                      trackUsage({
                        name: 'source_open',
                        lesson: lessonIdentity(control),
                        sourceId: source.id,
                        destination: 'mirror',
                      })
                    }
                  />
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
    </article>
  )
}
