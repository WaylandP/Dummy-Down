import { SmudgeFigure } from '../board/Smudge'
import {
  boards,
  handPath,
  loopPath,
  starPath,
  tickPath,
  yearMarks,
  type Arrangement,
} from './sixty-drawing'
import { sixtyBoardTitle, sixtyDescription } from './sixty-script'

/**
 * The board: two scenes drawn on the same slate. Scene 1, Who and Levels,
 * is done by 0:15 and circled; Smudge wipes it off between 0:15.7 and
 * 0:16.9, leaving the faint haze an erased board keeps; scene 2, the Level
 * 2 clock with SPRS at its hub, is drawn from 0:17 in its place. Every
 * stroke and label carries `data-t="start,seconds"`, when it is drawn and
 * how long it takes; the player (useSixtyPlayer) reads them and draws each
 * along its length, or wipes each label in from the left. The same words
 * and marks take two arrangements, picked by the board's width.
 */

interface Label {
  readonly x: number
  readonly y: number
  readonly size: number
  readonly anchor?: 'middle' | 'end'
}

interface Star {
  readonly x: number
  readonly y: number
  readonly outer: number
  readonly inner: number
}

/** Where everything sits, in one arrangement's board units. */
interface Layout {
  readonly dod: Label
  readonly shares: Label
  readonly arrow1: string
  readonly company: Label
  readonly fci: Label
  readonly arrowFci: string
  readonly level1: Label
  readonly rule1: Label
  readonly cui: Label
  readonly arrowCui: string
  readonly level2: Label
  readonly rule2: Label
  readonly critical: Label
  readonly arrowCritical: string
  readonly level3: Label
  readonly rule3: Label
  readonly circle: string
  readonly runs: Label
  readonly sprs: Label
  readonly current: Label
  readonly year1: Label
  readonly year2: Label
  readonly year3: Label
  readonly star: Star
  readonly c3pao: Label
  readonly certLine: string
  readonly check1: string
  readonly affirm: Label
  readonly check2: string
  readonly result2: string
  readonly bolt: string
  readonly burst: Star
  readonly result3: string
  readonly change: Label
  readonly reassess: Label
  readonly check3: string
  readonly result4: string
  readonly recertArrow: string
  readonly recert: Label
  readonly box: string
  readonly bottom: Label
}

/** When each mark is drawn, and for how long: the same in both arrangements. */
const at = {
  dod: '2.5,0.6',
  shares: '3.2,1.1',
  arrow1: '4.4,0.9',
  company: '5.4,1.1',
  fci: '7.3,0.5',
  arrowFci: '7.9,0.4',
  level1: '8.4,0.7',
  rule1: '9.2,1.0',
  cui: '10.3,0.5',
  arrowCui: '10.9,0.4',
  level2: '11.4,0.7',
  rule2: '12.2,1.0',
  critical: '13.2,0.5',
  arrowCritical: '13.8,0.3',
  level3: '14.1,0.4',
  rule3: '14.3,0.7',
  circle: '15.0,0.6',
  runs: '17.0,0.6',
  dial: '17.6,1.6',
  marks: '19.3,0.5',
  ticks: '19.9,0.8',
  hub: '20.8,0.6',
  sprs: '21.4,0.6',
  year1: '22.0,0.3',
  year2: '22.3,0.3',
  year3: '22.6,0.3',
  star: '23.4,0.8',
  c3pao: '24.3,0.7',
  certLine: '25.0,0.5',
  current: '25.6,0.5',
  check1: '31.3,0.4',
  affirm: '31.8,1.0',
  check2: '36.0,0.4',
  result2: '36.4,0.5',
  bolt: '42.2,0.5',
  burst: '42.8,0.5',
  result3: '43.3,0.4',
  change: '43.7,0.7',
  reassess: '44.4,0.5',
  check3: '46.0,0.4',
  result4: '46.4,0.5',
  recertArrow: '53.8,0.6',
  recert: '54.5,0.9',
  box: '56.3,0.9',
  bottom: '57.3,1.3',
} as const

