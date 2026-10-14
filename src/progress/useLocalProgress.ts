import { useContext, useSyncExternalStore } from 'react'
import type { LearningActivity } from '../types/learning'
import { LocalProgressContext } from './context'
import { emptyProgress, questionsToRevisit } from './model'

export function useLocalProgress() {
  const store = useContext(LocalProgressContext)
  if (!store) throw new Error('Local progress requires LocalProgressProvider')
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  )
  return { ...snapshot, store }
}

/** Reading an index never marks an activity as visited or starts saving. */
export function useActivityProgress(activity: LearningActivity) {
  const snapshot = useLocalProgress()
  const candidate = Object.hasOwn(snapshot.entries, activity.id)
    ? snapshot.entries[activity.id]
    : undefined
  const entry =
    candidate &&
    candidate.contentVersion === (activity.contentVersion ?? null) &&
    candidate.lesson.frameworkId === activity.lesson.frameworkId &&
    candidate.lesson.editionId === activity.lesson.editionId &&
    candidate.lesson.controlKey === activity.lesson.controlKey
      ? candidate
      : emptyProgress(activity)
  const questionIndex = activity.questions.findIndex(
    (question) => question.id === entry.currentQuestionId,
  )
  return {
    ...snapshot,
    entry,
    questionIndex,
    supported: snapshot.store.isSupported(activity.id),
    savingThisActivity: snapshot.mode === 'on' && entry.contentVersion !== null,
    checked: Object.hasOwn(entry.checkedAnswers, entry.currentQuestionId),
    questionsToRevisit: questionsToRevisit(activity, entry),
  }
}
