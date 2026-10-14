import { useEffect } from 'react'
import { explorerCatalog } from '../data/content'
import { useExplorerState } from '../state/useExplorerState'
import { useControlView } from '../analytics/useControlView'
import { ControlExplorer } from './ControlExplorer'

export default function LearningPage() {
  const controller = useExplorerState(explorerCatalog)
  const lesson =
    controller.resolution?.kind === 'lesson'
      ? controller.resolution.control
      : null
  const title = lesson
    ? `${lesson.id}: ${lesson.title}`
    : controller.parsed.kind === 'invalid' ||
        controller.resolution?.kind === 'not-found'
      ? 'Unavailable lesson'
      : 'Control Explorer'
  useEffect(() => {
    document.title = `${title} | Cipher & Chalk`
  }, [title])
  const mode =
    controller.parsed.kind === 'ready'
      ? controller.parsed.state.mode
      : 'beginner'
  useControlView(
    controller.resolution?.kind === 'lesson'
      ? controller.resolution.control
      : null,
    mode,
  )
  return (
    <>
      <h1 className="sr-only">Learning workspace</h1>
      <ControlExplorer controller={controller} />
    </>
  )
}
