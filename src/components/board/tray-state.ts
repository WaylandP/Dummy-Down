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
  // Smudge nudges the chalk that was picked up out of the tray; putting it back is no gesture.
  if (mode) cueSmudge('hand', mode)
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

/** One gesture per thing the visitor does: which, the chalk if one was picked, and a count so the same kind twice still plays. */
export interface SmudgeCue {
  readonly kind: 'sweep' | 'hand' | 'sneeze'
  readonly mode?: ExplanationMode
  readonly at: number
}

export const SMUDGE_KEY = 'cipher-and-chalk:smudge:v1'

let cue: SmudgeCue | null = null
let cues = 0
let smudgeOn: boolean | null = null

function readSmudgeOn(): boolean {
  if (smudgeOn !== null) return smudgeOn
  try {
    smudgeOn = window.localStorage.getItem(SMUDGE_KEY) !== 'off'
  } catch {
    smudgeOn = true
  }
  return smudgeOn
}

/** Something happened that Smudge answers with one gesture. */
export function cueSmudge(kind: SmudgeCue['kind'], mode?: ExplanationMode) {
  cue = { kind, mode, at: ++cues }
  notify()
}

/** The footer switch; "off" is remembered in the site's own storage namespace. */
export function setSmudgeOn(on: boolean) {
  smudgeOn = on
  try {
    if (on) window.localStorage.removeItem(SMUDGE_KEY)
    else window.localStorage.setItem(SMUDGE_KEY, 'off')
  } catch {
    // Storage is a convenience; the switch still works for this page.
  }
  notify()
}

/** The doodle layer listens for his sweep: his click with marks on the page. */
export function subscribeSmudgeCue(
  listener: (cue: SmudgeCue) => void,
): () => void {
  let last = cue?.at ?? 0
  return subscribe(() => {
    if (!cue || cue.at === last) return
    last = cue.at
    listener(cue)
  })
}

export function useSmudgeCue(): SmudgeCue | null {
  return useSyncExternalStore(
    subscribe,
    () => cue,
    () => null,
  )
}

export function useSmudgeOn(): boolean {
  return useSyncExternalStore(subscribe, readSmudgeOn, () => true)
}
