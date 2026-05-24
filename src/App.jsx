import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminUsersPage from './pages/AdminUsersPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfileSettingsPage from './pages/ProfileSettingsPage'
import RegisterPage from './pages/RegisterPage'
import UserDashboardPage from './pages/UserDashboardPage'
import { ROLES } from './utils/roles'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/v2-home" element={<Navigate to="/" replace />} />
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth" element={<Navigate to="/login" replace />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/student/dashboard" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/dashboard-v2" element={<Navigate to="/admin/dashboard" replace />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
