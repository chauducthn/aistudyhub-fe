import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Archive, Check, Lightbulb, Search, X } from 'lucide-react'
import registerIllustration from '../assets/illustrations/register-illustration.png'
import AuthSplitLayout, {
  AuthAlert,
  AuthField,
  AuthPrimaryButton,
  AuthTextLink,
} from '../components/auth/AuthSplitLayout'
import GoogleSignInButton from '../components/auth/GoogleSignInButton'
import PasswordInput from '../components/auth/PasswordInput'
import { useAuth } from '../context/useAuth'
import { getApiErrorMessage } from '../utils/apiError'

const REGISTER_BULLETS = [
  { text: 'Store documents in one place', icon: Archive },
  { text: 'Search by subject and keyword', icon: Search },
  { text: 'Learn faster with AI chatbot', icon: Lightbulb },
]

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  const map = {
    1: { label: 'Weak', color: '#ef4444' },
    2: { label: 'Fair', color: '#f59e0b' },
    3: { label: 'Good', color: '#3525cd' },
    4: { label: 'Strong', color: '#10b981' },
  }
  return { score, ...(map[score] || { label: '', color: '' }) }
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, loading } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState('')
  const [touched, setTouched] = useState({ password: false, confirm: false })

  const strength = useMemo(() => getPasswordStrength(password), [password])
  const passwordTooShort = touched.password && password.length > 0 && password.length < 8
  const confirmMismatch =
    touched.confirm && confirmPassword.length > 0 && confirmPassword !== password

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setTouched({ password: true, confirm: true })

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Confirm password does not match.')
      return
    }
    if (!agree) {
      setError('Please accept the Terms and Conditions to continue.')
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
          className="text-[30px] font-extrabold leading-tight text-[#0b1c30] sm:text-[32px]"
          style={{ fontFamily: '"Plus Jakarta Sans", Inter, sans-serif' }}
        >
          Create Account
        </h2>
        <p className="mt-2 text-base leading-7 text-[#464555]">
          Join AI Study Hub and manage your learning materials smarter.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
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
            <AuthField
              label="Password"
              id="password"
              error={passwordTooShort ? 'At least 8 characters required.' : null}
            >
              <PasswordInput
                id="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                placeholder="Min. 8 characters"
                invalid={passwordTooShort}
              />
            </AuthField>
            <AuthField
              label="Confirm Password"
              id="confirmPassword"
              error={confirmMismatch ? 'Passwords do not match.' : null}
            >
              <PasswordInput
                id="confirmPassword"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
                placeholder="Repeat password"
                invalid={confirmMismatch}
              />
            </AuthField>
          </div>

          {password && (
            <div>
              <div className="flex h-1.5 overflow-hidden rounded-full bg-[#eef0ff]">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <span
                    key={idx}
                    className="flex-1 transition-colors duration-200"
                    style={{
                      backgroundColor: idx < strength.score ? strength.color : 'transparent',
                      marginRight: idx < 3 ? '4px' : 0,
                    }}
                  />
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-[#74798a]">
                {strength.label && (
                  <span style={{ color: strength.color }}>Strength: {strength.label}</span>
                )}
                <ChecklistItem ok={password.length >= 8} label="8+ characters" />
                <ChecklistItem ok={/\d/.test(password)} label="Number" />
                <ChecklistItem
                  ok={/[A-Z]/.test(password) && /[a-z]/.test(password)}
                  label="Upper & lower case"
                />
              </div>
            </div>
          )}

          <label className="flex items-start gap-3 text-sm leading-6 text-[#464555]">
            <input
              type="checkbox"
              required
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-1 h-4 w-4 rounded accent-[#3525cd]"
            />
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

        <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-xs font-bold uppercase tracking-wide text-[#74798a]">
          <span className="h-px bg-[#c7c4d8]/50" />
          OR
          <span className="h-px bg-[#c7c4d8]/50" />
        </div>

        <GoogleSignInButton variant="register" />

        <p className="mt-7 text-center text-sm text-[#464555]">
          Already have an account? <AuthTextLink to="/login">Login</AuthTextLink>
        </p>
      </div>
    </AuthSplitLayout>
  )
}

function ChecklistItem({ ok, label }) {
  const Icon = ok ? Check : X
  return (
    <span className={`inline-flex items-center gap-1 ${ok ? 'text-emerald-600' : 'text-[#74798a]'}`}>
      <Icon className="h-3 w-3" aria-hidden />
      {label}
    </span>
  )
}
