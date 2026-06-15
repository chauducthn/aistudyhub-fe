import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Download, Flag, Loader2 } from 'lucide-react'
import DashboardShell from '../components/DashboardShell'
import ExtractionStatusPanel from '../components/documents/ExtractionStatusPanel'
import ReportDocumentModal from '../components/reports/ReportDocumentModal'
import {
  downloadDocument,
  getPublicDocument,
  getPublicDocumentPreview,
} from '../api/documentsApi'
import { getApiErrorMessage } from '../utils/apiError'

export default function PublicDocumentDetailPage() {
  const { id } = useParams()
  const [doc, setDoc] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [previewLoading, setPreviewLoading] = useState(true)
  const [error, setError] = useState(null)
  const [previewError, setPreviewError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)

  useEffect(() => {
    let ignore = false

    getPublicDocument(id)
      .then((res) => {
        if (ignore) return
        if (res.success) {
          setDoc(res.data)
          setError(null)
        } else {
          setError(res.message || 'Could not load document.')
        }
      })
      .catch((err) => {
        if (ignore) return
        setError(getApiErrorMessage(err, 'Could not load document.'))
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    getPublicDocumentPreview(id)
      .then((res) => {
        if (ignore) return
        if (res.success) {
          setPreview(res.data)
          setPreviewError('')
        } else {
          setPreview(null)
          setPreviewError(res.message || 'Preview not available.')
        }
      })
      .catch((err) => {
        if (!ignore) setPreviewError(getApiErrorMessage(err, 'Preview not available.'))
      })
      .finally(() => {
        if (!ignore) setPreviewLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [id])

  const handleDownload = async () => {
    if (!doc) return
    setDownloading(true)
    try {
      await downloadDocument(doc)
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <DashboardShell>
        <div className="grid place-items-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[#3525cd]" />
        </div>
      </DashboardShell>
    )
  }

  if (error || !doc) {
    return (
      <DashboardShell>
        <div className="px-4 py-8 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-red-500" />
          <p className="mt-4 font-bold text-[#0b1c30]">{error || 'Document not found'}</p>
          <Link to="/public-documents" className="mt-4 inline-block text-sm font-bold text-[#3525cd]">
            Back to Public Documents
          </Link>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/public-documents"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#464555] hover:text-[#3525cd]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Public Documents
        </Link>

        <div className="mt-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0b1c30]">{doc.title}</h1>
            <p className="mt-2 text-sm text-[#74798a]">{doc.fileName}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-bold text-red-700 hover:bg-red-100"
            >
              <Flag className="h-4 w-4" />
              Report
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#3525cd] px-5 text-sm font-bold text-white hover:bg-[#2d1fb0] disabled:opacity-60"
            >
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download
            </button>
          </div>
        </div>

        <div className="mt-6 max-w-xl">
          <ExtractionStatusPanel doc={doc} />
        </div>

        <section className="mt-8 overflow-hidden rounded-2xl border border-[#c7c4d8]/25 bg-white shadow-sm">
          {previewLoading ? (
            <div className="grid h-[520px] place-items-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#3525cd]" />
            </div>
          ) : preview?.type === 'pdf' && preview.previewUrl ? (
            <iframe title={doc.title} src={preview.previewUrl} className="h-[620px] w-full border-0" />
          ) : preview?.type === 'text' ? (
            <div className="max-h-[620px] overflow-auto bg-[#0b1c30] p-6 font-mono text-sm text-slate-100">
              <pre className="whitespace-pre-wrap">{preview.textContent}</pre>
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <p className="text-sm text-[#464555]">{previewError}</p>
              <button
                type="button"
                onClick={handleDownload}
                className="mt-4 text-sm font-bold text-[#3525cd] hover:underline"
              >
                Download file instead
              </button>
            </div>
          )}
        </section>
      </div>

      <ReportDocumentModal
        open={reportOpen}
        documentId={doc.id}
        documentTitle={doc.title}
        onClose={() => setReportOpen(false)}
      />
    </DashboardShell>
  )
}
