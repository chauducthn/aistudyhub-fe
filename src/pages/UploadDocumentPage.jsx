import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CloudUpload,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import DashboardShell from '../components/DashboardShell'
import ExtractionStatusPanel from '../components/documents/ExtractionStatusPanel'
import { listSubjects, uploadDocuments } from '../api/documentsApi'
import { createSubject } from '../api/subjectsApi'
import { extractionStatusMeta } from '../utils/extractionStatus'
import { getApiErrorMessage } from '../utils/apiError'

const ALLOWED_EXTENSIONS = [
  'pdf',
  'doc',
  'docx',
  'ppt',
  'pptx',
  'txt',
  'rtf',
  'md',
  'xls',
  'xlsx',
  'csv',
]
const MAX_SIZE_MB = 20
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024
const MAX_FILES = 10
const EMPTY_UPLOAD_PROGRESS = {
  files: [],
  transferProgress: 0,
  uploadedCount: 0,
  failedCount: 0,
  savingCount: 0,
  totalCount: 0,
}

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

function fileKey(file) {
  return `${file.name}:${file.size}:${file.lastModified}`
}

function validateFile(file) {
  if (!file) return 'Please select a file.'
  if (file.webkitRelativePath || file.name.includes('/') || file.name.includes('\\')) {
    return 'Folders cannot be uploaded. Select individual files only.'
  }
  const ext = getExtension(file.name)
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ').toUpperCase()}.`
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `File is too large. Maximum size is ${MAX_SIZE_MB} MB.`
  }
  return ''
}

function getFilesFromDrop(event) {
  const items = Array.from(event.dataTransfer.items || [])
  const hasDirectory = items.some((item) => {
    const entry = item.webkitGetAsEntry?.()
    return entry?.isDirectory
  })
  if (hasDirectory) {
    return { files: [], error: 'Folders cannot be uploaded. Select individual files only.' }
  }
  return { files: Array.from(event.dataTransfer.files || []), error: '' }
}

