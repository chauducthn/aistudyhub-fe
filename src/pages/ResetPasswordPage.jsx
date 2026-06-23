import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import loginIllustration from '../assets/illustrations/login-illustration.png'
import AuthSplitLayout, {
  AuthAlert,
  AuthField,
  AuthFormCard,
  AuthPrimaryButton,
  AuthTextLink,
} from '../components/auth/AuthSplitLayout'
import * as authApi from '../api/authApi'
import { getApiErrorMessage } from '../utils/apiError'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = (searchParams.get('token') || '').trim()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!token) {
      setError('Reset link is invalid or missing its token. Please request a new one.')
      return
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Confirm password does not match.')
      return
    }

    setLoading(true)
    try {
      const response = await authApi.resetPassword({ token, newPassword })
      if (!response.success) {
        throw new Error(response.message || 'Reset failed')
      }
      setMessage('Password reset successful. Redirecting to login...')
      setTimeout(() => navigate('/login', { replace: true }), 2000)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not reset password.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthSplitLayout
      variant="login"
      heroImage={loginIllustration}
      heroImageAlt="AI academic workspace"
      heroTitle={
        <>
          Set a new password for your{' '}
          <span className="text-[#3525cd]">AI Study Hub</span> account.
        </>
      }
      heroSubtitle="Choose a strong password with at least 8 characters."
      showBackHome
    >
      <AuthFormCard
        title="Reset Password"
        subtitle="Enter your new password below."
        footer={
          <p className="text-center text-sm text-[#464555]">
            <AuthTextLink to="/login">Back to Login</AuthTextLink>
          </p>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <AuthAlert>{error}</AuthAlert>}
          {message && <AuthAlert tone="success">{message}</AuthAlert>}

          {!token && !message && (
            <AuthAlert tone="warning">
              This page should be opened from the reset link in your email.
            </AuthAlert>
          )}

          <AuthField label="New Password" id="newPassword">
            <input
              id="newPassword"
              type="password"
              minLength={8}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="auth-input"
              placeholder="Enter a new password"
            />
          </AuthField>

          <AuthField label="Confirm Password" id="confirmPassword">
            <input
              id="confirmPassword"
              type="password"
              minLength={8}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="auth-input"
              placeholder="Re-enter the new password"
            />
          </AuthField>

          <AuthPrimaryButton disabled={loading}>
            {loading ? 'Saving...' : 'Reset Password'}
          </AuthPrimaryButton>
        </form>
      </AuthFormCard>
    </AuthSplitLayout>
  )
}
