import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import loginIllustration from '../assets/illustrations/login-illustration.png'
import AuthSplitLayout, {
  AuthAlert,
  AuthField,
  AuthFormCard,
  AuthPrimaryButton,
  AuthTextLink,
} from '../components/auth/AuthSplitLayout'
import GoogleSignInButton from '../components/auth/GoogleSignInButton'
import { useAuth } from '../context/useAuth'
import { getApiErrorMessage } from '../utils/apiError'
import { isAdminRole } from '../utils/roles'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const data = await login({ email, password })
      const fallbackPath = isAdminRole(data.user?.role) ? '/admin/dashboard' : '/dashboard'
      navigate(location.state?.from?.pathname || fallbackPath, { replace: true })
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
          <p className="text-center text-base text-[#464555]">
            Need an account? <AuthTextLink to="/register">Register</AuthTextLink>
          </p>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
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
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              placeholder="••••••••"
            />
          </AuthField>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 font-semibold text-[#464555]">
              <input type="checkbox" className="h-4 w-4 rounded accent-[#3525cd]" />
              Remember me
            </label>
            <AuthTextLink to="/forgot-password">Forgot password?</AuthTextLink>
          </div>

          <AuthPrimaryButton disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </AuthPrimaryButton>
        </form>
      </AuthFormCard>

      <div className="mt-8">
        <p className="text-center text-sm font-semibold text-[#74798a]">Or continue with</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <GoogleSignInButton label="Google" />
          <button
            type="button"
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#c7c4d8]/50 bg-white text-sm font-semibold text-[#464555] shadow-sm hover:bg-[#f8f9ff]"
          >
            <KeyRound className="h-4 w-4" aria-hidden />
            SSO Login
          </button>
        </div>
      </div>
    </AuthSplitLayout>
  )
}
