import type { SourceReference } from '../types/content'
import type { LearningActivity } from '../types/learning'
import { referenceControls } from './cmmc-references'

function guideSource(controlId: string): SourceReference {
  const control = referenceControls.find((item) => item.id === controlId)
  const source = control?.sources.find(
    (item) =>
      item.id ===
      `${control.requirement.sourceId}-page-${control.requirement.pdfPage}`,
  )
  if (!source) throw new Error(`Missing Level 1 learning source: ${controlId}`)
  return source
}

const editionId = 'cmmc-2-13-sep-2024'
const disclaimer =
  'Draft fictional learning activity, not an assessment checklist or compliance score. ' +
  'Examples illustrate selected assessment objectives in the September 2024 v2.13 snapshot; ' +
  'they do not prescribe a product, prove evidence sufficiency, or cover an entire assessment. ' +
  'Qualified human review and verification of current applicability remain pending.'

/** Three publication-bound teaching drafts; the same ID in another edition cannot borrow them. */
export const levelOneLearningActivities: readonly LearningActivity[] = [
  {
    id: 'level-one-authorized-access',
    lesson: {
      frameworkId: 'cmmc',
      editionId,
      controlKey: 'ac-l1-b-1-i',
    },
    reviewStatus: 'draft',
    title: 'Practice: who and what can connect?',
    introduction:
      'Follow a fictional workshop as it connects a person, an automated process, and a device. The point is to separate an authorization decision from access that happens to work.',
    plainEnglish:
      'Identify which people, processes acting on behalf of authorized people, and devices or other systems are allowed to access a company system. Then limit actual access to those authorized categories. A working login is not, by itself, proof of permission.',
    commonMisunderstanding: {
      claim:
        '“An approved employee account makes every program and device they use approved.”',
      correction:
        'The requirement includes processes acting on users’ behalf and devices, including other systems. Identify what is authorized and enforce those limits; approving one person does not automatically approve everything that connects for them.',
    },
    diagram: {
      title: 'From an authorization decision to actual access',
      steps: [
        {
          id: 'identify',
          title: 'Identify all three categories',
          description:
            'People; processes acting for authorized people; devices and other systems.',
        },
        {
          id: 'authorize',
          title: 'Establish what is authorized',
          description:
            'Determine which identities are allowed to access the system.',
        },
        {
          id: 'limit',
          title: 'Limit actual access',
          description:
            'System access must reflect those decisions for every category.',
        },
      ],
      textEquivalent:
        'For users, processes acting on behalf of authorized users, and devices or other systems, identify what is authorized and limit system access accordingly. An inventory alone does not enforce access. This flow illustrates the idea without prescribing a particular approval tool.',
    },
    scenarioTitle: 'An employee, a scheduled export, and a scanner',
    scenario: [
      {
        id: 'person',
        title: 'Approve the person’s access',
        description:
          'Robin joins fictional Harbor Workshop. Lena, its system owner, approves Robin’s account through the team’s process. A login that happens to work would not replace that decision.',
      },
      {
        id: 'process',
        title: 'Consider the automated process',
        description:
          'A scheduled export will act on Robin’s behalf. The team identifies the process and establishes whether it is authorized to access the system; Robin’s employee approval alone is not the whole picture.',
      },
      {
        id: 'device',
        title: 'Consider the connected device',
        description:
          'A new scanner is also going to connect. The team identifies and authorizes the device rather than assuming that purchasing it or connecting it proves approval.',
      },
      {
        id: 'enforcement',
        title: 'Make access match the decisions',
        description:
          'IT checks that system access is limited to the authorized people, user-acting processes, and devices. Harbor’s approval records are illustrative choices; this requirement does not mandate a ticketing product.',
      },
    ],
    questions: [
      {
        id: 'process-is-separate',
        prompt:
          'The scheduled export starts successfully using Robin’s credentials. Does Robin’s employee approval settle the process’s authorization?',
        correctChoiceId: 'identify-process',
        choices: [
          {
            id: 'working-is-approved',
            label: 'Yes. Successful execution proves the process is approved.',
            feedback:
              'Working credentials show that access is possible. They do not establish the process’s authorization. The team must identify the process acting on Robin’s behalf and limit access to what is authorized.',
          },
          {
            id: 'identify-process',
            label:
              'No. Identify and authorize the user-acting process, then limit its access accordingly.',
            feedback:
              'The requirement includes processes acting on behalf of authorized users. Identifying and authorizing the process must connect to actual access restrictions; it is not only a question about Robin’s account.',
          },
          {
            id: 'interactive-only',
            label:
              'It does not matter; only interactive employee logins count.',
            feedback:
              'Processes acting on behalf of authorized users are explicitly included, even when no one is typing at a login screen. Automated work is not excluded just because it runs in the background.',
          },
        ],
      },
      {
        id: 'device-authorization',
        prompt:
          'The newly purchased scanner can already connect to Harbor’s system. What should the team establish?',
        correctChoiceId: 'authorized-device',
        choices: [
          {
            id: 'purchase-is-approval',
            label: 'Nothing else. The purchase establishes authorization.',
            feedback:
              'A purchase does not by itself establish that a device is authorized to access this system. The team should identify authorized devices and make connectivity reflect those decisions.',
          },
          {
            id: 'security-software-is-approval',
            label:
              'Whether security software is installed; that proves approval.',
            feedback:
              'Security software can serve other purposes, but its presence is not an authorization decision. This question concerns whether the device is authorized to connect and whether that limit is enforced.',
          },
          {
            id: 'authorized-device',
            label:
              'Whether the scanner is authorized, and whether access reflects that decision.',
            feedback:
              'Devices, including other information systems, are part of the requirement. Harbor needs an authorization decision and enforced access limits; no particular inventory or ticketing product is prescribed here.',
          },
        ],
      },
      {
        id: 'identify-and-enforce',
        prompt: 'Which paired tasks best capture this requirement?',
        correctChoiceId: 'identify-and-limit',
        choices: [
          {
            id: 'list-only',
            label:
              'Keep a list of approved identities, without restricting access.',
            feedback:
              'Identification matters, but the objectives also ask whether system access is limited to authorized users, user-acting processes, and devices. A list alone does not demonstrate enforcement.',
          },
          {
            id: 'identify-and-limit',
            label:
              'Identify authorized users, user-acting processes, and devices; limit system access accordingly.',
            feedback:
              'That connects identifying what is authorized with enforcing system access for all three categories. The guide separates these into objectives [a]–[c] and [d]–[f].',
          },
          {
            id: 'actions-only',
            label:
              'Only decide which actions a person may perform after gaining access.',
            feedback:
              'Permitted transactions and functions are important, but they are the focus of the related AC.L1-b.1.ii requirement. This activity addresses who and what is authorized to access the system.',
          },
        ],
      },
    ],
    disclaimer,
    teachingSource: guideSource('AC.L1-b.1.i'),
  },
  {
    id: 'level-one-public-information',
    lesson: {
      frameworkId: 'cmmc',
      editionId,
      controlKey: 'ac-l1-b-1-iv',
    },
    reviewStatus: 'draft',
    title: 'Practice: what belongs in public?',
    introduction:
      'Follow a fictional project update from draft to publication, then consider what happens when protected contract information appears in public.',
    plainEnglish:
      'Control information posted or processed on publicly accessible systems. Identify who may post or process it, review before posting, check what is already public, and have a way to remove and address improper posting of Federal Contract Information (FCI). Internal company approval does not authorize the public release of FCI.',
    commonMisunderstanding: {
      claim: '“My manager approved the post, so its FCI can be made public.”',
      correction:
        'Approval to publish a company post does not make its FCI public information. The guide says, “Only government officials can be authorized to publicly release FCI.” This does not say a company editor may publish FCI after a manager or official approves the post. Keep FCI out of the company’s public posting and processing.',
    },
    diagram: {
      title: 'Public content needs review before and after posting',
      steps: [
        {
          id: 'draft',
          title: 'Prepare the draft safely',
          description:
            'Keep FCI out of publicly accessible systems while preparing public content.',
        },
        {
          id: 'before',
          title: 'Authorized people review before posting',
          description:
            'Check that the content is appropriate for public release.',
        },
        {
          id: 'public',
          title: 'Publish public content',
          description:
            'Internal approval does not turn FCI into public information.',
        },
        {
          id: 'after',
          title: 'Review what is public and address mistakes',
          description:
            'Remove and address improper FCI postings; alert appropriate parties.',
        },
      ],
      textEquivalent:
        'Authorized people use procedures to keep FCI out of public posting and processing. Review content before posting and review existing public content. If FCI is improperly posted, remove and address it through the response process. This illustrative flow is not a complete incident-response playbook.',
    },
    scenarioTitle: 'A project update and an unexpected attachment',
    scenario: [
      {
        id: 'authorized-editors',
        title: 'Know who may publish',
        description:
          'Fictional Harbor Workshop names the people who may post or process information on its publicly accessible systems. Robin prepares a project update for one of those authorized editors.',
      },
      {
        id: 'review-before',
        title: 'Review before publication',
        description:
          'The editor notices FCI in the draft. That information stays out of the public system; the team prepares suitable public content instead. A manager’s approval would not authorize FCI’s public release.',
      },
      {
        id: 'review-existing',
        title: 'Check content that is already public',
        description:
          'During a later review, the team finds an older public attachment containing FCI. A pre-publication check is important, but existing public content also needs attention.',
      },
      {
        id: 'respond',
        title: 'Remove and address the mistake',
        description:
          'The team removes the improperly posted information and alerts the appropriate parties through its response process. Hiding a link while leaving the file publicly reachable would not remove the exposure.',
      },
    ],
    questions: [
      {
        id: 'manager-approval',
        prompt:
          'A manager approves a project update that still contains FCI. What should the authorized editor do?',
        correctChoiceId: 'keep-off-public',
        choices: [
          {
            id: 'publish-approved',
            label: 'Publish it because a company manager approved it.',
            feedback:
              'Internal approval does not authorize the public release of FCI. The guide states, “Only government officials can be authorized to publicly release FCI.” The company editor should keep the FCI off the public system.',
          },
          {
            id: 'keep-off-public',
            label:
              'Keep the FCI off the public system and prepare suitable public content.',
            feedback:
              'The review should prevent FCI from being improperly posted or processed publicly. Company publishing permission does not make protected contract information suitable public content.',
          },
          {
            id: 'remove-name',
            label:
              'Publish after removing the author’s name; the remaining FCI is safe.',
            feedback:
              'Removing a name does not establish that the remaining contract information is appropriate for public release. Review the content itself and keep FCI off the company’s public system.',
          },
        ],
      },
      {
        id: 'existing-content',
        prompt:
          'A later review finds FCI in a publicly reachable attachment. Which response matches the idea?',
        correctChoiceId: 'remove-and-address',
        choices: [
          {
            id: 'future-only',
            label:
              'Improve future drafts but leave the existing attachment online.',
            feedback:
              'The objectives include reviewing existing public content and mechanisms to remove and address improper FCI postings. Better future drafts do not address the information already exposed.',
          },
          {
            id: 'hide-link',
            label:
              'Hide the link while keeping the attachment publicly reachable.',
            feedback:
              'A less-visible link does not remove publicly reachable information. The team needs to remove and address the improper posting through its response process.',
          },
          {
            id: 'remove-and-address',
            label:
              'Remove and address the improper posting, alerting appropriate parties.',
            feedback:
              'The guide includes removing and addressing improper FCI postings, with procedures to alert appropriate parties. This step does not by itself guarantee that the consequences of an exposure are resolved.',
          },
        ],
      },
      {
        id: 'processing-is-included',
        prompt:
          'Does this requirement also concern FCI processed on a publicly accessible system, even without a public webpage post?',
        correctChoiceId: 'posted-or-processed',
        choices: [
          {
            id: 'visible-pages-only',
            label: 'No. It only concerns text visible on a company webpage.',
            feedback:
              'The requirement covers information posted or processed on publicly accessible systems. Its scope is broader than the visible text on one company webpage.',
          },
          {
            id: 'posted-or-processed',
            label:
              'Yes. It covers both posting and processing on publicly accessible systems.',
            feedback:
              'Both activities appear in the requirement and objectives. Whether a particular service is publicly accessible depends on its actual access and use; this is not a claim that every cloud service is public.',
          },
          {
            id: 'trusted-brand',
            label: 'No. A familiar service provider makes processing exempt.',
            feedback:
              'A familiar provider’s name does not establish an exemption. Consider the system’s actual public accessibility and what information is posted or processed there.',
          },
        ],
      },
    ],
    disclaimer,
    teachingSource: guideSource('AC.L1-b.1.iv'),
  },
  {
    id: 'level-one-media-disposal',
    lesson: {
      frameworkId: 'cmmc',
      editionId,
      controlKey: 'mp-l1-b-1-vii',
    },
    reviewStatus: 'draft',
    title: 'Practice: what happens before media leaves?',
    introduction:
      'Follow a fictional office clear-out. A reused scanner and discarded paper need different decisions, with the same attention to the information they contain.',
    plainEnglish:
      'Before disposing of system media containing FCI, sanitize or destroy it. Before releasing it for reuse, sanitize it. Media can be digital storage or non-digital material such as paper. Choose a suitable method for the media and information; deleting visible files does not by itself establish that information cannot be recovered.',
    commonMisunderstanding: {
      claim: '“Deleting the visible files makes any device safe to give away.”',
      correction:
        'Information may remain recoverable after ordinary deletion. Use a suitable sanitization process before reuse. For disposal, sanitization or destruction can apply. This lesson does not prescribe one command or method for every kind of media.',
    },
    diagram: {
      title: 'Two destinations, with action before handover',
      steps: [
        {
          id: 'identify-media',
          title: 'Identify system media containing FCI',
          description:
            'Include digital storage and non-digital media, such as paper.',
        },
        {
          id: 'destination',
          title: 'Decide whether it will be reused or disposed of',
          description:
            'Choose an appropriate method for the media and information.',
        },
      ],
      branches: [
        {
          id: 'reuse',
          title: 'Reuse → sanitize before release',
          description:
            'Sanitize the media before another use. A handover record does not replace the action.',
        },
        {
          id: 'disposal',
          title: 'Disposal → sanitize or destroy before disposal',
          description:
            'Remove recoverable information or destroy the media through a suitable process before disposal.',
        },
      ],
      textEquivalent:
        'For system media containing FCI, first identify the media and its destination. If releasing it for reuse, sanitize it before release. If disposing of it, sanitize or destroy it before disposal. Both digital and non-digital media are included, and the appropriate technique depends on the media and information.',
    },
    scenarioTitle: 'A retired scanner and a box of contract printouts',
    scenario: [
      {
        id: 'find-media',
        title: 'Look beyond laptop drives',
        description:
          'Fictional Harbor Workshop clears an office. A retired scanner contains stored contract scans with FCI, and a box contains paper contract printouts with FCI. Both are media the team needs to handle.',
      },
      {
        id: 'reuse-scanner',
        title: 'Prepare the scanner for reuse',
        description:
          'Before releasing the scanner for reuse, the team applies a sanitization process appropriate to its storage and checks the result. A generic reset or deletion of visible scans would not by itself establish successful sanitization.',
      },
      {
        id: 'dispose-paper',
        title: 'Handle disposal before the media leaves',
        description:
          'For the paper destined for disposal, Harbor uses its suitable destruction process before disposal. That is this scenario’s choice; the requirement allows sanitization or destruction for disposal.',
      },
      {
        id: 'record-actions',
        title: 'Keep the action and the record distinct',
        description:
          'Harbor records what it did to the media. Records may help explain an action, but a signed form is not a substitute for sanitizing or destroying media, nor a guarantee of assessment success.',
      },
    ],
    questions: [
      {
        id: 'deletion-is-not-sanitization',
        prompt:
          'A drive containing FCI is going to be reused. Its visible files have been deleted. What remains to establish?',
        correctChoiceId: 'suitable-sanitization',
        choices: [
          {
            id: 'empty-trash',
            label:
              'Nothing. An empty folder or trash proves the drive is safe for reuse.',
            feedback:
              'Ordinary deletion can leave information recoverable. Before reuse, use a suitable sanitization process rather than treating an empty file list as proof that FCI is gone.',
          },
          {
            id: 'suitable-sanitization',
            label:
              'That suitable sanitization has occurred before release for reuse.',
            feedback:
              'The reuse objective calls for sanitization before release. The technique and how its result is checked should suit the media and information; this activity does not specify a universal wiping command.',
          },
          {
            id: 'handover-form',
            label: 'Only that the next user signs a handover form.',
            feedback:
              'A handover form does not sanitize the media. Documentation can support understanding what happened, but it cannot replace the required action before reuse.',
          },
        ],
      },
      {
        id: 'two-destinations',
        prompt: 'Which distinction matches the assessment objectives?',
        correctChoiceId: 'destination-and-timing',
        choices: [
          {
            id: 'destination-and-timing',
            label:
              'Reuse: sanitize before release. Disposal: sanitize or destroy before disposal.',
            feedback:
              'The objectives distinguish those destinations and place the action before release or disposal. Destruction is a disposal option; it is not a way to keep the destroyed media in use.',
          },
          {
            id: 'destroy-and-reuse',
            label:
              'Destroy the media, then release the destroyed media for reuse.',
            feedback:
              'Destruction makes that media unsuitable for its intended reuse. The reuse objective is sanitization before release; disposal allows sanitization or destruction.',
          },
          {
            id: 'after-handover',
            label:
              'Release the media first and sanitize it if the next user asks.',
            feedback:
              'Timing matters. Sanitization occurs before release for reuse, and sanitization or destruction occurs before disposal. A later request does not satisfy that timing.',
          },
        ],
      },
      {
        id: 'digital-and-paper',
        prompt:
          'Harbor finds FCI in scanner storage and on paper printouts. Which media should the team consider?',
        correctChoiceId: 'both-kinds',
        choices: [
          {
            id: 'laptops-only',
            label: 'Only laptop drives; scanner storage is outside the idea.',
            feedback:
              'Digital media can be found in devices such as scanners, copiers, printers, and mobile devices as well as computers. The FCI-bearing scanner storage belongs in this decision.',
          },
          {
            id: 'both-kinds',
            label: 'Both digital storage and non-digital media containing FCI.',
            feedback:
              'The guide covers digital and non-digital system media subject to disposal or reuse, including paper. Consider the information the media actually contains; this does not label every document as FCI.',
          },
          {
            id: 'paper-excluded',
            label:
              'Only digital storage; paper is excluded because it is offline.',
            feedback:
              'Being offline does not exclude non-digital media. Paper containing FCI also needs an appropriate sanitization or destruction decision before disposal.',
          },
        ],
      },
    ],
    disclaimer,
    teachingSource: guideSource('MP.L1-b.1.vii'),
  },
]
