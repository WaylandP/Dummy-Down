import { ArrowUpRight } from 'lucide-react'
import { referenceControls } from '../data/content'
import { serializeExplorerSearch } from '../state/explorer-state'
import type { ExplanationMode } from '../types/content'
import { trackUsage } from '../analytics/usage'
import { plainClick } from './families'

const levels = [
  { name: 'Level 1', description: 'Foundational safeguards' },
  { name: 'Level 2', description: 'NIST SP 800-171 Rev. 2 baseline' },
  { name: 'Level 3', description: 'Selected enhanced requirements' },
]

interface CmmcLevelsProps {
  readonly mode: ExplanationMode
  /** The level filter in force, so the row can mark it. */
  readonly active?: string
  /** On the Controls page the links filter in place instead of reloading. */
  readonly onPick?: (level: string) => void
}

export function CmmcLevels({ mode, active = '', onPick }: CmmcLevelsProps) {
  return (
    <div id="explorer-levels" className="cmmc-levels">
      <nav aria-label="CMMC levels" className="level-paths">
        {levels.map((level) => (
          <a
            key={level.name}
            href={`/${serializeExplorerSearch({ view: 'discover', mode, filters: { catalog: 'cmmc', collection: 'references', query: '', family: '', level: level.name } })}#explorer`}
            aria-current={active === level.name ? 'true' : undefined}
            onClick={(event) => {
              // In place, the explorer's own dispatch reports the filter change.
              if (onPick) {
                if (!plainClick(event)) return
                event.preventDefault()
                onPick(active === level.name ? '' : level.name)
                return
              }
              trackUsage({ name: 'section_open', section: 'explorer' })
              trackUsage({
                name: 'filter_change',
                filter: 'level',
                value: level.name,
              })
            }}
          >
            <span className="level-path-name">
              {level.name}
              <ArrowUpRight size={16} aria-hidden="true" />
            </span>{' '}
            <span>{level.description}</span>{' '}
            <span className="level-path-count">
              {
                referenceControls.filter(
                  (control) => control.level === level.name,
                ).length
              }{' '}
              <span className="level-path-noun">controls</span>
            </span>
          </a>
        ))}
      </nav>
      <p>Level 3 adds requirements to Level 2. Choose a level to explore.</p>
    </div>
  )
}
