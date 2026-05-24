import { DOCUMENTS, SUBJECTS, AI_CHAT_MESSAGES, STUDENT_STATS } from '../data/mockData'

const delay = (ms = 400) => new Promise((res) => setTimeout(res, ms))

export const studentApi = {
  getStats: async () => { await delay(); return STUDENT_STATS },
  getDocuments: async () => { await delay(); return DOCUMENTS },
  getSubjects: async () => { await delay(); return SUBJECTS },
  getChatHistory: async () => { await delay(); return AI_CHAT_MESSAGES },
}
