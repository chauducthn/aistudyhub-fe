export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
}

export function normalizeRole(role) {
  return String(role || '').toUpperCase()
}

export function isAdminRole(role) {
  return normalizeRole(role) === ROLES.ADMIN
}
