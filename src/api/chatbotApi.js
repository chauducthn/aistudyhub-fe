import apiClient from './client'
import { mapPageResponse, unwrapApiResponse } from './apiHelpers'
import { listMyDocuments, listPublicDocuments } from './documentsApi'


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
