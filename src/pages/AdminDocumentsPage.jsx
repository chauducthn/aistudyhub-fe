import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, FileText, Loader2, Search, Trash2, X } from 'lucide-react'
import DashboardShell from '../components/DashboardShell'
import {
  deleteAdminDocument,
  downloadAdminDocument,
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
  { value: 'LOCKED', label: 'Locked' },
  { value: 'REMOVED', label: 'Removed' },
  { value: 'DELETED', label: 'Deleted' },
]

// Statuses an admin can set (BE rejects DELETED via this endpoint).
const ADMIN_STATUSES = ['PUBLIC', 'PRIVATE', 'HIDDEN', 'LOCKED', 'REMOVED']

const STATUS_TONE = {
  PUBLIC: 'bg-emerald-50 text-emerald-700',
  PRIVATE: 'bg-slate-100 text-slate-600',
  HIDDEN: 'bg-amber-50 text-amber-700',
  LOCKED: 'bg-orange-50 text-orange-700',
  REMOVED: 'bg-red-50 text-red-700',
  DELETED: 'bg-red-100 text-red-800',
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

  const handleStatusChange = async (doc, nextStatus) => {
    setBusyId(doc.id)
    setError('')
    setMessage('')
    try {
      const res = await updateAdminDocumentStatus(doc.id, nextStatus)
      if (!res.success) throw new Error(res.message)
      setData((cur) => ({
        ...cur,
        content: cur.content.map((d) => (d.id === doc.id ? { ...d, status: nextStatus } : d)),
      }))
      setMessage(`"${doc.title}" is now ${nextStatus}.`)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update status.'))
    } finally {
      setBusyId(null)
    }
  }

  const handleDownload = async (doc) => {
    setBusyId(doc.id)
    setError('')
    try {
      await downloadAdminDocument(doc)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not download document.'))
    } finally {
      setBusyId(null)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setBusyId(deleteTarget.id)
    setError('')
    setMessage('')
    try {
      const res = await deleteAdminDocument(deleteTarget.id)
      if (!res.success) throw new Error(res.message)
      setMessage(`"${deleteTarget.title}" deleted.`)
      setDeleteTarget(null)
      setReloadKey((k) => k + 1)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not delete document.'))
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

        <section className="mt-6 overflow-hidden rounded-2xl border border-[#c7c4d8]/25 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left text-sm">
              <thead className="bg-[#f5f7ff] text-xs font-bold uppercase tracking-wide text-[#74798a]">
                <tr>
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
                      <td colSpan={6} className="px-6 py-4">
                        <div className="h-8 w-full animate-pulse rounded-lg bg-[#eef0ff]" />
                      </td>
                    </tr>
                  ))
                ) : data.content.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
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
                        {doc.status === 'DELETED' ? (
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${STATUS_TONE.DELETED}`}>
                            DELETED
                          </span>
                        ) : (
                          <select
                            value={doc.status}
                            disabled={busyId === doc.id}
                            onChange={(e) => handleStatusChange(doc, e.target.value)}
                            className={`rounded-md border-0 px-2 py-1 text-xs font-extrabold uppercase outline-none ring-1 ring-inset ring-[#c7c4d8]/40 ${
                              STATUS_TONE[doc.status] || 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {ADMIN_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-4 text-xs font-semibold text-[#464555]">{formatBytes(doc.fileSize)}</td>
                      <td className="px-4 py-4 text-xs font-semibold text-[#464555]">{formatDate(doc.uploadedAt)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleDownload(doc)}
                            disabled={busyId === doc.id}
                            aria-label="Download"
                            title="Download"
                            className="grid h-9 w-9 place-items-center rounded-lg text-[#464555] transition hover:bg-[#eff4ff] hover:text-[#3525cd] disabled:opacity-50"
                          >
                            {busyId === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                          </button>
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
    </DashboardShell>
  )
}
