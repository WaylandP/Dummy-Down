import { useId } from 'react'
import type { VisualScene } from '../types/visual-explanation'

interface SceneProps {
  readonly scene: VisualScene
  readonly stage: number
  readonly progress: number
}

function Stroke({ d, progress }: { d: string; progress: number }) {
  const arrowId = useId()
  return (
    <>
      <defs>
        <marker
          id={arrowId}
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="4"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path className="visual-arrow" d="m1 1 5 3-5 3" />
        </marker>
      </defs>
      <path className="visual-path-base" d={d} />
      <path
        className="visual-path-traced"
        d={d}
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={1 - Math.min(1, Math.max(0, progress))}
        markerEnd={progress >= 1 ? `url(#${arrowId})` : undefined}
      />
    </>
  )
}

function AccessGate({ stage, progress }: Omit<SceneProps, 'scene'>) {
  const rows = [64, 150, 236]
  return (
    <>
      {rows.map((y, index) => {
        const blocked = stage === 2 && index === 2
        const end = blocked ? 170 : 286
        const portion = stage === 0 ? 0 : Math.min(1, progress * 2)
        return (
          <g key={y}>
            <rect x="8" y={y - 22} width="112" height="44" rx="4" />
            <text x="64" y={y + 7} textAnchor="middle">
              {['User', 'Process', 'Device'][index]}
            </text>
            <Stroke d={`M120 ${y}H${end}`} progress={portion} />
            {stage >= 2 && (
              <circle
                className="visual-signal"
                cx={120 + (end - 120) * Math.min(1, progress * 1.5)}
                cy={y}
                r="6"
              />
            )}
            {blocked && (
              <g className="visual-stop">
                <path d={`M177 ${y - 9}l18 18m0 -18l-18 18`} />
                <text x="182" y={y + 36} textAnchor="middle">
                  Stop
                </text>
              </g>
            )}
          </g>
        )
      })}
      {stage >= 1 && (
        <>
          <path
            className="visual-boundary"
            d="M204 30Q201 88 205 150T204 266"
          />
          <text
            className="visual-annotation"
            x="204"
            y="298"
            textAnchor="middle"
          >
            Access decision
          </text>
        </>
      )}
      <rect x="286" y="34" width="64" height="232" rx="4" />
      <text x="318" y="150" textAnchor="middle" transform="rotate(-90 318 150)">
        System
      </text>
    </>
  )
}

function FactorProof({ stage, progress }: Omit<SceneProps, 'scene'>) {
  if (stage < 2)
    return (
      <>
        <rect x="12" y="30" width="152" height="82" rx="4" />
        <rect x="196" y="30" width="152" height="82" rx="4" />
        <text x="88" y="63" textAnchor="middle">
          Password
        </text>
        <text className="visual-small" x="88" y="93" textAnchor="middle">
          Know
        </text>
        <text x="272" y="63" textAnchor="middle">
          {stage === 0 ? 'PIN' : 'Key'}
        </text>
        <text className="visual-small" x="272" y="93" textAnchor="middle">
          {stage === 0 ? 'Know' : 'Have'}
        </text>
        <Stroke d="M88 112V164H180V196" progress={Math.min(1, progress * 2)} />
        <Stroke
          d="M272 112V164H180"
          progress={Math.max(0, progress * 2 - 0.5)}
        />
        <rect x="94" y="196" width="172" height="70" rx="4" />
        <text x="180" y="238" textAnchor="middle">
          {stage === 0 ? 'One kind' : 'Two kinds'}
        </text>
        <text className="visual-annotation" x="180" y="300" textAnchor="middle">
          {stage === 0
            ? 'Two secrets ≠ two factors'
            : 'Illustrative factor choices'}
        </text>
      </>
    )
  return (
    <>
      <text x="180" y="30" textAnchor="middle">
        Check the named paths
      </text>
      {[86, 158, 230].map((y, index) => (
        <g key={y}>
          <text className="visual-small" x="12" y={y - 18}>
            {
              [
                'Privileged · local',
                'Privileged · network',
                'Ordinary · network',
              ][index]
            }
          </text>
          <Stroke
            d={`M12 ${y}H264`}
            progress={Math.min(1, Math.max(0, progress * 3 - index))}
          />
          <rect x="270" y={y - 25} width="78" height="50" rx="4" />
          <text x="309" y={y + 8} textAnchor="middle">
            MFA
          </text>
        </g>
      ))}
      <text className="visual-small" x="180" y="280" textAnchor="middle">
        <tspan x="180">Privileged includes more</tspan>
        <tspan x="180" dy="26">
          than admin accounts
        </tspan>
      </text>
    </>
  )
}

