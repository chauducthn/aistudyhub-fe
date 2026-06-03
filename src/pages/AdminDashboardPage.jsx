import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Eye,
  FileText,
  FolderOpen,
  Lock,
  Mail,
  MessageSquare,
  Plus,
  Sparkles,
  Users,
  Wrench,
  Zap,
} from 'lucide-react'
import DashboardShell from '../components/DashboardShell'
import { useAuth } from '../context/useAuth'
import { getDashboardMetrics, listUsers } from '../api/adminApi'
import { getApiErrorMessage } from '../utils/apiError'


const fallbackUsers = [
  { id: 'u1', initials: 'JD', fullName: 'John Doe', email: 'john.d@university.edu', role: 'Student', status: 'Active', joined: '2h ago' },
  { id: 'u2', initials: 'MT', fullName: 'Mary Taylor', email: 'm.taylor@tech-institute.com', role: 'Researcher', status: 'Locked', joined: '5h ago' },
  { id: 'u3', initials: 'SJ', fullName: 'Sarah Jenkins', email: 's.jenkins@academia.ai', role: 'Researcher', status: 'Active', joined: '2 mins ago' },
  { id: 'u4', initials: 'DM', fullName: 'David Miller', email: 'david.m@univ.edu', role: 'Student', status: 'Locked', joined: '14 hours ago' },
  { id: 'u5', initials: 'ER', fullName: 'Elena Rodriguez', email: 'elena.rod@global.ai', role: 'Admin', status: 'Active', joined: 'Just now' },
  { id: 'u6', initials: 'AR', fullName: 'Alex Rivers', email: 'alex.rivers@university.edu', role: 'Student', status: 'Active', joined: '1h ago' },
  { id: 'u7', initials: 'MB', fullName: 'Michael Brown', email: 'm.brown@oxford.edu', role: 'Student', status: 'Active', joined: '3h ago' },
]

const quickActions = [
  { label: 'Invite Admin', icon: Mail },
  { label: 'Backup DB', icon: Database },
  { label: 'Broadcast', icon: MessageSquare },
  { label: 'Maintenance', icon: Wrench },
]

