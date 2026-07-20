import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Pencil,
} from 'lucide-react'
import DashboardShell from '../components/DashboardShell'
import ExtractionStatusPanel from '../components/documents/ExtractionStatusPanel'
import OfficePreviewer from '../components/OfficePreviewer'
import {
  downloadDocument,
  getDocument,
  getDocumentPreview,
  listSubjects,
} from '../api/documentsApi'
import { getApiErrorMessage } from '../utils/apiError'

function formatBytes(bytes) {
  if (!bytes) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export default function DocumentDetailPage() {
  const { id } = useParams()
  const [doc, setDoc] = useState(null)
  const [preview, setPreview] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [previewLoading, setPreviewLoading] = useState(true)
  const [error, setError] = useState(null)
  const [previewError, setPreviewError] = useState('')
  const [downloading, setDownloading] = useState(false)
  useEffect(() => {
    let ignore = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const [docRes, subjectRes] = await Promise.all([getDocument(id), listSubjects()])
        if (ignore) return
        if (subjectRes.success) setSubjects(subjectRes.data)
        if (docRes.success) setDoc(docRes.data)
      } catch (err) {
        if (ignore) return
        const status = err.response?.status
        if (status === 403) {
          setError({ kind: 'forbidden', message: err.response?.data?.message || 'You do not have permission to view this document.' })
        } else if (status === 404) {
          setError({ kind: 'notfound', message: err.response?.data?.message || 'Document not found.' })
        } else {
          setError({ kind: 'error', message: getApiErrorMessage(err, 'Could not load document.') })
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    })()

    return () => {
      ignore = true
    }
  }, [id])

  useEffect(() => {
    if (!doc) return undefined
    let ignore = false
    let objectUrl = null

    ;(async () => {
      try {
        const res = await getDocumentPreview(doc)
        if (ignore) return
        if (res.success) {
          if (res.data?.type === 'pdf' || res.data?.type === 'image') objectUrl = res.data.previewUrl
          setPreview(res.data)
          setPreviewError('')
        } else {
          setPreview(res.data || null)
          setPreviewError(res.message || 'Preview is not available for this document.')
        }
      } catch (err) {
        if (ignore) return
        setPreview(null)
        const status = err.response?.status
        if (status === 404) setPreviewError('Document preview was not found.')
        else if (status === 403) setPreviewError('You do not have permission to preview this document.')
        else setPreviewError(getApiErrorMessage(err, 'Preview is not available.'))
      } finally {
        if (!ignore) setPreviewLoading(false)
      }
    })()

    return () => {
      ignore = true
      if (objectUrl) window.URL.revokeObjectURL(objectUrl)
    }
  }, [doc])

  const subject = useMemo(
    () => subjects.find((s) => s.id === doc?.subjectId),
    [subjects, doc?.subjectId],
  )

  const handleDownload = async () => {
    if (!doc) return
    setDownloading(true)
    try {
      await downloadDocument(doc)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <DashboardShell>
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/documents"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#464555] transition hover:text-[#3525cd]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to My Documents
        </Link>

        {loading ? (
          <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
            <div className="h-[620px] animate-pulse rounded-2xl bg-white shadow-sm" />
            <div className="h-[420px] animate-pulse rounded-2xl bg-white shadow-sm" />
          </div>
        ) : error ? (
          <ErrorState error={error} />
        ) : doc ? (
          <>
            <div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <VisibilityPill visibility={doc.status} />
                  {subject && <SubjectBadge subject={subject} />}
                </div>
                <h1 className="mt-3 text-3xl font-extrabold text-[#0b1c30] sm:text-4xl">
                  {doc.title}
                </h1>
                <p className="mt-2 max-w-3xl text-base leading-7 text-[#464555]">
                  {doc.description || 'No description provided.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/documents/${doc.id}/edit`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#c7c4d8]/40 bg-white px-5 text-sm font-bold text-[#0b1c30] transition hover:bg-[#eff4ff]"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#3525cd] px-5 text-sm font-bold text-white shadow-[0_10px_15px_-3px_rgba(53,37,205,0.28)] transition hover:bg-[#2d1fb0] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Download
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
              <section className="overflow-hidden rounded-2xl border border-[#c7c4d8]/25 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-[#c7c4d8]/20 px-6 py-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#0b1c30]">Preview</h2>
                    <p className="text-sm text-[#74798a]">
                      PDF and TXT files can be previewed directly when supported.
                    </p>
                  </div>
                </div>
                <PreviewPane
                  doc={doc}
                  preview={preview}
                  loading={previewLoading}
                  error={previewError}
                  onDownload={handleDownload}
                  downloading={downloading}
                />
              </section>

              <aside className="space-y-4">
                <ExtractionStatusPanel doc={doc} />

                <section className="rounded-2xl border border-[#c7c4d8]/25 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-extrabold text-[#0b1c30]">Document Info</h2>
                  <dl className="mt-5 space-y-4 text-sm">
                    <InfoRow label="File name" value={doc.fileName} />
                    <InfoRow label="Type" value={doc.fileType?.toUpperCase()} />
                    <InfoRow label="Size" value={formatBytes(doc.fileSize)} />
                    <InfoRow label="Uploaded" value={formatDate(doc.uploadedAt)} />
                    <InfoRow label="Owner" value={doc.owner?.fullName || 'You'} />
                    <InfoRow label="Owner email" value={doc.owner?.email || '—'} />
                  </dl>
                </section>

                <section className="rounded-2xl border border-[#c7c4d8]/25 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-extrabold text-[#0b1c30]">Fallback</h2>
                  <p className="mt-2 text-sm leading-6 text-[#464555]">
                    If the preview fails or this file type is not supported, download the original file to view it locally.
                  </p>
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={downloading}
                    className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#3525cd] text-sm font-bold text-white transition hover:bg-[#2d1fb0] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Download File
                  </button>
                </section>
              </aside>
            </div>
          </>
        ) : null}
      </div>
    </DashboardShell>
  )
}

function PreviewPane({ doc, preview, loading, error, onDownload, downloading }) {
  if (loading) {
    return (
      <div className="grid h-[620px] place-items-center bg-[#f8f9ff]">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#3525cd]" />
          <p className="mt-3 text-sm font-semibold text-[#74798a]">Preparing preview...</p>
        </div>
      </div>
    )
  }

  if (preview?.type === 'pdf' && preview.previewUrl) {
    return (
      <div className="h-[620px] bg-[#f8f9ff]">
        <iframe
          title={doc.title}
          src={preview.previewUrl}
          className="h-full w-full border-0"
        />
      </div>
    )
  }

  if ((preview?.type === 'docx' || preview?.type === 'xlsx') && preview.previewUrl) {
    return (
      <OfficePreviewer
        previewUrl={preview.previewUrl}
        blob={preview.blob}
        type={preview.type}
        fileName={doc.originalFilename || doc.title}
        fallbackText={preview.fallbackText}
      />
    )
  }

  if (preview?.type === 'office' && preview.previewUrl) {
    return (
      <div className="h-[620px] bg-[#f8f9ff]">
        <iframe
          title={doc.title}
          src={preview.previewUrl}
          className="h-full w-full border-0"
        />
      </div>
    )
  }

  if (preview?.type === 'image' && preview.previewUrl) {
    return (
      <div className="grid h-[620px] place-items-center overflow-auto bg-[#0b1c30] p-4">
        <img
          src={preview.previewUrl}
          alt={doc.title}
          className="max-h-full max-w-full object-contain"
        />
      </div>
    )
  }

  if (preview?.type === 'text') {
    return (
      <div className="h-[620px] overflow-auto bg-[#0b1c30] p-6 text-sm leading-7 text-slate-100">
        <pre className="whitespace-pre-wrap font-mono">{preview.textContent}</pre>
        {preview.truncated && (
          <p className="mt-4 border-t border-slate-600 pt-3 text-xs font-semibold text-slate-400">
            Preview truncated. Download the file to view the full content.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="grid min-h-[420px] place-items-center bg-[#f8f9ff] px-6 py-12 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-600">
          <FileText className="h-7 w-7" />
        </span>
        <h3 className="mt-5 text-xl font-extrabold text-[#0b1c30]">Preview unavailable</h3>
        <p className="mt-2 text-sm leading-6 text-[#464555]">
          {error || `Inline preview is not available for ${doc.fileType?.toUpperCase()} files.`}
        </p>
        <button
          type="button"
          onClick={onDownload}
          disabled={downloading}
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#3525cd] px-5 text-sm font-bold text-white transition hover:bg-[#2d1fb0] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download instead
        </button>
      </div>
    </div>
  )
}

function ErrorState({ error }) {
  const iconClass = error.kind === 'forbidden' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
  return (
    <div className="mt-8 grid place-items-center rounded-2xl border border-[#c7c4d8]/25 bg-white px-6 py-16 text-center shadow-sm">
      <span className={`grid h-14 w-14 place-items-center rounded-2xl ${iconClass}`}>
        <AlertTriangle className="h-7 w-7" />
      </span>
      <h2 className="mt-5 text-xl font-extrabold text-[#0b1c30]">
        {error.kind === 'notfound' ? 'Document not found' : error.kind === 'forbidden' ? 'Access denied' : 'Could not load document'}
      </h2>
      <p className="mt-2 max-w-md text-sm text-[#464555]">{error.message}</p>
      <Link
        to="/documents"
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#3525cd] px-5 text-sm font-bold text-white transition hover:bg-[#2d1fb0]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Documents
      </Link>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="border-b border-[#c7c4d8]/20 pb-3 last:border-b-0 last:pb-0">
      <dt className="text-xs font-bold uppercase tracking-wide text-[#74798a]">{label}</dt>
      <dd className="mt-1 break-words font-semibold text-[#0b1c30]">{value || '—'}</dd>
    </div>
  )
}

function SubjectBadge({ subject }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#dce9ff] px-2 py-1 text-xs font-bold text-[#3525cd]">
      {subject.name}
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
