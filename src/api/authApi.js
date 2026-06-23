import apiClient from './client'
import { invalidateCache } from './requestCache'

let refreshRequest = null

export async function register({ email, password, fullName }) {
  const { data } = await apiClient.post('/auth/register', {
    email,
    password,
    fullName,
  })
  return data
}

export async function login({ email, password }) {
  const { data } = await apiClient.post('/auth/login', {
    email,
    password,
  })
  invalidateCache()
  return data
}

export async function logout() {
  const { data } = await apiClient.post('/auth/logout')
  invalidateCache()
  return data
}

export async function refresh() {
  if (!refreshRequest) {
    refreshRequest = apiClient
      .post('/auth/refresh')
      .then(({ data }) => data)
      .finally(() => {
        refreshRequest = null
      })
  }
  return refreshRequest
}

export async function getCurrentUser() {
  const { data } = await apiClient.get('/users/me')
  return data
}

export async function updateProfile({ fullName }) {
  const { data } = await apiClient.patch('/users/me', {
    fullName,
  })
  invalidateCache()
  return data
}

export async function uploadAvatar(file) {
  const formData = new FormData()
  formData.append('avatar', file)

  const { data } = await apiClient.patch('/users/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  invalidateCache()
  return data
}

export async function deleteAvatar() {
  const { data } = await apiClient.delete('/users/me/avatar')
  invalidateCache()
  return data
}

export async function changePassword({ currentPassword, newPassword }) {
  const { data } = await apiClient.patch('/users/me/password', {
    currentPassword,
    newPassword,
  })
  return data
}

export async function forgotPassword({ email }) {
  const { data } = await apiClient.post('/auth/forgot-password', { email })
  return data
}

export async function resetPassword({ token, newPassword }) {
  const { data } = await apiClient.post('/auth/reset-password', { token, newPassword })
  return data
}
