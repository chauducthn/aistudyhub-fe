import { useState } from 'react'
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
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authApi.forgotPassword({ email })
      if (!response.success) {
        throw new Error(response.message || 'Request failed')
      }
      setSent(true)
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
        subtitle="Enter your email and we will send a reset link to your inbox."
        footer={
          <p className="text-center text-sm text-[#464555]">
            <AuthTextLink to="/login">Back to Login</AuthTextLink>
          </p>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <AuthAlert>{error}</AuthAlert>}
          {sent && (
            <AuthAlert tone="success">
              If an account exists for that email, a reset link has been sent. Check your inbox
              (and spam folder) and open the link to set a new password.
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
