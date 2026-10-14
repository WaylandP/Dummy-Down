import { useEffect, useState } from 'react'
import type { ExplanationMode, ReferenceControl } from '../types/content'
import { lessonIdentity } from '../state/explorer-state'
import { ControlPerspective } from './ControlPerspective'

type PerspectiveModule = typeof import('../data/cmmc-perspectives')

interface ReferencePerspectivesProps {
  control: ReferenceControl
  mode: ExplanationMode
  onChange: (mode: ExplanationMode) => void
}

/** Load the curriculum when needed, keeping source reading usable on failure. */
export function ReferencePerspectives({
  control,
  mode,
  onChange,
}: ReferencePerspectivesProps) {
  const [content, setContent] = useState<PerspectiveModule | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let active = true
    import('../data/cmmc-perspectives')
      .then((module) => {
        if (active) setContent(module)
      })
      .catch(() => {
        if (active) setFailed(true)
      })
    return () => {
      active = false
    }
  }, [])

  if (!content)
    return (
      <div
        className="reference-pending teaching-state"
        role="status"
        aria-busy={!failed}
      >
        <span className="instruction-eyebrow">Teaching perspectives</span>
        <p>
          {failed
            ? 'The teaching perspectives could not load. You can still read the requirement and sources.'
            : 'Loading teaching perspectives…'}
        </p>
        {failed && (
          <button
            className="inline-action"
            type="button"
            onClick={() => window.location.reload()}
          >
            Reload page to retry
          </button>
        )}
      </div>
    )
  const draft = content.findCmmcPerspective(control)
  if (!draft)
    return (
      <div className="reference-pending teaching-state">
        <span className="instruction-eyebrow">Teaching perspectives</span>
        <h4>Teaching explanations are pending.</h4>
        <p>
          This publication entry has no teaching draft for this exact framework
          and edition. Consult its cited assessment guide.
        </p>
      </div>
    )
  return (
    <ControlPerspective
      draft={draft}
      lesson={lessonIdentity(control)}
      mode={mode}
      onChange={onChange}
    />
  )
}
