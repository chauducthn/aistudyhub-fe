import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { normalizeRole } from '../utils/roles'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { initializing, isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (initializing) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-6xl items-center justify-center px-4 text-sm text-slate-500">
        Dang kiem tra phien dang nhap...
      </div>
    )
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