/** 520×235: scene 1 across the board; then the clock on the left, its words on the right. No word under 14.5 units. */
const wide: Layout = {
  dod: { x: 100, y: 56, size: 24 },
  shares: { x: 213, y: 36, size: 14.5, anchor: 'middle' },
  arrow1: 'M158 52 C190 45 232 56 268 50 M256 44 L269 50 L257 57',
  company: { x: 280, y: 56, size: 22 },
  fci: { x: 232, y: 104, size: 20, anchor: 'end' },
  arrowFci: 'M240 98 C252 93 264 103 276 96 M269 91 L278 97 L270 103',
  level1: { x: 286, y: 104, size: 20 },
  rule1: { x: 286, y: 123, size: 14.5 },
  cui: { x: 232, y: 152, size: 20, anchor: 'end' },
  arrowCui: 'M240 146 C252 141 264 151 276 144 M269 139 L278 145 L270 151',
  level2: { x: 286, y: 152, size: 20 },
  rule2: { x: 286, y: 171, size: 14.5 },
  critical: { x: 232, y: 200, size: 15.5, anchor: 'end' },
  arrowCritical: 'M240 194 C252 189 264 199 276 192 M269 187 L278 193 L270 199',
  level3: { x: 286, y: 200, size: 20 },
  rule3: { x: 286, y: 219, size: 14.5 },
  circle:
    'M282 148 C281 134 300 130 320 130 C342 130 361 136 361 146 C361 157 342 162 318 162 C300 162 284 158 281 146',
  runs: { x: 250, y: 22, size: 15 },
  sprs: { x: 122, y: 124, size: 17, anchor: 'middle' },
  current: { x: 122, y: 141, size: 14.5, anchor: 'middle' },
  year1: { x: 169, y: 105, size: 14.5, anchor: 'middle' },
  year2: { x: 122, y: 190, size: 14.5, anchor: 'middle' },
  year3: { x: 75, y: 105, size: 14.5, anchor: 'middle' },
  star: { x: 122, y: 52, outer: 9, inner: 4 },
  c3pao: { x: 134, y: 40, size: 15 },
  certLine: 'M122 64 L122 97',
  check1: 'M190 37 L196 44 L206 29',
  affirm: { x: 214, y: 44, size: 14.5 },
  check2: 'M196 174 L202 181 L212 166',
  result2: 'M192 170 L149 146',
  bolt: 'M56 233 L67 215 L60 214 L70 195',
  burst: { x: 94, y: 212, outer: 5.5, inner: 2.5 },
  result3: 'M72 194 L104 156',
  change: { x: 250, y: 118, size: 15 },
  reassess: { x: 250, y: 138, size: 15 },
  check3: 'M32 174 L38 181 L48 166',
  result4: 'M52 170 L96 145',
  recertArrow: 'M60 56 Q84 44 112 54 M102 47 L113 54 L103 61',
  recert: { x: 2, y: 40, size: 14.5 },
  box: 'M250 196 C340 194 430 195 516 197 C518 206 517 220 516 230 C430 232 340 231 250 230 C248 220 249 206 251 195',
  bottom: { x: 383, y: 219, size: 15.5, anchor: 'middle' },
}

