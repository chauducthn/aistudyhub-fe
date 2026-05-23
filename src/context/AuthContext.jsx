import { useCallback, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/authApi'
import { clearAccessToken, setAccessToken, setUnauthorizedHandler } from '../api/client'
import AuthContext from './authContextValue'

let sharedRefreshPromise = null

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)

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

    const initializeSession = async () => {
      try {
        await refreshSession()
      } catch {
        clearAccessToken()
        setUser(null)
      } finally {
        setInitializing(false)
      }
    }

    void initializeSession()

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

  const updateProfile = useCallback(async (payload) => {
    const response = await authApi.updateProfile(payload)
    if (!response.success) {
      throw new Error(response.message || 'Profile update failed')
    }
    setUser(response.data)
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
      changePassword,
    }),
    [user, loading, initializing, login, register, logout, updateProfile, changePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
