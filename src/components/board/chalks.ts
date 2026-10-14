import type { ExplanationMode } from '../../types/content'

/** The three chalks are the three perspectives, in tray order. */
export const chalks = [
  { mode: 'beginner', color: 'white', label: 'new to this' },
  { mode: 'it-cyber', color: 'yellow', label: 'runs the systems' },
  { mode: 'compliance', color: 'blue', label: 'preparing for assessment' },
] as const satisfies readonly {
  mode: ExplanationMode
  color: string
  label: string
}[]
