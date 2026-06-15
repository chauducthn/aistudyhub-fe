export function MetricCard({ icon: Icon, label, value, tag, highlight }) {
  const tagToneClass = {
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    gray: 'bg-[#eff4ff] text-[#74798a]',
    urgent: 'bg-red-500 text-white',
  }
  return (
    <article
      className={`rounded-2xl border p-5 shadow-sm ${
        highlight
          ? 'border-[#3525cd]/40 bg-[#eef0ff]'
          : 'border-[#c7c4d8]/20 bg-white'
      }`}
    >
      <div className="flex items-start justify-between">
        <span
          className={`grid h-10 w-10 place-items-center rounded-xl ${
            highlight ? 'bg-white text-[#3525cd]' : 'bg-[#e8e3ff] text-[#3525cd]'
          }`}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        {tag && (
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${tagToneClass[tag.tone] || tagToneClass.gray}`}>
            {tag.text}
          </span>
        )}
      </div>
      <p className="mt-5 text-xs font-bold uppercase tracking-wide text-[#74798a]">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-[#0b1c30]">{value}</p>
    </article>
  )
}

export function CircularProgress({ percent, overLimit = false }) {
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const safePercent = Math.max(0, Math.min(100, percent))
  const offset = circumference * (1 - safePercent / 100)
  return (
    <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
      <circle cx="80" cy="80" r={radius} fill="none" stroke="#eef0ff" strokeWidth="14" />
      <circle
        cx="80"
        cy="80"
        r={radius}
        fill="none"
        stroke={overLimit ? '#ef4444' : '#3525cd'}
        strokeWidth="14"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  )
}

export function BreakdownRow({ label, value, tone }) {
  return (
    <li className="flex items-center justify-between rounded-xl border border-[#c7c4d8]/25 px-3 py-2.5">
      <span className="flex items-center gap-2.5 text-sm font-bold text-[#0b1c30]">
        <span className={`h-2.5 w-2.5 rounded-full ${tone}`} />
        {label}
      </span>
      <span className="text-sm font-extrabold text-[#464555]">
        {value == null ? '—' : value.toLocaleString()}
      </span>
    </li>
  )
}

export function DashboardSmallMetric({ icon: Icon, label, value, note }) {
  return (
    <article className="flex items-center gap-3 rounded-xl border border-[#c7c4d8]/20 bg-white px-4 py-3 shadow-sm">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#eff4ff] text-[#3525cd]">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-[#74798a]">{label}</p>
        <p className="text-xl font-extrabold text-[#0b1c30]">{value}</p>
        {note && <p className="text-[10px] font-bold text-[#74798a]">{note}</p>}
      </div>
    </article>
  )
}
