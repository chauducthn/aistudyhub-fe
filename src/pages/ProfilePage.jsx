import { useAuth } from '../context/useAuth'
import AdminDashboardPage from './AdminDashboardPage'
import UserDashboardPage from './UserDashboardPage'

export default function ProfilePage() {
  const { user } = useAuth()

  if (user?.role === 'ADMIN') {
    return <AdminDashboardPage />
  }

  return <UserDashboardPage />
}
