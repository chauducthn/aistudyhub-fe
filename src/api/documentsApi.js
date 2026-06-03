import apiClient from './client'
import { mapPageResponse, unwrapApiResponse } from './apiHelpers'
import { resolveMediaUrl } from './mediaUrl'
import { listSubjects as listSubjectsImpl } from './subjectsApi'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true'

export function mapDocumentFromApi(raw) {
  const visibility = raw.status || 'PRIVATE'
  const fileType = (raw.fileType || '')
    .toLowerCase()
    .replace(/^\./, '')
    .replace('application/', '')

  return {
    id: String(raw.id),
    userId: raw.userId,
    subjectId: raw.subjectId != null ? String(raw.subjectId) : '',
    subjectName: raw.subjectName || null,
    title: raw.title,
    description: raw.description || '',
    fileName: raw.originalFilename || raw.title,
    fileSize: raw.fileSize,
    fileType: fileType.includes('pdf') ? 'pdf' : fileType.split('/').pop() || fileType,
    fileUrl: raw.fileUrl,
    uploadedAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    status: visibility,
    visibility,
    downloadUrl: resolveMediaUrl(raw.fileUrl),
  }
}

function normalizeDocId(id) {
  return String(id).replace(/^doc-/, '')
}

function resolveListStatus(status, visibility) {
  if (visibility && visibility !== 'ALL') return visibility
  if (status && status !== 'ALL') return status
  return undefined
}

export async function listSubjects(params) {
  return listSubjectsImpl(params)
}

export async function getDocument(id) {
  if (USE_MOCK) {
    return getDocumentMock(id)
  }

  const docId = normalizeDocId(id)
  const { data } = await apiClient.get(`/documents/${docId}`)
  const mapped = mapDocumentFromApi(data.data)
  return {
    success: true,
    message: data?.message ?? null,
    data: { ...mapped, owner: null },
  }
}

export async function getDocumentPreview(id) {
  if (USE_MOCK) {
    return getDocumentPreviewMock(id)
  }

  const docRes = await getDocument(id)
  if (!docRes.success || !docRes.data) {
    return { success: false, data: null, message: 'Document not found.' }
  }
  return buildPreviewFromDoc(docRes.data)
}

export async function listMyDocuments(params = {}) {
  if (USE_MOCK) {
    return listMyDocumentsMock(params)
  }

  const {
    search = '',
    subjectId = '',
    status = 'ALL',
    visibility = 'ALL',
    page = 0,
    size = 10,
  } = params

  const apiStatus = resolveListStatus(status, visibility)
  const query = {
    keyword: search.trim() || undefined,
    subjectId: subjectId ? Number(subjectId) : undefined,
    status: apiStatus,
    page,
    size,
  }

  const { data } = await apiClient.get('/documents', { params: query })
  const body = unwrapApiResponse(data)
  return {
    ...body,
    data: mapPageResponse(body.data, mapDocumentFromApi),
  }
}

/** GET /api/documents/public — SCRUM-39 */
export async function listPublicDocuments(params = {}) {
  const { search = '', page = 0, size = 10 } = params
  const { data } = await apiClient.get('/documents/public', {
    params: {
      keyword: search.trim() || undefined,
      page,
      size,
    },
  })
  const body = unwrapApiResponse(data)
  return {
    ...body,
    data: mapPageResponse(body.data, mapDocumentFromApi),
  }
}

/** GET /api/documents/public/:id */
export async function getPublicDocument(id) {
  const docId = normalizeDocId(id)
  const { data } = await apiClient.get(`/documents/public/${docId}`)
  const body = unwrapApiResponse(data)
  return {
    ...body,
    data: body.data ? mapDocumentFromApi(body.data) : null,
  }
}

/** Preview for public document (SCRUM-39 / SCRUM-40) */
export async function getPublicDocumentPreview(id) {
  const docRes = await getPublicDocument(id)
  if (!docRes.success || !docRes.data) {
    return { success: false, data: null, message: 'Document not found.' }
  }
  return buildPreviewFromDoc(docRes.data)
}

function buildPreviewFromDoc(doc) {
  const ext = (doc.fileType || '').toLowerCase()
  const previewUrl = resolveMediaUrl(doc.fileUrl)

  if (ext === 'pdf' && previewUrl) {
    return {
      success: true,
      data: { type: 'pdf', previewUrl, fileName: doc.fileName },
      message: null,
    }
  }

  if (ext === 'txt' && previewUrl) {
    return fetch(previewUrl, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load text')
        return res.text()
      })
      .then((textContent) => ({
        success: true,
        data: { type: 'text', textContent, fileName: doc.fileName },
        message: null,
      }))
      .catch(() => ({
        success: false,
        data: null,
        message: 'Could not load text preview.',
      }))
  }

  return {
    success: false,
    data: null,
    message: `Inline preview is not available for ${ext.toUpperCase() || 'this'} files. Download to view.`,
  }
}

export async function uploadDocument(payload, onProgress) {
  if (USE_MOCK) {
    return uploadDocumentMock(payload, onProgress)
  }

  const formData = new FormData()
  formData.append('file', payload.file)
  formData.append('title', payload.title.trim())
  if (payload.description?.trim()) {
    formData.append('description', payload.description.trim())
  }
  if (payload.subjectId) {
    formData.append('subjectId', String(payload.subjectId))
  }

  const { data } = await apiClient.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (!event.total) return
      onProgress?.(Math.round((event.loaded * 100) / event.total))
    },
  })

  return {
    success: true,
    message: data?.message ?? 'Document uploaded.',
    data: mapDocumentFromApi(data.data),
  }
}

