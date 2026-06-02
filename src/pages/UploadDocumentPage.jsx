import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CloudUpload,
  FileText,
  Loader2,
  Trash2,
} from 'lucide-react'
import DashboardShell from '../components/DashboardShell'
import { listSubjects, uploadDocument } from '../api/documentsApi'
import { getApiErrorMessage } from '../utils/apiError'

const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'pptx', 'txt']
const ALLOWED_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
]
const MAX_SIZE_MB = 25
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

function getExtension(name = '') {
  const idx = name.lastIndexOf('.')
  return idx >= 0 ? name.slice(idx + 1).toLowerCase() : ''
}

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

function validateFile(file) {
  if (!file) return 'Please select a file.'
  const ext = getExtension(file.name)
  const validExt = ALLOWED_EXTENSIONS.includes(ext)
  const validMime = file.type ? ALLOWED_MIME.includes(file.type) : true
  if (!validExt || !validMime) {
    return `Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ').toUpperCase()}.`
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `File is too large. Maximum size is ${MAX_SIZE_MB} MB.`
  }
  return ''
}

export default function UploadDocumentPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [subjects, setSubjects] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

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

  const handleFile = (next) => {
    setError('')
    setSuccess('')
    if (!next) {
      setFile(null)
      setFileError('')
      return
    }
    const validation = validateFile(next)
    if (validation) {
      setFile(null)
      setFileError(validation)
      return
    }
    setFile(next)
    setFileError('')
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragOver(false)
    const dropped = event.dataTransfer.files?.[0]
    if (dropped) handleFile(dropped)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!title.trim()) return setError('Title is required.')
    if (!subjectId) return setError('Please select a subject.')
    if (!file) return setError('Please select a file to upload.')

    setUploading(true)
    setProgress(0)
    try {
      const res = await uploadDocument(
        { title: title.trim(), description: description.trim(), subjectId, file },
        setProgress,
      )
      if (!res.success) throw new Error(res.message || 'Upload failed.')
      setSuccess('Document uploaded successfully. Redirecting...')
      setTimeout(() => navigate('/documents'), 1200)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Upload failed. Please try again.'))
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    handleFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <DashboardShell>
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#464555] transition hover:text-[#3525cd]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to Dashboard
        </Link>

        <div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0b1c30] sm:text-4xl">Upload Document</h1>
            <p className="mt-2 text-base text-[#464555]">
              Add a new study document to your library. Accepted formats: PDF, DOCX, PPTX, TXT (max {MAX_SIZE_MB} MB).
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <section className="rounded-2xl border border-[#c7c4d8]/25 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-[#0b1c30]">Document Details</h2>
            <p className="text-sm text-[#74798a]">Title and subject help you and your AI assistant find the document later.</p>

            <div className="mt-6 space-y-5">
              <Field label="Title" id="title" required>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="auth-input"
                  placeholder="e.g. Neural Networks – Comprehensive Notes"
                />
              </Field>

              <Field label="Description" id="description" hint="Optional. Short summary or topic tags.">
                <textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="auth-input min-h-[110px] resize-y py-3"
                  placeholder="Describe what this document covers..."
                />
              </Field>

              <Field label="Subject" id="subject" required>
                <select
                  id="subject"
                  required
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="auth-input bg-[#eff4ff]"
                >
                  <option value="">Select a subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-[#c7c4d8]/25 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-[#0b1c30]">File</h2>
            <p className="text-sm text-[#74798a]">Drag & drop or click to browse.</p>

            <label
              htmlFor="file"
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`mt-5 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
                dragOver
                  ? 'border-[#3525cd] bg-[#eef0ff]'
                  : fileError
                    ? 'border-red-300 bg-red-50/40'
                    : 'border-[#c7c4d8]/60 bg-[#f8f9ff] hover:border-[#3525cd]/50 hover:bg-[#eef0ff]/60'
              }`}
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e8e3ff] text-[#3525cd]">
                <CloudUpload className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-bold text-[#0b1c30]">
                  Click to upload <span className="font-semibold text-[#74798a]">or drag and drop</span>
                </p>
                <p className="mt-1 text-xs font-semibold text-[#74798a]">
                  PDF, DOCX, PPTX, TXT · up to {MAX_SIZE_MB} MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                id="file"
                type="file"
                className="hidden"
                accept={ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(',')}
                onChange={(e) => handleFile(e.target.files?.[0] || null)}
              />
            </label>

            {fileError && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-600">
                <AlertCircle className="h-3.5 w-3.5" />
                {fileError}
              </p>
            )}

            {file && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#c7c4d8]/30 bg-[#f8f9ff] px-4 py-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#e8e3ff] text-[#3525cd]">
                  <FileText className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-[#0b1c30]">{file.name}</p>
                  <p className="text-xs font-semibold text-[#74798a]">
                    {formatBytes(file.size)} · {getExtension(file.name).toUpperCase()}
                  </p>
                </div>
                {!uploading && (
                  <button
                    type="button"
                    onClick={removeFile}
                    aria-label="Remove file"
                    className="grid h-9 w-9 place-items-center rounded-lg text-[#74798a] transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            {uploading && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-bold text-[#464555]">
                  <span className="inline-flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#3525cd]" />
                    Uploading...
                  </span>
                  <span className="text-[#3525cd]">{progress}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eff4ff]">
                  <div
                    className="h-full rounded-full bg-[#3525cd] transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </section>

          <div className="xl:col-span-2">
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                {success}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                to="/dashboard"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-[#c7c4d8]/40 bg-white px-6 text-sm font-bold text-[#0b1c30] transition hover:bg-[#eff4ff]"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={uploading}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#3525cd] px-6 text-sm font-bold text-white shadow-[0_10px_15px_-3px_rgba(53,37,205,0.28)] transition hover:bg-[#2d1fb0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading {progress}%
                  </>
                ) : (
                  <>
                    <CloudUpload className="h-4 w-4" />
                    Upload Document
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardShell>
  )
}

function Field({ label, id, required, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-1 text-sm font-bold text-[#0b1c30]">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-2">{children}</div>
      {hint && <p className="mt-1.5 text-xs font-medium text-[#74798a]">{hint}</p>}
    </div>
  )
}
