import apiClient from './client'
import { mapPageResponse, unwrapApiResponse } from './apiHelpers'
import { resolveMediaUrl } from './mediaUrl'
import { buildCacheKey, cachedRequest, invalidateCache } from './requestCache'
import { listSubjects as listSubjectsImpl } from './subjectsApi'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true'

const MAX_TEXT_PREVIEW_BYTES = 512 * 1024
const DOCUMENT_CACHE_TTL_MS = 20_000
const DOCUMENT_LIST_CACHE_TTL_MS = 15_000

export function mapDocumentFromApi(raw) {
  if (!raw) return raw

  const visibility = raw.status || raw.visibility || 'PRIVATE'
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
    fileName: raw.originalFilename || raw.fileName || raw.title,
    originalFilename: raw.originalFilename,
    fileSize: raw.fileSize,
    fileType: fileType.includes('pdf') ? 'pdf' : fileType.split('/').pop() || fileType,
    contentType: raw.contentType || null,
    s3Key: raw.s3Key || null,
    fileUrl: raw.fileUrl,
    uploadedAt: raw.createdAt || raw.uploadedAt,
    updatedAt: raw.updatedAt,
    status: visibility,
    visibility,
    downloadUrl: resolveMediaUrl(raw.fileUrl),
    extractionStatus: raw.extractionStatus || 'PENDING',
    extractionError: raw.extractionError || null,
    extractedAt: raw.extractedAt || null,
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
  return cachedRequest(
    `documents:detail:${docId}`,
    async () => {
      const { data } = await apiClient.get(`/documents/${docId}`)
      const body = unwrapApiResponse(data)

      return {
        ...body,
        data: body.data ? { ...mapDocumentFromApi(body.data), owner: body.data.owner || null } : null,
      }
    },
    { ttlMs: DOCUMENT_CACHE_TTL_MS },
  )
}

export async function getDocumentPreview(input) {
  if (USE_MOCK) {
    return getDocumentPreviewMock(typeof input === 'object' ? input.id : input)
  }

  const doc =
    typeof input === 'object'
      ? input
      : (await getDocument(input)).data

  if (!doc) {
    return { success: false, data: null, message: 'Document not found.' }
  }

  return buildPreviewFromDoc(doc)
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

  return cachedRequest(
    buildCacheKey('documents:mine', query),
    async () => {
      const { data } = await apiClient.get('/documents', { params: query })
      const body = unwrapApiResponse(data)

      return {
        ...body,
        data: mapPageResponse(body.data, mapDocumentFromApi),
      }
    },
    { ttlMs: DOCUMENT_LIST_CACHE_TTL_MS },
  )
}

/** GET /api/documents/public */
export async function listPublicDocuments(params = {}) {
  const { search = '', page = 0, size = 10 } = params
  const query = {
    keyword: search.trim() || undefined,
    page,
    size,
  }

  return cachedRequest(
    buildCacheKey('documents:public', query),
    async () => {
      const { data } = await apiClient.get('/documents/public', { params: query })
      const body = unwrapApiResponse(data)

      return {
        ...body,
        data: mapPageResponse(body.data, mapDocumentFromApi),
      }
    },
    { ttlMs: DOCUMENT_LIST_CACHE_TTL_MS },
  )
}

/** GET /api/documents/public/:id */
export async function getPublicDocument(id) {
  const docId = normalizeDocId(id)
  return cachedRequest(
    `documents:public-detail:${docId}`,
    async () => {
      const { data } = await apiClient.get(`/documents/public/${docId}`)
      const body = unwrapApiResponse(data)

      return {
        ...body,
        data: body.data ? mapDocumentFromApi(body.data) : null,
      }
    },
    { ttlMs: DOCUMENT_CACHE_TTL_MS },
  )
}

export async function getPublicDocumentPreview(id) {
  const docRes = await getPublicDocument(id)

  if (!docRes.success || !docRes.data) {
    return { success: false, data: null, message: 'Document not found.' }
  }

  return buildPreviewFromDoc(docRes.data)
}

const TEXT_PREVIEW_EXTENSIONS = new Set(['txt', 'md', 'csv', 'json', 'log'])
const OFFICE_PREVIEW_EXTENSIONS = new Set(['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'])
const IMAGE_PREVIEW_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'])

function extOf(doc) {
  return (doc.fileType || doc.originalFilename?.split('.').pop() || '').toLowerCase()
}

/** URL công khai tới file thật (Cloudinary tuyệt đối hoặc /uploads qua proxy). */
function fileSourceUrl(doc) {
  return doc.downloadUrl || resolveMediaUrl(doc.fileUrl)
}

