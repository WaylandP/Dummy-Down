import { useEffect, useState } from 'react'
import type { ReferenceControl } from '../../types/content'
import type { ControlPerspectiveDraft } from '../../types/perspectives'

type PerspectiveModule = typeof import('../../data/cmmc-perspectives')

export type PerspectiveDraftState =
  | { readonly status: 'loading' }
  | { readonly status: 'failed' }
  | { readonly status: 'pending' }
  | { readonly status: 'ready'; readonly draft: ControlPerspectiveDraft }

/** The teaching drafts load on demand; the requirement stays readable without them. */
export function usePerspectiveDraft(
  control: ReferenceControl,
): PerspectiveDraftState {
  const [content, setContent] = useState<PerspectiveModule | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let active = true
    import('../../data/cmmc-perspectives')
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
  if (!content) return failed ? { status: 'failed' } : { status: 'loading' }
  const draft = content.findCmmcPerspective(control)
  return draft ? { status: 'ready', draft } : { status: 'pending' }
}
