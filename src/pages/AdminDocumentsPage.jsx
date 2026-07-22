import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Archive, EyeOff, FileText, Loader2, Search, Trash2, X } from 'lucide-react'
import DashboardShell from '../components/DashboardShell'
import {
  deleteAdminDocument,
  listAdminDocuments,
  updateAdminDocumentStatus,
} from '../api/adminApi'
import { getApiErrorMessage } from '../utils/apiError'
import { formatDate } from '../utils/formatters'

const PAGE_SIZE = 10

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'PUBLIC', label: 'Public' },
  { value: 'PRIVATE', label: 'Private' },
  { value: 'HIDDEN', label: 'Hidden' },
  { value: 'REMOVED', label: 'Removed' },
]

// Statuses an admin can set.
const ADMIN_STATUSES = ['PUBLIC', 'PRIVATE', 'HIDDEN', 'REMOVED']

const STATUS_TONE = {
  PUBLIC: 'bg-emerald-50 text-emerald-700',
  PRIVATE: 'bg-slate-100 text-slate-600',
  HIDDEN: 'bg-amber-50 text-amber-700',
  REMOVED: 'bg-red-50 text-red-700',
}

function formatBytes(bytes) {
  if (!bytes) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

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

export default function AdminDocumentsPage() {
  const [keywordInput, setKeywordInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkStatus, setBulkStatus] = useState('PRIVATE')
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let ignore = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const res = await listAdminDocuments({ keyword, status, page, size: PAGE_SIZE })
        if (ignore) return
        if (!res.success) throw new Error(res.message || 'Could not load documents.')
        setData(res.data)
        setSelectedIds([])
      } catch (err) {
        if (!ignore) setError(getApiErrorMessage(err, 'Could not load documents.'))
      } finally {
        if (!ignore) setLoading(false)
      }
    })()
    return () => {
      ignore = true
    }
  }, [keyword, status, page, reloadKey])

  const runSearch = (e) => {
    e?.preventDefault()
    setKeyword(keywordInput.trim())
    setPage(0)
  }



  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setBusyId(deleteTarget.id)
    setError('')
    setMessage('')
    try {
      const res = await deleteAdminDocument(deleteTarget.id)
      if (!res.success) throw new Error(res.message)
      setMessage(`"${deleteTarget.title}" permanently removed.`)
      setDeleteTarget(null)
      setReloadKey((k) => k + 1)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not delete document.'))
    } finally {
      setBusyId(null)
    }
  }

  const currentPageIds = data.content.map((doc) => doc.id)
  const allCurrentSelected = currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id))

  const toggleSelected = (documentId) => {
    setSelectedIds((current) =>
      current.includes(documentId)
        ? current.filter((id) => id !== documentId)
        : [...current, documentId],
    )
  }

  const runBulkStatus = async (nextStatus) => {
    const ids = [...selectedIds]
    if (ids.length === 0) return
    setBusyId('bulk')
    setError('')
    setMessage('')
    const results = await Promise.allSettled(ids.map((id) => updateAdminDocumentStatus(id, nextStatus)))
    const succeeded = results.filter((result) => result.status === 'fulfilled' && result.value?.success).length
    const failed = ids.length - succeeded
    if (succeeded > 0) setMessage(`${succeeded}/${ids.length} documents changed to ${nextStatus.toLowerCase()}.`)
    if (failed > 0) setError(`${failed} document(s) could not be updated.`)
    setSelectedIds([])
    setReloadKey((key) => key + 1)
    setBusyId(null)
  }

  const runBulkDelete = async () => {
    const ids = [...selectedIds]
    if (ids.length === 0) return
    setBusyId('bulk')
    setError('')
    setMessage('')
    const results = await Promise.allSettled(ids.map((id) => deleteAdminDocument(id)))
    const succeeded = results.filter((result) => result.status === 'fulfilled' && result.value?.success).length
    const failed = ids.length - succeeded
    if (succeeded > 0) setMessage(`${succeeded}/${ids.length} documents permanently removed.`)
    if (failed > 0) setError(`${failed} document(s) could not be permanently removed.`)
    setBulkDeleteOpen(false)
    setSelectedIds([])
    setReloadKey((key) => key + 1)
    setBusyId(null)
  }

  const handleSingleStatus = async (doc, nextStatus) => {
    if (nextStatus === doc.status) return
    setBusyId(doc.id)
    setError('')
    try {
      const res = await updateAdminDocumentStatus(doc.id, nextStatus)
      if (!res.success) throw new Error(res.message)
      setMessage(`"${doc.title}" changed to ${nextStatus.toLowerCase()}.`)
      setReloadKey((key) => key + 1)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update document status.'))
    } finally {
      setBusyId(null)
    }
  }

  const filtersActive = !!keyword || !!status

  return (
    <DashboardShell type="admin">
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0b1c30] sm:text-4xl">Documents Management</h1>
            <p className="mt-2 text-base text-[#464555]">
              Search, moderate, download or remove documents from every user.
            </p>
          </div>
          <Link to="/admin/dashboard" className="text-sm font-bold text-[#3525cd] hover:underline">
            Back to Dashboard
          </Link>
        </div>

        <form onSubmit={runSearch} className="mt-6 rounded-2xl border border-[#c7c4d8]/25 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#74798a]" />
              <input
                type="search"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="Search by title, file name, description, owner email/name, or subject..."
                className="auth-input h-12 !pl-11"
              />
            </div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(0)
              }}
              className="h-12 rounded-xl border border-[#c7c4d8]/50 bg-white px-3 text-sm font-semibold text-[#0b1c30] outline-none focus:border-[#3525cd]"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#3525cd] px-6 text-sm font-bold text-white transition hover:bg-[#2d1fb0]"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
            {filtersActive && (
              <button
                type="button"
                onClick={() => {
                  setKeywordInput('')
                  setKeyword('')
                  setStatus('')
                  setPage(0)
                }}
                className="inline-flex h-12 items-center justify-center rounded-xl border border-[#c7c4d8]/40 bg-white px-3 text-sm font-bold text-[#464555] transition hover:bg-[#eff4ff]"
                aria-label="Reset"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>
        )}
        {message && (
          <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{message}</div>
        )}

        {selectedIds.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#3525cd]/20 bg-[#eef0ff] px-4 py-3">
            <span className="mr-auto text-sm font-extrabold text-[#3525cd]">
              {selectedIds.length} document{selectedIds.length === 1 ? '' : 's'} selected
            </span>
            <select
              value={bulkStatus}
              onChange={(event) => setBulkStatus(event.target.value)}
              disabled={busyId === 'bulk'}
              className="h-9 rounded-lg border border-[#3525cd]/25 bg-white px-3 text-sm font-bold text-[#0b1c30]"
              aria-label="Bulk status"
            >
              {ADMIN_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <button type="button" onClick={() => runBulkStatus(bulkStatus)} disabled={busyId === 'bulk'} className="h-9 rounded-lg bg-[#3525cd] px-3 text-sm font-bold text-white disabled:opacity-50">
              Apply status
            </button>
            <button type="button" onClick={() => runBulkStatus('HIDDEN')} disabled={busyId === 'bulk'} className="inline-flex h-9 items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 text-sm font-bold text-amber-700 disabled:opacity-50">
              <EyeOff className="h-4 w-4" /> Hide
            </button>
            <button type="button" onClick={() => runBulkStatus('REMOVED')} disabled={busyId === 'bulk'} className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-sm font-bold text-red-700 disabled:opacity-50">
              <Archive className="h-4 w-4" /> Mark removed
            </button>
            <button type="button" onClick={() => setBulkDeleteOpen(true)} disabled={busyId === 'bulk'} className="inline-flex h-9 items-center gap-2 rounded-lg bg-red-600 px-3 text-sm font-bold text-white disabled:opacity-50">
              {busyId === 'bulk' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete permanently
            </button>
          </div>
        )}

        <section className="mt-6 overflow-hidden rounded-2xl border border-[#c7c4d8]/25 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left text-sm">
              <thead className="bg-[#f5f7ff] text-xs font-bold uppercase tracking-wide text-[#74798a]">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <input type="checkbox" checked={allCurrentSelected} onChange={() => setSelectedIds(allCurrentSelected ? [] : currentPageIds)} aria-label="Select all documents on this page" className="h-4 w-4 accent-[#3525cd]" />
                  </th>
                  <th className="px-6 py-3">Document</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <tr key={idx} className="border-t border-[#c7c4d8]/15">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="h-8 w-full animate-pulse rounded-lg bg-[#eef0ff]" />
                      </td>
                    </tr>
                  ))
                ) : data.content.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <FileText className="mx-auto h-10 w-10 text-[#74798a]" />
                      <p className="mt-3 font-extrabold text-[#0b1c30]">No documents found</p>
                      <p className="mt-1 text-sm text-[#74798a]">
                        {filtersActive ? 'Try a different keyword or status filter.' : 'No documents in the system yet.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  data.content.map((doc) => (
                    <tr key={doc.id} className="border-t border-[#c7c4d8]/15">
                      <td className="px-4 py-4">
                        <input type="checkbox" checked={selectedIds.includes(doc.id)} onChange={() => toggleSelected(doc.id)} aria-label={`Select ${doc.title}`} className="h-4 w-4 accent-[#3525cd]" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#eff4ff] text-[#3525cd]">
                            <FileText className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-extrabold text-[#0b1c30]">{highlight(doc.title, keyword)}</p>
                            <p className="truncate text-xs text-[#74798a]">{highlight(doc.fileName, keyword)}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {doc.subjectName ? (
                          <span className="rounded-md bg-[#dce9ff] px-2 py-1 text-xs font-bold text-[#3525cd]">
                            {doc.subjectName}
                          </span>
                        ) : (
                          <span className="text-xs text-[#74798a]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={doc.status}
                          onChange={(event) => handleSingleStatus(doc, event.target.value)}
                          disabled={busyId === doc.id}
                          className={`rounded-full border-0 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide outline-none ${STATUS_TONE[doc.status] || 'bg-slate-100 text-slate-600'}`}
                          aria-label={`Edit status for ${doc.title}`}
                        >
                          {ADMIN_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-4 text-xs font-semibold text-[#464555]">{formatBytes(doc.fileSize)}</td>
                      <td className="px-4 py-4 text-xs font-semibold text-[#464555]">{formatDate(doc.uploadedAt)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(doc)}
                            disabled={busyId === doc.id}
                            aria-label="Delete"
                            title="Delete"
                            className="grid h-9 w-9 place-items-center rounded-lg text-[#464555] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[#c7c4d8]/20 px-6 py-4">
              <span className="text-xs font-bold text-[#74798a]">
                Page {page + 1} of {data.totalPages} · {data.totalElements} total
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
        </section>
      </div>

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#0b1c30]/40 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal
          onClick={() => busyId !== deleteTarget.id && setDeleteTarget(null)}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_24px_60px_rgba(11,28,48,0.18)]" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-600">
                <Trash2 className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-xl font-extrabold text-[#0b1c30]">Delete this document?</h2>
              <p className="mt-2 text-sm text-[#464555]">
                "{deleteTarget.title}" by {deleteTarget.userFullName || deleteTarget.userEmail} will be permanently
                removed. This cannot be undone.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={busyId === deleteTarget.id}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-[#c7c4d8]/40 bg-white text-sm font-bold text-[#0b1c30] transition hover:bg-[#eff4ff] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={busyId === deleteTarget.id}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {busyId === deleteTarget.id && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {bulkDeleteOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#0b1c30]/40 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_24px_60px_rgba(11,28,48,0.18)]">
            <h2 className="text-xl font-extrabold text-[#0b1c30]">Permanently remove {selectedIds.length} documents?</h2>
            <p className="mt-2 text-sm text-[#464555]">This deletes the selected database records and cannot be undone. Use Mark removed when you only want to hide them from normal use.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setBulkDeleteOpen(false)} disabled={busyId === 'bulk'} className="h-11 rounded-xl border border-[#c7c4d8]/40 px-5 text-sm font-bold text-[#0b1c30]">Cancel</button>
              <button type="button" onClick={runBulkDelete} disabled={busyId === 'bulk'} className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-bold text-white disabled:opacity-50">
                {busyId === 'bulk' && <Loader2 className="h-4 w-4 animate-spin" />} Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
