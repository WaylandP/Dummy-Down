import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CatalogControl } from '../types/content'
import { lessonIdentity, lessonIdentityKey } from '../state/explorer-state'

interface ControlResultsProps {
  results: readonly CatalogControl[]
  selectedKey: string | null
  onSelect: (control: CatalogControl) => void
}

const pageSize = 8

/** Keep a growing reference catalog readable without making the sidebar endless. */
export function ControlResults({
  results,
  selectedKey,
  onSelect,
}: ControlResultsProps) {
  const [navigation, setNavigation] = useState(() => {
    const selectedIndex = results.findIndex(
      (control) => lessonIdentityKey(lessonIdentity(control)) === selectedKey,
    )
    return {
      page: Math.floor(Math.max(selectedIndex, 0) / pageSize),
      selectedKey,
    }
  })
  if (selectedKey !== navigation.selectedKey) {
    const index = results.findIndex(
      (control) => lessonIdentityKey(lessonIdentity(control)) === selectedKey,
    )
    setNavigation({
      selectedKey,
      page: index >= 0 ? Math.floor(index / pageSize) : navigation.page,
    })
  }
  const pageCount = Math.ceil(results.length / pageSize)
  const currentPage = Math.min(navigation.page, Math.max(pageCount - 1, 0))
  const start = currentPage * pageSize
  const visibleResults = results.slice(start, start + pageSize)

  return (
    <>
      <div className="control-list">
        {visibleResults.map((control) => {
          const key = lessonIdentityKey(lessonIdentity(control))
          return (
            <button
              type="button"
              key={key}
              className={`control-item ${selectedKey === key ? 'is-selected' : ''}`}
              aria-pressed={selectedKey === key}
              onClick={() => onSelect(control)}
            >
              <span className="control-code">{control.id}</span>
              <span className="control-item-title">
                {control.title}
                <ChevronRight size={16} aria-hidden="true" />
              </span>
              <span className="control-item-meta">
                {control.familyName} <span>·</span>{' '}
                {control.contentKind === 'educational-example'
                  ? 'Draft example'
                  : 'Source reference'}
              </span>
            </button>
          )
        })}
      </div>
      {pageCount > 1 && (
        <nav className="results-pagination" aria-label="Control result pages">
          <div
            className="result-page-count"
            role="status"
            aria-label="Control result page"
          >
            {start + 1}–{Math.min(start + pageSize, results.length)} of{' '}
            {results.length} · Page {currentPage + 1} of {pageCount}
          </div>
          <div className="result-page-actions">
            <button
              type="button"
              className="inline-action"
              disabled={currentPage === 0}
              onClick={() =>
                setNavigation({ selectedKey, page: currentPage - 1 })
              }
            >
              <ChevronLeft size={14} aria-hidden="true" /> Previous results
            </button>
            <button
              type="button"
              className="inline-action"
              disabled={currentPage >= pageCount - 1}
              onClick={() =>
                setNavigation({ selectedKey, page: currentPage + 1 })
              }
            >
              Next results <ChevronRight size={14} aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </>
  )
}
