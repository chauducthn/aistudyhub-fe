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
  MessageSquare,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'
import DashboardShell from '../components/DashboardShell'
import { useAuth } from '../context/useAuth'
import { getDashboardMetrics, listReports, listUsers } from '../api/adminApi'
import { getApiErrorMessage } from '../utils/apiError'
import { MetricCard, DashboardSmallMetric, BreakdownRow, CircularProgress } from '../components/admin/AdminWidgets'
import { mapApiUser, formatStorage, formatReason, formatDate } from '../utils/formatters'

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState(null)
  const [recentUsers, setRecentUsers] = useState([])
  const [pendingReports, setPendingReports] = useState([])
  const [pendingReportsTotal, setPendingReportsTotal] = useState(0)
  const [error, setError] = useState('')
  const [showHealthToast, setShowHealthToast] = useState(true)

  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        const [metricsRes, usersRes, reportsRes] = await Promise.all([
          getDashboardMetrics(),
          listUsers({ page: 0, size: 7 }),
          listReports({ status: 'PENDING', page: 0, size: 5 }),
        ])
        if (ignore) return
        if (metricsRes.success) setMetrics(metricsRes.data)
        if (usersRes.success) setRecentUsers(usersRes.data?.content || [])
        if (reportsRes.success) {
          setPendingReports(reportsRes.data?.content || [])
          setPendingReportsTotal(reportsRes.data?.totalElements ?? 0)
        }
      } catch (err) {
        if (!ignore) setError(getApiErrorMessage(err, 'Could not load admin dashboard.'))
      }
    })()
    return () => {
      ignore = true
    }
  }, [])

  const firstName = user?.fullName?.split(' ')[0] || 'Admin'
  const usersToShow = recentUsers.map(mapApiUser)

  const totalUsers = metrics?.totalUsers ?? 0
  const activeUsers = metrics?.activeUsers ?? 0
  const lockedUsers = metrics?.lockedUsers ?? 0
  const newUsers7d = metrics?.newUsersLast7Days ?? 0
  const chatbotApiCalls = metrics?.chatbotApiCalls ?? 0

  const storage = metrics?.storage
  const storagePercent = storage?.percentUsed != null ? Math.round(storage.percentUsed) : 0
  const storageUsedGb = storage?.usedGb ?? 0
  const storageLimitGb = storage?.limitGb ?? 0
  const storageOverLimit = storage?.overLimit ?? false

  const userGrowth = metrics?.userGrowth ?? []
  const maxGrowth = Math.max(...userGrowth.map((g) => g.newUsers), 1)
  const totalUsersTrend = `+${newUsers7d.toLocaleString()} (7d)`

  const totalDocuments = metrics?.documents?.totalDocuments
  const publicDocuments = metrics?.documents?.publicDocuments
  const privateDocuments = metrics?.documents?.privateDocuments
  const hiddenDocuments = metrics?.documents?.hiddenDocuments
  const totalSubjects = metrics?.subjects?.totalSubjects
  const pendingReviewCount = metrics?.reports?.pendingReports

  const hasChatbot = chatbotApiCalls > 0
  const metricsLoaded = metrics != null
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
          <Link
            to="/admin/users"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#3525cd] px-6 text-sm font-bold text-white shadow-[0_8px_20px_rgba(53,37,205,0.25)]"
          >
            <Users className="h-4 w-4" />
            Manage Users
          </Link>
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
                <h2 className="text-lg font-extrabold text-[#0b1c30]">New User Growth</h2>
                <p className="text-sm text-[#74798a]">New sign-ups per day</p>
              </div>
              <span className="rounded-lg bg-[#eff4ff] px-3 py-1 text-xs font-bold text-[#3525cd]">
                Last 7 Days
              </span>
            </div>
            {userGrowth.length > 0 ? (
              <>
                <div className="mt-8 flex h-48 items-end gap-3 border-t border-[#c7c4d8]/20 pt-4">
                  {userGrowth.map((day) => {
                    const usersHeight = Math.max(8, (day.newUsers / maxGrowth) * 150)
                    const labelDate = new Date(day.date)
                    const weekday = Number.isNaN(labelDate.getTime())
                      ? day.date
                      : labelDate.toLocaleDateString(undefined, { weekday: 'short' })
                    return (
                      <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                        <span className="text-[10px] font-bold text-[#3525cd]">{day.newUsers}</span>
                        <div
                          className="w-full max-w-[28px] rounded-t-md bg-[#3525cd]"
                          style={{ height: `${usersHeight}px` }}
                          title={`${day.newUsers} new users`}
                        />
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
                </div>
              </>
            ) : (
              <div className="mt-6 rounded-xl bg-[#f8f9ff] px-4 py-10 text-center text-sm font-semibold text-[#74798a]">
                {metricsLoaded ? 'No new users in the last 7 days.' : 'Loading user growth...'}
              </div>
            )}
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
              <h2 className="text-lg font-extrabold text-[#0b1c30]">Pending Document Reports</h2>
              <p className="text-sm text-[#74798a]">
                {pendingReportsTotal > 0
                  ? `${pendingReportsTotal.toLocaleString()} report${pendingReportsTotal === 1 ? '' : 's'} awaiting review`
                  : 'User-submitted reports awaiting review'}
              </p>
            </div>
            <Link to="/admin/users" className="text-sm font-bold text-[#3525cd]">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-[#f5f7ff] text-xs font-bold uppercase tracking-wide text-[#74798a]">
                <tr>
                  <th className="px-6 py-3">Document</th>
                  <th className="px-4 py-3">Reported By</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingReports.length > 0 ? (
                  pendingReports.map((report) => (
                    <tr key={report.id} className="border-t border-[#c7c4d8]/15">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 place-items-center rounded-lg bg-red-50 text-red-500">
                            <FileText className="h-5 w-5" />
                          </span>
                          <div>
                            <p className="font-extrabold text-[#0b1c30]">{report.documentTitle || `Document #${report.documentId}`}</p>
                            <p className="max-w-xs truncate text-xs text-[#74798a]">{report.description || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-semibold text-[#464555]">{report.reporterEmail || '—'}</td>
                      <td className="px-4 py-4">
                        <span className="rounded-md bg-[#dce9ff] px-2 py-1 text-xs font-bold text-[#3525cd]">
                          {formatReason(report.reason)}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-semibold text-[#464555]">{formatDate(report.createdAt)}</td>
                      <td className="px-4 py-4">
                        <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
                          {report.status || 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t border-[#c7c4d8]/15">
                    <td colSpan="5" className="px-6 py-10 text-center">
                      <p className="font-extrabold text-[#0b1c30]">No documents pending review</p>
                      <p className="mt-1 text-sm text-[#74798a]">
                        There are no user-submitted reports awaiting review.
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
                {usersToShow.length > 0 ? (
                  usersToShow.map((u) => (
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
                  ))
                ) : (
                  <tr className="border-t border-[#c7c4d8]/15">
                    <td colSpan="4" className="px-6 py-10 text-center text-sm font-semibold text-[#74798a]">
                      {metricsLoaded ? 'No users found.' : 'Loading users...'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </article>

          <div className="space-y-4">
            <article className="rounded-2xl border border-[#c7c4d8]/20 bg-white p-5 shadow-sm">
              <h3 className="font-extrabold text-[#0b1c30]">Document Breakdown</h3>
              {docMetricUnavailable ? (
                <div className="mt-4 rounded-xl bg-[#f8f9ff] px-4 py-6 text-center text-xs font-semibold text-[#74798a]">
                  {metricsLoaded ? 'No document data available.' : 'Loading...'}
                </div>
              ) : (
                <ul className="mt-4 space-y-2.5">
                  <BreakdownRow label="Total" value={totalDocuments} tone="bg-[#3525cd]" />
                  <BreakdownRow label="Public" value={publicDocuments} tone="bg-emerald-500" />
                  <BreakdownRow label="Private" value={privateDocuments} tone="bg-slate-400" />
                  <BreakdownRow label="Hidden" value={hiddenDocuments} tone="bg-amber-500" />
                </ul>
              )}
            </article>

            <article className="rounded-2xl border border-[#c7c4d8]/20 bg-white p-5 shadow-sm">
              <h3 className="font-extrabold text-[#0b1c30]">Reports Overview</h3>
              {metrics?.reports ? (
                <ul className="mt-4 space-y-2.5">
                  <BreakdownRow label="Pending" value={metrics.reports.pendingReports} tone="bg-amber-500" />
                  <BreakdownRow label="Reviewed" value={metrics.reports.reviewedReports} tone="bg-[#3525cd]" />
                  <BreakdownRow label="Resolved" value={metrics.reports.resolvedReports} tone="bg-emerald-500" />
                  <BreakdownRow label="Rejected" value={metrics.reports.rejectedReports} tone="bg-red-500" />
                </ul>
              ) : (
                <div className="mt-4 rounded-xl bg-[#f8f9ff] px-4 py-6 text-center text-xs font-semibold text-[#74798a]">
                  {metricsLoaded ? 'No report data available.' : 'Loading...'}
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
