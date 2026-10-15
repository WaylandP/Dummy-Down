import { useSyncExternalStore } from 'react'
import { explorerCatalog } from '../../data/content'
import { subscribeAddress } from '../../state/address'
import { readChalkPreference } from '../../state/chalk-preference'
import { sitePage } from '../../state/site-page'
import {
  parseExplorerSearch,
  serializeExplorerSearch,
} from '../../state/explorer-state'
import type { Point } from './doodle-path'
import {
  decodeInk,
  encodeInk,
  inkLimit,
  inkScale,
  isInkFragment,
  simplifyStroke,
} from './ink'
import { cueSmudge } from './tray-state'

/** The doodle chalk is offered where the screen has room beside the text. */
export const doodleRoom = '(min-width: 768px)'

/** One stroke of chalk: whole pixels relative to the content area it was drawn on. */
export interface Mark {
  readonly id: number
  readonly points: readonly Point[]
}

interface PageMarks {
  /** The content area's width when the first of them was drawn. */
  readonly width: number
  readonly marks: readonly Mark[]
  /** They arrived in a link someone made, and were not drawn here. */
  readonly foreign: boolean
  /** Counts up with every change, so the address knows when it is behind. */
  readonly version: number
}

export interface DoodleState {
  /** The chalk is in the visitor's hand: the layer takes strokes. */
  readonly up: boolean
  /** Smudge is in the visitor's hand: rubbing a stroke takes it away. */
  readonly eraser: boolean
  /** The page the marks belong to: its address, in canonical form. */
  readonly page: string
  /** This page's marks, drawn at `width`. */
  readonly marks: readonly Mark[]
  readonly width: number
  readonly foreign: boolean
  /** The link is at its cap: no stroke is added until one is erased. */
  readonly full: boolean
  /** The content area's width right now; 0 until the layer has measured it. */
  readonly room: number
  /** The fragment carrying this page's marks, once written to the address. */
  readonly hash: string
}

const empty: PageMarks = { width: 0, marks: [], foreign: false, version: 0 }
/** In the history entry's state: whose marks the fragment carries. */
const ownMarker = 'mine'
const theirMarker = 'theirs'
/** On the root path these fragments are pages of their own, never marks. */
const legacyHashes = [
  '#glossary',
  '#about',
  '#approach',
  '#explorer',
  '#control-search',
]

let state: DoodleState = {
  up: false,
  eraser: false,
  page: '',
  marks: [],
  width: 0,
  foreign: false,
  full: false,
  room: 0,
  hash: '',
}
/** Every page's marks, for the tab's lifetime: memory only, never storage. */
const pages = new Map<string, PageMarks>()
let chalkTray: HTMLButtonElement | null = null
let smudgeTray: HTMLButtonElement | null = null
let nextId = 1
/** The last fragment written, for which page and which version of its marks. */
let written: { page: string; version: number; hash: string } | null = null
let decoding = 0
let writing = 0
let listening = false
/** The address the marks were last read for. */
let synced = ''
const listeners = new Set<() => void>()