async function buildPreviewFromDoc(doc) {
  const docId = normalizeDocId(doc.id)
  const ext = extOf(doc)
  const src = fileSourceUrl(doc)
  const fileName = doc.fileName || doc.originalFilename
  const isPublicUrl = /^https?:\/\//i.test(src || '')


  if (OFFICE_PREVIEW_EXTENSIONS.has(ext)) {
    if (isPublicUrl) {
      const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(src)}`
      return { success: true, message: null, data: { type: 'office', previewUrl: officeUrl, sourceUrl: src, fileName } }
    }
    return {
      success: false,
      data: { type: 'download', fileName },
      message: 'Inline preview for Office files needs a public file URL. Download to view.',
    }
  }

  if (ext !== 'pdf' && !TEXT_PREVIEW_EXTENSIONS.has(ext) && !IMAGE_PREVIEW_EXTENSIONS.has(ext)) {
    return {
      success: false,
      data: { type: 'download', fileName },
      message: `Inline preview is not available for ${ext.toUpperCase() || 'this'} file. Download to view.`,
    }
  }


  const response = await apiClient.get(`/documents/${docId}/download`, { responseType: 'blob' })
  const blob = response.data

  if (ext === 'pdf') {
    const pdfBlob = blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' })
    return { success: true, message: null, data: { type: 'pdf', previewUrl: window.URL.createObjectURL(pdfBlob), fileName } }
  }

  if (IMAGE_PREVIEW_EXTENSIONS.has(ext)) {
    return { success: true, message: null, data: { type: 'image', previewUrl: window.URL.createObjectURL(blob), fileName } }
  }

  const slice = blob.size > MAX_TEXT_PREVIEW_BYTES ? blob.slice(0, MAX_TEXT_PREVIEW_BYTES) : blob
  const textContent = await slice.text()
  return {
    success: true,
    message: null,
    data: { type: 'text', textContent, truncated: blob.size > MAX_TEXT_PREVIEW_BYTES, fileName },
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
      if (!onProgress) return

      const percent = event.total
        ? Math.round((event.loaded * 100) / event.total)
        : 0

      onProgress(percent)
    },
  })

  const body = unwrapApiResponse(data)
  invalidateDocumentCaches()

  return {
    ...body,
    data: body.data ? mapDocumentFromApi(body.data) : null,
  }
}

export async function uploadDocuments(payload, onProgress) {
  if (USE_MOCK) {
    return uploadDocumentsMock(payload, onProgress)
  }

  const files = payload.files || (payload.file ? [payload.file] : [])
  const formData = new FormData()
  files.forEach((f) => formData.append('files', f))
  if (payload.title?.trim()) {
    formData.append('title', payload.title.trim())
  }
  if (payload.description?.trim()) {
    formData.append('description', payload.description.trim())
  }
  if (payload.subjectId) {
    formData.append('subjectId', String(payload.subjectId))
  }

  const { data } = await apiClient.post('/documents/batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (!onProgress) return

      const percent = event.total
        ? Math.round((event.loaded * 100) / event.total)
        : 0

      onProgress(percent)
    },
  })

  const body = unwrapApiResponse(data)
  invalidateDocumentCaches()

  return {
    ...body,
    data: Array.isArray(body.data) ? body.data.map(mapDocumentFromApi) : [],
  }
}

export async function updateDocument(id, payload) {
  if (USE_MOCK) {
    return updateDocumentMock(id, payload)
  }

  const docId = normalizeDocId(id)
  let result = null

  if (
    payload.title !== undefined ||
    payload.description !== undefined ||
    payload.subjectId !== undefined
  ) {
    const body = {}

    if (payload.title !== undefined) {
      body.title = payload.title?.trim()
    }

    if (payload.description !== undefined) {
      body.description = payload.description?.trim() ?? ''
    }

    if (payload.subjectId !== undefined) {
      body.subjectId =
        payload.subjectId === '' || payload.subjectId == null
          ? null
          : Number(payload.subjectId)
    }

    const { data } = await apiClient.patch(`/documents/${docId}`, body)
    result = unwrapApiResponse(data)
  }

  if (payload.visibility && payload.visibility !== result?.data?.status) {
    result = await setDocumentVisibility(docId, payload.visibility)
  }

  invalidateDocumentCaches(docId)

  return result
    ? {
        ...result,
        data: result.data ? mapDocumentFromApi(result.data) : null,
      }
    : { success: true, message: null, data: null }
}

export async function deleteDocument(id) {
  if (USE_MOCK) {
    return deleteDocumentMock(id)
  }

  const docId = normalizeDocId(id)
  const { data } = await apiClient.delete(`/documents/${docId}`)
  const body = unwrapApiResponse(data)
  invalidateDocumentCaches(docId)

  return {
    ...body,
    data: body.data || { id: String(id) },
  }
}

export async function runPlagiarismCheck(id) {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return {
      success: true,
      message: 'Plagiarism check completed',
      data: {
        plagiarismReport: '### Plagiarism Report\n\n- **Score**: 12%\n- **Sources**:\n  - [Wikipedia: Neural Networks](https://en.wikipedia.org/neural_networks) (10% similarity)\n\nOriginal content matched with public online knowledge.',
        plagiarismCheckedAt: new Date().toISOString(),
      },
    }
  }

  const docId = normalizeDocId(id)
  const { data } = await apiClient.post(`/documents/${docId}/plagiarism-check`)
  const body = unwrapApiResponse(data)
  invalidateDocumentCaches(docId)

  return {
    ...body,
    data: body.data ? mapDocumentFromApi(body.data) : null,
  }
}

export async function setDocumentVisibility(id, status) {
  const docId = normalizeDocId(id)
  const { data } = await apiClient.patch(`/documents/${docId}/visibility`, { status })
  const body = unwrapApiResponse(data)
  invalidateDocumentCaches(docId)

  return {
    ...body,
    data: body.data ? mapDocumentFromApi(body.data) : null,
  }
}

export async function toggleDocumentVisibility(input) {
  if (USE_MOCK) {
    const id = typeof input === 'object' ? input.id : input
    return toggleDocumentVisibilityMock(id)
  }

  const doc = typeof input === 'object' ? input : (await getDocument(input)).data

  if (!doc) {
    return { success: false, message: 'Document not found.', data: null }
  }

  const current = doc.status ?? doc.visibility
  const next = current === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC'

  return setDocumentVisibility(doc.id, next)
}

export async function downloadDocument(doc) {
  if (USE_MOCK) {
    if (doc?.downloadUrl && doc.downloadUrl !== '#') {
      window.open(doc.downloadUrl, '_blank', 'noopener,noreferrer')
    }
    return { success: true, data: { id: doc?.id } }
  }


  const docId = normalizeDocId(doc.id)
  const response = await apiClient.get(`/documents/${docId}/download`, { responseType: 'blob' })

  const blob = new Blob([response.data], {
    type: response.headers['content-type'] || 'application/octet-stream',
  })
  const disposition = response.headers['content-disposition'] || ''
  const match = disposition.match(/filename="?([^"]+)"?/i)
  const filename = match?.[1] || doc.fileName || doc.originalFilename || 'document'

  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)

  return { success: true, data: { id: doc.id } }
}

function invalidateDocumentCaches(docId) {
  invalidateCache('documents:mine')
  invalidateCache('documents:public')
  if (docId) {
    invalidateCache(`documents:detail:${docId}`)
    invalidateCache(`documents:public-detail:${docId}`)
  } else {
    invalidateCache('documents:detail:')
    invalidateCache('documents:public-detail:')
  }
}

// --- Mock implementations ---

let documentsStore = []

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function getDocumentMock(id) {
  await delay(220)

  const doc = documentsStore.find((d) => d.id === id)

  if (!doc) {
    const error = new Error('Not Found')
    error.response = {
      status: 404,
      data: { success: false, message: 'Document not found.' },
    }
    throw error
  }

  return {
    success: true,
    data: {
      ...doc,
      owner: {
        fullName: 'Demo User',
        email: 'demo@edu',
      },
    },
  }
}

async function getDocumentPreviewMock(id) {
  await delay(320)

  const doc = documentsStore.find((d) => d.id === id)

  if (!doc) {
    return { success: false, data: null, message: 'Document not found.' }
  }

  if (doc.fileType === 'pdf') {
    return {
      success: true,
      message: null,
      data: {
        type: 'pdf',
        previewUrl: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
        fileName: doc.fileName,
      },
    }
  }

  return {
    success: false,
    data: null,
    message: 'Preview not available in mock mode.',
  }
}

async function listMyDocumentsMock() {
  await delay(220)

  return {
    success: true,
    data: {
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
    },
  }
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

  return {
    success: true,
    message: 'Document uploaded (mock).',
    data: newDoc,
  }
}

async function uploadDocumentsMock(payload, onProgress) {
  for (let percent = 0; percent <= 100; percent += 10) {
    await delay(80)
    onProgress?.(percent)
  }

  const files = payload.files || (payload.file ? [payload.file] : [])
  const created = files.map((file, i) => {
    return {
      id: `doc-${Date.now()}-${i}`,
      title: payload.title || file.name,
      description: payload.description,
      subjectId: payload.subjectId,
      fileName: file.name,
      fileSize: file.size,
      fileType: 'pdf',
      uploadedAt: new Date().toISOString(),
      status: 'PRIVATE',
      visibility: 'PRIVATE',
    }
  })

  documentsStore = [...created, ...documentsStore]

  return {
    success: true,
    message: 'Documents uploaded (mock).',
    data: created,
  }
}

async function updateDocumentMock(id, payload) {
  await delay(200)

  const idx = documentsStore.findIndex((d) => d.id === id)

  if (idx === -1) {
    throw Object.assign(new Error('Not Found'), {
      response: { status: 404 },
    })
  }

  const updated = {
    ...documentsStore[idx],
    ...payload,
  }

  documentsStore[idx] = updated

  return {
    success: true,
    data: updated,
  }
}

async function deleteDocumentMock(id) {
  await delay(200)

  documentsStore = documentsStore.filter((d) => d.id !== id)

  return {
    success: true,
    data: { id },
  }
}

async function toggleDocumentVisibilityMock(id) {
  const doc = documentsStore.find((d) => d.id === id)

  if (!doc) {
    return {
      success: false,
      message: 'Not found',
      data: null,
    }
  }

  const next = doc.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC'

  return updateDocumentMock(id, {
    visibility: next,
    status: next,
  })
}
