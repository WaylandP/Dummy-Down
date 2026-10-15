/**
 * Matches the quotation whose whole text is `text`: on the Board a requirement
 * sentence is split into clause spans, so an element's own text nodes alone
 * never hold the sentence.
 */
export function quotation(text: string) {
  return (_content: string, element: Element | null) =>
    element?.tagName === 'BLOCKQUOTE' && element.textContent === text
}
