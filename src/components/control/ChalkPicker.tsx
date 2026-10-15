import { useRef } from 'react'
import type { ExplanationMode } from '../../types/content'
import { chalks } from '../board/chalks'

interface ChalkPickerProps {
  readonly value: ExplanationMode
  readonly onChange: (mode: ExplanationMode) => void
  readonly idPrefix: string
}

/** Three sticks as tabs: the chosen one lifts and tilts, and its colour writes the explanation. */
export function ChalkPicker({ value, onChange, idPrefix }: ChalkPickerProps) {
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  function select(index: number) {
    const chalk = chalks[index]
    if (!chalk) return
    onChange(chalk.mode)
    tabs.current[index]?.focus()
  }
  return (
    <div className="chalk-picker">
      <p className="hand chalk-picker-title" id={`${idPrefix}-pick`}>
        Pick a chalk
      </p>
      <div
        role="tablist"
        aria-labelledby={`${idPrefix}-pick`}
        className="chalk-sticks"
      >
        {chalks.map((chalk, index) => (
          <button
            key={chalk.mode}
            ref={(element) => {
              tabs.current[index] = element
            }}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${chalk.mode}`}
            aria-controls={`${idPrefix}-panel`}
            aria-selected={value === chalk.mode}
            tabIndex={value === chalk.mode ? 0 : -1}
            className={`stick ${value === chalk.mode ? 'on' : ''}`}
            onClick={() => onChange(chalk.mode)}
            onKeyDown={(event) => {
              let next: number | undefined
              if (event.key === 'ArrowRight' || event.key === 'ArrowDown')
                next = (index + 1) % chalks.length
              if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
                next = (index + chalks.length - 1) % chalks.length
              if (event.key === 'Home') next = 0
              if (event.key === 'End') next = chalks.length - 1
              if (next !== undefined) {
                event.preventDefault()
                select(next)
              }
            }}
          >
            <span
              className={`stick-bar tray-stick-${chalk.color}`}
              aria-hidden="true"
            />
            {chalk.prompt}
          </button>
        ))}
      </div>
    </div>
  )
}
