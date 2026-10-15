import { Fragment } from 'react'
import type { ReferenceControl } from '../../types/content'
import { assessmentObjectivesFor } from '../../data/cmmc-objectives'
import { clauseMapFor, decodeSentence } from '../../data/cmmc-clause-map'

/**
 * The requirement sentence, verbatim and large, each mapped clause underlined
 * in yellow chalk with the letters of the objectives it produces; then the
 * objectives, verbatim. The letters are drawn beside the quotation from a
 * data attribute, so the quotation's text stays the sentence alone; a hidden
 * line gives the same map in words.
 */
export function DecodeTab({ control }: { readonly control: ReferenceControl }) {
  const objectives = assessmentObjectivesFor(control)
  const clauses = clauseMapFor(control)
  // Three chalk strokes, as in the mockup; a clause takes the next one along (CSS).
  const decoded =
    clauses.length > 0
      ? decodeSentence(control.requirement.text, clauses)
      : null
  const model = control.sourceDocuments.find(
    (source) => source.id === control.modelRequirement.sourceId,
  )
  let clause = 0
  return (
    <div className="decode">
      <blockquote className="decode-sentence reference-requirement">
        {decoded
          ? decoded.map((segment, index) =>
              segment.letters ? (
                <Fragment key={index}>
                  <span className="decode-clause" data-stroke={clause++ % 3}>
                    {segment.text}
                  </span>
                  <span
                    className="decode-letters hand"
                    aria-hidden="true"
                    data-letters={segment.letters.join(' ')}
                  />
                </Fragment>
              ) : (
                <Fragment key={index}>{segment.text}</Fragment>
              ),
            )
          : control.requirement.text}
      </blockquote>
      {decoded && (
        <p className="sr-only">
          Clauses and the objectives they produce:{' '}
          {clauses
            .map((clause) => `${clause.text}: ${clause.letters.join(', ')}`)
            .join('; ')}
          .
        </p>
      )}
      {objectives.length > 0 && (
        <ol className="decode-objectives" aria-label="Assessment objectives">
          {objectives.map((objective) => (
            <li key={objective.id}>
              <span className="objective-label mono">[{objective.label}]</span>
              <span>{objective.text}</span>
            </li>
          ))}
        </ol>
      )}
      {control.modelRequirement.differsFromGuide && (
        <details className="decode-compare">
          <summary>Compare model wording</summary>
          <p>
            The model overview and assessment guide use different wording for
            this requirement in this snapshot. Both quotations are preserved;
            this project does not reconcile the difference.
          </p>
          <blockquote className="reference-quote">
            {control.modelRequirement.text}
          </blockquote>
          <p className="reference-citation">
            {model ? `${model.title} · Version ${model.version} · ` : ''}
            PDF page {control.modelRequirement.pdfPage} (printed page{' '}
            {control.modelRequirement.printedPage})
          </p>
        </details>
      )}
    </div>
  )
}
