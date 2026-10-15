const words = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
  'twenty',
] as const

/** A small count as a word ("fifteen"), so copy that names a count follows the data. */
export function numberWord(count: number): string {
  return words[count] ?? String(count)
}

/** The word at the start of a sentence. */
export function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase('en-US') + text.slice(1)
}
