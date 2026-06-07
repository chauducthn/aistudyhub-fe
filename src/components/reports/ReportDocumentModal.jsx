import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react'
import { REPORT_REASONS, submitDocumentReport } from '../../api/reportsApi'
import { getApiErrorMessage } from '../../utils/apiError'

export default function ReportDocumentModal({ open, documentId, documentTitle, onClose, onSuccess }) {
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [reasonError, setReasonError] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setReason('')
    setDescription('')
    setReasonError('')
    setError('')
    setSuccess('')
  }, [open, documentId])

  if (!open) return null

  const handleSubmit = async (event) => {
    event.preventDefault()
    setReasonError('')
    setError('')
    setSuccess('')

    if (!reason) {
      setReasonError('Please select a reason.')
      return
    }

    setSubmitting(true)
    try {
      const res = await submitDocumentReport(documentId, { reason, description })
      if (!res.success) throw new Error(res.message || 'Could not submit report.')
      setSuccess(res.message || 'Report submitted. Thank you for helping keep the library safe.')
      onSuccess?.(res.data)
      setTimeout(() => onClose?.(), 1400)
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Could not submit report.')
      if (msg.toLowerCase().includes('pending report')) {
        setError('You already have a pending report for this document.')
      } else {
        setError(msg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1c30]/40 p-4">
      <div
        className="w-full max-w-lg rounded-2xl border border-[#c7c4d8]/30 bg-white p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="report-modal-title" className="text-xl font-extrabold text-[#0b1c30]">
              Report document
            </h2>
            <p className="mt-1 text-sm text-[#464555]">
              {documentTitle ? `"${documentTitle}"` : 'Flag content that violates community guidelines.'}
            </p>
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

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          <div>
            <label htmlFor="report-reason" className="block text-sm font-bold text-[#0b1c30]">
              Reason <span className="text-red-500">*</span>
            </label>
            <select
              id="report-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (reasonError) setReasonError('')
              }}
              className={`auth-input mt-2 ${reasonError ? 'auth-input--invalid' : ''}`}
            >
              <option value="">Select a reason</option>
              {REPORT_REASONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {reasonError && <p className="mt-1 text-xs font-semibold text-red-600">{reasonError}</p>}
          </div>

          <div>
            <label htmlFor="report-description" className="block text-sm font-bold text-[#0b1c30]">
              Additional details
            </label>
            <textarea
              id="report-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="auth-input mt-2 min-h-[100px] resize-y py-3"
              placeholder="Optional context for moderators..."
              maxLength={2000}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="h-11 rounded-xl border border-[#c7c4d8]/40 px-5 text-sm font-bold text-[#464555] hover:bg-[#eff4ff] disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !!success}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#3525cd] px-5 text-sm font-bold text-white hover:bg-[#2d1fb0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit report
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
