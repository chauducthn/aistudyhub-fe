import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import googleIcon from '../assets/icons/google-icon.svg'
import loginVisual from '../assets/illustrations/students-ai-tools.svg'
import BrandLogo from '../components/BrandLogo'
import { useAuth } from '../context/useAuth'
import { getApiErrorMessage } from '../utils/apiError'

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
      const fallbackPath = data.user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'
      navigate(location.state?.from?.pathname || fallbackPath, { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed. Please check your credentials.'))
    }
  }

  return (
    <div className="grid min-h-screen bg-[#f7f8fc] lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[#eaf0ff] px-8 py-10 lg:flex lg:flex-col">
        <BrandLogo />

        <div className="mt-16 max-w-[560px] xl:mt-20">
          <h1 className="text-[42px] font-extrabold leading-[1.12] text-[#0d2038] xl:text-[52px]">
            Empowering
            <br />
            <span className="whitespace-nowrap text-[#3b2be0]">Academic Excellence</span>
            <br />
            through AI.
          </h1>
          <p className="mt-7 max-w-[520px] text-lg leading-8 text-[#4f5668] xl:text-xl">
            Join thousands of researchers and students using intelligent tools to accelerate
            learning and simplify complex study workflows.
          </p>
        </div>

        <div className="mt-24 pb-8 xl:mt-auto xl:translate-y-7">
          <div className="max-w-[575px]">
            <img src={loginVisual} alt="AI academic workspace" className="w-full" />
          </div>
          <p className="mt-2 text-sm font-bold text-slate-500">© 2024 AI Study Hub. Designed for the future of education.</p>
        </div>
      </section>

      <main className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[447px]">
          <div className="rounded-xl border border-slate-200 bg-white px-8 py-9 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <h2 className="text-3xl font-extrabold text-[#102338]">Welcome Back</h2>
            <p className="mt-1 text-base text-[#4f5668]">Please enter your details to sign in.</p>

            <form onSubmit={handleSubmit} className="mt-9 space-y-6">
              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">
                  {error}
                </div>
              )}

              <Field label="Email Address" id="email">
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
              </Field>

              <Field label="Password" id="password">
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
              </Field>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 font-semibold text-[#4f5668]">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
                  Remember me
                </label>
                <Link to="/forgot-password" className="font-extrabold text-[#3427d9]">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-lg bg-[#3b2be0] font-bold text-white shadow-lg shadow-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>

            <div className="mt-9 border-t border-slate-200 pt-7 text-center text-base text-[#4f5668]">
              Need an account?{' '}
              <Link to="/register" className="font-extrabold text-[#3427d9]">
                Register
              </Link>
            </div>
          </div>

          <div className="mt-9 text-center text-sm font-semibold text-[#74798a]">Or continue with</div>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <button className="h-11 rounded-lg border border-slate-200 bg-white font-semibold text-[#4f5668] shadow-sm">
              <GoogleIcon /> Google
            </button>
            <button className="h-11 rounded-lg border border-slate-200 bg-white font-semibold text-[#4f5668] shadow-sm">
              SSO Login
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

function Field({ label, id, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-[#102338]">
        {label}
      </label>
      <div className="mt-3">{children}</div>
    </div>
  )
}

function GoogleIcon() {
  return <img src={googleIcon} alt="" className="mr-3 inline-block h-5 w-5 align-[-4px]" />
}
