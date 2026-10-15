import type { ReactNode } from 'react'
import type { ExplanationMode } from '../../types/content'
import { chalkFor, chalks } from './chalks'
import type { TrayControl } from './tray-state'
import { Dash } from './Dash'

interface ChalkTrayProps {
  /** The chalk in the visitor's hand, if a perspective is open. */
  readonly lifted?: ExplanationMode | null
  /** Small text on the wood, right-aligned; the lifted chalk names itself. */
  readonly label?: ReactNode
  /** With a control on the board the chalks are the perspective switch. */
  readonly control?: TrayControl | null
}

/**
 * The wooden tray along the bottom of every screen. Dash is the white chalk.
 * Decorative until a control is on the board; then its three chalks pick the
 * perspective, and on a phone the tray is the bottom bar.
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
      <div className="chalk-tray" aria-hidden="true">
        {chalks.map((chalk) =>
          chalk.color === 'white' ? (
            <Dash key={chalk.mode} />
          ) : (
            <span
              key={chalk.mode}
              className={`tray-stick tray-stick-${chalk.color}`}
            />
          ),
        )}
        <span className="tray-stub" />
        {text && <span className="tray-legend">{text}</span>}
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
          {chalk.color === 'white' ? (
            <Dash lifted={lifted === chalk.mode} />
          ) : (
            <span
              className={`tray-stick tray-stick-${chalk.color}`}
              data-lifted={lifted === chalk.mode ? 'true' : undefined}
              aria-hidden="true"
            />
          )}
          <span className="tray-pick-label">
            <span className="sr-only">{chalk.color} chalk: </span>
            {chalk.short}
          </span>
        </button>
      ))}
      <span className="tray-stub" aria-hidden="true" />
      {text && (
        <span className="tray-legend" aria-hidden="true">
          {text}
        </span>
      )}
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
