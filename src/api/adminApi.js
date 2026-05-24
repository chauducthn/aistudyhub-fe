import apiClient from './client'

export async function getAdminMetrics() {
  const { data } = await apiClient.get('/admin/dashboard/metrics')
  return data
}

export async function getAdminUsers({ search = '', page = 0, size = 10 } = {}) {
  const { data } = await apiClient.get('/admin/users', {
    params: { search, page, size },
  })
  return data
}

export async function updateAdminUserStatus(userId, status) {
  const { data } = await apiClient.patch(`/admin/users/${userId}/status`, {
    status,
  })
  return data
}
