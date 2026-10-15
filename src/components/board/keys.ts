/** The Board's keys (THE_BOARD.md, rule 6), and when a key press is not for us. */
export const boardKeys = [
  { keys: ['j'], does: 'Next control' },
  { keys: ['k'], does: 'Previous control' },
  { keys: ['1', '2', '3'], does: 'Pick a chalk: white, yellow, blue' },
  { keys: ['/'], does: 'Find a control' },
  { keys: ['d'], does: 'Pick up or put down the doodle chalk' },
  { keys: ['?'], does: 'Show these keys' },
  { keys: ['Esc'], does: 'Close' },
] as const

/** The key as the Board reads it: letters lowercase unless Shift is held, so Caps Lock keeps j and k. */
export function keyOf(event: KeyboardEvent): string {
  return event.shiftKey ? event.key : event.key.toLowerCase()
}

/**
 * Typing, held keys, modifiers and an open dialog keep the single-letter keys
 * for themselves.
 */
export function keyIsFree(event: KeyboardEvent): boolean {
  if (event.defaultPrevented || event.repeat || event.isComposing) return false
  if (event.altKey || event.ctrlKey || event.metaKey) return false
  if (
    document.querySelector('dialog[open], [role="dialog"][aria-modal="true"]')
  )
    return false
  const target = event.target
  if (!(target instanceof Element)) return true
  if (target.closest('input, textarea, select, [contenteditable]')) return false
  return true
}

/** The header opens its find line on this event; Home focuses its own line. */
export const FIND_EVENT = 'cipher-and-chalk:find'
