import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function PasswordInput({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  minLength,
  autoComplete = 'current-password',
  invalid = false,
  disabled = false,
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`auth-input auth-input--with-affix ${invalid ? 'auth-input--invalid' : ''}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-[#74798a] transition hover:bg-[#dce4ff] hover:text-[#3525cd]"
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}
