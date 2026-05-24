import { useEffect, useState } from 'react'
import DashboardShell from '../components/DashboardShell'
import { getAdminUsers, updateAdminUserStatus } from '../api/adminApi'
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

  useEffect(() => {
    let ignore = false

    async function loadUsers() {
      setLoading(true)
      setError('')
      try {
        const response = await getAdminUsers({ search, page, size: pageSize })
        if (!response.success) {
          throw new Error(response.message || 'Could not load users.')
        }
        if (!ignore) {
          setUsers(response.data.content)
          setTotalPages(response.data.totalPages)
          setTotalElements(response.data.totalElements)
        }
      } catch (err) {
        if (!ignore) setError(getApiErrorMessage(err, 'Could not load users.'))
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    void loadUsers()
    return () => {
      ignore = true
    }
  }, [search, page])

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    setPage(0)
    setSearch(searchInput.trim())
  }

  const handleStatusChange = async (user, nextStatus) => {
    setMessage('')
    setError('')
    setSavingId(user.id)
    try {
      const response = await updateAdminUserStatus(user.id, nextStatus)
      if (!response.success) {
        throw new Error(response.message || 'Could not update user status.')
      }
      setUsers((currentUsers) =>
        currentUsers.map((item) => (item.id === user.id ? response.data : item)),
      )
      setMessage(`${response.data.fullName} is now ${response.data.status}.`)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update user status.'))
    } finally {
      setSavingId(null)
    }
  }

  return (
    <DashboardShell type="admin">
      <div className="px-8 py-10 lg:px-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="text-4xl font-extrabold">User Management</h1>
            <p className="mt-3 text-xl font-semibold text-[#4f5668]">
              Search registered accounts and manually lock or unlock access.
            </p>
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
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-[#eef4ff] text-xs font-extrabold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-4 py-4">Role</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Failed Login</th>
                  <th className="px-4 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-slate-100">
                    <td className="px-6 py-5">
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
                    <td className="px-4 py-5 text-sm font-bold">{user.role}</td>
                    <td className="px-4 py-5">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="px-4 py-5 text-sm font-semibold text-slate-600">{user.failedLoginAttempts}</td>
                    <td className="px-4 py-5 text-sm font-semibold text-slate-600">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-5 text-right">
                      {user.status === 'LOCKED' ? (
                        <button
                          type="button"
                          disabled={savingId === user.id}
                          onClick={() => handleStatusChange(user, 'ACTIVE')}
                          className="rounded-lg border border-green-200 px-4 py-2 text-sm font-extrabold text-green-700 disabled:opacity-60"
                        >
                          Unlock
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={savingId === user.id}
                          onClick={() => handleStatusChange(user, 'LOCKED')}
                          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-extrabold text-red-600 disabled:opacity-60"
                        >
                          Lock
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-sm font-bold text-slate-500">
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
              onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 0))}
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
              onClick={() => setPage((currentPage) => currentPage + 1)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}

function StatusBadge({ status }) {
  const isLocked = status === 'LOCKED'
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${isLocked ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
      {status}
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
