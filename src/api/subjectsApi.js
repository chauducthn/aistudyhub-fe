import apiClient from './client'

export async function listSubjects() {
  const { data } = await apiClient.get('/subjects')
  return data
}

export async function createSubject(payload) {
  const { data } = await apiClient.post('/subjects', { name: payload.name })
  return data
}

export async function updateSubject(id, payload) {
  const { data } = await apiClient.patch(`/subjects/${id}`, { name: payload.name })
  return data
}

export async function deleteSubject(id) {
  const { data } = await apiClient.delete(`/subjects/${id}`)
  return data
}
