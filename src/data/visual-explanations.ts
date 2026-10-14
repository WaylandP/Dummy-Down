import { referenceControls } from './cmmc-references'
import type { LessonIdentity } from '../types/content'
import type {
  VisualExplanationContent,
  VisualScene,
  VisualStage,
} from '../types/visual-explanation'

interface TeachingSequence {
  readonly controlId: string
  readonly title: string
  readonly scene: VisualScene
  readonly requirementDiagram: string
  readonly teaching: readonly [VisualStage, VisualStage, VisualStage]
}

const sequences: readonly TeachingSequence[] = [
  {
    controlId: 'AC.L1-b.1.i',
    title: 'A working connection is not permission',
    scene: 'access-gate',
    requirementDiagram:
      'Three access paths lead toward one system: a user, a process acting for a user, and a device. All three need an authorization decision.',
    teaching: [
      {
        kind: 'meaning',
        title: 'Decide what is allowed. Then enforce it.',
        text: 'Identify authorized users, processes acting for them, and devices. Actual system access must follow those decisions; an approved list alone does not keep unapproved access out.',
        diagramDescription:
          'An authorization boundary appears between all three access paths and the system. It represents enforced access decisions, not a required physical gate or product.',
      },
      {
        kind: 'example',
        title: 'A scanner still needs its own decision.',
        text: 'In a fictional workshop, Robin and an approved export process can connect. A new scanner has not been authorized, so its access is blocked even though Robin is approved.',
        diagramDescription:
          'The user and process paths cross the boundary. The new device path stops at the boundary with a visible stop mark. Approving the person did not authorize the device.',
      },
      {
        kind: 'takeaway',
        title: 'Permission and access must match.',
        text: 'If the team later authorizes that scanner, it can change the access decision accordingly. Identify what is authorized and limit access for all three categories.',
        diagramDescription:
          'After the example team authorizes the scanner, all three authorized paths cross the boundary. The changed device path illustrates a changed decision, not automatic approval.',
      },
    ],
  },
  {
    controlId: 'IA.L2-3.5.3',
    title: 'Two secrets are still one kind of proof',
    scene: 'factor-proof',
    requirementDiagram:
      'A password and a PIN are both knowledge factors. Two pieces of the same kind of proof do not become two different authentication factors.',
    teaching: [
      {
        kind: 'meaning',
        title: 'Use different kinds of proof.',
        text: 'Factors include something you know, something you have, and something you are. A password and a PIN are both things you know.',
        diagramDescription:
          'The diagram replaces the PIN with a possession factor, illustrated by a security key. Two distinct proof paths join the check. This is an example, not a prescribed product.',
      },
      {
        kind: 'example',
        title: 'Check every access path the rule names.',
        text: 'A fictional team checks MFA for privileged local access, privileged network access, and non-privileged network access. Protecting only its VPN would leave other covered paths unchecked.',
        diagramDescription:
          'Three separate paths are traced to MFA: privileged local, privileged network, and non-privileged network access. Each path must be considered; one working MFA screen does not prove the others are covered.',
      },
      {
        kind: 'takeaway',
        title: 'Different factors, with the right coverage.',
        text: 'Verify the actual factors and the named access paths. This requirement does not say that every local non-privileged login must use MFA.',
        diagramDescription:
          'All three named access paths remain visible with MFA checks. No local ordinary-user path is added to the requirement. The diagram is a teaching illustration, not evidence of deployment.',
      },
    ],
  },
  {
    controlId: 'IR.L3-3.6.2e',
    title: 'Ready to deploy is different from resolved',
    scene: 'response-team',
    requirementDiagram:
      'An established incident response team is connected to its deployment capability. The requirement specifies deployment within 24 hours.',
    teaching: [
      {
        kind: 'meaning',
        title: 'Make the team able to act.',
        text: 'Maintain the people, contact paths, access and equipment needed to deploy a response team. A list of names alone is not a deployable response capability.',
        diagramDescription:
          'Activation connects to people, access and equipment. These connected parts illustrate readiness; they are not a complete assessment checklist or mandatory team structure.',
      },
      {
        kind: 'example',
        title: 'Practice reaching the affected environment.',
        text: 'In a fictional incident, a coordinator activates responders. Remote access may let them act; a physically isolated site may require on-site arrangements. Plan for the environment involved.',
        diagramDescription:
          'The activation path branches to remote and on-site response arrangements. The moving connection reaches the relevant environment. These are example deployment routes, not a rule that every incident needs both.',
      },
      {
        kind: 'takeaway',
        title: 'The 24-hour limit concerns deployment.',
        text: 'The team must be deployable within 24 hours. That is not a promise to resolve every incident within 24 hours; investigation and recovery can continue after deployment.',
        diagramDescription:
          'The deployment window illustrates the 24-hour deployment capability; it does not define a contractual clock-start event. A separate response line continues beyond deployment, showing that deployment and incident resolution are different events.',
      },
    ],
  },
]

export const visualExplanations: readonly VisualExplanationContent[] =
  sequences.map((sequence) => {
    const control = referenceControls.find(
      (item) =>
        item.frameworkId === 'cmmc' &&
        item.editionId === 'cmmc-2-13-sep-2024' &&
        item.id === sequence.controlId,
    )
    if (!control)
      throw new Error(`Missing visual teaching source: ${sequence.controlId}`)
    const source = control.sources.find(
      (item) =>
        item.id ===
        `${control.requirement.sourceId}-page-${control.requirement.pdfPage}`,
    )
    if (!source)
      throw new Error(`Missing visual source citation: ${sequence.controlId}`)
    return {
      id: `visual-${control.key}`,
      lesson: {
        frameworkId: control.frameworkId,
        editionId: control.editionId,
        controlKey: control.key,
      },
      title: sequence.title,
      scene: sequence.scene,
      reviewStatus: 'draft',
      humanReview: 'pending',
      stageDurationMs: 10_000,
      stages: [
        {
          kind: 'requirement',
          title: 'Start with the source requirement.',
          text: control.requirement.text,
          diagramDescription: sequence.requirementDiagram,
        },
        ...sequence.teaching,
      ],
      source,
      sourceLabel: `${control.id} · September 2024 v2.13 · PDF page ${control.requirement.pdfPage}`,
      disclaimer:
        'A teaching interpretation with fictional examples. This walkthrough does not demonstrate organizational compliance or replace the full assessment guidance.',
    }
  })

export function findVisualExplanation(lesson: LessonIdentity) {
  return visualExplanations.find(
    (item) =>
      item.lesson.frameworkId === lesson.frameworkId &&
      item.lesson.editionId === lesson.editionId &&
      item.lesson.controlKey === lesson.controlKey,
  )
}
