import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Download,
  Eye,
  FileText,
  Flag,
  Loader2,
  Search,
} from 'lucide-react'
import DashboardShell from '../components/DashboardShell'
import ReportDocumentModal from '../components/reports/ReportDocumentModal'
import { downloadDocument, listPublicDocuments } from '../api/documentsApi'
import { listSubjects } from '../api/subjectsApi'
import { getApiErrorMessage } from '../utils/apiError'

const PAGE_SIZE = 8

function formatBytes(bytes) {
  if (!bytes) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(value),
  )
}

export default function PublicDocumentsPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [page, setPage] = useState(0)
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0 })
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [reportTarget, setReportTarget] = useState(null)

  const subjectMap = useMemo(() => {
    const map = new Map()
    subjects.forEach((s) => map.set(s.id, s))
    return map
  }, [subjects])

  useEffect(() => {
    let ignore = false
    listSubjects()
      .then((res) => {
        if (!ignore && res.success) setSubjects(res.data)
      })
      .catch(() => {})
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    let ignore = false
    setLoading(true)
    setError('')
    listPublicDocuments({ search, subjectId, page, size: PAGE_SIZE })
      .then((res) => {
        if (ignore) return
        if (!res.success) throw new Error(res.message || 'Could not load public documents.')
        let content = res.data.content
        if (subjectId) {
          content = content.filter((d) => d.subjectId === subjectId)
        }
        setData({ ...res.data, content })
      })
      .catch((err) => {
        if (!ignore) setError(getApiErrorMessage(err, 'Could not load public documents.'))
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [search, subjectId, page])

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    setPage(0)
    setSearch(searchInput.trim())
  }

  const handleDownload = async (doc) => {
    setBusyId(doc.id)
    try {
      await downloadDocument(doc)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Download failed.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <DashboardShell>
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0b1c30] sm:text-4xl">Public Documents</h1>
          <p className="mt-2 max-w-2xl text-base text-[#464555]">
            Browse documents shared by the community. Search by keyword or filter by subject.
          </p>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#c7c4d8]/25 bg-white p-4 shadow-sm sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label htmlFor="pub-search" className="text-sm font-bold text-[#0b1c30]">
              Search
            </label>
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#74798a]" />
              <input
                id="pub-search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Title, description, filename..."
                className="auth-input pl-10"
              />
            </div>
          </div>
          <div className="sm:w-56">
            <label htmlFor="pub-subject" className="text-sm font-bold text-[#0b1c30]">
              Subject
            </label>
            <select
              id="pub-subject"
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value)
                setPage(0)
              }}
              className="auth-input mt-2"
            >
              <option value="">All subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="h-12 rounded-xl bg-[#3525cd] px-6 text-sm font-bold text-white hover:bg-[#2d1fb0]"
          >
            Search
          </button>
        </form>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}

        <section className="mt-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#3525cd]" />
            </div>
          ) : data.content.length === 0 ? (
            <div className="rounded-2xl border border-[#c7c4d8]/25 bg-white px-6 py-16 text-center shadow-sm">
              <FileText className="mx-auto h-10 w-10 text-[#3525cd]" />
              <p className="mt-4 font-bold text-[#0b1c30]">No public documents found</p>
              <p className="mt-1 text-sm text-[#74798a]">Try another keyword or subject filter.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#c7c4d8]/25 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-[#c7c4d8]/20 bg-[#f8f9ff] text-xs font-bold uppercase tracking-wide text-[#74798a]">
                  <tr>
                    <th className="px-4 py-3">Document</th>
                    <th className="hidden px-4 py-3 md:table-cell">Subject</th>
                    <th className="hidden px-4 py-3 lg:table-cell">Size</th>
                    <th className="hidden px-4 py-3 sm:table-cell">Uploaded</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.content.map((doc) => {
                    const subject = subjectMap.get(doc.subjectId)
                    return (
                      <tr key={doc.id} className="border-b border-[#c7c4d8]/15 last:border-0">
                        <td className="px-4 py-4">
                          <p className="font-bold text-[#0b1c30]">{doc.title}</p>
                          <p className="text-xs text-[#74798a]">{doc.fileName}</p>
                        </td>
                        <td className="hidden px-4 py-4 md:table-cell">
                          {subject ? (
                            <span className="text-xs font-bold text-[#3525cd]">{subject.name}</span>
                          ) : (
                            doc.subjectName || '—'
                          )}
                        </td>
                        <td className="hidden px-4 py-4 lg:table-cell text-[#464555]">
                          {formatBytes(doc.fileSize)}
                        </td>
                        <td className="hidden px-4 py-4 sm:table-cell text-[#464555]">
                          {formatDate(doc.uploadedAt)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-1">
                            <Link
                              to={`/public-documents/${doc.id}`}
                              className="grid h-9 w-9 place-items-center rounded-lg text-[#464555] hover:bg-[#eff4ff] hover:text-[#3525cd]"
                              title="Preview"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDownload(doc)}
                              disabled={busyId === doc.id}
                              className="grid h-9 w-9 place-items-center rounded-lg text-[#464555] hover:bg-[#eff4ff] hover:text-[#3525cd] disabled:opacity-50"
                              title="Download"
                            >
                              {busyId === doc.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setReportTarget(doc)}
                              className="grid h-9 w-9 place-items-center rounded-lg text-[#464555] hover:bg-red-50 hover:text-red-600"
                              title="Report"
                            >
                              <Flag className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm font-semibold text-[#464555]">
              <span>
                Page {page + 1} of {data.totalPages} · {data.totalElements} documents
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="rounded-lg border border-[#c7c4d8]/40 px-3 py-1.5 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= data.totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-[#c7c4d8]/40 px-3 py-1.5 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <ReportDocumentModal
        open={!!reportTarget}
        documentId={reportTarget?.id}
        documentTitle={reportTarget?.title}
        onClose={() => setReportTarget(null)}
      />
    </DashboardShell>
  )
}
