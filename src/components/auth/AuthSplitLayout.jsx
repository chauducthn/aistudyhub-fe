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
    <div className="grid min-h-screen bg-white lg:h-screen lg:min-h-0 lg:grid-cols-2 lg:overflow-hidden">
      <section
        className={`relative hidden overflow-hidden px-10 py-8 lg:flex lg:flex-col xl:py-10 ${
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

        <div className="relative z-10 mt-6 max-w-[520px] xl:mt-10">
          <h1
            className={`font-extrabold leading-[1.15] tracking-tight ${
              isRegister
                ? 'text-[32px] xl:text-[40px] 2xl:text-[44px]'
                : 'text-[32px] xl:text-[38px] 2xl:text-[42px]'
            }`}
            style={{ fontFamily: '"Plus Jakarta Sans", Inter, sans-serif' }}
          >
            {heroTitle}
          </h1>
          {heroSubtitle && (
            <p
              className={`mt-4 text-base leading-7 xl:text-lg xl:leading-8 ${
                isRegister ? 'text-indigo-100' : 'text-[#464555]'
              }`}
            >
              {heroSubtitle}
            </p>
          )}
          {heroList.length > 0 && (
            <ul className="mt-6 space-y-3 xl:mt-8 xl:space-y-4">
              {heroList.map(({ text, icon: Icon }) => (
                <li key={text} className="flex items-center gap-4 text-sm font-semibold text-white xl:text-base">
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
          <div className="relative z-10 mt-auto flex min-h-0 flex-col pt-4">
            <div className="flex min-h-0 flex-1 items-end justify-center">
              {isRegister ? (
                <div className="w-full max-w-[420px] rounded-2xl border border-white/20 bg-white/10 p-3 shadow-2xl">
                  <div className="overflow-hidden rounded-xl">
                    <img
                      src={heroImage}
                      alt={heroImageAlt}
                      className="mx-auto block h-auto max-h-[34vh] w-full object-contain"
                    />
                  </div>
                </div>
              ) : (
                <img
                  src={heroImage}
                  alt={heroImageAlt}
                  className="mx-auto block h-auto max-h-[40vh] w-full max-w-[440px] rounded-2xl object-contain"
                />
              )}
            </div>
            <p
              className={`mt-3 text-xs xl:text-sm ${
                isRegister ? 'text-indigo-200/90' : 'font-semibold text-[#74798a]'
              }`}
            >
              © 2024 AI Study Hub. Designed for the future of education.
            </p>
          </div>
        )}
      </section>

      <main className="flex flex-col items-center bg-white px-6 py-8 sm:px-8 lg:overflow-y-auto lg:py-10">
        <div className="mb-6 w-full max-w-[460px] lg:hidden">
          <BrandLogo />
        </div>

        {showBackHome && (
          <div className="mb-4 hidden w-full max-w-[460px] lg:block">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#464555] transition hover:text-[#3525cd]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to Home
            </Link>
          </div>
        )}

        <div className="my-auto w-full max-w-[460px]">{children}</div>
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

export function AuthField({ label, id, children, hint, error }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-[#0b1c30]">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error ? (
        <p className="mt-1.5 text-xs font-semibold text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs font-medium text-[#74798a]">{hint}</p>
      ) : null}
    </div>
  )
}

export function AuthPrimaryButton({ children, disabled, type = 'submit' }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3525cd] text-sm font-bold text-white shadow-[0_10px_15px_-3px_rgba(53,37,205,0.28)] transition hover:bg-[#2d1fb0] disabled:cursor-not-allowed disabled:opacity-60"
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
