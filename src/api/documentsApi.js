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
 * Upload document with progress callback.
 * @param {object} payload
 * @param {string} payload.title
 * @param {string} payload.description
 * @param {string} payload.subjectId
 * @param {File} payload.file
 * @param {(percent: number) => void} [onProgress]
 */
export async function uploadDocument(payload, onProgress) {
  if (USE_MOCK) {
    for (let percent = 0; percent <= 100; percent += 10) {
      await delay(120)
      onProgress?.(percent)
    }
    return {
      success: true,
      message: 'Document uploaded.',
      data: {
        id: `doc-${Date.now()}`,
        title: payload.title,
        description: payload.description,
        subjectId: payload.subjectId,
        fileName: payload.file?.name,
        fileSize: payload.file?.size,
        uploadedAt: new Date().toISOString(),
      },
    }
  }

  // const formData = new FormData()
  // formData.append('title', payload.title)
  // formData.append('description', payload.description)
  // formData.append('subjectId', payload.subjectId)
  // formData.append('file', payload.file)
  // const { data } = await apiClient.post('/documents', formData, {
  //   headers: { 'Content-Type': 'multipart/form-data' },
  //   onUploadProgress: (event) => {
  //     if (event.total) {
  //       onProgress?.(Math.round((event.loaded * 100) / event.total))
  //     }
  //   },
  // })
  // return data
}
