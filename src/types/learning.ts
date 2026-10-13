import type { LessonIdentity, SourceReference } from './content'

export interface ScenarioStep {
  readonly id: string
  readonly title: string
  readonly description: string
}

export interface LearningChoice {
  readonly id: string
  readonly label: string
  readonly feedback: string
}

export interface LearningQuestion {
  readonly id: string
  readonly prompt: string
  readonly choices: readonly LearningChoice[]
  readonly correctChoiceId: string
}

/** A readable teaching flow, separate from official assessment diagrams. */
export interface LearningDiagram {
  readonly title: string
  readonly steps: readonly ScenarioStep[]
  readonly branches?: readonly ScenarioStep[]
  readonly textEquivalent: string
}

/** Fictional teaching material, separate from requirements or assessment results. */
export interface LearningActivity {
  readonly id: string
  readonly lesson: LessonIdentity
  readonly reviewStatus: 'draft'
  readonly title: string
  readonly introduction: string
  readonly plainEnglish?: string
  readonly commonMisunderstanding?: {
    readonly claim: string
    readonly correction: string
  }
  readonly diagram?: LearningDiagram
  readonly scenarioTitle: string
  readonly scenario: readonly ScenarioStep[]
  readonly questions: readonly LearningQuestion[]
  readonly disclaimer: string
  readonly teachingSource: SourceReference
}
