import { useSyncExternalStore } from 'react'

const query = '(min-width: 1024px)'

function subscribe(listener: () => void) {
  const media = window.matchMedia?.(query)
  if (!media) return () => {}
  media.addEventListener('change', listener)
  return () => media.removeEventListener('change', listener)
}

/** Whether the rail has a column of its own (desktop) or opens as a sheet. */
export function useDesktop(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia?.(query).matches ?? true,
    () => true,
  )
}
