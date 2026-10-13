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

/** Fictional teaching material, separate from requirements or assessment results. */
export interface LearningActivity {
  readonly id: string
  readonly lesson: LessonIdentity
  readonly reviewStatus: 'draft'
  readonly title: string
  readonly introduction: string
  readonly scenarioTitle: string
  readonly scenario: readonly ScenarioStep[]
  readonly questions: readonly LearningQuestion[]
  readonly disclaimer: string
  readonly teachingSource: SourceReference
}
