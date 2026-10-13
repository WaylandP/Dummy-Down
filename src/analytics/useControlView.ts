import { useEffect, useRef } from 'react'
import type { CatalogControl, ExplanationMode } from '../types/content'
import { lessonIdentity, lessonIdentityKey } from '../state/explorer-state'
import { trackUsage } from './usage'

/** A rendered control is not a claim that a reader has studied it. */
export function useControlView(
  control: CatalogControl | null,
  mode: ExplanationMode,
) {
  const lastRendered = useRef<string | null>(null)
  useEffect(() => {
    const lesson = control ? lessonIdentity(control) : null
    const key = lesson ? `${lessonIdentityKey(lesson)}/${mode}` : null
    if (lastRendered.current === key) return
    lastRendered.current = key
    if (lesson) trackUsage({ name: 'control_view', lesson, mode })
  }, [control, mode])
}
