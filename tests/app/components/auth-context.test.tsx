/**
 * @file auth-context.test.tsx
 * @description AuthProvider / AuthPage 单元测试 — 本地演示降级模式
 *   Supabase 未配置(测试环境)时认证完全回落本地 store。
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthProvider, unifiedLogout } from '@/app/components/auth-context'
import { I18nProvider } from '@/app/components/i18n-context'
import { ThemeSwitcherProvider } from '@/app/components/theme-switcher-context'
import { useAuthStore } from '@/stores/useAuthStore'

// 捕获原始 store actions 以便每个用例后恢复
const originals = {
  login: useAuthStore.getState().login,
  register: useAuthStore.getState().register,
  checkSession: useAuthStore.getState().checkSession,
}

function wrap(node: ReactNode) {
  return render(
    <ThemeSwitcherProvider defaultTheme="cyberpunk">
      <I18nProvider>{node}</I18nProvider>
    </ThemeSwitcherProvider>,
  )
}

/** 渲染一个无子节点的 AuthProvider(loading / 未登录分支不消费 children) */
function renderAuth() {
  return wrap(<AuthProvider>{null}</AuthProvider>)
}

function getForm(container: HTMLElement): HTMLFormElement {
  const form = container.querySelector('form')
  if (!form) throw new Error('form not found')
  return form as HTMLFormElement
}

/** 固定为未登录且 checkSession 为可控 no-op,避免后台异步翻转状态 */
function setUnauth(
  overrides: Partial<Pick<ReturnType<typeof useAuthStore.getState>, 'login' | 'register'>> = {},
) {
  useAuthStore.setState({
    user: null,
    token: null,
    status: 'unauthenticated',
    checkSession: vi.fn(async () => {}),
    ...overrides,
  })
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  useAuthStore.setState({
    user: null,
    token: null,
    status: 'unauthenticated',
    login: originals.login,
    register: originals.register,
    checkSession: originals.checkSession,
  })
})

describe('AuthProvider — 状态分支', () => {
  it('UTC-AC-001 status=loading 渲染验证中界面', () => {
    useAuthStore.setState({
      status: 'loading',
      checkSession: vi.fn(() => new Promise<void>(() => {})),
    })
    renderAuth()
    expect(screen.getByText('正在验证身份…')).toBeInTheDocument()
  })

  it('UTC-AC-002 status=unauthenticated 渲染登录页', () => {
    setUnauth()
    renderAuth()
    expect(screen.getByText('言启千行代码 · 语枢万物智能')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument()
  })

  it('UTC-AC-003 status=authenticated 渲染子节点', () => {
    useAuthStore.setState({
      status: 'authenticated',
      checkSession: vi.fn(async () => {}),
    })
    wrap(
      <AuthProvider>
        <div data-testid="app-child">APP</div>
      </AuthProvider>,
    )
    expect(screen.getByTestId('app-child')).toBeInTheDocument()
  })

  it('UTC-AC-004 登录页展示开发环境提示', () => {
    setUnauth()
    renderAuth()
    expect(screen.getByText('开发环境默认管理员: admin / admin123')).toBeInTheDocument()
  })
})

describe('AuthPage — 表单交互', () => {
  it('UTC-AC-005 空表单提交显示字段校验错误', () => {
    setUnauth()
    const { container } = renderAuth()
    fireEvent.submit(getForm(container))
    expect(screen.getByText('请输入用户名')).toBeInTheDocument()
    expect(screen.getByText('请输入密码')).toBeInTheDocument()
  })

  it('UTC-AC-006 切换到注册模式显示新增字段', () => {
    setUnauth()
    renderAuth()
    fireEvent.click(screen.getByRole('button', { name: '注册新账户' }))
    expect(screen.getByText('显示名称')).toBeInTheDocument()
    expect(screen.getByText('邮箱')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '注册' })).toBeInTheDocument()
  })

  it('UTC-AC-007 注册模式校验邮箱格式', () => {
    setUnauth()
    const { container } = renderAuth()
    fireEvent.click(screen.getByRole('button', { name: '注册新账户' }))
    fireEvent.change(screen.getByPlaceholderText('您的显示名称'), { target: { value: '新用户' } })
    fireEvent.change(screen.getByPlaceholderText('your_username'), { target: { value: 'newbie' } })
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'badmail' },
    })
    fireEvent.change(screen.getByPlaceholderText('至少 6 位'), { target: { value: 'secret1' } })
    fireEvent.submit(getForm(container))
    expect(screen.getByText('邮箱格式不正确')).toBeInTheDocument()
  })

  it('UTC-AC-017 注册模式校验必填项与弱密码', () => {
    setUnauth()
    const { container } = renderAuth()
    fireEvent.click(screen.getByRole('button', { name: '注册新账户' }))
    fireEvent.change(screen.getByPlaceholderText('your_username'), { target: { value: 'newbie' } })
    fireEvent.change(screen.getByPlaceholderText('至少 6 位'), { target: { value: 'secret1' } })
    // displayName 与 email 留空
    fireEvent.submit(getForm(container))
    expect(screen.getByText('请输入显示名称')).toBeInTheDocument()
    expect(screen.getByText('请输入邮箱')).toBeInTheDocument()

    // 补全 email,但密码过短
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'new@test.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('至少 6 位'), { target: { value: '123' } })
    fireEvent.submit(getForm(container))
    expect(screen.getByText('密码至少 6 位')).toBeInTheDocument()
  })

  it('UTC-AC-008 密码可见性切换', () => {
    setUnauth()
    renderAuth()
    const pwd = screen.getByPlaceholderText('••••••••')
    expect(pwd).toHaveAttribute('type', 'password')
    const eye = pwd.parentElement?.querySelector('button')
    fireEvent.click(eye as HTMLButtonElement)
    expect(screen.getByPlaceholderText('••••••••')).toHaveAttribute('type', 'text')
  })

  it('UTC-AC-009 记住我复选框可切换', () => {
    setUnauth()
    const { container } = renderAuth()
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement
    expect(checkbox.checked).toBe(true)
    fireEvent.click(checkbox)
    expect(checkbox.checked).toBe(false)
  })

  it('UTC-AC-010 语言切换至英文', async () => {
    setUnauth()
    renderAuth()
    fireEvent.click(screen.getByRole('button', { name: '🇺🇸 English' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument())
  })
})

