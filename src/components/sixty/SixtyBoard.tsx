import {
  CX,
  CY,
  NARROW_VIEWBOX,
  STILL_VIEWBOX,
  WIDE_VIEWBOX,
  starPath,
  tickPath,
} from './sixty-drawing'
import { sixtyBoardTitle, sixtyDescription } from './sixty-script'

/**
 * The board, as drawn in mockups/2026-10-15/SixtySeconds.html: a chalk
 * clock face (Level 2's three-year cycle, SPRS at the hub) beside a column
 * of notes. Every stroke and label carries `data-t="start,seconds"`, when
 * it is drawn and how long it takes; the player (useSixtyPlayer) reads them
 * and draws each along its length, or wipes each label in from the left.
 * The strokes and the lettering wear the site's chalk filter.
 */

const handPath = 'M280 279 L280 190 M271 202 L280 189 L289 202'

/**
 * The clock. The still leaves out the "significant change" bolt below the
 * dial and the stacked layout's own caption above it.
 */
function Dial({ still }: { readonly still: boolean }) {
  return (
    <>
      {!still && (
        <text
          className="dim po"
          x="280"
          y="98"
          fontSize="16"
          textAnchor="middle"
          data-t="16.7,0.8"
        >
          Level 2 runs on this clock
        </text>
      )}
      {/* chapter 3: the clock */}
      <path
        className="ln"
        d="M280 160 C377 159 456 238 455 335 C455 432 377 511 280 510 C183 510 104 431 105 335 C106 238 184 160 283 161"
        data-t="17.6,1.6"
      />
      <path
        className="ln"
        d="M280 171 L280 146 M422.9 417.5 L444.5 430 M137.1 417.5 L115.5 430"
        data-t="19.3,0.5"
      />
      <path className="ln dim tick" d={tickPath} data-t="19.9,0.8" />
      <path
        className="ln"
        d="M280 285 C308 285 330 307 330 335 C330 363 308 385 280 385 C252 385 230 363 230 335 C230 307 252 285 283 286"
        data-t="20.8,0.6"
      />
      <text
        className="y"
        x="280"
        y="343"
        fontSize="24"
        textAnchor="middle"
        data-t="21.4,0.6"
      >
        SPRS
      </text>
      <text
        className="dim"
        x="384"
        y="280"
        fontSize="17"
        textAnchor="middle"
        data-t="22.0,0.3"
      >
        year 1
      </text>
      <text
        className="dim"
        x="280"
        y="460"
        fontSize="17"
        textAnchor="middle"
        data-t="22.3,0.3"
      >
        year 2
      </text>
      <text
        className="dim"
        x="176"
        y="280"
        fontSize="17"
        textAnchor="middle"
        data-t="22.6,0.3"
      >
        year 3
      </text>
      {/* chapter 4: certify */}
      <path
        className="ln y"
        d={starPath(280, 160, 17, 7.5)}
        data-t="23.4,0.8"
      />
      <text
        className="y"
        x="280"
        y="128"
        fontSize="21"
        textAnchor="middle"
        data-t="24.3,0.7"
      >
        C3PAO
      </text>
      <path className="ln dim dash" d="M280 184 L280 282" data-t="25.0,0.5" />
      <text
        className="dim"
        x="280"
        y="368"
        fontSize="16"
        textAnchor="middle"
        data-t="25.6,0.5"
      >
        current
      </text>
      {/* chapter 5: every year */}
      <path className="ln y" d="M320 140 L326 147 L337 131" data-t="31.3,0.4" />
      <path className="ln y" d="M449 437 L455 444 L467 428" data-t="36.0,0.4" />
      <path className="ln dim dash" d="M420 416 L328 363" data-t="36.4,0.5" />
      {/* chapter 6: significant change */}
      {!still && (
        <>
          <path
            className="ln y"
            d="M188 590 L212 552 L196 548 L219 505"
            data-t="42.2,0.5"
          />
          <path
            className="ln y dash"
            d={starPath(246, 530, 11, 5)}
            data-t="42.8,0.5"
          />
          <path
            className="ln dim dash"
            d="M225 484 L261 388"
            data-t="43.3,0.4"
          />
          <text x="266" y="532" fontSize="17" data-t="43.7,0.7">
            significant change
          </text>
          <text className="y" x="266" y="557" fontSize="17" data-t="44.4,0.5">
            reassess now
          </text>
        </>
      )}
      {/* chapter 7: repeat */}
      <path className="ln y" d="M94 437 L100 444 L112 428" data-t="46.0,0.4" />
      <path className="ln dim dash" d="M140 416 L232 363" data-t="46.4,0.5" />
      <path
        className="ln y"
        d="M178 170 Q200 140 254 150 M243 141 L256 150 L243 158"
        data-t="53.8,0.6"
      />
      <text className="y" x="52" y="150" fontSize="17" data-t="54.5,0.9">
        3 yrs: recertify
      </text>
    </>
  )
}

