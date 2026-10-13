import { useRef, useState } from 'react'
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  ExternalLink,
  Info,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { controls, frameworks } from '../data/content'
import { filterControls } from '../data/control-search'
import type { ExplanationMode } from '../types/content'
import { LearningModes } from './LearningModes'

interface ControlExplorerProps {
  mode: ExplanationMode
  onModeChange: (mode: ExplanationMode) => void
}

export function ControlExplorer({ mode, onModeChange }: ControlExplorerProps) {
  const searchInput = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [frameworkId, setFrameworkId] = useState('cmmc')
  const [family, setFamily] = useState('')
  const [level, setLevel] = useState('')
  const [selectedId, setSelectedId] = useState(controls[0]?.id)
  const framework = frameworks.find((item) => item.id === frameworkId)
  const frameworkControls = controls.filter(
    (control) => control.frameworkId === frameworkId,
  )
  const results = filterControls(controls, {
    query,
    frameworkId,
    family,
    level,
  })
  const selected =
    results.find((control) => control.id === selectedId) ?? results[0]
  const explanation = selected?.explanations[mode]
  const families = [
    ...new Map(
      frameworkControls.map((control) => [control.family, control.familyName]),
    ).entries(),
  ]
  const levels = [
    ...new Set(
      frameworkControls.flatMap((control) =>
        control.level ? [control.level] : [],
      ),
    ),
  ]

  function resetFilters() {
    setQuery('')
    setFamily('')
    setLevel('')
    searchInput.current?.focus()
  }

  return (
    <section
      id="explorer"
      className="section-shell explorer-section"
      aria-labelledby="explorer-heading"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            <span className="section-number">02 /</span> MAKE IT CLICK
          </p>
          <h2 id="explorer-heading">Meet the Control Explorer.</h2>
          <p>One concept. Three perspectives. Start with a draft example.</p>
        </div>
        <span className="status-badge">
          <span /> Early preview
        </span>
      </div>

      <div className="explorer-shell">
        <div className="explorer-toolbar">
          <label className="search-field">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search controls</span>
            <input
              type="search"
              ref={searchInput}
              placeholder="Search a topic or control ID…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label className="framework-field">
            <span>Framework</span>
            <select
              value={frameworkId}
              onChange={(event) => {
                setFrameworkId(event.target.value)
                setFamily('')
                setLevel('')
              }}
            >
              {frameworks.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.shortName}
                  {item.status === 'planned' ? ' · planned' : ''}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="explorer-body">
          <aside
            className="control-sidebar"
            aria-label="Control results and filters"
          >
            <div className="filter-title">
              <SlidersHorizontal size={15} aria-hidden="true" />
              <span>Refine your view</span>
            </div>
            <label className="filter-field">
              Control family
              <select
                value={family}
                onChange={(event) => setFamily(event.target.value)}
              >
                <option value="">All families</option>
                {families.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="filter-field">
              Level
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value)}
              >
                <option value="">All levels</option>
                {levels.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <div className="result-count" role="status">
              {results.length} {results.length === 1 ? 'example' : 'examples'}{' '}
              found
            </div>
            <div className="control-list">
              {results.map((control) => (
                <button
                  type="button"
                  key={control.id}
                  className={`control-item ${selected?.id === control.id ? 'is-selected' : ''}`}
                  aria-pressed={selected?.id === control.id}
                  onClick={() => setSelectedId(control.id)}
                >
                  <span className="control-code">{control.id}</span>
                  <span className="control-item-title">
                    {control.title}
                    <ChevronRight size={16} aria-hidden="true" />
                  </span>
                  <span className="control-item-meta">
                    {control.familyName} <span>·</span> Draft
                  </span>
                </button>
              ))}
            </div>
            <p className="sidebar-note">
              <Info size={15} aria-hidden="true" /> A small starting point, not
              a complete control catalog.
            </p>
          </aside>

          {selected && explanation ? (
            <article className="control-detail" aria-labelledby="control-title">
              <div className="control-kicker">
                <span>
                  {[framework?.shortName, selected.level, selected.familyName]
                    .filter(Boolean)
                    .join(' / ')}
                </span>
                <span className="draft-tag">Draft educational example</span>
              </div>
              <h3 id="control-title">{selected.title}</h3>
              <p className="control-reference">{selected.id}</p>
              <div className="concept-box">
                <span className="small-label">THE CONCEPT, SIMPLIFIED</span>
                <p>{selected.concept}</p>
                <span>
                  Paraphrase from our README; not the official requirement.
                </span>
              </div>
              <p className="mode-label">Choose your perspective</p>
              <LearningModes
                value={mode}
                onChange={onModeChange}
                idPrefix="control"
              />
              <div
                className="explanation-panel"
                role="tabpanel"
                id="control-panel"
                aria-labelledby={`control-tab-${mode}`}
                tabIndex={0}
              >
                <h4>{explanation.heading}</h4>
                <p>{explanation.summary}</p>
                <div className="example-box">
                  <span className="small-label">
                    {explanation.exampleTitle}
                  </span>
                  <ul>
                    {explanation.examples.map((example) => (
                      <li key={example}>
                        <Check size={16} aria-hidden="true" />
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="takeaway">
                  <Info size={16} aria-hidden="true" />
                  <span>{explanation.takeaway}</span>
                </p>
              </div>
              <details className="source-details">
                <summary>
                  Sources & content context{' '}
                  <ExternalLink size={14} aria-hidden="true" />
                </summary>
                <div className="source-content">
                  <p>{selected.versionContext}</p>
                  <ul>
                    {selected.sources.map((source) => (
                      <li key={source.id}>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {source.title}
                          <ArrowUpRight size={14} aria-hidden="true" />
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                        <span>{source.versionContext}</span>
                      </li>
                    ))}
                  </ul>
                  <p>{selected.disclaimer}</p>
                </div>
              </details>
            </article>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">
                <Search size={30} aria-hidden="true" />
              </span>
              <h3>
                {framework?.status === 'planned'
                  ? `${framework.shortName} is on the roadmap.`
                  : 'No matching examples yet.'}
              </h3>
              <p>
                {framework?.status === 'planned'
                  ? 'This framework has no published content here yet. Try our CMMC draft to explore the learning experience.'
                  : 'Try “access”, “authorized”, or “AC.L2-3.1.1”. This preview contains one draft example.'}
              </p>
              <button
                className="button button-dark"
                type="button"
                onClick={() => {
                  resetFilters()
                  setFrameworkId('cmmc')
                }}
              >
                {framework?.status === 'planned'
                  ? 'Explore the CMMC example'
                  : 'Clear filters'}
              </button>
            </div>
          )}
        </div>
      </div>
      <p className="explorer-disclaimer">
        <Info size={14} aria-hidden="true" /> Learning material, not a
        compliance checklist. Always consult the applicable official
        requirements and assessment guidance.
      </p>
    </section>
  )
}
