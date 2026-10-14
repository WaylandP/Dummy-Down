import type { LearningActivity } from '../types/learning'
import type { LessonIdentity } from '../types/content'
import {
  createProgressCatalog,
  decodeLastControl,
  decodeProgress,
  emptyProgress,
  encodeProgress,
  type ActivityProgress,
  type ProgressEntries,
} from './model'

// Storage namespace. Legacy `dummy-down:` keys are migrated once at startup
// by src/storage/migrate-legacy.ts.
export const PROGRESS_CONSENT_KEY = 'cipher-and-chalk:learning-saving:v1'
export const PROGRESS_DATA_KEY = 'cipher-and-chalk:learning-progress:v1'
export const LAST_CONTROL_KEY = 'cipher-and-chalk:last-control:v1'

export interface ProgressPort {
  readonly get: (key: string) => string | null
  readonly set: (key: string, value: string) => void
  readonly remove: (key: string) => void
  readonly privacyBlocked: () => boolean
  readonly listen: (
    listener: (event: {
      readonly external: boolean
      readonly clearHint: boolean
    }) => void,
  ) => () => void
}

export type ProgressMode =
  'loading' | 'off' | 'on' | 'browser-preference' | 'unavailable'
export interface ProgressSnapshot {
  readonly mode: ProgressMode
  readonly entries: ProgressEntries
  readonly discarded: boolean
  readonly deletionUnconfirmed: boolean
  /** The control opened last; stored only while saving is on. */
  readonly lastControl: LessonIdentity | null
  /** In-memory reset counter only; never persisted or sent anywhere. */
  readonly resetEpoch: number
}

const initial: ProgressSnapshot = Object.freeze({
  mode: 'loading',
  entries: Object.freeze({}),
  discarded: false,
  deletionUnconfirmed: false,
  lastControl: null,
  resetEpoch: 0,
})

function freezeEntries(entries: ProgressEntries): ProgressEntries {
  return Object.freeze(
    Object.fromEntries(
      Object.values(entries).map((entry) => [
        entry.activityId,
        Object.freeze({
          ...entry,
          lesson: Object.freeze({ ...entry.lesson }),
          checkedAnswers: Object.freeze({ ...entry.checkedAnswers }),
        }),
      ]),
    ),
  )
}

