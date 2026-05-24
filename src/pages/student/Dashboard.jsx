import { useState, useEffect } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { studentApi } from '../../api/student'
import {
  Bot, LayoutDashboard, FolderOpen, BookOpen, Download, Bell, LogOut,
  Plus, FileText, FilePen, Sparkles, MoreVertical, Send, Upload,
  Code, Database, Brain, Globe, ChevronRight, Search,
} from 'lucide-react'
import clsx from 'clsx'

const SUBJECT_ICONS = { code: Code, database: Database, brain: Brain, globe: Globe }
const SUBJECT_COLORS = {
  blue:   { bg: 'bg-blue-100',   text: 'text-blue-600' },
  green:  { bg: 'bg-emerald-100',text: 'text-emerald-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
}

const NAV = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/documents', icon: FolderOpen,       label: 'Documents' },
  { to: '/student/subjects',  icon: BookOpen,          label: 'Subjects' },
  { to: '/student/downloads', icon: Download,          label: 'Downloads' },
  { to: '/student/alerts',    icon: Bell,              label: 'Alerts' },
]

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
            {user?.initials || 'U'}
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

function StatCard({ icon: Icon, value, label, sub, iconBg, iconText }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center', iconBg)}>
          <Icon className={clsx('w-5 h-5', iconText)} />
        </div>
        {sub && <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">{sub}</span>}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [documents, setDocuments] = useState([])
  const [subjects, setSubjects] = useState([])
  const [chatMsg, setChatMsg] = useState('')
  const [chat, setChat] = useState([
    { role: 'user',      text: 'Summarize this document for me' },
    { role: 'assistant', text: "Here is a short summary of Quantum_Physics_Vol4.pdf. This volume covers Heisenberg's uncertainty principle, wave-particle duality, and the mathematical foundations of Schrödinger's equation in various potentials..." },
  ])

  useEffect(() => {
    Promise.all([studentApi.getStats(), studentApi.getDocuments(), studentApi.getSubjects()])
      .then(([s, d, sub]) => { setStats(s); setDocuments(d); setSubjects(sub) })
  }, [])

  const handleLogout = async () => { await logout(); navigate('/auth') }

  const sendChat = () => {
    if (!chatMsg.trim()) return
    setChat(h => [...h, { role: 'user', text: chatMsg }])
    setChatMsg('')
    setTimeout(() => setChat(h => [...h, { role: 'assistant', text: 'Based on your uploaded documents, here is what I found...' }]), 800)
  }

  const storagePct = stats ? Math.round((stats.storageUsed / stats.storageTotal) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar user={user} onLogout={handleLogout} />

      <div className="flex-1 ml-60 flex flex-col min-h-screen">

        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              placeholder="Search documents..."
              className="pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 w-64 transition"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.initials || 'U'}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6">


          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Manage your study documents and continue learning with your AI assistant.{' '}
                {stats && (
                  <span className="text-indigo-600 font-medium">
                    You have {stats.newDocuments} documents waiting for review.
                  </span>
                )}
              </p>
            </div>
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors flex-shrink-0">
              <Plus className="w-4 h-4" /> Upload New Document
            </button>
          </div>


          {stats && (
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard icon={FileText} value={stats.totalDocuments.toLocaleString()} label="Total Documents" sub={`+${stats.newDocuments} new`} iconBg="bg-blue-50" iconText="text-blue-600" />
              <StatCard icon={BookOpen} value={stats.activeSubjects}                  label="Active Subjects"                                    iconBg="bg-purple-50" iconText="text-purple-600" />
              <StatCard icon={Bot}      value={stats.aiChatSessions}                  label="AI Chat Sessions"                                   iconBg="bg-indigo-50" iconText="text-indigo-600" />
              <StatCard icon={Download} value={stats.recentDownloads}                 label="Recent Downloads"                                   iconBg="bg-emerald-50" iconText="text-emerald-600" />
            </div>
          )}

          <div className="grid xl:grid-cols-3 gap-6">

            <div className="xl:col-span-2 space-y-5">


              {stats && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-gray-900">Storage Used</p>
                    <p className="text-sm text-gray-500">{stats.storageUsed}GB / {stats.storageTotal}GB</p>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 mb-3">
                    <div className="bg-indigo-600 h-2.5 rounded-full transition-all" style={{ width: `${storagePct}%` }} />
                  </div>
                  <div className="flex items-center gap-5">
                    {stats.storageBreakdown.map(({ type, pct }) => (
                      <div key={type} className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-2.5 h-2.5 rounded-sm bg-indigo-300 inline-block" />
                        {type} {pct}%
                      </div>
                    ))}
                  </div>
                </div>
              )}


              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Recent Documents</h2>
                  <button className="text-sm text-indigo-600 hover:underline font-medium">View All</button>
                </div>


                <div className="divide-y divide-gray-50">
                  {documents.map(doc => (
                    <div key={doc.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', doc.type === 'PDF' ? 'bg-red-50' : 'bg-blue-50')}>
                        {doc.type === 'PDF'
                          ? <FileText className="w-5 h-5 text-red-500" />
                          : <FilePen  className="w-5 h-5 text-blue-500" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{doc.size} • {doc.type}</p>
                      </div>
                      <span className={clsx('text-xs font-medium px-2.5 py-0.5 rounded-full flex-shrink-0',
                        doc.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      )}>
                        {doc.status}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                          <Sparkles className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>


                <div className="px-5 pt-2 pb-5 border-t border-gray-100 overflow-x-auto">
                  <table className="w-full text-sm min-w-[500px]">
                    <thead>
                      <tr>
                        {['Document Name', 'Subject', 'Date', 'Status', 'Actions'].map(h => (
                          <th key={h} className="text-left py-2 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map(doc => (
                        <tr key={doc.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="py-2.5 pr-4 font-medium text-gray-800 truncate max-w-xs">{doc.name}</td>
                          <td className="py-2.5 pr-4 text-gray-500">{doc.subject}</td>
                          <td className="py-2.5 pr-4 text-gray-500">{doc.date}</td>
                          <td className="py-2.5 pr-4">
                            <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full',
                              doc.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            )}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="py-2.5">
                            <button className="text-indigo-600 hover:underline text-xs font-medium">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>


            <div className="space-y-5">


              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col" style={{ height: '400px' }}>
                <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Study Assistant</p>
                    <p className="text-xs text-emerald-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Online
                    </p>
                  </div>
                </div>


                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  {chat.map((msg, i) => (
                    <div key={i} className={clsx('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                      <div className={clsx(
                        'max-w-[85%] text-xs leading-relaxed px-3.5 py-2.5 rounded-2xl',
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-gray-100 text-gray-700 rounded-tl-none'
                      )}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>


                <div className="px-4 py-3 border-t border-gray-100">
                  <div className="flex gap-1.5 mb-2 flex-wrap">
                    {['Summarize', 'Explain Concepts', 'Create Quiz'].map(q => (
                      <button key={q} onClick={() => setChatMsg(q)}
                        className="text-xs bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg transition-colors">
                        {q}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={chatMsg}
                      onChange={e => setChatMsg(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendChat()}
                      placeholder="Ask something..."
                      className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
                    />
                    <button onClick={sendChat} className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>


              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Upload className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Uploading...</p>
                    <p className="text-xs text-gray-400 truncate">Neural_Networks_Thesis.pdf</p>
                  </div>
                  <span className="text-sm font-bold text-blue-600 flex-shrink-0">75%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>


              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Subject Overview</h2>
                  <button className="text-sm text-indigo-600 hover:underline font-medium">Manage</button>
                </div>
                <div className="divide-y divide-gray-50">
                  {subjects.map(s => {
                    const Icon = SUBJECT_ICONS[s.icon] || BookOpen
                    const colors = SUBJECT_COLORS[s.color] || SUBJECT_COLORS.blue
                    return (
                      <div key={s.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', colors.bg)}>
                          <Icon className={clsx('w-5 h-5', colors.text)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                          <p className="text-xs text-gray-400">{s.docs} documents</p>
                        </div>
                        {s.newDocs > 0 && (
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex-shrink-0">+{s.newDocs}</span>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      </div>
                    )
                  })}
                </div>
                <div className="px-5 py-3.5 border-t border-gray-50">
                  <button className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors py-1">
                    <Plus className="w-4 h-4" /> Add Subject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
