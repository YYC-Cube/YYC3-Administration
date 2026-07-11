/**
 * @file auth-context.tsx
 * @description YYC³ Auth Context Provider — Wraps the app with authentication.
 *   Shows login/register screen when unauthenticated.
 *   Auto-checks encrypted session on mount.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 * @tags auth,context,security
 */

import { Eye, EyeOff, KeyRound, Loader2, LogIn, Shield, UserPlus, X } from 'lucide-react'
import { type FormEvent, useCallback, useEffect, useState } from 'react'

import { useAuthStore } from '../../stores/useAuthStore'

import type { LoginCredentials, RegisterInfo } from '../../types/auth'

// ==========================================
// Auth Context
// ==========================================

// ==========================================
// Login/Register Page
// ==========================================

function AuthPage() {
  const { login, register } = useAuthStore()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Form fields
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [rememberMe, setRememberMe] = useState(true)

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      setError(null)
      setLoading(true)

      try {
        if (mode === 'login') {
          const creds: LoginCredentials = { username, password, rememberMe }
          const result = await login(creds)
          if (!result.success) {
            setError(result.error || 'Login failed')
          }
        } else {
          const info: RegisterInfo = { username, email, password, displayName }
          const result = await register(info)
          if (!result.success) {
            setError(result.error || 'Registration failed')
          }
        }
      } catch {
        setError('Network error. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    [mode, username, email, password, displayName, rememberMe, login, register],
  )

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(ellipse at center, #0d1117 0%, #05080d 100%)',
      }}
    >
      {/* Circuit grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,240,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.06) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div
        className="relative w-full max-w-md rounded-2xl border p-8 backdrop-blur-xl"
        style={{
          borderColor: 'rgba(0,240,255,0.2)',
          background: 'rgba(13,17,23,0.85)',
          boxShadow: '0 0 40px rgba(0,240,255,0.1), 0 0 80px rgba(0,240,255,0.05)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{
              background: 'rgba(0,240,255,0.1)',
              border: '1px solid rgba(0,240,255,0.3)',
            }}
          >
            <Shield className="w-8 h-8" style={{ color: '#00f0ff' }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#00f0ff' }}>
            YYC³ Administration
          </h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {mode === 'login' ? '登录到您的账户' : '创建新账户'}
          </p>
        </div>

        {/* Error display */}
        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444',
            }}
          >
            <X className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                显示名称
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg outline-none transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#ffffff',
                }}
                placeholder="可选"
              />
            </div>
          )}

          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {mode === 'login' ? '用户名 / 邮箱' : '用户名'}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete={mode === 'login' ? 'username' : 'username'}
              className="w-full px-4 py-2.5 rounded-lg outline-none transition-colors"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#ffffff',
              }}
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-lg outline-none transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#ffffff',
                }}
              />
            </div>
          )}

          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              密码
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full px-4 py-2.5 pr-10 rounded-lg outline-none transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#ffffff',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'login' && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-cyan-400"
              />
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>记住我 (7天)</span>
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, rgba(0,240,255,0.2), rgba(0,212,255,0.2))',
              border: '1px solid rgba(0,240,255,0.4)',
              color: '#00f0ff',
            }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                登录
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                注册
              </>
            )}
          </button>
        </form>

        {/* Mode switch */}
        <div className="mt-6 text-center text-sm">
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>
            {mode === 'login' ? '没有账户？' : '已有账户？'}
          </span>
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setError(null)
            }}
            className="ml-2 hover:underline"
            style={{ color: '#00f0ff' }}
          >
            {mode === 'login' ? '注册新账户' : '登录'}
          </button>
        </div>

        {/* Default credentials hint */}
        {mode === 'login' && (
          <div
            className="mt-4 px-3 py-2 rounded-lg text-xs flex items-center gap-2"
            style={{
              background: 'rgba(0,240,255,0.05)',
              border: '1px solid rgba(0,240,255,0.1)',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            <KeyRound className="w-3 h-3 flex-shrink-0" />
            <span>默认管理员: admin / admin123</span>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Auth provider that gates the entire app behind authentication.
 * Shows login/register screen when not authenticated.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { status, checkSession } = useAuthStore()

  useEffect(() => {
    void checkSession()
  }, [checkSession])

  if (status === 'loading') {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: '#05080d' }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#00f0ff' }} />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            正在验证身份...
          </p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <AuthPage />
  }

  return <>{children}</>
}
