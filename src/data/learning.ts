import type { LessonIdentity } from '../types/content'
import type { LearningActivity } from '../types/learning'
import { guideSource } from './guide-source'
import { levelOneLearningActivities } from './level-one-learning'
import { expandedLearningActivities } from './expanded-learning'

export const learningActivities: readonly LearningActivity[] = [
  {
    id: 'authorized-access-practice',
    contentVersion: '2026-10-16.1',
    learningObjective:
      'Distinguish working credentials from approved access in a fictional team.',
    lesson: {
      frameworkId: 'cmmc',
      editionId: 'cmmc-2-13-sep-2024',
      controlKey: 'ac-l2-3-1-1',
    },
    reviewStatus: 'draft',
    title: 'A working login is not approval',
    introduction:
      'Follow a fictional team, then check your understanding of authorized access.',
    scenarioTitle: 'A teammate joins. A device changes. A teammate leaves.',
    scenario: [
      {
        id: 'approve-account',
        title: 'Approve the account',
        description:
          'Maya joins the fictional CedarPoint Design team. Its project-space owner approves her access, and Jules, the IT coordinator, records that approval before creating her account.',
      },
      {
        id: 'approve-device',
        title: 'Check the device',
        description:
          'This team approves devices before they connect. Maya uses an approved laptop; her personal laptop would need its own approval. An approved account does not automatically approve every device.',
      },
      {
        id: 'remove-old-access',
        title: 'Remove access after a departure',
        description:
          'Sam leaves the team and is no longer authorized to use its systems. Jules follows the team’s offboarding process to remove Sam’s access and check for access that remains elsewhere.',
      },
      {
        id: 'review-access',
        title: 'Keep the picture current',
        description:
          'During an access review, the team compares who and what can connect with current approvals. A working login is a starting point for a question, not proof that access is authorized.',
      },
    ],
    questions: [
      {
        id: 'login-is-not-approval',
        prompt:
          'Maya finds an old trial account that still signs in. No one has approved her use of it. What does the successful sign-in tell her?',
        correctChoiceId: 'credentials-work',
        choices: [
          {
            id: 'account-is-approved',
            label: 'The account is approved for her use.',
            feedback:
              'A successful sign-in shows that the credentials work. It does not establish that Maya is authorized to use the account. She should request approved access through the team’s process.',
          },
          {
            id: 'credentials-work',
            label:
              'The credentials work, but she isn’t authorized to use the account.',
            feedback:
              'A working sign-in isn’t approval. She shouldn’t use the account. She should report it so the team can disable or remove it, and request approved access through the team’s process.',
          },
          {
            id: 'review-is-complete',
            label: 'The team has completed an access review.',
            feedback:
              'Signing in does not show that anyone reviewed the account or its approval. Maya should request approved access rather than rely on a working login.',
          },
        ],
      },
      {
        id: 'account-and-device',
        prompt:
          'Maya’s employee account is approved, but her personal laptop is not approved under this team’s device process. What should she do before connecting?',
        correctChoiceId: 'approved-device',
        choices: [
          {
            id: 'account-is-enough',
            label: 'Connect because her employee account is approved.',
            feedback:
              'Account approval and device approval are separate in this fictional team. Maya should use an approved device or request device approval before connecting.',
          },
          {
            id: 'antivirus-is-approval',
            label: 'Connect because the laptop has antivirus software.',
            feedback:
              'Antivirus software does not establish device approval. This team’s process still applies. The example does not mean that personal devices are universally prohibited.',
          },
          {
            id: 'approved-device',
            label:
              'Use an approved device or request approval before connecting.',
            feedback:
              'The team considers both the account and the device. This is its fictional approval process, not a universal ban on personal devices or a required product choice.',
          },
        ],
      },
      {
        id: 'departure-and-review',
        prompt:
          'A later access review finds another account belonging to Sam that still signs in after Sam has left and is no longer authorized. What is the best response in this scenario?',
        correctChoiceId: 'follow-offboarding',
        choices: [
          {
            id: 'follow-offboarding',
            label:
              'Follow the team’s offboarding process to remove Sam’s access and check for remaining access.',
            feedback:
              'Access should reflect current authorization. A departure can affect several systems, so the team checks beyond this one account. The example does not prescribe account deletion or a record-retention period.',
          },
          {
            id: 'wait-for-use',
            label:
              'Leave the account active because Sam has not signed in recently.',
            feedback:
              'Recent activity does not establish authorization. Sam is no longer authorized in this scenario, so the team should follow its offboarding process and check for remaining access.',
          },
          {
            id: 'reuse-account',
            label: 'Give Sam’s account to the next person joining the team.',
            feedback:
              'Reusing an old account does not establish the new person’s approved access. The team should handle the departure and the new person’s authorization deliberately.',
          },
        ],
      },
    ],
    disclaimer:
      'A fictional practice activity written from the September 2024 v2.13 snapshot. ' +
      'Its examples illustrate selected assessment objectives; they do not prescribe a ' +
      'product, prove evidence sufficiency, or cover an entire assessment.',
    teachingSource: guideSource('AC.L2-3.1.1'),
  },
  ...levelOneLearningActivities,
  ...expandedLearningActivities,
]

/** Resolve the complete editorial address; never attach a neighboring activity. */
export function findLearningActivity(
  lesson: LessonIdentity,
): LearningActivity | undefined {
  return learningActivities.find(
    (activity) =>
      activity.lesson.frameworkId === lesson.frameworkId &&
      activity.lesson.editionId === lesson.editionId &&
      activity.lesson.controlKey === lesson.controlKey,
  )
}
