import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Download,
  FileText,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import DashboardShell from '../components/DashboardShell'
import {
  downloadDocument,
  listMyDocuments,
  listPublicDocuments,
  listSubjects,
} from '../api/documentsApi'
import { getApiErrorMessage } from '../utils/apiError'
import { formatDate } from '../utils/formatters'

const PAGE_SIZE = 10

const SCOPES = [
  { value: 'mine', label: 'My Documents' },
  { value: 'public', label: 'Public Library' },
]

const FILE_TYPES = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'md', 'xls', 'xlsx', 'csv']

function formatBytes(bytes) {
  if (!bytes) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

/** Tô đậm phần khớp từ khóa trong text (không phân biệt hoa thường). */
function highlight(text, keyword) {
  if (!text) return '—'
  if (!keyword) return text
  const safe = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = String(text).split(new RegExp(`(${safe})`, 'ig'))
  return parts.map((part, idx) =>
    part.toLowerCase() === keyword.toLowerCase() ? (
      <mark key={idx} className="rounded bg-[#fde68a] px-0.5 text-[#0b1c30]">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}

export default function AdvancedSearchPage({ isEmbedded = false }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQ = searchParams.get('q') || ''

  const [keywordInput, setKeywordInput] = useState(initialQ)
  const [keyword, setKeyword] = useState(initialQ)
  const [scope, setScope] = useState('mine')
  const [subjectId, setSubjectId] = useState('')
  const [fileType, setFileType] = useState('')
  const [page, setPage] = useState(0)

  const [subjects, setSubjects] = useState([])
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0 })
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(Boolean(initialQ))
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const inputRef = useRef(null)

  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        const res = await listSubjects()
        if (!ignore && res.success) setSubjects(res.data)
      } catch {
        /* subjects optional */
      }
    })()
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    if (!searched) return undefined
    let ignore = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const params = { search: keyword, page, size: PAGE_SIZE }
        const res =
          scope === 'public'
            ? await listPublicDocuments(params)
            : await listMyDocuments({ ...params, subjectId })
        if (ignore) return
        if (!res.success) throw new Error(res.message || 'Search failed.')
        // Lọc loại file phía client (BE chưa hỗ trợ filter fileType).
        let content = res.data.content || []
        if (fileType) content = content.filter((d) => (d.fileType || '').toLowerCase() === fileType)
        setData({ ...res.data, content })
      } catch (err) {
        if (!ignore) setError(getApiErrorMessage(err, 'Search failed.'))
      } finally {
        if (!ignore) setLoading(false)
      }
    })()
    return () => {
      ignore = true
    }
  }, [keyword, scope, subjectId, fileType, page, searched])

  const runSearch = (e) => {
    e?.preventDefault()
    setKeyword(keywordInput.trim())
    setPage(0)
    setSearched(true)
    setSearchParams(keywordInput.trim() ? { q: keywordInput.trim() } : {})
  }

  const resetFilters = () => {
    setScope('mine')
    setSubjectId('')
    setFileType('')
    setPage(0)
  }

  const handleDownload = async (doc) => {
    setBusyId(doc.id)
    setError('')
    try {
      await downloadDocument(doc)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not download document.'))
    } finally {
      setBusyId(null)
    }
  }

  const filtersActive = scope !== 'mine' || !!subjectId || !!fileType

  const content = (
    <div className={isEmbedded ? '' : 'px-4 py-8 sm:px-6 lg:px-8'}>
      {!isEmbedded && (
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-[#0b1c30] sm:text-4xl">Advanced Search</h1>
          <p className="mt-2 text-base text-[#464555]">
            Full-text search across titles, file names and descriptions.
          </p>
        </div>
      )}

        <form onSubmit={runSearch} className="mt-6 rounded-2xl border border-[#c7c4d8]/25 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#74798a]" />
              <input
                ref={inputRef}
                type="search"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="Search by keyword (title, file name, description)..."
                className="auth-input h-12 !pl-11"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#3525cd] px-6 text-sm font-bold text-white transition hover:bg-[#2d1fb0]"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#c7c4d8]/20 pt-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#74798a]">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
            </span>

            <select
              value={scope}
              onChange={(e) => {
                setScope(e.target.value)
                setPage(0)
              }}
              className="rounded-lg border border-[#c7c4d8]/50 bg-white px-3 py-1.5 text-xs font-semibold text-[#0b1c30] outline-none focus:border-[#3525cd]"
            >
              {SCOPES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            {scope === 'mine' && (
              <select
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value)
                  setPage(0)
                }}
                className="rounded-lg border border-[#c7c4d8]/50 bg-white px-3 py-1.5 text-xs font-semibold text-[#0b1c30] outline-none focus:border-[#3525cd]"
              >
                <option value="">All subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}

            <select
              value={fileType}
              onChange={(e) => {
                setFileType(e.target.value)
                setPage(0)
              }}
              className="rounded-lg border border-[#c7c4d8]/50 bg-white px-3 py-1.5 text-xs font-semibold text-[#0b1c30] outline-none focus:border-[#3525cd]"
            >
              <option value="">All file types</option>
              {FILE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.toUpperCase()}
                </option>
              ))}
            </select>

            {filtersActive && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-[#3525cd] hover:bg-[#eff4ff]"
              >
                <X className="h-3.5 w-3.5" />
                Reset
              </button>
            )}
          </div>
        </form>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>
        )}

        <div className="mt-6">
          {!searched ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-[#c7c4d8]/50 bg-white px-6 py-20 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#eef0ff] text-[#3525cd]">
                <Search className="h-8 w-8" />
              </span>
              <h2 className="mt-5 text-xl font-extrabold text-[#0b1c30]">Search your library</h2>
              <p className="mt-2 max-w-md text-sm text-[#464555]">
                Enter a keyword above to search across your documents and the public library.
              </p>
            </div>
          ) : loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="h-20 animate-pulse rounded-2xl bg-white shadow-sm" />
              ))}
            </div>
          ) : data.content.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-[#c7c4d8]/25 bg-white px-6 py-16 text-center shadow-sm">
              <FileText className="h-10 w-10 text-[#74798a]" />
              <h2 className="mt-4 text-lg font-extrabold text-[#0b1c30]">No results found</h2>
              <p className="mt-1 max-w-md text-sm text-[#74798a]">
                No documents match {keyword ? `"${keyword}"` : 'your search'}
                {filtersActive ? ' with the current filters' : ''}. Try a different keyword.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-3 text-sm font-semibold text-[#74798a]">
                {data.totalElements.toLocaleString()} result{data.totalElements === 1 ? '' : 's'}
                {keyword ? ` for "${keyword}"` : ''}
              </p>
              <div className="space-y-3">
                {data.content.map((doc) => (
                  <article
                    key={doc.id}
                    className="flex items-start gap-4 rounded-2xl border border-[#c7c4d8]/25 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#eff4ff] text-[#3525cd]">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={scope === 'public' ? `/public-documents/${doc.id}` : `/documents/${doc.id}`}
                        className="font-extrabold text-[#0b1c30] hover:text-[#3525cd]"
                      >
                        {highlight(doc.title, keyword)}
                      </Link>
                      {doc.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-[#464555]">
                          {highlight(doc.description, keyword)}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#74798a]">
                        <span className="rounded-md bg-[#f1f3fb] px-2 py-0.5 uppercase">{doc.fileType || '—'}</span>
                        {doc.subjectName && (
                          <span className="rounded-md bg-[#dce9ff] px-2 py-0.5 text-[#3525cd]">{doc.subjectName}</span>
                        )}
                        <span>{formatBytes(doc.fileSize)}</span>
                        <span>· {highlight(doc.fileName, keyword)}</span>
                        <span>· {formatDate(doc.uploadedAt)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownload(doc)}
                      disabled={busyId === doc.id}
                      aria-label="Download"
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-[#464555] transition hover:bg-[#eff4ff] hover:text-[#3525cd] disabled:opacity-50"
                    >
                      {busyId === doc.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </button>
                  </article>
                ))}
              </div>

              {data.totalPages > 1 && (
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#74798a]">
                    Page {page + 1} of {data.totalPages}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={page === 0 || loading}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      className="inline-flex h-9 items-center rounded-lg border border-[#c7c4d8]/40 bg-white px-4 text-sm font-bold text-[#0b1c30] transition disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={page + 1 >= data.totalPages || loading}
                      onClick={() => setPage((p) => p + 1)}
                      className="inline-flex h-9 items-center rounded-lg border border-[#c7c4d8]/40 bg-white px-4 text-sm font-bold text-[#0b1c30] transition disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )

  if (isEmbedded) return content

  return <DashboardShell>{content}</DashboardShell>
}
