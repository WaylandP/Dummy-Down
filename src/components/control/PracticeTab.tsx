import type { ReferenceControl } from '../../types/content'
import { lessonIdentity, lessonIdentityKey } from '../../state/explorer-state'
import { findLearningActivity } from '../../data/learning'
import { hasVisualExplanation } from '../../data/visual-lesson-index'
import { LearningPractice } from '../LearningPractice'
import { VisualLesson } from '../VisualLesson'

/** The existing activity, one question per screen, with the visual lesson where one exists. */
export function PracticeTab({
  control,
}: {
  readonly control: ReferenceControl
}) {
  const lesson = lessonIdentity(control)
  const key = lessonIdentityKey(lesson)
  const activity = findLearningActivity(lesson)
  if (!activity && !hasVisualExplanation(lesson))
    return (
      <div className="practice-empty">
        <p className="hand">No practice for this control yet.</p>
        <p>
          <a href="/practice">See the activities that exist</a>
        </p>
      </div>
    )
  return (
    <div className="practice">
      {hasVisualExplanation(lesson) && (
        <VisualLesson key={`visual:${key}`} lesson={lesson} />
      )}
      {activity && <LearningPractice key={`practice:${key}`} lesson={lesson} />}
    </div>
  )
}
