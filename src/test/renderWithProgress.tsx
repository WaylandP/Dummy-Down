import { render, type RenderOptions } from '@testing-library/react'
import type { ReactNode } from 'react'
import { learningActivities } from '../data/learning'
import { LocalProgressProvider } from '../progress/LocalProgressProvider'

export function renderWithProgress(ui: ReactNode, options?: RenderOptions) {
  return render(ui, {
    wrapper: ({ children }) => (
      <LocalProgressProvider activities={learningActivities}>
        {children}
      </LocalProgressProvider>
    ),
    ...options,
  })
}
