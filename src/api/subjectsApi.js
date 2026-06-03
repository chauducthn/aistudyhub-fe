import apiClient from './client'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true'

const SUBJECT_COLORS = [
  '#3525cd',
  '#10b3a8',
  '#a78bfa',
  '#57dffe',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#22c55e',
]

function deriveCode(name) {
  const parts = (name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!parts.length) return 'SUB'
  const code = parts.map((p) => p[0]).join('').toUpperCase()
  return code.length >= 2 ? code.slice(0, 8) : `${code}X`.slice(0, 3)
}

export function mapSubjectFromApi(raw, index = 0) {
  return {
    id: String(raw.id),
    name: raw.name,
    code: deriveCode(raw.name),
    description: '',
    documentCount: raw.documentCount ?? 0,
    color: SUBJECT_COLORS[index % SUBJECT_COLORS.length],
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

function buildAxiosError(status, message) {
  const err = new Error(message)
  err.response = { status, data: { success: false, message } }
  return err
}

// --- Mock (optional dev) ---
let subjectsStore = []
const RESERVED_CODE = ['ADMIN', 'API', 'NULL']

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
    return { success: true, data, message: null }
  }

  const { data } = await apiClient.get('/subjects')
  const keyword = (params.search || '').trim().toLowerCase()
  let list = (data?.data || []).map((s, i) => mapSubjectFromApi(s, i))
  if (keyword) {
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(keyword) ||
        s.code.toLowerCase().includes(keyword),
    )
  }
  list.sort((a, b) => a.name.localeCompare(b.name))
  return { success: true, data: list, message: data?.message ?? null }
}

export async function createSubject(payload) {
  if (USE_MOCK) {
    await delay(260)
    const code = (payload.code || '').trim().toUpperCase()
    const name = (payload.name || '').trim()
    if (!name) throw buildAxiosError(400, 'Subject name is required.')
    if (!code) throw buildAxiosError(400, 'Subject code is required.')
    const next = {
      id: `sub-${Date.now()}`,
      name,
      code,
      description: (payload.description || '').trim(),
      color: payload.color || '#3525cd',
      documentCount: 0,
      createdAt: new Date().toISOString(),
    }
    subjectsStore = [...subjectsStore, next]
    return { success: true, data: next, message: 'Subject created.' }
  }

  const name = (payload.name || '').trim()
  if (!name) throw buildAxiosError(400, 'Subject name is required.')

  const { data } = await apiClient.post('/subjects', { name })
  const mapped = mapSubjectFromApi(data.data, subjectsStore.length)
  if (payload.color) mapped.color = payload.color
  if (payload.description) mapped.description = payload.description.trim()
  if (payload.code) mapped.code = payload.code.trim().toUpperCase()
  return { success: true, data: mapped, message: data?.message ?? 'Subject created.' }
}

export async function updateSubject(id, payload) {
  if (USE_MOCK) {
    await delay(260)
    const idx = subjectsStore.findIndex((s) => s.id === id)
    if (idx === -1) throw buildAxiosError(404, 'Subject not found.')
    const updated = { ...subjectsStore[idx], ...payload, name: payload.name?.trim() }
    subjectsStore[idx] = updated
    return { success: true, data: updated, message: 'Subject updated.' }
  }

  const name = (payload.name || '').trim()
  if (!name) throw buildAxiosError(400, 'Subject name is required.')

  const { data } = await apiClient.patch(`/subjects/${id}`, { name })
  const mapped = mapSubjectFromApi(data.data)
  if (payload.color) mapped.color = payload.color
  if (payload.description) mapped.description = (payload.description || '').trim()
  if (payload.code) mapped.code = payload.code.trim().toUpperCase()
  else mapped.code = deriveCode(name)
  return { success: true, data: mapped, message: data?.message ?? 'Subject updated.' }
}

export async function deleteSubject(id) {
  if (USE_MOCK) {
    await delay(220)
    subjectsStore = subjectsStore.filter((s) => s.id !== id)
    return { success: true, data: { id }, message: 'Subject deleted.' }
  }

  const { data } = await apiClient.delete(`/subjects/${id}`)
  return { success: true, data: { id: String(id) }, message: data?.message ?? 'Subject deleted.' }
}
