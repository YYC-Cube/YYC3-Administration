/**
 * Unit Tests: DemoEnvironmentBanner(F-02 演示环境声明)
 *
 * 覆盖:
 * - Supabase 未配置(演示模式)时渲染警示,含中英文风险提示
 * - 关闭按钮隐藏横幅并写入 sessionStorage
 * - Supabase 已配置(真实后端)时不渲染
 * - 可见时为 body 设置 padding-top,关闭/卸载时还原
 */

import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({
  configured: false,
}))

vi.mock('@/lib/supabase-client', () => ({
  get isSupabaseConfigured() {
    return h.configured
  },
  supabase: null,
}))

// jsdom 不支持 ResizeObserver,打桩(横幅用它测量自身高度)
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', ResizeObserverStub)

import { DemoEnvironmentBanner } from '@/app/components/demo-environment-banner'
import { I18nProvider } from '@/app/components/i18n-context'

beforeEach(() => {
  h.configured = false
  sessionStorage.clear()
  document.body.style.paddingTop = ''
})

afterEach(() => {
  document.body.style.paddingTop = ''
})

describe('DemoEnvironmentBanner', () => {
  it('Supabase 未配置:渲染含中英文风险提示的警示横幅', () => {
    render(
      <I18nProvider>
        <DemoEnvironmentBanner />
      </I18nProvider>,
    )

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(/演示环境/)
    expect(alert).toHaveTextContent(/Demo Environment/)
    expect(alert).toHaveTextContent(/请勿输入真实的账号、密码或 API 密钥/)
    expect(alert).toHaveTextContent(/Do not enter real credentials or API keys/)
    // 提供关闭按钮
    expect(screen.getByLabelText(/关闭演示环境提示/)).toBeInTheDocument()
  })

  it('点击关闭:横幅消失且 sessionStorage 记录,body padding-top 还原', () => {
    render(
      <I18nProvider>
        <DemoEnvironmentBanner />
      </I18nProvider>,
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()

    // 横幅可见时为 body 设置了 padding-top(占位防遮挡)
    expect(document.body.style.paddingTop).not.toBe('')

    fireEvent.click(screen.getByLabelText(/关闭演示环境提示/))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(sessionStorage.getItem('yyc3_demo_banner_dismissed')).toBe('1')
    expect(document.body.style.paddingTop).toBe('')
  })

  it('sessionStorage 已记录关闭:初始即不渲染', () => {
    sessionStorage.setItem('yyc3_demo_banner_dismissed', '1')
    render(
      <I18nProvider>
        <DemoEnvironmentBanner />
      </I18nProvider>,
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('Supabase 已配置(真实后端模式):不渲染演示警示', () => {
    h.configured = true
    render(
      <I18nProvider>
        <DemoEnvironmentBanner />
      </I18nProvider>,
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
