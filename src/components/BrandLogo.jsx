import { Link } from 'react-router-dom'
import logo from '../assets/logos/ai-study-hub-logo.svg'

export default function BrandLogo({ to = '/', light = false, subtitle = false, className = '' }) {
  return (
    <Link to={to} className={`flex items-center gap-3 ${className}`}>
      <img src={logo} alt="AI Study Hub" className="h-10 w-10 rounded-lg" />
      <span>
        <span className={`block text-2xl font-extrabold ${light ? 'text-white' : 'text-[#3525cd]'}`}>
          AI Study Hub
        </span>
        {subtitle && (
          <span
            className={`block text-[10px] font-bold uppercase tracking-[0.18em] ${
              light ? 'text-indigo-200' : 'text-[#74798a]'
            }`}
          >
            Academic AI Assistant
          </span>
        )}
      </span>
    </Link>
  )
}