/** 300×366: scene 1 stacked; then the clock above the bottom line. No word under 12 units. */
const narrow: Layout = {
  dod: { x: 10, y: 40, size: 22 },
  shares: { x: 89, y: 20, size: 12.5, anchor: 'middle' },
  arrow1: 'M60 36 C78 31 98 38 118 34 M108 29 L119 35 L109 41',
  company: { x: 128, y: 40, size: 20 },
  fci: { x: 78, y: 88, size: 18, anchor: 'end' },
  arrowFci: 'M86 83 C96 79 106 87 116 81 M109 76 L117 82 L110 88',
  level1: { x: 124, y: 88, size: 18 },
  rule1: { x: 124, y: 106, size: 12 },
  cui: { x: 78, y: 136, size: 18, anchor: 'end' },
  arrowCui: 'M86 131 C96 127 106 135 116 129 M109 124 L117 130 L110 136',
  level2: { x: 124, y: 136, size: 18 },
  rule2: { x: 124, y: 154, size: 12 },
  critical: { x: 78, y: 184, size: 13, anchor: 'end' },
  arrowCritical: 'M86 179 C96 175 106 183 116 177 M109 172 L117 178 L110 184',
  level3: { x: 124, y: 184, size: 18 },
  rule3: { x: 124, y: 202, size: 12 },
  circle:
    'M120 133 C119 121 136 118 154 118 C174 118 191 123 191 132 C191 142 174 146 152 146 C136 146 122 143 119 132',
  runs: { x: 150, y: 18, size: 12.5, anchor: 'middle' },
  sprs: { x: 150, y: 166, size: 17, anchor: 'middle' },
  current: { x: 150, y: 184, size: 12.5, anchor: 'middle' },
  year1: { x: 207, y: 142, size: 12.5, anchor: 'middle' },
  year2: { x: 150, y: 248, size: 12.5, anchor: 'middle' },
  year3: { x: 93, y: 142, size: 12.5, anchor: 'middle' },
  star: { x: 150, y: 76, outer: 9, inner: 4 },
  c3pao: { x: 150, y: 60, size: 13, anchor: 'middle' },
  certLine: 'M150 88 L150 136',
  check1: 'M178 62 L184 69 L194 54',
  affirm: { x: 296, y: 52, size: 12, anchor: 'end' },
  check2: 'M240 226 L246 233 L256 218',
  result2: 'M236 222 L179 189',
  bolt: 'M64 302 L76 283 L68 281 L80 260',
  burst: { x: 100, y: 278, outer: 5.5, inner: 2.5 },
  result3: 'M82 258 L126 196',
  change: { x: 112, y: 292, size: 12.5 },
  reassess: { x: 112, y: 310, size: 12.5 },
  check3: 'M44 226 L50 233 L60 218',
  result4: 'M64 222 L121 189',
  recertArrow: 'M56 68 Q92 52 140 72 M129 65 L141 72 L130 79',
  recert: { x: 4, y: 52, size: 12 },
  box: 'M20 326 C70 324 230 325 280 327 C282 336 281 350 280 360 C230 362 70 361 20 360 C18 350 19 336 21 325',
  bottom: { x: 150, y: 349, size: 13, anchor: 'middle' },
}

const layouts: Record<Arrangement, Layout> = { wide, narrow }

/** One timed label; its colour by class (chalk, yellow or dim). */
function Word({
  at: label,
  t,
  tone,
  children,
}: {
  readonly at: Label
  readonly t: string
  readonly tone?: 'y' | 'dim'
  readonly children: string
}) {
  return (
    <text
      className={tone}
      x={label.x}
      y={label.y}
      fontSize={label.size}
      textAnchor={label.anchor}
      data-t={t}
    >
      {children}
    </text>
  )
}

/** One timed stroke. */
function Line({
  d,
  t,
  className = 'ln',
}: {
  readonly d: string
  readonly t: string
  readonly className?: string
}) {
  return <path className={className} d={d} data-t={t} />
}

/** Chapters 1 and 2: who shares what with whom, and the three levels. */
function SceneOne({ l }: { readonly l: Layout }) {
  return (
    <>
      <Word at={l.dod} t={at.dod}>
        DoD
      </Word>
      <Word at={l.shares} t={at.shares} tone="dim">
        shares information
      </Word>
      <Line d={l.arrow1} t={at.arrow1} className="ln y" />
      <Word at={l.company} t={at.company}>
        your company
      </Word>
      <Word at={l.fci} t={at.fci}>
        FCI
      </Word>
      <Line d={l.arrowFci} t={at.arrowFci} className="ln y" />
      <Word at={l.level1} t={at.level1} tone="y">
        Level 1
      </Word>
      <Word at={l.rule1} t={at.rule1} tone="dim">
        15 rules · self-assess yearly
      </Word>
      <Word at={l.cui} t={at.cui}>
        CUI
      </Word>
      <Line d={l.arrowCui} t={at.arrowCui} className="ln y" />
      <Word at={l.level2} t={at.level2} tone="y">
        Level 2
      </Word>
      <Word at={l.rule2} t={at.rule2} tone="dim">
        110 rules · NIST SP 800-171
      </Word>
      <Word at={l.critical} t={at.critical}>
        critical CUI
      </Word>
      <Line d={l.arrowCritical} t={at.arrowCritical} className="ln y" />
      <Word at={l.level3} t={at.level3} tone="y">
        Level 3
      </Word>
      <Word at={l.rule3} t={at.rule3} tone="dim">
        Level 2 + 24 more · DIBCAC
      </Word>
      {/* chapter 3 opens by circling Level 2 */}
      <Line d={l.circle} t={at.circle} className="ln y" />
    </>
  )
}

