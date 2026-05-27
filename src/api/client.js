import axios from 'axios'

/**
 * FR-01.4 — Silent Refresh Token
 * 1. API trả 401 (access token hết hạn)
 * 2. Interceptor gọi POST /auth/refresh (cookie HttpOnly refresh_token)
 * 3. BE xác thực refresh token trong DB, cấp access token mới
 * 4. FE retry request ban đầu với token mới (người dùng không bị đăng xuất đột ngột)
 */

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

/** Client riêng cho refresh — tránh vòng lặp interceptor */
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

const AUTH_NO_RETRY_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/logout',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
]

let accessToken = null
let refreshPromise = null
let onTokenRefreshed = null
let onSessionExpired = null

export function setAccessToken(token) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

export function clearAccessToken() {
  accessToken = null
}

/** AuthContext đăng ký: cập nhật user sau silent refresh */
export function setOnTokenRefreshed(handler) {
  onTokenRefreshed = handler
}

/** AuthContext đăng ký: refresh thất bại → xóa session */
export function setOnSessionExpired(handler) {
  onSessionExpired = handler
}

function isAuthNoRetryUrl(url = '') {
  return AUTH_NO_RETRY_PATHS.some((path) => url.includes(path))
}

async function silentRefresh() {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post('/auth/refresh')
      .then((response) => {
        const body = response.data
        if (!body?.success || !body?.data?.accessToken) {
          throw new Error(body?.message || 'Session refresh failed')
        }

        accessToken = body.data.accessToken
        onTokenRefreshed?.(body.data)
        return accessToken
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

apiClient.interceptors.request.use((config) => {
  const url = config.url || ''
  const skipAuthHeader = isAuthNoRetryUrl(url)

  if (accessToken && !skipAuthHeader) {
    config.headers.Authorization = `Bearer ${accessToken}`
  } else if (skipAuthHeader && config.headers?.Authorization) {
    delete config.headers.Authorization
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status
    const requestUrl = originalRequest?.url || ''

    const shouldAttemptRefresh =
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthNoRetryUrl(requestUrl)

    if (!shouldAttemptRefresh) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      const newToken = await silentRefresh()
      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return apiClient(originalRequest)
    } catch (refreshError) {
      clearAccessToken()
      onSessionExpired?.()
      return Promise.reject(refreshError)
    }
  },
)

export default apiClient
