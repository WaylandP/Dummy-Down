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
  // Dash hands over the chalk that was picked; putting it back is no gesture.
  if (mode) cueDash('hand')
  else notify()
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

/** One gesture per interaction: which, and a count so the same kind twice still plays. */
export interface DashCue {
  readonly kind: 'hand' | 'sweep' | 'nod' | 'dot'
  readonly at: number
}

export const DASH_KEY = 'cipher-and-chalk:dash:v1'

let cue: DashCue | null = null
let cues = 0
let dashOn: boolean | null = null

function readDashOn(): boolean {
  if (dashOn !== null) return dashOn
  try {
    dashOn = window.localStorage.getItem(DASH_KEY) !== 'off'
  } catch {
    dashOn = true
  }
  return dashOn
}

/** Something happened that Dash answers with one gesture. */
export function cueDash(kind: DashCue['kind']) {
  cue = { kind, at: ++cues }
  notify()
}

/** The footer switch; "off" is remembered in the site's own storage namespace. */
export function setDashOn(on: boolean) {
  dashOn = on
  try {
    if (on) window.localStorage.removeItem(DASH_KEY)
    else window.localStorage.setItem(DASH_KEY, 'off')
  } catch {
    // Storage is a convenience; the switch still works for this page.
  }
  notify()
}

export function useDashCue(): DashCue | null {
  return useSyncExternalStore(
    subscribe,
    () => cue,
    () => null,
  )
}

export function useDashOn(): boolean {
  return useSyncExternalStore(subscribe, readDashOn, () => true)
}
