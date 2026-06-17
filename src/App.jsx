import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminDocumentsPage from './pages/AdminDocumentsPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AdvancedSearchPage from './pages/AdvancedSearchPage'
import ChatbotPage from './pages/ChatbotPage'
import ChatHistoryPage from './pages/ChatHistoryPage'
import DocumentDetailPage from './pages/DocumentDetailPage'
import EditDocumentPage from './pages/EditDocumentPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import MyDocumentsPage from './pages/MyDocumentsPage'
import NotFoundPage from './pages/NotFoundPage'
import ProfileSettingsPage from './pages/ProfileSettingsPage'
import RegisterPage from './pages/RegisterPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import AdminReportsPage from './pages/AdminReportsPage'
import PublicDocumentDetailPage from './pages/PublicDocumentDetailPage'
import PublicDocumentsPage from './pages/PublicDocumentsPage'
import SubjectsPage from './pages/SubjectsPage'
import UploadDocumentPage from './pages/UploadDocumentPage'
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
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
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
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadDocumentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <MyDocumentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents/:id"
            element={
              <ProtectedRoute>
                <DocumentDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents/:id/edit"
            element={
              <ProtectedRoute>
                <EditDocumentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subjects"
            element={
              <ProtectedRoute>
                <SubjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/public-documents"
            element={
              <ProtectedRoute>
                <PublicDocumentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/public-documents/:id"
            element={
              <ProtectedRoute>
                <PublicDocumentDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <AdvancedSearchPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/documents"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminDocumentsPage />
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
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminReportsPage />
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

          <Route
            path="/chatbot"
            element={
              <ProtectedRoute>
                <ChatbotPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat-history"
            element={
              <ProtectedRoute>
                <ChatHistoryPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
