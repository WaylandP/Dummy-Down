import { describe, expect, it, vi } from 'vitest'
import { learningActivities } from '../data/learning'
import type { LearningActivity } from '../types/learning'
import {
  createProgressCatalog,
  decodeProgress,
  emptyProgress,
  encodeProgress,
  MAX_PROGRESS_LENGTH,
  questionsToRevisit,
} from './model'
import {
  createLocalProgressStore,
  LAST_CONTROL_KEY,
  PROGRESS_CONSENT_KEY,
  PROGRESS_DATA_KEY,
  type ProgressPort,
} from './store'

const activity = learningActivities[0]!
const other = learningActivities[1]!
const question = activity.questions[0]!
const catalog = createProgressCatalog(learningActivities)

function harness(shared = new Map<string, string>()) {
  const listeners = new Set<Parameters<ProgressPort['listen']>[0]>()
  const failure = { read: false, write: false, remove: false, privacy: false }
  let afterWrite: ((key: string) => void) | undefined
  const port: ProgressPort = {
    get: vi.fn((key) => {
      if (failure.read) throw new Error('Storage blocked')
      return shared.get(key) ?? null
    }),
    set: vi.fn((key, value) => {
      if (failure.write) throw new Error('Quota exhausted')
      shared.set(key, value)
      afterWrite?.(key)
    }),
    remove: vi.fn((key) => {
      if (failure.remove) throw new Error('Deletion blocked')
      shared.delete(key)
    }),
    privacyBlocked: () => failure.privacy,
    listen: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
  return {
    shared,
    failure,
    port,
    setAfterWrite(callback: (key: string) => void) {
      afterWrite = callback
    },
    emit(clearHint = false) {
      listeners.forEach((listener) => listener({ external: true, clearHint }))
    },
    listenerCount: () => listeners.size,
  }
}

function checkedEntry(item = activity) {
  return {
    ...emptyProgress(item),
    visited: true,
    checkedAnswers: {
      [item.questions[0]!.id]: item.questions[0]!.choices[0]!.id,
    },
  }
}

function rawEntries(entries: unknown[]) {
  return JSON.stringify({ schema: 1, entries })
}

describe('bounded local progress validation', () => {
  it('admits the actual versioned catalog and round-trips public IDs only', () => {
    expect(catalog.size).toBe(learningActivities.length)
    expect(learningActivities.every((item) => item.contentVersion)).toBe(true)
    const entry = checkedEntry()
    const encoded = encodeProgress({ [activity.id]: entry }, catalog)
    expect(decodeProgress(encoded, catalog)).toEqual({
      valid: true,
      entries: { [activity.id]: entry },
      discarded: false,
    })
    expect(Object.keys(JSON.parse(encoded))).toEqual(['schema', 'entries'])
    expect(encoded).not.toContain(question.prompt)
    expect(encoded).not.toContain(question.choices[0]!.label)
    expect(encoded).not.toMatch(/timestamp|visitor|analytics|search/i)
  })

  it.each([
    '',
    '{broken',
    'null',
    '[]',
    JSON.stringify({ schema: 99, entries: [] }),
    JSON.stringify({ schema: 1, entries: [], rawSearch: 'private words' }),
    ' '.repeat(MAX_PROGRESS_LENGTH + 1),
    rawEntries([checkedEntry(), checkedEntry()]),
  ])('rejects a malformed, unknown, oversized or ambiguous document', (raw) => {
    expect(decodeProgress(raw, catalog)).toEqual({ valid: false })
  })

  it.each([
    { ...checkedEntry(), contentVersion: 'older' },
    { ...checkedEntry(), activityId: 'not-in-catalog' },
    {
      ...checkedEntry(),
      lesson: { ...activity.lesson, editionId: 'other-edition' },
    },
    { ...checkedEntry(), lesson: other.lesson },
    { ...checkedEntry(), checkedAnswers: { [question.id]: 'unknown-choice' } },
    {
      ...checkedEntry(),
      checkedAnswers: { [question.id]: other.questions[0]!.choices[0]!.id },
    },
    {
      ...checkedEntry(),
      checkedAnswers: {
        [activity.questions[1]!.id]: activity.questions[1]!.choices[0]!.id,
      },
    },
    { ...checkedEntry(), completed: true },
    { ...checkedEntry(), visited: false },
    { ...checkedEntry(), currentQuestionId: 'unknown-question' },
    { ...checkedEntry(), freeText: 'organization evidence' },
    {
      ...checkedEntry(),
      checkedAnswers: JSON.parse('{"__proto__":"unknown-choice"}'),
    },
  ])(
    'drops an invalid entry while retaining a different healthy activity',
    (badEntry) => {
      const healthy = checkedEntry(other)
      expect(decodeProgress(rawEntries([badEntry, healthy]), catalog)).toEqual({
        valid: true,
        entries: { [other.id]: healthy },
        discarded: true,
      })
    },
  )

  it('drops only the edited activity when its actual contentVersion changes', () => {
    const updated: LearningActivity = {
      ...activity,
      contentVersion: '2026-10-14.2',
    }
    const nextCatalog = createProgressCatalog([updated, other])
    expect(
      decodeProgress(
        rawEntries([checkedEntry(), checkedEntry(other)]),
        nextCatalog,
      ),
    ).toEqual({
      valid: true,
      entries: { [other.id]: checkedEntry(other) },
      discarded: true,
    })
  })

  it('does not admit duplicate IDs or persist an unversioned activity', () => {
    expect(createProgressCatalog([activity, activity]).size).toBe(0)
    const unversioned: LearningActivity = {
      ...activity,
      contentVersion: undefined,
    }
    const localCatalog = createProgressCatalog([unversioned])
    expect(
      encodeProgress(
        { [unversioned.id]: emptyProgress(unversioned) },
        localCatalog,
      ),
    ).toBe(rawEntries([]))
  })
})

describe('optional progress store', () => {
  it('sanitizes a stale activity version on refresh while retaining unrelated saved work', () => {
    const env = harness(
      new Map([
        [PROGRESS_CONSENT_KEY, 'on'],
        [PROGRESS_DATA_KEY, rawEntries([checkedEntry(), checkedEntry(other)])],
      ]),
    )
    const updated = learningActivities.map((item) =>
      item.id === activity.id
        ? { ...item, contentVersion: '2026-10-14.2' }
        : item,
    )
    const store = createLocalProgressStore(updated, env.port)
    store.connect()
    expect(store.getSnapshot()).toMatchObject({ mode: 'on', discarded: true })
    expect(Object.keys(store.getSnapshot().entries)).toEqual([other.id])
    expect(
      JSON.parse(env.shared.get(PROGRESS_DATA_KEY)!).entries.map(
        (entry: { activityId: string }) => entry.activityId,
      ),
    ).toEqual([other.id])
  })

  it('starts off, preserves normal in-memory learning and does not access the data key without consent', () => {
    const env = harness()
    const store = createLocalProgressStore(learningActivities, env.port)
    const disconnect = store.connect()
    expect(store.getSnapshot().mode).toBe('off')
    expect(
      store.checkAnswer(activity.id, question.id, question.choices[0]!.id),
    ).toBe(true)
    expect(store.getSnapshot().entries[activity.id]?.checkedAnswers).toEqual(
      checkedEntry().checkedAnswers,
    )
    expect(env.port.get).not.toHaveBeenCalledWith(PROGRESS_DATA_KEY)
    expect(env.port.set).not.toHaveBeenCalled()
    env.emit()
    expect(store.getSnapshot().entries[activity.id]?.checkedAnswers).toEqual(
      checkedEntry().checkedAnswers,
    )
    disconnect()
    expect(env.listenerCount()).toBe(0)
  })

  it('restores checked feedback, current question, completion and revisit after refresh', () => {
    const env = harness()
    const store = createLocalProgressStore(learningActivities, env.port)
    store.connect()
    store.enable()
    store.checkAnswer(activity.id, question.id, question.choices[0]!.id)
    const restored = createLocalProgressStore(learningActivities, env.port)
    restored.connect()
    expect(restored.getSnapshot().entries[activity.id]).toEqual(
      store.getSnapshot().entries[activity.id],
    )
    expect(restored.next(activity.id)).toBe(true)
    expect(restored.getSnapshot().entries[activity.id]?.currentQuestionId).toBe(
      activity.questions[1]!.id,
    )
    for (const item of activity.questions.slice(1)) {
      restored.checkAnswer(activity.id, item.id, item.correctChoiceId)
      restored.next(activity.id)
    }
    restored.markRevisit(activity.id, true)
    const completed = createLocalProgressStore(learningActivities, env.port)
    completed.connect()
    const entry = completed.getSnapshot().entries[activity.id]!
    expect(entry.completed).toBe(true)
    expect(entry.revisit).toBe(true)
    expect(questionsToRevisit(activity, entry).map((item) => item.id)).toEqual([
      question.id,
    ])
  })

  it.each(['refresh', 'enable'] as const)(
    'retains distinct unsaved work when a second tab %s after another tab enables saving',
    (action) => {
      const env = harness()
      const secondEnv = harness(env.shared)
      const first = createLocalProgressStore(learningActivities, env.port)
      const second = createLocalProgressStore(
        learningActivities,
        secondEnv.port,
      )
      first.connect()
      second.connect()
      first.checkAnswer(activity.id, question.id, question.correctChoiceId)
      const otherQuestion = other.questions[0]!
      second.checkAnswer(
        other.id,
        otherQuestion.id,
        otherQuestion.correctChoiceId,
      )
      expect(env.shared.size).toBe(0)
      first.enable()
      if (action === 'refresh') secondEnv.emit()
      else expect(second.enable()).toBe(true)
      expect(second.getSnapshot().mode).toBe('on')
      expect(second.getSnapshot().entries[activity.id]?.checkedAnswers).toEqual(
        {
          [question.id]: question.correctChoiceId,
        },
      )
      expect(second.getSnapshot().entries[other.id]?.checkedAnswers).toEqual({
        [otherQuestion.id]: otherQuestion.correctChoiceId,
      })
      // The merge must reach disk; a later normal read must not lose it again.
      secondEnv.emit()
      env.emit()
      const restored = createLocalProgressStore(learningActivities, env.port)
      restored.connect()
      expect(restored.getSnapshot().entries).toEqual(
        second.getSnapshot().entries,
      )
      expect(first.getSnapshot().entries).toEqual(second.getSnapshot().entries)
      expect(Object.keys(restored.getSnapshot().entries)).toHaveLength(2)
    },
  )

  it.each(['refresh', 'enable'] as const)(
    'keeps a saved restart authoritative when a previously off tab %s',
    (action) => {
      const env = harness()
      const secondEnv = harness(env.shared)
      const first = createLocalProgressStore(learningActivities, env.port)
      const second = createLocalProgressStore(
        learningActivities,
        secondEnv.port,
      )
      first.connect()
      second.connect()
      second.checkAnswer(activity.id, question.id, question.correctChoiceId)
      first.enable()
      first.checkAnswer(activity.id, question.id, question.correctChoiceId)
      first.restart(activity.id)
      if (action === 'refresh') secondEnv.emit()
      else second.enable()
      expect(second.getSnapshot().entries[activity.id]?.checkedAnswers).toEqual(
        {},
      )
      expect(second.getSnapshot().entries).toEqual(first.getSnapshot().entries)
    },
  )

  it('lets an external clear discard unsaved work even if another tab has already enabled again', () => {
    const env = harness()
    const secondEnv = harness(env.shared)
    const first = createLocalProgressStore(learningActivities, env.port)
    const second = createLocalProgressStore(learningActivities, secondEnv.port)
    first.connect()
    second.connect()
    second.checkAnswer(activity.id, question.id, question.correctChoiceId)
    first.deleteAndDisable()
    first.enable()
    first.visit(other.id)
    secondEnv.emit(true)
    expect(second.getSnapshot().entries[activity.id]).toBeUndefined()
    expect(second.getSnapshot().entries).toEqual(first.getSnapshot().entries)
    expect(second.getSnapshot().resetEpoch).toBeGreaterThan(0)
    secondEnv.emit()
    expect(second.getSnapshot().entries[activity.id]).toBeUndefined()
  })

  it('does not re-create consent when a second tab enables during a revoke/write race', () => {
    const env = harness()
    const secondEnv = harness(env.shared)
    const first = createLocalProgressStore(learningActivities, env.port)
    const second = createLocalProgressStore(learningActivities, secondEnv.port)
    first.connect()
    second.connect()
    second.checkAnswer(activity.id, question.id, question.correctChoiceId)
    first.enable()
    secondEnv.setAfterWrite((key) => {
      if (key === PROGRESS_DATA_KEY) env.shared.delete(PROGRESS_CONSENT_KEY)
    })
    expect(second.enable()).toBe(false)
    expect(second.getSnapshot()).toMatchObject({ mode: 'off', entries: {} })
    expect(env.shared.size).toBe(0)
    expect(secondEnv.port.set).not.toHaveBeenCalledWith(
      PROGRESS_CONSENT_KEY,
      'on',
    )
  })

  it('validates actions, never saves an unchecked selection, and supports retry and restart', () => {
    const env = harness()
    const store = createLocalProgressStore(learningActivities, env.port)
    store.connect()
    store.enable()
    expect(store.next(activity.id)).toBe(false)
    expect(
      store.checkAnswer(
        activity.id,
        activity.questions[1]!.id,
        activity.questions[1]!.correctChoiceId,
      ),
    ).toBe(false)
    expect(store.checkAnswer(activity.id, question.id, 'not-a-choice')).toBe(
      false,
    )
    expect(
      store.checkAnswer('unknown', question.id, question.correctChoiceId),
    ).toBe(false)
    expect(store.getSnapshot().entries).toEqual({})
    store.checkAnswer(activity.id, question.id, question.choices[0]!.id)
    expect(
      store.checkAnswer(activity.id, question.id, question.correctChoiceId),
    ).toBe(false)
    store.retry(activity.id)
    expect(store.getSnapshot().entries[activity.id]?.checkedAnswers).toEqual({})
    expect(store.next(activity.id)).toBe(false)
    store.checkAnswer(activity.id, question.id, question.correctChoiceId)
    store.next(activity.id)
    store.markRevisit(activity.id, true)
    store.restart(activity.id)
    expect(store.getSnapshot().entries[activity.id]).toEqual({
      ...emptyProgress(activity),
      visited: true,
      revisit: true,
    })
  })

  it('keeps unversioned work in memory even while other activities are saved', () => {
    const env = harness()
    const unversioned = { ...activity, contentVersion: undefined }
    const store = createLocalProgressStore([unversioned, other], env.port)
    store.connect()
    store.enable()
    store.checkAnswer(activity.id, question.id, question.correctChoiceId)
    store.next(activity.id)
    expect(store.getSnapshot().entries[activity.id]?.currentQuestionId).toBe(
      activity.questions[1]!.id,
    )
    expect(JSON.parse(env.shared.get(PROGRESS_DATA_KEY)!).entries).toEqual([])
  })

  it('rejects corrupted persisted content and discloses the reset without breaking practice', () => {
    const env = harness(
      new Map([
        [PROGRESS_CONSENT_KEY, 'on'],
        [PROGRESS_DATA_KEY, '{broken'],
      ]),
    )
    const store = createLocalProgressStore(learningActivities, env.port)
    store.connect()
    expect(store.getSnapshot()).toMatchObject({
      mode: 'off',
      discarded: true,
      entries: {},
    })
    expect(env.shared.has(PROGRESS_DATA_KEY)).toBe(false)
    expect(
      store.checkAnswer(activity.id, question.id, question.correctChoiceId),
    ).toBe(true)
  })

  it('continues in memory after a storage read exception', () => {
    const env = harness()
    env.failure.read = true
    const store = createLocalProgressStore(learningActivities, env.port)
    store.connect()
    expect(store.getSnapshot().mode).toBe('unavailable')
    expect(
      store.checkAnswer(activity.id, question.id, question.correctChoiceId),
    ).toBe(true)
    expect(store.next(activity.id)).toBe(true)
  })

  it('retains this page’s checked answer after a quota failure and does not silently resume writing', () => {
    const env = harness()
    const store = createLocalProgressStore(learningActivities, env.port)
    store.connect()
    store.enable()
    env.failure.write = true
    store.checkAnswer(activity.id, question.id, question.correctChoiceId)
    expect(store.getSnapshot().mode).toBe('unavailable')
    expect(
      store.getSnapshot().entries[activity.id]?.checkedAnswers[question.id],
    ).toBe(question.correctChoiceId)
    expect(env.shared.has(PROGRESS_CONSENT_KEY)).toBe(false)
    env.failure.write = false
    env.emit()
    store.next(activity.id)
    expect(store.getSnapshot().mode).toBe('unavailable')
    expect(store.enable()).toBe(true)
    expect(store.getSnapshot().mode).toBe('on')
  })

  it('rejects persistence under browser privacy signals and never resumes it automatically', () => {
    const env = harness()
    const store = createLocalProgressStore(learningActivities, env.port)
    store.connect()
    store.enable()
    store.checkAnswer(activity.id, question.id, question.correctChoiceId)
    env.failure.privacy = true
    env.emit()
    expect(store.getSnapshot().mode).toBe('browser-preference')
    expect(store.enable()).toBe(false)
    expect(env.shared.has(PROGRESS_CONSENT_KEY)).toBe(false)
    expect(env.shared.has(PROGRESS_DATA_KEY)).toBe(false)
    expect(store.next(activity.id)).toBe(true)
    env.failure.privacy = false
    env.emit()
    expect(store.getSnapshot().mode).toBe('off')
    expect(env.shared.has(PROGRESS_CONSENT_KEY)).toBe(false)
    expect(store.enable()).toBe(true)
  })

  it('deletes memory and disk, turns saving off, and prevents another tab restoring old answers', () => {
    const env = harness()
    const secondEnv = harness(env.shared)
    const first = createLocalProgressStore(learningActivities, env.port)
    const second = createLocalProgressStore(learningActivities, secondEnv.port)
    first.connect()
    first.enable()
    first.checkAnswer(activity.id, question.id, question.correctChoiceId)
    first.next(activity.id)
    second.connect()
    expect(second.getSnapshot().entries[activity.id]?.currentQuestionId).toBe(
      activity.questions[1]!.id,
    )
    first.deleteAndDisable()
    // Even before a storage event arrives, the next write rechecks consent.
    expect(
      second.checkAnswer(
        activity.id,
        activity.questions[1]!.id,
        activity.questions[1]!.correctChoiceId,
      ),
    ).toBe(false)
    expect(second.getSnapshot()).toMatchObject({ mode: 'off', entries: {} })
    secondEnv.emit(true)
    expect(second.getSnapshot().entries).toEqual({})
    expect(env.shared.size).toBe(0)
    const refreshed = createLocalProgressStore(learningActivities, env.port)
    refreshed.connect()
    expect(refreshed.getSnapshot()).toMatchObject({ mode: 'off', entries: {} })
  })

  it('checks revocation again after a racing data write and never restores the consent marker', () => {
    const env = harness()
    const store = createLocalProgressStore(learningActivities, env.port)
    store.connect()
    store.enable()
    env.setAfterWrite((key) => {
      if (key === PROGRESS_DATA_KEY) env.shared.delete(PROGRESS_CONSENT_KEY)
    })
    store.checkAnswer(activity.id, question.id, question.correctChoiceId)
    expect(env.shared.has(PROGRESS_CONSENT_KEY)).toBe(false)
    expect(env.shared.has(PROGRESS_DATA_KEY)).toBe(false)
    expect(store.getSnapshot()).toMatchObject({ mode: 'off', entries: {} })
  })

  it('honors an external clear even while a later storage read is blocked', () => {
    const env = harness()
    const store = createLocalProgressStore(learningActivities, env.port)
    store.connect()
    store.enable()
    store.checkAnswer(activity.id, question.id, question.correctChoiceId)
    env.shared.clear()
    env.failure.read = true
    env.emit(true)
    expect(store.getSnapshot().entries).toEqual({})
    expect(store.getSnapshot().mode).toBe('unavailable')
  })

  it('falls back to an off marker and empty document if removeItem is blocked', () => {
    const env = harness()
    const store = createLocalProgressStore(learningActivities, env.port)
    store.connect()
    store.enable()
    store.checkAnswer(activity.id, question.id, question.correctChoiceId)
    env.failure.remove = true
    expect(store.deleteAndDisable()).toBe(true)
    expect(env.shared.get(PROGRESS_CONSENT_KEY)).toBe('off')
    expect(env.shared.get(PROGRESS_DATA_KEY)).toBe(rawEntries([]))
    expect(store.getSnapshot()).toMatchObject({
      mode: 'off',
      entries: {},
      deletionUnconfirmed: false,
    })
  })

  it('remembers the control opened last only while saving is on, and forgets it on delete', () => {
    const env = harness()
    const store = createLocalProgressStore(learningActivities, env.port)
    store.connect()
    const lesson = activity.lesson
    expect(store.rememberControl(lesson)).toBe(false)
    expect(env.shared.has(LAST_CONTROL_KEY)).toBe(false)
    expect(store.getSnapshot().lastControl).toBeNull()

    // Enabling later writes the control that is on screen.
    expect(store.enable()).toBe(true)
    expect(JSON.parse(env.shared.get(LAST_CONTROL_KEY)!)).toEqual(lesson)
    expect(store.getSnapshot().lastControl).toEqual(lesson)

    expect(store.rememberControl(other.lesson)).toBe(true)
    expect(JSON.parse(env.shared.get(LAST_CONTROL_KEY)!)).toEqual(other.lesson)

    // Another tab reads it back; a stranger or a malformed value is ignored.
    const second = createLocalProgressStore(learningActivities, env.port)
    second.connect()
    expect(second.getSnapshot().lastControl).toEqual(other.lesson)
    env.shared.set(LAST_CONTROL_KEY, '{"controlKey":"x","extra":1}')
    env.emit()
    expect(second.getSnapshot().lastControl).toBeNull()

    expect(store.deleteAndDisable()).toBe(true)
    expect(env.shared.has(LAST_CONTROL_KEY)).toBe(false)
    expect(store.getSnapshot().lastControl).toBeNull()
    // Without the consent marker the key is never read, even if it reappears.
    env.shared.set(LAST_CONTROL_KEY, JSON.stringify(lesson))
    env.emit()
    expect(store.getSnapshot().lastControl).toBeNull()
    expect(store.rememberControl(lesson)).toBe(false)
  })

  it('discloses failed deletion, clears memory, and refuses to reload stale data on focus', () => {
    const env = harness()
    const store = createLocalProgressStore(learningActivities, env.port)
    store.connect()
    store.enable()
    store.checkAnswer(activity.id, question.id, question.correctChoiceId)
    env.failure.remove = true
    env.failure.write = true
    expect(store.deleteAndDisable()).toBe(false)
    expect(store.getSnapshot()).toMatchObject({
      mode: 'unavailable',
      entries: {},
      deletionUnconfirmed: true,
    })
    expect(env.shared.has(PROGRESS_DATA_KEY)).toBe(true)
    env.failure.remove = false
    env.failure.write = false
    env.emit()
    expect(store.getSnapshot().entries).toEqual({})
    expect(store.getSnapshot().mode).toBe('unavailable')
    expect(store.deleteAndDisable()).toBe(true)
    expect(env.shared.size).toBe(0)
  })

  it('refreshes authoritative cross-tab progress without reviving a restarted attempt', () => {
    const env = harness()
    const secondEnv = harness(env.shared)
    const first = createLocalProgressStore(learningActivities, env.port)
    const second = createLocalProgressStore(learningActivities, secondEnv.port)
    first.connect()
    first.enable()
    first.checkAnswer(activity.id, question.id, question.correctChoiceId)
    first.next(activity.id)
    second.connect()
    first.restart(activity.id)
    secondEnv.emit()
    expect(second.getSnapshot().entries[activity.id]?.currentQuestionId).toBe(
      question.id,
    )
    expect(second.getSnapshot().entries[activity.id]?.checkedAnswers).toEqual(
      {},
    )
    expect(second.getSnapshot().resetEpoch).toBeGreaterThan(0)
  })

  it('retries an unconfirmed deletion before enabling again without reviving deleted answers', () => {
    const env = harness()
    const store = createLocalProgressStore(learningActivities, env.port)
    store.connect()
    store.enable()
    store.checkAnswer(activity.id, question.id, question.correctChoiceId)
    env.failure.remove = true
    env.failure.write = true
    expect(store.deleteAndDisable()).toBe(false)
    expect(store.enable()).toBe(false)
    expect(store.getSnapshot().deletionUnconfirmed).toBe(true)
    env.failure.remove = false
    env.failure.write = false
    expect(store.enable()).toBe(true)
    expect(store.getSnapshot()).toMatchObject({
      mode: 'on',
      entries: {},
      deletionUnconfirmed: false,
    })
    expect(env.shared.get(PROGRESS_DATA_KEY)).toBe(rawEntries([]))
  })

  it('does not restore answers when consent is revoked while stored data is being read', () => {
    const env = harness(
      new Map([
        [PROGRESS_CONSENT_KEY, 'on'],
        [PROGRESS_DATA_KEY, rawEntries([checkedEntry()])],
      ]),
    )
    vi.mocked(env.port.get).mockImplementation((key) => {
      const value = env.shared.get(key) ?? null
      if (key === PROGRESS_DATA_KEY) env.shared.delete(PROGRESS_CONSENT_KEY)
      return value
    })
    const store = createLocalProgressStore(learningActivities, env.port)
    store.connect()
    expect(store.getSnapshot()).toMatchObject({ mode: 'off', entries: {} })
    expect(env.port.set).not.toHaveBeenCalled()
  })
})
