import type { Control, ExplanationModeInfo } from '../types/content'
import { authorizedAccessSources } from './sources'

export const explanationModes: readonly ExplanationModeInfo[] = [
  {
    id: 'beginner',
    label: 'Beginner',
    shortLabel: 'Beginner',
    description: 'Everyday language. No cybersecurity experience needed.',
  },
  {
    id: 'it-cyber',
    label: 'IT & Cyber',
    shortLabel: 'IT & Cyber',
    description: 'Technical context and possible implementation approaches.',
  },
  {
    id: 'compliance',
    label: 'Compliance',
    shortLabel: 'Compliance',
    description:
      'Read the source, ask assessment questions, and discuss possible evidence.',
  },
]

/**
 * The README supplies one simplified example, not a reviewed control catalog.
 * Keep that boundary visible wherever this content is displayed.
 */
export const controls: readonly Control[] = [
  {
    id: 'AC.L2-3.1.1',
    key: 'authorized-access',
    frameworkId: 'cmmc',
    editionId: 'readme-example',
    title: 'Authorized access',
    family: 'AC',
    familyName: 'Access Control',
    level: 'Level 2',
    concept:
      'Only approved people, applications acting on their behalf, and devices should access company systems.',
    reviewStatus: 'draft',
    contentKind: 'educational-example',
    versionContext:
      'The README uses the CMMC Level 2 identifier AC.L2-3.1.1 associated with NIST SP 800-171 Rev. 2. This draft is a simplified teaching example, not a reviewed interpretation of the applicable requirements.',
    disclaimer:
      'Draft educational example. This is not the full official requirement, an assessment checklist, or a guarantee of compliance. Consult the applicable official requirements and assessment guidance.',
    tags: ['accounts', 'authorized users', 'devices', 'access', 'offboarding'],
    explanations: {
      beginner: {
        heading: 'Give the right people the keys.',
        summary:
          'Think of a company system like a building with a locked front door. Approved people get a key; people who leave return it. The apps acting for those people and the devices they use need to be approved, too.',
        exampleTitle: 'An everyday example',
        examples: [
          'A new employee gets an approved account before using a company system.',
          'The company decides which devices can connect to its resources.',
          'When someone leaves, their access is removed so their old key no longer works.',
        ],
        takeaway:
          'The idea is to know who and what can get in. These examples help explain the idea; they are not the complete requirement.',
      },
      'it-cyber': {
        heading: 'Make access deliberate, then keep it current.',
        summary:
          'Start by understanding which users, processes acting on their behalf, and devices connect to a system. Account approval, device management, and offboarding workflows are possible ways to support authorized access in your environment.',
        exampleTitle: 'Possible implementation approaches',
        examples: [
          'Use an account approval workflow and maintain an inventory of approved accounts.',
          'Review how managed devices are identified and allowed to reach company resources.',
          'Connect employee departures to account removal and review access over time.',
        ],
        takeaway:
          'No particular product or configuration here is required or sufficient by itself. The implementation depends on the system, scope, and applicable official guidance.',
      },
      compliance: {
        heading: 'Connect the example to the official sources.',
        summary:
          'This sample explains the README’s authorized-access concept. It does not reproduce official assessment objectives. Establish the applicable framework version and assessment scope, then consult the official requirement and assessment guidance before drawing a compliance conclusion.',
        exampleTitle: 'Candidate evidence examples to discuss',
        examples: [
          'An approved-account inventory and records showing how account access is authorized.',
          'Device inventory or access configuration records that help explain which devices are approved.',
          'Offboarding records and access-review records that illustrate how access is kept current.',
        ],
        takeaway:
          'These are discussion examples, not an official evidence list or assessment objectives. Their relevance and sufficiency depend on the applicable guidance and system scope. Do not post sensitive organizational evidence to this public project.',
      },
    },
    sources: authorizedAccessSources,
    glossaryTermIds: [
      'account',
      'authorized-user',
      'device',
      'process',
      'offboarding',
      'access-review',
    ],
  },
]
