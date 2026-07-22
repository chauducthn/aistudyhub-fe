import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Search, X } from 'lucide-react'
import ExtractionStatusBadge from '../documents/ExtractionStatusBadge'
import { extractionStatusMeta, isChatReady } from '../../utils/extractionStatus'

function primaryDocumentName(document) {
  return document.fileName || document.originalFilename || document.title || `Document #${document.id}`
}

export default function DocumentContextSelect({
  documents,
  documentId,
  onDocumentIdChange,
  searchingPublicDocuments = false,
  publicDocumentSearchError = '',
  onSearchPublicDocuments,
  currentUserId,
}) {
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('mine')
  const [pickerOpen, setPickerOpen] = useState(false)
  const selectedDoc = documents.find((d) => String(d.id) === String(documentId))
  const selectedMeta = selectedDoc ? extractionStatusMeta(selectedDoc.extractionStatus) : null
  const sourceDocuments = useMemo(
    () => documents.filter((document) => sourceFilter === 'public'
      ? document.source === 'public'
      : document.source !== 'public'),
    [documents, sourceFilter],
  )
  const subjects = useMemo(
    () => [...new Set(sourceDocuments.map((document) => document.subjectName).filter(Boolean))]
      .sort((left, right) => left.localeCompare(right, undefined, { sensitivity: 'base' })),
    [sourceDocuments],
  )
  const filteredDocuments = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase()
    if (sourceFilter === 'public' && keyword.length < 2) return []
    return sourceDocuments.filter((document) => {
      const matchesSubject = subjectFilter === 'all'
        || (subjectFilter === 'uncategorized' && !document.subjectName)
        || document.subjectName === subjectFilter
      const searchableText = [
        document.fileName,
        document.originalFilename,
        document.title,
        document.subjectName,
      ].filter(Boolean).join(' ').toLocaleLowerCase()
      const matchesSearch = !keyword || searchableText.includes(keyword)
      return matchesSubject && matchesSearch
    })
  }, [search, sourceDocuments, sourceFilter, subjectFilter])
  const filtersActive = Boolean(search || subjectFilter !== 'all' || sourceFilter !== 'mine')

  useEffect(() => {
    if (sourceFilter !== 'public') return undefined
    const keyword = search.trim()
    if (keyword.length < 2) {
      onSearchPublicDocuments?.('')
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      onSearchPublicDocuments?.(keyword)
    }, 350)
    return () => window.clearTimeout(timeoutId)
  }, [onSearchPublicDocuments, search, sourceFilter])

  const clearFilters = () => {
    setSearch('')
    setSubjectFilter('all')
    setSourceFilter('mine')
    setPickerOpen(false)
  }

  const selectDocument = (id) => {
    onDocumentIdChange(String(id))
    setSearch('')
    setPickerOpen(false)
  }

  return (
    <div className="mb-2.5 space-y-1.5 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex shrink-0 items-center gap-1.5 font-bold text-[#74798a]">
          <FileText className="h-3.5 w-3.5" />
          Context:
        </span>
        <select
          value={sourceFilter}
          onChange={(event) => {
            setSourceFilter(event.target.value)
            setSearch('')
            setSubjectFilter('all')
            setPickerOpen(true)
          }}
          aria-label="Filter by source"
          className="rounded-lg border border-[#c7c4d8]/50 bg-white px-2 py-1.5 font-semibold text-[#0b1c30] outline-none focus:border-[#3525cd]"
        >
          <option value="mine">My documents</option>
          <option value="public">Search public</option>
        </select>
        <select
          value={subjectFilter}
          onChange={(event) => {
            setSubjectFilter(event.target.value)
            setPickerOpen(true)
          }}
          aria-label="Filter by subject"
          className="min-w-0 max-w-48 rounded-lg border border-[#c7c4d8]/50 bg-white px-2 py-1.5 font-semibold text-[#0b1c30] outline-none focus:border-[#3525cd]"
        >
          <option value="all">All subjects</option>
          <option value="uncategorized">Uncategorized</option>
          {subjects.map((subject) => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
        <div
          className="relative min-w-[220px] flex-1"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setPickerOpen(false)
          }}
        >
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#74798a]" />
          <input
            type="search"
            role="combobox"
            aria-label="Search documents"
            aria-expanded={pickerOpen}
            aria-controls="document-search-results"
            value={search}
            onFocus={() => setPickerOpen(true)}
            onChange={(event) => {
              setSearch(event.target.value)
              setPickerOpen(true)
            }}
            placeholder={sourceFilter === 'public'
              ? 'Search public documents (2+ characters)...'
              : 'Search my documents...'}
            className="w-full rounded-lg border border-[#c7c4d8]/50 bg-white py-1.5 pl-8 pr-2.5 font-semibold text-[#0b1c30] outline-none focus:border-[#3525cd] focus:ring-2 focus:ring-[#3525cd]/15"
          />

          {pickerOpen && (
            <div
              id="document-search-results"
              role="listbox"
              aria-label="Document search results"
              className="absolute bottom-[calc(100%+6px)] left-0 right-0 z-40 overflow-hidden rounded-xl border border-[#c7c4d8]/50 bg-white shadow-xl"
            >
              <button
                type="button"
                role="option"
                aria-selected={!documentId}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectDocument('')}
                className="flex w-full items-center justify-between border-b border-[#c7c4d8]/25 px-3 py-2 text-left font-bold text-[#3525cd] hover:bg-[#f5f3ff]"
              >
                General help <span className="font-medium text-[#74798a]">No document</span>
              </button>
              <div className="max-h-56 overflow-y-auto p-1">
                {searchingPublicDocuments && sourceFilter === 'public' ? (
                  <p className="px-3 py-3 text-center font-semibold text-[#74798a]">
                    Searching public documents...
                  </p>
                ) : filteredDocuments.length > 0 ? (
                  filteredDocuments.map((document) => (
                    <button
                      key={document.id}
                      type="button"
                      role="option"
                      aria-selected={String(document.id) === String(documentId)}
                      disabled={document.extractionStatus === 'FAILED'}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectDocument(document.id)}
                      className="block w-full rounded-lg px-3 py-2 text-left transition hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="block truncate font-bold text-[#0b1c30]">
                        {primaryDocumentName(document)}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-[#74798a]">
                        {[document.title, document.subjectName,
                          document.source === 'public'
                            ? (document.userId != null && currentUserId != null
                              && String(document.userId) === String(currentUserId)
                                ? 'You'
                                : document.uploaderName)
                            : null,
                          document.source === 'public' ? 'Public' : 'Mine']
                          .filter(Boolean).join(' · ')}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-3 text-center font-semibold text-[#74798a]">
                    {sourceFilter === 'public' && search.trim().length < 2
                      ? 'Enter at least 2 characters to search public documents.'
                      : 'No matching documents.'}
                  </p>
                )}
              </div>
              <div className="border-t border-[#c7c4d8]/25 px-3 py-1.5 text-[10px] font-semibold text-[#74798a]">
                {sourceFilter === 'public'
                  ? `${filteredDocuments.length} public results · maximum 20`
                  : `${filteredDocuments.length}/${sourceDocuments.length} my documents`}
              </div>
            </div>
          )}
        </div>
        {filtersActive && (
          <button
            type="button"
            onClick={clearFilters}
            aria-label="Clear document filters"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#c7c4d8]/50 bg-white text-[#74798a] transition hover:bg-[#eff4ff] hover:text-[#3525cd]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {publicDocumentSearchError && sourceFilter === 'public' && (
        <p className="font-semibold text-red-600">{publicDocumentSearchError}</p>
      )}
      <div className="flex min-h-6 flex-wrap items-center gap-2">
        {selectedDoc ? (
          <>
            <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-[#e8e3ff] px-2 py-1 font-bold text-[#3525cd]">
              <span className="truncate">
                {selectedDoc.source === 'public' ? 'Public:' : 'Mine:'} {primaryDocumentName(selectedDoc)}
              </span>
              <button
                type="button"
                onClick={() => selectDocument('')}
                aria-label="Remove selected document"
                className="shrink-0 rounded hover:bg-white/70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
            <ExtractionStatusBadge status={selectedDoc.extractionStatus} />
            {!isChatReady(selectedDoc.extractionStatus) && (
              <span className="text-[#74798a]" title={selectedMeta?.hint}>
                Limited context until extraction completes.
              </span>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={() => selectDocument('')}
            className="rounded-md bg-slate-100 px-2 py-1 font-bold text-[#464555]"
          >
            General help · no document
          </button>
        )}
      </div>
      {sourceFilter === 'mine' && sourceDocuments.length === 0 && (
        <span className="text-[#74798a]">
          You have no documents yet —{' '}
          <Link to="/upload" className="font-bold text-[#3525cd] hover:underline">
            upload one
          </Link>
          .
        </span>
      )}
    </div>
  )
}
