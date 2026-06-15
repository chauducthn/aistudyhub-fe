export function capitalize(value = '') {
  if (!value) return ''
  return value.charAt(0) + value.slice(1).toLowerCase()
}

export function relativeTime(value) {
  if (!value) return '—'
  const diffMs = Date.now() - new Date(value).getTime()
  if (Number.isNaN(diffMs)) return '—'
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

export function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function formatStorage(gb) {
  if (gb == null || Number.isNaN(gb)) return '—'
  if (gb >= 1024) return `${(gb / 1024).toFixed(2)} TB`
  return `${gb.toFixed(gb >= 100 ? 0 : 1)} GB`
}

export function formatReason(reason) {
  if (!reason) return '—'
  return String(reason)
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ')
}

export function mapApiUser(u) {
  return {
    id: u.id,
    initials: (u.fullName || 'U')
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    fullName: u.fullName,
    email: u.email,
    role: capitalize(u.role),
    status: u.status === 'LOCKED' ? 'Locked' : 'Active',
    joined: relativeTime(u.createdAt),
  }
}
