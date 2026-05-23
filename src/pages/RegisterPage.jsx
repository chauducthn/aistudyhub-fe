import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import googleIcon from '../assets/icons/google-icon.svg'
import registerVisual from '../assets/images/academic-ai-interface.svg'
import BrandLogo from '../components/BrandLogo'
import { useAuth } from '../context/useAuth'
import { getApiErrorMessage } from '../utils/apiError'

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
    <div className="grid min-h-screen bg-[#f7f8fc] lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[#3b2be0] px-12 py-12 text-white lg:flex lg:flex-col">
        <div className="absolute right-[-120px] top-[-120px] h-80 w-80 rounded-full bg-white/5" />
        <BrandLogo light className="relative z-10" />

        <div className="relative z-10 mt-20 max-w-xl">
          <h1 className="text-6xl font-extrabold leading-[1.15]">
            Create Your Study
            <br />
            Hub Account
          </h1>
          <p className="mt-8 text-2xl leading-9 text-indigo-100">
            Start uploading, organizing, and asking questions about your learning documents.
          </p>

          <ul className="mt-14 space-y-8 text-xl font-medium">
            <li className="flex items-center gap-4"><Bullet /> Store documents in one place</li>
            <li className="flex items-center gap-4"><Bullet /> Search by subject and keyword</li>
            <li className="flex items-center gap-4"><Bullet /> Learn faster with AI chatbot</li>
          </ul>
        </div>

        <div className="relative z-10 mt-auto rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl">
          <div className="h-80 overflow-hidden rounded-xl bg-[#07131c]">
            <img src={registerVisual} alt="Study documents dashboard" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[448px]">
          <h2 className="text-4xl font-extrabold text-[#102338]">Create Account</h2>
          <p className="mt-3 text-xl leading-8 text-[#4f5668]">
            Join AI Study Hub and manage your learning materials smarter
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">
                {error}
              </div>
            )}

            <Field label="Full Name" id="fullName">
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="auth-input"
                placeholder="Enter your full name"
              />
            </Field>

            <Field label="Student Email" id="email">
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
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Password" id="password">
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
              </Field>
              <Field label="Confirm Password" id="confirmPassword">
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
              </Field>
            </div>

            <label className="flex items-center gap-3 text-base text-[#4f5668]">
              <input type="checkbox" className="h-5 w-5 rounded border-slate-300" />
              I agree to the Terms and Conditions
            </label>

            <button
              type="submit"
              disabled={loading}
              className="h-14 w-full rounded-lg bg-[#3b2be0] font-bold text-white shadow-lg shadow-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <div className="my-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-sm font-bold uppercase text-[#74798a]">
            <span className="h-px bg-slate-200" />
            OR
            <span className="h-px bg-slate-200" />
          </div>

          <button className="h-14 w-full rounded-lg bg-cyan-200 text-base font-bold text-[#102338]">
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="mt-10 text-center text-base text-[#4f5668]">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#3427d9]">
              Login
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

function Bullet() {
  return <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-xs">+</span>
}

function Field({ label, id, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-[#4f5668]">
        {label}
      </label>
      <div className="mt-3">{children}</div>
    </div>
  )
}

function GoogleIcon() {
  return <img src={googleIcon} alt="" className="mr-4 inline-block h-6 w-6 align-[-5px]" />
}
