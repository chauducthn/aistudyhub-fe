import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Bot, Eye, EyeOff, Loader2, CheckCircle, BookOpen, Search, Package, ArrowLeft } from 'lucide-react'
import clsx from 'clsx'

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><span>⚠</span> {error}</p>}
    </div>
  )
}

function Input({ error, ...props }) {
  return (
    <input
      className={clsx(
        'w-full px-3.5 py-2.5 text-sm rounded-xl border bg-gray-50 focus:bg-white outline-none transition focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400',
        error ? 'border-red-400' : 'border-gray-200'
      )}
      {...props}
    />
  )
}

function LoginForm({ onSwitchToRegister }) {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login({ email, password })
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-500 text-sm mt-1">Please enter your details to sign in.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <Field label="Email Address">
        <Input type="email" required placeholder="you@university.edu" value={email} onChange={e => setEmail(e.target.value)} />
      </Field>

      <Field label="Password">
        <div className="relative">
          <Input
            type={showPw ? 'text' : 'password'}
            required
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ paddingRight: '2.75rem' }}
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </Field>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="rounded border-gray-300 accent-indigo-600" />
          <span className="text-gray-600">Remember me</span>
        </label>
        <a href="#" className="text-indigo-600 font-medium hover:underline">Forgot password?</a>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Login
      </button>

      <div className="flex items-center gap-3 text-xs text-gray-400">
        <div className="flex-1 h-px bg-gray-200" />
        or continue with
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <button
        type="button"
        className="w-full flex items-center justify-center gap-2.5 border border-gray-200 bg-white hover:bg-gray-50 py-2.5 rounded-xl text-sm font-medium text-gray-700 transition-colors"
      >
        <GoogleIcon /> Google
      </button>

      <p className="text-center text-sm text-gray-500">
        Need an account?{' '}
        <button type="button" onClick={onSwitchToRegister} className="text-indigo-600 font-semibold hover:underline">
          Register
        </button>
      </p>
    </form>
  )
}

function RegisterForm({ onSwitchToLogin }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [agreed, setAgreed] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.name.trim())          e.name    = 'Full name is required'
    if (!form.email.includes('@'))  e.email   = 'Please enter a valid email address'
    if (form.password.length < 8)   e.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    if (!agreed)                    e.agreed  = 'You must agree to the terms and conditions'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Account created successfully</h3>
        <p className="text-gray-500 text-sm mb-7">Welcome to the future of research! Your account is ready.</p>
        <button onClick={onSwitchToLogin} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-7 py-2.5 rounded-xl transition-colors">
          Go to Login
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-500 text-sm mt-1">Start your academic journey with AI Hub.</p>
      </div>

      <Field label="Full Name" error={errors.name}>
        <Input placeholder="Your full name" value={form.name} onChange={set('name')} error={errors.name} />
      </Field>

      <Field label="Student Email" error={errors.email}>
        <Input type="email" placeholder="you@university.edu" value={form.email} onChange={set('email')} error={errors.email} />
      </Field>

      <Field label="Password" error={errors.password}>
        <div className="relative">
          <Input
            type={showPw ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            style={{ paddingRight: '2.75rem' }}
          />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </Field>

      <Field label="Confirm Password" error={errors.confirm}>
        <Input type="password" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
      </Field>

      <div>
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="mt-0.5 rounded border-gray-300 accent-indigo-600 flex-shrink-0"
          />
          <span className="text-sm text-gray-600">
            I agree to the <a href="#" className="text-indigo-600 hover:underline font-medium">Terms of Service</a> and{' '}
            <a href="#" className="text-indigo-600 hover:underline font-medium">Privacy Policy</a>.
          </span>
        </label>
        {errors.agreed && <p className="mt-1.5 text-xs text-red-500">⚠ {errors.agreed}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Register
      </button>

      <div className="flex items-center gap-3 text-xs text-gray-400">
        <div className="flex-1 h-px bg-gray-200" /> or <div className="flex-1 h-px bg-gray-200" />
      </div>

      <button
        type="button"
        className="w-full flex items-center justify-center gap-2.5 border border-gray-200 bg-white hover:bg-gray-50 py-2.5 rounded-xl text-sm font-medium text-gray-700 transition-colors"
      >
        <GoogleIcon /> Continue with Google
      </button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToLogin} className="text-indigo-600 font-semibold hover:underline">
          Login
        </button>
      </p>
    </form>
  )
}

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') === 'register' ? 'register' : 'login')
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  return (
    <div className="min-h-screen flex">


      <div className="hidden lg:flex flex-col justify-between w-96 flex-shrink-0 bg-slate-950 text-white p-10">

        <Link to="/" className="flex items-center gap-3 group w-fit">
          <img src="https://www.figma.com/api/mcp/asset/99690260-2605-4fec-adfe-832c043be81b" alt="AI Study Hub" className="w-9 h-9" />
          <span className="font-bold text-lg group-hover:text-indigo-300 transition-colors">AI Study Hub</span>
        </Link>


        <div>
          <h2 className="text-3xl font-bold leading-snug mb-4">
            Empowering Academic Excellence through AI.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Join thousands of researchers and students using intelligent tools to accelerate
            learning and simplify complex study workflows.
          </p>


          <ul className="space-y-3">
            {[
              { icon: Package, text: 'Store documents in one place' },
              { icon: Search,  text: 'Search by subject and keyword' },
              { icon: BookOpen,text: 'Learn faster with AI chatbot' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-8 h-8 bg-indigo-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-indigo-400" />
                </div>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-slate-600 text-xs">© 2024 AI Study Hub. Designed for the future of education.</p>
      </div>


      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-6">

        <Link to="/" className="lg:hidden flex items-center gap-3 mb-8 group">
          <img src="https://www.figma.com/api/mcp/asset/99690260-2605-4fec-adfe-832c043be81b" alt="AI Study Hub" className="w-9 h-9" />
          <span className="font-bold text-xl text-gray-900 group-hover:text-indigo-600 transition-colors">AI Study Hub</span>
        </Link>


        <div className="hidden lg:flex w-full max-w-md mb-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-8">

          <div className="flex bg-gray-100 rounded-xl p-1 mb-7">
            {['login', 'register'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={clsx(
                  'flex-1 py-2 text-sm font-semibold rounded-lg transition-all capitalize',
                  tab === t
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {t === 'login' ? 'Login' : 'Register'}
              </button>
            ))}
          </div>

          {tab === 'login'
            ? <LoginForm onSwitchToRegister={() => setTab('register')} />
            : <RegisterForm onSwitchToLogin={() => setTab('login')} />
          }
        </div>
      </div>
    </div>
  )
}
