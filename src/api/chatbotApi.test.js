import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./client', () => ({ default: {} }))
vi.mock('./requestCache', () => ({
  buildCacheKey: vi.fn(),
  cachedRequest: vi.fn(),
  invalidateCache: vi.fn(),
}))
vi.mock('./documentsApi', () => ({
  getPublicDocument: vi.fn(),
  listMyDocuments: vi.fn(),
  listPublicDocuments: vi.fn(),
}))

import { listMyDocuments, listPublicDocuments } from './documentsApi'
import {
  listChatContextDocuments,
  searchPublicChatContextDocuments,
} from './chatbotApi'

describe('chatbot document context loading', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads only my documents initially and does not enumerate public documents', async () => {
    listMyDocuments.mockResolvedValue({
      success: true,
      data: { content: [{ id: '1', title: 'Mine', fileName: 'mine.pdf' }] },
      message: null,
    })

    const result = await listChatContextDocuments()

    expect(listMyDocuments).toHaveBeenCalledWith({ page: 0, size: 100 })
    expect(listPublicDocuments).not.toHaveBeenCalled()
    expect(result.data).toEqual([
      expect.objectContaining({ id: '1', source: 'mine' }),
    ])
  })

  it('requires a keyword and limits on-demand public search to 20 results', async () => {
    await searchPublicChatContextDocuments('a')
    expect(listPublicDocuments).not.toHaveBeenCalled()

    listPublicDocuments.mockResolvedValue({
      success: true,
      data: { content: [{ id: '2', title: 'Binary Search' }] },
      message: null,
    })
    const result = await searchPublicChatContextDocuments('binary')

    expect(listPublicDocuments).toHaveBeenCalledWith({
      search: 'binary',
      page: 0,
      size: 20,
    })
    expect(result.data[0]).toMatchObject({ id: '2', source: 'public' })
  })
})
