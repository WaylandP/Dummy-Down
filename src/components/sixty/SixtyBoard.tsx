import { SmudgeFigure } from '../board/Smudge'
import { ERASE_END, boards, handPath, type Arrangement } from './sixty-drawing'
import { sixtyGlyphs } from './sixty-glyphs'
import {
  DUST_MAX,
  boardModel,
  type Scheduled,
  type StrokeMark,
  type WordMark,
} from './sixty-model'
import { sixtyBoardTitle, sixtyDescription } from './sixty-script'
import { pathOf, type Stroke } from './sixty-strokes'

/**
 * The board: two scenes drawn on the same slate, from the model in
 * sixty-model.ts. Scene 1, Who and Levels, is done by 0:15 and circled;
 * Smudge wipes it off between 0:15.7 and 0:16.9, leaving the faint haze an
 * erased board keeps; scene 2, the Level 2 clock with SPRS at its hub, is
 * drawn from 0:17 in its place. Every word is its glyph outlines (from the
 * hand font, at build time) showing through a mask of pen strokes along
 * each glyph's skeleton; every line is a wobbled path showing through a
 * mask of the same strokes a hand would make. The player (useSixtyPlayer)
 * draws the masks' strokes along their length, rides the chalk stick on
 * the tip, and moves Smudge, the hand, the sector and the glow. The same
 * words and marks take two arrangements, picked by the board's width.
 */

const glyphId = (id: string, char: string) =>
  `${id}-g${char.codePointAt(0)!.toString(16)}`

/** Every character's outline once; the words use them. */
function GlyphDefs({ id }: { readonly id: string }) {
  return (
    <defs>
      {Object.entries(sixtyGlyphs.glyphs).map(([char, glyph]) => (
        <path key={char} id={glyphId(id, char)} d={glyph.path} />
      ))}
    </defs>
  )
}

/** A pen stroke in a mask: white, round, as wide as the ink it reveals. */
function Pen({
  stroke,
  width,
  glyph,
}: {
  readonly stroke: Stroke
  readonly width: number
  readonly glyph?: number
}) {
  return (
    <path
      className="sixty-pen"
      d={pathOf(stroke.points)}
      strokeWidth={width.toFixed(2)}
      data-glyph={glyph}
      data-len={stroke.length.toFixed(2)}
      style={{ strokeDasharray: `${(stroke.length + 2).toFixed(2)}` }}
    />
  )
}

/** The extent of some strokes, with room around it. */
function boxOf(strokes: readonly Stroke[], pad: number) {
  let x1 = Infinity
  let y1 = Infinity
  let x2 = -Infinity
  let y2 = -Infinity
  for (const stroke of strokes)
    for (const [x, y] of stroke.points) {
      x1 = Math.min(x1, x)
      y1 = Math.min(y1, y)
      x2 = Math.max(x2, x)
      y2 = Math.max(y2, y)
    }
  return {
    x: (x1 - pad).toFixed(1),
    y: (y1 - pad).toFixed(1),
    width: (x2 - x1 + pad * 2).toFixed(1),
    height: (y2 - y1 + pad * 2).toFixed(1),
  }
}

/** A word: its glyphs' outlines, showing through the strokes that write them. */
function Word({ item, id }: { readonly item: Scheduled; readonly id: string }) {
  const mark = item.mark as WordMark
  const maskId = `${id}-m${item.index}`
  return (
    <g
      className={`sixty-word${mark.tone ? ` ${mark.tone}` : ''}`}
      data-key={mark.key}
      data-text={mark.text}
      data-size={mark.size}
      data-start={item.start.toFixed(3)}
      data-end={item.end.toFixed(3)}
      data-drawn="done"
    >
      <mask
        id={maskId}
        maskUnits="userSpaceOnUse"
        x={mark.box.x.toFixed(1)}
        y={mark.box.y.toFixed(1)}
        width={mark.box.width.toFixed(1)}
        height={mark.box.height.toFixed(1)}
      >
        {mark.glyphs.map((glyph, g) =>
          glyph.strokes.map((stroke, s) => (
            <Pen
              key={`${g}-${s}`}
              stroke={stroke}
              width={glyph.width}
              glyph={g}
            />
          )),
        )}
      </mask>
      <g mask={`url(#${maskId})`}>
        {mark.glyphs.map((glyph, g) => (
          <use
            key={g}
            className="sixty-glyph"
            href={`#${glyphId(id, glyph.char)}`}
            transform={`translate(${glyph.x.toFixed(2)} ${glyph.y.toFixed(2)}) scale(${glyph.scale.toFixed(5)})`}
            data-char={glyph.char}
          />
        ))}
      </g>
    </g>
  )
}

