import type { ReferenceControl } from '../types/content'
import type {
  AssessmentObjectiveQuote,
  ControlEditorialReview,
} from '../types/review'
import { referenceControls } from './cmmc-references'

const frameworkId = 'cmmc'
const editionId = 'cmmc-2-13-sep-2024'
const sourceId = 'cmmc-assessment-l1-213'
const checkedAt = '2026-10-14'

/** Counts refer to statements read in the pinned guide, not curriculum completion. */
const comparedObjectives: Readonly<Record<string, number>> = {
  'AC.L1-b.1.i': 6,
  'AC.L1-b.1.ii': 2,
  'AC.L1-b.1.iii': 6,
  'AC.L1-b.1.iv': 5,
  'IA.L1-b.1.v': 3,
  'IA.L1-b.1.vi': 3,
  'MP.L1-b.1.vii': 2,
  'PE.L1-b.1.viii': 4,
  'PE.L1-b.1.ix': 6,
  'SC.L1-b.1.x': 8,
  'SC.L1-b.1.xi': 2,
  'SI.L1-b.1.xii': 6,
  'SI.L1-b.1.xiii': 2,
  'SI.L1-b.1.xiv': 1,
  'SI.L1-b.1.xv': 3,
}

/** Physical line wrapping is normalized; source wording/punctuation is retained. */
const objectiveStatements: Readonly<Record<string, readonly string[]>> = {
  'AC.L1-b.1.i': [
    'authorized users are identified;',
    'processes acting on behalf of authorized users are identified;',
    'devices (and other systems) authorized to connect to the system are identified;',
    'system access is limited to authorized users;',
    'system access is limited to processes acting on behalf of authorized users; and',
    'system access is limited to authorized devices (including other systems).',
  ],
  'AC.L1-b.1.iv': [
    'individuals authorized to post or process information on publicly accessible systems are identified;',
    'procedures to ensure [FCI] is not posted or processed on publicly accessible systems are identified;',
    'a review process is in place prior to posting of any content to publicly accessible systems;',
    'content on publicly accessible systems is reviewed to ensure that it does not include [FCI]; and',
    'mechanisms are in place to remove and address improper posting of [FCI].',
  ],
  'MP.L1-b.1.vii': [
    'system media containing [FCI] is sanitized or destroyed before disposal; and',
    'system media containing [FCI] is sanitized before it is released for reuse.',
  ],
}

const clarificationNotes: Readonly<Record<string, string>> = {
  'AC.L1-b.1.iv':
    'Clarified posting and processing on publicly accessible systems; retained review and response activities and the public-release authority distinction.',
  'IA.L1-b.1.vi':
    'Clarified that administrator sign-in checks the person and does not itself verify the printer device.',
  'MP.L1-b.1.vii':
    'Clarified sanitization or destruction before disposal versus sanitization before release for reuse.',
  'PE.L1-b.1.viii':
    'Included the guide discussion condition for facility areas not designated publicly accessible.',
}

/**
 * All 15 records describe the actual AI-assisted comparison. Only three import
 * objective quotations as learning context. No record has qualified human approval.
 */
export const levelOneReviews: readonly ControlEditorialReview[] =
  referenceControls
    .filter(
      (control) =>
        control.frameworkId === frameworkId &&
        control.editionId === editionId &&
        control.level === 'Level 1',
    )
    .map((control): ControlEditorialReview => {
      const source = control.sourceDocuments.find(
        (document) => document.id === sourceId,
      )
      const objectiveComparisonCount = comparedObjectives[control.id]
      if (!source || objectiveComparisonCount === undefined)
        throw new Error(`Missing Level 1 review context for ${control.id}`)
      const assessmentObjectives: readonly AssessmentObjectiveQuote[] = (
        objectiveStatements[control.id] ?? []
      ).map((text, index) => {
        const label = String.fromCharCode(97 + index)
        return {
          id: `${control.id}[${label}]`,
          label,
          text,
          sourceId,
          pdfPage: control.requirement.pdfPage,
          printedPage: control.requirement.printedPage,
        }
      })
      const clarification = clarificationNotes[control.id]
      return {
        frameworkId,
        editionId,
        controlKey: control.key,
        requirementId: control.id,
        source: {
          sourceId,
          title: source.title,
          version: source.version,
          published: source.published,
          documentId: source.documentId,
          sha256: source.sha256,
          url: source.url,
          mirrorUrl: source.mirrorUrl,
          section: control.id,
          pdfPage: control.requirement.pdfPage,
          printedPage: control.requirement.printedPage,
        },
        sourceVerification: {
          status: 'pinned-snapshot-verified',
          checkedAt,
          method:
            'SHA-256-verified pinned PDF; complete requirement transcription and cited guide section compared. Current official-host bytes were unavailable.',
        },
        aiReview: {
          status: 'ai-assisted-reviewed',
          reviewedAt: checkedAt,
          objectiveComparisonCount,
          notes: [
            'Three draft perspectives compared with the requirement, every assessment determination statement and relevant Discussion/Further Discussion. This is agent review, not qualified human approval.',
            ...(clarification ? [clarification] : []),
          ],
        },
        humanApproval: { status: 'pending' },
        assessmentObjectives,
        educationalObjectiveCoverage:
          assessmentObjectives.length > 0
            ? 'draft-three-lesson-scope'
            : 'not-mapped',
        unresolvedQuestions: [
          'All 18 current official DoD, FAR/DFARS, CFR and NIST source requests failed with proxy CONNECT 403 before an origin response on 2026-10-14. Latest-edition and present applicability checks remain unresolved.',
          'Qualified human review is pending; these educational drafts do not establish organizational compliance or assessment readiness.',
        ],
      }
    })

const byId = new Map(
  levelOneReviews.map((review) => [review.requirementId, review]),
)

/** Identical display IDs in another framework or edition must not inherit review. */
export function getLevelOneReview(
  control: Pick<ReferenceControl, 'frameworkId' | 'editionId' | 'id'>,
): ControlEditorialReview | undefined {
  if (control.frameworkId !== frameworkId || control.editionId !== editionId)
    return undefined
  return byId.get(control.id)
}
