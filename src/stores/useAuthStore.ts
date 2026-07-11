/**
 * @file stores/useAuthStore.ts
 * @description YYC³ Auth Store - Zustand-based authentication state management
 *   with encrypted session persistence and role-based access control.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 * @tags auth,store,zustand,security
 */

import { create } from 'zustand'

import { generateSecureToken, hashPassword, verifyPassword } from '../lib/crypto'
import { getSecure, removeSecure, setSecure } from '../lib/secure-storage'
import { hasPermission, ROLE_PERMISSIONS } from '../types/auth'

import type {
  AuthStatus,
  LoginCredentials,
  Permission,
  RegisterInfo,
  User,
  UserRole,
} from '../types/auth'

// ==========================================
// Types
// ==========================================

const SESSION_KEY = 'auth_session'
const USERS_KEY = 'auth_users'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

interface StoredUser extends User {
  passwordHash: string
}

interface AuthState {
  user: User | null
  status: AuthStatus
  token: string | null
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  register: (info: RegisterInfo) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  checkSession: () => Promise<void>
  updateProfile: (partial: Partial<User>) => Promise<void>
  hasPermission: (permission: Permission) => boolean
  hasRole: (...roles: UserRole[]) => boolean
}

// ==========================================
// User Storage (encrypted)
// ==========================================

async function loadUsers(): Promise<StoredUser[]> {
  const raw = await getSecure(USERS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

async function saveUsers(users: StoredUser[]): Promise<void> {
  await setSecure(USERS_KEY, JSON.stringify(users))
}

async function loadSession(): Promise<{ user: User; token: string } | null> {
  const raw = await getSecure(SESSION_KEY)
  if (!raw) return null
  try {
    const session = JSON.parse(raw)
    if (session.expiresAt && Date.now() > session.expiresAt) {
      removeSecure(SESSION_KEY)
      return null
    }
    return { user: session.user, token: session.token }
  } catch {
    return null
  }
}

async function saveSession(user: User, token: string, remember: boolean): Promise<void> {
  const session = {
    user,
    token,
    expiresAt: Date.now() + (remember ? SESSION_DURATION : 0),
  }
  await setSecure(SESSION_KEY, JSON.stringify(session))
}

function toPublicUser(stored: StoredUser): User {
  const { passwordHash: _ph, ...public_ } = stored
  void _ph
  return public_
}

// ==========================================
// Store
// ==========================================

export const useAuthStore = create<AuthState & AuthActions>()((set, get) => ({
  user: null,
  status: 'loading',
  token: null,

  login: async (credentials) => {
    const users = await loadUsers()

    // Built-in admin account (for first-time setup)
    if (users.length === 0) {
      // Create default admin: admin / admin123
      const adminHash = await hashPassword('admin123')
      const adminUser: StoredUser = {
        id: 'u_admin',
        username: 'admin',
        email: 'admin@yyc3.local',
        role: 'admin',
        displayName: 'Administrator',
        createdAt: Date.now(),
        passwordHash: adminHash,
      }
      await saveUsers([adminUser])
      users.push(adminUser)
    }

    const found = users.find(
      (u) => u.username === credentials.username || u.email === credentials.username,
    )

    if (!found) {
      return { success: false, error: '用户不存在 / User not found' }
    }

    const valid = await verifyPassword(credentials.password, found.passwordHash)
    if (!valid) {
      return { success: false, error: '密码错误 / Invalid password' }
    }

    const token = generateSecureToken()
    const publicUser = toPublicUser({ ...found, lastLoginAt: Date.now() })

    // Update lastLoginAt in storage
    const updated = users.map((u) => (u.id === found.id ? { ...u, lastLoginAt: Date.now() } : u))
    await saveUsers(updated)
    await saveSession(publicUser, token, credentials.rememberMe ?? true)

    set({ user: publicUser, token, status: 'authenticated' })
    return { success: true }
  },

  register: async (info) => {
    const users = await loadUsers()

    // Check for existing username/email
    if (users.some((u) => u.username === info.username)) {
      return { success: false, error: '用户名已存在 / Username already exists' }
    }
    if (users.some((u) => u.email === info.email)) {
      return { success: false, error: '邮箱已被注册 / Email already registered' }
    }

    // Validate password strength
    if (info.password.length < 6) {
      return { success: false, error: '密码至少 6 位 / Password must be at least 6 characters' }
    }

    const passwordHash = await hashPassword(info.password)
    const newUser: StoredUser = {
      id: 'u_' + generateSecureToken(8),
      username: info.username,
      email: info.email,
      role: users.length === 0 ? 'admin' : 'viewer', // First user is admin
      displayName: info.displayName || info.username,
      createdAt: Date.now(),
      passwordHash,
    }

    await saveUsers([...users, newUser])

    const token = generateSecureToken()
    const publicUser = toPublicUser(newUser)
    await saveSession(publicUser, token, true)

    set({ user: publicUser, token, status: 'authenticated' })
    return { success: true }
  },

  logout: () => {
    removeSecure(SESSION_KEY)
    set({ user: null, token: null, status: 'unauthenticated' })
  },

  checkSession: async () => {
    const session = await loadSession()
    if (session) {
      set({ user: session.user, token: session.token, status: 'authenticated' })
    } else {
      set({ user: null, token: null, status: 'unauthenticated' })
    }
  },

  updateProfile: async (partial) => {
    const { user } = get()
    if (!user) return

    const users = await loadUsers()
    const updated = users.map((u) => (u.id === user.id ? { ...u, ...partial, id: user.id } : u))
    await saveUsers(updated)

    const publicUser = { ...user, ...partial }
    const token = get().token
    if (token) await saveSession(publicUser, token, true)
    set({ user: publicUser })
  },

  hasPermission: (permission) => {
    const { user } = get()
    if (!user) return false
    return hasPermission(user.role, permission)
  },

  hasRole: (...roles) => {
    const { user } = get()
    if (!user) return false
    return roles.includes(user.role)
  },
}))

// Re-export for convenience
export { ROLE_PERMISSIONS }
export type { User, UserRole, Permission }
