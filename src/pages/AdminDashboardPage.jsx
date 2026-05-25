import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Database,
  FileText,
  TrendingUp,
  Users,
} from 'lucide-react'
import DashboardShell from '../components/DashboardShell'
import { useAuth } from '../context/useAuth'
import { getDashboardMetrics, listUsers } from '../api/adminApi'
import { getApiErrorMessage } from '../utils/apiError'

const secondaryMetrics = [
  { label: 'Hidden Docs', value: '58' },
  { label: 'Total Subjects', value: '24' },
  { label: 'AI Sessions', value: '45,901' },
  { label: 'Storage Used', value: '4.2 TB' },
]

const pendingDocs = [
  { title: 'Neural Networks Thesis', user: 'Alex Chen', subject: 'AI', size: '4.2 MB', status: 'High Priority' },
  { title: 'Database Normalization', user: 'Maria Lopez', subject: 'Database', size: '1.1 MB', status: 'Pending Review' },
]

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
        if (metricsRes.success) setMetrics(metricsRes.data)
        if (usersRes.success) setRecentUsers(usersRes.data?.content || [])
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
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0b1c30] sm:text-4xl">
              Welcome back, {firstName}!
            </h1>
            <p className="mt-2 text-base text-[#464555]">
              Monitor system performance, user activity, and storage usage.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-11 items-center rounded-xl bg-[#3525cd] px-6 text-sm font-bold text-white shadow-[0_8px_20px_rgba(53,37,205,0.25)]"
          >
            + New Research Project
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>
        )}

        {metrics && (
          <>
            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <MetricCard
                icon={Users}
                label="Total Users"
                value={metrics.totalUsers.toLocaleString()}
                trend="+8%"
              />
              <MetricCard
                icon={TrendingUp}
                label="Active Users"
                value={metrics.activeUsers.toLocaleString()}
                trend="+12%"
              />
              <MetricCard
                icon={AlertTriangle}
                label="Locked Accounts"
                value={metrics.lockedUsers.toLocaleString()}
                tag={metrics.lockedUsers > 0 ? 'Alert' : undefined}
              />
              <MetricCard
                icon={Users}
                label="New Users (7d)"
                value={metrics.newUsersLast7Days.toLocaleString()}
                trend="+5%"
              />
              <MetricCard icon={FileText} label="Pending Review" value="18" action="Review" />
            </section>

            <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {secondaryMetrics.map((m) => (
                <article
                  key={m.label}
                  className="rounded-xl border border-[#c7c4d8]/20 bg-white px-4 py-3 shadow-sm"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-[#74798a]">{m.label}</p>
                  <p className="mt-1 text-xl font-extrabold text-[#0b1c30]">{m.value}</p>
                </article>
              ))}
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
              <article className="rounded-2xl border border-[#c7c4d8]/20 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#0b1c30]">System Activity Overview</h2>
                    <p className="text-sm text-[#74798a]">New users per day (last 7 days)</p>
                  </div>
                  <span className="rounded-lg bg-[#eff4ff] px-3 py-1 text-xs font-bold text-[#3525cd]">
                    This Month
                  </span>
                </div>
                <div className="mt-8 flex h-48 items-end gap-2 border-t border-[#c7c4d8]/20 pt-4">
                  {growth.map((day) => (
                    <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className="w-full max-w-[40px] rounded-t-lg bg-[#3525cd]"
                        style={{ height: `${Math.max(16, (day.newUsers / maxGrowth) * 140)}px` }}
                        title={`${day.newUsers} users`}
                      />
                      <span className="text-[10px] font-bold text-[#74798a]">
                        {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
              </article>

              {storage && (
                <article className="rounded-2xl border border-[#c7c4d8]/20 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-extrabold text-[#0b1c30]">Storage Capacity</h2>
                  <p className="text-sm text-[#74798a]">System storage usage</p>
                  <div className="relative mx-auto mt-8 h-40 w-40">
                    <div
                      className={`absolute inset-0 rounded-full border-[12px] ${
                        storage.overLimit ? 'border-red-400' : 'border-[#3525cd]'
                      } border-r-[#57dffe] border-b-[#57dffe]/60 border-l-[#3525cd]/40`}
                    />
                    <div className="absolute inset-4 grid place-items-center rounded-full bg-white text-center">
                      <div className="text-3xl font-extrabold text-[#0b1c30]">{storage.percentUsed}%</div>
                      <div className="text-xs font-semibold text-[#74798a]">Capacity</div>
                    </div>
                  </div>
                  <ul className="mt-6 space-y-2 text-sm font-semibold text-[#464555]">
                    <li className="flex justify-between">
                      <span>PDF Documents</span>
                      <span>{storage.usedGb} GB</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Office / Doc</span>
                      <span>—</span>
                    </li>
                  </ul>
                </article>
              )}
            </section>
          </>
        )}

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <article className="overflow-hidden rounded-2xl border border-[#c7c4d8]/20 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#c7c4d8]/20 px-6 py-4">
              <h2 className="text-lg font-extrabold text-[#0b1c30]">Pending Document Review</h2>
              <button type="button" className="text-sm font-bold text-[#3525cd]">
                View All Alerts
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="bg-[#eff4ff] text-xs font-bold uppercase text-[#74798a]">
                  <tr>
                    <th className="px-6 py-3">Title</th>
                    <th className="px-4 py-3">Uploaded By</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingDocs.map((doc) => (
                    <tr key={doc.title} className="border-t border-[#c7c4d8]/15">
                      <td className="px-6 py-4 font-semibold">{doc.title}</td>
                      <td className="px-4 py-4 text-[#464555]">{doc.user}</td>
                      <td className="px-4 py-4">
                        <span className="rounded-lg bg-[#dce9ff] px-2 py-1 text-xs font-bold text-[#3525cd]">
                          {doc.subject}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-lg px-2 py-1 text-xs font-bold ${
                            doc.status === 'High Priority'
                              ? 'bg-red-50 text-red-600'
                              : 'bg-[#e8e3ff] text-[#3525cd]'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <div className="space-y-4">
            <article className="rounded-2xl border border-[#c7c4d8]/20 bg-white p-5 shadow-sm">
              <h3 className="font-extrabold text-[#0b1c30]">Quick Admin Actions</h3>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {['Invite Admin', 'Backup DB', 'Broadcast', 'Maintenance'].map((action) => (
                  <button
                    key={action}
                    type="button"
                    className="rounded-xl bg-[#3525cd]/10 px-3 py-4 text-xs font-bold text-[#3525cd] hover:bg-[#3525cd]/15"
                  >
                    <Database className="mx-auto mb-2 h-5 w-5" aria-hidden />
                    {action}
                  </button>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-[#c7c4d8]/20 bg-white p-5 shadow-sm">
              <h3 className="font-extrabold text-[#0b1c30]">Subject Summary</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {['Software Engineering', 'Database Systems', 'Artificial Intelligence'].map((s, i) => (
                  <li key={s} className="flex justify-between font-semibold text-[#464555]">
                    <span>{s}</span>
                    <span className="text-[#3525cd]">{[1245, 890, 2100][i]} docs</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-[#c7c4d8]/20 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#c7c4d8]/20 px-6 py-4">
            <h2 className="text-lg font-extrabold text-[#0b1c30]">Recent Users</h2>
            <Link to="/admin/users" className="text-sm font-bold text-[#3525cd]">
              Manage Users
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <p className="px-6 py-8 text-sm text-[#74798a]">No users loaded.</p>
          ) : (
            recentUsers.map((u) => (
              <div
                key={u.id}
                className="grid grid-cols-[1fr_100px_100px] gap-4 border-t border-[#c7c4d8]/15 px-6 py-4 text-sm"
              >
                <div>
                  <p className="font-semibold text-[#0b1c30]">{u.fullName}</p>
                  <p className="text-xs text-[#74798a]">{u.email}</p>
                </div>
                <span className="font-semibold text-[#464555]">{u.role}</span>
                <span
                  className={`font-bold ${
                    u.status === 'LOCKED' ? 'text-red-600' : 'text-emerald-600'
                  }`}
                >
                  {u.status}
                </span>
              </div>
            ))
          )}
        </section>

        <div className="fixed bottom-6 right-6 hidden rounded-xl bg-[#0b1c30] px-4 py-3 text-sm font-semibold text-white shadow-lg lg:flex lg:items-center lg:gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          System health check completed successfully.
        </div>
      </div>
    </DashboardShell>
  )
}

function MetricCard({ icon: Icon, label, value, trend, tag, action }) {
  return (
    <article className="rounded-2xl border border-[#c7c4d8]/20 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8e3ff] text-[#3525cd]">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        {trend && <span className="text-xs font-bold text-emerald-600">{trend}</span>}
        {tag && (
          <span className="rounded-lg bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">{tag}</span>
        )}
        {action && (
          <span className="rounded-lg bg-[#3525cd] px-2 py-0.5 text-xs font-bold text-white">{action}</span>
        )}
      </div>
      <p className="mt-5 text-xs font-bold uppercase tracking-wide text-[#74798a]">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-[#0b1c30]">{value}</p>
    </article>
  )
}