/** A line: its wobbled strokes, showing through the pen that draws them. */
function Line({ item, id }: { readonly item: Scheduled; readonly id: string }) {
  const mark = item.mark as StrokeMark
  const maskId = `${id}-m${item.index}`
  const box = boxOf(mark.strokes, mark.width + 4)
  return (
    <g
      className="sixty-mark"
      data-key={mark.key}
      data-start={item.start.toFixed(3)}
      data-end={item.end.toFixed(3)}
      data-drawn="done"
    >
      <mask id={maskId} maskUnits="userSpaceOnUse" {...box}>
        {mark.strokes.map((stroke, s) => (
          <Pen key={s} stroke={stroke} width={mark.width + 3} />
        ))}
      </mask>
      <path
        className={mark.className}
        d={mark.d}
        mask={`url(#${maskId})`}
        style={mark.grain ? { strokeDasharray: mark.grain } : undefined}
      />
    </g>
  )
}

function Marks({
  items,
  id,
}: {
  readonly items: readonly Scheduled[]
  readonly id: string
}) {
  return items.map((item) =>
    item.mark.kind === 'word' ? (
      <Word key={item.mark.key} item={item} id={id} />
    ) : (
      <Line key={item.mark.key} item={item} id={id} />
    ),
  )
}

interface SixtyBoardProps {
  /** Unique to this board: its title, description, masks and filter ids. */
  readonly id: string
  readonly arrangement: Arrangement
}

/**
 * The whole board, ready for the player to draw: it finds the marks, the
 * hand, the sector, the glow, the stick, the dust, the bright tip, the
 * erase and clear strokes, the haze and Smudge here by their classes.
 */
export function SixtyBoard({ id, arrangement }: SixtyBoardProps) {
  const g = boards[arrangement]
  const model = boardModel(arrangement)
  const { dial } = g
  const sceneOne = model.marks.filter((item) => item.declared < ERASE_END)
  const sceneTwo = model.marks.filter((item) => item.declared >= ERASE_END)
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
            style={{ strokeDasharray: model.erase.length.toFixed(2) }}
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
            style={{ strokeDasharray: model.clear.length.toFixed(2) }}
          />
        </mask>
        <clipPath id={`${id}-board`}>
          <rect width={g.width} height={g.height} />
        </clipPath>
      </defs>
      <GlyphDefs id={id} />
      <g mask={`url(#${id}-clear)`}>
        <g className="sixty-scene-one" mask={`url(#${id}-erase)`}>
          <g filter="url(#chalk)">
            <Marks items={sceneOne} id={id} />
          </g>
        </g>
        {/* The haze an erased board keeps, where Smudge wiped. */}
        <path
          className="sixty-haze"
          d={g.erase}
          strokeWidth={g.eraseWidth - 24}
          filter={`url(#${id}-haze)`}
          style={{ strokeDasharray: model.erase.length.toFixed(2) }}
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
            <Marks items={sceneTwo} id={id} />
          </g>
          <g className="sixty-hand" filter="url(#chalk)">
            <path className="ln y hand" d={handPath(dial)} />
          </g>
        </g>
      </g>
      <g clipPath={`url(#${id}-board)`}>
        {/* The newest few units of the stroke under the chalk, a touch brighter. */}
        <path className="sixty-fresh" />
        {/* Dust shed while the chalk draws: a pool of specks the frames place. */}
        <g className="sixty-dust" aria-hidden="true">
          {Array.from({ length: DUST_MAX }, (_, index) => (
            <circle key={index} r="0.8" />
          ))}
        </g>
        {/* Smudge, wiping: on the board only while a stroke of his is under
            way, and never past its edges. The clip sits outside the group
            the frames move, so it stays with the board. */}
        <g className="sixty-eraser">
          <g
            className="sixty-eraser-body"
            transform={`translate(${(-85 * eraser).toFixed(1)} ${(-81 * eraser).toFixed(1)}) scale(${eraser})`}
          >
            <SmudgeFigure pose="sweep" wood={`url(#${id}-wood)`} />
          </g>
        </g>
        {/* The chalk stick, a hand's: its tip at the origin, its shadow on
            the board, its body leaning the way it goes and lifting between
            marks. */}
        <g className="sixty-stick" aria-hidden="true">
          <ellipse
            className="sixty-stick-shadow"
            cx="1"
            cy="0.6"
            rx="2.6"
            ry="1.1"
          />
          <g className="sixty-stick-arm" transform="rotate(-38)">
            <g className="sixty-stick-body">
              <rect
                className="sixty-stick-chalk"
                x="-4"
                y="-34"
                width="8"
                height="34"
                rx="2.6"
              />
              <rect
                className="sixty-stick-shade"
                x="-4"
                y="-34"
                width="2.6"
                height="34"
                rx="1.3"
              />
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}
