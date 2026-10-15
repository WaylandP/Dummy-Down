import { setSmudgeOn, useSmudgeOn } from './tray-state'

/** The footer's switch for Smudge; "off" is remembered with the site's other preferences. */
export function SmudgeSwitch() {
  const on = useSmudgeOn()
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      className="smudge-switch"
      onClick={() => setSmudgeOn(!on)}
    >
      Smudge<span aria-hidden="true">: {on ? 'on' : 'off'}</span>
    </button>
  )
}
