import apiClient from './client'
import { mapPageResponse, unwrapApiResponse } from './apiHelpers'


export function mapChatMessageFromApi(raw) {
  if (!raw) return raw
  return {
    id: String(raw.id),
    userId: raw.userId,
    documentId: raw.documentId != null ? String(raw.documentId) : null,
    documentTitle: raw.documentTitle || null,
    message: raw.message ?? '',
    response: raw.response ?? '',
    model: raw.model || null,
    createdAt: raw.createdAt,
  }
}

/** POST /api/chatbot/messages */
export async function sendChatMessage({ message, documentId } = {}) {
  const body = { message: (message || '').trim() }
  if (documentId) body.documentId = Number(documentId)

  const { data } = await apiClient.post('/chatbot/messages', body)
  const res = unwrapApiResponse(data)
  return {
    ...res,
    data: res.data ? mapChatMessageFromApi(res.data) : null,
  }
}

/** GET /api/chatbot/history */
export async function getChatHistory({ page = 0, size = 20 } = {}) {
  const { data } = await apiClient.get('/chatbot/history', {
    params: { page, size },
  })
  const res = unwrapApiResponse(data)
  return {
    ...res,
    data: mapPageResponse(res.data, mapChatMessageFromApi),
  }
}

/** DELETE /api/chatbot/history */
export async function clearChatHistory() {
  const { data } = await apiClient.delete('/chatbot/history')
  return unwrapApiResponse(data)
}
