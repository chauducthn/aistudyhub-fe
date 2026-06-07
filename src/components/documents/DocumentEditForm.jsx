import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function DocumentEditForm({
  doc,
  subjects,
  saving = false,
  submitLabel = 'Save Changes',
  onSubmit,
  onCancel,
  layout = 'stacked',
}) {
  const [title, setTitle] = useState(doc.title || '')
  const [description, setDescription] = useState(doc.description || '')
  const [subjectId, setSubjectId] = useState(doc.subjectId || '')
  const [visibility, setVisibility] = useState(doc.visibility || doc.status || 'PRIVATE')
  const [titleError, setTitleError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setTitleError('Title is required.')
      return
    }
    setTitleError('')
    onSubmit?.({
      title: trimmedTitle,
      description: description.trim(),
      subjectId,
      visibility,
    })
  }

  const dirty =
    title.trim() !== (doc.title || '') ||
    description.trim() !== (doc.description || '') ||
    subjectId !== (doc.subjectId || '') ||
    visibility !== (doc.visibility || 'PRIVATE')

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Field label="Title" htmlFor="edit-title" required error={titleError}>
        <input
          id="edit-title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (titleError && e.target.value.trim()) setTitleError('')
          }}
          onBlur={() => {
            if (!title.trim()) setTitleError('Title is required.')
          }}
          className={`auth-input ${titleError ? 'auth-input--invalid' : ''}`}
          placeholder="Document title"
          maxLength={200}
          required
        />
      </Field>

      <Field label="Description" htmlFor="edit-description" hint="Optional. Help yourself and AI find this document later.">
        <textarea
          id="edit-description"
          rows={layout === 'page' ? 5 : 4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="auth-input min-h-[110px] resize-y py-3"
          placeholder="Describe what this document covers..."
          maxLength={1000}
        />
        <p className="mt-1 text-right text-[11px] font-semibold text-[#74798a]">
          {description.length}/1000
        </p>
      </Field>

      <Field label="Subject" htmlFor="edit-subject">
        <select
          id="edit-subject"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="auth-input"
        >
          <option value="">Uncategorized</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Visibility">
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'PRIVATE', label: 'Private', icon: EyeOff, hint: 'Only you can see this.' },
            { value: 'PUBLIC', label: 'Public', icon: Eye, hint: 'Visible across AI Study Hub.' },
          ].map((opt) => {
            const active = visibility === opt.value
            const Icon = opt.icon
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setVisibility(opt.value)}
                className={`flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition ${
                  active
                    ? 'border-[#3525cd] bg-[#eef0ff]'
                    : 'border-[#c7c4d8]/40 bg-white hover:border-[#3525cd]/30'
                }`}
              >
                <span className={`inline-flex items-center gap-2 text-sm font-bold ${active ? 'text-[#3525cd]' : 'text-[#0b1c30]'}`}>
                  <Icon className="h-4 w-4" />
                  {opt.label}
                </span>
                <span className="text-[11px] font-semibold text-[#74798a]">{opt.hint}</span>
              </button>
            )
          })}
        </div>
      </Field>

      <div
        className={`flex flex-col-reverse gap-3 sm:flex-row sm:justify-end ${
          layout === 'modal' ? 'border-t border-[#c7c4d8]/30 pt-4' : ''
        }`}
      >
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[#c7c4d8]/40 bg-white px-5 text-sm font-bold text-[#0b1c30] transition hover:bg-[#eff4ff]"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving || !dirty}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#3525cd] px-6 text-sm font-bold text-white transition hover:bg-[#2d1fb0] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

function Field({ label, htmlFor, required, hint, error, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="flex items-center gap-1 text-sm font-bold text-[#0b1c30]">
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
