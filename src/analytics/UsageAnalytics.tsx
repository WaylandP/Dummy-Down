import { useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import {
  beforeUsageSend,
  sanitizeUsageUrl,
  useUsagePreference,
} from './privacy'

export function UsageAnalytics() {
  const { enabled } = useUsagePreference()
  const [started, setStarted] = useState(enabled)
  // Preserve the SDK instance after an opt-out: remounting submits another view.
  // The dynamic beforeSend gate still rejects every paused event.
  if (enabled && !started) setStarted(true)
  if (!enabled && !started) return null
  const safeUrl = sanitizeUsageUrl(window.location.href, window.location.origin)
  const path = safeUrl ? new URL(safeUrl).pathname : '/'
  return (
    <Analytics
      mode="production"
      debug={false}
      beforeSend={beforeUsageSend}
      route={path}
      path={path}
    />
  )
}
