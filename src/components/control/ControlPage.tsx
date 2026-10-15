import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import type {
  CatalogControl,
  ContentEdition,
  ExplanationMode,
  Framework,
  ReferenceControl,
} from '../../types/content'
import {
  controlTabs,
  lessonIdentity,
  type ControlTab,
} from '../../state/explorer-state'
import { trackUsage } from '../../analytics/usage'
import { ShareLesson } from '../ShareLesson'
import { decodeControlId } from './decode-id'
import { usePerspectiveDraft } from './usePerspectiveDraft'
import { DecodeTab } from './DecodeTab'
import { ExplainTab } from './ExplainTab'
import { EvidenceTab } from './EvidenceTab'
import { PracticeTab } from './PracticeTab'
import { RelatedTab } from './RelatedTab'
import { Rev3Tab } from './Rev3Tab'
import { rev3For, rev3Source } from '../../data/cmmc-rev3'

const tabLabels: Readonly<Record<ControlTab, string>> = {
  decode: 'Decode',
  explain: 'Explain',
  evidence: 'Evidence',
  practice: 'Practice',
  related: 'Related',
  rev3: 'Rev 3',
}

export interface ControlPageProps {
  readonly control: ReferenceControl
  readonly framework: Framework
  readonly edition: ContentEdition
  readonly mode: ExplanationMode
  readonly tab: ControlTab
  readonly onModeChange: (mode: ExplanationMode) => void
  readonly onTabChange: (tab: ControlTab) => void
  readonly tabUrl: (tab: ControlTab) => string
  readonly shareUrl: string
  /** The link that opens this control in the chalk in hand. */
  readonly chalkUrl: string
  readonly excludedByFilters: boolean
  readonly onShowInResults: () => void
  readonly headingRef?: (node: HTMLHeadingElement | null) => void
  readonly previous?: CatalogControl
  readonly next?: CatalogControl
  readonly onNeighbour: (
    control: CatalogControl,
    direction: 'previous' | 'next',
  ) => void
}

function isHttps(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:'
  } catch {
    return false
  }
}

