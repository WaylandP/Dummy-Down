import type { ReferenceControl } from '../../types/content'
import { assessmentObjectivesFor } from '../../data/cmmc-objectives'

/** The requirement sentence, verbatim and large, and the objectives it produces, verbatim. */
export function DecodeTab({ control }: { readonly control: ReferenceControl }) {
  const objectives = assessmentObjectivesFor(control)
  const model = control.sourceDocuments.find(
    (source) => source.id === control.modelRequirement.sourceId,
  )
  return (
    <div className="decode">
      <blockquote className="decode-sentence reference-requirement">
        {control.requirement.text}
      </blockquote>
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
