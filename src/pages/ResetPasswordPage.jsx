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
  const [token, setToken] = useState(searchParams.get('token') || '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

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
      const response = await authApi.resetPassword({ token: token.trim(), newPassword })
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
        subtitle="Enter your reset token and new password."
        footer={
          <p className="text-center text-sm text-[#464555]">
            <AuthTextLink to="/login">Back to Login</AuthTextLink>
          </p>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <AuthAlert>{error}</AuthAlert>}
          {message && <AuthAlert tone="success">{message}</AuthAlert>}

          <AuthField label="Reset Token" id="token">
            <input
              id="token"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="auth-input font-mono text-sm"
            />
          </AuthField>

          <AuthField label="New Password" id="newPassword">
            <input
              id="newPassword"
              type="password"
              minLength={8}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="auth-input"
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
