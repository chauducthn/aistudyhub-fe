/**
 * MOCK API for documents.
 * Khi BE có endpoint thật, đổi `USE_MOCK = false` và uncomment code apiClient bên dưới.
 */

// import apiClient from './client'

const USE_MOCK = true

const MOCK_SUBJECTS = [
  { id: 'sub-1', name: 'Software Engineering', code: 'SE' },
  { id: 'sub-2', name: 'Database Systems', code: 'DB' },
  { id: 'sub-3', name: 'Artificial Intelligence', code: 'AI' },
  { id: 'sub-4', name: 'Web Development', code: 'WEB' },
  { id: 'sub-5', name: 'Physics', code: 'PHY' },
  { id: 'sub-6', name: 'Mathematics', code: 'MATH' },
]

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
  if (USE_MOCK) {
    await delay(180)
    return { success: true, data: MOCK_SUBJECTS, message: null }
  }
  // const { data } = await apiClient.get('/subjects')
  // return data
}

/**
 * @param {object} params
 * @param {string} [params.search]      - keyword search on title/description/fileName
 * @param {string} [params.subjectId]   - filter by subject
 * @param {string} [params.status]      - 'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'
 * @param {string} [params.visibility]  - 'ALL' | 'PUBLIC' | 'PRIVATE'
 * @param {number} [params.page=0]
 * @param {number} [params.size=10]
 */
export async function listMyDocuments(params = {}) {
  if (USE_MOCK) {
    await delay(220)
    const { search = '', subjectId = '', status = 'ALL', visibility = 'ALL', page = 0, size = 10 } = params
    const keyword = search.trim().toLowerCase()
    let filtered = [...documentsStore]
    if (keyword) {
      filtered = filtered.filter(
        (d) =>
          d.title.toLowerCase().includes(keyword) ||
          d.description.toLowerCase().includes(keyword) ||
          d.fileName.toLowerCase().includes(keyword),
      )
    }
    if (subjectId) filtered = filtered.filter((d) => d.subjectId === subjectId)
    if (status && status !== 'ALL') filtered = filtered.filter((d) => d.status === status)
    if (visibility && visibility !== 'ALL') filtered = filtered.filter((d) => d.visibility === visibility)

    filtered.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))

    const totalElements = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalElements / size))
    const safePage = Math.min(page, totalPages - 1)
    const start = safePage * size
    const content = filtered.slice(start, start + size)

    return {
      success: true,
      data: { content, page: safePage, size, totalElements, totalPages },
      message: null,
    }
  }
  // const { data } = await apiClient.get('/documents/me', { params })
  // return data
}

/**
 * Upload document with progress callback.
 */
export async function uploadDocument(payload, onProgress) {
  if (USE_MOCK) {
    for (let percent = 0; percent <= 100; percent += 10) {
      await delay(120)
      onProgress?.(percent)
    }
    const ext = (payload.file?.name || '').split('.').pop()?.toLowerCase()
    const newDoc = {
      id: `doc-${Date.now()}`,
      title: payload.title,
      description: payload.description,
      subjectId: payload.subjectId,
      fileName: payload.file?.name,
      fileSize: payload.file?.size,
      fileType: ext || 'pdf',
      uploadedAt: new Date().toISOString(),
      status: 'PENDING',
      visibility: 'PRIVATE',
      downloadUrl: '#',
    }
    documentsStore = [newDoc, ...documentsStore]
    return { success: true, message: 'Document uploaded.', data: newDoc }
  }

  // const formData = new FormData()
  // formData.append('title', payload.title)
  // formData.append('description', payload.description)
  // formData.append('subjectId', payload.subjectId)
  // formData.append('file', payload.file)
  // const { data } = await apiClient.post('/documents', formData, {
  //   headers: { 'Content-Type': 'multipart/form-data' },
  //   onUploadProgress: (event) => {
  //     if (event.total) onProgress?.(Math.round((event.loaded * 100) / event.total))
  //   },
  // })
  // return data
}

export async function updateDocument(id, payload) {
  if (USE_MOCK) {
    await delay(220)
    let updated = null
    documentsStore = documentsStore.map((doc) => {
      if (doc.id !== id) return doc
      updated = { ...doc, ...payload }
      return updated
    })
    if (!updated) {
      return { success: false, message: 'Document not found.', data: null }
    }
    return { success: true, message: 'Document updated.', data: updated }
  }
  // const { data } = await apiClient.patch(`/documents/${id}`, payload)
  // return data
}

export async function deleteDocument(id) {
  if (USE_MOCK) {
    await delay(220)
    const before = documentsStore.length
    documentsStore = documentsStore.filter((doc) => doc.id !== id)
    if (documentsStore.length === before) {
      return { success: false, message: 'Document not found.', data: null }
    }
    return { success: true, message: 'Document deleted.', data: { id } }
  }
  // const { data } = await apiClient.delete(`/documents/${id}`)
  // return data
}

export async function toggleDocumentVisibility(id) {
  if (USE_MOCK) {
    await delay(180)
    const doc = documentsStore.find((d) => d.id === id)
    if (!doc) return { success: false, message: 'Document not found.', data: null }
    const next = doc.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC'
    return updateDocument(id, { visibility: next })
  }
  // const { data } = await apiClient.patch(`/documents/${id}/visibility`)
  // return data
}

/**
 * Mock download: open file in new tab if real URL, otherwise just no-op.
 * Khi BE sẵn, replace bằng axios responseType blob + saveAs.
 */
export function downloadDocument(doc) {
  if (USE_MOCK) {
    if (doc?.downloadUrl && doc.downloadUrl !== '#') {
      window.open(doc.downloadUrl, '_blank', 'noopener,noreferrer')
    }
    return Promise.resolve({ success: true, data: { id: doc?.id } })
  }
  // const { data } = await apiClient.get(`/documents/${doc.id}/download`, { responseType: 'blob' })
  // ...trigger browser download with `data`
}
