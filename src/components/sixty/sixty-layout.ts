/**
 * Where everything sits on the board, in each arrangement's units, and when
 * each mark is written. The marks are listed in writing order; the
 * scheduler (sixty-model.ts) lays them out within their chapters, keeping
 * the ones the clock's hand and pulses depend on where they are.
 */
import type { Arrangement } from './sixty-drawing'

export interface Label {
  readonly x: number
  readonly y: number
  readonly size: number
  readonly anchor?: 'middle' | 'end'
}

export interface Star {
  readonly x: number
  readonly y: number
  readonly outer: number
  readonly inner: number
}

export interface Layout {
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

/** A mark's declared time: when it is written, and for how long, in the mockup's timing. */
export interface Timing {
  readonly start: number
  readonly seconds: number
  /** The clock's hand or a pulse depends on it: the scheduler leaves its start alone. */
  readonly anchor?: true
}

const t = (start: number, seconds: number, anchor?: true): Timing =>
  anchor ? { start, seconds, anchor } : { start, seconds }

/** When each mark is drawn, and for how long: the same in both arrangements. */
export const at = {
  dod: t(2.5, 0.6),
  shares: t(3.2, 1.1),
  arrow1: t(4.4, 0.9),
  company: t(5.4, 1.1),
  fci: t(7.3, 0.5),
  arrowFci: t(7.9, 0.4),
  level1: t(8.4, 0.7),
  rule1: t(9.2, 1.0),
  cui: t(10.3, 0.5),
  arrowCui: t(10.9, 0.4),
  level2: t(11.4, 0.7),
  rule2: t(12.2, 1.0),
  critical: t(13.2, 0.5),
  arrowCritical: t(13.8, 0.3),
  level3: t(14.1, 0.4),
  rule3: t(14.3, 0.7),
  circle: t(15.0, 0.6, true),
  runs: t(17.0, 0.6),
  dial: t(17.6, 1.6),
  marks: t(19.3, 0.5),
  ticks: t(19.9, 0.8),
  hub: t(20.8, 0.6),
  sprs: t(21.4, 0.6),
  year1: t(22.0, 0.3),
  year2: t(22.3, 0.3),
  year3: t(22.6, 0.3),
  star: t(23.4, 0.8),
  c3pao: t(24.3, 0.7),
  certLine: t(25.0, 0.5, true),
  current: t(25.6, 0.5),
  check1: t(31.3, 0.4),
  affirm: t(31.8, 1.0),
  check2: t(36.0, 0.4, true),
  result2: t(36.4, 0.5, true),
  bolt: t(42.2, 0.5, true),
  burst: t(42.8, 0.5, true),
  result3: t(43.3, 0.4, true),
  change: t(43.7, 0.7),
  reassess: t(44.4, 0.5),
  check3: t(46.0, 0.4, true),
  result4: t(46.4, 0.5, true),
  recertArrow: t(53.8, 0.6),
  recert: t(54.5, 0.9),
  box: t(56.3, 0.9),
  bottom: t(57.3, 1.3),
} as const

export type MarkKey = keyof typeof at

/**
 * 520×235: scene 1 across the board; then the clock on the left, its words
 * on the right. No word under 14.5 units. An arrow is its shaft, then two
 * short strokes from the tip.
 */
const wide: Layout = {
  dod: { x: 100, y: 56, size: 24 },
  shares: { x: 213, y: 36, size: 14.5, anchor: 'middle' },
  arrow1: 'M158 52 C190 45 232 56 268 50 M269 50 L256 44 M269 50 L257 57',
  company: { x: 280, y: 56, size: 22 },
  fci: { x: 232, y: 104, size: 20, anchor: 'end' },
  arrowFci: 'M240 98 C252 93 264 103 276 96 M278 97 L269 91 M278 97 L270 103',
  level1: { x: 286, y: 104, size: 20 },
  rule1: { x: 286, y: 123, size: 14.5 },
  cui: { x: 232, y: 152, size: 20, anchor: 'end' },
  arrowCui:
    'M240 146 C252 141 264 151 276 144 M278 145 L269 139 M278 145 L270 151',
  level2: { x: 286, y: 152, size: 20 },
  rule2: { x: 286, y: 171, size: 14.5 },
  critical: { x: 232, y: 200, size: 15.5, anchor: 'end' },
  arrowCritical:
    'M240 194 C252 189 264 199 276 192 M278 193 L269 187 M278 193 L270 199',
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
  recertArrow: 'M60 56 Q84 44 112 54 M113 54 L102 47 M113 54 L103 61',
  recert: { x: 2, y: 40, size: 14.5 },
  box: 'M250 196 C340 194 430 195 516 197 C518 206 517 220 516 230 C430 232 340 231 250 230 C248 220 249 206 251 195',
  bottom: { x: 383, y: 219, size: 15.5, anchor: 'middle' },
}

/** 300×366: scene 1 stacked; then the clock above the bottom line. No word under 12 units. */
const narrow: Layout = {
  dod: { x: 10, y: 40, size: 22 },
  shares: { x: 89, y: 20, size: 12.5, anchor: 'middle' },
  arrow1: 'M60 36 C78 31 98 38 118 34 M119 35 L108 29 M119 35 L109 41',
  company: { x: 128, y: 40, size: 20 },
  fci: { x: 78, y: 88, size: 18, anchor: 'end' },
  arrowFci: 'M86 83 C96 79 106 87 116 81 M117 82 L109 76 M117 82 L110 88',
  level1: { x: 124, y: 88, size: 18 },
  rule1: { x: 124, y: 106, size: 12 },
  cui: { x: 78, y: 136, size: 18, anchor: 'end' },
  arrowCui:
    'M86 131 C96 127 106 135 116 129 M117 130 L109 124 M117 130 L110 136',
  level2: { x: 124, y: 136, size: 18 },
  rule2: { x: 124, y: 154, size: 12 },
  critical: { x: 78, y: 184, size: 13, anchor: 'end' },
  arrowCritical:
    'M86 179 C96 175 106 183 116 177 M117 178 L109 172 M117 178 L110 184',
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
  recertArrow: 'M56 68 Q92 52 140 72 M141 72 L129 65 M141 72 L130 79',
  recert: { x: 4, y: 52, size: 12 },
  box: 'M20 326 C70 324 230 325 280 327 C282 336 281 350 280 360 C230 362 70 361 20 360 C18 350 19 336 21 325',
  bottom: { x: 150, y: 349, size: 13, anchor: 'middle' },
}

export const layouts: Record<Arrangement, Layout> = { wide, narrow }
