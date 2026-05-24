import { Link, NavLink, useNavigate } from 'react-router-dom'
import BrandLogo from './BrandLogo'
import { useAuth } from '../context/useAuth'

const userItems = ['Dashboard', 'My Documents', 'Upload', 'Subjects', 'AI Chatbot', 'Chat History']
const adminItems = [
  { label: 'Admin Dashboard', to: '/admin/dashboard' },
  { label: 'User Management', to: '/admin/users' },
  { label: 'Subject Management', to: '/admin/dashboard' },
  { label: 'Document Moderation', to: '/admin/dashboard' },
  { label: 'All Documents', to: '/admin/dashboard' },
]
const adminAnalytics = [
  { label: 'Analytics', to: '/admin/dashboard' },
  { label: 'Storage Usage', to: '/admin/dashboard' },
  { label: 'Reports', to: '/admin/dashboard' },
]

export default function DashboardShell({ type = 'user', children }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = type === 'admin'
  const basePath = isAdmin ? '/admin/dashboard' : '/dashboard'

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#f6f8fd] text-[#102338]">
      <aside className="fixed inset-y-0 left-0 hidden w-[280px] flex-col border-r border-slate-200 bg-[#eef4ff] px-5 py-8 lg:flex">
        <BrandLogo subtitle />

        {isAdmin ? (
          <>
            <SideGroup title="Main Menu" items={adminItems} />
            <SideGroup title="Analytics" items={adminAnalytics} />
          </>
        ) : (
          <>
            <Link
              to="/dashboard"
              className="mt-9 flex h-12 items-center justify-center gap-3 rounded-lg bg-[#3b2be0] text-lg font-bold text-white"
            >
              + New Document
            </Link>
            <nav className="mt-6 space-y-1">
              {userItems.map((item) => (
                <NavLink
                  key={item}
                  to={basePath}
                  className={({ isActive }) =>
                    `flex items-center gap-4 rounded-none px-4 py-4 text-lg font-semibold ${
                      item === 'Dashboard' && isActive
                        ? 'border-l-4 border-[#3b2be0] bg-[#e2e0ff] text-[#3427d9]'
                        : 'text-[#4f5668]'
                    }`
                  }
                >
                  <span className="text-xl">{item === 'Dashboard' ? '▦' : '□'}</span>
                  {item}
                </NavLink>
              ))}
            </nav>
          </>
        )}

        <div className="mt-5 border-t border-slate-200 pt-4">
          <Link to="/profile" className="flex items-center gap-3 px-2 py-3 text-lg font-semibold text-[#4f5668]">
            ● Profile
          </Link>
          <button
            onClick={handleLogout}
            className="flex cursor-pointer items-center gap-3 px-2 py-3 text-lg font-semibold text-red-600 transition hover:text-red-700"
          >
            ↪ Logout
          </button>
        </div>
      </aside>

      <main className="lg:pl-[280px]">{children}</main>
    </div>
  )
}

function SideGroup({ title, items }) {
  return (
    <div className="mt-9">
      <p className="px-2 text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <nav className="mt-4 space-y-1.5">
        {items.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-4 rounded-lg px-4 py-2.5 text-lg font-semibold ${
                isActive ? 'bg-[#3b2be0] text-white' : 'text-[#4f5668]'
              }`
            }
          >
            <span>□</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
