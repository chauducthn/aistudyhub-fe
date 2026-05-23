import { Link } from 'react-router-dom'
import logo from '../assets/logos/ai-study-hub-logo.svg'

export default function BrandLogo({ to = '/', light = false, subtitle = false, className = '' }) {
  return (
    <Link to={to} className={`flex items-center gap-3 ${className}`}>
      <img src={logo} alt="AI Study Hub" className="h-10 w-10 rounded-lg" />
      <span>
        <span className={`block text-2xl font-extrabold ${light ? 'text-white' : 'text-[#3427d9]'}`}>
          AI Study Hub
        </span>
        {subtitle && (
          <span className={`block text-xs font-bold uppercase tracking-wider ${light ? 'text-indigo-100' : 'text-slate-500'}`}>
            Academic AI Assistant
          </span>
        )}
      </span>
    </Link>
  )
}
