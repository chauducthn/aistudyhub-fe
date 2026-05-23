import apiClient from './client'

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
  return data
}

export async function logout() {
  const { data } = await apiClient.post('/auth/logout')
  return data
}

export async function refresh() {
  const { data } = await apiClient.post('/auth/refresh')
  return data
}

export async function getCurrentUser() {
  const { data } = await apiClient.get('/users/me')
  return data
}

export async function updateProfile({ fullName, avatarUrl }) {
  const { data } = await apiClient.patch('/users/me', {
    fullName,
    avatarUrl,
  })
  return data
}

export async function changePassword({ currentPassword, newPassword }) {
  const { data } = await apiClient.patch('/users/me/password', {
    currentPassword,
    newPassword,
  })
  return data
}
