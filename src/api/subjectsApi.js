import apiClient from './client'
import { cachedRequest, invalidateCache } from './requestCache'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true'

export const SUBJECT_ACCENT_COLOR = '#3525cd'

function deriveCode(name) {
  const parts = (name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!parts.length) return 'SUB'

  const code = parts.map((p) => p[0]).join('').toUpperCase()

  return code.length >= 2 ? code.slice(0, 8) : `${code}X`.slice(0, 3)
}

export function mapSubjectFromApi(raw) {
  if (!raw) return raw

  return {
    id: String(raw.id),
    name: raw.name,
    code: raw.code || deriveCode(raw.name),
    description: raw.description || '',
    documentCount: raw.documentCount ?? 0,
    color: SUBJECT_ACCENT_COLOR,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

function buildAxiosError(status, message) {
  const err = new Error(message)
  err.response = {
    status,
    data: {
      success: false,
      message,
    },
  }
  return err
}

// --- Mock data ---

let subjectsStore = []

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// --- Real API ---

export async function listSubjects(params = {}) {
  if (USE_MOCK) {
    await delay(180)

    const { search = '' } = params
    const keyword = search.trim().toLowerCase()

    let data = [...subjectsStore]

    if (keyword) {
      data = data.filter(
        (s) =>
          s.name.toLowerCase().includes(keyword) ||
          s.code.toLowerCase().includes(keyword) ||
          s.description.toLowerCase().includes(keyword),
      )
    }

    data.sort((a, b) => a.name.localeCompare(b.name))

    return {
      success: true,
      data,
      message: null,
    }
  }

  const data = await cachedRequest(
    'subjects:list',
    async () => {
      const response = await apiClient.get('/subjects')
      return response.data
    },
    { ttlMs: 60_000 },
  )

  const keyword = (params.search || '').trim().toLowerCase()

  let list = (data?.data || []).map((subject, index) =>
    mapSubjectFromApi(subject, index),
  )

  if (keyword) {
    list = list.filter(
      (subject) =>
        subject.name.toLowerCase().includes(keyword) ||
        subject.code.toLowerCase().includes(keyword),
    )
  }

  list.sort((a, b) => a.name.localeCompare(b.name))

  return {
    success: data?.success ?? true,
    data: list,
    message: data?.message ?? null,
  }
}

export async function createSubject(payload) {
  if (USE_MOCK) {
    await delay(260)

    const code = (payload.code || '').trim().toUpperCase()
    const name = (payload.name || '').trim()

    if (!name) {
      throw buildAxiosError(400, 'Subject name is required.')
    }

    const next = {
      id: `sub-${Date.now()}`,
      name,
      code: code || deriveCode(name),
      description: (payload.description || '').trim(),
      color: SUBJECT_ACCENT_COLOR,
      documentCount: 0,
      createdAt: new Date().toISOString(),
    }

    subjectsStore = [...subjectsStore, next]

    return {
      success: true,
      data: next,
      message: 'Subject created.',
    }
  }

  const name = (payload.name || '').trim()

  if (!name) {
    throw buildAxiosError(400, 'Subject name is required.')
  }

  const { data } = await apiClient.post('/subjects', { name })
  invalidateCache('subjects:')

  const mapped = mapSubjectFromApi(data.data)

  if (payload.description) {
    mapped.description = payload.description.trim()
  }

  if (payload.code) {
    mapped.code = payload.code.trim().toUpperCase()
  }

  return {
    success: data?.success ?? true,
    data: mapped,
    message: data?.message ?? 'Subject created.',
  }
}

export async function updateSubject(id, payload) {
  if (USE_MOCK) {
    await delay(260)

    const idx = subjectsStore.findIndex((subject) => subject.id === id)

    if (idx === -1) {
      throw buildAxiosError(404, 'Subject not found.')
    }

    const updated = {
      ...subjectsStore[idx],
      ...payload,
      name: payload.name?.trim(),
      updatedAt: new Date().toISOString(),
    }

    subjectsStore[idx] = updated

    return {
      success: true,
      data: updated,
      message: 'Subject updated.',
    }
  }

  const name = (payload.name || '').trim()

  if (!name) {
    throw buildAxiosError(400, 'Subject name is required.')
  }

  const { data } = await apiClient.patch(`/subjects/${id}`, { name })
  invalidateCache('subjects:')

  const mapped = mapSubjectFromApi(data.data)

  if (payload.description) {
    mapped.description = (payload.description || '').trim()
  }

  if (payload.code) {
    mapped.code = payload.code.trim().toUpperCase()
  } else {
    mapped.code = deriveCode(name)
  }

  return {
    success: data?.success ?? true,
    data: mapped,
    message: data?.message ?? 'Subject updated.',
  }
}

export async function deleteSubject(id) {
  if (USE_MOCK) {
    await delay(220)

    subjectsStore = subjectsStore.filter((subject) => subject.id !== id)

    return {
      success: true,
      data: { id },
      message: 'Subject deleted.',
    }
  }

  const { data } = await apiClient.delete(`/subjects/${id}`)
  invalidateCache('subjects:')

  return {
    success: data?.success ?? true,
    data: { id: String(id) },
    message: data?.message ?? 'Subject deleted.',
  }
}
