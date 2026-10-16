import { useContext, useEffect, useRef } from 'react'
import { setPageMeta } from '../seo/page-meta'
import { explorerCatalog } from '../data/content'
import { lessonIdentity, lessonIdentityKey } from '../state/explorer-state'
import { useExplorerState } from '../state/useExplorerState'
import { LocalProgressContext } from '../progress/context'
import { setLiftedChalk, setTrayControl } from './board/tray-state'
import { chalks } from './board/chalks'
import { keyIsFree, keyOf } from './board/keys'
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
      ? 'Unavailable control'
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
  const tab =
    controller.parsed.kind === 'ready'
      ? (controller.parsed.state.tab ?? 'decode')
      : 'decode'
  const onBoard = lesson?.contentKind === 'official-reference'
  // The tray lifts the chalk in hand while an explanation is on the board.
  useEffect(() => {
    setLiftedChalk(onBoard && tab === 'explain' ? mode : null)
    return () => setLiftedChalk(null)
  }, [onBoard, tab, mode])
  // The tray's chalks and the keys act on the control on the board.
  const { dispatch, results } = controller
  const withLesson = onBoard && Boolean(lesson)
  useEffect(() => {
    if (!withLesson) {
      setTrayControl(null)
      return
    }
    setTrayControl({
      pick: (next) => dispatch({ type: 'pick-chalk', mode: next }),
    })
    return () => setTrayControl(null)
  }, [withLesson, dispatch])
  const focusTitle = useRef(false)
  useEffect(() => {
    if (!focusTitle.current) return
    focusTitle.current = false
    const title = document.getElementById('control-title')
    if (!title) return
    // The heading is one node for every control; leaving it first makes the move audible.
    if (document.activeElement === title) title.blur()
    title.focus()
  }, [lesson])
  // The keys read the latest lesson and results without re-listening every render.
  const latest = useRef({ lesson, results })
  useEffect(() => {
    latest.current = { lesson, results }
  })
  useEffect(() => {
    if (!onBoard) return
    const onKey = (event: KeyboardEvent) => {
      if (!keyIsFree(event)) return
      const { lesson, results } = latest.current
      if (!lesson) return
      const key = keyOf(event)
      const chalk = chalks[Number(key) - 1]
      if (['1', '2', '3'].includes(key) && chalk) {
        event.preventDefault()
        dispatch({ type: 'pick-chalk', mode: chalk.mode })
        return
      }
      if (key !== 'j' && key !== 'k') return
      const current = lessonIdentityKey(lessonIdentity(lesson))
      const index = results.findIndex(
        (item) => lessonIdentityKey(lessonIdentity(item)) === current,
      )
      const neighbour = results[index + (key === 'j' ? 1 : -1)]
      if (index < 0 || !neighbour) return
      event.preventDefault()
      focusTitle.current = true
      dispatch({ type: 'select-lesson', identity: lessonIdentity(neighbour) })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onBoard, dispatch])
  useControlView(
    controller.resolution?.kind === 'lesson'
      ? controller.resolution.control
      : null,
    mode,
  )
  return <ControlExplorer controller={controller} />
}
