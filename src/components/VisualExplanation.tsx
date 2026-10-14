import { useEffect, useId, useRef, useState } from 'react'
import type { LessonIdentity } from '../types/content'
import type { VisualExplanationContent } from '../types/visual-explanation'
import { findVisualExplanation } from '../data/visual-explanations'
import { TeachingScene } from './TeachingScene'
import './visual-explanation.css'

const stageNames = ['Requirement', 'Plain meaning', 'Example', 'Takeaway']
const motionQuery = '(prefers-reduced-motion: reduce)'

function timeLabel(milliseconds: number) {
  const seconds = Math.floor(milliseconds / 1000)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

function ExplanationPlayer({
  explanation,
}: {
  explanation: VisualExplanationContent
}) {
  const prefix = useId()
  const [elapsedMs, setElapsedMs] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [stillStage, setStillStage] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia?.(motionQuery).matches ?? false,
  )
  const [pauseReason, setPauseReason] = useState('')
  const elapsed = useRef(0)
  const duration = explanation.stages.length * explanation.stageDurationMs
  const stageIndex = Math.min(
    explanation.stages.length - 1,
    Math.floor(elapsedMs / explanation.stageDurationMs),
  )
  const stage = explanation.stages[stageIndex]!
  const stageProgress =
    reducedMotion || stillStage
      ? 1
      : Math.min(
          1,
          (elapsedMs - stageIndex * explanation.stageDurationMs) /
            explanation.stageDurationMs,
        )
  const complete = elapsedMs >= duration

  useEffect(() => {
    const preference = window.matchMedia?.(motionQuery)
    function motionChanged(event: MediaQueryListEvent) {
      setReducedMotion(event.matches)
      if (event.matches) {
        setPlaying(false)
        setPauseReason(
          'Motion is off. Use the four stages to continue at your own pace.',
        )
      } else setPauseReason('Motion is available. Play when you are ready.')
    }
    function visibilityChanged() {
      if (document.hidden && playing) {
        setPlaying(false)
        setPauseReason('Paused while you were away. Play when you are ready.')
      }
    }
    preference?.addEventListener('change', motionChanged)
    document.addEventListener('visibilitychange', visibilityChanged)
    return () => {
      preference?.removeEventListener('change', motionChanged)
      document.removeEventListener('visibilitychange', visibilityChanged)
    }
  }, [playing])

  useEffect(() => {
    if (!playing || reducedMotion) return
    let frame = 0
    let previousTime = performance.now()
    function tick(now: number) {
      if (document.hidden) {
        setPlaying(false)
        setPauseReason('Paused while you were away. Play when you are ready.')
        return
      }
      const next = Math.min(
        duration,
        elapsed.current + Math.max(0, now - previousTime),
      )
      previousTime = now
      elapsed.current = next
      setElapsedMs(next)
      if (next >= duration) setPlaying(false)
      else frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, reducedMotion, duration])

  function seek(milliseconds: number) {
    setPlaying(false)
    setStillStage(true)
    setPauseReason('')
    elapsed.current = milliseconds
    setElapsedMs(milliseconds)
  }

  function playPause() {
    if (reducedMotion) return
    if (playing) {
      setPlaying(false)
      setPauseReason('Paused. Play to continue, or choose another stage.')
    } else {
      if (complete) {
        elapsed.current = 0
        setElapsedMs(0)
      }
      setPauseReason('')
      setStillStage(false)
      setPlaying(true)
    }
  }

  return (
    <section
      className="visual-explanation"
      aria-labelledby={`${prefix}-heading`}
    >
      <div className="visual-explanation-heading">
        <div>
          <p className="instruction-eyebrow">See the idea unfold</p>
          <h4 id={`${prefix}-heading`}>{explanation.title}</h4>
        </div>
        <span className="draft-label">Visual explanation</span>
      </div>
      <p className="visual-player-intro">
        Four stages · {duration / 1000} seconds. Pause whenever you need, or
        choose a stage below.
        {reducedMotion &&
          ' Motion is off for your browser preference; every stage is available as a still diagram.'}
      </p>
      <nav aria-label="Visual explanation stages" className="visual-stage-nav">
        <ol>
          {stageNames.map((name, index) => (
            <li key={name}>
              <button
                type="button"
                aria-current={index === stageIndex ? 'step' : undefined}
                aria-controls={`${prefix}-stage`}
                onClick={() => seek(index * explanation.stageDurationMs)}
              >
                <span aria-hidden="true">0{index + 1}</span> {name}
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <div
        className="visual-player-controls"
        role="group"
        aria-label="Visual explanation playback"
      >
        <button
          className="practice-action"
          type="button"
          onClick={playPause}
          disabled={reducedMotion}
        >
          {playing
            ? 'Pause'
            : complete
              ? 'Replay explanation'
              : 'Play explanation'}
        </button>
        <button
          className="practice-action practice-secondary"
          type="button"
          onClick={() => seek(0)}
        >
          Restart
        </button>
        <span className="visual-time" aria-hidden="true">
          {timeLabel(elapsedMs)} / {timeLabel(duration)}
        </span>
      </div>
      <progress
        className="visual-playback-progress"
        aria-label="Visual explanation progress"
        aria-valuetext={`${timeLabel(elapsedMs)} of ${timeLabel(duration)}`}
        value={Math.floor(elapsedMs / 1000)}
        max={duration / 1000}
      />
      <p
        className="visual-player-status"
        role="status"
        aria-label="Visual explanation status"
      >
        {pauseReason ||
          (complete
            ? 'Walkthrough complete. Revisit any stage or read the transcript.'
            : reducedMotion
              ? 'Still diagrams · Choose a stage to continue.'
              : playing
                ? 'Playing · You can pause at any point.'
                : 'Ready when you are.')}
      </p>
      <div className="visual-stage" id={`${prefix}-stage`}>
        <figure className="visual-teaching-board">
          <TeachingScene
            scene={explanation.scene}
            stage={stageIndex}
            progress={stageProgress}
          />
          <figcaption>
            <details>
              <summary>Diagram in words</summary>
              <p>{stage.diagramDescription}</p>
            </details>
          </figcaption>
        </figure>
        <div className="visual-caption" aria-live="polite" aria-atomic="true">
          <p className="small-label">
            {stageNames[stageIndex]} · {stageIndex + 1} of 4
          </p>
          <h5>{stage.title}</h5>
          {stage.kind === 'requirement' ? (
            <blockquote>{stage.text}</blockquote>
          ) : (
            <p>{stage.text}</p>
          )}
          {stage.kind === 'requirement' && (
            <p className="visual-source-note">
              Assessment-guide quotation · {explanation.sourceLabel}
            </p>
          )}
        </div>
      </div>
      <details className="practice-disclosure visual-transcript">
        <summary>Read the full transcript</summary>
        <ol>
          {explanation.stages.map((item, index) => (
            <li key={item.kind}>
              <h5>
                {stageNames[index]}: {item.title}
              </h5>
              {item.kind === 'requirement' ? (
                <blockquote>{item.text}</blockquote>
              ) : (
                <p>{item.text}</p>
              )}
              <p className="visual-transcript-diagram">
                <strong>Diagram in words:</strong> {item.diagramDescription}
              </p>
            </li>
          ))}
        </ol>
      </details>
      <p className="practice-context">{explanation.disclaimer}</p>
      <p className="practice-source">
        <a
          href={explanation.source.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {explanation.sourceLabel}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </p>
    </section>
  )
}

/** Another edition cannot borrow an animation, and changing identity resets playback. */
export function VisualExplanation({ lesson }: { lesson: LessonIdentity }) {
  const explanation = findVisualExplanation(lesson)
  return explanation ? (
    <ExplanationPlayer key={explanation.id} explanation={explanation} />
  ) : null
}