describe('AuthPage — 本地认证流程', () => {
  it('UTC-AC-011 admin 演示账户登录成功', async () => {
    setUnauth()
    const { container } = renderAuth()
    fireEvent.change(screen.getByPlaceholderText('admin 或 admin@yyc3.local'), {
      target: { value: 'admin' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'admin123' } })
    fireEvent.submit(getForm(container))
    await waitFor(() => expect(useAuthStore.getState().status).toBe('authenticated'))
    expect(useAuthStore.getState().user?.username).toBe('admin')
    expect(useAuthStore.getState().user?.role).toBe('admin')
    expect(useAuthStore.getState().token).toBeTruthy()
  })

  it('UTC-AC-012 不存在的用户登录失败并显示错误', async () => {
    setUnauth()
    const { container } = renderAuth()
    fireEvent.change(screen.getByPlaceholderText('admin 或 admin@yyc3.local'), {
      target: { value: 'nobody' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'x' } })
    fireEvent.submit(getForm(container))
    await waitFor(() => expect(screen.getByText('用户不存在 / User not found')).toBeInTheDocument())
  })

  it('UTC-AC-013 登录抛错时显示网络错误', async () => {
    setUnauth({ login: vi.fn().mockRejectedValue(new Error('boom')) })
    const { container } = renderAuth()
    fireEvent.change(screen.getByPlaceholderText('admin 或 admin@yyc3.local'), {
      target: { value: 'someone' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'secret1' } })
    fireEvent.submit(getForm(container))
    await waitFor(() => expect(screen.getByText('网络错误，请重试')).toBeInTheDocument())
  })

  it('UTC-AC-014 新用户注册成功', async () => {
    setUnauth()
    const { container } = renderAuth()
    fireEvent.click(screen.getByRole('button', { name: '注册新账户' }))
    fireEvent.change(screen.getByPlaceholderText('您的显示名称'), { target: { value: '新用户' } })
    fireEvent.change(screen.getByPlaceholderText('your_username'), { target: { value: 'newuser' } })
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'new@test.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('至少 6 位'), { target: { value: 'secret1' } })
    fireEvent.submit(getForm(container))
    await waitFor(() => expect(useAuthStore.getState().status).toBe('authenticated'))
    expect(useAuthStore.getState().user?.username).toBe('newuser')
  })

  it('UTC-AC-015 注册失败时显示服务端返回错误', async () => {
    setUnauth({ register: vi.fn().mockResolvedValue({ success: false, error: '注册被拒绝' }) })
    const { container } = renderAuth()
    fireEvent.click(screen.getByRole('button', { name: '注册新账户' }))
    fireEvent.change(screen.getByPlaceholderText('您的显示名称'), { target: { value: '新用户' } })
    fireEvent.change(screen.getByPlaceholderText('your_username'), { target: { value: 'newbie' } })
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'a@b.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('至少 6 位'), { target: { value: 'secret1' } })
    fireEvent.submit(getForm(container))
    await waitFor(() => expect(screen.getByText('注册被拒绝')).toBeInTheDocument())
  })
})

describe('unifiedLogout — 本地模式', () => {
  it('UTC-AC-016 本地模式仅清理演示状态', async () => {
    useAuthStore.setState({
      status: 'authenticated',
      token: 'tok',
      user: {
        id: 'u1',
        username: 'admin',
        email: 'admin@yyc3.local',
        role: 'admin',
        displayName: 'Administrator',
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
      },
    })

    await unifiedLogout()

    expect(useAuthStore.getState().status).toBe('unauthenticated')
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().token).toBeNull()
  })
})
