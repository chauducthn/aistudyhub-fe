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
    data: mapPageResponse(body.data, (raw) => ({
      ...mapDocumentFromApi(raw),
      userEmail: raw.userEmail,
      userFullName: raw.userFullName,
    })),
  }
}

/** PATCH /api/admin/documents/{id}/status */
export async function updateAdminDocumentStatus(documentId, status) {
  const { data } = await apiClient.patch(`/admin/documents/${documentId}/status`, { status })
  return data
}

/** DELETE /api/admin/documents/{id} */
export async function deleteAdminDocument(documentId) {
  const { data } = await apiClient.delete(`/admin/documents/${documentId}`)
  return data
}

/** GET /api/admin/documents/{id}/download — fetch the file (follows 302 to S3) */
export async function downloadAdminDocument(doc) {
  const response = await apiClient.get(`/admin/documents/${doc.id}/download`, {
    responseType: 'blob',
  })
  const blob = new Blob([response.data], {
    type: response.headers['content-type'] || 'application/octet-stream',
  })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = doc.fileName || doc.originalFilename || 'document'
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
  return { success: true }
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

export async function updateUser(userId, { fullName, phone }) {
  const { data } = await apiClient.patch(`/admin/users/${userId}`, {
    fullName,
    phone: phone || null,
  })
  return data
}

export async function resetUserPassword(userId, newPassword) {
  const { data } = await apiClient.patch(`/admin/users/${userId}/password`, {
    newPassword,
  })
  return data
}

export async function deleteUser(userId) {
  const { data } = await apiClient.delete(`/admin/users/${userId}`)
  return data
}

export const getAdminMetrics = getDashboardMetrics
export const getAdminUsers = listUsers
export const updateAdminUserStatus = updateUserStatus
