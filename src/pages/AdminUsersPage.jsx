import { useEffect, useRef, useState } from 'react'
import {
  Loader2,
  Lock,
  MoreVertical,
  Pencil,
  KeyRound,
  Trash2,
  Unlock,
  X,
} from 'lucide-react'
import DashboardShell from '../components/DashboardShell'
import {
  getAdminUsers,
  updateAdminUserStatus,
  updateUser,
  resetUserPassword,
  deleteUser,
} from '../api/adminApi'
import { getApiErrorMessage } from '../utils/apiError'

const pageSize = 10

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState([])
  const [editTarget, setEditTarget] = useState(null)
  const [resetTarget, setResetTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [bulkAction, setBulkAction] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let ignore = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const response = await getAdminUsers({ search, page, size: pageSize })
        if (ignore) return
        if (!response.success) throw new Error(response.message || 'Could not load users.')
        setUsers(response.data.content)
        setTotalPages(response.data.totalPages)
        setTotalElements(response.data.totalElements)
        setSelected([])
      } catch (err) {
        if (!ignore) setError(getApiErrorMessage(err, 'Could not load users.'))
      } finally {
        if (!ignore) setLoading(false)
      }
    })()
    return () => {
      ignore = true
    }
  }, [search, page, refreshKey])

  const reload = () => setRefreshKey((k) => k + 1)

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    setPage(0)
    setSearch(searchInput.trim())
  }

  const toggleSelect = (id) => {
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))
  }

  const toggleSelectAll = () => {
    setSelected((cur) => (cur.length === users.length ? [] : users.map((u) => u.id)))
  }

  const handleStatusChange = async (user, nextStatus) => {
    setMessage('')
    setError('')
    setSavingId(user.id)
    try {
      const response = await updateAdminUserStatus(user.id, nextStatus)
      if (!response.success) throw new Error(response.message || 'Could not update user status.')
      setUsers((cur) => cur.map((item) => (item.id === user.id ? response.data : item)))
      setMessage(`${response.data.fullName} is now ${response.data.status}.`)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update user status.'))
    } finally {
      setSavingId(null)
    }
  }

  const handleEditSave = async (payload) => {
    if (!editTarget) return
    setSavingId(editTarget.id)
    setError('')
    try {
      const response = await updateUser(editTarget.id, payload)
      if (!response.success) throw new Error(response.message)
      setUsers((cur) => cur.map((item) => (item.id === editTarget.id ? response.data : item)))
      setMessage(`${response.data.fullName} updated.`)
      setEditTarget(null)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update user.'))
    } finally {
      setSavingId(null)
    }
  }

  const handleResetSave = async (newPassword) => {
    if (!resetTarget) return
    setSavingId(resetTarget.id)
    setError('')
    try {
      const response = await resetUserPassword(resetTarget.id, newPassword)
      if (!response.success) throw new Error(response.message)
      setMessage(`Password reset for ${resetTarget.fullName}.`)
      setResetTarget(null)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not reset password.'))
    } finally {
      setSavingId(null)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setSavingId(deleteTarget.id)
    setError('')
    try {
      const response = await deleteUser(deleteTarget.id)
      if (!response.success) throw new Error(response.message)
      setMessage(`${deleteTarget.fullName} deleted.`)
      setDeleteTarget(null)
      reload()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not delete user.'))
    } finally {
      setSavingId(null)
    }
  }

  const runBulk = async () => {
    if (!bulkAction || selected.length === 0) return
    setSavingId('bulk')
    setError('')
    setMessage('')
    const ids = [...selected]
    let ok = 0
    try {
      for (const id of ids) {
        try {
          if (bulkAction === 'activate') await updateAdminUserStatus(id, 'ACTIVE')
          else if (bulkAction === 'deactivate') await updateAdminUserStatus(id, 'LOCKED')
          else if (bulkAction === 'delete') await deleteUser(id)
          ok += 1
        } catch {
          /* tiếp tục các id còn lại */
        }
      }
      setMessage(`Bulk ${bulkAction}: ${ok}/${ids.length} succeeded.`)
    } finally {
      setSavingId(null)
      setBulkAction(null)
      reload()
    }
  }

  const allChecked = users.length > 0 && selected.length === users.length

  return (
    <DashboardShell type="admin">
      <div className="px-8 py-10 lg:px-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="text-4xl font-extrabold">User Management</h1>
          </div>
          <form onSubmit={handleSearchSubmit} className="flex w-full gap-3 md:max-w-xl">
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="h-12 flex-1 rounded-lg border border-slate-200 bg-white px-5 font-semibold outline-none focus:border-[#3b2be0]"
              placeholder="Search by full name or email"
            />
            <button className="h-12 rounded-lg bg-[#3b2be0] px-6 font-bold text-white" type="submit">
              Search
            </button>
          </form>
        </div>

        {error && <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}
        {message && <div className="mt-6 rounded-lg bg-green-50 px-4 py-3 text-sm font-bold text-green-700">{message}</div>}

        {selected.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-[#3b2be0]/30 bg-[#eef0ff] px-4 py-3">
            <span className="text-sm font-bold text-[#3b2be0]">{selected.length} selected</span>
            <div className="ml-auto flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setBulkAction('activate')}
                disabled={savingId === 'bulk'}
                className="rounded-lg border border-green-200 bg-white px-3 py-1.5 text-sm font-bold text-green-700 disabled:opacity-50"
              >
                Activate
              </button>
              <button
                type="button"
                onClick={() => setBulkAction('deactivate')}
                disabled={savingId === 'bulk'}
                className="rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-sm font-bold text-amber-700 disabled:opacity-50"
              >
                Deactivate
              </button>
              <button
                type="button"
                onClick={() => setBulkAction('delete')}
                disabled={savingId === 'bulk'}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-bold text-red-600 disabled:opacity-50"
              >
                {savingId === 'bulk' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete
              </button>
              <button
                type="button"
                onClick={() => setSelected([])}
                className="rounded-lg px-2 py-1.5 text-sm font-bold text-slate-500 hover:text-slate-700"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        <section className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="text-xl font-extrabold">Registered Accounts</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {loading ? 'Loading...' : `${totalElements} accounts found`}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left">
              <thead className="bg-[#eef4ff] text-xs font-extrabold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded accent-[#3b2be0]"
                      aria-label="Select all"
                    />
                  </th>
                  <th className="px-4 py-4">User</th>
                  <th className="px-4 py-4">Phone</th>
                  <th className="px-4 py-4">Role</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-slate-100">
                    <td className="px-6 py-5">
                      <input
                        type="checkbox"
                        checked={selected.includes(user.id)}
                        onChange={() => toggleSelect(user.id)}
                        className="h-4 w-4 rounded accent-[#3b2be0]"
                        aria-label={`Select ${user.fullName}`}
                      />
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#e8e3ff] text-sm font-extrabold text-[#3427d9]">
                            {initials(user.fullName)}
                          </span>
                        )}
                        <div>
                          <div className="font-extrabold">{user.fullName}</div>
                          <div className="text-sm font-semibold text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-sm font-semibold text-slate-600">{user.phone || '—'}</td>
                    <td className="px-4 py-5 text-sm font-bold">{user.role}</td>
                    <td className="px-4 py-5">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-5 text-sm font-semibold text-slate-600">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-5 text-right">
                      <RowMenu
                        user={user}
                        busy={savingId === user.id}
                        onEdit={() => setEditTarget(user)}
                        onToggleStatus={() =>
                          handleStatusChange(user, user.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED')
                        }
                        onReset={() => setResetTarget(user)}
                        onDelete={() => setDeleteTarget(user)}
                      />
                    </td>
                  </tr>
                ))}
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-sm font-bold text-slate-500">
                      No accounts match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-5">
            <button
              type="button"
              disabled={page === 0 || loading}
              onClick={() => setPage((c) => Math.max(c - 1, 0))}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm font-bold text-slate-500">
              Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page + 1 >= totalPages || loading}
              onClick={() => setPage((c) => c + 1)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </section>
      </div>

      {editTarget && (
        <EditUserModal
          user={editTarget}
          saving={savingId === editTarget.id}
          onClose={() => setEditTarget(null)}
          onSave={handleEditSave}
        />
      )}
      {resetTarget && (
        <ResetPasswordModal
          user={resetTarget}
          saving={savingId === resetTarget.id}
          onClose={() => setResetTarget(null)}
          onSave={handleResetSave}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title={`Delete "${deleteTarget.fullName}"?`}
          description="This permanently deletes the account and all of its documents, subjects and chat history. This cannot be undone."
          confirmLabel="Delete"
          busy={savingId === deleteTarget.id}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
      {bulkAction && (
        <ConfirmDialog
          title={`${bulkAction === 'delete' ? 'Delete' : bulkAction === 'activate' ? 'Activate' : 'Deactivate'} ${selected.length} account${selected.length === 1 ? '' : 's'}?`}
          description={
            bulkAction === 'delete'
              ? 'This permanently deletes the selected accounts and all their data. This cannot be undone.'
              : `This will ${bulkAction} the selected accounts.`
          }
          confirmLabel="Confirm"
          danger={bulkAction === 'delete'}
          busy={savingId === 'bulk'}
          onCancel={() => setBulkAction(null)}
          onConfirm={runBulk}
        />
      )}
    </DashboardShell>
  )
}

function RowMenu({ user, busy, onEdit, onToggleStatus, onReset, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const isLocked = user.status === 'LOCKED'

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={busy}
        className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        aria-label="Actions"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          <MenuItem icon={Pencil} label="Edit info" onClick={() => { setOpen(false); onEdit() }} />
          <MenuItem
            icon={isLocked ? Unlock : Lock}
            label={isLocked ? 'Activate' : 'Deactivate'}
            onClick={() => { setOpen(false); onToggleStatus() }}
          />
          <MenuItem icon={KeyRound} label="Reset password" onClick={() => { setOpen(false); onReset() }} />
          <MenuItem icon={Trash2} label="Delete" danger onClick={() => { setOpen(false); onDelete() }} />
        </div>
      )}
    </div>
  )
}

function MenuItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm font-semibold transition ${
        danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}

function EditUserModal({ user, saving, onClose, onSave }) {
  const [fullName, setFullName] = useState(user.fullName || '')
  const [phone, setPhone] = useState(user.phone || '')
  const [err, setErr] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!fullName.trim()) {
      setErr('Full name is required.')
      return
    }
    onSave({ fullName: fullName.trim(), phone: phone.trim() })
  }

  return (
    <Modal onClose={onClose} title="Edit account">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label className="text-sm font-bold text-[#0b1c30]">Email</label>
          <input
            value={user.email}
            disabled
            className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 font-semibold text-slate-500"
          />
        </div>
        <div>
          <label className="text-sm font-bold text-[#0b1c30]">Full name</label>
          <input
            value={fullName}
            onChange={(e) => { setFullName(e.target.value); if (err) setErr('') }}
            maxLength={100}
            className={`mt-1.5 h-11 w-full rounded-lg border px-4 font-semibold outline-none focus:border-[#3b2be0] ${err ? 'border-red-400' : 'border-slate-200'}`}
            autoFocus
          />
          {err && <p className="mt-1 text-xs font-semibold text-red-600">{err}</p>}
        </div>
        <div>
          <label className="text-sm font-bold text-[#0b1c30]">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={32}
            placeholder="Optional"
            className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-4 font-semibold outline-none focus:border-[#3b2be0]"
          />
        </div>
        <ModalActions saving={saving} submitLabel="Save Changes" onClose={onClose} />
      </form>
    </Modal>
  )
}