function publish(next: DoodleState) {
  state = next
  listeners.forEach((listener) => listener())
}
function subscribe(listener: () => void) {
  listen()
  // A page mounted on an address that changed without a word still gets its marks.
  if (window.location.href !== synced) sync()
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Phones have no room for the chalk: the stick is not in their tray. */
export function roomToDoodle(): boolean {
  return window.matchMedia?.(doodleRoom).matches ?? true
}

/** The marks belong to a page: its address in canonical form, so every route to it finds them. */
export function doodlePage(): string {
  const { pathname, search, hash } = window.location
  if (legacyRoute()) return `${pathname}${search}${hash}`
  if (sitePage(new URL(window.location.href)) === 'learn') {
    // A control reached from the rail and one from a pasted link are the
    // same page: the explorer's canonical address says so, in the chalk the
    // visitor picked when the address names none.
    const parsed = parseExplorerSearch(search, explorerCatalog, {
      defaultMode: readChalkPreference() ?? 'beginner',
    })
    if (parsed.kind === 'ready')
      return `${pathname}${serializeExplorerSearch(parsed.state)}`
  }
  return `${pathname}${search}`
}

/** A historical section link on the root path: its fragment is the page. */
function legacyRoute(): boolean {
  const { pathname, hash } = window.location
  return pathname.replace(/\/$/, '') === '' && legacyHashes.includes(hash)
}

function addressWithoutMarks(): string {
  const { pathname, search, hash } = window.location
  return `${pathname}${search}${isInkFragment(hash) ? '' : hash}`
}

function replaceAddress(state: unknown, address: string): boolean {
  try {
    window.history.replaceState(state, '', address)
  } catch {
    return false
  }
  synced = window.location.href
  return true
}

function stateFor(page: string, marks: PageMarks): DoodleState {
  return {
    ...state,
    page,
    marks: marks.marks,
    width: marks.width,
    foreign: marks.foreign,
    hash: written?.page === page ? written.hash : '',
  }
}

/** The address is read once a listener wants the marks, then on every change. */
function listen() {
  if (listening) return
  listening = true
  subscribeAddress(sync)
  sync()
}

/** The marks follow the address: this page's from memory, else from its fragment. */
function sync() {
  synced = window.location.href
  const page = doodlePage()
  const hash = window.location.hash
  const mine = pages.get(page)
  const changed = page !== state.page
  if (mine) {
    publish({
      ...stateFor(page, mine),
      eraser: changed ? false : state.eraser,
      full: changed ? false : state.full,
    })
    if (!(
      written?.page === page &&
      written.version === mine.version &&
      written.hash === hash
    ))
      void writeFragment(page)
    return
  }
  publish({
    ...stateFor(page, empty),
    eraser: false,
    full: changed ? false : state.full,
  })
  if (!isInkFragment(hash)) return
  if (written && written.hash === hash && written.page !== page) {
    // The address kept the last page's fragment: it is not this page's.
    replaceAddress(window.history.state, addressWithoutMarks())
    return
  }
  const mark = ++decoding
  void decodeInk(hash).then((ink) => {
    if (!ink || mark !== decoding || doodlePage() !== page) return
    if (pages.has(page)) return
    const marker = (window.history.state as { ink?: unknown } | null)?.ink
    const arrived: PageMarks = {
      width: ink.width,
      marks: ink.strokes.map((points) => ({ id: nextId++, points })),
      foreign: marker !== ownMarker,
      version: 1,
    }
    pages.set(page, arrived)
    // The address may have been rewritten meanwhile (the explorer tidying a
    // chalk link): the marks go back into it, still marked as whose they are.
    if (window.location.hash !== hash) void writeFragment(page)
    else {
      written = { page, version: arrived.version, hash }
      // An entry that says nothing about them says so from now on.
      if (marker !== ownMarker && marker !== theirMarker)
        replaceAddress(
          {
            ...((window.history.state as object | null) ?? {}),
            ink: theirMarker,
          },
          window.location.href,
        )
    }
    publish(stateFor(page, arrived))
  })
}

/**
 * The page's marks go into its address, as the fragment, with a marker in the
 * entry's state that says they were drawn here. A reload keeps both; a link
 * someone else opens carries the fragment alone.
 */
async function writeFragment(page: string) {
  // A historical section link is a page of its own: its fragment stays.
  if (legacyRoute()) return
  const mark = ++writing
  for (;;) {
    const current = pages.get(page)
    if (!current || current.marks.length === 0) {
      if (mark !== writing || doodlePage() !== page) return
      if (written?.page === page) written = null
      if (isInkFragment(window.location.hash))
        replaceAddress(window.history.state, addressWithoutMarks())
      if (state.page === page) publish({ ...state, hash: '', full: false })
      return
    }
    const hash = await encodeInk({
      width: current.width,
      strokes: current.marks.map((item) => item.points),
    })
    if (mark !== writing || doodlePage() !== page) return
    if (hash.length > inkLimit) {
      // The board is full: the last stroke comes off, and no more are taken.
      const latest = pages.get(page)
      if (!latest || latest.marks.length === 0) return
      const kept = {
        ...latest,
        marks: latest.marks.slice(0, -1),
        version: latest.version + 1,
      }
      pages.set(page, kept)
      if (state.page === page) publish({ ...stateFor(page, kept), full: true })
      continue
    }
    const marker = window.history.state as { ink?: unknown } | null
    if (
      !replaceAddress(
        { ...(marker ?? {}), ink: current.foreign ? theirMarker : ownMarker },
        `${window.location.pathname}${window.location.search}${hash}`,
      )
    )
      return
    written = { page, version: current.version, hash }
    if (state.page === page) publish({ ...state, hash })
    return
  }
}

export function isDoodleUp(): boolean {
  return state.up
}
export function isSmudgeUp(): boolean {
  return state.eraser
}

/** Whether this page's marks are drawn: the screen is about as wide as the one they were drawn on. */
export function marksShown(current: DoodleState = state): boolean {
  return (
    current.marks.length > 0 && inkScale(current.width, current.room) !== null
  )
}

/** Pick the chalk up: the stick leaves the tray and the layer takes strokes. Smudge goes back. */
export function pickUpDoodle() {
  if (state.up || !roomToDoodle()) return
  listen()
  publish({ ...state, up: true, eraser: false })
}

/** Put it back; the marks stay. Escape also returns focus to the tray. */
export function putDownDoodle(focusTray = false) {
  if (!state.up) return
  publish({ ...state, up: false })
  if (focusTray) chalkTray?.focus()
}

export function toggleDoodle() {
  if (state.up) putDownDoodle()
  else pickUpDoodle()
}

/** Pick Smudge up, while the page shows marks: the chalk goes back. */
export function pickUpSmudge(focusTray = false) {
  if (state.eraser || !marksShown()) return
  publish({ ...state, eraser: true, up: false })
  if (focusTray) smudgeTray?.focus()
}

/** Put him back; Escape also returns focus to his place on the tray. */
export function putDownSmudge(focusTray = false) {
  if (!state.eraser) return
  publish({ ...state, eraser: false })
  if (focusTray) smudgeTray?.focus()
}

export function toggleSmudge() {
  if (state.eraser) putDownSmudge()
  else pickUpSmudge()
}

/** Escape puts down whichever is in hand, Smudge first; true when something was. */
export function putDownHeld(focusTray = false): boolean {
  if (state.eraser) {
    putDownSmudge(focusTray)
    return true
  }
  if (state.up) {
    putDownDoodle(focusTray)
    return true
  }
  return false
}

/** The layer reports the content area's width, on which the marks are anchored. */
export function setDoodleRoom(room: number) {
  if (state.room === room) return
  publish({ ...state, room })
  if (!marksShown()) publish({ ...state, eraser: false })
}

/** A stroke from the chalk, in the page's own pixels. */
export function addMark(points: readonly Point[]) {
  if (state.full || !state.up) return
  const page = state.page
  const current = pages.get(page) ?? empty
  const simplified = simplifyStroke(points)
  if (simplified.length === 0) return
  const next: PageMarks = {
    width: current.width || state.room,
    marks: [...current.marks, { id: nextId++, points: simplified }],
    foreign: current.foreign,
    version: current.version + 1,
  }
  pages.set(page, next)
  publish(stateFor(page, next))
  void writeFragment(page)
}

/** Strokes rubbed out, or wiped: they leave the page and its link. */
export function eraseMarks(ids: readonly number[]) {
  const page = state.page
  const current = pages.get(page)
  if (!current || ids.length === 0) return
  const gone = new Set(ids)
  const marks = current.marks.filter((item) => !gone.has(item.id))
  if (marks.length === current.marks.length) return
  const next: PageMarks = {
    width: current.width,
    marks,
    foreign: marks.length > 0 && current.foreign,
    version: current.version + 1,
  }
  if (marks.length === 0) pages.delete(page)
  else pages.set(page, next)
  publish({
    ...stateFor(page, marks.length ? next : empty),
    eraser: marks.length ? state.eraser : false,
    full: false,
  })
  void writeFragment(page)
}

/** Every mark on the page goes, with Smudge's sweep; he is back on the tray. */
export function wipeMarks() {
  if (state.marks.length === 0) return
  cueSmudge('sweep')
  eraseMarks(state.marks.map((item) => item.id))
}

/** The stick's button in the tray, where Escape sends focus back. */
export function registerDoodleTray(button: HTMLButtonElement | null) {
  chalkTray = button
}
/** Smudge's button in the tray, the same for him. */
export function registerSmudgeTray(button: HTMLButtonElement | null) {
  smudgeTray = button
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

/** The fragment that carries this page's marks, for links that should take them along. */
export function useDoodleHash(): string {
  return useSyncExternalStore(
    subscribe,
    () => state.hash,
    () => '',
  )
}

/** Tests start each case from an empty board. */
export function resetDoodle() {
  pages.clear()
  written = null
  decoding += 1
  writing += 1
  state = {
    ...state,
    up: false,
    eraser: false,
    page: '',
    marks: [],
    width: 0,
    foreign: false,
    full: false,
    hash: '',
  }
  if (listening) sync()
}
