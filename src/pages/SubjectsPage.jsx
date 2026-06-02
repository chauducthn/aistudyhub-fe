import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  FolderOpen,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import DashboardShell from '../components/DashboardShell'
import {
  createSubject,
  deleteSubject,
  listSubjects,
  updateSubject,
} from '../api/subjectsApi'
import { getApiErrorMessage } from '../utils/apiError'

const SUBJECT_COLORS = [
  '#3525cd',
  '#10b3a8',
  '#a78bfa',
  '#57dffe',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#22c55e',
]

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [deletingTarget, setDeletingTarget] = useState(null)

  useEffect(() => {
    let ignore = false
    setLoading(true)
    setError('')
    listSubjects({ search })
      .then((res) => {
        if (ignore) return
        if (!res.success) throw new Error(res.message || 'Could not load subjects.')
        setSubjects(res.data)
      })
      .catch((err) => {
        if (!ignore) setError(getApiErrorMessage(err, 'Could not load subjects.'))
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [search])

  const refresh = async () => {
    const res = await listSubjects({ search })
    if (res.success) setSubjects(res.data)
  }

  const totalDocs = useMemo(
    () => subjects.reduce((sum, s) => sum + (s.documentCount || 0), 0),
    [subjects],
  )

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    setSearch(searchInput.trim())
  }

  const handleCreate = async (payload) => {
    setBusyId('create')
    setError('')
    try {
      const res = await createSubject(payload)
      if (!res.success) throw new Error(res.message)
      setMessage(`Subject "${res.data.name}" created.`)
      setCreating(false)
      await refresh()
    } catch (err) {
      throw err
    } finally {
      setBusyId(null)
    }
  }

  const handleUpdate = async (payload) => {
    if (!editing) return
    setBusyId(editing.id)
    setError('')
    try {
      const res = await updateSubject(editing.id, payload)
      if (!res.success) throw new Error(res.message)
      setMessage(`Subject "${res.data.name}" updated.`)
      setEditing(null)
      await refresh()
    } catch (err) {
      throw err
    } finally {
      setBusyId(null)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingTarget) return
    setBusyId(deletingTarget.id)
    setError('')
    try {
      const res = await deleteSubject(deletingTarget.id)
      if (!res.success) throw new Error(res.message)
      setMessage(`Subject "${deletingTarget.name}" deleted.`)
      setDeletingTarget(null)
      await refresh()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not delete subject.'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <DashboardShell>
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0b1c30] sm:text-4xl">Subject Management</h1>
            <p className="mt-2 text-base text-[#464555]">
              {loading
                ? 'Loading...'
                : `${subjects.length} subject${subjects.length === 1 ? '' : 's'} · ${totalDocs} document${totalDocs === 1 ? '' : 's'} total.`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#3525cd] px-6 text-sm font-bold text-white shadow-[0_10px_15px_-3px_rgba(53,37,205,0.28)] transition hover:bg-[#2d1fb0]"
          >
            <Plus className="h-4 w-4" />
            New Subject
          </button>
        </div>

        <section className="mt-6 rounded-2xl border border-[#c7c4d8]/25 bg-white p-4 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#74798a]" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search subjects by name, code, or description..."
                className="auth-input pl-10"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-[#3525cd] px-5 text-sm font-bold text-white transition hover:bg-[#2d1fb0]"
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('')
                  setSearch('')
                }}
                aria-label="Reset search"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-[#c7c4d8]/40 bg-white px-3 text-sm font-bold text-[#464555] transition hover:bg-[#eff4ff]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
        </section>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            <AlertTriangle className="h-4 w-4" />
            {error}
            <button
              type="button"
              onClick={() => setError('')}
              className="ml-auto text-red-700/70 hover:text-red-700"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
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

        <section className="mt-4">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="h-44 animate-pulse rounded-2xl bg-white shadow-sm" />
              ))}
            </div>
          ) : subjects.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-[#c7c4d8]/25 bg-white px-6 py-16 text-center shadow-sm">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#eef0ff] text-[#3525cd]">
                <FolderOpen className="h-7 w-7" />
              </span>
              <h2 className="mt-5 text-xl font-extrabold text-[#0b1c30]">
                {search ? 'No matching subjects' : 'No subjects yet'}
              </h2>
              <p className="mt-2 max-w-md text-sm text-[#464555]">
                {search
                  ? 'Try a different keyword or clear the search.'
                  : 'Create your first subject to start organizing your documents.'}
              </p>
              {search ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('')
                    setSearch('')
                  }}
                  className="mt-6 inline-flex h-11 items-center rounded-xl border border-[#c7c4d8]/40 bg-white px-5 text-sm font-bold text-[#0b1c30] transition hover:bg-[#eff4ff]"
                >
                  Clear search
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#3525cd] px-5 text-sm font-bold text-white transition hover:bg-[#2d1fb0]"
                >
                  <Plus className="h-4 w-4" />
                  New Subject
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {subjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  busy={busyId === subject.id}
                  onEdit={() => setEditing(subject)}
                  onDelete={() => setDeletingTarget(subject)}
                />
              ))}
            </div>
          )}
        </section>

        {creating && (
          <SubjectFormModal
            title="Create Subject"
            submitLabel="Create"
            onClose={() => setCreating(false)}
            onSubmit={handleCreate}
            saving={busyId === 'create'}
          />
        )}
        {editing && (
          <SubjectFormModal
            title="Edit Subject"
            submitLabel="Save Changes"
            initial={editing}
            onClose={() => setEditing(null)}
            onSubmit={handleUpdate}
            saving={busyId === editing.id}
          />
        )}
        {deletingTarget && (
          <ConfirmDialog
            title={`Delete "${deletingTarget.name}"?`}
            description={
              deletingTarget.documentCount > 0
                ? `This subject has ${deletingTarget.documentCount} document${
                    deletingTarget.documentCount === 1 ? '' : 's'
                  }. They will be unassigned from this subject.`
                : 'This action cannot be undone.'
            }
            confirmLabel="Delete"
            tone="danger"
            busy={busyId === deletingTarget.id}
            onCancel={() => setDeletingTarget(null)}
            onConfirm={handleConfirmDelete}
          />
        )}
      </div>
    </DashboardShell>
  )
}

