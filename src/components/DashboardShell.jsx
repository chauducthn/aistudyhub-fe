import { Link, NavLink, useNavigate } from 'react-router-dom'
import BrandLogo from './BrandLogo'
import { useAuth } from '../context/useAuth'

const userNav = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'My Documents', to: '/dashboard' },
  { label: 'Upload', to: '/dashboard' },
  { label: 'Subjects', to: '/dashboard' },
  { label: 'AI Chatbot', to: '/dashboard' },
]

const adminNav = [
  { label: 'Admin Dashboard', to: '/admin/dashboard' },
  { label: 'User Management', to: '/admin/users' },
]

export default function DashboardShell({ type = 'user', children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = type === 'admin'

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const navItems = isAdmin ? adminNav : userNav

  return (
    <div className="min-h-screen bg-[#f6f8fd] text-[#102338]">
      <aside className="fixed inset-y-0 left-0 hidden w-[280px] flex-col border-r border-slate-200 bg-[#eef4ff] px-5 py-8 lg:flex">
        <BrandLogo subtitle />

        {!isAdmin && (
          <Link
            to="/dashboard"
            className="mt-9 flex h-12 items-center justify-center gap-3 rounded-lg bg-[#3b2be0] text-lg font-bold text-white"
          >
            + New Document
          </Link>
        )}

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === '/admin/dashboard' || item.to === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-4 rounded-lg px-4 py-3 text-lg font-semibold ${
                  isActive ? 'bg-[#3b2be0] text-white' : 'text-[#4f5668] hover:bg-[#e2e0ff]'
                }`
              }
            >
              <span>▦</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-slate-200 pt-6">
          <Link to="/profile" className="flex items-center gap-3 px-2 py-3 text-lg font-semibold text-[#4f5668]">
            ◎ My Profile
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-2 py-3 text-lg font-semibold text-red-600"
          >
            ↪ Logout
          </button>
        </div>
      </aside>

      <main className="lg:pl-[280px]">{children}</main>
    </div>
  )
}
