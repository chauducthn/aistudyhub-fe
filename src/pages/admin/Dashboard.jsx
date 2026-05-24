import { useState, useEffect } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { adminApi } from '../../api/admin'
import {
  Bot, LayoutDashboard, Users, FolderOpen, BarChart2, Bell, Settings, LogOut,
  Plus, Lock, Archive, Eye, EyeOff, FileText, FilePen,
  UserPlus, Database, HardDrive, Mail, Wrench, Search,
  TrendingUp, AlertTriangle, Code, Brain, Globe, Star, BookOpen,
} from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users',     icon: Users,           label: 'Users' },
  { to: '/admin/documents', icon: FolderOpen,      label: 'Documents' },
  { to: '/admin/reports',   icon: BarChart2,       label: 'Reports' },
  { to: '/admin/alerts',    icon: Bell,            label: 'Alerts' },
  { to: '/admin/settings',  icon: Settings,        label: 'Settings' },
]
const SUBJECT_ICONS = { code: Code, database: Database, brain: Brain, globe: Globe }
const SUBJECT_COLORS = {
  blue:   { bg: 'bg-blue-100',   text: 'text-blue-600' },
  green:  { bg: 'bg-emerald-100',text: 'text-emerald-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
}

function Sidebar({ user, onLogout }) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-slate-900 flex flex-col z-50">
      <div className="px-5 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <img src="https://www.figma.com/api/mcp/asset/99690260-2605-4fec-adfe-832c043be81b" alt="AI Study Hub" className="w-9 h-9 flex-shrink-0" />
          <span className="font-bold text-white text-sm">AI Study Hub</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => clsx(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
            isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          )}>
            {({ isActive }) => (
              <>
                <Icon className={clsx('w-5 h-5 flex-shrink-0', isActive ? 'text-white' : 'text-slate-500')} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-800 mb-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {user?.initials || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-slate-800 transition-colors">
          <LogOut className="w-5 h-5 flex-shrink-0" /> Log Out
        </button>
      </div>
    </aside>
  )
}

function StatCard({ icon: Icon, iconBg, iconText, value, label, badge, badgeColor }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
          <Icon className={clsx('w-5 h-5', iconText)} />
        </div>
        {badge && (
          <span className={clsx('text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0', badgeColor)}>{badge}</span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [pendingDocs, setPendingDocs] = useState([])
  const [topDocs, setTopDocs] = useState([])
  const [subjectActivity, setSubjectActivity] = useState([])
  const [chartPeriod, setChartPeriod] = useState('Today')

  useEffect(() => {
    Promise.all([
      adminApi.getStats(), adminApi.getUsers(),
      adminApi.getPendingDocs(), adminApi.getTopDocs(), adminApi.getSubjectActivity(),
    ]).then(([s, u, pd, td, sa]) => {
      setStats(s); setUsers(u); setPendingDocs(pd); setTopDocs(td); setSubjectActivity(sa)
    })
  }, [])

  const handleLogout = async () => { await logout(); navigate('/auth') }
  const storagePct = stats ? Math.round((stats.storageUsed / stats.storageTotal) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar user={user} onLogout={handleLogout} />

      <div className="flex-1 ml-60 flex flex-col min-h-screen">

        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              placeholder="Search users, documents..."
              className="pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 w-72 transition"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.initials || 'A'}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6">


          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, Admin!</h1>
              <p className="text-gray-500 text-sm mt-1">Monitor system activity, review documents, and manage AI Study Hub.</p>
            </div>
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors flex-shrink-0">
              <Plus className="w-4 h-4" /> New Research Project
            </button>
          </div>


          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <StatCard icon={Users}        iconBg="bg-blue-50"   iconText="text-blue-600"   value={stats.totalUsers.toLocaleString()}        label="Total Users"       badge={stats.userGrowth}  badgeColor="text-emerald-600 bg-emerald-50" />
              <StatCard icon={TrendingUp}   iconBg="bg-green-50"  iconText="text-green-600"  value={stats.dailyActiveUsers.toLocaleString()}  label="Daily Active"       badge="Daily"             badgeColor="text-blue-600 bg-blue-50" />
              <StatCard icon={Lock}         iconBg="bg-red-50"    iconText="text-red-500"    value={stats.lockedAccounts}                     label="Locked Accounts"   badge="Alert"             badgeColor="text-orange-600 bg-orange-50" />
              <StatCard icon={Archive}      iconBg="bg-slate-100" iconText="text-slate-600"  value={stats.totalDocs}                          label="Total Documents"   />
              <StatCard icon={AlertTriangle}iconBg="bg-orange-50" iconText="text-orange-500" value={stats.pendingReview}                      label="Pending Review"    badge="Urgent"            badgeColor="text-red-600 bg-red-50" />
            </div>
          )}


          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Hidden Docs',     value: stats.hiddenDocs },
                { label: 'Total Subjects',  value: stats.totalSubjects },
                { label: 'AI Sessions',     value: stats.aiSessions.toLocaleString() },
                { label: 'Storage Used',    value: `${stats.storageUsed} TB` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid xl:grid-cols-3 gap-6">

            <div className="xl:col-span-2 space-y-6">


              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="font-semibold text-gray-900">System Activity Overview</h2>
                    <p className="text-xs text-gray-400 mt-0.5">User growth vs Content uploads</p>
                  </div>
                  <div className="flex gap-1">
                    {['Today', 'This Week', 'This Month'].map(p => (
                      <button key={p} onClick={() => setChartPeriod(p)} className={clsx(
                        'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors',
                        chartPeriod === p ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'
                      )}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-40 flex items-end gap-1.5">
                  {[40,65,45,80,55,90,70,85,60,95,75,88].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col gap-1 items-stretch min-w-0">
                      <div className="bg-indigo-200 rounded-t flex-none" style={{ height: `${h * 0.6}px` }} />
                      <div className="bg-indigo-500 rounded-t flex-none" style={{ height: `${h * 0.4}px` }} />
                    </div>
                  ))}
                </div>
                <div className="flex gap-5 mt-3">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-3 h-3 rounded bg-indigo-500 inline-block" /> New Users
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-3 h-3 rounded bg-indigo-200 inline-block" /> Uploads
                  </div>
                </div>
              </div>


              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Pending Document Review</h2>
                  <button className="text-sm text-indigo-600 hover:underline font-medium">View All Alerts</button>
                </div>

                <div className="divide-y divide-gray-50">
                  {pendingDocs.map(doc => (
                    <div key={doc.id} className="px-5 py-4 flex items-center gap-4">
                      <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', doc.type === 'PDF' ? 'bg-red-50' : 'bg-blue-50')}>
                        {doc.type === 'PDF'
                          ? <FileText className="w-5 h-5 text-red-500" />
                          : <FilePen  className="w-5 h-5 text-blue-500" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{doc.type} — {doc.pages} Pages</p>
                      </div>
                      <span className={clsx('text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0',
                        doc.flag === 'High Report Count' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                      )}>
                        {doc.flag}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors">
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button className="flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-100 transition-colors">
                          <EyeOff className="w-3.5 h-3.5" /> Block
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-5 py-4 border-t border-gray-100 overflow-x-auto">
                  <table className="w-full text-sm min-w-[600px]">
                    <thead>
                      <tr>
                        {['Title','Uploaded By','Subject','Size','Date','Status','Actions'].map(h => (
                          <th key={h} className="text-left py-2 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pendingDocs.map(doc => (
                        <tr key={doc.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 pr-4 font-medium text-gray-800 truncate max-w-xs">{doc.name}</td>
                          <td className="py-2.5 pr-4 text-gray-500">{doc.uploadedBy}</td>
                          <td className="py-2.5 pr-4 text-gray-500">{doc.subject}</td>
                          <td className="py-2.5 pr-4 text-gray-500">{doc.size}</td>
                          <td className="py-2.5 pr-4 text-gray-500">{doc.date}</td>
                          <td className="py-2.5 pr-4">
                            <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium">{doc.flag}</span>
                          </td>
                          <td className="py-2.5">
                            <button className="text-indigo-600 hover:underline text-xs font-semibold">Review</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>


              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Recent Users</h2>
                  <button className="text-sm text-indigo-600 hover:underline font-medium">Manage Users</button>
                </div>
                <div className="divide-y divide-gray-50">
                  {users.map(u => (
                    <div key={u.id} className="px-5 py-3.5 flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {u.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">{u.role}</span>
                      <span className={clsx('text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0',
                        u.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                      )}>
                        {u.status}
                      </span>
                      <span className="text-xs text-gray-400 flex-shrink-0 w-24 text-right">{u.joined}</span>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-4 border-t border-gray-100 overflow-x-auto">
                  <table className="w-full text-sm min-w-[400px]">
                    <thead>
                      <tr>
                        {['Name','Role','Status','Joined'].map(h => (
                          <th key={h} className="text-left py-2 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 pr-4 font-medium text-gray-800">{u.name}</td>
                          <td className="py-2.5 pr-4 text-gray-500">{u.role}</td>
                          <td className="py-2.5 pr-4">
                            <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full',
                              u.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                            )}>
                              {u.status}
                            </span>
                          </td>
                          <td className="py-2.5 text-gray-500">{u.joined}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>


            <div className="space-y-5">


              {stats && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <h2 className="font-semibold text-gray-900 mb-1">Storage Capacity</h2>
                  <p className="text-xs text-gray-400 mb-4">Infrastructure Health</p>

                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all" style={{ width: `${storagePct}%` }} />
                    </div>
                    <span className="text-sm font-bold text-gray-900 flex-shrink-0">{storagePct}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-5">{stats.storageUsed} / {stats.storageTotal} TB</p>

                  <div className="space-y-3.5">
                    {[
                      { label: 'PDF Documents',            val: 2.8, pct: 50, color: 'bg-red-400' },
                      { label: 'Office Files (DOCX/PPTX)', val: 1.1, pct: 20, color: 'bg-blue-400' },
                      { label: 'System Metadata',          val: 0.3, pct: 6,  color: 'bg-gray-300' },
                    ].map(({ label, val, pct, color }) => (
                      <div key={label}>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-gray-600">{label}</span>
                          <span className="font-semibold text-gray-900">{val} TB</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className={clsx('h-1.5 rounded-full', color)} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h2 className="font-semibold text-gray-900 mb-4">Quick Admin Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: UserPlus, label: 'Invite Admin',  bg: 'bg-indigo-50',  text: 'text-indigo-600' },
                    { icon: HardDrive,label: 'Backup DB',     bg: 'bg-emerald-50', text: 'text-emerald-600' },
                    { icon: Mail,     label: 'Broadcast',     bg: 'bg-blue-50',    text: 'text-blue-600' },
                    { icon: Wrench,   label: 'Maintenance',   bg: 'bg-orange-50',  text: 'text-orange-600' },
                  ].map(({ icon: Icon, label, bg, text }) => (
                    <button key={label} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', bg)}>
                        <Icon className={clsx('w-5 h-5', text)} />
                      </div>
                      <span className="text-xs font-medium text-gray-700">{label}</span>
                    </button>
                  ))}
                </div>
              </div>


              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h2 className="font-semibold text-gray-900 mb-4">Subject Activity</h2>
                <div className="space-y-3">
                  {subjectActivity.map(s => {
                    const Icon = SUBJECT_ICONS[s.icon] || BookOpen
                    const colors = SUBJECT_COLORS[s.color] || SUBJECT_COLORS.blue
                    return (
                      <div key={s.name} className="flex items-center gap-3">
                        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', colors.bg)}>
                          <Icon className={clsx('w-5 h-5', colors.text)} />
                        </div>
                        <p className="flex-1 text-sm font-medium text-gray-900 truncate">{s.name}</p>
                        <span className="text-xs font-semibold text-gray-600 flex-shrink-0">{s.docs} docs</span>
                      </div>
                    )
                  })}
                </div>
              </div>


              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <h2 className="font-semibold text-gray-900">Most Asked Documents</h2>
                </div>
                <p className="text-xs text-gray-400 mb-4">Top documents cited in AI Chat sessions</p>
                <div className="space-y-4">
                  {topDocs.map(doc => (
                    <div key={doc.rank} className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        {doc.type === 'PDF'
                          ? <FileText className="w-4 h-4 text-indigo-600" />
                          : <FilePen  className="w-4 h-4 text-indigo-600" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 leading-snug">{doc.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{doc.refs} references • {doc.subject}</p>
                      </div>
                      <span className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        #{doc.rank}
                      </span>
                    </div>
                  ))}
                </div>
              </div>


              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                <p className="text-xs text-emerald-700 font-medium">System health check completed successfully.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
