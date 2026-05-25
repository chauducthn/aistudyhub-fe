import { useCallback, useEffect, useState } from 'react'
import DashboardShell from '../components/DashboardShell'
import { listUsers, updateUserStatus } from '../api/adminApi'
import { getApiErrorMessage } from '../utils/apiError'

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionId, setActionId] = useState(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await listUsers({ search, page, size: 10 })
      if (!response.success) {
        throw new Error(response.message || 'Failed to load users')
      }
      setData(response.data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load users.'))
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  const handleStatusChange = async (userId, status) => {
    setActionId(userId)
    try {
      const response = await updateUserStatus(userId, status)
      if (!response.success) {
        throw new Error(response.message || 'Update failed')
      }
      await loadUsers()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update user status.'))
    } finally {
      setActionId(null)
    }
  }

  const users = data?.content || []
  const totalPages = data?.totalPages ?? 0

  return (
    <DashboardShell type="admin">
      <div className="px-8 py-10 lg:px-10">
        <h1 className="text-4xl font-extrabold">User Management</h1>
        <p className="mt-3 text-lg font-semibold text-[#4f5668]">
          View accounts and lock or unlock users.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <input
            value={search}
            onChange={(e) => {
              setPage(0)
              setSearch(e.target.value)
            }}
            placeholder="Search by name or email..."
            className="h-12 min-w-[280px] flex-1 rounded-lg border border-slate-200 px-4 font-semibold outline-none focus:border-[#3b2be0]"
          />
          <button
            type="button"
            onClick={() => void loadUsers()}
            className="h-12 rounded-lg bg-[#3b2be0] px-6 font-bold text-white"
          >
            Search
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>
        )}

        <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-t border-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#102338]">{u.fullName}</div>
                      <div className="text-slate-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">{u.role}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          u.status === 'ACTIVE'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {u.status === 'LOCKED' ? (
                          <button
                            type="button"
                            disabled={actionId === u.id}
                            onClick={() => void handleStatusChange(u.id, 'ACTIVE')}
                            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                          >
                            Unlock
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={actionId === u.id}
                            onClick={() => void handleStatusChange(u.id, 'LOCKED')}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                          >
                            Lock
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-lg border px-4 py-2 font-semibold disabled:opacity-40"
            >
              Previous
            </button>
            <span className="font-semibold text-slate-600">
              Page {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border px-4 py-2 font-semibold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
