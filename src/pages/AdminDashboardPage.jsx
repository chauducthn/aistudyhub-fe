import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardShell from '../components/DashboardShell'
import { getAdminMetrics } from '../api/adminApi'
import { getApiErrorMessage } from '../utils/apiError'

const emptyMetrics = {
  totalUsers: 0,
  activeUsers: 0,
  lockedUsers: 0,
  newUsersLast7Days: 0,
  chatbotApiCalls: 0,
  storage: {
    usedGb: 0,
    limitGb: 5,
    percentUsed: 0,
    overLimit: false,
  },
  userGrowth: [],
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(emptyMetrics)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    async function loadMetrics() {
      setLoading(true)
      setError('')
      try {
        const response = await getAdminMetrics()
        if (!response.success) {
          throw new Error(response.message || 'Could not load admin metrics.')
        }
        if (!ignore) setMetrics(response.data)
      } catch (err) {
        if (!ignore) setError(getApiErrorMessage(err, 'Could not load admin metrics.'))
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    void loadMetrics()
    return () => {
      ignore = true
    }
  }, [])

  return (
    <DashboardShell type="admin">
      <div className="px-8 py-10 lg:px-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div>
            <h1 className="text-4xl font-extrabold">Admin Dashboard</h1>
            <p className="mt-3 text-xl font-semibold text-[#4f5668]">
              Monitor account status, storage capacity, and platform usage.
            </p>
          </div>
          <Link
            to="/admin/users"
            className="inline-flex h-14 items-center rounded-xl bg-[#3b2be0] px-7 text-base font-bold text-white"
          >
            Manage Users
          </Link>
        </div>

        {error && <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}

        <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <Metric label="Total Users" value={formatNumber(metrics.totalUsers)} tag={loading ? 'Loading' : 'All'} />
          <Metric label="Active Users" value={formatNumber(metrics.activeUsers)} tag="ACTIVE" />
          <Metric label="Locked Accounts" value={formatNumber(metrics.lockedUsers)} tag="LOCKED" danger />
          <Metric label="New Users" value={formatNumber(metrics.newUsersLast7Days)} tag="7 days" />
          <Metric label="Chatbot API Calls" value={formatNumber(metrics.chatbotApiCalls)} tag="Total" />
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-[2fr_1fr]">
          <article className="rounded-2xl bg-white p-8 shadow-sm">
            <div className="flex justify-between gap-6">
              <div>
                <h2 className="text-2xl font-extrabold">New User Growth</h2>
                <p className="font-semibold text-slate-500">Daily registrations over the last 7 days</p>
              </div>
              <span className="rounded-lg border border-slate-200 bg-[#edf2fa] px-5 py-3 text-sm font-bold">
                Last 7 days
              </span>
            </div>
            <LineChart data={metrics.userGrowth} />
          </article>

          <article className="rounded-2xl bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-extrabold">Storage Capacity</h2>
            <p className="font-semibold text-slate-500">Physical uploaded files limit: 5GB</p>
            <div
              className="mx-auto mt-10 grid h-48 w-48 place-items-center rounded-full"
              style={{
                background: `conic-gradient(#3b2be0 ${Math.min(metrics.storage.percentUsed, 100)}%, #dfe8ff 0)`,
              }}
            >
              <div className="grid h-36 w-36 place-items-center rounded-full bg-white text-center">
                <div>
                  <div className="text-4xl font-extrabold">{metrics.storage.percentUsed}%</div>
                  <div className="mt-1 text-sm font-bold text-slate-500">
                    {metrics.storage.usedGb} / {metrics.storage.limitGb} GB
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`mt-8 rounded-lg px-4 py-3 text-sm font-bold ${
                metrics.storage.overLimit ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
              }`}
            >
              {metrics.storage.overLimit ? 'Storage limit exceeded' : 'Storage usage is within the 5GB limit'}
            </div>
          </article>
        </section>
      </div>
    </DashboardShell>
  )
}

function Metric({ label, value, tag, danger = false }) {
  return (
    <article className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex justify-between">
        <span className={`grid h-10 w-10 place-items-center rounded-lg ${danger ? 'bg-red-50 text-red-600' : 'bg-[#e8e3ff] text-[#3427d9]'}`}>
          □
        </span>
        <span className={`rounded-md px-3 py-1 text-xs font-extrabold ${danger ? 'bg-red-50 text-red-600' : 'bg-[#edf2fa] text-[#3427d9]'}`}>
          {tag}
        </span>
      </div>
      <div className="mt-7 text-xs font-extrabold uppercase text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-extrabold">{value}</div>
    </article>
  )
}

function LineChart({ data = [] }) {
  const max = Math.max(...data.map((item) => item.newUsers), 1)
  const points = data.map((item, index) => {
    const x = data.length === 1 ? 0 : (index / (data.length - 1)) * 100
    const y = 100 - (item.newUsers / max) * 86
    return `${x},${y}`
  })

  return (
    <div className="mt-10">
      <svg viewBox="0 0 100 100" className="h-64 w-full overflow-visible">
        <polyline points={points.join(' ')} fill="none" stroke="#3b2be0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((item, index) => {
          const [x, y] = points[index].split(',').map(Number)
          return <circle key={item.date} cx={x} cy={y} r="2.8" fill="#3b2be0" />
        })}
      </svg>
      <div className="mt-4 grid grid-cols-7 text-center text-xs font-bold text-slate-500">
        {data.map((item) => (
          <span key={item.date}>{item.date.slice(5)}</span>
        ))}
      </div>
    </div>
  )
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value || 0)
}