function SubjectCard({ subject, busy, onEdit, onDelete }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-[#c7c4d8]/25 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ backgroundColor: subject.color || '#3525cd' }}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="grid h-12 w-12 place-items-center rounded-xl text-sm font-extrabold text-white"
            style={{ backgroundColor: subject.color || '#3525cd' }}
          >
            {subject.code}
          </span>
          <div>
            <h3 className="text-base font-extrabold leading-tight text-[#0b1c30]">{subject.name}</h3>
            <p className="text-xs font-semibold text-[#74798a]">{subject.documentCount} document{subject.documentCount === 1 ? '' : 's'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <IconButton label="Edit" onClick={onEdit} disabled={busy}>
            <Pencil className="h-4 w-4" />
          </IconButton>
          <IconButton label="Delete" onClick={onDelete} disabled={busy} tone="danger">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </IconButton>
        </div>
      </div>
      <p className="mt-4 line-clamp-3 min-h-[3.75rem] text-sm leading-6 text-[#464555]">
        {subject.description || 'No description provided.'}
      </p>
      <div className="mt-4 flex items-center gap-2 border-t border-[#c7c4d8]/20 pt-3 text-xs font-semibold text-[#74798a]">
        <FileText className="h-3.5 w-3.5" />
        Created {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(subject.createdAt))}
      </div>
    </article>
  )
}

