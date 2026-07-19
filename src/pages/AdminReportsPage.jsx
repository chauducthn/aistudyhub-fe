import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import DashboardShell from '../components/DashboardShell'
import {
  REPORT_REASONS,
  REPORT_STATUS_OPTIONS,
  listAdminReports,
  reportReasonLabel,
  resolveAdminReport,
  getReportedDocumentPreview,
} from '../api/reportsApi'
import { getApiErrorMessage } from '../utils/apiError'

const PAGE_SIZE = 10

const REASON_FILTER_OPTIONS = [{ value: 'ALL', label: 'All reasons' }, ...REPORT_REASONS]

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  )
}

export default function AdminReportsPage() {
  const [tab, setTab] = useState('pending')
  const [keywordInput, setKeywordInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [reasonFilter, setReasonFilter] = useState('ALL')
  const [page, setPage] = useState(0)
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0 })
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)

  const queryStatus = tab === 'pending' ? 'PENDING' : 'PROCESSED'

  const applyReportsData = useCallback((reportsData) => {
    setData(reportsData)
    setSelected((current) => {
      if (!current) return null
      return reportsData.content.find((report) => report.id === current.id) || null
    })
  }, [])

  const refreshReports = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await listAdminReports({ status: queryStatus, keyword, page, size: PAGE_SIZE })
      if (!res.success) throw new Error(res.message || 'Could not load reports.')
      applyReportsData(res.data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load reports.'))
    } finally {
      setLoading(false)
    }
  }, [applyReportsData, page, queryStatus, keyword])

  useEffect(() => {
    let ignore = false

    listAdminReports({ status: queryStatus, keyword, page, size: PAGE_SIZE })
      .then((res) => {
        if (ignore) return
        if (!res.success) throw new Error(res.message || 'Could not load reports.')
        applyReportsData(res.data)
        setError('')
      })
      .catch((err) => {
        if (!ignore) setError(getApiErrorMessage(err, 'Could not load reports.'))
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [applyReportsData, queryStatus, keyword, page])

  const filteredRows = useMemo(() => {
    if (reasonFilter === 'ALL') return data.content
    return data.content.filter((row) => row.reason === reasonFilter)
  }, [data.content, reasonFilter])

  const handleReject = async () => {
    if (!selected) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const res = await resolveAdminReport(selected.id, {
        status: 'REJECTED',
        adminNote: adminNote.trim() || undefined,
      })
      if (!res.success) throw new Error(res.message)
      setMessage('Report rejected.')
      setSelected(null)
      setAdminNote('')
      await refreshReports()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not reject report.'))
    } finally {
      setBusy(false)
    }
  }

  const handleResolve = async (documentStatus) => {
    if (!selected) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const res = await resolveAdminReport(selected.id, {
        status: 'RESOLVED',
        documentStatus,
        adminNote: adminNote.trim() || undefined,
      })
      if (!res.success) throw new Error(res.message)
      setMessage(`Report resolved. Document set to ${documentStatus}.`)
      setSelected(null)
      setAdminNote('')
      await refreshReports()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not resolve report.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <DashboardShell type="admin">
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0b1c30]">Report Management</h1>
          <p className="mt-2 text-base text-[#464555]">
            Review community reports on public documents. Reject invalid reports or take action on the document.
          </p>
        </div>

        <div className="mt-6 flex border-b border-[#c7c4d8]/20">
          <button
            onClick={() => {
              setTab('pending')
              setPage(0)
              setSelected(null)
            }}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition ${
              tab === 'pending'
                ? 'border-[#3525cd] text-[#3525cd]'
                : 'border-transparent text-[#74798a] hover:text-[#0b1c30]'
            }`}
          >
            Active Reports
          </button>
          <button
            onClick={() => {
              setTab('history')
              setPage(0)
              setSelected(null)
            }}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition ${
              tab === 'history'
                ? 'border-[#3525cd] text-[#3525cd]'
                : 'border-transparent text-[#74798a] hover:text-[#0b1c30]'
            }`}
          >
            Processed History
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            setKeyword(keywordInput.trim())
            setPage(0)
          }}
          className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end rounded-2xl border border-[#c7c4d8]/25 bg-white p-4 shadow-sm"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#74798a]" />
            <input
              type="search"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              placeholder="Search reports by document title, reporter email, or description..."
              className="auth-input h-12 !pl-11"
            />
          </div>
          <div className="sm:w-56">
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="h-12 w-full rounded-xl border border-[#c7c4d8]/50 bg-white px-3 text-sm font-semibold text-[#0b1c30] outline-none focus:border-[#3525cd]"
            >
              {REASON_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#3525cd] px-6 text-sm font-bold text-white transition hover:bg-[#2d1fb0]"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
          {(keyword || reasonFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setKeywordInput('')
                setKeyword('')
                setReasonFilter('ALL')
                setPage(0)
              }}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-[#c7c4d8]/40 bg-white px-3 text-sm font-bold text-[#464555] transition hover:bg-[#eff4ff]"
            >
              Reset
            </button>
          )}
        </form>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}
        {message && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
            <CheckCircle2 className="h-4 w-4" />
            {message}
          </div>
        )}

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="overflow-hidden rounded-2xl border border-[#c7c4d8]/25 bg-white shadow-sm">
            {loading ? (
              <div className="grid place-items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#3525cd]" />
              </div>
            ) : filteredRows.length === 0 ? (
              <p className="px-6 py-16 text-center text-sm text-[#74798a]">No reports match your filters.</p>
            ) : (
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-[#c7c4d8]/20 bg-[#f8f9ff] text-xs font-bold uppercase text-[#74798a]">
                  <tr>
                    <th className="px-4 py-3">Document</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => {
                        setSelected(row)
                        setAdminNote(row.adminNote || '')
                      }}
                      className={`cursor-pointer border-b border-[#c7c4d8]/15 transition hover:bg-[#f8f9ff] ${
                        selected?.id === row.id ? 'bg-[#3525cd]/5' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold text-[#0b1c30]">{row.documentTitle}</td>
                      <td className="px-4 py-3 text-[#464555]">{reportReasonLabel(row.reason)}</td>
                      <td className="px-4 py-3">
                        <ReportStatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3 text-[#74798a]">{formatDate(row.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {data.totalPages > 1 && (
              <div className="flex justify-between border-t border-[#c7c4d8]/20 px-4 py-3 text-sm font-semibold">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => {
                    setLoading(true)
                    setPage((p) => p - 1)
                  }}
                  className="disabled:opacity-40"
                >
                  Previous
                </button>
                <span>
                  {page + 1} / {data.totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= data.totalPages - 1}
                  onClick={() => {
                    setLoading(true)
                    setPage((p) => p + 1)
                  }}
                  className="disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </section>

          <aside className="rounded-2xl border border-[#c7c4d8]/25 bg-white p-6 shadow-sm">
            {!selected ? (
              <p className="text-sm text-[#74798a]">Select a report to view details and take action.</p>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-extrabold text-[#0b1c30]">Report detail</h2>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="grid h-8 w-8 place-items-center rounded-lg hover:bg-[#eff4ff]"
                    aria-label="Close detail"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <dl className="mt-4 space-y-3 text-sm">
                  <Detail label="Document" value={selected.documentTitle} />
                  <Detail label="Doc status" value={selected.documentStatus} />
                  <Detail label="Reporter" value={selected.reporterEmail} />
                  <Detail label="Reason" value={reportReasonLabel(selected.reason)} />
                  <Detail label="Description" value={selected.description || '—'} />
                  <Detail label="Report status" value={selected.status} />
                  <Detail label="Submitted" value={formatDate(selected.createdAt)} />
                </dl>

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(true)}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#3525cd]/25 bg-[#3525cd]/5 text-sm font-bold text-[#3525cd] hover:bg-[#3525cd]/10"
                  >
                    <Eye className="h-4 w-4" />
                    Preview Document
                  </button>
                </div>

                {(selected.status === 'PENDING' || selected.status === 'REVIEWED') && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="text-sm font-bold text-[#0b1c30]">Admin note</label>
                      <textarea
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        rows={3}
                        className="auth-input mt-2 min-h-[80px] resize-y py-2"
                        placeholder="Optional note for audit trail..."
                      />
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={handleReject}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#c7c4d8]/40 text-sm font-bold text-[#464555] hover:bg-[#eff4ff] disabled:opacity-60"
                    >
                      Reject report
                    </button>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#74798a]">
                      Document actions (resolve)
                    </p>
                    <div className="grid gap-2">
                      <ModerationButton
                        icon={EyeOff}
                        label="Hide document"
                        onClick={() => handleResolve('HIDDEN')}
                        disabled={busy}
                      />
                      <ModerationButton
                        icon={Lock}
                        label="Lock document"
                        onClick={() => handleResolve('LOCKED')}
                        disabled={busy}
                      />
                      <ModerationButton
                        icon={Trash2}
                        label="Remove document"
                        tone="danger"
                        onClick={() => handleResolve('REMOVED')}
                        disabled={busy}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </aside>
        </div>
      </div>
      {previewOpen && selected && (
        <PreviewModal
          docId={selected.documentId}
          docTitle={selected.documentTitle}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </DashboardShell>
  )
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase text-[#74798a]">{label}</dt>
      <dd className="mt-0.5 font-semibold text-[#0b1c30]">{value}</dd>
    </div>
  )
}

function ReportStatusBadge({ status }) {
  const map = {
    PENDING: 'bg-amber-50 text-amber-800',
    REVIEWED: 'bg-blue-50 text-blue-700',
    REJECTED: 'bg-slate-100 text-slate-600',
    RESOLVED: 'bg-emerald-50 text-emerald-700',
  }
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${map[status] || 'bg-slate-100'}`}
    >
      {status}
    </span>
  )
}

