/**
 * @file auth-context.tsx
 * @description YYC³ Auth Context Provider — Wraps the app with authentication.
 *   Shows login/register screen when unauthenticated.
 *   Features Ghost Mode for development, theme-aware UI, responsive design.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v2.0.0
 * @created 2026-07-11
 * @updated 2026-07-11
 * @tags auth,context,security,ghost-mode
 */

import {
  Eye,
  EyeOff,
  Ghost,
  KeyRound,
  Layers,
  Loader2,
  LogIn,
  Sparkles,
  UserPlus,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useAuthStore } from '../../stores/useAuthStore'

import { useThemeColors } from './hooks/use-theme-colors'
import { useI18n } from './i18n-context'

import type { FormEvent } from 'react'

// ==========================================
// Constants
// ==========================================

const GHOST_MODE_ENABLED =
  typeof import.meta !== 'undefined' &&
  (import.meta as unknown as Record<string, Record<string, string>>).env?.VITE_GHOST_MODE === 'true'

const GHOST_ACCOUNTS = [
  { label: '管理员 Admin', username: 'admin', role: 'admin' },
  { label: '经理 Manager', username: 'manager', role: 'manager' },
  { label: '客服 Agent', username: 'agent', role: 'agent' },
  { label: '观察者 Viewer', username: 'viewer', role: 'viewer' },
]

// ==========================================
// Auth Page — Login / Register
// ==========================================

