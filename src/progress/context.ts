import { createContext } from 'react'
import type { LocalProgressStore } from './store'

export const LocalProgressContext = createContext<LocalProgressStore | null>(
  null,
)