export default function UploadDocumentPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [subjects, setSubjects] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [files, setFiles] = useState([])
  const [fileOverrides, setFileOverrides] = useState({})
  const [fileError, setFileError] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploadedDocs, setUploadedDocs] = useState([])
  const [uploadProgress, setUploadProgress] = useState(EMPTY_UPLOAD_PROGRESS)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [creatingSubject, setCreatingSubject] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState('')
  const [subjectError, setSubjectError] = useState('')
  const [savingSubject, setSavingSubject] = useState(false)

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

  const handleCreateSubject = async () => {
    const name = newSubjectName.trim()
    if (!name) {
      setSubjectError('Subject name is required.')
      return
    }
    setSavingSubject(true)
    setSubjectError('')
    try {
      const res = await createSubject({ name })
      if (!res.success) throw new Error(res.message)
      setSubjects((cur) => [...cur, res.data])
      setSubjectId(String(res.data.id))
      setNewSubjectName('')
      setCreatingSubject(false)
    } catch (err) {
      setSubjectError(getApiErrorMessage(err, 'Could not create subject.'))
    } finally {
      setSavingSubject(false)
    }
  }

  const handleFiles = (nextFiles) => {
    setError('')
    setSuccess('')
    setUploadedDocs([])
    setUploadProgress(EMPTY_UPLOAD_PROGRESS)

    const incoming = Array.from(nextFiles || [])
    if (incoming.length === 0) {
      return
    }

    const newFiles = incoming.filter(
      (newFile) => !files.some((oldFile) => oldFile.name === newFile.name && oldFile.size === newFile.size)
    )

    if (newFiles.length === 0) {
      return
    }

    const combined = [...files, ...newFiles]

    if (combined.length > MAX_FILES) {
      setFileError(`You can upload up to ${MAX_FILES} files in total.`)
      return
    }

    const validation = newFiles.map(validateFile).find(Boolean)
    if (validation) {
      setFileError(validation)
      return
    }
    setFiles(combined)
    setFileError('')
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragOver(false)
    const dropped = getFilesFromDrop(event)
    if (dropped.error) {
      setFiles([])
      setFileOverrides({})
      setFileError(dropped.error)
      return
    }
    handleFiles(dropped.files)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (files.length === 1 && title.trim().length > 255) {
      return setError('Title must not exceed 255 characters.')
    }
    if (files.length === 0) return setError('Please select at least one file to upload.')

    setUploading(true)
    setUploadProgress({ ...EMPTY_UPLOAD_PROGRESS, totalCount: files.length })
    const submittedFiles = files
    const submittedOverrides = fileOverrides
    try {
      const res = await uploadDocuments(
        {
          title: files.length === 1 ? title.trim() : '',
          description: description.trim(),
          subjectId,
          files,
          fileMetadata: files.map((file) => fileOverrides[fileKey(file)] || {}),
        },
        setUploadProgress,
      )
      setUploadedDocs(res.data || [])
      const uploadedCount = res.data?.length || 0
      const extractionLabel = uploadedCount === 1 ? extractionStatusMeta(res.data?.[0]?.extractionStatus).label : null
      if (uploadedCount > 0) {
        setSuccess(
          uploadedCount === 1
            ? `Document stored successfully. AI text status: ${extractionLabel}.`
            : `${uploadedCount} documents stored successfully. AI processing continues in the background.`,
        )
      }

      if (res.failures?.length) {
        const failedNames = res.failures.map((failure) => failure.fileName).join(', ')
        setError(`${res.failures.length} document(s) failed: ${failedNames}. You can retry the remaining files.`)
        const failedFiles = res.failures.map((failure) => submittedFiles[failure.index]).filter(Boolean)
        const failedKeys = new Set(failedFiles.map(fileKey))
        setFiles(failedFiles)
        setFileOverrides(Object.fromEntries(
          Object.entries(submittedOverrides).filter(([key]) => failedKeys.has(key)),
        ))
        setUploadProgress(EMPTY_UPLOAD_PROGRESS)
      } else {
        setTimeout(() => navigate('/documents'), 2800)
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Upload failed. Please try again.'))
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (file) => {
    const key = fileKey(file)
    const nextFiles = files.filter((item) => fileKey(item) !== key)
    setFiles(nextFiles)
    setFileOverrides((current) => {
      const next = { ...current }
      delete next[key]
      return next
    })
    setUploadedDocs([])
    setFileError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const clearFiles = () => {
    setFiles([])
    setFileOverrides({})
    setFileError('')
    setError('')
    setSuccess('')
    setUploadedDocs([])
    setUploadProgress(EMPTY_UPLOAD_PROGRESS)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const customizeFile = (file) => {
    const key = fileKey(file)
    setFileOverrides((current) => ({
      ...current,
      [key]: { description, subjectId },
    }))
  }

  const updateFileOverride = (file, field, value) => {
    const key = fileKey(file)
    setFileOverrides((current) => ({
      ...current,
      [key]: { ...current[key], [field]: value },
    }))
  }

  const resetFileOverride = (file) => {
    const key = fileKey(file)
    setFileOverrides((current) => {
      const next = { ...current }
      delete next[key]
      return next
    })
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
              Add study documents to your library. Accepted formats: PDF, Word, PowerPoint, Excel, TXT, Markdown, CSV (max {MAX_SIZE_MB} MB each).
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <section className="rounded-2xl border border-[#c7c4d8]/25 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-[#0b1c30]">
              {files.length > 1 ? 'Default Document Details' : 'Document Details'}
            </h2>
            <p className="text-sm text-[#74798a]">
              {files.length > 1
                ? 'These defaults apply to every file unless you customize that file below.'
                : 'Title and subject help you and your AI assistant find the document later.'}
            </p>

            <div className="mt-6 space-y-5">
              <Field
                label="Title"
                id="title"
                hint={files.length > 1
                  ? 'Multiple files selected. Each document will use its original file name.'
                  : 'Optional. The file name is used when this is blank.'}
              >
                <input
                  id="title"
                  type="text"
                  value={files.length > 1 ? '' : title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="auth-input"
                  placeholder={files.length > 1
                    ? 'Titles are generated from each file name'
                    : 'e.g. Neural Networks Comprehensive Notes'}
                  disabled={files.length > 1}
                />
              </Field>

              <Field
                label="Description"
                id="description"
                hint={files.length > 1
                  ? 'Optional default. You can override it for each selected file.'
                  : 'Optional. Short summary or topic tags.'}
              >
                <textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                  className="auth-input min-h-[110px] resize-y py-3"
                  placeholder="Describe what this document covers..."
                />
              </Field>

              <Field
                label="Subject"
                id="subject"
                hint={files.length > 1
                  ? 'Optional default. Each file can use a different subject.'
                  : 'Optional. Leave blank for uncategorized.'}
              >
                {creatingSubject ? (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSubjectName}
                        onChange={(e) => {
                          setNewSubjectName(e.target.value)
                          if (subjectError) setSubjectError('')
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleCreateSubject()
                          }
                        }}
                        maxLength={120}
                        placeholder="New subject name"
                        className="auth-input flex-1"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleCreateSubject}
                        disabled={savingSubject}
                        className="inline-flex h-12 shrink-0 items-center gap-1.5 rounded-xl bg-[#3525cd] px-4 text-sm font-bold text-white transition hover:bg-[#2d1fb0] disabled:opacity-60"
                      >
                        {savingSubject ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCreatingSubject(false)
                          setNewSubjectName('')
                          setSubjectError('')
                        }}
                        aria-label="Cancel"
                        className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[#c7c4d8]/40 text-[#74798a] transition hover:bg-[#eff4ff]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    {subjectError && (
                      <p className="mt-1.5 text-xs font-semibold text-red-600">{subjectError}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <select
                      id="subject"
                      value={subjectId}
                      onChange={(e) => setSubjectId(e.target.value)}
                      className="auth-input flex-1 bg-[#eff4ff]"
                    >
                      <option value="">Uncategorized</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setCreatingSubject(true)}
                      className="inline-flex h-12 shrink-0 items-center gap-1.5 rounded-xl border border-[#3525cd]/30 bg-white px-4 text-sm font-bold text-[#3525cd] transition hover:bg-[#eff4ff]"
                    >
                      <Plus className="h-4 w-4" />
                      New
                    </button>
                  </div>
                )}
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-[#c7c4d8]/25 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-[#0b1c30]">Files</h2>
            <p className="text-sm text-[#74798a]">Drag & drop or click to browse up to {MAX_FILES} files.</p>

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
                  PDF, Word, PowerPoint, Excel, TXT, MD, CSV · up to {MAX_SIZE_MB} MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                id="file"
                type="file"
                className="hidden"
                multiple
                accept={ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(',')}
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>
            {fileError && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-600">
                <AlertCircle className="h-3.5 w-3.5" />
                {fileError}
              </p>
            )}

            {files.length > 0 && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#464555]">
                  <span>Selected Files ({files.length})</span>
                  {!uploading && (
                    <button type="button" onClick={clearFiles} className="text-[#3525cd] hover:underline">
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-[34rem] space-y-2 overflow-y-auto pr-1">
                  {files.map((f, index) => {
                    const fileProgress = uploadProgress.files[index]
                    const override = fileOverrides[fileKey(f)]
                    return (
                      <div
                        key={fileKey(f)}
                        className={`rounded-xl border px-4 py-3 ${
                          override
                            ? 'border-[#3525cd]/35 bg-[#f4f2ff]'
                            : 'border-[#c7c4d8]/30 bg-[#f8f9ff]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#e8e3ff] text-[#3525cd]">
                            <FileText className="h-5 w-5" aria-hidden />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-[#0b1c30]" title={f.name}>{f.name}</p>
                            <p className="text-xs font-semibold text-[#74798a]">
                              {formatBytes(f.size)} · {getExtension(f.name).toUpperCase()}
                              {override ? ' · Custom details' : ' · Using defaults'}
                            </p>
                            {fileProgress && <FileUploadStatus state={fileProgress} />}
                          </div>
                          {!uploading && (files.length > 1 || override) && (
                            <button
                              type="button"
                              onClick={() => override ? resetFileOverride(f) : customizeFile(f)}
                              aria-label={override ? `Use defaults for ${f.name}` : `Customize ${f.name}`}
                              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-bold text-[#3525cd] transition hover:bg-[#e8e3ff]"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              {override ? 'Use defaults' : 'Customize'}
                            </button>
                          )}
                          {!uploading && (
                            <button
                              type="button"
                              onClick={() => removeFile(f)}
                              aria-label={`Remove ${f.name}`}
                              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#74798a] transition hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        {override && !uploading && (
                          <div className="mt-3 grid gap-3 border-t border-[#3525cd]/15 pt-3">
                            <div>
                              <label
                                htmlFor={`file-subject-${index}`}
                                className="text-xs font-bold text-[#0b1c30]"
                              >
                                Subject for this file
                              </label>
                              <select
                                id={`file-subject-${index}`}
                                value={override.subjectId}
                                onChange={(event) => updateFileOverride(f, 'subjectId', event.target.value)}
                                className="auth-input mt-1.5 h-10 bg-white py-0 text-sm"
                              >
                                <option value="">Uncategorized</option>
                                {subjects.map((subject) => (
                                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label
                                htmlFor={`file-description-${index}`}
                                className="text-xs font-bold text-[#0b1c30]"
                              >
                                Description for this file
                              </label>
                              <textarea
                                id={`file-description-${index}`}
                                rows={3}
                                maxLength={1000}
                                value={override.description}
                                onChange={(event) => updateFileOverride(f, 'description', event.target.value)}
                                className="auth-input mt-1.5 min-h-20 resize-y bg-white py-2 text-sm"
                                placeholder="Optional description for this document..."
                              />
                              <p className="mt-1 text-right text-[11px] font-semibold text-[#74798a]">
                                {override.description.length}/1000
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {uploading && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-bold text-[#464555]">
                  <span className="inline-flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#3525cd]" />
                    {uploadProgress.transferProgress < 100
                      ? 'Sending data to server...'
                      : uploadProgress.savingCount > 0
                        ? 'Saving to storage...'
                        : 'Finalizing uploads...'}
                  </span>
                  <span className="text-[#3525cd]">
                    {uploadProgress.transferProgress}% sent · {uploadProgress.uploadedCount}/{uploadProgress.totalCount} stored
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eff4ff]">
                  <div
                    className="h-full rounded-full bg-[#3525cd] transition-all duration-200"
                    style={{ width: `${uploadProgress.transferProgress}%` }}
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
            {uploadedDocs.length === 1 && (
              <div className="mb-4">
                <ExtractionStatusPanel doc={uploadedDocs[0]} compact />
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
                    Uploading {uploadProgress.uploadedCount}/{uploadProgress.totalCount || files.length}
                  </>
                ) : (
                  <>
                    <CloudUpload className="h-4 w-4" />
                    Upload {files.length > 1 ? 'Documents' : 'Document'}
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

function FileUploadStatus({ state }) {
  const meta = {
    queued: { label: 'Queued', className: 'text-[#74798a]' },
    uploading: { label: `Sending ${state.progress}%`, className: 'text-[#3525cd]' },
    saving: { label: 'Sent · saving to storage', className: 'text-amber-700' },
    uploaded: { label: 'Stored successfully', className: 'text-emerald-700' },
    failed: { label: state.error || 'Upload failed', className: 'text-red-600' },
  }[state.status] || { label: state.status, className: 'text-[#74798a]' }

  return (
    <div className="mt-1.5">
      <p className={`text-xs font-bold ${meta.className}`}>{meta.label}</p>
      {(state.status === 'uploading' || state.status === 'saving') && (
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-[#e3e5f2]">
          <div
            className="h-full rounded-full bg-[#3525cd] transition-all duration-200"
            style={{ width: `${state.progress}%` }}
          />
        </div>
      )}
    </div>
  )
}