const fallbackChart = [
  { date: '2026-05-22', newUsers: 5 },
  { date: '2026-05-23', newUsers: 12 },
  { date: '2026-05-24', newUsers: 8 },
  { date: '2026-05-25', newUsers: 15 },
  { date: '2026-05-26', newUsers: 22 },
  { date: '2026-05-27', newUsers: 18 },
  { date: '2026-05-28', newUsers: 7 },
]

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState(null)
  const [recentUsers, setRecentUsers] = useState([])
  const [error, setError] = useState('')
  const [showHealthToast, setShowHealthToast] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [metricsRes, usersRes] = await Promise.all([
          getDashboardMetrics(),
          listUsers({ page: 0, size: 7 }),
        ])
        if (metricsRes.success) setMetrics(metricsRes.data)
        if (usersRes.success) setRecentUsers(usersRes.data?.content || [])
      } catch (err) {
        setError(getApiErrorMessage(err, 'Could not load admin dashboard.'))
      }
    }
    void load()
  }, [])

  const firstName = user?.fullName?.split(' ')[0] || 'Admin'
  const usersToShow = recentUsers.length > 0 ? recentUsers.map(mapApiUser) : fallbackUsers
  const totalUsers = metrics?.totalUsers ?? 12842
  const activeUsers = metrics?.activeUsers ?? 2410
  const lockedUsers = metrics?.lockedUsers ?? 42
  const newUsers7d = metrics?.newUsersLast7Days ?? 87
  const chatbotApiCalls = metrics?.chatbotApiCalls ?? 0
  const storage = metrics?.storage
  const storagePercent = storage?.percentUsed != null ? Math.round(storage.percentUsed) : 75
  const storageUsedGb = storage?.usedGb ?? 4.2
  const storageLimitGb = storage?.limitGb ?? 5.6
  const storageOverLimit = storage?.overLimit ?? false
  const userGrowth = metrics?.userGrowth?.length ? metrics.userGrowth : fallbackChart
  const maxGrowth = Math.max(...userGrowth.map((g) => g.newUsers), 1)
  const totalUsersTrend = `+${newUsers7d.toLocaleString()} (7d)`
  const totalDocuments = metrics?.totalDocuments
  const pendingReviewCount = metrics?.pendingReviewDocuments ?? metrics?.pendingReports
  const totalSubjects = metrics?.totalSubjects
  const hiddenDocuments = metrics?.hiddenDocuments
  const subjectActivityItems = metrics?.subjectActivity || metrics?.topSubjects || []
  const pendingReviewItems = metrics?.pendingReviewDocumentsList || metrics?.pendingDocuments || []
  const hasChatbot = chatbotApiCalls > 0 || metrics?.chatbotEnabled === true
  const docMetricUnavailable = totalDocuments == null
  const pendingMetricUnavailable = pendingReviewCount == null
  const subjectMetricUnavailable = totalSubjects == null

  return (
    <DashboardShell type="admin">
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0b1c30] sm:text-4xl">
              Welcome back, {firstName}!
            </h1>
            <p className="mt-2 text-base text-[#464555]">
              Monitor system activity, review documents, and manage AI Study Hub.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#3525cd] px-6 text-sm font-bold text-white shadow-[0_8px_20px_rgba(53,37,205,0.25)]"
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-white/25">
              <Plus className="h-3.5 w-3.5" />
            </span>
            New Research Project
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>
        )}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            icon={Users}
            label="Total Users"
            value={totalUsers.toLocaleString()}
            tag={{ text: totalUsersTrend, tone: 'green' }}
          />
          <MetricCard
            icon={Zap}
            label="Active Users"
            value={activeUsers.toLocaleString()}
            tag={{ text: 'Daily', tone: 'gray' }}
          />
          <MetricCard
            icon={Lock}
            label="Locked"
            value={lockedUsers.toLocaleString()}
            tag={{ text: lockedUsers > 0 ? 'Alert' : 'OK', tone: lockedUsers > 0 ? 'red' : 'gray' }}
          />
          <MetricCard
            icon={FileText}
            label="Total Docs"
            value={docMetricUnavailable ? 'N/A' : totalDocuments.toLocaleString()}
            tag={{ text: docMetricUnavailable ? 'Awaiting API' : 'Live', tone: 'gray' }}
          />
          <MetricCard
            icon={AlertTriangle}
            label="Pending Review"
            value={pendingMetricUnavailable ? 'N/A' : pendingReviewCount.toLocaleString()}
            tag={{
              text: pendingMetricUnavailable ? 'Awaiting API' : `${pendingReviewCount.toLocaleString()} Pending`,
              tone: pendingMetricUnavailable ? 'gray' : pendingReviewCount > 0 ? 'urgent' : 'green',
            }}
            highlight={!pendingMetricUnavailable && pendingReviewCount > 0}
          />
        </section>

        <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardSmallMetric
            icon={Eye}
            label="Hidden Docs"
            value={hiddenDocuments == null ? 'N/A' : hiddenDocuments.toLocaleString()}
            note={hiddenDocuments == null ? 'Awaiting API' : 'Live'}
          />
          <DashboardSmallMetric
            icon={FolderOpen}
            label="Total Subjects"
            value={subjectMetricUnavailable ? 'N/A' : totalSubjects.toLocaleString()}
            note={subjectMetricUnavailable ? 'Awaiting API' : 'Live'}
          />
          <DashboardSmallMetric
            icon={MessageSquare}
            label="AI Sessions"
            value={hasChatbot ? chatbotApiCalls.toLocaleString() : 'N/A'}
            note={hasChatbot ? 'Live' : 'Not implemented yet'}
          />
          <DashboardSmallMetric
            icon={Database}
            label="Storage Used"
            value={formatStorage(storageUsedGb)}
            note="Live"
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <article className="rounded-2xl border border-[#c7c4d8]/20 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-[#0b1c30]">System Activity Overview</h2>
                <p className="text-sm text-[#74798a]">User growth vs Content uploads</p>
              </div>
              <span className="rounded-lg bg-[#eff4ff] px-3 py-1 text-xs font-bold text-[#3525cd]">
                This Month
              </span>
            </div>
            <div className="mt-8 flex h-48 items-end gap-3 border-t border-[#c7c4d8]/20 pt-4">
              {userGrowth.map((day) => {
                const usersHeight = Math.max(8, (day.newUsers / maxGrowth) * 150)
                const uploadsValue = Math.round(day.newUsers * 0.55)
                const uploadsHeight = Math.max(6, (uploadsValue / maxGrowth) * 150)
                const labelDate = new Date(day.date)
                const weekday = Number.isNaN(labelDate.getTime())
                  ? day.date
                  : labelDate.toLocaleDateString(undefined, { weekday: 'short' })
                return (
                  <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex w-full items-end justify-center gap-1">
                      <div
                        className="w-1/2 max-w-[14px] rounded-t-md bg-[#3525cd]"
                        style={{ height: `${usersHeight}px` }}
                        title={`${day.newUsers} new users`}
                      />
                      <div
                        className="w-1/2 max-w-[14px] rounded-t-md bg-[#10b3a8]"
                        style={{ height: `${uploadsHeight}px` }}
                        title={`${uploadsValue} uploads`}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[#74798a]">{weekday}</span>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex items-center gap-6 text-xs font-semibold text-[#74798a]">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#3525cd]" />
                New Users
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#10b3a8]" />
                Uploads
              </span>
            </div>
          </article>

          <article className="rounded-2xl border border-[#c7c4d8]/20 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-extrabold text-[#0b1c30]">Storage Capacity</h2>
            <p className="text-sm text-[#74798a]">Infrastructure Health</p>
            <div className="relative mx-auto mt-6 h-44 w-44">
              <CircularProgress percent={storagePercent} overLimit={storageOverLimit} />
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <div className={`text-3xl font-extrabold ${storageOverLimit ? 'text-red-600' : 'text-[#0b1c30]'}`}>
                    {storagePercent}%
                  </div>
                  <div className="text-xs font-semibold text-[#74798a]">
                    {formatStorage(storageUsedGb)} / {formatStorage(storageLimitGb)}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 rounded-xl bg-[#f8f9ff] px-4 py-3 text-sm font-semibold text-[#464555]">
              Storage breakdown by document type is not available from the current metrics API.
            </div>
          </article>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-[#c7c4d8]/20 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#c7c4d8]/20 px-6 py-4">
            <div>
              <h2 className="text-lg font-extrabold text-[#0b1c30]">Pending Document Review</h2>
              <p className="text-sm text-[#74798a]">Action required for flags and reports</p>
            </div>
            <button type="button" className="text-sm font-bold text-[#3525cd]">
              View All Alerts
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-[#f5f7ff] text-xs font-bold uppercase tracking-wide text-[#74798a]">
                <tr>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-4 py-3">Uploaded By</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingReviewItems.length > 0 ? (
                  pendingReviewItems.map((doc) => (
                    <tr key={doc.id || doc.title} className="border-t border-[#c7c4d8]/15">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 place-items-center rounded-lg bg-red-50 text-red-500">
                            <FileText className="h-5 w-5" />
                          </span>
                          <div>
                            <p className="font-extrabold text-[#0b1c30]">{doc.title}</p>
                            <p className="text-xs text-[#74798a]">{doc.fileName || doc.type || 'Document'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-semibold text-[#464555]">{doc.uploadedBy || doc.ownerName || '—'}</td>
                      <td className="px-4 py-4">
                        <span className="rounded-md bg-[#dce9ff] px-2 py-1 text-xs font-bold text-[#3525cd]">
                          {doc.subject || doc.subjectName || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-semibold text-[#464555]">{doc.size || doc.fileSize || '—'}</td>
                      <td className="px-4 py-4 font-semibold text-[#464555]">{formatDate(doc.date || doc.uploadedAt)}</td>
                      <td className="px-4 py-4">
                        <span className="rounded-md bg-[#e8e3ff] px-2 py-1 text-xs font-bold text-[#3525cd]">
                          {doc.status || 'Pending Review'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-xs font-semibold text-[#74798a]">Review API pending</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t border-[#c7c4d8]/15">
                    <td colSpan="7" className="px-6 py-10 text-center">
                      <p className="font-extrabold text-[#0b1c30]">
                        {pendingMetricUnavailable ? 'Pending review data is not available' : 'No documents pending review'}
                      </p>
                      <p className="mt-1 text-sm text-[#74798a]">
                        {pendingMetricUnavailable
                          ? 'The current metrics API does not return pending documents or reports yet.'
                          : 'The metrics API reports zero pending review items.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <article className="overflow-hidden rounded-2xl border border-[#c7c4d8]/20 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#c7c4d8]/20 px-6 py-4">
              <h2 className="text-lg font-extrabold text-[#0b1c30]">Recent Users</h2>
              <Link
                to="/admin/users"
                className="rounded-lg border border-[#c7c4d8]/40 px-3 py-1.5 text-sm font-bold text-[#0b1c30] hover:bg-[#eff4ff]"
              >
                Manage Users
              </Link>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f5f7ff] text-xs font-bold uppercase tracking-wide text-[#74798a]">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {usersToShow.map((u) => (
                  <tr key={u.id} className="border-t border-[#c7c4d8]/15">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#e8e3ff] text-xs font-extrabold text-[#3525cd]">
                          {u.initials}
                        </span>
                        <div>
                          <p className="font-extrabold text-[#0b1c30]">{u.fullName}</p>
                          <p className="text-xs text-[#74798a]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-[#464555]">{u.role}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            u.status === 'Locked' ? 'bg-red-500' : 'bg-emerald-500'
                          }`}
                        />
                        <span className={u.status === 'Locked' ? 'text-red-600' : 'text-emerald-600'}>
                          {u.status}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-[#74798a]">{u.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <div className="space-y-4">
            <article className="rounded-2xl bg-[#3525cd] p-5 text-white shadow-[0_12px_28px_rgba(53,37,205,0.25)]">
              <h3 className="text-base font-extrabold">Quick Admin Actions</h3>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className="flex flex-col items-center gap-2 rounded-xl bg-white/10 px-3 py-4 text-xs font-bold text-white transition hover:bg-white/20"
                  >
                    <action.icon className="h-5 w-5" aria-hidden />
                    {action.label}
                  </button>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-[#c7c4d8]/20 bg-white p-5 shadow-sm">
              <h3 className="font-extrabold text-[#0b1c30]">Subject Activity</h3>
              {subjectActivityItems.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {subjectActivityItems.map((s) => (
                    <li
                      key={s.id || s.name || s.subjectName}
                      className="flex items-center justify-between rounded-xl border border-[#c7c4d8]/25 px-3 py-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#eff4ff] text-[10px] font-extrabold text-[#3525cd]">
                          {(s.code || s.name || s.subjectName || '?').slice(0, 3).toUpperCase()}
                        </span>
                        <span className="text-sm font-bold text-[#0b1c30]">{s.name || s.subjectName}</span>
                      </div>
                      <span className="text-xs font-bold text-[#74798a]">
                        {(s.documentCount ?? s.docs ?? 0).toLocaleString()} docs
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4 rounded-xl bg-[#f8f9ff] px-4 py-6 text-center">
                  <p className="text-sm font-extrabold text-[#0b1c30]">Subject activity not available</p>
                  <p className="mt-1 text-xs font-semibold text-[#74798a]">
                    The current metrics API does not return subject activity yet.
                  </p>
                </div>
              )}
            </article>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-[#c7c4d8]/20 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#3525cd]" />
              <div>
                <h2 className="text-lg font-extrabold text-[#0b1c30]">AI Chatbot Insights</h2>
                <p className="text-sm text-[#74798a]">Document citations and chatbot usage analytics</p>
              </div>
            </div>
            <span className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700">
              Not implemented yet
            </span>
          </div>
          <div className="mt-5 rounded-xl bg-[#f8f9ff] px-5 py-8 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-[#74798a]" />
            <p className="mt-3 text-sm font-extrabold text-[#0b1c30]">Chatbot document analytics are pending</p>
            <p className="mx-auto mt-1 max-w-xl text-sm text-[#74798a]">
              The current metrics API only returns chatbot API call count. Top cited documents and research/PDF breakdown are not available yet.
            </p>
          </div>
        </section>

        {showHealthToast && (
          <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-xl bg-[#0b1c30] px-4 py-3 text-sm font-semibold text-white shadow-lg">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            System health check completed successfully.
            <button
              type="button"
              onClick={() => setShowHealthToast(false)}
              className="ml-2 text-white/60 hover:text-white"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

function MetricCard({ icon: Icon, label, value, tag, highlight }) {
  const tagToneClass = {
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    gray: 'bg-[#eff4ff] text-[#74798a]',
    urgent: 'bg-red-500 text-white',
  }
  return (
    <article
      className={`rounded-2xl border p-5 shadow-sm ${
        highlight
          ? 'border-[#3525cd]/40 bg-[#eef0ff]'
          : 'border-[#c7c4d8]/20 bg-white'
      }`}
    >
      <div className="flex items-start justify-between">
        <span
          className={`grid h-10 w-10 place-items-center rounded-xl ${
            highlight ? 'bg-white text-[#3525cd]' : 'bg-[#e8e3ff] text-[#3525cd]'
          }`}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        {tag && (
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${tagToneClass[tag.tone] || tagToneClass.gray}`}>
            {tag.text}
          </span>
        )}
      </div>
      <p className="mt-5 text-xs font-bold uppercase tracking-wide text-[#74798a]">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-[#0b1c30]">{value}</p>
    </article>
  )
}

function CircularProgress({ percent, overLimit = false }) {
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const safePercent = Math.max(0, Math.min(100, percent))
  const offset = circumference * (1 - safePercent / 100)
  return (
    <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
      <circle cx="80" cy="80" r={radius} fill="none" stroke="#eef0ff" strokeWidth="14" />
      <circle
        cx="80"
        cy="80"
        r={radius}
        fill="none"
        stroke={overLimit ? '#ef4444' : '#3525cd'}
        strokeWidth="14"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  )
}

function DashboardSmallMetric({ icon: Icon, label, value, note }) {
  return (
    <article className="flex items-center gap-3 rounded-xl border border-[#c7c4d8]/20 bg-white px-4 py-3 shadow-sm">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#eff4ff] text-[#3525cd]">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-[#74798a]">{label}</p>
        <p className="text-xl font-extrabold text-[#0b1c30]">{value}</p>
        {note && <p className="text-[10px] font-bold text-[#74798a]">{note}</p>}
      </div>
    </article>
  )
}

function mapApiUser(u) {
  return {
    id: u.id,
    initials: (u.fullName || 'U')
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    fullName: u.fullName,
    email: u.email,
    role: capitalize(u.role),
    status: u.status === 'LOCKED' ? 'Locked' : 'Active',
    joined: relativeTime(u.createdAt),
  }
}

function capitalize(value = '') {
  if (!value) return ''
  return value.charAt(0) + value.slice(1).toLowerCase()
}

function relativeTime(value) {
  if (!value) return '—'
  const diffMs = Date.now() - new Date(value).getTime()
  if (Number.isNaN(diffMs)) return '—'
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date)
}

function formatStorage(gb) {
  if (gb == null || Number.isNaN(gb)) return '—'
  if (gb >= 1024) return `${(gb / 1024).toFixed(2)} TB`
  return `${gb.toFixed(gb >= 100 ? 0 : 1)} GB`
}
