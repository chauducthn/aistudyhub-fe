import apiClient from './client'
import { mapPageResponse, unwrapApiResponse } from './apiHelpers'
import { buildCacheKey, cachedRequest, invalidateCache } from './requestCache'

export const REPORT_REASONS = [
  { value: 'COPYRIGHT', label: 'Copyright violation' },
  { value: 'ILLEGAL_CONTENT', label: 'Illegal content' },
  { value: 'OFFENSIVE_CONTENT', label: 'Offensive content' },
  { value: 'MISLEADING_CONTENT', label: 'Misleading content' },
  { value: 'MALICIOUS_FILE', label: 'Malicious file' },
  { value: 'OTHER', label: 'Other' },
]

export const REPORT_STATUS_OPTIONS = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'REVIEWED', label: 'Reviewed' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'RESOLVED', label: 'Resolved' },
]

export function mapReportFromApi(raw) {
  return {
    id: String(raw.id),
    documentId: String(raw.documentId),
    documentTitle: raw.documentTitle,
    documentStatus: raw.documentStatus,
    reporterId: raw.reporterId,
    reporterEmail: raw.reporterEmail,
    reason: raw.reason,
    description: raw.description || '',
    status: raw.status,
    adminNote: raw.adminNote,
    createdAt: raw.createdAt,
    resolvedAt: raw.resolvedAt,
  }
}

export function reportReasonLabel(reason) {
  return REPORT_REASONS.find((r) => r.value === reason)?.label || reason
}

/** POST /api/documents/:documentId/reports */
export async function submitDocumentReport(documentId, { reason, description }) {
  const docId = String(documentId).replace(/^doc-/, '')
  const { data } = await apiClient.post(`/documents/${docId}/reports`, {
    reason,
    description: description?.trim() || undefined,
  })
  invalidateCache('admin:reports')
  const body = unwrapApiResponse(data)
  return {
    ...body,
    data: body.data ? mapReportFromApi(body.data) : null,
  }
}

/** GET /api/admin/reports */
export async function listAdminReports({ status = 'ALL', page = 0, size = 10 } = {}) {
  const params = { page, size }
  if (status && status !== 'ALL') params.status = status

  return cachedRequest(
    buildCacheKey('admin:reports', params),
    async () => {
      const { data } = await apiClient.get('/admin/reports', { params })
      const body = unwrapApiResponse(data)
      return {
        ...body,
        data: mapPageResponse(body.data, mapReportFromApi),
      }
    },
    { ttlMs: 10_000 },
  )
}

/** PATCH /api/admin/reports/:reportId/resolve */
export async function resolveAdminReport(reportId, payload) {
  const { data } = await apiClient.patch(`/admin/reports/${reportId}/resolve`, payload)
  invalidateCache('admin:')
  const body = unwrapApiResponse(data)
  return {
    ...body,
    data: body.data ? mapReportFromApi(body.data) : null,
  }
}
