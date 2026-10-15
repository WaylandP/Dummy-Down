import { useSyncExternalStore } from 'react'
import type { ExplanationMode } from '../../types/content'

/** Which chalk is in the visitor's hand; the control page sets it, the tray shows it. */
let lifted: ExplanationMode | null = null
const listeners = new Set<() => void>()

export function setLiftedChalk(mode: ExplanationMode | null) {
  if (lifted === mode) return
  lifted = mode
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useLiftedChalk(): ExplanationMode | null {
  return useSyncExternalStore(
    subscribe,
    () => lifted,
    () => null,
  )
}