function ResetPasswordModal({ user, saving, onClose, onSave }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (pw.trim().length < 8) {
      setErr('Password must be at least 8 characters.')
      return
    }
    onSave(pw.trim())
  }

  return (
    <Modal onClose={onClose} title={`Reset password — ${user.fullName}`}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label className="text-sm font-bold text-[#0b1c30]">New password</label>
          <input
            type="text"
            value={pw}
            onChange={(e) => { setPw(e.target.value); if (err) setErr('') }}
            placeholder="Min. 8 characters"
            className={`mt-1.5 h-11 w-full rounded-lg border px-4 font-semibold outline-none focus:border-[#3b2be0] ${err ? 'border-red-400' : 'border-slate-200'}`}
            autoFocus
          />
          {err && <p className="mt-1 text-xs font-semibold text-red-600">{err}</p>}
          <p className="mt-1.5 text-xs font-semibold text-slate-500">
            The user will be signed out everywhere and must use this new password.
          </p>
        </div>
        <ModalActions saving={saving} submitLabel="Reset Password" onClose={onClose} />
      </form>
    </Modal>
  )
}

function ModalActions({ saving, submitLabel, onClose }) {
  return (
    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
      <button
        type="button"
        onClick={onClose}
        className="inline-flex h-11 items-center rounded-lg border border-slate-200 px-5 text-sm font-bold text-[#0b1c30] hover:bg-slate-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={saving}
        className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#3b2be0] px-6 text-sm font-bold text-white hover:bg-[#2d1fb0] disabled:opacity-60"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitLabel}
      </button>
    </div>
  )
}

function ConfirmDialog({ title, description, confirmLabel, busy, danger = true, onCancel, onConfirm }) {
  return (
    <Modal onClose={onCancel} maxWidth="max-w-md">
      <div className="text-center">
        <span className={`mx-auto grid h-12 w-12 place-items-center rounded-2xl ${danger ? 'bg-red-50 text-red-600' : 'bg-[#eef0ff] text-[#3b2be0]'}`}>
          <Trash2 className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-xl font-extrabold text-[#0b1c30]">{title}</h2>
        <p className="mt-2 text-sm text-[#464555]">{description}</p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 text-sm font-bold text-[#0b1c30] hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-bold text-white disabled:opacity-60 ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#3b2be0] hover:bg-[#2d1fb0]'}`}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

function Modal({ children, onClose, title, maxWidth = 'max-w-lg' }) {
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
        {title && (
          <div className="mb-5 flex items-start justify-between gap-3">
            <h2 className="text-xl font-extrabold text-[#0b1c30]">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const isLocked = status === 'LOCKED'
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${isLocked ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
      {isLocked ? 'INACTIVE' : 'ACTIVE'}
    </span>
  )
}

function initials(name = 'User') {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(value))
}
