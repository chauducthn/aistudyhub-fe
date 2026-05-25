import { useCallback, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/authApi'
import {
  clearAccessToken,
  setAccessToken,
  setOnSessionExpired,
  setOnTokenRefreshed,
} from '../api/client'
import AuthContext from './authContextValue'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)

  const applyAuthData = useCallback((data) => {
    setAccessToken(data.accessToken)
    setUser(data.user)
  }, [])

  const clearSession = useCallback(() => {
    clearAccessToken()
    setUser(null)
  }, [])

  const refreshSession = useCallback(async () => {
    const response = await authApi.refresh()
    if (!response.success) {
      throw new Error(response.message || 'Session refresh failed')
    }
    applyAuthData(response.data)
    return response.data.accessToken
  }, [applyAuthData])

  useEffect(() => {
    setOnTokenRefreshed((data) => {
      applyAuthData(data)
    })

    setOnSessionExpired(() => {
      clearSession()
    })

    const initializeSession = async () => {
      try {
        await refreshSession()
      } catch {
        clearSession()
      } finally {
        setInitializing(false)
      }
    }

    void initializeSession()

    return () => {
      setOnTokenRefreshed(null)
      setOnSessionExpired(null)
    }
  }, [applyAuthData, clearSession, refreshSession])

  const login = useCallback(async (credentials) => {
    setLoading(true)
    clearAccessToken()
    try {
      const response = await authApi.login(credentials)
      if (!response.success) {
        throw new Error(response.message || 'Login failed')
      }
      applyAuthData(response.data)
      return response.data
    } finally {
      setLoading(false)
    }
  }, [applyAuthData])

  const register = useCallback(async (payload) => {
    setLoading(true)
    clearAccessToken()
    try {
      const response = await authApi.register(payload)
      if (!response.success) {
        throw new Error(response.message || 'Registration failed')
      }
      applyAuthData(response.data)
      return response.data
    } finally {
      setLoading(false)
    }
  }, [applyAuthData])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      clearSession()
    }
  }, [clearSession])

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

  const uploadAvatar = useCallback(async (file) => {
    const response = await authApi.uploadAvatar(file)
    if (!response.success) {
      throw new Error(response.message || 'Avatar upload failed')
    }
    setUser(response.data)
    return response.data
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
      uploadAvatar,
    }),
    [
      user,
      loading,
      initializing,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      uploadAvatar,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
