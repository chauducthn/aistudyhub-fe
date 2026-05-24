import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingScreen from '../components/ui/LoadingScreen'

export function ProtectedRoute({ children, role }) {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />
  }

  return children
}

export function GuestRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth()

  if (loading) return <LoadingScreen />
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />
  }

  return children
}
