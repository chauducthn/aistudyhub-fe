import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import BrandLogo from '../BrandLogo'

export default function AuthSplitLayout({
  variant = 'login',
  heroImage,
  heroImageAlt = '',
  heroTitle,
  heroSubtitle,
  heroList = [],
  children,
  showBackHome = true,
}) {
  const isRegister = variant === 'register'

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <section
        className={`relative hidden overflow-hidden px-10 py-10 lg:flex lg:flex-col ${
          isRegister
            ? 'bg-[#3525cd] text-white'
            : 'bg-gradient-to-br from-[#eaf0ff] via-[#f4f7ff] to-white text-[#0b1c30]'
        }`}
      >
        {isRegister && (
          <>
            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute bottom-20 left-8 h-56 w-56 rounded-full bg-white/5" />
          </>
        )}

        <BrandLogo light={isRegister} className="relative z-10" />

        <div className="relative z-10 mt-12 max-w-[520px] xl:mt-14">
          <h1
            className={`font-extrabold leading-[1.15] tracking-tight ${
              isRegister ? 'text-[40px] xl:text-[44px]' : 'text-[38px] xl:text-[42px]'
            }`}
            style={{ fontFamily: '"Plus Jakarta Sans", Inter, sans-serif' }}
          >
            {heroTitle}
          </h1>
          {heroSubtitle && (
            <p
              className={`mt-5 text-lg leading-8 ${
                isRegister ? 'text-indigo-100' : 'text-[#464555]'
              }`}
            >
              {heroSubtitle}
            </p>
          )}
          {heroList.length > 0 && (
            <ul className="mt-10 space-y-6">
              {heroList.map(({ text, icon: Icon }) => (
                <li key={text} className="flex items-center gap-4 text-base font-semibold text-white">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/15">
                    <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          )}
        </div>

        {heroImage && (
          <div className={`relative z-10 mt-auto ${isRegister ? 'pt-8' : 'pt-6'}`}>
            {isRegister ? (
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-2xl">
                <div className="overflow-hidden rounded-xl">
                  <img src={heroImage} alt={heroImageAlt} className="h-auto w-full object-cover" />
                </div>
              </div>
            ) : (
              <img src={heroImage} alt={heroImageAlt} className="mx-auto w-full max-w-[480px] rounded-2xl" />
            )}
            <p
              className={`mt-4 text-sm ${
                isRegister ? 'text-indigo-200/90' : 'font-semibold text-[#74798a]'
              }`}
            >
              © 2024 AI Study Hub. Designed for the future of education.
            </p>
          </div>
        )}
      </section>

      <main className="flex flex-col items-center justify-center bg-white px-6 py-10 sm:px-8">
        <div className="mb-6 w-full max-w-[447px] lg:hidden">
          <BrandLogo />
        </div>

        {showBackHome && (
          <div className="mb-4 hidden w-full max-w-[447px] lg:block">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#464555] hover:text-[#3525cd]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to Home
            </Link>
          </div>
        )}

        <div className="w-full max-w-[447px]">{children}</div>
      </main>
    </div>
  )
}

export function AuthFormCard({ title, subtitle, children, footer }) {
  return (
    <div className="rounded-2xl border border-[#c7c4d8]/35 bg-white px-8 py-9 shadow-[0_18px_45px_rgba(11,28,48,0.08)]">
      <h2
        className="text-[28px] font-extrabold text-[#0b1c30]"
        style={{ fontFamily: '"Plus Jakarta Sans", Inter, sans-serif' }}
      >
        {title}
      </h2>
      {subtitle && <p className="mt-2 text-base text-[#464555]">{subtitle}</p>}
      <div className="mt-7">{children}</div>
      {footer && <div className="mt-7 border-t border-[#c7c4d8]/30 pt-6">{footer}</div>}
    </div>
  )
}

export function AuthField({ label, id, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-[#0b1c30]">
        {label}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  )
}

export function AuthPrimaryButton({ children, disabled, type = 'submit' }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className="h-12 w-full rounded-xl bg-[#3525cd] text-sm font-bold text-white shadow-[0_10px_15px_-3px_rgba(53,37,205,0.28)] transition hover:bg-[#2d1fb0] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  )
}

export function AuthAlert({ tone = 'error', children }) {
  const classes =
    tone === 'error'
      ? 'bg-red-50 text-red-700'
      : tone === 'success'
        ? 'bg-emerald-50 text-emerald-800'
        : 'bg-amber-50 text-amber-900'
  return (
    <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${classes}`} role="alert">
      {children}
    </div>
  )
}

export function AuthTextLink({ to, children }) {
  return (
    <Link to={to} className="font-bold text-[#3525cd] hover:underline">
      {children}
    </Link>
  )
}
