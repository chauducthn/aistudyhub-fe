import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardShell from '../components/DashboardShell'
import { useAuth } from '../context/useAuth'
import { getDashboardMetrics, listUsers } from '../api/adminApi'
import { getApiErrorMessage } from '../utils/apiError'

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState(null)
  const [recentUsers, setRecentUsers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const [metricsRes, usersRes] = await Promise.all([
          getDashboardMetrics(),
          listUsers({ page: 0, size: 5 }),
        ])
        if (metricsRes.success) {
          setMetrics(metricsRes.data)
        }
        if (usersRes.success) {
          setRecentUsers(usersRes.data?.content || [])
        }
      } catch (err) {
        setError(getApiErrorMessage(err, 'Could not load admin dashboard.'))
      }
    }
    void load()
  }, [])

  const storage = metrics?.storage
  const growth = metrics?.userGrowth || []
  const maxGrowth = Math.max(...growth.map((g) => g.newUsers), 1)
  const firstName = user?.fullName?.split(' ')[0] || 'Admin'

  return (
    <DashboardShell type="admin">
      <div className="px-8 py-10 lg:px-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div>
            <h1 className="text-4xl font-extrabold">Welcome back, {firstName}!</h1>
            <p className="mt-3 text-xl font-semibold text-[#4f5668]">
              Monitor system performance and storage (FR-01.13).
            </p>
          </div>
          <Link
            to="/admin/users"
            className="inline-flex h-14 items-center rounded-xl bg-[#3b2be0] px-8 text-lg font-bold text-white"
          >
            Manage Users
          </Link>
        </div>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>
        )}

        {metrics && (
          <>
            <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <Metric label="Total Users" value={metrics.totalUsers.toLocaleString()} />
              <Metric label="Active Users" value={metrics.activeUsers.toLocaleString()} />
              <Metric
                label="Locked Accounts"
                value={metrics.lockedUsers.toLocaleString()}
                tag={metrics.lockedUsers > 0 ? 'Alert' : undefined}
              />
              <Metric label="New Users (7d)" value={metrics.newUsersLast7Days.toLocaleString()} />
            </section>

            <section className="mt-8 grid gap-8 xl:grid-cols-[2fr_1fr]">
              <article className="rounded-2xl bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-extrabold">User Growth (7 days)</h2>
                <p className="font-semibold text-slate-500">New registrations per day</p>
                <div className="mt-10 flex h-56 items-end gap-3 border-t border-slate-200 pt-4">
                  {growth.map((day) => (
                    <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className="w-full rounded-t-lg bg-[#3b2be0]"
                        style={{ height: `${Math.max(12, (day.newUsers / maxGrowth) * 180)}px` }}
                        title={`${day.newUsers} users`}
                      />
                      <span className="text-[10px] font-bold text-slate-500">
                        {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              </article>

              {storage && (
                <article className="rounded-2xl bg-white p-8 shadow-sm">
                  <h2 className="text-2xl font-extrabold">Storage Monitoring</h2>
                  <p className="font-semibold text-slate-500">System storage usage</p>
                  <div
                    className={`mx-auto mt-10 grid h-44 w-44 place-items-center rounded-full border-[14px] ${
                      storage.overLimit ? 'border-red-500' : 'border-[#3b2be0]'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl font-extrabold">{storage.percentUsed}%</div>
                      <div className="font-semibold text-slate-500">
                        {storage.usedGb} / {storage.limitGb} GB
                      </div>
                    </div>
                  </div>
                  <p className="mt-6 text-center text-sm font-semibold text-slate-600">
                    {storage.usedBytes.toLocaleString()} bytes used
                  </p>
                  {storage.overLimit && (
                    <p className="mt-2 text-center text-sm font-bold text-red-600">Storage over limit</p>
                  )}
                </article>
              )}
            </section>
          </>
        )}

        <section className="mt-8 rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between px-8 py-6">
            <h2 className="text-2xl font-extrabold">Recent Users</h2>
            <Link to="/admin/users" className="font-bold text-[#3427d9]">
              View all
            </Link>
          </div>
          {recentUsers.map((u) => (
            <div
              key={u.id}
              className="grid grid-cols-[1fr_120px_120px] border-t border-slate-100 px-8 py-4"
            >
              <span className="font-semibold">{u.fullName}</span>
              <span className="text-slate-500">{u.role}</span>
              <span
                className={
                  u.status === 'LOCKED' ? 'font-bold text-red-600' : 'font-bold text-green-700'
                }
              >
                {u.status}
              </span>
            </div>
          ))}
        </section>
      </div>
    </DashboardShell>
  )
}

function Metric({ label, value, tag }) {
  return (
    <article className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#e8e3ff] text-[#3427d9]">
          □
        </span>
        {tag && (
          <span className="rounded-md bg-[#edf2fa] px-3 py-1 text-xs font-extrabold text-[#3427d9]">
            {tag}
          </span>
        )}
      </div>
      <div className="mt-7 text-xs font-extrabold uppercase text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-extrabold">{value}</div>
    </article>
  )
}
