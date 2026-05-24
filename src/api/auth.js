import { USERS } from '../data/mockData'

const delay = (ms = 600) => new Promise((res) => setTimeout(res, ms))

export const authApi = {
  login: async ({ email, password }) => {
    await delay()
    const user = USERS.find((u) => u.email === email && u.password === password)
    if (!user) throw new Error('Invalid email or password')
    const { password: _pw, ...safeUser } = user
    const token = `mock-token-${safeUser.id}-${Date.now()}`
    return { user: safeUser, token }
  },
  logout: async () => { await delay(200); return { success: true } },
}
