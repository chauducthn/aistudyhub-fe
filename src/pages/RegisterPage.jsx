import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Archive, Lightbulb, Search } from 'lucide-react'
import registerIllustration from '../assets/illustrations/register-illustration.png'
import AuthSplitLayout, {
  AuthAlert,
  AuthField,
  AuthPrimaryButton,
  AuthTextLink,
} from '../components/auth/AuthSplitLayout'
import GoogleSignInButton from '../components/auth/GoogleSignInButton'
import { useAuth } from '../context/useAuth'
import { getApiErrorMessage } from '../utils/apiError'

const REGISTER_BULLETS = [
  { text: 'Store documents in one place', icon: Archive },
  { text: 'Search by subject and keyword', icon: Search },
  { text: 'Learn faster with AI chatbot', icon: Lightbulb },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, loading } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Confirm password does not match.')
      return
    }

    try {
      await register({ email, password, fullName })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed. Please try again.'))
    }
  }

  return (
    <AuthSplitLayout
      variant="register"
      heroImage={registerIllustration}
      heroImageAlt="Study documents dashboard preview"
      heroTitle={
        <>
          Create Your Study
          <br />
          Hub Account
        </>
      }
      heroSubtitle="Start uploading, organizing, and asking questions about your learning documents."
      heroList={REGISTER_BULLETS}
    >
      <div>
        <h2
          className="text-[32px] font-extrabold text-[#0b1c30]"
          style={{ fontFamily: '"Plus Jakarta Sans", Inter, sans-serif' }}
        >
          Create Account
        </h2>
        <p className="mt-2 text-lg leading-8 text-[#464555]">
          Join AI Study Hub and manage your learning materials smarter
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && <AuthAlert>{error}</AuthAlert>}

          <AuthField label="Full Name" id="fullName">
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="auth-input"
              placeholder="Enter your full name"
            />
          </AuthField>

          <AuthField label="Student Email" id="email">
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              placeholder="student@university.edu"
            />
          </AuthField>

          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField label="Password" id="password">
              <input
                id="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                placeholder="Min. 8 characters"
              />
            </AuthField>
            <AuthField label="Confirm Password" id="confirmPassword">
              <input
                id="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="auth-input"
                placeholder="Repeat password"
              />
            </AuthField>
          </div>

          <label className="flex items-start gap-3 text-sm text-[#464555]">
            <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded accent-[#3525cd]" />
            <span>
              I agree to the{' '}
              <a href="#" className="font-semibold text-[#3525cd] hover:underline">
                Terms and Conditions
              </a>
            </span>
          </label>

          <AuthPrimaryButton disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </AuthPrimaryButton>
        </form>

        <div className="my-7 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-xs font-bold uppercase tracking-wide text-[#74798a]">
          <span className="h-px bg-[#c7c4d8]/50" />
          Or
          <span className="h-px bg-[#c7c4d8]/50" />
        </div>

        <GoogleSignInButton variant="register" />

        <p className="mt-8 text-center text-base text-[#464555]">
          Already have an account? <AuthTextLink to="/login">Login</AuthTextLink>
        </p>
      </div>
    </AuthSplitLayout>
  )
}
