import { useEffect, useRef, useState } from 'react'
import { chalkFor } from './chalks'
import { cueSmudge, useSmudgeCue, useSmudgeOn } from './tray-state'

/** How long each gesture lasts; the sweep is the Erase's own 400 ms. */
const lengths = { sweep: 400, hand: 700, sneeze: 900 } as const
/** A minute with no input and he dozes; a puff of dust about once a minute. */
const dozeAfter = 60_000
const puffEvery = 50_000
const puffLength = 1_600
/** The pupils drift this far toward the cursor, in viewBox units. */
const drift = 3

const still = '(prefers-reduced-motion: reduce)'
const wakeEvents = [
  'pointerdown',
  'pointermove',
  'keydown',
  'touchstart',
] as const

type Pose = 'idle' | 'doze' | 'sweep' | 'hand' | 'sneeze'

/** The eyes open: whites, pupils that can look, and the brows of the moment. */
function Eyes({ pose }: { pose: Pose }) {
  if (pose === 'sweep' || pose === 'sneeze' || pose === 'doze')
    return (
      <path
        className="smudge-eyes-closed"
        d={
          pose === 'sweep'
            ? 'M58 48c4-4 12-4 16 0M96 48c4-4 12-4 16 0'
            : pose === 'sneeze'
              ? 'M58 46c4 4 12 4 16 0M96 46c4 4 12 4 16 0'
              : 'M58 50c4 3 12 3 16 0M96 50c4 3 12 3 16 0'
        }
      />
    )
  return (
    <g className="smudge-eyes">
      <circle className="smudge-eye" cx="66" cy="48" r="9" />
      <circle className="smudge-eye" cx="104" cy="48" r="9" />
      <circle className="smudge-pupil" cx="68" cy="49" r="4" />
      <circle className="smudge-pupil" cx="106" cy="49" r="4" />
    </g>
  )
}

const brows: Record<Pose, string> = {
  idle: 'M55 33l18-3M97 30l18 3',
  doze: '',
  sweep: 'M54 32l20 2M96 34l20-2',
  hand: 'M55 31l18-2M97 29l18 1',
  sneeze: 'M55 30l18 5M97 35l18-5',
}
const mouths: Record<Exclude<Pose, 'sneeze'>, string> = {
  idle: 'M78 60c4 3 10 3 14 0',
  doze: 'M80 61h10',
  sweep: 'M76 60c5 4 13 4 18 0',
  hand: 'M78 59c4 4 10 4 14 0',
}

/**
 * Smudge is the eraser on the right end of the tray, from mockups/Smudge.html:
 * a wooden back, a felt face with chalk dust in it, and eyes, brows and a
 * mouth drawn on the wood in chalk. Idle he blinks, his pupils drift toward
 * the cursor and a puff of dust rises now and then; he sweeps the board with
 * the Erase, nudges the chalk that was picked up out of the tray, sneezes
 * when clicked or when a practice answer is right, and dozes after a minute
 * with nothing to do. He never speaks: the markup is hidden from assistive
 * technology, nothing in it takes focus, and the footer switch is the only
 * control. Off, under reduced motion and in print he is a plain eraser.
 */
