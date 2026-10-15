import type { ExplanationMode } from '../../types/content'

/** The three chalks are the three perspectives, in tray order. */
export const chalks = [
  {
    mode: 'beginner',
    color: 'white',
    label: 'new to this',
    short: 'new to this',
    prompt: 'I’m new to this',
    cssColor: 'var(--color-chalk)',
  },
  {
    mode: 'it-cyber',
    color: 'yellow',
    label: 'runs the systems',
    short: 'runs systems',
    prompt: 'I run the systems',
    cssColor: 'var(--color-yellow)',
  },
  {
    mode: 'compliance',
    color: 'blue',
    label: 'preparing for assessment',
    short: 'assessment',
    prompt: 'I’m preparing for assessment',
    cssColor: 'var(--color-blue)',
  },
] as const satisfies readonly {
  mode: ExplanationMode
  color: string
  label: string
  /** The phone bar's label (mockups/Phone.html). */
  short: string
  prompt: string
  cssColor: string
}[]

export type Chalk = (typeof chalks)[number]

export function chalkFor(mode: ExplanationMode): Chalk {
  return chalks.find((chalk) => chalk.mode === mode) ?? chalks[0]
}
