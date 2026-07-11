import apiClient from './client'
import { mapPageResponse, unwrapApiResponse } from './apiHelpers'
import { listMyDocuments, listPublicDocuments } from './documentsApi'
import { buildCacheKey, cachedRequest, invalidateCache } from './requestCache'


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

  const { data } = await apiClient.post('/chatbot/messages', body)
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

/** Merge own + public documents eligible for chat context (SCRUM-46 / SCRUM-49). */
export async function listChatContextDocuments() {
  const [mineRes, publicRes] = await Promise.all([
    listMyDocuments({ page: 0, size: 100 }).catch(() => ({ success: false, data: { content: [] } })),
    listPublicDocuments({ page: 0, size: 100 }).catch(() => ({ success: false, data: { content: [] } })),
  ])

  const map = new Map()
  if (mineRes.success) {
    mineRes.data.content.forEach((doc) => map.set(doc.id, { ...doc, source: 'mine' }))
  }
  if (publicRes.success) {
    publicRes.data.content.forEach((doc) => {
      if (!map.has(doc.id)) map.set(doc.id, { ...doc, source: 'public' })
    })
  }

  const list = [...map.values()].sort((a, b) => a.title.localeCompare(b.title))
  return { success: true, data: list, message: null }
}
