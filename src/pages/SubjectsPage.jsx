import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
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
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import ActionIconButton from '../components/ui/ActionIconButton'

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

const NAME_MAX = 120

function deriveCode(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

function deriveColor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  return SUBJECT_COLORS[hash % SUBJECT_COLORS.length]
}

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

  const loadSubjects = useCallback(async () => {
    try {
      const res = await listSubjects()
      if (!res.success) throw new Error(res.message || 'Could not load subjects.')
      setSubjects(res.data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load subjects.'))
    }
  }, [])

  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        const res = await listSubjects()
        if (ignore) return
        if (!res.success) throw new Error(res.message || 'Could not load subjects.')
        setSubjects(res.data)
        setError('')
      } catch (err) {
        if (!ignore) setError(getApiErrorMessage(err, 'Could not load subjects.'))
      } finally {
        if (!ignore) setLoading(false)
      }
    })()
    return () => {
      ignore = true
    }
  }, [])

  const filteredSubjects = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    const sorted = [...subjects].sort((a, b) => a.name.localeCompare(b.name))
    if (!keyword) return sorted
    return sorted.filter((s) => s.name.toLowerCase().includes(keyword))
  }, [subjects, search])

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
      await loadSubjects()
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
      await loadSubjects()
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
      await loadSubjects()
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
                : `${subjects.length} subject${subjects.length === 1 ? '' : 's'}.`}
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
                placeholder="Search subjects by name..."
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
                <div key={idx} className="h-36 animate-pulse rounded-2xl bg-white shadow-sm" />
              ))}
            </div>
          ) : filteredSubjects.length === 0 ? (
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
              {filteredSubjects.map((subject) => (
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
            description="This action cannot be undone. Subjects that still contain documents cannot be deleted."
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
  const color = deriveColor(subject.name)
  const code = deriveCode(subject.name)
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-[#c7c4d8]/25 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: color }} />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="grid h-12 w-12 place-items-center rounded-xl text-sm font-extrabold text-white"
            style={{ backgroundColor: color }}
          >
            {code}
          </span>
          <div>
            <h3 className="text-base font-extrabold leading-tight text-[#0b1c30]">{subject.name}</h3>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <ActionIconButton label="Edit" onClick={onEdit} disabled={busy}>
            <Pencil className="h-4 w-4" />
          </ActionIconButton>
          <ActionIconButton label="Delete" onClick={onDelete} disabled={busy} tone="danger">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </ActionIconButton>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 border-t border-[#c7c4d8]/20 pt-3 text-xs font-semibold text-[#74798a]">
        Created {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(subject.createdAt))}
      </div>
    </article>
  )
}

function SubjectFormModal({ title, submitLabel, initial, onClose, onSubmit, saving }) {
  const [name, setName] = useState(initial?.name || '')
  const [errors, setErrors] = useState({ name: '', form: '' })

  const validate = () => {
    const next = { name: '', form: '' }
    if (!name.trim()) next.name = 'Subject name is required.'
    else if (name.trim().length > NAME_MAX) next.name = `Name must be at most ${NAME_MAX} characters.`
    setErrors(next)
    return !next.name
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    try {
      await onSubmit({ name: name.trim() })
    } catch (err) {
      const status = err.response?.status
      const message = err.response?.data?.message || err.message || 'Could not save subject.'
      if ((status === 400 || status === 409) && /name/i.test(message)) {
        setErrors({ name: message, form: '' })
      } else {
        setErrors({ name: '', form: message })
      }
    }
  }

  const dirty = initial ? name.trim() !== initial.name : !!name.trim()

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
        <Field label="Name" required error={errors.name}>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (errors.name && e.target.value.trim()) setErrors((er) => ({ ...er, name: '' }))
            }}
            maxLength={NAME_MAX}
            placeholder="e.g. Software Engineering"
            className={`auth-input ${errors.name ? 'auth-input--invalid' : ''}`}
            required
            autoFocus
          />
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
