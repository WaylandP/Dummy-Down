import type { ReactNode } from 'react'
import type { ExplanationMode } from '../../types/content'
import { chalkFor, chalks } from './chalks'
import type { TrayControl } from './tray-state'
import { DoodleStick } from './DoodleChalk'
import { Smudge } from './Smudge'

interface ChalkTrayProps {
  /** The chalk in the visitor's hand, if a perspective is open. */
  readonly lifted?: ExplanationMode | null
  /** Small text on the wood, right-aligned; the lifted chalk names itself. */
  readonly label?: ReactNode
  /** With a control on the board the chalks are the perspective switch. */
  readonly control?: TrayControl | null
}

/**
 * The wooden tray along the bottom of every screen, with the doodle chalk and
 * Smudge, the eraser, on its right end. Its three chalks are decorative until
 * a control is on the board; then they pick the perspective, and on a phone
 * the tray is the bottom bar.
 */
export function ChalkTray({
  lifted = null,
  label,
  control = null,
}: ChalkTrayProps) {
  const text = lifted
    ? `${chalkFor(lifted).color} chalk is in your hand`
    : label
  if (!control)
    return (
      <div className="chalk-tray">
        {chalks.map((chalk) => (
          <span
            key={chalk.mode}
            className={`tray-stick tray-stick-${chalk.color}`}
            aria-hidden="true"
          />
        ))}
        {text && (
          <span className="tray-legend" aria-hidden="true">
            {text}
          </span>
        )}
        <DoodleStick />
        <Smudge />
      </div>
    )
  return (
    <nav className="chalk-tray is-switch" aria-label="Pick a chalk">
      {chalks.map((chalk) => (
        <button
          key={chalk.mode}
          type="button"
          className="tray-pick"
          aria-pressed={lifted === chalk.mode}
          onClick={() => control.pick(chalk.mode)}
        >
          <span
            className={`tray-stick tray-stick-${chalk.color}`}
            data-lifted={lifted === chalk.mode ? 'true' : undefined}
            aria-hidden="true"
          />
          <span className="tray-pick-label">
            <span className="sr-only">{chalk.color} chalk: </span>
            {chalk.short}
          </span>
        </button>
      ))}
      {text && (
        <span className="tray-legend" aria-hidden="true">
          {text}
        </span>
      )}
      <DoodleStick />
      <Smudge />
    </nav>
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
