import { describe, it, expect } from 'vitest'
import { ROLES, normalizeRole, isAdminRole } from './roles'

describe('roles utility', () => {
  it('normalizeRole should convert to uppercase string', () => {
    expect(normalizeRole('admin')).toBe('ADMIN')
    expect(normalizeRole('User')).toBe('USER')
    expect(normalizeRole(null)).toBe('')
    expect(normalizeRole(undefined)).toBe('')
  })

  it('isAdminRole should correctly identify admin role', () => {
    expect(isAdminRole('ADMIN')).toBe(true)
    expect(isAdminRole('admin')).toBe(true)
    expect(isAdminRole('USER')).toBe(false)
    expect(isAdminRole(null)).toBe(false)
  })
})
