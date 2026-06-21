import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import loginIllustration from '../assets/illustrations/login-illustration.png'
import AuthSplitLayout, {
  AuthAlert,
  AuthField,
  AuthFormCard,
  AuthPrimaryButton,
  AuthTextLink,
} from '../components/auth/AuthSplitLayout'
import PasswordInput from '../components/auth/PasswordInput'
import { useAuth } from '../context/useAuth'
import { getApiErrorMessage } from '../utils/apiError'
import { isAdminRole } from '../utils/roles'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const data = await login({ email, password })
      const admin = isAdminRole(data.user?.role)
      const fallbackPath = admin ? '/admin/dashboard' : '/dashboard'
      const from = location.state?.from?.pathname
      const fromIsAdminArea = from?.startsWith('/admin')
      const target = from && fromIsAdminArea === admin ? from : fallbackPath
      navigate(target, { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed. Please check your credentials.'))
    }
  }

  return (
    <AuthSplitLayout
      variant="login"
      heroImage={loginIllustration}
      heroImageAlt="AI-powered academic workspace"
      heroTitle={
        <>
          Empowering <span className="text-[#3525cd]">Academic Excellence</span> through AI.
        </>
      }
      heroSubtitle="Join thousands of researchers and students using intelligent tools to accelerate learning and simplify complex study workflows."
    >
      <AuthFormCard
        title="Welcome Back"
        subtitle="Please enter your details to sign in."
        footer={
          <p className="text-center text-sm text-[#464555]">
            Need an account? <AuthTextLink to="/register">Register</AuthTextLink>
          </p>
        }
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {error && <AuthAlert>{error}</AuthAlert>}

          <AuthField label="Email Address" id="email">
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              placeholder="name@university.edu"
            />
          </AuthField>

          <AuthField label="Password" id="password">
            <PasswordInput
              id="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </AuthField>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 font-semibold text-[#464555]">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded accent-[#3525cd]"
              />
              Remember me
            </label>
            <AuthTextLink to="/forgot-password">Forgot password?</AuthTextLink>
          </div>

          <AuthPrimaryButton disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </AuthPrimaryButton>
        </form>
      </AuthFormCard>
    </AuthSplitLayout>
  )
}
