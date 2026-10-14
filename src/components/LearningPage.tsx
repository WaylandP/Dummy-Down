import { useContext, useEffect } from 'react'
import { setPageMeta } from '../seo/page-meta'
import { explorerCatalog } from '../data/content'
import { lessonIdentity } from '../state/explorer-state'
import { useExplorerState } from '../state/useExplorerState'
import { LocalProgressContext } from '../progress/context'
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
    setPageMeta({
      title,
      description: lesson
        ? `${lesson.id} ${lesson.title}: the official CMMC requirement with Beginner, IT & Cyber and Compliance explanations.`
        : undefined,
      canonicalPath: lesson
        ? `/learn?view=lesson&framework=${lesson.frameworkId}&edition=${lesson.editionId}&control=${lesson.key}`
        : '/learn?view=discover&collection=references',
    })
  }, [title, lesson])
  // Home's "Last time" row; the store writes it only while saving is on.
  const progress = useContext(LocalProgressContext)
  useEffect(() => {
    if (lesson) progress?.rememberControl(lessonIdentity(lesson))
  }, [lesson, progress])
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
