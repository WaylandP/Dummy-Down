import type { ReactNode } from 'react'
import type { ExplanationMode } from '../../types/content'
import { chalkFor, chalks } from './chalks'

interface ChalkTrayProps {
  /** The chalk in the visitor's hand, if a perspective is open. */
  readonly lifted?: ExplanationMode | null
  /** Small text on the wood, right-aligned; the lifted chalk names itself. */
  readonly label?: ReactNode
}

/** The wooden tray along the bottom of every screen. Decorative on desktop. */
export function ChalkTray({ lifted = null, label }: ChalkTrayProps) {
  const text = lifted
    ? `${chalkFor(lifted).color} chalk is in your hand`
    : label
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
      {text && <span className="tray-legend">{text}</span>}
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
