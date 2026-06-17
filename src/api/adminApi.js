import apiClient from './client'
import { mapPageResponse, unwrapApiResponse } from './apiHelpers'
import { mapDocumentFromApi } from './documentsApi'

export async function getDashboardMetrics() {
  const { data } = await apiClient.get('/admin/dashboard/metrics')
  return data
}

/** GET /api/admin/documents — full-text search across ALL users' documents */
export async function listAdminDocuments({ keyword = '', status = '', userId = '', page = 0, size = 10 } = {}) {
  const params = { page, size }
  if (keyword.trim()) params.keyword = keyword.trim()
  if (status) params.status = status
  if (userId) params.userId = Number(userId)

  const { data } = await apiClient.get('/admin/documents', { params })
  const body = unwrapApiResponse(data)
  return {
    ...body,
    data: mapPageResponse(body.data, mapDocumentFromApi),
  }
}

export async function listUsers({ search = '', page = 0, size = 10 } = {}) {
  const { data } = await apiClient.get('/admin/users', {
    params: { search, page, size },
  })
  return data
}

export async function listReports({ status = 'PENDING', page = 0, size = 10 } = {}) {
  const { data } = await apiClient.get('/admin/reports', {
    params: { status, page, size },
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
