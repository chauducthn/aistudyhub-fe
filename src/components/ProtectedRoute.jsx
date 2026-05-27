import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { normalizeRole } from '../utils/roles'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { initializing, isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (initializing) {
    return <SessionSkeleton />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  const normalizedAllowedRoles = allowedRoles?.map(normalizeRole) || []

  if (normalizedAllowedRoles.length && !normalizedAllowedRoles.includes(normalizeRole(user?.role))) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function SessionSkeleton() {
  return (
    <div className="min-h-screen bg-[#f6f8fd]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[260px] border-r border-[#c7c4d8]/25 bg-white p-6 lg:block">
          <div className="h-10 w-40 animate-pulse rounded-lg bg-[#eef0ff]" />
          <div className="mt-8 space-y-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-9 w-full animate-pulse rounded-xl bg-[#eef0ff]" />
            ))}
          </div>
        </aside>
        <div className="flex-1 px-6 py-8">
          <div className="h-12 w-72 animate-pulse rounded-xl bg-[#eef0ff]" />
          <div className="mt-3 h-4 w-96 animate-pulse rounded bg-[#eef0ff]" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-28 animate-pulse rounded-2xl bg-white shadow-sm" />
            ))}
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="h-72 animate-pulse rounded-2xl bg-white shadow-sm" />
            <div className="h-72 animate-pulse rounded-2xl bg-white shadow-sm" />
          </div>
        </div>
      </div>
    </div>
  )
}
