import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./client', () => ({
  default: {
    post: vi.fn(),
  },
}))

vi.mock('./requestCache', () => ({
  buildCacheKey: vi.fn(),
  cachedRequest: vi.fn(),
  invalidateCache: vi.fn(),
}))

import apiClient from './client'
import { DOCUMENT_UPLOAD_CONCURRENCY, mapDocumentFromApi, uploadDocuments } from './documentsApi'

function apiDocument(file, id) {
  return {
    id,
    title: file.name.replace(/\.[^.]+$/, ''),
    originalFilename: file.name,
    fileSize: file.size,
    fileType: 'txt',
    status: 'PRIVATE',
    extractionStatus: 'PENDING',
  }
}

describe('uploadDocuments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uploads separate files with bounded concurrency and storage-confirmed progress', async () => {
    const files = Array.from({ length: 6 }, (_, index) =>
      new File(['x'.repeat(index + 1)], `notes-${index + 1}.txt`, { type: 'text/plain' }),
    )
    const snapshots = []
    let activeRequests = 0
    let maxActiveRequests = 0

    apiClient.post.mockImplementation(async (url, formData, config) => {
      expect(url).toBe('/documents')
      const file = formData.get('file')
      expect(formData.get('title')).toBe(file.name.replace(/\.[^.]+$/, ''))
      activeRequests += 1
      maxActiveRequests = Math.max(maxActiveRequests, activeRequests)
      config.onUploadProgress({ loaded: file.size, total: file.size })
      await new Promise((resolve) => setTimeout(resolve, 10))
      activeRequests -= 1
      return {
        data: {
          success: true,
          message: 'Document uploaded',
          data: apiDocument(file, file.name),
        },
      }
    })

    const result = await uploadDocuments({ files, title: 'Shared batch title', description: '', subjectId: '' }, (snapshot) => {
      snapshots.push(snapshot)
    })

    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(6)
    expect(result.failures).toEqual([])
    expect(maxActiveRequests).toBe(DOCUMENT_UPLOAD_CONCURRENCY)
    expect(apiClient.post).toHaveBeenCalledTimes(6)
    expect(snapshots.some((snapshot) => snapshot.savingCount > 0)).toBe(true)
    expect(snapshots.at(-1)).toMatchObject({
      transferProgress: 100,
      uploadedCount: 6,
      failedCount: 0,
      totalCount: 6,
    })
  })

  it('returns successful files and failure details independently', async () => {
    const files = [
      new File(['one'], 'one.txt', { type: 'text/plain' }),
      new File(['bad'], 'bad.txt', { type: 'text/plain' }),
      new File(['three'], 'three.txt', { type: 'text/plain' }),
    ]

    apiClient.post.mockImplementation(async (url, formData, config) => {
      const file = formData.get('file')
      config.onUploadProgress({ loaded: file.size, total: file.size })
      if (file.name === 'bad.txt') {
        throw Object.assign(new Error('Storage unavailable'), {
          response: { data: { message: 'Could not store document file on S3' } },
        })
      }
      return {
        data: {
          success: true,
          message: 'Document uploaded',
          data: apiDocument(file, file.name),
        },
      }
    })

    const result = await uploadDocuments({ files, title: '', description: '', subjectId: '' })

    expect(result.success).toBe(false)
    expect(result.partialSuccess).toBe(true)
    expect(result.data.map((document) => document.fileName)).toEqual(['one.txt', 'three.txt'])
    expect(result.failures).toEqual([
      { index: 1, fileName: 'bad.txt', message: 'Could not store document file on S3' },
    ])
  })

  it('uses per-file descriptions and subjects when batch metadata is provided', async () => {
    const files = [
      new File(['one'], 'one.txt', { type: 'text/plain' }),
      new File(['two'], 'two.txt', { type: 'text/plain' }),
    ]
    const submitted = []

    apiClient.post.mockImplementation(async (url, formData, config) => {
      const file = formData.get('file')
      submitted.push({
        fileName: file.name,
        description: formData.get('description'),
        subjectId: formData.get('subjectId'),
      })
      config.onUploadProgress({ loaded: file.size, total: file.size })
      return {
        data: {
          success: true,
          message: 'Document uploaded',
          data: apiDocument(file, file.name),
        },
      }
    })

    const result = await uploadDocuments({
      files,
      description: 'Shared description',
      subjectId: '10',
      fileMetadata: [
        { description: 'Description for one', subjectId: '11' },
        { description: 'Description for two', subjectId: '' },
      ],
    })

    expect(result.success).toBe(true)
    expect(submitted).toEqual([
      { fileName: 'one.txt', description: 'Description for one', subjectId: '11' },
      { fileName: 'two.txt', description: 'Description for two', subjectId: null },
    ])
  })

  it('propagates an authentication failure instead of reporting every file as failed', async () => {
    const files = [
      new File(['one'], 'one.txt', { type: 'text/plain' }),
      new File(['two'], 'two.txt', { type: 'text/plain' }),
    ]
    const authenticationError = Object.assign(new Error('Request failed with status code 401'), {
      response: {
        status: 401,
        data: { message: 'Authentication is required or the access token has expired' },
      },
    })
    apiClient.post.mockRejectedValue(authenticationError)

    await expect(
      uploadDocuments({ files, title: '', description: '', subjectId: '' }),
    ).rejects.toBe(authenticationError)
  })
})

describe('mapDocumentFromApi', () => {
  it('preserves the public uploader display name without exposing an email', () => {
    const mapped = mapDocumentFromApi({
      id: 42,
      userId: 7,
      uploaderName: 'Nguyễn Văn An',
      originalFilename: 'binary-search.pdf',
      title: 'Binary Search',
      fileType: 'PDF',
      status: 'PUBLIC',
      ownerEmail: 'private@example.com',
    })

    expect(mapped.uploaderName).toBe('Nguyễn Văn An')
    expect(mapped).not.toHaveProperty('ownerEmail')
  })
})
