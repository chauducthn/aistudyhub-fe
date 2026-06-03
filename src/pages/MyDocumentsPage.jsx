import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import DashboardShell from '../components/DashboardShell'
import DocumentEditForm from '../components/documents/DocumentEditForm'
import {
  deleteDocument,
  downloadDocument,
  listMyDocuments,
  listSubjects,
  toggleDocumentVisibility,
  updateDocument,
} from '../api/documentsApi'
import { getApiErrorMessage } from '../utils/apiError'

const PAGE_SIZE = 8

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'REJECTED', label: 'Rejected' },
]

const VISIBILITY_OPTIONS = [
  { value: 'ALL', label: 'All visibility' },
  { value: 'PUBLIC', label: 'Public' },
  { value: 'PRIVATE', label: 'Private' },
]

function formatBytes(bytes) {
  if (!bytes) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(value))
}

const fileTypeStyle = {
  pdf: 'bg-red-50 text-red-500',
  docx: 'bg-blue-50 text-blue-600',
  pptx: 'bg-orange-50 text-orange-500',
  txt: 'bg-slate-100 text-slate-600',
}

export default function MyDocumentsPage() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [status, setStatus] = useState('ALL')
  const [visibility, setVisibility] = useState('ALL')
  const [page, setPage] = useState(0)
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0 })
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const subjectMap = useMemo(() => {
    const map = new Map()
    subjects.forEach((s) => map.set(s.id, s))
    return map
  }, [subjects])

  useEffect(() => {
    let ignore = false
    listSubjects().then((res) => {
      if (!ignore && res.success) setSubjects(res.data)
    })
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    let ignore = false
    setLoading(true)
    setError('')
    listMyDocuments({ search, subjectId, status, visibility, page, size: PAGE_SIZE })
      .then((res) => {
        if (ignore) return
        if (!res.success) throw new Error(res.message || 'Could not load documents.')
        setData(res.data)
      })
      .catch((err) => {
        if (!ignore) setError(getApiErrorMessage(err, 'Could not load documents.'))
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [search, subjectId, status, visibility, page])

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    setPage(0)
    setSearch(searchInput.trim())
  }

  const handleResetFilters = () => {
    setSearchInput('')
    setSearch('')
    setSubjectId('')
    setStatus('ALL')
    setVisibility('ALL')
    setPage(0)
  }

  const refresh = async () => {
    const res = await listMyDocuments({ search, subjectId, status, visibility, page, size: PAGE_SIZE })
    if (res.success) setData(res.data)
  }

  const handleToggleVisibility = async (doc) => {
    setBusyId(doc.id)
    setError('')
    try {
      const res = await toggleDocumentVisibility(doc.id)
      if (!res.success) throw new Error(res.message)
      setMessage(`${res.data.title} is now ${res.data.visibility.toLowerCase()}.`)
      await refresh()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not change visibility.'))
    } finally {
      setBusyId(null)
    }
  }

  const handleDownload = async (doc) => {
    setBusyId(doc.id)
    try {
      await downloadDocument(doc)
      setMessage(`Downloading ${doc.fileName}...`)
    } finally {
      setBusyId(null)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingId) return
    setBusyId(deletingId)
    setError('')
    try {
      const res = await deleteDocument(deletingId)
      if (!res.success) throw new Error(res.message)
      setMessage('Document deleted.')
      setDeletingId(null)
      await refresh()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not delete document.'))
    } finally {
      setBusyId(null)
    }
  }

  const handleSaveEdit = async (payload) => {
    if (!editing) return
    setBusyId(editing.id)
    setError('')
    try {
      const res = await updateDocument(editing.id, payload)
      if (!res.success) throw new Error(res.message)
      setMessage(`${res.data.title} updated.`)
      setEditing(null)
      await refresh()
    } catch (err) {
      const status = err.response?.status
      if (status === 403) {
        setError(err.response?.data?.message || 'You do not have permission to edit this document.')
      } else if (status === 404) {
        setError('This document no longer exists.')
        setEditing(null)
        await refresh()
      } else {
        setError(getApiErrorMessage(err, 'Could not update document.'))
      }
    } finally {
      setBusyId(null)
    }
  }

  const filtersActive = !!search || !!subjectId || status !== 'ALL' || visibility !== 'ALL'

  return (
    <DashboardShell>
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0b1c30] sm:text-4xl">My Documents</h1>
            <p className="mt-2 text-base text-[#464555]">
              {loading ? 'Loading...' : `${data.totalElements} documents in your library.`}
            </p>
          </div>
          <Link
            to="/upload"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#3525cd] px-6 text-sm font-bold text-white shadow-[0_10px_15px_-3px_rgba(53,37,205,0.28)] transition hover:bg-[#2d1fb0]"
          >
            <Plus className="h-4 w-4" />
            Upload Document
          </Link>
        </div>

        <section className="mt-6 rounded-2xl border border-[#c7c4d8]/25 bg-white p-4 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#74798a]" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search title, description, or file name..."
                className="auth-input pl-10"
              />
            </div>
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value)
                setPage(0)
              }}
              className="auth-input"
            >
              <option value="">All subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(0)
              }}
              className="auth-input"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={visibility}
              onChange={(e) => {
                setVisibility(e.target.value)
                setPage(0)
              }}
              className="auth-input"
            >
              {VISIBILITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-[#3525cd] px-5 text-sm font-bold text-white transition hover:bg-[#2d1fb0]"
              >
                Search
              </button>
              {filtersActive && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-[#c7c4d8]/40 bg-white px-3 text-sm font-bold text-[#464555] transition hover:bg-[#eff4ff]"
                  aria-label="Reset filters"
                  title="Reset filters"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
        </section>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}
        {message && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            {message}
            <button
              type="button"
              onClick={() => setMessage('')}
              className="ml-auto text-emerald-700/70 hover:text-emerald-700"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <section className="mt-4 overflow-hidden rounded-2xl border border-[#c7c4d8]/25 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-[#f5f7ff] text-xs font-bold uppercase tracking-wide text-[#74798a]">
                <tr>
                  <th className="px-6 py-3">Document</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Visibility</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="border-t border-[#c7c4d8]/15">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="h-8 w-full animate-pulse rounded-lg bg-[#eef0ff]" />
                      </td>
                    </tr>
                  ))
                ) : data.content.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16">
                      <div className="flex flex-col items-center gap-3 text-center">
                        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef0ff] text-[#3525cd]">
                          <FileText className="h-6 w-6" />
                        </span>
                        <p className="text-base font-bold text-[#0b1c30]">No documents found</p>
                        <p className="max-w-md text-sm text-[#74798a]">
                          {filtersActive
                            ? 'Try clearing the filters or use a different search keyword.'
                            : 'Upload your first document to get started.'}
                        </p>
                        {filtersActive ? (
                          <button
                            type="button"
                            onClick={handleResetFilters}
                            className="mt-1 inline-flex h-10 items-center rounded-lg border border-[#c7c4d8]/40 bg-white px-4 text-sm font-bold text-[#0b1c30] transition hover:bg-[#eff4ff]"
                          >
                            Clear filters
                          </button>
                        ) : (
                          <Link
                            to="/upload"
                            className="mt-1 inline-flex h-10 items-center gap-2 rounded-lg bg-[#3525cd] px-4 text-sm font-bold text-white transition hover:bg-[#2d1fb0]"
                          >
                            <Plus className="h-4 w-4" />
                            Upload Document
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.content.map((doc) => (
                    <tr key={doc.id} className="border-t border-[#c7c4d8]/15">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
                              fileTypeStyle[doc.fileType] || 'bg-[#eff4ff] text-[#3525cd]'
                            }`}
                          >
                            <FileText className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-extrabold text-[#0b1c30]" title={doc.title}>
                              {doc.title}
                            </p>
                            <p className="truncate text-xs text-[#74798a]">{doc.fileName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <SubjectBadge subject={subjectMap.get(doc.subjectId)} />
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={doc.status} />
                      </td>
                      <td className="px-4 py-4">
                        <VisibilityPill visibility={doc.visibility} />
                      </td>
                      <td className="px-4 py-4 text-xs font-semibold text-[#464555]">{formatBytes(doc.fileSize)}</td>
                      <td className="px-4 py-4 text-xs font-semibold text-[#464555]">{formatDate(doc.uploadedAt)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <ActionIconButton
                            label="Preview"
                            onClick={() => navigate(`/documents/${doc.id}`)}
                            disabled={busyId === doc.id}
                          >
                            <FileText className="h-4 w-4" />
                          </ActionIconButton>
                          <ActionIconButton
                            label="Download"
                            onClick={() => handleDownload(doc)}
                            disabled={busyId === doc.id}
                          >
                            <Download className="h-4 w-4" />
                          </ActionIconButton>
                          <ActionIconButton
                            label="Edit"
                            onClick={() => setEditing(doc)}
                            disabled={busyId === doc.id}
                          >
                            <Pencil className="h-4 w-4" />
                          </ActionIconButton>
                          <ActionIconButton
                            label={doc.visibility === 'PUBLIC' ? 'Make private' : 'Make public'}
                            onClick={() => handleToggleVisibility(doc)}
                            disabled={busyId === doc.id}
                            tone={doc.visibility === 'PUBLIC' ? 'active' : 'default'}
                          >
                            {doc.visibility === 'PUBLIC' ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </ActionIconButton>
                          <ActionIconButton
                            label="Delete"
                            onClick={() => setDeletingId(doc.id)}
                            disabled={busyId === doc.id}
                            tone="danger"
                          >
                            {busyId === doc.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </ActionIconButton>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-[#c7c4d8]/20 px-6 py-4 sm:flex-row">
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

        {editing && (
          <EditDocumentModal
            doc={editing}
            subjects={subjects}
            onClose={() => setEditing(null)}
            onSave={handleSaveEdit}
            saving={busyId === editing.id}
          />
        )}

        {deletingId && (
          <ConfirmDialog
            title="Delete this document?"
            description="This action cannot be undone. The file will be removed from your library."
            confirmLabel="Delete"
            tone="danger"
            busy={busyId === deletingId}
            onCancel={() => setDeletingId(null)}
            onConfirm={handleConfirmDelete}
          />
        )}
      </div>
    </DashboardShell>
  )
}

function SubjectBadge({ subject }) {
  if (!subject) return <span className="text-xs font-semibold text-[#74798a]">—</span>
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#dce9ff] px-2 py-1 text-xs font-bold text-[#3525cd]">
      {subject.code}
      <span className="font-semibold text-[#3525cd]/70">·</span>
      <span className="font-bold">{subject.name}</span>
    </span>
  )
}

function StatusBadge({ status }) {
  const map = {
    APPROVED: 'bg-emerald-50 text-emerald-700',
    PENDING: 'bg-amber-50 text-amber-700',
    REJECTED: 'bg-red-50 text-red-700',
  }
  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${map[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  )
}

function VisibilityPill({ visibility }) {
  const isPublic = visibility === 'PUBLIC'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${
        isPublic ? 'bg-[#e8e3ff] text-[#3525cd]' : 'bg-slate-100 text-slate-600'
      }`}
    >
      {isPublic ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
      {visibility}
    </span>
  )
}

function ActionIconButton({ children, label, onClick, disabled, tone = 'default' }) {
  const toneClass = {
    default: 'text-[#464555] hover:bg-[#eff4ff] hover:text-[#3525cd]',
    danger: 'text-[#464555] hover:bg-red-50 hover:text-red-600',
    active: 'bg-[#e8e3ff] text-[#3525cd] hover:bg-[#dcd3ff]',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 place-items-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${toneClass[tone] || toneClass.default}`}
    >
      {children}
    </button>
  )
}

function EditDocumentModal({ doc, subjects, onClose, onSave, saving }) {
  return (
    <Modal onClose={onClose}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[#0b1c30]">Edit Document</h2>
          <p className="mt-1 text-sm text-[#74798a]">{doc.fileName}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-lg text-[#464555] hover:bg-[#eff4ff]"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <DocumentEditForm
        doc={doc}
        subjects={subjects}
        saving={saving}
        onSubmit={onSave}
        onCancel={onClose}
        layout="modal"
      />
    </Modal>
  )
}

function ConfirmDialog({ title, description, confirmLabel, tone = 'default', busy, onCancel, onConfirm }) {
  const confirmClass =
    tone === 'danger'
      ? 'bg-red-600 hover:bg-red-700'
      : 'bg-[#3525cd] hover:bg-[#2d1fb0]'
  const iconBg =
    tone === 'danger' ? 'bg-red-50 text-red-600' : 'bg-[#eef0ff] text-[#3525cd]'

  return (
    <Modal onClose={onCancel} maxWidth="max-w-md">
      <div className="text-center">
        <span className={`mx-auto grid h-12 w-12 place-items-center rounded-2xl ${iconBg}`}>
          <AlertTriangle className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-xl font-extrabold text-[#0b1c30]">{title}</h2>
        <p className="mt-2 text-sm text-[#464555]">{description}</p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-[#c7c4d8]/40 bg-white text-sm font-bold text-[#0b1c30] transition hover:bg-[#eff4ff]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${confirmClass}`}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

function Modal({ children, onClose, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onEsc)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#0b1c30]/40 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal>
      <div
        className={`w-full ${maxWidth} rounded-2xl bg-white p-6 shadow-[0_24px_60px_rgba(11,28,48,0.18)]`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
