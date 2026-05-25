import { useState } from 'react'
import { Link } from 'react-router-dom'
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
    <AuthSplitLayout
      variant="login"
      heroImage={loginIllustration}
      heroImageAlt="AI academic workspace"
      heroTitle={
        <>
          Recover access to your{' '}
          <span className="text-[#3525cd]">Study Hub</span> account.
        </>
      }
      heroSubtitle="We will send password reset instructions if your email is registered."
      showBackHome
    >
      <AuthFormCard
        title="Forgot Password"
        subtitle="Enter your email. If an account exists, we will send reset instructions."
        footer={
          <p className="text-center text-sm text-[#464555]">
            <AuthTextLink to="/login">Back to Login</AuthTextLink>
          </p>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <AuthAlert>{error}</AuthAlert>}
          {message && <AuthAlert tone="success">{message}</AuthAlert>}
          {devToken && (
            <AuthAlert tone="warning">
              <p className="font-bold">Dev reset token:</p>
              <p className="mt-1 break-all font-mono text-xs">{devToken}</p>
              <Link
                to={`/reset-password?token=${encodeURIComponent(devToken)}`}
                className="mt-2 inline-block font-bold text-[#3525cd] hover:underline"
              >
                Open reset page
              </Link>
            </AuthAlert>
          )}

          <AuthField label="Email Address" id="email">
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              placeholder="name@university.edu"
            />
          </AuthField>

          <AuthPrimaryButton disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </AuthPrimaryButton>
        </form>
      </AuthFormCard>
    </AuthSplitLayout>
  )
}
