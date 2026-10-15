import { useSyncExternalStore } from 'react'

/** The doodle chalk is offered where the screen has room beside the text. */
export const doodleRoom = '(min-width: 768px)'

export interface DoodleState {
  /** The chalk is in the visitor's hand: the drawing layer is on the content. */
  readonly up: boolean
  /** Strokes on the layer right now; Smudge sweeps them when he is clicked. */
  readonly marks: number
}

let state: DoodleState = { up: false, marks: 0 }
let tray: HTMLButtonElement | null = null
const listeners = new Set<() => void>()

function publish(next: DoodleState) {
  state = next
  listeners.forEach((listener) => listener())
}
function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Phones have no room for it: the stick is not in their tray. */
export function roomToDoodle(): boolean {
  return window.matchMedia?.(doodleRoom).matches ?? true
}

export function isDoodleUp(): boolean {
  return state.up
}

/** Pick the chalk up: the stick leaves the tray and the layer covers the content. */
export function pickUpDoodle() {
  if (state.up || !roomToDoodle()) return
  publish({ up: true, marks: 0 })
}

/** Put it back; the marks go with the layer. Escape also returns focus to the tray. */
export function putDownDoodle(focusTray = false) {
  if (!state.up) return
  publish({ up: false, marks: 0 })
  if (focusTray) tray?.focus()
}

export function toggleDoodle() {
  if (state.up) putDownDoodle()
  else pickUpDoodle()
}

/** The layer reports how many strokes it holds. */
export function setDoodleMarks(marks: number) {
  if (state.marks === marks) return
  publish({ ...state, marks })
}

/** The stick's button in the tray, where Escape sends focus back. */
export function registerDoodleTray(button: HTMLButtonElement | null) {
  tray = button
}

export function useDoodle(): DoodleState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  )
}

/** Only whether the chalk is up: the shell renders nothing per stroke. */
export function useDoodleUp(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => state.up,
    () => state.up,
  )
}