function ResponseTeam({ stage, progress }: Omit<SceneProps, 'scene'>) {
  if (stage === 3)
    return (
      <>
        <text className="visual-annotation" x="180" y="40" textAnchor="middle">
          Deployed ≠ resolved
        </text>
        <text className="visual-small" x="12" y="96">
          Deployment window
        </text>
        <text className="visual-small" x="340" y="158" textAnchor="end">
          Deploy ≤ 24h
        </text>
        <Stroke d="M20 128H300" progress={Math.min(1, progress * 2)} />
        <path d="M20 116v24m280-24v24" />
        <text className="visual-small" x="20" y="200">
          Investigation and recovery
        </text>
        <Stroke d="M20 228H340" progress={progress} />
        <path d="m328 218 12 10-12 10" />
        <text className="visual-small" x="180" y="286" textAnchor="middle">
          May continue after deployment
        </text>
      </>
    )
  return (
    <>
      <rect x="92" y="12" width="176" height="54" rx="4" />
      <text x="180" y="47" textAnchor="middle">
        {stage === 0 ? 'Response team' : 'Activate team'}
      </text>
      {stage === 0 ? (
        <>
          <Stroke d="M180 66V168" progress={progress} />
          <rect x="62" y="168" width="236" height="74" rx="4" />
          <text x="180" y="213" textAnchor="middle">
            Deploy within 24h
          </text>
        </>
      ) : stage === 1 ? (
        <>
          {[116, 188, 260].map((y, index) => (
            <g key={y}>
              <Stroke
                d={`M180 66V82H40V${y}H94`}
                progress={Math.min(1, Math.max(0, progress * 3 - index))}
              />
              <rect x="94" y={y - 23} width="236" height="46" rx="4" />
              <text x="212" y={y + 8} textAnchor="middle">
                {['People', 'Access', 'Equipment'][index]}
              </text>
            </g>
          ))}
        </>
      ) : (
        <>
          <Stroke d="M180 66V116H86V178" progress={Math.min(1, progress * 2)} />
          <Stroke
            d="M180 116H274V178"
            progress={Math.max(0, progress * 2 - 0.5)}
          />
          <rect x="12" y="178" width="148" height="58" rx="4" />
          <rect x="200" y="178" width="148" height="58" rx="4" />
          <text x="86" y="216" textAnchor="middle">
            Remote
          </text>
          <text x="274" y="216" textAnchor="middle">
            On site
          </text>
          <text className="visual-small" x="180" y="286" textAnchor="middle">
            Match the environment
          </text>
        </>
      )}
    </>
  )
}

/** Captions/transcript carry the full meaning; SVG adds a visual teaching path. */
export function TeachingScene({ scene, stage, progress }: SceneProps) {
  return (
    <svg
      className="teaching-scene"
      viewBox="0 0 360 320"
      aria-hidden="true"
      focusable="false"
    >
      {scene === 'access-gate' && (
        <AccessGate stage={stage} progress={progress} />
      )}
      {scene === 'factor-proof' && (
        <FactorProof stage={stage} progress={progress} />
      )}
      {scene === 'response-team' && (
        <ResponseTeam stage={stage} progress={progress} />
      )}
    </svg>
  )
}
