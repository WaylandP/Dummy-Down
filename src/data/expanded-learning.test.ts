import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import review from '../../docs/content-review/phase-3-activities-2026-10-14.json'
import inventory from './cmmc-objectives.json'
import { referenceControls } from './cmmc-references'
import { expandedLearningActivities } from './expanded-learning'
import { glossaryTerms } from './glossary'
import { findLearningActivity, learningActivities } from './learning'

const digest = (value: unknown) =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex')

describe('expanded draft teaching source boundaries', () => {
  it('adds three activities per level without collisions or missing version/terminology', () => {
    expect(expandedLearningActivities).toHaveLength(9)
    expect(new Set(learningActivities.map((item) => item.id)).size).toBe(13)
    expect(learningActivities.flatMap((item) => item.questions)).toHaveLength(
      39,
    )
    for (const level of [1, 2, 3]) {
      expect(
        review.proposals.filter((item) => item.level === level),
      ).toHaveLength(3)
    }
    for (const activity of learningActivities) {
      expect(activity.learningObjective).toBeTruthy()
      expect(activity.contentVersion).toBe('2026-10-14.1')
      expect(findLearningActivity(activity.lesson)).toBe(activity)
      for (const termId of activity.glossaryTermIds ?? []) {
        expect(glossaryTerms.find((term) => term.id === termId)).toBeDefined()
      }
    }
  })

  it('binds final activities and every question to the reviewed pinned source without inventing labels', () => {
    for (const activity of expandedLearningActivities) {
      const control = referenceControls.find(
        (item) => item.key === activity.lesson.controlKey,
      )!
      const record = review.proposals.find(
        (item) => item.controlId === control.id,
      )!
      const source = record.sourceReview
      expect(activity.lesson).toEqual({
        frameworkId: control.frameworkId,
        editionId: control.editionId,
        controlKey: control.key,
      })
      expect(digest(activity), `Stale activity review: ${activity.id}`).toBe(
        source.activityFingerprint,
      )
      const statements = inventory.objectives.filter(
        (item) => item.controlId === control.id,
      )
      expect(source.sourceStatements).toEqual(statements)
      expect(digest(statements)).toBe(source.objectiveFingerprint)
      expect(activity.reviewStatus).toBe('draft')
      expect(activity.teachingSource.versionContext).toContain('September 2024')
      expect(activity.questions.map((item) => item.id).sort()).toEqual(
        source.questionSourceLinks.map((item) => item.questionId).sort(),
      )
      for (const link of source.questionSourceLinks) {
        expect(link.objectiveLabels.length).toBeGreaterThan(0)
        for (const label of link.objectiveLabels) {
          expect(statements.some((item) => item.label === label)).toBe(true)
        }
      }
      expect(
        findLearningActivity({ ...activity.lesson, editionId: 'unavailable' }),
      ).toBeUndefined()
    }
  })
})
