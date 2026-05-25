import { useState } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import * as authApi from '../api/authApi'
import { getApiErrorMessage } from '../utils/apiError'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [devToken, setDevToken] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setDevToken('')
    setError('')

    try {
      const response = await authApi.forgotPassword({ email })
      if (!response.success) {
        throw new Error(response.message || 'Request failed')
      }
      setMessage(response.data?.message || response.message)
      if (response.data?.resetToken) {
        setDevToken(response.data.resetToken)
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not process request.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-6 py-12">
      <div className="w-full max-w-md">
        <BrandLogo />
        <div className="mt-8 rounded-xl border border-slate-200 bg-white px-8 py-9 shadow-lg">
          <h1 className="text-3xl font-extrabold text-[#102338]">Forgot Password</h1>
          <p className="mt-2 text-[#4f5668]">
            Enter your email. If an account exists, we will send reset instructions.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>
            )}
            {message && (
              <div className="rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{message}</div>
            )}
            {devToken && (
              <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <p className="font-bold">Dev reset token:</p>
                <p className="mt-1 break-all font-mono text-xs">{devToken}</p>
                <Link
                  to={`/reset-password?token=${encodeURIComponent(devToken)}`}
                  className="mt-2 inline-block font-bold text-[#3427d9]"
                >
                  Open reset page
                </Link>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-[#102338]">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input mt-3"
                placeholder="name@university.edu"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-lg bg-[#3b2be0] font-bold text-white disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
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
