
const USE_MOCK = true

let subjectsStore = [
  {
    id: 'sub-1',
    name: 'Software Engineering',
    code: 'SE',
    description: 'Patterns, architecture, and engineering practices.',
    documentCount: 8,
    color: '#3525cd',
    createdAt: '2026-04-12T08:30:00Z',
  },
  {
    id: 'sub-2',
    name: 'Database Systems',
    code: 'DB',
    description: 'Relational design, normalization, and query tuning.',
    documentCount: 5,
    color: '#10b3a8',
    createdAt: '2026-04-15T11:00:00Z',
  },
  {
    id: 'sub-3',
    name: 'Artificial Intelligence',
    code: 'AI',
    description: 'Machine learning, neural networks, transformers.',
    documentCount: 12,
    color: '#a78bfa',
    createdAt: '2026-04-18T15:20:00Z',
  },
  {
    id: 'sub-4',
    name: 'Web Development',
    code: 'WEB',
    description: 'HTML, CSS, JavaScript, React, full-stack patterns.',
    documentCount: 7,
    color: '#57dffe',
    createdAt: '2026-04-22T09:00:00Z',
  },
  {
    id: 'sub-5',
    name: 'Physics',
    code: 'PHY',
    description: 'Mechanics, thermodynamics, quantum mechanics.',
    documentCount: 3,
    color: '#f59e0b',
    createdAt: '2026-04-26T14:00:00Z',
  },
  {
    id: 'sub-6',
    name: 'Mathematics',
    code: 'MATH',
    description: 'Algebra, calculus, linear algebra, discrete math.',
    documentCount: 6,
    color: '#ef4444',
    createdAt: '2026-04-30T10:15:00Z',
  },
]

const RESERVED_CODE = ['ADMIN', 'API', 'NULL']

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildAxiosError(status, message) {
  const err = new Error(message)
  err.response = { status, data: { success: false, message } }
  return err
}

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
  // const { data } = await apiClient.get('/subjects', { params })
  // return data
}

export async function createSubject(payload) {
  if (USE_MOCK) {
    await delay(260)
    const code = (payload.code || '').trim().toUpperCase()
    const name = (payload.name || '').trim()

    if (!name) throw buildAxiosError(400, 'Subject name is required.')
    if (!code) throw buildAxiosError(400, 'Subject code is required.')
    if (!/^[A-Z0-9]{2,8}$/.test(code))
      throw buildAxiosError(400, 'Code must be 2-8 uppercase letters or numbers.')
    if (RESERVED_CODE.includes(code))
      throw buildAxiosError(400, `"${code}" is a reserved code.`)
    if (subjectsStore.some((s) => s.code === code))
      throw buildAxiosError(409, `A subject with code "${code}" already exists.`)
    if (subjectsStore.some((s) => s.name.toLowerCase() === name.toLowerCase()))
      throw buildAxiosError(409, `A subject named "${name}" already exists.`)

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
  // const { data } = await apiClient.post('/subjects', payload)
  // return data
}

export async function updateSubject(id, payload) {
  if (USE_MOCK) {
    await delay(260)
    const idx = subjectsStore.findIndex((s) => s.id === id)
    if (idx === -1) throw buildAxiosError(404, 'Subject not found.')

    const code = (payload.code || '').trim().toUpperCase()
    const name = (payload.name || '').trim()

    if (!name) throw buildAxiosError(400, 'Subject name is required.')
    if (!code) throw buildAxiosError(400, 'Subject code is required.')
    if (!/^[A-Z0-9]{2,8}$/.test(code))
      throw buildAxiosError(400, 'Code must be 2-8 uppercase letters or numbers.')
    if (RESERVED_CODE.includes(code))
      throw buildAxiosError(400, `"${code}" is a reserved code.`)
    if (subjectsStore.some((s) => s.id !== id && s.code === code))
      throw buildAxiosError(409, `A subject with code "${code}" already exists.`)
    if (subjectsStore.some((s) => s.id !== id && s.name.toLowerCase() === name.toLowerCase()))
      throw buildAxiosError(409, `A subject named "${name}" already exists.`)

    const updated = {
      ...subjectsStore[idx],
      name,
      code,
      description: (payload.description || '').trim(),
      color: payload.color || subjectsStore[idx].color,
    }
    subjectsStore = [
      ...subjectsStore.slice(0, idx),
      updated,
      ...subjectsStore.slice(idx + 1),
    ]
    return { success: true, data: updated, message: 'Subject updated.' }
  }
  // const { data } = await apiClient.patch(`/subjects/${id}`, payload)
  // return data
}

export async function deleteSubject(id) {
  if (USE_MOCK) {
    await delay(220)
    const target = subjectsStore.find((s) => s.id === id)
    if (!target) throw buildAxiosError(404, 'Subject not found.')
    if (target.documentCount > 0) {
      throw buildAxiosError(
        409,
        `Cannot delete "${target.name}" because it has ${target.documentCount} document${
          target.documentCount === 1 ? '' : 's'
        }. Move or delete those documents first.`,
      )
    }
    subjectsStore = subjectsStore.filter((s) => s.id !== id)
    return { success: true, data: { id }, message: 'Subject deleted.' }
  }
  // const { data } = await apiClient.delete(`/subjects/${id}`)
  // return data
}
