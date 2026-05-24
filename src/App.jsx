import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import AdminDashboardPage from './pages/AdminDashboardPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfileSettingsPage from './pages/ProfileSettingsPage'
import RegisterPage from './pages/RegisterPage'
import UserDashboardPage from './pages/UserDashboardPage'

import { ProtectedRoute as TrilmProtectedRoute, GuestRoute as TrilmGuestRoute } from './utils/ProtectedRoute'
import TrilmHomePage from './pages/Home'
import AuthPage from './pages/Login'
import StudentDashboard from './pages/student/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/v2-home" element={<TrilmHomePage />} />
          
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route
            path="/auth"
            element={
              <TrilmGuestRoute>
                <AuthPage />
              </TrilmGuestRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/dashboard"
            element={
              <TrilmProtectedRoute role="student">
                <StudentDashboard />
              </TrilmProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard-v2"
            element={
              <TrilmProtectedRoute role="admin">
                <AdminDashboard />
              </TrilmProtectedRoute>
            }
          />

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
