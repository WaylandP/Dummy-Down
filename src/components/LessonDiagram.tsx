import { useId } from 'react'
import type { LearningDiagram } from '../types/learning'

/** Semantic text is the diagram: it remains readable without images or motion. */
export function LessonDiagram({ diagram }: { diagram: LearningDiagram }) {
  const prefix = useId()

  return (
    <figure className="lesson-diagram" aria-labelledby={`${prefix}-title`}>
      <h5 id={`${prefix}-title`}>{diagram.title}</h5>
      <p className="small-label">Draft illustrative diagram</p>
      <ol className="lesson-diagram-flow">
        {diagram.steps.map((step) => (
          <li key={step.id}>
            <strong>{step.title}</strong>
            <p>{step.description}</p>
          </li>
        ))}
      </ol>
      {diagram.branches && diagram.branches.length > 0 && (
        <div className="lesson-diagram-outcomes">
          <p className="small-label">Choose the applicable destination</p>
          <ul className="lesson-diagram-branches">
            {diagram.branches.map((branch) => (
              <li key={branch.id}>
                <strong>{branch.title}</strong>
                <p>{branch.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      <figcaption className="lesson-diagram-equivalent">
        <strong>In words:</strong> {diagram.textEquivalent}
      </figcaption>
    </figure>
  )
}
