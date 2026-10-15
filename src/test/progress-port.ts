import type { ProgressPort } from '../progress/store'

/** An in-memory ProgressPort holding only what a test puts in it. */
export function memoryProgressPort(
  initial: Record<string, string> = {},
): ProgressPort & { readonly shared: Map<string, string> } {
  const shared = new Map(Object.entries(initial))
  return {
    shared,
    get: (key) => shared.get(key) ?? null,
    set: (key, value) => void shared.set(key, value),
    remove: (key) => void shared.delete(key),
    privacyBlocked: () => false,
    listen: () => () => {},
  }
}