/** The Board's control screen: the ID decoded, the title, its views, one footer line. */
export function ControlPage(props: ControlPageProps) {
  const {
    control,
    edition,
    mode,
    tab,
    onModeChange,
    onTabChange,
    tabUrl,
    shareUrl,
    chalkUrl,
    excludedByFilters,
    onShowInResults,
    headingRef,
    previous,
    next,
    onNeighbour,
  } = props
  const prefix = useId()
  const lesson = lessonIdentity(control)
  // Previous/Next keep focus on the button, so the new control is announced here.
  const byNeighbour = useRef(false)
  const [announcement, setAnnouncement] = useState('')
  useEffect(() => {
    if (!byNeighbour.current) return
    byNeighbour.current = false
    setAnnouncement(`${control.id}: ${control.title}`)
  }, [control])
  const decoded = decodeControlId(control)
  const draft = usePerspectiveDraft(control)
  // Rev 3 reads a Level 2 requirement beside NIST SP 800-171 Rev. 3; the other
  // levels have no counterpart there, so the view is not offered and an address
  // that asks for it shows Decode with a line saying why.
  const rev3 = rev3For(control)
  const views = rev3
    ? controlTabs
    : controlTabs.filter((item) => item !== 'rev3')
  const shown: ControlTab = views.includes(tab) ? tab : 'decode'
  const guide = control.sourceDocuments.find(
    (source) => source.id === control.requirement.sourceId,
  )
  const guideUrl = guide ? `${guide.url}#page=${guide.pdfPage}` : ''
  const footers: Readonly<Record<ControlTab, ReactNode>> = {
    decode: (
      <>
        Verbatim.{' '}
        {guide
          ? `${guide.title}, v${guide.version}, page ${guide.printedPage}. `
          : ''}
        {guide && isHttps(guideUrl) && (
          <a
            href={guideUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackUsage({
                name: 'source_open',
                lesson,
                sourceId: guide.id,
                destination: 'publisher',
              })
            }
          >
            Open the page
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </>
    ),
    explain:
      'Written by Cipher & Chalk from the cited guide. One approach, not the only one.',
    evidence:
      'Teaching aids from the cited guide, not an evidence list or assessment objectives.',
    practice: 'Fictional situations. Written from the cited guide.',
    related: `${edition.title}. Relations follow identifiers and titles in this snapshot.`,
    rev3: (
      <>
        Both texts verbatim; the change note is written by Cipher &amp; Chalk.{' '}
        {rev3 && (
          <a
            href={`${rev3Source.officialUrl}#page=${rev3.pdfPage}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open the page
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </>
    ),
  }

  return (
    <article className="control-page" aria-labelledby="control-title">
      <p className="sr-only" role="status">
        {announcement}
      </p>
      <div
        className={`control-id-line ${shown === 'decode' ? 'is-full' : 'is-compact'}`}
        role="group"
        aria-label="The control ID, decoded"
      >
        <p className="control-id">
          {decoded ? (
            <>
              <span>{decoded.family}</span>
              <span className="sep">.</span>
              <span>{decoded.level}</span>
              <span className="sep">-</span>
              <span>{decoded.number}</span>
            </>
          ) : (
            control.id
          )}
        </p>
        {decoded && (
          <>
            <svg
              className="control-arrow chalk"
              viewBox="0 0 40 34"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M4 18c10-2 20-2 32 0M28 10l8 8-8 8" />
            </svg>
            <dl className="control-pieces">
              {decoded.pieces.map((piece) => (
                <div className="piece" key={piece.code}>
                  <dt className="mono">{piece.code}</dt>
                  <dd>{piece.meaning}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
        <p className="control-id-summary">
          {[control.familyName, control.level].filter(Boolean).join(', ')}
        </p>
      </div>
      <div className="control-actions">
        <button
          type="button"
          className="control-action"
          onClick={() => window.print()}
        >
          Print
        </button>
        <ShareLesson url={shareUrl} subject="reference" lesson={lesson} />
        <ShareLesson
          url={chalkUrl}
          subject="reference"
          lesson={lesson}
          label="Send this chalk"
          name="Chalk"
        />
      </div>
      {excludedByFilters && (
        <p className="lesson-mismatch">
          This lesson is outside the current results.{' '}
          <button
            type="button"
            className="inline-action"
            onClick={onShowInResults}
          >
            Show this lesson in results
          </button>
        </p>
      )}
      <h1 id="control-title" className="chalk" tabIndex={-1} ref={headingRef}>
        {control.title}
      </h1>
      <nav className="control-tabs" aria-label="Views of this control">
        {views.map((item) => (
          <a
            key={item}
            id={`${prefix}-view-${item}`}
            className="control-tab"
            href={tabUrl(item)}
            aria-current={shown === item ? 'page' : undefined}
            onClick={(event) => {
              if (
                event.defaultPrevented ||
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
              )
                return
              event.preventDefault()
              onTabChange(item)
            }}
          >
            {tabLabels[item]}
            {shown === item && (
              <svg
                className="control-tab-stroke chalk"
                viewBox="0 0 64 6"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M1 3c20-2 40 0 62-1" />
              </svg>
            )}
          </a>
        ))}
      </nav>
      <div className="control-panels">
        <section
          className="control-panel control-panel-decode"
          aria-labelledby={`${prefix}-view-decode`}
          hidden={shown !== 'decode'}
        >
          {tab !== shown && (
            <p className="decode-note">
              Rev 3 is read beside the Level 2 requirements; showing Decode.
            </p>
          )}
          <DecodeTab control={control} />
        </section>
        <section
          className="control-panel control-panel-explain"
          aria-labelledby={`${prefix}-view-explain`}
          hidden={shown !== 'explain'}
        >
          <ExplainTab
            control={control}
            draft={draft}
            mode={mode}
            onModeChange={onModeChange}
            idPrefix={`${prefix}-chalk`}
          />
        </section>
        <section
          className="control-panel control-panel-evidence"
          aria-labelledby={`${prefix}-view-evidence`}
          hidden={shown !== 'evidence'}
        >
          <EvidenceTab draft={draft} />
        </section>
        <section
          className="control-panel control-panel-practice"
          aria-labelledby={`${prefix}-view-practice`}
          hidden={shown !== 'practice'}
        >
          <PracticeTab control={control} />
        </section>
        <section
          className="control-panel control-panel-related"
          aria-labelledby={`${prefix}-view-related`}
          hidden={shown !== 'related'}
        >
          <RelatedTab control={control} edition={edition} mode={mode} />
        </section>
        {rev3 && (
          <section
            className="control-panel control-panel-rev3"
            aria-labelledby={`${prefix}-view-rev3`}
            hidden={shown !== 'rev3'}
          >
            {/* Nothing here keeps state, and the Rev 2 quotation is already on Decode. */}
            {shown === 'rev3' && (
              <Rev3Tab control={control} row={rev3} mode={mode} />
            )}
          </section>
        )}
      </div>
      {shown !== 'decode' && guide && (
        <p className="print-only control-print-citation">
          Verbatim. {guide.title}, v{guide.version}, page {guide.printedPage}.{' '}
          {isHttps(guideUrl) && <span className="mono">{guideUrl}</span>}
        </p>
      )}
      <div className="control-foot">
        <p className="control-foot-note">{footers[shown]}</p>
        <div className="control-prevnext">
          {previous && (
            <button
              type="button"
              className="control-action"
              onClick={() => {
                byNeighbour.current = true
                onNeighbour(previous, 'previous')
              }}
            >
              Previous: {previous.id}
            </button>
          )}
          {next && (
            <button
              type="button"
              className="control-action control-action-next"
              onClick={() => {
                byNeighbour.current = true
                onNeighbour(next, 'next')
              }}
            >
              Next: {next.id}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
