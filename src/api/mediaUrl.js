/** Resolve relative upload paths from the API (e.g. /uploads/documents/...). */
export function resolveMediaUrl(url) {
  if (!url) return null
  if (url.startsWith('http')) return url
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
  const origin = apiBase.replace(/\/api\/?$/, '')
  return `${origin}${url.startsWith('/') ? url : `/${url}`}`
}
