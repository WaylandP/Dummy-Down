import type { ReactNode } from 'react'
import type { ExplanationMode } from '../../types/content'
import { chalks } from './chalks'

interface ChalkTrayProps {
  /** The chalk in the visitor's hand, if a perspective is open. */
  readonly lifted?: ExplanationMode | null
  /** Small text on the wood, right-aligned. */
  readonly label?: ReactNode
}

/** The wooden tray along the bottom of every screen. Decorative on desktop. */
export function ChalkTray({ lifted = null, label }: ChalkTrayProps) {
  return (
    <div className="chalk-tray" aria-hidden="true">
      {chalks.map((chalk) => (
        <span
          key={chalk.mode}
          className={`tray-stick tray-stick-${chalk.color}`}
          data-lifted={lifted === chalk.mode ? 'true' : undefined}
        />
      ))}
      <span className="tray-stub" />
      {label && <span className="tray-legend">{label}</span>}
    </div>
  )
}

/** What the chalks mean, for screens that have not yet picked one up. */
export function TrayLegend() {
  return (
    <>
      {chalks.map((chalk) => (
        <span key={chalk.mode}>
          {chalk.color}: {chalk.label}
        </span>
      ))}
    </>
  )
}