export async function updateDocument(id, payload) {
  if (USE_MOCK) {
    return updateDocumentMock(id, payload)
  }

  const docId = normalizeDocId(id)
  const body = {
    title: payload.title?.trim(),
    description: payload.description?.trim() ?? '',
  }
  if (payload.subjectId) {
    body.subjectId = Number(payload.subjectId)
  } else if (payload.subjectId === '') {
    body.subjectId = null
  }

  const { data } = await apiClient.patch(`/documents/${docId}`, body)
  let mapped = mapDocumentFromApi(data.data)

  if (payload.visibility && payload.visibility !== mapped.visibility) {
    const visRes = await apiClient.patch(`/documents/${docId}/visibility`, {
      status: payload.visibility,
    })
    mapped = mapDocumentFromApi(visRes.data.data)
  }

  return {
    success: true,
    message: data?.message ?? 'Document updated.',
    data: mapped,
  }
}

export async function deleteDocument(id) {
  if (USE_MOCK) {
    return deleteDocumentMock(id)
  }

  const docId = normalizeDocId(id)
  const { data } = await apiClient.delete(`/documents/${docId}`)
  return {
    success: true,
    message: data?.message ?? 'Document deleted.',
    data: { id: String(id) },
  }
}

export async function toggleDocumentVisibility(id) {
  if (USE_MOCK) {
    return toggleDocumentVisibilityMock(id)
  }

  const docRes = await getDocument(id)
  if (!docRes.success) {
    return { success: false, message: 'Document not found.', data: null }
  }

  const next = docRes.data.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC'
  const docId = normalizeDocId(id)
  const { data } = await apiClient.patch(`/documents/${docId}/visibility`, { status: next })

  return {
    success: true,
    message: data?.message ?? 'Visibility updated.',
    data: mapDocumentFromApi(data.data),
  }
}

export async function downloadDocument(doc) {
  if (USE_MOCK) {
    if (doc?.downloadUrl && doc.downloadUrl !== '#') {
      window.open(doc.downloadUrl, '_blank', 'noopener,noreferrer')
    }
    return { success: true, data: { id: doc?.id } }
  }

  const docId = normalizeDocId(doc.id)
  const response = await apiClient.get(`/documents/${docId}/download`, {
    responseType: 'blob',
  })

  const blob = response.data
  const disposition = response.headers['content-disposition'] || ''
  const match = disposition.match(/filename="?([^"]+)"?/i)
  const filename = match?.[1] || doc.fileName || 'download'

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)

  return { success: true, data: { id: doc.id } }
}

// --- Mock implementations (VITE_USE_MOCK_API=true) ---

const MOCK_DOCUMENTS = []
let documentsStore = []

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function getDocumentMock(id) {
  await delay(220)
  const doc = documentsStore.find((d) => d.id === id)
  if (!doc) {
    const error = new Error('Not Found')
    error.response = { status: 404, data: { success: false, message: 'Document not found.' } }
    throw error
  }
  return { success: true, data: { ...doc, owner: { fullName: 'Demo User', email: 'demo@edu' } } }
}

async function getDocumentPreviewMock(id) {
  await delay(320)
  const doc = documentsStore.find((d) => d.id === id)
  if (!doc) return { success: false, data: null, message: 'Document not found.' }
  if (doc.fileType === 'pdf') {
    return {
      success: true,
      data: {
        type: 'pdf',
        previewUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
        fileName: doc.fileName,
      },
    }
  }
  return { success: false, data: null, message: 'Preview not available in mock mode.' }
}

async function listMyDocumentsMock(params) {
  await delay(220)
  return { success: true, data: { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 } }
}

async function uploadDocumentMock(payload, onProgress) {
  for (let percent = 0; percent <= 100; percent += 10) {
    await delay(80)
    onProgress?.(percent)
  }
  const newDoc = {
    id: `doc-${Date.now()}`,
    title: payload.title,
    description: payload.description,
    subjectId: payload.subjectId,
    fileName: payload.file?.name,
    fileSize: payload.file?.size,
    fileType: 'pdf',
    uploadedAt: new Date().toISOString(),
    status: 'PRIVATE',
    visibility: 'PRIVATE',
  }
  documentsStore = [newDoc, ...documentsStore]
  return { success: true, message: 'Document uploaded (mock).', data: newDoc }
}

async function updateDocumentMock(id, payload) {
  await delay(200)
  const idx = documentsStore.findIndex((d) => d.id === id)
  if (idx === -1) throw Object.assign(new Error('Not Found'), { response: { status: 404 } })
  const updated = { ...documentsStore[idx], ...payload }
  documentsStore[idx] = updated
  return { success: true, data: updated }
}

async function deleteDocumentMock(id) {
  await delay(200)
  documentsStore = documentsStore.filter((d) => d.id !== id)
  return { success: true, data: { id } }
}

async function toggleDocumentVisibilityMock(id) {
  const doc = documentsStore.find((d) => d.id === id)
  if (!doc) return { success: false, message: 'Not found', data: null }
  const next = doc.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC'
  return updateDocumentMock(id, { visibility: next })
}
