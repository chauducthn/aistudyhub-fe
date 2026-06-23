import apiClient from './client'
import { mapPageResponse, unwrapApiResponse } from './apiHelpers'
import { mapDocumentFromApi } from './documentsApi'
import { buildCacheKey, cachedRequest, invalidateCache } from './requestCache'

export async function getDashboardMetrics() {
  return cachedRequest(
    'admin:metrics',
    async () => {
      const { data } = await apiClient.get('/admin/dashboard/metrics')
      return data
    },
    { ttlMs: 15_000 },
  )
}

/** GET /api/admin/documents — full-text search across ALL users' documents */
export async function listAdminDocuments({ keyword = '', status = '', userId = '', page = 0, size = 10 } = {}) {
  const params = { page, size }
  if (keyword.trim()) params.keyword = keyword.trim()
  if (status) params.status = status
  if (userId) params.userId = Number(userId)

  return cachedRequest(
    buildCacheKey('admin:documents', params),
    async () => {
      const { data } = await apiClient.get('/admin/documents', { params })
      const body = unwrapApiResponse(data)
      return {
        ...body,
        data: mapPageResponse(body.data, mapDocumentFromApi),
      }
    },
    { ttlMs: 10_000 },
  )
}

export async function listUsers({ search = '', page = 0, size = 10 } = {}) {
  const params = { search, page, size }
  return cachedRequest(
    buildCacheKey('admin:users', params),
    async () => {
      const { data } = await apiClient.get('/admin/users', { params })
      return data
    },
    { ttlMs: 10_000 },
  )
}

export async function listReports({ status = 'PENDING', page = 0, size = 10 } = {}) {
  const params = { status, page, size }
  return cachedRequest(
    buildCacheKey('admin:reports', params),
    async () => {
      const { data } = await apiClient.get('/admin/reports', { params })
      return data
    },
    { ttlMs: 10_000 },
  )
}

export async function updateUserStatus(userId, status) {
  const { data } = await apiClient.patch(`/admin/users/${userId}/status`, {
    status,
  })
  invalidateAdminCaches()
  return data
}

export async function updateUser(userId, { fullName, phone }) {
  const { data } = await apiClient.patch(`/admin/users/${userId}`, {
    fullName,
    phone: phone || null,
  })
  invalidateAdminCaches()
  return data
}

export async function resetUserPassword(userId, newPassword) {
  const { data } = await apiClient.patch(`/admin/users/${userId}/password`, {
    newPassword,
  })
  invalidateAdminCaches()
  return data
}

export async function deleteUser(userId) {
  const { data } = await apiClient.delete(`/admin/users/${userId}`)
  invalidateAdminCaches()
  return data
}

function invalidateAdminCaches() {
  invalidateCache('admin:')
}

export const getAdminMetrics = getDashboardMetrics
export const getAdminUsers = listUsers
export const updateAdminUserStatus = updateUserStatus
