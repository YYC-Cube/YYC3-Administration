/**
 * @file auth.test.ts
 * @description YYC³ Auth Store — Unit Tests
 *   Covers: login, register, logout, session check, permissions.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { useAuthStore } from '../../src/stores/useAuthStore'
import { hasPermission, ROLE_PERMISSIONS } from '../../src/types/auth'

// ==========================================
// Setup
// ==========================================

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  useAuthStore.setState({ user: null, status: 'unauthenticated', token: null })
})

// ==========================================
// Role Permissions
// ==========================================

describe('Auth — Role Permissions', () => {
  it('admin should have all permissions', () => {
    expect(hasPermission('admin', 'dashboard:view')).toBe(true)
    expect(hasPermission('admin', 'system:admin')).toBe(true)
    expect(hasPermission('admin', 'salary:edit')).toBe(true)
  })

  it('manager should have view but not delete', () => {
    expect(hasPermission('manager', 'customer:view')).toBe(true)
    expect(hasPermission('manager', 'customer:edit')).toBe(true)
    expect(hasPermission('manager', 'customer:delete')).toBe(false)
    expect(hasPermission('manager', 'system:admin')).toBe(false)
  })

  it('agent should have limited permissions', () => {
    expect(hasPermission('agent', 'dashboard:view')).toBe(true)
    expect(hasPermission('agent', 'customer:view')).toBe(true)
    expect(hasPermission('agent', 'ai:use')).toBe(true)
    expect(hasPermission('agent', 'finance:view')).toBe(false)
    expect(hasPermission('agent', 'settings:edit')).toBe(false)
  })

  it('viewer should only have view permissions', () => {
    expect(hasPermission('viewer', 'dashboard:view')).toBe(true)
    expect(hasPermission('viewer', 'customer:view')).toBe(true)
    expect(hasPermission('viewer', 'customer:edit')).toBe(false)
    expect(hasPermission('viewer', 'ai:use')).toBe(false)
  })

  it('all roles should be defined in ROLE_PERMISSIONS', () => {
    expect(ROLE_PERMISSIONS.admin).toBeDefined()
    expect(ROLE_PERMISSIONS.manager).toBeDefined()
    expect(ROLE_PERMISSIONS.agent).toBeDefined()
    expect(ROLE_PERMISSIONS.viewer).toBeDefined()
  })
})

// ==========================================
// Login
// ============================================

describe('Auth Store — Login', () => {
  it('should create default admin on first login', async () => {
    const result = await useAuthStore.getState().login({
      username: 'admin',
      password: 'admin123',
    })

    expect(result.success).toBe(true)
    expect(useAuthStore.getState().user).not.toBeNull()
    expect(useAuthStore.getState().user?.username).toBe('admin')
    expect(useAuthStore.getState().user?.role).toBe('admin')
    expect(useAuthStore.getState().status).toBe('authenticated')
    expect(useAuthStore.getState().token).toBeTruthy()
  })

  it('should reject wrong password', async () => {
    // First create the admin
    await useAuthStore.getState().login({ username: 'admin', password: 'admin123' })
    useAuthStore.getState().logout()

    // Try with wrong password
    const result = await useAuthStore.getState().login({
      username: 'admin',
      password: 'wrongpass',
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('密码错误')
    expect(useAuthStore.getState().status).toBe('unauthenticated')
  })

  it('should reject non-existent user', async () => {
    // Create default admin first
    await useAuthStore.getState().login({ username: 'admin', password: 'admin123' })
    useAuthStore.getState().logout()

    const result = await useAuthStore.getState().login({
      username: 'ghost',
      password: 'anything',
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('不存在')
  })

  it('should accept email as username', async () => {
    await useAuthStore.getState().login({ username: 'admin', password: 'admin123' })
    useAuthStore.getState().logout()

    const result = await useAuthStore.getState().login({
      username: 'admin@yyc3.local',
      password: 'admin123',
    })

    expect(result.success).toBe(true)
  })
})

// ==========================================
// Register
// ==========================================

describe('Auth Store — Register', () => {
  it('should register a new user', async () => {
    const result = await useAuthStore.getState().register({
      username: 'testuser',
      email: 'test@test.com',
      password: 'password123',
      displayName: 'Test User',
    })

    expect(result.success).toBe(true)
    expect(useAuthStore.getState().user?.username).toBe('testuser')
    expect(useAuthStore.getState().user?.email).toBe('test@test.com')
    expect(useAuthStore.getState().user?.role).toBe('admin') // First user is admin
  })

  it('should reject duplicate username', async () => {
    await useAuthStore.getState().register({
      username: 'testuser',
      email: 'test@test.com',
      password: 'password123',
    })
    useAuthStore.getState().logout()

    const result = await useAuthStore.getState().register({
      username: 'testuser',
      email: 'other@test.com',
      password: 'password456',
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('用户名已存在')
  })

  it('should reject duplicate email', async () => {
    await useAuthStore.getState().register({
      username: 'user1',
      email: 'shared@test.com',
      password: 'password123',
    })
    useAuthStore.getState().logout()

    const result = await useAuthStore.getState().register({
      username: 'user2',
      email: 'shared@test.com',
      password: 'password456',
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('邮箱已被注册')
  })

  it('should reject short password', async () => {
    const result = await useAuthStore.getState().register({
      username: 'shortpass',
      email: 'short@test.com',
      password: '12345',
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('至少 6 位')
  })

  it('should assign viewer role to second user', async () => {
    // Register admin (first user)
    await useAuthStore.getState().register({
      username: 'admin2',
      email: 'admin2@test.com',
      password: 'password123',
    })
    useAuthStore.getState().logout()

    // Register second user
    const result = await useAuthStore.getState().register({
      username: 'viewer1',
      email: 'viewer@test.com',
      password: 'password123',
    })

    expect(result.success).toBe(true)
    expect(useAuthStore.getState().user?.role).toBe('viewer')
  })
})

// ==========================================
// Logout & Session
// ==========================================

describe('Auth Store — Logout & Session', () => {
  it('should clear state on logout', async () => {
    await useAuthStore.getState().login({ username: 'admin', password: 'admin123' })
    expect(useAuthStore.getState().status).toBe('authenticated')

    useAuthStore.getState().logout()

    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().token).toBeNull()
    expect(useAuthStore.getState().status).toBe('unauthenticated')
  })

  it('should restore session on checkSession', async () => {
    await useAuthStore.getState().login({
      username: 'admin',
      password: 'admin123',
      rememberMe: true,
    })

    // Simulate page reload by clearing in-memory state
    useAuthStore.setState({ user: null, token: null, status: 'loading' })

    await useAuthStore.getState().checkSession()

    expect(useAuthStore.getState().status).toBe('authenticated')
    expect(useAuthStore.getState().user?.username).toBe('admin')
  })

  it('should set unauthenticated when no session exists', async () => {
    useAuthStore.setState({ status: 'loading' })

    await useAuthStore.getState().checkSession()

    expect(useAuthStore.getState().status).toBe('unauthenticated')
    expect(useAuthStore.getState().user).toBeNull()
  })
})

// ==========================================
// Store Helpers
// ==========================================

describe('Auth Store — Permission Helpers', () => {
  it('hasPermission should check role correctly', async () => {
    await useAuthStore.getState().login({ username: 'admin', password: 'admin123' })

    expect(useAuthStore.getState().hasPermission('system:admin')).toBe(true)
    expect(useAuthStore.getState().hasPermission('dashboard:view')).toBe(true)
  })

  it('hasPermission should return false when not logged in', () => {
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().hasPermission('dashboard:view')).toBe(false)
  })

  it('hasRole should check current role', async () => {
    await useAuthStore.getState().login({ username: 'admin', password: 'admin123' })

    expect(useAuthStore.getState().hasRole('admin')).toBe(true)
    expect(useAuthStore.getState().hasRole('admin', 'manager')).toBe(true)
    expect(useAuthStore.getState().hasRole('viewer')).toBe(false)
  })
})
