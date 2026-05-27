import apiClient from './client'

export async function getDashboardMetrics() {
  const { data } = await apiClient.get('/admin/dashboard/metrics')
  return data
}

export async function listUsers({ search = '', page = 0, size = 10 } = {}) {
  const { data } = await apiClient.get('/admin/users', {
    params: { search, page, size },
  })
  return data
}

export async function updateUserStatus(userId, status) {
  const { data } = await apiClient.patch(`/admin/users/${userId}/status`, {
    status,
  })
  return data
}

export const getAdminMetrics = getDashboardMetrics
export const getAdminUsers = listUsers
export const updateAdminUserStatus = updateUserStatus
