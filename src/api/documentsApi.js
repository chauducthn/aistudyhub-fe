import apiClient from './client'

function normalizeDoc(d) {
  if (!d) return d
  return {
    ...d,
    fileName: d.originalFilename ?? d.fileName,
    uploadedAt: d.createdAt ?? d.uploadedAt,
    fileType: (d.fileType || '').toLowerCase(),
    visibility: d.status ?? d.visibility,
  }
}

export async function listSubjects() {
  const { data } = await apiClient.get('/subjects')
  return data
}

export async function getDocument(id) {
  const { data } = await apiClient.get(`/documents/${id}`)
  if (data?.success && data.data) data.data = normalizeDoc(data.data)
  return data
}

const TEXT_PREVIEW_EXTENSIONS = new Set(['txt', 'md', 'csv'])
const MAX_TEXT_PREVIEW_BYTES = 512 * 1024

export async function getDocumentPreview(doc) {
  const ext = (doc.fileType || doc.originalFilename?.split('.').pop() || '').toLowerCase()

  if (ext !== 'pdf' && !TEXT_PREVIEW_EXTENSIONS.has(ext)) {
    return {
      success: false,
      data: null,
      message: `Inline preview is not available for ${ext.toUpperCase() || 'this'} files. Download to view.`,
    }
  }

  const response = await apiClient.get(`/documents/${doc.id}/download`, {
    responseType: 'blob',
  })
  const blob = response.data

  if (ext === 'pdf') {
    const pdfBlob =
      blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' })
    return {
      success: true,
      message: null,
      data: {
        type: 'pdf',
        previewUrl: window.URL.createObjectURL(pdfBlob),
        fileName: doc.fileName || doc.originalFilename,
      },
    }
  }

  const slice = blob.size > MAX_TEXT_PREVIEW_BYTES ? blob.slice(0, MAX_TEXT_PREVIEW_BYTES) : blob
  const textContent = await slice.text()
  return {
    success: true,
    message: null,
    data: {
      type: 'text',
      textContent,
      truncated: blob.size > MAX_TEXT_PREVIEW_BYTES,
      fileName: doc.fileName || doc.originalFilename,
    },
  }
}

export async function listMyDocuments(params = {}) {
  const { search = '', subjectId = '', visibility = 'ALL', page = 0, size = 10 } = params
  const query = { page, size }
  if (search.trim()) query.keyword = search.trim()
  if (subjectId) query.subjectId = subjectId
  if (visibility && visibility !== 'ALL') query.status = visibility

  const { data } = await apiClient.get('/documents', { params: query })
  if (data?.success && data.data) {
    data.data = { ...data.data, content: (data.data.content || []).map(normalizeDoc) }
  }
  return data
}

export async function uploadDocument(payload, onProgress) {
  const formData = new FormData()
  formData.append('file', payload.file)
  formData.append('title', payload.title)
  if (payload.description) formData.append('description', payload.description)
  if (payload.subjectId) formData.append('subjectId', payload.subjectId)

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
  return data
}

export async function updateDocument(id, payload) {
  let result = null

  if (payload.title !== undefined || payload.description !== undefined) {
    const body = {}
    if (payload.title !== undefined) body.title = payload.title
    if (payload.description !== undefined) body.description = payload.description
    const { data } = await apiClient.patch(`/documents/${id}`, body)
    result = data
  }

  if ('subjectId' in payload) {
    const subjectId = payload.subjectId === '' || payload.subjectId == null ? null : payload.subjectId
    const { data } = await apiClient.patch(`/documents/${id}/subject`, { subjectId })
    result = data
  }

  if (payload.visibility && payload.visibility !== result?.data?.status) {
    result = await setDocumentVisibility(id, payload.visibility)
  }

  if (result?.success && result.data) result.data = normalizeDoc(result.data)
  return result ?? { success: true, message: null, data: null }
}

export async function deleteDocument(id) {
  const { data } = await apiClient.delete(`/documents/${id}`)
  return data
}

export async function setDocumentVisibility(id, status) {
  const { data } = await apiClient.patch(`/documents/${id}/visibility`, { status })
  if (data?.success && data.data) data.data = normalizeDoc(data.data)
  return data
}

export async function toggleDocumentVisibility(doc) {
  const current = doc.status ?? doc.visibility
  const next = current === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC'
  return setDocumentVisibility(doc.id, next)
}

export async function downloadDocument(doc) {
  const response = await apiClient.get(`/documents/${doc.id}/download`, {
    responseType: 'blob',
  })
  const blob = new Blob([response.data], {
    type: response.headers['content-type'] || 'application/octet-stream',
  })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = doc.fileName || doc.originalFilename || 'document'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
  return { success: true, data: { id: doc.id } }
}
