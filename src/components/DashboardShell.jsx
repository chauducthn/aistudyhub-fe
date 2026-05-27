import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Bell,
  Bot,
  CloudUpload,
  Files,
  FolderOpen,
  History,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  Settings,
  Upload,
  User,
  Users,
} from 'lucide-react'
import BrandLogo from './BrandLogo'
import { useAuth } from '../context/useAuth'

const userNav = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'My Documents', to: '/dashboard', icon: Files },
  { label: 'Upload', to: '/dashboard', icon: Upload },
  { label: 'Subjects', to: '/dashboard', icon: FolderOpen },
  { label: 'AI Chatbot', to: '/dashboard', icon: Bot },
  { label: 'Chat History', to: '/dashboard', icon: History },
]

const adminNav = [
  { label: 'Admin Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'User Management', to: '/admin/users', icon: Users },
]

function resolveMediaUrl(url) {
  if (!url) return null
  if (url.startsWith('http')) return url
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8081/api'
  const origin = apiBase.replace(/\/api\/?$/, '')
  return `${origin}${url.startsWith('/') ? url : `/${url}`}`
}

export default function DashboardShell({ type = 'user', children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = type === 'admin'
  const navItems = isAdmin ? adminNav : userNav

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const initials = (user?.fullName || 'U')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const avatarUrl = resolveMediaUrl(user?.avatarUrl)

  return (
    <div className="min-h-screen bg-[#f6f8fd] text-[#0b1c30]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-[#c7c4d8]/25 bg-white px-4 py-6 lg:flex">
        <BrandLogo subtitle className="px-2" />

        {!isAdmin && (
          <Link
            to="/dashboard"
            className="mt-6 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#3525cd] text-sm font-bold text-white shadow-[0_8px_20px_rgba(53,37,205,0.25)]"
          >
            <Plus className="h-4 w-4" aria-hidden />
            New Document
          </Link>
        )}

        <nav className="mt-6 flex-1 space-y-1 overflow-y-auto">
          {!isAdmin && (
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#74798a]">
              Main Menu
            </p>
          )}
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === '/admin/dashboard' || item.to === '/dashboard'}
              className={({ isActive }) =>
                `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-[#3525cd]/10 text-[#3525cd]'
                    : 'text-[#464555] hover:bg-[#eff4ff]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-[#3525cd]" />
                  )}
                  <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[#c7c4d8]/30 pt-4">
          <Link
            to="/profile"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#464555] hover:bg-[#eff4ff]"
          >
            <User className="h-[18px] w-[18px]" aria-hidden />
            Profile
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-[18px] w-[18px]" aria-hidden />
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-30 border-b border-[#c7c4d8]/25 bg-white/90 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-3 lg:gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#c7c4d8]/40 bg-[#f8f9ff] px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-[#74798a]" aria-hidden />
              <input
                type="search"
                placeholder="Search documents, subjects, or notes..."
                className="min-w-0 flex-1 bg-transparent text-sm text-[#0b1c30] outline-none placeholder:text-[#74798a]"
              />
            </div>

            {!isAdmin && (
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#57dffe] px-4 text-sm font-bold text-[#0b1c30] shadow-sm"
              >
                <CloudUpload className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Upload Document</span>
              </button>
            )}

            <button type="button" className="grid h-10 w-10 place-items-center rounded-xl text-[#464555] hover:bg-[#eff4ff]" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </button>
            <button type="button" className="grid h-10 w-10 place-items-center rounded-xl text-[#464555] hover:bg-[#eff4ff]" aria-label="Settings">
              <Settings className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-l border-[#c7c4d8]/30 pl-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold text-[#0b1c30]">{user?.fullName || 'User'}</p>
                <span
                  className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    isAdmin ? 'bg-[#3525cd]/15 text-[#3525cd]' : 'bg-[#e8e3ff] text-[#3525cd]'
                  }`}
                >
                  {isAdmin ? 'Admin' : 'Student'}
                </span>
              </div>
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-[#3525cd]/20" />
              ) : (
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[#3525cd] text-sm font-bold text-white">
                  {initials}
                </div>
              )}
            </div>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  )
}