/** Chapters 3 to 8: the clock, from the dial on. */
function SceneTwo({
  l,
  arrangement,
}: {
  readonly l: Layout
  readonly arrangement: Arrangement
}) {
  const { dial } = boards[arrangement]
  return (
    <>
      <Word at={l.runs} t={at.runs} tone="dim">
        Level 2 runs on this clock
      </Word>
      <Line d={loopPath(dial.cx, dial.cy, dial.r)} t={at.dial} />
      <Line d={yearMarks(dial)} t={at.marks} />
      <Line d={tickPath(dial)} t={at.ticks} className="ln dim tick" />
      <Line d={loopPath(dial.cx, dial.cy, dial.hub)} t={at.hub} />
      <Word at={l.sprs} t={at.sprs} tone="y">
        SPRS
      </Word>
      <Word at={l.year1} t={at.year1} tone="dim">
        year 1
      </Word>
      <Word at={l.year2} t={at.year2} tone="dim">
        year 2
      </Word>
      <Word at={l.year3} t={at.year3} tone="dim">
        year 3
      </Word>
      {/* chapter 4: certify */}
      <Line
        d={starPath(l.star.x, l.star.y, l.star.outer, l.star.inner)}
        t={at.star}
        className="ln y"
      />
      <Word at={l.c3pao} t={at.c3pao} tone="y">
        C3PAO
      </Word>
      <Line d={l.certLine} t={at.certLine} className="ln dim dash" />
      <Word at={l.current} t={at.current} tone="dim">
        current
      </Word>
      {/* chapter 5: every year */}
      <Line d={l.check1} t={at.check1} className="ln y" />
      <Word at={l.affirm} t={at.affirm}>
        self-assess + affirm
      </Word>
      <Line d={l.check2} t={at.check2} className="ln y" />
      <Line d={l.result2} t={at.result2} className="ln dim dash" />
      {/* chapter 6: significant change */}
      <Line d={l.bolt} t={at.bolt} className="ln y" />
      <Line
        d={starPath(l.burst.x, l.burst.y, l.burst.outer, l.burst.inner)}
        t={at.burst}
        className="ln y dash"
      />
      <Line d={l.result3} t={at.result3} className="ln dim dash" />
      <Word at={l.change} t={at.change}>
        significant change
      </Word>
      <Word at={l.reassess} t={at.reassess} tone="y">
        reassess now
      </Word>
      {/* chapter 7: repeat */}
      <Line d={l.check3} t={at.check3} className="ln y" />
      <Line d={l.result4} t={at.result4} className="ln dim dash" />
      <Line d={l.recertArrow} t={at.recertArrow} className="ln y" />
      <Word at={l.recert} t={at.recert} tone="y">
        3 yrs: recertify
      </Word>
      {/* chapter 8: the bottom line */}
      <Line d={l.box} t={at.box} className="ln y" />
      <Word at={l.bottom} t={at.bottom} tone="y">
        no current status = no contract
      </Word>
    </>
  )
}

interface SixtyBoardProps {
  /** Unique to this board: its title, description, masks and filter ids. */
  readonly id: string
  readonly arrangement: Arrangement
}

/**
 * The whole board, ready for the player to draw: it finds the hand, the
 * sector, the glow, the stick, the erase and clear strokes, the haze,
 * Smudge and the empty defs here by their classes.
 */
