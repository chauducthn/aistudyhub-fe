import { ArrowLeft, Home, Search } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#f6f8fd] px-4 py-12">
      <div className="w-full max-w-xl rounded-3xl border border-[#c7c4d8]/25 bg-white p-10 text-center shadow-[0_24px_60px_rgba(11,28,48,0.08)]">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#e8e3ff] text-[#3525cd]">
          <Search className="h-7 w-7" aria-hidden />
        </span>
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.3em] text-[#3525cd]">
          Error 404
        </p>
        <h1 className="mt-3 text-4xl font-extrabold text-[#0b1c30] sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-3 text-base text-[#464555]">
          The page <span className="font-bold text-[#0b1c30]">{location.pathname}</span> doesn&apos;t
          exist or hasn&apos;t been built yet.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#c7c4d8]/40 bg-white px-6 text-sm font-bold text-[#0b1c30] shadow-sm transition hover:bg-[#eff4ff] sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Go Back
          </button>
          <Link
            to="/"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3525cd] px-6 text-sm font-bold text-white shadow-[0_8px_20px_rgba(53,37,205,0.25)] transition hover:bg-[#2a1ea8] sm:w-auto"
          >
            <Home className="h-4 w-4" aria-hidden />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