/** The notes beside the clock, and the legend written as each mark first appears. */
function Notes() {
  return (
    <>
      {/* chapter 1 */}
      <text x="590" y="122" fontSize="28" data-t="2.5,0.6">
        DoD
      </text>
      <text
        className="dim"
        x="712"
        y="90"
        fontSize="15"
        textAnchor="middle"
        data-t="3.2,1.1"
      >
        shares information
      </text>
      <path
        className="ln y"
        d="M662 114 C690 107,730 119,764 111 M752 104 L766 111 L753 119"
        data-t="4.4,0.9"
      />
      <text x="782" y="122" fontSize="26" data-t="5.4,1.1">
        your company
      </text>
      {/* chapter 2 */}
      <text x="660" y="190" fontSize="24" textAnchor="end" data-t="7.3,0.5">
        FCI
      </text>
      <path
        className="ln y"
        d="M674 183 C686 178,698 188,710 181 M703 176 L712 182 L704 188"
        data-t="7.9,0.4"
      />
      <text className="y" x="724" y="190" fontSize="24" data-t="8.4,0.7">
        Level 1
      </text>
      <text className="dim" x="724" y="214" fontSize="15" data-t="9.2,1.0">
        15 rules · self-assess yearly
      </text>
      <text x="660" y="258" fontSize="24" textAnchor="end" data-t="10.3,0.5">
        CUI
      </text>
      <path
        className="ln y"
        d="M674 251 C686 246,698 256,710 249 M703 244 L712 250 L704 256"
        data-t="10.9,0.4"
      />
      <text className="y" x="724" y="258" fontSize="24" data-t="11.4,0.7">
        Level 2
      </text>
      <text className="dim" x="724" y="285" fontSize="15" data-t="12.2,1.0">
        110 rules · NIST SP 800-171
      </text>
      <text x="660" y="326" fontSize="17" textAnchor="end" data-t="13.3,0.6">
        critical CUI
      </text>
      <path
        className="ln y"
        d="M674 319 C686 314,698 324,710 317 M703 312 L712 318 L704 324"
        data-t="14.0,0.3"
      />
      <text className="y" x="724" y="326" fontSize="24" data-t="14.4,0.5">
        Level 3
      </text>
      <text className="dim" x="724" y="350" fontSize="15" data-t="14.9,0.9">
        Level 2 + 24 more · DIBCAC
      </text>
      {/* chapter 3: Level 2 is the clock */}
      <path
        className="ln y"
        d="M718 251 C716 238,740 233,764 233 C790 233,812 240,812 250 C812 260,790 265,762 265 C740 265,720 261,712 247"
        data-t="15.9,0.7"
      />
      <path
        className="ln y lo"
        d="M716 262 C688 282,600 292,478 312 M492 303 L477 312 L492 321"
        data-t="16.7,0.8"
      />
      {/* the legend, written as each mark first appears */}
      <path
        className="ln y"
        d={starPath(600, 414, 10, 4.5)}
        data-t="27.0,0.4"
      />
      <text x="622" y="421" fontSize="17" data-t="27.5,1.3">
        C3PAO certifies · every 3 yrs
      </text>
      <path className="ln y" d="M592 456 L598 463 L609 448" data-t="37.0,0.4" />
      <text x="622" y="463" fontSize="17" data-t="37.5,1.3">
        self-assess + affirm · every year
      </text>
      <path
        className="ln y"
        d="M605 491 L595 506 L603 507 L594 521"
        data-t="44.9,0.2"
      />
      <text x="622" y="505" fontSize="17" data-t="45.1,0.8">
        big change: reassess now
      </text>
      {/* chapter 8 */}
      <path
        className="ln y"
        d="M590 544 C700 541,820 543,930 545 C933 556,932 572,930 586 C820 588,700 587,590 585 C588 572,589 556,592 543"
        data-t="56.3,0.9"
      />
      <text
        className="y"
        x="760"
        y="572"
        fontSize="20"
        textAnchor="middle"
        data-t="57.3,1.3"
      >
        no current status = no contract
      </text>
    </>
  )
}

interface SixtyBoardProps {
  /** Unique to this board: its title, description and glow filter ids. */
  readonly id: string
  /** The clock above the notes, where the board is narrower than 640px. */
  readonly narrow: boolean
}

/**
 * The whole board, ready for the player to draw: it finds the hand, the
 * sector, the glow, the stick and the empty defs here by their classes.
 */
export function SixtyBoard({ id, narrow }: SixtyBoardProps) {
  return (
    <svg
      className="sixty-board"
      viewBox={narrow ? NARROW_VIEWBOX : WIDE_VIEWBOX}
      data-narrow={narrow ? 'true' : undefined}
      role="img"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-desc`}
    >
      <title id={`${id}-title`}>{sixtyBoardTitle}</title>
      <desc id={`${id}-desc`}>{sixtyDescription}</desc>
      <defs>
        <filter id={`${id}-soft`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      {/* Empty: the player adds the clip paths and masks it builds here. */}
      <defs className="sixty-defs" />
      <g filter="url(#chalk)">
        <text className="y" x="40" y="64" fontSize="38" data-t="0.3,2.0">
          CMMC in sixty seconds
        </text>
      </g>
      <g transform={narrow ? 'translate(-12 0)' : undefined}>
        <path className="sixty-wedge" />
        <circle
          className="sixty-glow"
          cx={CX}
          cy={CY}
          r="56"
          filter={`url(#${id}-soft)`}
        />
        <g filter="url(#chalk)">
          <Dial still={false} />
        </g>
        <g className="sixty-hand" filter="url(#chalk)">
          <path className="ln y hand" d={handPath} />
        </g>
      </g>
      <g transform={narrow ? 'translate(-632 549) scale(1.2)' : undefined}>
        <g filter="url(#chalk)">
          <Notes />
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

/**
 * The still on Home: the finished clock, cropped to the dial, with the
 * hand back at twelve after its three years.
 */
export function SixtyStill() {
  return (
    <svg
      className="sixty-board sixty-still-art"
      viewBox={STILL_VIEWBOX}
      aria-hidden="true"
      focusable="false"
    >
      <g filter="url(#chalk)">
        <Dial still />
      </g>
      <g className="sixty-hand is-still" filter="url(#chalk)">
        <path className="ln y hand" d={handPath} />
      </g>
    </svg>
  )
}
