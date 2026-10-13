import { useRef } from 'react'
import { trackUsage } from './usage'

/** Measure an edited search once; query text stays only in this local ref. */
export function useSearchUsage(scope: 'explorer' | 'glossary') {
  const pending = useRef<string | null>(null)
  const measured = useRef('')
  return {
    edited(query: string) {
      pending.current = query
    },
    report(query: string, resultCount: number) {
      if (pending.current !== query) return
      pending.current = null
      if (measured.current === query) return
      measured.current = query
      trackUsage({
        name: 'search_used',
        scope,
        active: query.trim().length > 0,
        resultCount,
      })
    },
  }
}
