import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
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
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-6 py-12">
      <div className="w-full max-w-md">
        <BrandLogo />
        <div className="mt-8 rounded-xl border border-slate-200 bg-white px-8 py-9 shadow-lg">
          <h1 className="text-3xl font-extrabold text-[#102338]">Reset Password</h1>
          <p className="mt-2 text-[#4f5668]">Enter your reset token and new password.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>
            )}
            {message && (
              <div className="rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{message}</div>
            )}

            <div>
              <label htmlFor="token" className="block text-sm font-bold text-[#102338]">
                Reset Token
              </label>
              <input
                id="token"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="auth-input mt-3 font-mono text-sm"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-bold text-[#102338]">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                minLength={8}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="auth-input mt-3"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-[#102338]">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                minLength={8}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="auth-input mt-3"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-lg bg-[#3b2be0] font-bold text-white disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Reset Password'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm">
            <Link to="/login" className="font-extrabold text-[#3427d9]">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
