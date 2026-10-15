import { useSyncExternalStore } from 'react'
import type { ExplanationMode } from '../../types/content'

/** With a control on the board the tray's chalks pick its perspective. */
export interface TrayControl {
  /** Pick a chalk: the explanation opens in that colour. */
  readonly pick: (mode: ExplanationMode) => void
}

let lifted: ExplanationMode | null = null
let control: TrayControl | null = null
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((listener) => listener())
}

/** Which chalk is in the visitor's hand; null while no explanation is open. */
export function setLiftedChalk(mode: ExplanationMode | null) {
  if (lifted === mode) return
  lifted = mode
  notify()
}

/** The control on the board, or null on every other page. */
export function setTrayControl(next: TrayControl | null) {
  if (control === next) return
  control = next
  notify()
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

export function useTrayControl(): TrayControl | null {
  return useSyncExternalStore(
    subscribe,
    () => control,
    () => null,
  )
}