export function SixtyBoard({ id, arrangement }: SixtyBoardProps) {
  const g = boards[arrangement]
  const l = layouts[arrangement]
  const { dial } = g
  // Smudge's felt centre rides the erase stroke: his drawing is 170×110,
  // the felt's centre at (85, 81).
  const eraser = g.eraser
  return (
    <svg
      className="sixty-board"
      viewBox={`0 0 ${g.width} ${g.height}`}
      data-arrangement={arrangement}
      role="img"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-desc`}
    >
      <title id={`${id}-title`}>{sixtyBoardTitle}</title>
      <desc id={`${id}-desc`}>{sixtyDescription}</desc>
      <defs>
        <filter id={`${id}-soft`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
        <filter id={`${id}-haze`} x="-10%" y="-20%" width="120%" height="140%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <linearGradient id={`${id}-wood`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a6349" />
          <stop offset=".25" stopColor="#5e4a36" />
          <stop offset="1" stopColor="#3b2e22" />
        </linearGradient>
        {/* Scene 1 shows through this mask until Smudge's strokes cover it. */}
        <mask
          id={`${id}-erase`}
          maskUnits="userSpaceOnUse"
          x="-60"
          y="-60"
          width={g.width + 120}
          height={g.height + 120}
        >
          <rect
            x="-60"
            y="-60"
            width={g.width + 120}
            height={g.height + 120}
            fill="#fff"
          />
          <path
            className="sixty-erase-stroke"
            d={g.erase}
            fill="none"
            stroke="#000"
            strokeWidth={g.eraseWidth}
            strokeLinecap="round"
          />
        </mask>
        {/* Before 0:00 the finished board shows through this one. */}
        <mask
          id={`${id}-clear`}
          maskUnits="userSpaceOnUse"
          x="-60"
          y="-60"
          width={g.width + 120}
          height={g.height + 120}
        >
          <rect
            x="-60"
            y="-60"
            width={g.width + 120}
            height={g.height + 120}
            fill="#fff"
          />
          <path
            className="sixty-clear-stroke"
            d={g.clear}
            fill="none"
            stroke="#000"
            strokeWidth={g.clearWidth}
            strokeLinecap="round"
          />
        </mask>
        <clipPath id={`${id}-board`}>
          <rect width={g.width} height={g.height} />
        </clipPath>
      </defs>
      {/* Empty: the player adds the masks it builds for dashed strokes here. */}
      <defs className="sixty-defs" />
      <g mask={`url(#${id}-clear)`}>
        <g className="sixty-scene-one" mask={`url(#${id}-erase)`}>
          <g filter="url(#chalk)">
            <SceneOne l={l} />
          </g>
        </g>
        {/* The haze an erased board keeps, where Smudge wiped. */}
        <path
          className="sixty-haze"
          d={g.erase}
          strokeWidth={g.eraseWidth - 24}
          filter={`url(#${id}-haze)`}
        />
        <g className="sixty-scene-two">
          <path className="sixty-wedge" />
          <circle
            className="sixty-glow"
            cx={dial.cx}
            cy={dial.cy}
            r={dial.hub}
            filter={`url(#${id}-soft)`}
          />
          <g filter="url(#chalk)">
            <SceneTwo l={l} arrangement={arrangement} />
          </g>
          <g className="sixty-hand" filter="url(#chalk)">
            <path className="ln y hand" d={handPath(dial)} />
          </g>
        </g>
      </g>
      {/* Smudge, wiping: on the board only while a stroke of his is under
          way, and never past its edges. The clip sits outside the group
          the frames move, so it stays with the board. */}
      <g clipPath={`url(#${id}-board)`}>
        <g className="sixty-eraser">
          <g
            className="sixty-eraser-body"
            transform={`translate(${(-85 * eraser).toFixed(1)} ${(-81 * eraser).toFixed(1)}) scale(${eraser})`}
          >
            <SmudgeFigure pose="sweep" wood={`url(#${id}-wood)`} />
          </g>
        </g>
      </g>
      {/* The chalk stick, at the tip of whatever is being drawn. */}
      <g className="sixty-stick" aria-hidden="true">
        <g transform="rotate(-38)">
          <rect
            className="sixty-stick-body"
            x="-3"
            y="-34"
            width="10"
            height="36"
            rx="3"
          />
          <rect
            className="sixty-stick-shade"
            x="-3"
            y="-34"
            width="3"
            height="36"
            rx="1.5"
          />
        </g>
      </g>
    </svg>
  )
}
