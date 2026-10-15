import { cmmcSourceDocuments } from '../data/content'

/** The pinned publication, named from its source record: "CMMC v2.13, September 2024". */
export function publicationLabel() {
  const guide = cmmcSourceDocuments.find((document) =>
    document.id.includes('model'),
  )
  if (!guide) return ''
  const [year, month] = guide.published.split('-').map(Number)
  const date = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1))
  const when = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
  return `CMMC v${guide.version}, ${when}`
}
