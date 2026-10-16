/**
 * `/?play=sixty` opens Home with "CMMC in sixty seconds" in view and plays
 * it from 0:00: the only time the drawing starts by itself (under reduced
 * motion it shows the finished board instead). The parameter is read here,
 * with the rest of the address, and never leaves the site: analytics
 * record `/` alone (sanitizeUsageUrl strips every query).
 */
export type PlayRequest = 'sixty' | null

export function playRequest(url: URL): PlayRequest {
  return url.searchParams.get('play') === 'sixty' ? 'sixty' : null
}

/** The address that plays the chalk talk, for the Share menu and About. */
export function playUrl(origin: string): string {
  return `${origin}/?play=sixty`
}