function IconButton({ children, label, onClick, disabled, tone = 'default' }) {
  const toneClass = {
    default: 'text-[#464555] hover:bg-[#eff4ff] hover:text-[#3525cd]',
    danger: 'text-[#464555] hover:bg-red-50 hover:text-red-600',
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

function SubjectFormModal({ title, submitLabel, initial, onClose, onSubmit, saving }) {
  const [name, setName] = useState(initial?.name || '')
  const [code, setCode] = useState(initial?.code || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [color, setColor] = useState(initial?.color || SUBJECT_COLORS[0])
  const [errors, setErrors] = useState({ name: '', code: '', form: '' })

  const validate = () => {
    const next = { name: '', code: '', form: '' }
    if (!name.trim()) next.name = 'Subject name is required.'
    if (!code.trim()) next.code = 'Subject code is required.'
    else if (!/^[A-Za-z0-9]{2,8}$/.test(code.trim()))
      next.code = 'Code must be 2-8 letters or numbers.'
    setErrors(next)
    return !next.name && !next.code
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    try {
      await onSubmit({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
        color,
      })
    } catch (err) {
      const status = err.response?.status
      const message = err.response?.data?.message || err.message || 'Could not save subject.'
      if (status === 409 && /code/i.test(message)) {
        setErrors({ name: '', code: message, form: '' })
      } else if (status === 409 && /name/i.test(message)) {
        setErrors({ name: message, code: '', form: '' })
      } else {
        setErrors({ name: '', code: '', form: message })
      }
    }
  }

  const dirty = initial
    ? name.trim() !== initial.name ||
      code.trim().toUpperCase() !== initial.code ||
      description.trim() !== (initial.description || '') ||
      color !== initial.color
    : !!(name.trim() || code.trim() || description.trim())

  return (
    <Modal onClose={onClose}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[#0b1c30]">{title}</h2>
          <p className="mt-1 text-sm text-[#74798a]">
            Subjects help organize and filter your documents.
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

      {errors.form && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
          <Field label="Name" required error={errors.name}>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name && e.target.value.trim()) setErrors((er) => ({ ...er, name: '' }))
              }}
              maxLength={80}
              placeholder="e.g. Software Engineering"
              className={`auth-input ${errors.name ? 'auth-input--invalid' : ''}`}
              required
            />
          </Field>
          <Field label="Code" required error={errors.code} hint="2-8 chars">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase())
                if (errors.code && /^[A-Z0-9]{2,8}$/.test(e.target.value.trim().toUpperCase()))
                  setErrors((er) => ({ ...er, code: '' }))
              }}
              maxLength={8}
              placeholder="SE"
              className={`auth-input uppercase ${errors.code ? 'auth-input--invalid' : ''}`}
              required
            />
          </Field>
        </div>

        <Field label="Description" hint="Optional. Help yourself remember what this subject covers.">
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={300}
            placeholder="What does this subject cover?"
            className="auth-input min-h-[100px] resize-y py-3"
          />
          <p className="mt-1 text-right text-[11px] font-semibold text-[#74798a]">
            {description.length}/300
          </p>
        </Field>

        <Field label="Color">
          <div className="flex flex-wrap gap-2">
            {SUBJECT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Pick ${c}`}
                className={`relative h-9 w-9 rounded-xl transition ${
                  color === c ? 'ring-2 ring-[#0b1c30] ring-offset-2' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              >
                {color === c && (
                  <CheckCircle2 className="absolute inset-0 m-auto h-4 w-4 text-white" />
                )}
              </button>
            ))}
          </div>
        </Field>

        <div className="flex justify-end gap-3 border-t border-[#c7c4d8]/30 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center rounded-xl border border-[#c7c4d8]/40 bg-white px-5 text-sm font-bold text-[#0b1c30] transition hover:bg-[#eff4ff]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !dirty}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#3525cd] px-6 text-sm font-bold text-white transition hover:bg-[#2d1fb0] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function ConfirmDialog({ title, description, confirmLabel, tone = 'default', busy, onCancel, onConfirm }) {
  const confirmClass =
    tone === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#3525cd] hover:bg-[#2d1fb0]'
  const iconBg = tone === 'danger' ? 'bg-red-50 text-red-600' : 'bg-[#eef0ff] text-[#3525cd]'

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
        {children}
      </div>
    </div>
  )
}

function Field({ label, required, error, hint, children }) {
  return (
    <div>
      <label className="flex items-center gap-1 text-sm font-bold text-[#0b1c30]">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-2">{children}</div>
      {error ? (
        <p className="mt-1.5 text-xs font-semibold text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs font-medium text-[#74798a]">{hint}</p>
      ) : null}
    </div>
  )
}
