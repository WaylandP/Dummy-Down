import { useId } from 'react'
import type { LearningDiagram } from '../types/learning'

/** Semantic text is the diagram: it remains readable without images or motion. */
export function LessonDiagram({ diagram }: { diagram: LearningDiagram }) {
  const prefix = useId()

  return (
    <figure className="lesson-diagram" aria-labelledby={`${prefix}-title`}>
      <div className="lesson-diagram-heading">
        <h5 id={`${prefix}-title`}>{diagram.title}</h5>
        <p className="small-label">Draft illustrative diagram</p>
      </div>
      <ol className="lesson-diagram-flow" role="list">
        {diagram.steps.map((step, index) => (
          <li key={step.id}>
            <span className="diagram-step-number" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="diagram-step-content">
              <strong>{step.title}</strong>
              <p>{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
      {diagram.branches && diagram.branches.length > 0 && (
        <div className="lesson-diagram-outcomes">
          <p className="small-label">Choose the applicable destination</p>
          <ul className="lesson-diagram-branches" role="list">
            {diagram.branches.map((branch) => (
              <li className="diagram-destination" key={branch.id}>
                <strong>{branch.title}</strong>
                <p>{branch.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      <figcaption className="lesson-diagram-equivalent">
        <strong>In words:</strong>
        <span>{diagram.textEquivalent}</span>
      </figcaption>
    </figure>
  )
}
