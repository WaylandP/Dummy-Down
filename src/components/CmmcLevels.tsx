import { ArrowUpRight } from 'lucide-react'
import { referenceControls } from '../data/content'
import { serializeExplorerSearch } from '../state/explorer-state'
import type { ExplanationMode } from '../types/content'
import { trackUsage } from '../analytics/usage'

const levels = [
  { name: 'Level 1', description: 'Foundational safeguards' },
  { name: 'Level 2', description: 'NIST SP 800-171 Rev. 2 baseline' },
  { name: 'Level 3', description: 'Selected enhanced requirements' },
]

export function CmmcLevels({ mode }: { mode: ExplanationMode }) {
  return (
    <div className="cmmc-levels">
      <nav aria-label="CMMC levels" className="level-paths">
        {levels.map((level) => (
          <a
            key={level.name}
            href={`/${serializeExplorerSearch({ view: 'discover', mode, filters: { catalog: 'cmmc', collection: 'references', query: '', family: '', level: level.name } })}#explorer`}
            onClick={() => {
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
              source references
            </span>
          </a>
        ))}
      </nav>
      <p>
        CMMC v2.13 · September 2024 snapshot. Level 3 adds requirements to Level
        2. Choose a level to explore.
      </p>
    </div>
  )
}
