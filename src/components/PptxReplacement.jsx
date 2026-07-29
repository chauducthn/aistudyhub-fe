import { useRef, useState } from 'react'
import {
  CheckCircle2,
  Download,
  ExternalLink,
  FileUp,
  Info,
  Loader2,
  Presentation,
} from 'lucide-react'
import { replaceDocumentFile } from '../api/documentsApi'

export default function PptxReplacement({
  documentId,
  fileName,
  onDownload,
  downloading,
  onReplaceSuccess,
}) {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [replacing, setReplacing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const chooseFile = (selected) => {
    setSuccess(false)
    setError('')
    if (!selected) return
    if (!selected.name.toLowerCase().endsWith('.pptx')) {
      setError('Please select a .pptx file.')
      return
    }
    if (selected.size > 20 * 1024 * 1024) {
      setError('The replacement PPTX must not exceed 20MB.')
      return
    }
    setFile(selected)
  }

  const replace = async () => {
    if (!file) return
    setReplacing(true)
    setError('')
    setProgress(0)
    try {
      const result = await replaceDocumentFile(documentId, file, setProgress)
      if (!result.success) throw new Error(result.message || 'Could not replace the PPTX file.')
      setSuccess(true)
      setFile(null)
      setProgress(100)
      if (inputRef.current) inputRef.current.value = ''
      await onReplaceSuccess?.()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not replace the PPTX file.')
    } finally {
      setReplacing(false)
    }
  }

  return (
    <div className="flex min-h-[620px] items-center justify-center bg-gradient-to-br from-[#f8f9ff] to-[#eef2ff] p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-[#c7c4d8]/35 bg-white p-7 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-orange-50 text-orange-600">
            <Presentation className="h-7 w-7" />
          </span>
          <div>
            <h3 className="text-xl font-extrabold text-[#0b1c30]">Edit PPTX outside the web app</h3>
            <p className="mt-2 text-sm leading-6 text-[#464555]">
              Slide layouts, themes, animations, charts, and embedded media require a presentation editor.
              Download this file, edit it in Microsoft PowerPoint, LibreOffice Impress, or another compatible
              application, then upload the updated <strong>.pptx</strong> version here.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
          <div className="flex gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#3525cd]" />
            <div className="text-sm leading-6 text-indigo-950">
              <p className="font-extrabold">The replacement keeps this document record.</p>
              <p>Title, subject, visibility, and sharing links remain unchanged. Only the PPTX file is replaced.</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onDownload}
            disabled={downloading || replacing}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[#3525cd] bg-white px-5 text-sm font-extrabold text-[#3525cd] transition hover:bg-indigo-50 disabled:opacity-50"
          >
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download original
          </button>
          <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#3525cd] px-5 text-sm font-extrabold text-white transition hover:bg-[#2d1fb0]">
            <FileUp className="h-4 w-4" />
            Choose edited PPTX
            <input
              ref={inputRef}
              type="file"
              accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              className="sr-only"
              onChange={(event) => chooseFile(event.target.files?.[0])}
            />
          </label>
        </div>

        {file && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="truncate text-sm font-bold text-[#0b1c30]">{file.name}</p>
            <p className="mt-1 text-xs text-[#74798a]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            {replacing && (
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-[#3525cd] transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}
            <button
              type="button"
              onClick={replace}
              disabled={replacing}
              className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#0b1c30] text-sm font-extrabold text-white disabled:opacity-60"
            >
              {replacing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
              Replace current file
            </button>
          </div>
        )}

        {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
        {success && (
          <p className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
            PPTX file replaced successfully.
          </p>
        )}

        <p className="mt-5 truncate text-center text-xs font-semibold text-[#74798a]">Current file: {fileName}</p>
      </div>
    </div>
  )
}
