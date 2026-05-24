import { useAuth } from '../context/useAuth'
import { isAdminRole } from '../utils/roles'
import AdminDashboardPage from './AdminDashboardPage'
import UserDashboardPage from './UserDashboardPage'

export default function ProfilePage() {
  const { user } = useAuth()

  if (isAdminRole(user?.role)) {
    return <AdminDashboardPage />
  }

  return <UserDashboardPage />
}
