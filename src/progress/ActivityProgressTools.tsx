import { useEffect } from 'react'
import type { LearningActivity } from '../types/learning'
import { useActivityProgress } from './useLocalProgress'
import { ProgressPreferences } from './ProgressPreferences'

export function ActivityProgressTools({
  activity,
}: {
  activity: LearningActivity
}) {
  const { store, mode, entry, savingThisActivity, discarded } =
    useActivityProgress(activity)
  useEffect(() => {
    if (mode !== 'loading') store.visit(activity.id)
  }, [mode, store, activity.id])
  return (
    <div className="activity-progress-tools">
      <p className="practice-context">
        {savingThisActivity
          ? 'Practice is saved on this browser.'
          : 'Practice stays on this page. Saving is optional.'}
        {discarded &&
          ' Some saved practice was reset after a content change or invalid stored data.'}
      </p>
      <button
        type="button"
        className="inline-action"
        aria-pressed={entry.revisit}
        disabled={mode === 'loading'}
        onClick={() => store.markRevisit(activity.id, !entry.revisit)}
      >
        {entry.revisit ? 'Marked to revisit' : 'Revisit later'}
      </button>
      <ProgressPreferences />
    </div>
  )
}
