import { useEffect, useState } from 'react'
import { useDashCue, useDashOn } from './tray-state'

/** The gestures Dash makes, one per interaction, then still; how long each lasts. */
const lengths = { hand: 600, sweep: 400, nod: 500, dot: 3000 } as const

interface DashProps {
  /** Lifted when the white chalk is in hand, like any stick in the tray. */
  readonly lifted?: boolean
}

/**
 * Dash is the white chalk in the tray: one chalk stroke with two eyes, drawn
 * through the chalk filter. Idle, it blinks every few seconds. It lifts the
 * chosen chalk, sweeps once on Erase, nods once at a popover, and is joined by
 * Dot when a practice activity is finished. It never speaks: the markup is
 * hidden from assistive technology and every gesture is one CSS animation.
 * Off (the footer switch, reduced motion, print) it is a plain stub of chalk.
 */
export function Dash({ lifted = false }: DashProps) {
  const on = useDashOn()
  const cue = useDashCue()
  // A cue from before this Dash was mounted is already spent: nothing replays.
  const [spent, setSpent] = useState(() => cue?.at ?? 0)
  useEffect(() => {
    if (!cue) return
    const timer = window.setTimeout(() => setSpent(cue.at), lengths[cue.kind])
    return () => window.clearTimeout(timer)
  }, [cue])
  const gesture = on && cue && spent !== cue.at ? cue.kind : null
  // A new cue remounts the stroke, so the same gesture twice in a row plays twice.
  const stamp = gesture && cue ? cue.at : 0
  return (
    <span
      className={`tray-stick tray-stick-white dash${on ? '' : ' is-still'}`}
      data-lifted={lifted ? 'true' : undefined}
      data-gesture={gesture ?? undefined}
      aria-hidden="true"
    >
      <svg
        key={stamp}
        className="dash-body chalk"
        viewBox="0 0 150 46"
        focusable="false"
      >
        <path className="dash-stroke" d="M18 28c30-7 70-7 114 0" />
        <circle className="dash-eye" cx="52" cy="26" r="4.2" />
        <circle className="dash-eye" cx="76" cy="24" r="4.2" />
      </svg>
      {gesture === 'dot' && (
        <svg className="dash-dot chalk" viewBox="0 0 24 24" focusable="false">
          <circle className="dash-dot-body" cx="12" cy="12" r="7" />
          <circle className="dash-dot-eye" cx="10" cy="11" r="1.8" />
          <circle className="dash-dot-eye" cx="15" cy="11" r="1.8" />
        </svg>
      )}
    </span>
  )
}
