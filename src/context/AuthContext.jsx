import { useCallback, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/authApi'
import { clearAccessToken, setAccessToken, setUnauthorizedHandler } from '../api/client'
import AuthContext from './authContextValue'

let sharedRefreshPromise = null
const SESSION_STORAGE_KEY = 'studyhub.auth.session'

function readStoredSession() {
  try {
    const rawSession = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!rawSession) return null

    const session = JSON.parse(rawSession)
    if (!session?.accessToken || !session?.user || session.expiresAt <= Date.now() + 30_000) {
      localStorage.removeItem(SESSION_STORAGE_KEY)
      return null
    }

    return session
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    return null
  }
}

function restoreStoredSession() {
  const session = readStoredSession()
  if (session) {
    setAccessToken(session.accessToken)
  }
  return session
}

function persistSession({ accessToken, expiresIn, user }) {
  const session = {
    accessToken,
    user,
    expiresAt: Date.now() + expiresIn * 1000,
  }
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

function updateStoredUser(user) {
  const session = readStoredSession()
  if (!session) return
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ ...session, user }))
}

function clearStoredSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY)
}

export function AuthProvider({ children }) {
  const [initialSession] = useState(restoreStoredSession)
  const [user, setUser] = useState(initialSession?.user || null)
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(!initialSession)

  const refreshSession = useCallback(async () => {
    if (!sharedRefreshPromise) {
      sharedRefreshPromise = authApi.refresh().finally(() => {
        setTimeout(() => {
          sharedRefreshPromise = null
        }, 100)
      })
    }

    const response = await sharedRefreshPromise
    if (!response.success) {
      throw new Error(response.message || 'Session refresh failed')
    }

    setAccessToken(response.data.accessToken)
    setUser(response.data.user)
    persistSession(response.data)
    return response.data.accessToken
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      try {
        return await refreshSession()
      } catch (error) {
        clearAccessToken()
        clearStoredSession()
        setUser(null)
        throw error
      }
    })

    const initializeSession = async () => {
      try {
        await refreshSession()
      } catch {
        clearAccessToken()
        clearStoredSession()
        setUser(null)
      } finally {
        setInitializing(false)
      }
    }

    const revalidateStoredSession = async () => {
      try {
        await refreshSession()
      } catch {
        clearAccessToken()
        clearStoredSession()
        setUser(null)
      }
    }

    if (initialSession) {
      void revalidateStoredSession()
    } else {
      void initializeSession()
    }

    return () => setUnauthorizedHandler(null)
  }, [initialSession, refreshSession])

  const login = useCallback(async (credentials) => {
    setLoading(true)
    try {
      const response = await authApi.login(credentials)
      if (!response.success) {
        throw new Error(response.message || 'Login failed')
      }
      setAccessToken(response.data.accessToken)
      setUser(response.data.user)
      persistSession(response.data)
      return response.data
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (payload) => {
    setLoading(true)
    try {
      const response = await authApi.register(payload)
      if (!response.success) {
        throw new Error(response.message || 'Registration failed')
      }
      setAccessToken(response.data.accessToken)
      setUser(response.data.user)
      persistSession(response.data)
      return response.data
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      clearAccessToken()
      clearStoredSession()
      setUser(null)
    }
  }, [])

  const updateProfile = useCallback(async (payload) => {
    const response = await authApi.updateProfile(payload)
    if (!response.success) {
      throw new Error(response.message || 'Profile update failed')
    }
    setUser(response.data)
    updateStoredUser(response.data)
    return response.data
  }, [])

  const uploadAvatar = useCallback(async (file) => {
    const response = await authApi.uploadAvatar(file)
    if (!response.success) {
      throw new Error(response.message || 'Avatar upload failed')
    }
    setUser(response.data)
    updateStoredUser(response.data)
    return response.data
  }, [])

  const deleteAvatar = useCallback(async () => {
    const response = await authApi.deleteAvatar()
    if (!response.success) {
      throw new Error(response.message || 'Avatar delete failed')
    }
    setUser(response.data)
    updateStoredUser(response.data)
    return response.data
  }, [])

  const changePassword = useCallback(async (payload) => {
    const response = await authApi.changePassword(payload)
    if (!response.success) {
      throw new Error(response.message || 'Password change failed')
    }
    return response
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      initializing,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      updateProfile,
      uploadAvatar,
      deleteAvatar,
      changePassword,
    }),
    [user, loading, initializing, login, register, logout, updateProfile, uploadAvatar, deleteAvatar, changePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
