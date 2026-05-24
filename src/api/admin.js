import { ADMIN_STATS, ADMIN_USERS, PENDING_DOCS, TOP_DOCS, SUBJECT_ACTIVITY } from '../data/mockData'

const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms))

export const adminApi = {
  getStats: async () => { await delay(); return ADMIN_STATS },
  getUsers: async () => { await delay(); return ADMIN_USERS },
  getPendingDocs: async () => { await delay(); return PENDING_DOCS },
  getTopDocs: async () => { await delay(); return TOP_DOCS },
  getSubjectActivity: async () => { await delay(); return SUBJECT_ACTIVITY },
}
