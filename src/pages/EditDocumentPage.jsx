import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Lock,
  ShieldAlert,
} from 'lucide-react'
import DashboardShell from '../components/DashboardShell'
import DocumentEditForm from '../components/documents/DocumentEditForm'
import { getDocument, listSubjects, updateDocument } from '../api/documentsApi'
import { getApiErrorMessage } from '../utils/apiError'

export default function EditDocumentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [doc, setDoc] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let ignore = false
    ;(async () => {
      setLoading(true)
      setLoadError(null)
      try {
        const [docRes, subjRes] = await Promise.all([getDocument(id), listSubjects()])
        if (ignore) return
        if (subjRes.success) setSubjects(subjRes.data)
        if (docRes.success) setDoc(docRes.data)
      } catch (err) {
        if (ignore) return
        const status = err.response?.status
        if (status === 403) {
          setLoadError({ kind: 'forbidden', message: err.response?.data?.message || 'You do not have permission to edit this document.' })
        } else if (status === 404) {
          setLoadError({ kind: 'notfound', message: err.response?.data?.message || 'Document not found.' })
        } else {
          setLoadError({ kind: 'error', message: getApiErrorMessage(err, 'Could not load document.') })
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    })()
    return () => {
      ignore = true
    }
  }, [id])

  const handleSave = async (payload) => {
    setSaving(true)
    setSubmitError('')
    setSuccess('')
    try {
      const res = await updateDocument(id, payload)
      if (!res.success) throw new Error(res.message || 'Could not update document.')
      setDoc(res.data)
      setSuccess('Changes saved. Redirecting to your library...')
      setTimeout(() => navigate('/documents'), 900)
    } catch (err) {
      const status = err.response?.status
      if (status === 403) {
        setSubmitError(err.response?.data?.message || 'You do not have permission to edit this document.')
      } else if (status === 404) {
        setSubmitError('This document no longer exists.')
      } else {
        setSubmitError(getApiErrorMessage(err, 'Could not update document.'))
      }
    } finally {
      setSaving(false)
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

        <h1 className="mt-3 text-3xl font-extrabold text-[#0b1c30] sm:text-4xl">Edit Document</h1>
        <p className="mt-2 text-base text-[#464555]">
          Update title, description, subject or visibility for this document.
        </p>

        {loading ? (
          <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <div className="h-[420px] animate-pulse rounded-2xl bg-white shadow-sm" />
            <div className="h-[260px] animate-pulse rounded-2xl bg-white shadow-sm" />
          </div>
        ) : loadError ? (
          <ErrorState error={loadError} />
        ) : doc ? (
          <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <section className="rounded-2xl border border-[#c7c4d8]/25 bg-white p-6 shadow-sm">
              {submitError && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  <AlertTriangle className="h-4 w-4" />
                  {submitError}
                </div>
              )}
              {success && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  {success}
                </div>
              )}

              <DocumentEditForm
                key={doc.id}
                doc={doc}
                subjects={subjects}
                saving={saving}
                submitLabel={saving ? 'Saving...' : 'Save Changes'}
                onSubmit={handleSave}
                onCancel={() => navigate('/documents')}
                layout="page"
              />
            </section>

            <aside className="rounded-2xl border border-[#c7c4d8]/25 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-extrabold text-[#0b1c30]">File Info</h2>
              <p className="text-sm text-[#74798a]">Read-only metadata.</p>

              <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#f8f9ff] px-4 py-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#e8e3ff] text-[#3525cd]">
                  <FileText className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#0b1c30]">{doc.fileName}</p>
                  <p className="text-xs font-semibold text-[#74798a]">
                    {(doc.fileSize / 1024 / 1024).toFixed(2)} MB · {doc.fileType?.toUpperCase()}
                  </p>
                </div>
              </div>

              <dl className="mt-4 space-y-3 text-sm">
                <Row label="Status">
                  <span className={statusBadge(doc.status)}>{doc.status}</span>
                </Row>
                <Row label="Uploaded">
                  <span className="font-semibold text-[#0b1c30]">
                    {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                      .format(new Date(doc.uploadedAt))}
                  </span>
                </Row>
                <Row label="Document ID">
                  <span className="font-mono text-xs text-[#464555]">{doc.id}</span>
                </Row>
              </dl>

              <p className="mt-6 rounded-xl bg-[#eff4ff] px-4 py-3 text-xs font-semibold text-[#464555]">
                Need to replace the file? Remove this document, then upload a new version from the
                Upload page.
              </p>
            </aside>
          </div>
        ) : null}
      </div>
    </DashboardShell>
  )
}

function ErrorState({ error }) {
  if (error.kind === 'forbidden') {
    return (
      <EmptyShell
        icon={ShieldAlert}
        iconClass="bg-amber-50 text-amber-600"
        title="Access denied"
        description={error.message}
        cta={{ to: '/documents', label: 'Back to My Documents' }}
      />
    )
  }
  if (error.kind === 'notfound') {
    return (
      <EmptyShell
        icon={Lock}
        iconClass="bg-slate-100 text-slate-600"
        title="Document not found"
        description={error.message}
        cta={{ to: '/documents', label: 'Back to My Documents' }}
      />
    )
  }
  return (
    <EmptyShell
      icon={AlertTriangle}
      iconClass="bg-red-50 text-red-600"
      title="Could not load document"
      description={error.message}
      cta={{ to: '/documents', label: 'Back to My Documents' }}
    />
  )
}

function EmptyShell({ icon: Icon, iconClass, title, description, cta }) {
  return (
    <div className="mt-8 grid place-items-center rounded-2xl border border-[#c7c4d8]/25 bg-white px-6 py-16 text-center shadow-sm">
      <span className={`grid h-14 w-14 place-items-center rounded-2xl ${iconClass}`}>
        <Icon className="h-7 w-7" aria-hidden />
      </span>
      <h2 className="mt-5 text-xl font-extrabold text-[#0b1c30]">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-[#464555]">{description}</p>
      <Link
        to={cta.to}
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#3525cd] px-5 text-sm font-bold text-white transition hover:bg-[#2d1fb0]"
      >
        <ArrowLeft className="h-4 w-4" />
        {cta.label}
      </Link>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-xs font-bold uppercase tracking-wide text-[#74798a]">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  )
}

function statusBadge(status) {
  const map = {
    APPROVED: 'bg-emerald-50 text-emerald-700',
    PENDING: 'bg-amber-50 text-amber-700',
    REJECTED: 'bg-red-50 text-red-700',
  }
  return `rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${
    map[status] || 'bg-slate-100 text-slate-600'
  }`
}
