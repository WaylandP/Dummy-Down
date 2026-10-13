import { ArrowUpRight } from 'lucide-react'
import type {
  ContentEdition,
  Framework,
  ReferenceControl,
  RequirementQuote,
  SourceDocumentCitation,
} from '../types/content'
import { ShareLesson } from './ShareLesson'

interface ReferenceDetailProps {
  control: ReferenceControl
  framework: Framework
  edition: ContentEdition
  shareUrl: string
  excludedByFilters: boolean
  onBack: () => void
  onShowInResults: () => void
  headingRef?: (node: HTMLHeadingElement | null) => void
}

function isHttps(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:'
  } catch {
    return false
  }
}

function DocumentLink({ url, label }: { url: string; label: string }) {
  return isHttps(url) ? (
    <a href={url} target="_blank" rel="noopener noreferrer">
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
}: ReferenceDetailProps) {
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
        <ShareLesson url={shareUrl} subject="reference" />
      </div>
      <div className="reference-requirement">
        <span className="small-label">
          Requirement from the assessment guide
        </span>
        <blockquote className="reference-quote">
          {control.requirement.text}
        </blockquote>
        <PageCitation quote={control.requirement} source={guideSource} />
      </div>
      <div className="reference-pending">
        <h4>Teaching explanations are pending.</h4>
        <p>
          This entry contains source quotations from the September 2024 v2.13
          snapshot. Beginner, IT &amp; Cyber, and Compliance explanations have
          not been written or reviewed for this reference. Assessment
          objectives, implementation examples, and knowledge checks are not
          included here.
        </p>
        <p>
          This import has not received qualified editorial review. Consult the
          applicable official publication and assessment guidance.
        </p>
      </div>
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
                  />
                  {' · '}
                  <DocumentLink
                    url={`${source.mirrorUrl}#page=${source.pdfPage}`}
                    label="Pinned third-party PDF mirror"
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
