import apiClient from './client'

const USE_MOCK = true

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

const MOCK_DOCUMENTS = [
  {
    id: 'doc-001',
    title: 'Neural Networks – Comprehensive Notes',
    description: 'Deep dive into CNN, RNN, transformers and gradient descent.',
    subjectId: 'sub-3',
    fileName: 'Neural_Networks_Vol1.pdf',
    fileSize: 4_300_000,
    fileType: 'pdf',
    uploadedAt: '2026-05-30T09:42:00Z',
    status: 'APPROVED',
    visibility: 'PRIVATE',
    downloadUrl: '#',
  },
  {
    id: 'doc-002',
    title: 'Database Normalization Patterns',
    description: '1NF through BCNF with examples.',
    subjectId: 'sub-2',
    fileName: 'DB_Normalization.docx',
    fileSize: 1_500_000,
    fileType: 'docx',
    uploadedAt: '2026-05-28T13:10:00Z',
    status: 'APPROVED',
    visibility: 'PUBLIC',
    downloadUrl: '#',
  },
  {
    id: 'doc-003',
    title: 'Quantum Mechanics Lab Report',
    description: 'Heisenberg uncertainty principle and double-slit experiment.',
    subjectId: 'sub-5',
    fileName: 'Quantum_Lab.pdf',
    fileSize: 3_100_000,
    fileType: 'pdf',
    uploadedAt: '2026-05-25T07:00:00Z',
    status: 'PENDING',
    visibility: 'PRIVATE',
    downloadUrl: '#',
  },
  {
    id: 'doc-004',
    title: 'React Server Components',
    description: 'Architecture, streaming, and caching strategies.',
    subjectId: 'sub-4',
    fileName: 'RSC_Architecture.pptx',
    fileSize: 8_700_000,
    fileType: 'pptx',
    uploadedAt: '2026-05-22T19:31:00Z',
    status: 'APPROVED',
    visibility: 'PUBLIC',
    downloadUrl: '#',
  },
  {
    id: 'doc-005',
    title: 'Calculus II – Integration Techniques',
    description: 'Integration by parts, partial fractions, trigonometric substitution.',
    subjectId: 'sub-6',
    fileName: 'Calculus_II.pdf',
    fileSize: 2_400_000,
    fileType: 'pdf',
    uploadedAt: '2026-05-19T11:05:00Z',
    status: 'APPROVED',
    visibility: 'PRIVATE',
    downloadUrl: '#',
  },
  {
    id: 'doc-006',
    title: 'Agile Sprint Retrospective',
    description: 'Template + lessons learned across 8 sprints.',
    subjectId: 'sub-1',
    fileName: 'Sprint_Retro.docx',
    fileSize: 540_000,
    fileType: 'docx',
    uploadedAt: '2026-05-17T08:21:00Z',
    status: 'REJECTED',
    visibility: 'PRIVATE',
    downloadUrl: '#',
  },
  {
    id: 'doc-007',
    title: 'Transformer Attention Visualization',
    description: 'Slides explaining attention heatmaps in BERT and GPT.',
    subjectId: 'sub-3',
    fileName: 'Attention_Slides.pptx',
    fileSize: 12_400_000,
    fileType: 'pptx',
    uploadedAt: '2026-05-14T16:48:00Z',
    status: 'APPROVED',
    visibility: 'PUBLIC',
    downloadUrl: '#',
  },
  {
    id: 'doc-008',
    title: 'Software Architecture Patterns',
    description: 'Layered, microservices, event-driven, hexagonal.',
    subjectId: 'sub-1',
    fileName: 'Arch_Patterns.pdf',
    fileSize: 5_200_000,
    fileType: 'pdf',
    uploadedAt: '2026-05-10T14:00:00Z',
    status: 'APPROVED',
    visibility: 'PRIVATE',
    downloadUrl: '#',
  },
  {
    id: 'doc-009',
    title: 'Git Workflow Cheatsheet',
    description: 'Common git commands and branching strategies.',
    subjectId: 'sub-1',
    fileName: 'Git_Cheatsheet.txt',
    fileSize: 32_000,
    fileType: 'txt',
    uploadedAt: '2026-05-08T10:30:00Z',
    status: 'APPROVED',
    visibility: 'PUBLIC',
    downloadUrl: '#',
  },
  {
    id: 'doc-010',
    title: 'SQL Optimization Guide',
    description: 'Indexing, query plans, and execution tuning.',
    subjectId: 'sub-2',
    fileName: 'SQL_Optimization.pdf',
    fileSize: 2_100_000,
    fileType: 'pdf',
    uploadedAt: '2026-05-05T22:14:00Z',
    status: 'PENDING',
    visibility: 'PRIVATE',
    downloadUrl: '#',
  },
  {
    id: 'doc-011',
    title: 'Linear Algebra Notes',
    description: 'Vector spaces, eigenvalues, and matrix decomposition.',
    subjectId: 'sub-6',
    fileName: 'Linear_Algebra.pdf',
    fileSize: 3_800_000,
    fileType: 'pdf',
    uploadedAt: '2026-05-02T05:55:00Z',
    status: 'APPROVED',
    visibility: 'PRIVATE',
    downloadUrl: '#',
  },
  {
    id: 'doc-012',
    title: 'CSS Layout Techniques',
    description: 'Flexbox, Grid, container queries.',
    subjectId: 'sub-4',
    fileName: 'CSS_Layouts.pptx',
    fileSize: 6_900_000,
    fileType: 'pptx',
    uploadedAt: '2026-04-29T09:09:00Z',
    status: 'APPROVED',
    visibility: 'PUBLIC',
    downloadUrl: '#',
  },
]