/** One store per mounted app. Ordinary updates never grant persistence consent. */
export function createLocalProgressStore(
  activities: readonly LearningActivity[],
  port: ProgressPort,
) {
  const catalog = createProgressCatalog(activities)
  const listeners = new Set<() => void>()
  let snapshot = initial
  let locked = false
  /** The control on screen, remembered in memory until saving allows a write. */
  let current: LessonIdentity | null = null

  function publish(next: Partial<ProgressSnapshot>, reset = false) {
    const merged = {
      ...snapshot,
      ...next,
      resetEpoch: snapshot.resetEpoch + Number(reset),
    }
    if (JSON.stringify(merged) === JSON.stringify(snapshot)) return
    snapshot = Object.freeze({
      ...merged,
      entries: freezeEntries(merged.entries),
    })
    listeners.forEach((listener) => listener())
  }

  function eraseStored() {
    let consentRemoved = false
    let dataRemoved = false
    // Revoke first. A racing ordinary writer cannot turn this gate back on.
    try {
      port.remove(PROGRESS_CONSENT_KEY)
      consentRemoved = true
    } catch {
      try {
        port.set(PROGRESS_CONSENT_KEY, 'off')
        consentRemoved = true
      } catch {
        /* report below */
      }
    }
    try {
      port.remove(PROGRESS_DATA_KEY)
      dataRemoved = true
    } catch {
      try {
        port.set(PROGRESS_DATA_KEY, JSON.stringify({ schema: 1, entries: [] }))
        dataRemoved = true
      } catch {
        /* report below */
      }
    }
    let lastRemoved = false
    try {
      port.remove(LAST_CONTROL_KEY)
      lastRemoved = true
    } catch {
      try {
        port.set(LAST_CONTROL_KEY, '')
        lastRemoved = true
      } catch {
        /* report below */
      }
    }
    return consentRemoved && dataRemoved && lastRemoved
  }

  function checkPrivacy() {
    if (port.privacyBlocked()) {
      if (snapshot.mode !== 'browser-preference') {
        locked = true
        const cleared = eraseStored()
        publish({
          mode: 'browser-preference',
          lastControl: null,
          deletionUnconfirmed: !cleared,
        })
      }
      return true
    }
    if (snapshot.mode === 'browser-preference') {
      publish({ mode: 'off' })
      // A removed privacy signal never silently enables saving again.
    }
    return false
  }

  function storageFailure() {
    locked = true
    const cleared = eraseStored()
    publish({
      mode: 'unavailable',
      lastControl: null,
      deletionUnconfirmed: !cleared,
    })
  }

  function readCurrent(event = { external: false, clearHint: false }) {
    if (checkPrivacy()) {
      if (event.clearHint) publish({ entries: {} }, true)
      return
    }
    if (locked) {
      if (event.clearHint) publish({ entries: {} }, true)
      return
    }
    try {
      if (port.get(PROGRESS_CONSENT_KEY) !== 'on') {
        const reset = snapshot.mode === 'on' || event.clearHint
        publish(
          { mode: 'off', lastControl: null, ...(reset ? { entries: {} } : {}) },
          reset,
        )
        // Never read orphaned answer data without an explicit opt-in marker.
        return
      }
      const parsed = decodeProgress(port.get(PROGRESS_DATA_KEY), catalog)
      if (port.get(PROGRESS_CONSENT_KEY) !== 'on') {
        publish({ mode: 'off', entries: {} }, true)
        return
      }
      if (!parsed.valid) {
        const cleared = eraseStored()
        locked = !cleared
        publish(
          {
            mode: 'off',
            entries: {},
            discarded: true,
            deletionUnconfirmed: !cleared,
          },
          true,
        )
        return
      }
      const memoryOnly = Object.fromEntries(
        Object.entries(snapshot.entries).filter(
          ([id, entry]) =>
            !event.clearHint &&
            (entry.contentVersion === null ||
              (snapshot.mode === 'off' && !Object.hasOwn(parsed.entries, id))),
        ),
      )
      // A different tab can enable saving while this page still has unsaved
      // work. Keep distinct activities, but let disk win for shared identities
      // so a restarted attempt cannot be revived from a stale page.
      const entries = { ...memoryOnly, ...parsed.entries }
      const changed =
        JSON.stringify(entries) !== JSON.stringify(snapshot.entries)
      const wasOn = snapshot.mode === 'on'
      publish(
        {
          mode: 'on',
          entries,
          discarded: snapshot.discarded || parsed.discarded,
          lastControl: decodeLastControl(port.get(LAST_CONTROL_KEY)),
        },
        event.clearHint || (event.external && changed),
      )
      if (
        parsed.discarded ||
        Object.values(memoryOnly).some((entry) => entry.contentVersion !== null)
      )
        writeCurrent()
      // Saving just turned on here or in another tab: the control on screen
      // is written once, on the transition, never on every refresh.
      if (!wasOn) writeLastControl()
    } catch {
      if (event.clearHint) publish({ entries: {} }, true)
      storageFailure()
    }
  }

  function writeCurrent() {
    if (checkPrivacy() || snapshot.mode !== 'on' || locked) return
    try {
      if (port.get(PROGRESS_CONSENT_KEY) !== 'on') {
        publish({ mode: 'off', entries: {} }, true)
        return
      }
      port.set(PROGRESS_DATA_KEY, encodeProgress(snapshot.entries, catalog))
      // Close the revoke/write race: consent is separate and cannot be recreated here.
      if (port.get(PROGRESS_CONSENT_KEY) !== 'on') {
        const cleared = eraseStored()
        locked = !cleared
        publish(
          { mode: 'off', entries: {}, deletionUnconfirmed: !cleared },
          true,
        )
      }
    } catch {
      storageFailure()
    }
  }

  /** Write the control on screen once saving is on; consent is checked again first. */
  function writeLastControl() {
    if (!current || snapshot.mode !== 'on' || locked) return false
    try {
      if (port.get(PROGRESS_CONSENT_KEY) !== 'on') {
        publish({ mode: 'off', entries: {}, lastControl: null }, true)
        return false
      }
      port.set(LAST_CONTROL_KEY, JSON.stringify(current))
      // Close the revoke/write race the same way writeCurrent does.
      if (port.get(PROGRESS_CONSENT_KEY) !== 'on') {
        const cleared = eraseStored()
        locked = !cleared
        publish(
          {
            mode: 'off',
            entries: {},
            lastControl: null,
            deletionUnconfirmed: !cleared,
          },
          true,
        )
        return false
      }
      publish({ lastControl: current })
      return true
    } catch {
      storageFailure()
      return false
    }
  }

  function mutate(
    activityId: string,
    update: (
      entry: ActivityProgress,
      activity: LearningActivity,
    ) => ActivityProgress | null,
  ) {
    if (snapshot.mode === 'loading') return false
    checkPrivacy()
    if (snapshot.mode === 'on') readCurrent()
    const activity = catalog.get(activityId)
    if (!activity) return false
    const entry = Object.hasOwn(snapshot.entries, activityId)
      ? snapshot.entries[activityId]!
      : emptyProgress(activity)
    const next = update(entry, activity)
    if (!next) return false
    publish({ entries: { ...snapshot.entries, [activityId]: next } })
    writeCurrent()
    return true
  }

  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => initial,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    connect() {
      readCurrent()
      return port.listen(readCurrent)
    },
    refresh: readCurrent,
    isSupported: (id: string) => catalog.has(id),
    enable() {
      if (checkPrivacy()) return false
      try {
        // A failed delete must not be undone by loading the data it tried to
        // remove. Retry deletion before allowing an explicit new opt-in.
        if (snapshot.deletionUnconfirmed && !eraseStored()) return false
        const alreadyEnabled = port.get(PROGRESS_CONSENT_KEY) === 'on'
        const parsed = alreadyEnabled
          ? decodeProgress(port.get(PROGRESS_DATA_KEY), catalog)
          : { valid: true as const, entries: {}, discarded: false }
        const memoryOnly = Object.fromEntries(
          Object.entries(snapshot.entries).filter(
            ([, entry]) =>
              snapshot.mode !== 'on' ||
              (alreadyEnabled && entry.contentVersion === null),
          ),
        )
        const entries = {
          ...memoryOnly,
          ...(parsed.valid ? parsed.entries : {}),
        }
        const raw = encodeProgress(entries, catalog)
        // Store data first; consent is granted only after the write succeeds.
        port.set(PROGRESS_DATA_KEY, raw)
        // If another tab already enabled saving, this action only joins that
        // session. Do not recreate consent if it was revoked during the write.
        if (!alreadyEnabled) port.set(PROGRESS_CONSENT_KEY, 'on')
        if (alreadyEnabled && port.get(PROGRESS_CONSENT_KEY) !== 'on') {
          const cleared = eraseStored()
          locked = !cleared
          publish(
            { mode: 'off', entries: {}, deletionUnconfirmed: !cleared },
            true,
          )
          return false
        }
        if (
          port.get(PROGRESS_CONSENT_KEY) !== 'on' ||
          port.get(PROGRESS_DATA_KEY) !== raw
        )
          throw new Error('Saved progress could not be read back')
        locked = false
        publish({
          mode: 'on',
          entries,
          discarded: !parsed.valid || parsed.discarded,
          deletionUnconfirmed: false,
        })
        return current ? writeLastControl() : true
      } catch {
        storageFailure()
        return false
      }
    },
    deleteAndDisable() {
      locked = true
      const cleared = eraseStored()
      locked = !cleared
      publish(
        {
          mode: port.privacyBlocked()
            ? 'browser-preference'
            : cleared
              ? 'off'
              : 'unavailable',
          entries: {},
          discarded: false,
          deletionUnconfirmed: !cleared,
          lastControl: null,
        },
        true,
      )
      return cleared
    },
    /** Called by the control page; nothing is written until saving is on. */
    rememberControl(lesson: LessonIdentity) {
      current = lesson
      if (snapshot.mode !== 'on' || locked || checkPrivacy()) return false
      return writeLastControl()
    },
    visit: (id: string) => mutate(id, (entry) => ({ ...entry, visited: true })),
    markRevisit: (id: string, revisit: boolean) =>
      mutate(id, (entry) =>
        typeof revisit === 'boolean' ? { ...entry, revisit } : null,
      ),
    checkAnswer: (id: string, questionId: string, choiceId: string) =>
      mutate(id, (entry, activity) => {
        const question = activity.questions.find(
          (item) => item.id === questionId,
        )
        if (
          entry.completed ||
          entry.currentQuestionId !== questionId ||
          Object.hasOwn(entry.checkedAnswers, questionId) ||
          !question?.choices.some((choice) => choice.id === choiceId)
        )
          return null
        return {
          ...entry,
          visited: true,
          checkedAnswers: { ...entry.checkedAnswers, [questionId]: choiceId },
        }
      }),
    next: (id: string) =>
      mutate(id, (entry, activity) => {
        if (
          entry.completed ||
          !Object.hasOwn(entry.checkedAnswers, entry.currentQuestionId)
        )
          return null
        const index = activity.questions.findIndex(
          (item) => item.id === entry.currentQuestionId,
        )
        return index === activity.questions.length - 1
          ? { ...entry, completed: true }
          : { ...entry, currentQuestionId: activity.questions[index + 1]!.id }
      }),
    retry: (id: string) =>
      mutate(id, (entry) => {
        if (entry.completed) return null
        const answers = { ...entry.checkedAnswers }
        delete answers[entry.currentQuestionId]
        return { ...entry, checkedAnswers: answers }
      }),
    restart: (id: string) =>
      mutate(id, (entry, activity) => ({
        ...emptyProgress(activity),
        visited: true,
        revisit: entry.revisit,
      })),
  }
}

