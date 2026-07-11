/**
 * @file types/auth.ts
 * @description YYC³ Authentication System - Type Definitions
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 * @tags auth,types,security
 */

/** 用户角色 */
export type UserRole = 'admin' | 'manager' | 'agent' | 'viewer'

/** 认证状态 */
export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading'

/** 用户信息 */
export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  role: UserRole
  displayName?: string
  createdAt: number
  lastLoginAt?: number
}

/** 登录凭证 */
export interface LoginCredentials {
  username: string
  password: string
  rememberMe?: boolean
}

/** 注册信息 */
export interface RegisterInfo {
  username: string
  email: string
  password: string
  displayName?: string
}

/** 认证会话 */
export interface AuthSession {
  user: User
  token: string
  expiresAt: number
}

/** 权限定义 */
export type Permission =
  | 'dashboard:view'
  | 'customer:view'
  | 'customer:edit'
  | 'customer:delete'
  | 'ai:use'
  | 'ai:configure'
  | 'settings:view'
  | 'settings:edit'
  | 'finance:view'
  | 'finance:edit'
  | 'salary:view'
  | 'salary:edit'
  | 'system:admin'

/** 角色权限映射 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'dashboard:view',
    'customer:view',
    'customer:edit',
    'customer:delete',
    'ai:use',
    'ai:configure',
    'settings:view',
    'settings:edit',
    'finance:view',
    'finance:edit',
    'salary:view',
    'salary:edit',
    'system:admin',
  ],
  manager: [
    'dashboard:view',
    'customer:view',
    'customer:edit',
    'ai:use',
    'ai:configure',
    'settings:view',
    'finance:view',
    'salary:view',
  ],
  agent: ['dashboard:view', 'customer:view', 'customer:edit', 'ai:use'],
  viewer: ['dashboard:view', 'customer:view'],
}

/** 检查角色是否拥有权限 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}
