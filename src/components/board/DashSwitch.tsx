import { setDashOn, useDashOn } from './tray-state'

/** The footer's switch for Dash; "off" is remembered with the site's other preferences. */
export function DashSwitch() {
  const on = useDashOn()
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      className="dash-switch"
      onClick={() => setDashOn(!on)}
    >
      Dash<span aria-hidden="true">: {on ? 'on' : 'off'}</span>
    </button>
  )
}
