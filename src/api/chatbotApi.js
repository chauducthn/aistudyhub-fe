import apiClient from './client'
import { mapPageResponse, unwrapApiResponse } from './apiHelpers'
import { getPublicDocument, listMyDocuments, listPublicDocuments } from './documentsApi'
import { buildCacheKey, cachedRequest, invalidateCache } from './requestCache'

const CHAT_RESPONSE_TIMEOUT_MS = 90_000

export function mapChatMessageFromApi(raw) {
  if (!raw) return raw
  return {
    id: String(raw.id),
    userId: raw.userId,
    documentId: raw.documentId != null ? String(raw.documentId) : null,
    documentTitle: raw.documentTitle || null,
    sessionId: raw.sessionId != null ? String(raw.sessionId) : null,
    message: raw.message ?? '',
    response: raw.response ?? '',
    model: raw.model || null,
    createdAt: raw.createdAt,
  }
}

export async function sendChatMessage({ message, documentId, sessionId } = {}) {
  const body = { message: (message || '').trim() }
  if (documentId) body.documentId = Number(documentId)
  if (sessionId) body.sessionId = Number(sessionId)

  const { data } = await apiClient.post('/chatbot/messages', body, {
    timeout: CHAT_RESPONSE_TIMEOUT_MS,
  })
  invalidateCache('chatbot:history')
  const res = unwrapApiResponse(data)
  return {
    ...res,
    data: res.data ? mapChatMessageFromApi(res.data) : null,
  }
}

export async function getChatSessions() {
  const { data } = await apiClient.get('/chatbot/sessions')
  return unwrapApiResponse(data)
}

export async function getSessionMessages(sessionId, { page = 0, size = 100 } = {}) {
  const params = { page, size }
  const { data } = await apiClient.get(`/chatbot/sessions/${sessionId}/messages`, { params })
  const res = unwrapApiResponse(data)
  return {
    ...res,
    data: mapPageResponse(res.data, mapChatMessageFromApi),
  }
}

export async function deleteChatSession(sessionId) {
  const { data } = await apiClient.delete(`/chatbot/sessions/${sessionId}`)
  invalidateCache('chatbot:history')
  return unwrapApiResponse(data)
}

export async function getChatHistory({ page = 0, size = 20 } = {}) {
  const params = { page, size }
  return cachedRequest(
    buildCacheKey('chatbot:history', params),
    async () => {
      const { data } = await apiClient.get('/chatbot/history', { params })
      const res = unwrapApiResponse(data)
      return {
        ...res,
        data: mapPageResponse(res.data, mapChatMessageFromApi),
      }
    },
    { ttlMs: 10_000 },
  )
}

export async function clearChatHistory() {
  const { data } = await apiClient.delete('/chatbot/history')
  invalidateCache('chatbot:history')
  return unwrapApiResponse(data)
}

/** Load only the current user's documents. Public documents are searched on demand. */
export async function listChatContextDocuments() {
  const mineRes = await listMyDocuments({ page: 0, size: 100 })
  const list = (mineRes.data?.content || []).map((document) => ({ ...document, source: 'mine' }))
  list.sort((a, b) => {
    const left = a.fileName || a.originalFilename || a.title
    const right = b.fileName || b.originalFilename || b.title
    return left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' })
  })
  return { success: mineRes.success, data: list, message: mineRes.message }
}

/** Search a small public result page only after the user provides a keyword. */
export async function searchPublicChatContextDocuments(search) {
  const keyword = (search || '').trim()
  if (keyword.length < 2) return { success: true, data: [], message: null }

  const response = await listPublicDocuments({ search: keyword, page: 0, size: 20 })
  return {
    ...response,
    data: (response.data?.content || []).map((document) => ({ ...document, source: 'public' })),
  }
}

/** Resolve a public document linked from its detail page without listing public documents. */
export async function getPublicChatContextDocument(id) {
  const response = await getPublicDocument(id)
  return {
    ...response,
    data: response.data ? { ...response.data, source: 'public' } : null,
  }
}