export type LocalProgressStore = ReturnType<typeof createLocalProgressStore>

/** Deliberately separate from analytics consent and deployment gates. */
export function browserProgressPort(): ProgressPort {
  return {
    get: (key) => window.localStorage.getItem(key),
    set: (key, value) => window.localStorage.setItem(key, value),
    remove: (key) => window.localStorage.removeItem(key),
    privacyBlocked: () => {
      const browser = navigator as Navigator & {
        globalPrivacyControl?: boolean
      }
      return (
        browser.doNotTrack === '1' ||
        browser.doNotTrack === 'yes' ||
        browser.globalPrivacyControl === true
      )
    },
    listen(listener) {
      const focus = () => listener({ external: true, clearHint: false })
      const storage = (event: StorageEvent) => {
        if (
          ![
            null,
            PROGRESS_CONSENT_KEY,
            PROGRESS_DATA_KEY,
            LAST_CONTROL_KEY,
          ].includes(event.key)
        )
          return
        try {
          if (event.storageArea && event.storageArea !== window.localStorage)
            return
        } catch {
          /* re-read handles restrictions */
        }
        listener({
          external: true,
          clearHint:
            event.key === null ||
            (event.key === PROGRESS_CONSENT_KEY && event.newValue !== 'on'),
        })
      }
      const visible = () => {
        if (!document.hidden) focus()
      }
      window.addEventListener('focus', focus)
      window.addEventListener('storage', storage)
      document.addEventListener('visibilitychange', visible)
      return () => {
        window.removeEventListener('focus', focus)
        window.removeEventListener('storage', storage)
        document.removeEventListener('visibilitychange', visible)
      }
    },
  }
}
