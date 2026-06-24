const cache = new Map()
const pending = new Map()

export function buildCacheKey(scope, params = {}) {
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${String(value)}`)

  return entries.length ? `${scope}?${entries.join('&')}` : scope
}

export function cachedRequest(key, fetcher, { ttlMs = 15_000, force = false } = {}) {
  const now = Date.now()
  const cached = cache.get(key)

  if (!force && cached && cached.expiresAt > now) {
    return Promise.resolve(cached.value)
  }

  if (!force && pending.has(key)) {
    return pending.get(key)
  }

  const request = Promise.resolve()
    .then(fetcher)
    .then((value) => {
      cache.set(key, {
        value,
        expiresAt: Date.now() + ttlMs,
      })
      return value
    })
    .finally(() => {
      pending.delete(key)
    })

  pending.set(key, request)
  return request
}

export function invalidateCache(prefix) {
  if (!prefix) {
    cache.clear()
    pending.clear()
    return
  }

  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key)
  }
  for (const key of pending.keys()) {
    if (key.startsWith(prefix)) pending.delete(key)
  }
}