function ModerationButton({ icon: Icon, label, onClick, disabled, tone = 'default' }) {
  const cls =
    tone === 'danger'
      ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
      : 'border-[#c7c4d8]/40 text-[#0b1c30] hover:bg-[#eff4ff]'
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl border text-sm font-bold disabled:opacity-60 ${cls}`}
    >
      {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      {label}
    </button>
  )
}

function PreviewModal({ docId, docTitle, onClose }) {
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false
    getReportedDocumentPreview(docId)
      .then((res) => {
        if (ignore) return
        if (res.success) {
          setPreview(res.data)
          setError('')
        } else {
          setPreview(null)
          setError(res.message || 'Preview not available.')
        }
      })
      .catch((err) => {
        if (!ignore) setError(getApiErrorMessage(err, 'Preview not available.'))
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [docId])

  return (
    <Modal onClose={onClose} title={`Preview: ${docTitle}`} maxWidth="max-w-4xl">
      <div className="mt-2 min-h-[450px]">
        {loading ? (
          <div className="grid h-[450px] place-items-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#3525cd]" />
          </div>
        ) : error ? (
          <div className="grid h-[450px] place-items-center text-center">
            <div>
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
              <p className="mt-4 text-sm font-bold text-slate-700">{error}</p>
            </div>
          </div>
        ) : preview?.type === 'pdf' && preview.previewUrl ? (
          <iframe title={docTitle} src={preview.previewUrl} className="h-[600px] w-full border-0 rounded-xl" />
        ) : preview?.type === 'image' && preview.previewUrl ? (
          <div className="flex h-[600px] items-center justify-center overflow-auto bg-slate-50 p-4 rounded-xl">
            <img src={preview.previewUrl} alt={docTitle} className="max-h-full max-w-full object-contain" />
          </div>
        ) : preview?.type === 'text' ? (
          <div className="max-h-[600px] overflow-auto bg-[#0b1c30] p-6 font-mono text-sm text-slate-100 rounded-xl">
            <pre className="whitespace-pre-wrap">{preview.textContent}</pre>
          </div>
        ) : (
          <div className="grid h-[450px] place-items-center text-center">
            <p className="text-sm text-slate-500">Preview is not supported for this file type.</p>
          </div>
        )}
      </div>
    </Modal>
  )
}

function Modal({ children, onClose, title, maxWidth = 'max-w-lg' }) {
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
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#0b1c30]/40 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} rounded-2xl bg-white p-6 shadow-[0_24px_60px_rgba(11,28,48,0.18)]`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="mb-5 flex items-start justify-between gap-3">
            <h2 className="text-xl font-extrabold text-[#0b1c30]">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