export function Smudge() {
  const on = useSmudgeOn()
  const cue = useSmudgeCue()
  const body = useRef<SVGSVGElement | null>(null)
  // A cue from before this Smudge was mounted is already spent: nothing replays.
  const [spent, setSpent] = useState(() => cue?.at ?? 0)
  const [dozing, setDozing] = useState(false)
  const [puffing, setPuffing] = useState(false)

  // Each gesture lasts its own length, then he is still again.
  useEffect(() => {
    if (!cue) return
    const timer = window.setTimeout(() => setSpent(cue.at), lengths[cue.kind])
    return () => window.clearTimeout(timer)
  }, [cue])

  // Pointer only: his pupils follow a mouse, never a finger. The look is a
  // style on the svg, so following the cursor renders nothing.
  useEffect(() => {
    if (!on || window.matchMedia?.(still).matches) return
    const look = (event: PointerEvent) => {
      const svg = body.current
      if (!svg || event.pointerType !== 'mouse') return
      const box = svg.getBoundingClientRect()
      const dx = event.clientX - (box.left + box.width / 2)
      const dy = event.clientY - (box.top + box.height * 0.44)
      const length = Math.hypot(dx, dy) || 1
      const reach = Math.min(1, length / 240) * drift
      svg.style.setProperty('--look-x', ((dx / length) * reach).toFixed(2))
      svg.style.setProperty('--look-y', ((dy / length) * reach).toFixed(2))
    }
    window.addEventListener('pointermove', look, { passive: true })
    return () => window.removeEventListener('pointermove', look)
  }, [on])

  // A minute with no input and he dozes; any key or pointer wakes him.
  useEffect(() => {
    if (!on || window.matchMedia?.(still).matches) return
    let timer = 0
    const rest = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setDozing(true), dozeAfter)
    }
    const wake = () => {
      setDozing(false)
      rest()
    }
    for (const type of wakeEvents)
      window.addEventListener(type, wake, { passive: true })
    rest()
    return () => {
      window.clearTimeout(timer)
      for (const type of wakeEvents) window.removeEventListener(type, wake)
      setDozing(false)
    }
  }, [on])

  // A small puff of dust about once a minute while he is awake: on for its
  // length, then gone, so a gesture ending later does not replay it.
  useEffect(() => {
    if (!on || dozing || window.matchMedia?.(still).matches) return
    let settle = 0
    const timer = window.setInterval(() => {
      setPuffing(true)
      window.clearTimeout(settle)
      settle = window.setTimeout(() => setPuffing(false), puffLength)
    }, puffEvery)
    return () => {
      window.clearInterval(timer)
      window.clearTimeout(settle)
      setPuffing(false)
    }
  }, [on, dozing])

  const gesture = on && cue && spent !== cue.at ? cue.kind : null
  const pose: Pose = gesture ?? (on && dozing ? 'doze' : 'idle')
  const stick =
    gesture === 'hand' && cue?.mode ? chalkFor(cue.mode).color : null
  return (
    <span
      className={`smudge${on ? '' : ' is-off'}`}
      data-pose={on ? pose : undefined}
      aria-hidden="true"
      onClick={on ? () => cueSmudge('sneeze') : undefined}
    >
      <svg
        ref={body}
        // A new cue remounts him, so the same gesture twice in a row plays twice.
        key={gesture && cue ? cue.at : 0}
        className="smudge-body"
        viewBox="0 0 170 110"
        focusable="false"
      >
        <defs>
          <linearGradient id="smudge-wood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7a6349" />
            <stop offset=".25" stopColor="#5e4a36" />
            <stop offset="1" stopColor="#3b2e22" />
          </linearGradient>
        </defs>
        {/* Behind him: the chalk he hands over, the sweep's wake, the sneeze's dust. */}
        {stick && (
          <rect
            className={`smudge-stick smudge-stick-${stick}`}
            x="118"
            y="2"
            width="12"
            height="58"
            rx="6"
          />
        )}
        {gesture === 'sweep' && (
          <g className="smudge-wake">
            <path d="M2 40h22M0 56h18M4 72h22" />
            <circle cx="150" cy="40" r="7" />
            <circle cx="162" cy="30" r="5" />
            <circle cx="140" cy="22" r="4" />
            <circle cx="166" cy="50" r="3" />
          </g>
        )}
        {gesture === 'sneeze' && (
          <g className="smudge-sneeze">
            <circle cx="110" cy="92" r="10" />
            <circle cx="135" cy="98" r="8" />
            <circle cx="92" cy="102" r="6" />
            <circle cx="150" cy="86" r="5" />
            <circle cx="70" cy="100" r="5" />
          </g>
        )}
        {on && puffing && (
          <g className="smudge-puff">
            <circle cx="40" cy="62" r="4" />
            <circle cx="30" cy="54" r="3" />
            <circle cx="48" cy="52" r="2.5" />
          </g>
        )}
        {pose === 'doze' && (
          <g className="smudge-zs chalk">
            <text x="150" y="30">
              z
            </text>
            <text className="smudge-z-far" x="162" y="16">
              z
            </text>
          </g>
        )}
        <ellipse className="smudge-shadow" cx="85" cy="100" rx="70" ry="5" />
        <rect
          className="smudge-wood"
          x="12"
          y="24"
          width="146"
          height="46"
          rx="7"
        />
        <rect
          className="smudge-grain"
          x="18"
          y="27"
          width="134"
          height="4"
          rx="2"
        />
        <rect
          className="smudge-felt"
          x="12"
          y="66"
          width="146"
          height="30"
          rx="6"
        />
        <path
          className="smudge-dust-lines"
          d="M24 74c20 4 40-2 60 2s40-3 62 1M30 84c24 3 48-3 72 1s30-2 50 0"
        />
        <rect
          className="smudge-edge"
          x="12"
          y="90"
          width="146"
          height="6"
          rx="3"
        />
        {on && (
          <g className="smudge-face chalk">
            <Eyes pose={pose} />
            {brows[pose] && <path className="smudge-brows" d={brows[pose]} />}
            {pose === 'sneeze' ? (
              <circle className="smudge-mouth" cx="85" cy="61" r="4" />
            ) : (
              <path className="smudge-mouth" d={mouths[pose]} />
            )}
          </g>
        )}
      </svg>
    </span>
  )
}
