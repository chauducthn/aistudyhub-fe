import googleIcon from '../../assets/icons/google-icon.svg'

export default function GoogleSignInButton({ label = 'Continue with Google', variant = 'default', className = '' }) {
  const isRegister = variant === 'register'

  return (
    <button
      type="button"
      className={`flex h-12 w-full items-center justify-center gap-3 rounded-xl text-sm font-bold transition ${
        isRegister
          ? 'bg-[#57dffe]/20 text-[#0b1c30] hover:bg-[#57dffe]/30'
          : 'border border-[#c7c4d8]/50 bg-white text-[#464555] shadow-sm hover:bg-[#f8f9ff]'
      } ${className}`}
    >
      <img src={googleIcon} alt="" className="h-5 w-5" />
      {label}
    </button>
  )
}