let documentsStore = [...MOCK_DOCUMENTS]

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function listSubjects() {
  const { data } = await apiClient.get('/subjects')
  return data
}

export async function getDocument(id) {
  if (USE_MOCK) {
    await delay(220)
    if (id && id.startsWith('forbidden')) {
      const error = new Error('Forbidden')
      error.response = { status: 403, data: { success: false, message: 'You do not have permission to edit this document.' } }
      throw error
    }
    const doc = documentsStore.find((d) => d.id === id)
    if (!doc) {
      const error = new Error('Not Found')
      error.response = { status: 404, data: { success: false, message: 'Document not found.' } }
      throw error
    }
    const owner = {
      id: 'me',
      fullName: 'Alex Chen',
      email: 'alex.chen@university.edu',
    }
    return { success: true, message: null, data: { ...doc, owner } }
  }
}

const PDF_PREVIEW_URLS = {
  pdf: 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
}

const TXT_PREVIEW_TEXT = `# Sample Preview

This is a generated preview for demonstration. When the real backend is available,
this content will come from the document's stored text or a server-rendered preview.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, sapien id
consequat ullamcorper, lectus libero efficitur urna, ut volutpat odio mauris non
lectus. Suspendisse potenti.

- Bullet point one
- Bullet point two
- Bullet point three

Section 1: Overview
Section 2: Methodology
Section 3: Results
Section 4: Discussion
Section 5: References`

export async function getDocumentPreview(id) {
  if (USE_MOCK) {
    await delay(320)
    const doc = documentsStore.find((d) => d.id === id)
    if (!doc) {
      const error = new Error('Not Found')
      error.response = { status: 404, data: { success: false, message: 'Document not found.' } }
      throw error
    }
    const ext = (doc.fileType || '').toLowerCase()
    if (ext === 'pdf') {
      return {
        success: true,
        data: {
          type: 'pdf',
          previewUrl: PDF_PREVIEW_URLS.pdf,
          fileName: doc.fileName,
        },
        message: null,
      }
    }
    if (ext === 'txt') {
      return {
        success: true,
        data: {
          type: 'text',
          textContent: TXT_PREVIEW_TEXT,
          fileName: doc.fileName,
        },
        message: null,
      }
    }
    return {
      success: false,
      data: null,
      message: `Inline preview is not available for ${ext.toUpperCase()} files. Download to view.`,
    }
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
