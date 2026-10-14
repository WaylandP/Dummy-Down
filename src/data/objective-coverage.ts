import type {
  AssessmentStatement,
  ControlCoverageMapping,
  ObjectiveCoverage,
  PerspectiveLocation,
} from '../types/coverage'
import type { ControlPerspectiveDraft } from '../types/perspectives'
import { referenceControls, cmmcSourceDocuments } from './cmmc-references'
import { cmmcPerspectiveDrafts } from './cmmc-perspectives'
import { levelOneLearningActivities } from './level-one-learning'
import { lessonIdentity, lessonIdentityKey } from '../state/explorer-state'
import inventory from './cmmc-objectives.json'
import mappings from './cmmc-objective-mappings.json'

export const coverageReview = {
  reviewer: mappings.reviewer,
  reviewedAt: mappings.reviewedAt,
  editionId: mappings.editionId,
  frameworkId: mappings.frameworkId,
} as const

export function perspectiveExcerpt(
  draft: ControlPerspectiveDraft,
  location: PerspectiveLocation,
) {
  switch (location) {
    case 'beginner.meaning':
      return { text: draft.beginner.meaning, mode: 'beginner' as const }
    case 'technical.focus':
      return { text: draft.technical.focus, mode: 'it-cyber' as const }
    case 'technical.example':
      return { text: draft.technical.example, mode: 'it-cyber' as const }
    case 'technical.watchFor':
      return { text: draft.technical.watchFor, mode: 'it-cyber' as const }
    case 'compliance.focus':
      return { text: draft.compliance.focus, mode: 'compliance' as const }
    default:
      throw new Error(`Unknown teaching field: ${String(location)}`)
  }
}

/** Reject structural drift instead of silently dropping a statement or borrowing a lesson. */
export function resolveCoverage(
  statements: readonly AssessmentStatement[],
  records: readonly ControlCoverageMapping[],
  identity = coverageReview,
): readonly ObjectiveCoverage[] {
  if (
    identity.frameworkId !== 'cmmc' ||
    identity.editionId !== 'cmmc-2-13-sep-2024'
  )
    throw new Error('Unsupported coverage edition')
  const controls = new Map(
    referenceControls.map((control) => [control.id, control]),
  )
  const drafts = new Map(
    cmmcPerspectiveDrafts.map((draft) => [draft.id, draft]),
  )
  const documents = new Map(
    cmmcSourceDocuments.map((source) => [source.id, source]),
  )
  const indexed = new Map<string, ControlCoverageMapping['mappings'][number]>()
  const seenControls = new Set<string>()
  for (const record of records) {
    if (!controls.has(record.controlId) || seenControls.has(record.controlId))
      throw new Error(
        `Unknown or duplicate mapped control: ${record.controlId}`,
      )
    seenControls.add(record.controlId)
    for (const mapping of record.mappings) {
      if (
        !mapping.labels.length ||
        new Set(mapping.locations).size !== mapping.locations.length
      )
        throw new Error(`Empty labels or duplicate fields: ${record.controlId}`)
      if (
        mapping.unresolvedQuestion &&
        (mapping.locations.length ||
          mapping.explanation ||
          mapping.practiceStep)
      )
        throw new Error(
          `Unresolved mapping must not claim explanation: ${record.controlId}`,
        )
      if (
        !mapping.unresolvedQuestion &&
        !mapping.locations.length &&
        !mapping.explanation?.trim()
      )
        throw new Error(
          `Missing explanation or unresolved question: ${record.controlId}`,
        )
      for (const label of mapping.labels) {
        const id = `${record.controlId}[${label}]`
        if (indexed.has(id)) throw new Error(`Duplicate mapping: ${id}`)
        indexed.set(id, mapping)
      }
    }
  }
  const seen = new Set<string>()
  const result = statements.map((statement): ObjectiveCoverage => {
    const control = controls.get(statement.controlId)
    const source = documents.get(statement.sourceId)
    const draft = drafts.get(statement.controlId)
    const mapping = indexed.get(statement.id)
    if (
      seen.has(statement.id) ||
      statement.id !== `${statement.controlId}[${statement.label}]`
    )
      throw new Error(`Duplicate or cross-control statement: ${statement.id}`)
    seen.add(statement.id)
    if (!control || !source || !draft || !mapping)
      throw new Error(
        `Missing control/source/teaching mapping: ${statement.id}`,
      )
    if (
      control.requirement.sourceId !== source.id ||
      control.requirement.pdfPage !== statement.pdfPage ||
      control.requirement.printedPage !== statement.printedPage
    )
      throw new Error(`Wrong source citation: ${statement.id}`)
    const lesson = lessonIdentity(control)
    let practice: ObjectiveCoverage['practice']
    if (mapping.practiceStep) {
      const activity = levelOneLearningActivities.find(
        (item) => item.id === mapping.practiceStep?.activityId,
      )
      const step = activity?.scenario.find(
        (item) => item.id === mapping.practiceStep?.stepId,
      )
      if (
        !activity ||
        !step ||
        lessonIdentityKey(activity.lesson) !== lessonIdentityKey(lesson)
      )
        throw new Error(`Invalid practice identity/step: ${statement.id}`)
      practice = { title: activity.title, step: step.title }
    }
    return {
      statement,
      lesson,
      title: control.title,
      level: control.level,
      sourceUrl: `${source.url}#page=${statement.pdfPage}`,
      sourceTitle: source.title,
      sourceVersion: source.version,
      sourceSha256: source.sha256,
      sourceVerification: 'pinned-snapshot-verified',
      coverage: mapping.unresolvedQuestion ? 'missing' : 'explained-in-draft',
      contentStatus: 'draft',
      aiReview: mapping.unresolvedQuestion ? 'unresolved' : 'compared',
      reviewedAt: identity.reviewedAt,
      humanReview: 'pending',
      excerpts: mapping.locations.map((location) => ({
        location,
        ...perspectiveExcerpt(draft, location),
      })),
      explanation: mapping.explanation,
      unresolvedQuestions: mapping.unresolvedQuestion
        ? [mapping.unresolvedQuestion]
        : [],
      practice,
    }
  })
  if (
    indexed.size !== seen.size ||
    [...indexed.keys()].some((id) => !seen.has(id))
  )
    throw new Error('Orphan mapping without source statement')
  return result
}

export const objectiveCoverage = resolveCoverage(
  inventory.objectives as readonly AssessmentStatement[],
  mappings.controls as readonly ControlCoverageMapping[],
)