function AuthPage() {
  const { login, register } = useAuthStore()
  const tc = useThemeColors()
  const { locale, setLocale } = useI18n()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [ghostOpen, setGhostOpen] = useState(false)
  const [ghostLogging, setGhostLogging] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const ghostPanelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ghostOpen) return
    const handler = (e: MouseEvent) => {
      if (ghostPanelRef.current && !ghostPanelRef.current.contains(e.target as Node)) {
        setGhostOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ghostOpen])

  const validate = useCallback((): boolean => {
    const errors: Record<string, string> = {}
    if (!username.trim()) errors.username = '请输入用户名'
    if (mode === 'register') {
      if (!email.trim()) errors.email = '请输入邮箱'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = '邮箱格式不正确'
      if (!displayName.trim()) errors.displayName = '请输入显示名称'
    }
    if (!password) errors.password = '请输入密码'
    else if (mode === 'register' && password.length < 6) errors.password = '密码至少 6 位'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }, [mode, username, email, password, displayName])

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (!validate()) return
      setError(null)
      setLoading(true)
      try {
        if (mode === 'login') {
          const result = await login({ username: username.trim(), password, rememberMe })
          if (!result.success) setError(result.error || '登录失败 / Login failed')
        } else {
          const result = await register({
            username: username.trim(),
            email: email.trim(),
            password,
            displayName: displayName.trim() || username.trim(),
          })
          if (!result.success) setError(result.error || '注册失败 / Registration failed')
        }
      } catch {
        setError('网络错误，请重试 / Network error.')
      } finally {
        setLoading(false)
      }
    },
    [mode, username, email, password, displayName, rememberMe, login, register, validate],
  )

  const handleGhostLogin = useCallback(
    async (gu: (typeof GHOST_ACCOUNTS)[number]) => {
      setGhostLogging(gu.label)
      setError(null)
      try {
        let r = await login({
          username: gu.username,
          password: 'ghost-' + gu.username,
          rememberMe: false,
        })
        if (!r.success) {
          await register({
            username: gu.username,
            email: gu.username + '@ghost.yyc3',
            password: 'ghost-' + gu.username,
            displayName: gu.label,
          })
          r = await login({
            username: gu.username,
            password: 'ghost-' + gu.username,
            rememberMe: false,
          })
        }
      } catch {
        setError('幽灵模式登录失败')
      } finally {
        setGhostLogging(null)
        setGhostOpen(false)
      }
    },
    [login, register],
  )

  const switchMode = useCallback(() => {
    setMode((m) => (m === 'login' ? 'register' : 'login'))
    setError(null)
    setFieldErrors({})
  }, [])

  const inputStyle = useMemo(
    () => ({
      background: tc.bgInput,
      border: '1px solid ' + tc.borderDefault,
      color: tc.textPrimary,
    }),
    [tc],
  )

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 overflow-auto"
      style={{ background: tc.bgBase }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(${tc.alpha(tc.primary, 0.04)} 1px, transparent 1px),
            linear-gradient(90deg, ${tc.alpha(tc.primary, 0.04)} 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: '40vw',
          height: '40vw',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${tc.alpha(tc.primary, 0.08)} 0%, transparent 70%)`,
          top: '-10%',
          right: '-10%',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: '30vw',
          height: '30vw',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${tc.alpha(tc.secondary, 0.06)} 0%, transparent 70%)`,
          bottom: '-5%',
          left: '-5%',
          filter: 'blur(60px)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] }}
        className="relative w-full max-w-md"
      >
        <div
          className="rounded-2xl border p-6 sm:p-8 backdrop-blur-xl"
          style={{
            borderColor: tc.borderDefault,
            background: tc.bgElevated,
            boxShadow: tc.shadowLg,
          }}
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{
                background: tc.alpha(tc.primary, 0.1),
                border: '1px solid ' + tc.borderActive,
                boxShadow: tc.shadowGlow,
              }}
            >
              <Layers className="w-8 h-8" style={{ color: tc.primary }} />
            </motion.div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: tc.primary }}>
              YYC³ 言语智能
            </h1>
            <p className="text-xs mt-1" style={{ color: tc.textMuted }}>
              YanYu Intelligent AI System
            </p>
            <p className="text-sm mt-3" style={{ color: tc.textMuted }}>
              {mode === 'login' ? '登录到您的账户' : '创建新账户'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 px-4 py-3 rounded-lg text-sm flex items-center gap-2 overflow-hidden"
                style={{
                  background: tc.alpha(tc.danger, 0.1),
                  border: '1px solid ' + tc.alpha(tc.danger, 0.3),
                  color: tc.danger,
                }}
              >
                <X className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === 'register' && (
              <div>
                <label
                  className="block text-sm mb-1.5 font-medium"
                  style={{ color: tc.textSecondary }}
                >
                  显示名称
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg outline-none transition-all duration-200"
                  style={{
                    ...inputStyle,
                    borderColor: fieldErrors.displayName ? tc.danger : tc.borderDefault,
                  }}
                  placeholder="您的显示名称"
                />
                {fieldErrors.displayName && (
                  <p className="text-xs mt-1" style={{ color: tc.danger }}>
                    {fieldErrors.displayName}
                  </p>
                )}
              </div>
            )}

            <div>
              <label
                className="block text-sm mb-1.5 font-medium"
                style={{ color: tc.textSecondary }}
              >
                {mode === 'login' ? '用户名 / 邮箱' : '用户名'}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setFieldErrors((p) => ({ ...p, username: '' }))
                }}
                required
                autoComplete={mode === 'login' ? 'username' : 'username'}
                className="w-full px-4 py-2.5 rounded-lg outline-none transition-all duration-200"
                style={{
                  ...inputStyle,
                  borderColor: fieldErrors.username ? tc.danger : tc.borderDefault,
                }}
                placeholder={mode === 'login' ? 'admin 或 admin@yyc3.local' : 'your_username'}
              />
              {fieldErrors.username && (
                <p className="text-xs mt-1" style={{ color: tc.danger }}>
                  {fieldErrors.username}
                </p>
              )}
            </div>

            {mode === 'register' && (
              <div>
                <label
                  className="block text-sm mb-1.5 font-medium"
                  style={{ color: tc.textSecondary }}
                >
                  邮箱
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setFieldErrors((p) => ({ ...p, email: '' }))
                  }}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-2.5 rounded-lg outline-none transition-all duration-200"
                  style={{
                    ...inputStyle,
                    borderColor: fieldErrors.email ? tc.danger : tc.borderDefault,
                  }}
                  placeholder="you@example.com"
                />
                {fieldErrors.email && (
                  <p className="text-xs mt-1" style={{ color: tc.danger }}>
                    {fieldErrors.email}
                  </p>
                )}
              </div>
            )}

            <div>
              <label
                className="block text-sm mb-1.5 font-medium"
                style={{ color: tc.textSecondary }}
              >
                密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setFieldErrors((p) => ({ ...p, password: '' }))
                  }}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full px-4 py-2.5 pr-10 rounded-lg outline-none transition-all duration-200"
                  style={{
                    ...inputStyle,
                    borderColor: fieldErrors.password ? tc.danger : tc.borderDefault,
                  }}
                  placeholder={mode === 'login' ? '••••••••' : '至少 6 位'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: tc.textMuted }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs mt-1" style={{ color: tc.danger }}>
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {mode === 'login' && (
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none group">
                <div
                  className="w-4 h-4 rounded flex items-center justify-center transition-all"
                  style={{
                    background: rememberMe ? tc.primary : 'transparent',
                    border: '2px solid ' + (rememberMe ? tc.primary : tc.borderDefault),
                  }}
                >
                  {rememberMe && (
                    <svg className="w-3 h-3" viewBox="0 0 12 12" fill={tc.textInverse}>
                      <path d="M3 6l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <span style={{ color: tc.textSecondary }}>记住我（7 天）</span>
              </label>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              style={{
                background: tc.gradientButton,
                border: '1px solid ' + tc.borderActive,
                color: tc.primary,
                boxShadow: tc.shadowSm,
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
            </motion.button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span style={{ color: tc.textMuted }}>
              {mode === 'login' ? '没有账户？' : '已有账户？'}
            </span>
            <button
              onClick={switchMode}
              className="ml-2 hover:underline font-medium"
              style={{ color: tc.primary }}
            >
              {mode === 'login' ? '注册新账户' : '登录'}
            </button>
          </div>

          {GHOST_MODE_ENABLED && mode === 'login' && (
            <div className="mt-4 relative" ref={ghostPanelRef}>
              <motion.button
                type="button"
                onClick={() => setGhostOpen(!ghostOpen)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
                style={{
                  background: tc.alpha(tc.accent, 0.08),
                  border: '1px dashed ' + tc.alpha(tc.accent, 0.3),
                  color: tc.accent,
                }}
              >
                <Ghost className="w-4 h-4" />
                幽灵模式 · 免密开发
                <Sparkles className="w-3 h-3" />
              </motion.button>

              <AnimatePresence>
                {ghostOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border p-3 space-y-2 z-10"
                    style={{
                      background: tc.bgElevated,
                      borderColor: tc.alpha(tc.accent, 0.2),
                      boxShadow: tc.shadowLg,
                    }}
                  >
                    <p className="text-xs font-medium mb-2" style={{ color: tc.textSecondary }}>
                      选择角色快速进入（开发环境）
                    </p>
                    {GHOST_ACCOUNTS.map((account) => (
                      <button
                        key={account.username}
                        type="button"
                        disabled={ghostLogging !== null}
                        onClick={() => handleGhostLogin(account)}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all"
                        style={{
                          background: tc.alpha(tc.accent, 0.04),
                          border: '1px solid ' + tc.alpha(tc.accent, 0.1),
                          color: tc.textPrimary,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = tc.alpha(tc.accent, 0.1))
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = tc.alpha(tc.accent, 0.04))
                        }
                      >
                        {ghostLogging === account.label ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                        ) : (
                          <Ghost
                            className="w-3.5 h-3.5 flex-shrink-0"
                            style={{ color: tc.accent }}
                          />
                        )}
                        <span className="flex-1">{account.label}</span>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{ background: tc.alpha(tc.primary, 0.1), color: tc.primary }}
                        >
                          {account.role}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {mode === 'login' && (
            <div
              className="mt-4 px-3 py-2 rounded-lg text-xs flex items-center gap-2"
              style={{
                background: tc.alpha(tc.primary, 0.04),
                border: '1px solid ' + tc.borderSubtle,
                color: tc.textMuted,
              }}
            >
              <KeyRound className="w-3 h-3 flex-shrink-0" />
              <span>默认管理员: admin / admin123</span>
            </div>
          )}
        </div>
        <p className="text-center text-xs mt-6" style={{ color: tc.textMuted }}>
          言启千行代码 · 语枢万物智能
        </p>
        {/* Language switcher in auth */}
        <div className="flex items-center justify-center gap-2 mt-3">
          {(['zh', 'en'] as const).map((code) => {
            const active = locale === code
            return (
              <button
                key={code}
                onClick={() => setLocale(code)}
                className="text-xs px-2 py-1 rounded transition-all"
                style={{
                  background: active ? tc.alpha(tc.primary, 0.1) : 'transparent',
                  color: active ? tc.primary : tc.textMuted,
                  border: '1px solid ' + (active ? tc.alpha(tc.primary, 0.2) : 'transparent'),
                }}
              >
                {code === 'zh' ? '🇨🇳 中文' : '🇺🇸 English'}
              </button>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

function AuthLoading() {
  const tc = useThemeColors()
  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: tc.bgBase }}
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: tc.primary }} />
        <p className="text-sm" style={{ color: tc.textMuted }}>
          正在验证身份...
        </p>
      </div>
    </div>
  )
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { status, checkSession } = useAuthStore()
  useEffect(() => {
    void checkSession()
  }, [checkSession])
  if (status === 'loading') return <AuthLoading />
  if (status === 'unauthenticated') return <AuthPage />
  return <>{children}</>
}
