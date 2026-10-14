import { useEffect, useState, type ReactNode } from 'react'
import type { LearningActivity } from '../types/learning'
import { LocalProgressContext } from './context'
import {
  browserProgressPort,
  createLocalProgressStore,
  type ProgressPort,
} from './store'

/** Mount once above the route. Content changes create a fresh provider/store. */
export function LocalProgressProvider({
  children,
  activities,
  port,
}: {
  readonly children: ReactNode
  readonly activities: readonly LearningActivity[]
  readonly port?: ProgressPort
}) {
  const [store] = useState(() =>
    createLocalProgressStore(activities, port ?? browserProgressPort()),
  )
  useEffect(() => store.connect(), [store])
  return (
    <LocalProgressContext.Provider value={store}>
      {children}
    </LocalProgressContext.Provider>
  )
}
