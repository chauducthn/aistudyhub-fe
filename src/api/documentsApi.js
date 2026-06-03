
import { listSubjects as listSubjectsImpl } from './subjectsApi'

const USE_MOCK = true

const MOCK_SUBJECTS = [
  { id: 'sub-1', name: 'Software Engineering', code: 'SE' },
  { id: 'sub-2', name: 'Database Systems', code: 'DB' },
  { id: 'sub-3', name: 'Artificial Intelligence', code: 'AI' },
  { id: 'sub-4', name: 'Web Development', code: 'WEB' },
  { id: 'sub-5', name: 'Physics', code: 'PHY' },
  { id: 'sub-6', name: 'Mathematics', code: 'MATH' },
]
void MOCK_SUBJECTS

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
  return listSubjectsImpl()
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
}

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

}

export async function updateDocument(id, payload) {
  if (USE_MOCK) {
    await delay(260)
    if (id && id.startsWith('forbidden')) {
      const error = new Error('Forbidden')
      error.response = { status: 403, data: { success: false, message: 'You do not have permission to edit this document.' } }
      throw error
    }
    const idx = documentsStore.findIndex((d) => d.id === id)
    if (idx === -1) {
      const error = new Error('Not Found')
      error.response = { status: 404, data: { success: false, message: 'Document not found.' } }
      throw error
    }
    const updated = { ...documentsStore[idx], ...payload }
    documentsStore = [
      ...documentsStore.slice(0, idx),
      updated,
      ...documentsStore.slice(idx + 1),
    ]
    return { success: true, message: 'Document updated.', data: updated }
  }
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
}

export async function toggleDocumentVisibility(id) {
  if (USE_MOCK) {
    await delay(180)
    const doc = documentsStore.find((d) => d.id === id)
    if (!doc) return { success: false, message: 'Document not found.', data: null }
    const next = doc.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC'
    return updateDocument(id, { visibility: next })
  }
}

export function downloadDocument(doc) {
  if (USE_MOCK) {
    if (doc?.downloadUrl && doc.downloadUrl !== '#') {
      window.open(doc.downloadUrl, '_blank', 'noopener,noreferrer')
    }
    return Promise.resolve({ success: true, data: { id: doc?.id } })
  }
}
