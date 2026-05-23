import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/authApi'
import { clearAccessToken, setAccessToken, setUnauthorizedHandler } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)

  const refreshSession = useCallback(async () => {
    const response = await authApi.refresh()
    if (!response.success) {
      throw new Error(response.message || 'Session refresh failed')
    }
    setAccessToken(response.data.accessToken)
    setUser(response.data.user)
    return response.data.accessToken
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      try {
        return await refreshSession()
      } catch (error) {
        clearAccessToken()
        setUser(null)
        throw error
      }
    })

    refreshSession()
      .catch(() => {
        clearAccessToken()
        setUser(null)
      })
      .finally(() => setInitializing(false))

    return () => setUnauthorizedHandler(null)
  }, [refreshSession])

  const login = useCallback(async (credentials) => {
    setLoading(true)
    try {
      const response = await authApi.login(credentials)
      if (!response.success) {
        throw new Error(response.message || 'Login failed')
      }
      setAccessToken(response.data.accessToken)
      setUser(response.data.user)
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
      setUser(null)
    }
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
    }),
    [user, loading, initializing, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
