import type { LearningActivity } from '../types/learning'

export const PROGRESS_SCHEMA = 1
export const MAX_PROGRESS_LENGTH = 64_000

/** Only public catalog identifiers and bounded learning state enter storage. */
export interface ActivityProgress {
  readonly activityId: string
  readonly contentVersion: string | null
  readonly lesson: LearningActivity['lesson']
  readonly currentQuestionId: string
  readonly checkedAnswers: Readonly<Record<string, string>>
  readonly completed: boolean
  readonly visited: boolean
  readonly revisit: boolean
}

export type ProgressEntries = Readonly<Record<string, ActivityProgress>>
export type ProgressCatalog = ReadonlyMap<string, LearningActivity>

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function exactKeys(value: Record<string, unknown>, keys: readonly string[]) {
  return (
    Object.keys(value).length === keys.length &&
    keys.every((key) => Object.hasOwn(value, key))
  )
}

function boundedId(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 128
}

/** Reject ambiguous/oversize definitions; publication tests require the full catalog to be supported. */
export function createProgressCatalog(
  activities: readonly LearningActivity[],
): ProgressCatalog {
  const result = new Map<string, LearningActivity>()
  const counts = new Map<string, number>()
  for (const activity of activities)
    counts.set(activity.id, (counts.get(activity.id) ?? 0) + 1)
  for (const activity of activities) {
    if (
      counts.get(activity.id) !== 1 ||
      !boundedId(activity.id) ||
      !Object.values(activity.lesson).every(boundedId) ||
      activity.questions.length < 1 ||
      activity.questions.length > 32 ||
      new Set(activity.questions.map((item) => item.id)).size !==
        activity.questions.length ||
      !activity.questions.every(
        (item) =>
          boundedId(item.id) &&
          item.choices.length >= 2 &&
          item.choices.length <= 16 &&
          new Set(item.choices.map((choice) => choice.id)).size ===
            item.choices.length &&
          item.choices.every((choice) => boundedId(choice.id)) &&
          item.choices.some((choice) => choice.id === item.correctChoiceId),
      )
    )
      continue
    result.set(activity.id, activity)
  }
  return result
}

export function emptyProgress(activity: LearningActivity): ActivityProgress {
  return {
    activityId: activity.id,
    contentVersion: boundedId(activity.contentVersion)
      ? activity.contentVersion
      : null,
    lesson: { ...activity.lesson },
    currentQuestionId: activity.questions[0]!.id,
    checkedAnswers: {},
    completed: false,
    visited: false,
    revisit: false,
  }
}

function validateEntry(
  value: unknown,
  catalog: ProgressCatalog,
): ActivityProgress | null {
  if (
    !record(value) ||
    !exactKeys(value, [
      'activityId',
      'contentVersion',
      'lesson',
      'currentQuestionId',
      'checkedAnswers',
      'completed',
      'visited',
      'revisit',
    ]) ||
    !boundedId(value.activityId)
  )
    return null
  const activity = catalog.get(value.activityId)
  if (
    !activity ||
    !boundedId(activity.contentVersion) ||
    value.contentVersion !== activity.contentVersion ||
    !record(value.lesson) ||
    !exactKeys(value.lesson, ['frameworkId', 'editionId', 'controlKey']) ||
    value.lesson.frameworkId !== activity.lesson.frameworkId ||
    value.lesson.editionId !== activity.lesson.editionId ||
    value.lesson.controlKey !== activity.lesson.controlKey ||
    typeof value.completed !== 'boolean' ||
    typeof value.visited !== 'boolean' ||
    typeof value.revisit !== 'boolean' ||
    !record(value.checkedAnswers)
  )
    return null

  const index = activity.questions.findIndex(
    (item) => item.id === value.currentQuestionId,
  )
  const answerKeys = Object.keys(value.checkedAnswers)
  if (index < 0 || answerKeys.length > activity.questions.length) return null
  const answers: Record<string, string> = {}
  for (const questionId of answerKeys) {
    const question = activity.questions.find((item) => item.id === questionId)
    const choiceId = value.checkedAnswers[questionId]
    if (
      !question ||
      typeof choiceId !== 'string' ||
      !question.choices.some((choice) => choice.id === choiceId)
    )
      return null
    Object.defineProperty(answers, questionId, {
      value: choiceId,
      enumerable: true,
    })
  }
  // The existing practice flow checks a contiguous prefix, then advances or retries.
  const count = answerKeys.length
  if (
    (count !== index && count !== index + 1) ||
    !activity.questions
      .slice(0, count)
      .every((question) => Object.hasOwn(answers, question.id)) ||
    (value.completed &&
      (count !== activity.questions.length ||
        index !== activity.questions.length - 1)) ||
    (!value.visited && (count !== 0 || index !== 0 || value.completed))
  )
    return null
  return {
    ...emptyProgress(activity),
    currentQuestionId: activity.questions[index]!.id,
    checkedAnswers: answers,
    completed: value.completed,
    visited: value.visited,
    revisit: value.revisit,
  }
}

export type DecodedProgress =
  | { readonly valid: false }
  | {
      readonly valid: true
      readonly entries: ProgressEntries
      readonly discarded: boolean
    }

/** Invalid entries are never partially trusted; healthy activities survive version changes. */
export function decodeProgress(
  raw: string | null,
  catalog: ProgressCatalog,
): DecodedProgress {
  if (raw === null) return { valid: true, entries: {}, discarded: false }
  if (raw.length > MAX_PROGRESS_LENGTH) return { valid: false }
  let document: unknown
  try {
    document = JSON.parse(raw)
  } catch {
    return { valid: false }
  }
  if (
    !record(document) ||
    !exactKeys(document, ['schema', 'entries']) ||
    document.schema !== PROGRESS_SCHEMA ||
    !Array.isArray(document.entries) ||
    document.entries.length > 256
  )
    return { valid: false }
  const entries: Record<string, ActivityProgress> = {}
  const seen = new Set<string>()
  let discarded = false
  for (const value of document.entries) {
    if (record(value) && typeof value.activityId === 'string') {
      if (seen.has(value.activityId)) return { valid: false }
      seen.add(value.activityId)
    }
    const parsed = validateEntry(value, catalog)
    if (!parsed) {
      discarded = true
      continue
    }
    Object.defineProperty(entries, parsed.activityId, {
      value: parsed,
      enumerable: true,
    })
  }
  return { valid: true, entries, discarded }
}

export function encodeProgress(
  entries: ProgressEntries,
  catalog: ProgressCatalog,
): string {
  const checked = Object.values(entries)
    .map((entry) => validateEntry(entry, catalog))
    .filter((entry): entry is ActivityProgress => entry !== null)
  const raw = JSON.stringify({ schema: PROGRESS_SCHEMA, entries: checked })
  if (checked.length > 256 || raw.length > MAX_PROGRESS_LENGTH)
    throw new Error('Progress exceeds its storage limit')
  return raw
}

/** Derived from current authored answers; no score or compliance claim is stored. */
export function questionsToRevisit(
  activity: LearningActivity,
  progress: ActivityProgress,
) {
  return activity.questions.filter(
    (question) =>
      Object.hasOwn(progress.checkedAnswers, question.id) &&
      progress.checkedAnswers[question.id] !== question.correctChoiceId,
  )
}
