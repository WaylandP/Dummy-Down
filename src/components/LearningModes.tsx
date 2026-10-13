import { useRef } from 'react'
import { BookOpen, Code2, ClipboardCheck } from 'lucide-react'
import { explanationModes } from '../data/content'
import type { ExplanationMode } from '../types/content'

const icons = {
  beginner: BookOpen,
  'it-cyber': Code2,
  compliance: ClipboardCheck,
}

interface LearningModesProps {
  value: ExplanationMode
  onChange: (mode: ExplanationMode) => void
  idPrefix: string
}

export function LearningModes({
  value,
  onChange,
  idPrefix,
}: LearningModesProps) {
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  function selectTab(index: number) {
    const mode = explanationModes[index]
    if (mode) {
      onChange(mode.id)
      tabs.current[index]?.focus()
    }
  }

  return (
    <div className="mode-tabs" role="tablist" aria-label="Explanation mode">
      {explanationModes.map((mode, index) => {
        const Icon = icons[mode.id]
        return (
          <button
            key={mode.id}
            ref={(element) => {
              tabs.current[index] = element
            }}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${mode.id}`}
            aria-controls={`${idPrefix}-panel`}
            aria-selected={value === mode.id}
            tabIndex={value === mode.id ? 0 : -1}
            onClick={() => onChange(mode.id)}
            onKeyDown={(event) => {
              let next: number | undefined
              if (event.key === 'ArrowRight')
                next = (index + 1) % explanationModes.length
              if (event.key === 'ArrowLeft')
                next =
                  (index + explanationModes.length - 1) %
                  explanationModes.length
              if (event.key === 'Home') next = 0
              if (event.key === 'End') next = explanationModes.length - 1
              if (next !== undefined) {
                event.preventDefault()
                selectTab(next)
              }
            }}
          >
            <Icon size={16} aria-hidden="true" />
            {mode.shortLabel}
          </button>
        )
      })}
    </div>
  )
}
