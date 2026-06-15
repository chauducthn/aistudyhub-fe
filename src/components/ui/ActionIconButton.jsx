export default function ActionIconButton({ children, label, onClick, disabled, tone = 'default' }) {
  const toneClass = {
    default: 'text-[#464555] hover:bg-[#eff4ff] hover:text-[#3525cd]',
    danger: 'text-[#464555] hover:bg-red-50 hover:text-red-600',
    active: 'bg-[#e8e3ff] text-[#3525cd] hover:bg-[#dcd3ff]',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 place-items-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${toneClass[tone] || toneClass.default}`}
    >
      {children}
    </button>
  )
}
