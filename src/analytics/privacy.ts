import { useSyncExternalStore } from 'react'
import type { BeforeSend, BeforeSendEvent } from '@vercel/analytics/react'

const preferenceKey = 'dummy-down:usage-preference'
const preferenceEvent = 'dummy-down:usage-preference-change'
let storageFailure = false

export type UsageStatus =
  | 'active'
  | 'opted-out'
  | 'browser-preference'
  | 'unavailable'
  | 'development'
  | 'preview'
  | 'disabled'

interface DeploymentEnvironment {
  readonly PROD: boolean
  readonly VITE_USAGE_DEPLOYMENT?: string
}

/** A Vite production build can also be a preview; both checks are required. */
export function isUsageDeploymentEnabled(environment: DeploymentEnvironment) {
  return environment.PROD && environment.VITE_USAGE_DEPLOYMENT === 'production'
}

function browserDeclinesUsage() {
  const browser = navigator as Navigator & { globalPrivacyControl?: boolean }
  return (
    browser.doNotTrack === '1' ||
    browser.doNotTrack === 'yes' ||
    browser.globalPrivacyControl === true
  )
}

function readPreference(): 'on' | 'off' {
  if (typeof window === 'undefined' || storageFailure) return 'off'
  try {
    const value = window.localStorage.getItem(preferenceKey)
    return value === null || value === 'on' ? 'on' : 'off'
  } catch {
    return 'off'
  }
}

export function getUsageStatus(): UsageStatus {
  if (!import.meta.env.PROD) return 'development'
  if (import.meta.env.VITE_USAGE_DEPLOYMENT === 'preview') return 'preview'
  if (!isUsageDeploymentEnabled(import.meta.env)) return 'disabled'
  if (typeof window === 'undefined') return 'unavailable'
  if (browserDeclinesUsage()) return 'browser-preference'
  if (storageFailure) return 'unavailable'
  try {
    const value = window.localStorage.getItem(preferenceKey)
    return value === null || value === 'on' ? 'active' : 'opted-out'
  } catch {
    return 'unavailable'
  }
}

/** This preference is the only persistent application usage value. */
export function setUsagePreference(enabled: boolean) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(preferenceKey, enabled ? 'on' : 'off')
    storageFailure = false
  } catch {
    // An opt-out must still take effect if browser storage is unavailable.
    storageFailure = true
  }
  window.dispatchEvent(new Event(preferenceEvent))
}

function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === preferenceKey || event.key === null) listener()
  }
  window.addEventListener(preferenceEvent, listener)
  window.addEventListener('storage', onStorage)
  window.addEventListener('focus', listener)
  return () => {
    window.removeEventListener(preferenceEvent, listener)
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('focus', listener)
  }
}

export function useUsagePreference() {
  const status = useSyncExternalStore(
    subscribe,
    getUsageStatus,
    () => 'disabled',
  )
  const preference = useSyncExternalStore(
    subscribe,
    readPreference,
    () => 'off',
  )
  return {
    status,
    enabled: status === 'active',
    preferenceEnabled: preference === 'on',
    setEnabled: setUsagePreference,
  }
}

/** Only public page names may leave the app; never retain queries or fragments. */
export function sanitizeUsageUrl(value: string, origin: string): string | null {
  try {
    const url = new URL(value, origin)
    const path = url.pathname.replace(/\/$/, '') || '/'
    if (
      url.origin !== origin ||
      ![
        '/',
        '/learn',
        '/glossary',
        '/about',
        '/coverage',
        '/practice',
      ].includes(path)
    )
      return null
    return `${origin}${path}`
  } catch {
    return null
  }
}

/** Recheck the current preference for every SDK pageview and custom event. */
export const beforeUsageSend: BeforeSend = (
  event: BeforeSendEvent,
): BeforeSendEvent | null => {
  if (getUsageStatus() !== 'active') return null
  const url = sanitizeUsageUrl(event.url, window.location.origin)
  return url ? { ...event, url } : null
}
