import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-[#edf3ff]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3 text-xl font-extrabold text-[#3427d9]">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3b2be0] text-xs text-white shadow-sm">
            AI
          </span>
          Study Hub
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm font-bold transition ${
                isActive ? 'bg-white text-[#3427d9]' : 'text-slate-600 hover:text-[#3427d9]'
              }`
            }
          >
            Home
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-bold transition ${
                    isActive ? 'bg-white text-[#3427d9]' : 'text-slate-600 hover:text-[#3427d9]'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-bold transition ${
                    isActive ? 'bg-white text-[#3427d9]' : 'text-slate-600 hover:text-[#3427d9]'
                  }`
                }
              >
                Profile
              </NavLink>
              <span className="hidden text-sm text-slate-600 sm:inline">
                Hi, <strong>{user.fullName}</strong>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-[#3b2be0] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#3020c4]"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-bold text-slate-700 transition hover:text-[#3427d9]"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-[#3b2be0] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#3020c4]"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
