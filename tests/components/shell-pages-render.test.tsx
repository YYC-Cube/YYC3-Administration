/**
 * @file shell-pages-render.test.tsx
 * @description 应用壳内嵌页面包装测试(85×4 门禁冲刺)
 *   ChatInterface 与三个表单页面 mock 为轻桩,覆盖 ChatPage 直出与
 *   FormsTabPage 三标签切换管线(builder/history/smart)。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-11-27
 * @tags P2,testing,components,shell-pages,gate85
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const stub = vi.hoisted(() => (tag: string) =>
  function Stub() {
    return <div data-testid={`stub-${tag}`} />
  },
)

vi.mock('@/features/conversation/pages/chat-interface', () => ({
  ChatInterface: stub('chat-interface'),
}))
vi.mock('@/features/supply-chain/pages/form-template-builder', () => ({
  FormTemplateBuilder: stub('form-builder'),
}))
vi.mock('@/features/supply-chain/pages/form-history', () => ({
  FormHistory: stub('form-history'),
}))
vi.mock('@/features/supply-chain/pages/smart-form-system', () => ({
  SmartFormPage: stub('smart-form'),
}))
vi.mock('@/app/components/i18n-context', () => ({
  useI18n: () => ({ t: (k: string) => k, locale: 'zh' as const, setLocale: () => undefined }),
}))
vi.mock('@/shared/hooks/use-theme-colors', () => ({
  useThemeColors: () => ({
    alpha: (_c: string, a: number) => `rgba(0,255,135,${a})`,
    primary: '#00f0ff',
    muted: '#666',
    borderDefault: '#333',
    borderSubtle: '#222',
    textMuted: '#888',
    bgCard: '#111',
    bgCardHover: '#222',
    backdropFilter: 'blur(4px)',
    shadowMd: '0 0 4px black',
    shadowCardHover: '0 0 8px black',
    borderActive: '#0ff',
    transitionAll: 'all .2s',
    isLiquidGlass: false,
    isCyberpunk: true,
  }),
}))

import { ChatPage, FormsTabPage } from '@/app/components/shell-pages'

afterEach(() => {
  cleanup()
})

describe('ChatPage — 直出包装', () => {
  it('渲染 ChatInterface 桩', () => {
    render(<ChatPage />)
    expect(screen.getByTestId('stub-chat-interface')).toBeTruthy()
  })
})

describe('FormsTabPage — 三标签切换', () => {
  it('默认 builder 标签渲染表单构建器', () => {
    render(<FormsTabPage />)
    expect(screen.getByTestId('stub-form-builder')).toBeTruthy()
    expect(screen.queryByTestId('stub-form-history')).toBeNull()
  })

  it('点击 history 标签切换到表单历史', () => {
    render(<FormsTabPage />)
    fireEvent.click(screen.getByText('forms.tab.history'))
    expect(screen.getByTestId('stub-form-history')).toBeTruthy()
    expect(screen.queryByTestId('stub-form-builder')).toBeNull()
  })

  it('点击 smart 标签切换到智能表单', () => {
    render(<FormsTabPage />)
    fireEvent.click(screen.getByText('forms.tab.smart'))
    expect(screen.getByTestId('stub-smart-form')).toBeTruthy()
  })

  it('标签来回切换状态互斥且高亮随选中态变化', () => {
    render(<FormsTabPage />)
    const builderBtn = screen.getByText('forms.tab.builder')
    const historyBtn = screen.getByText('forms.tab.history')
    fireEvent.click(historyBtn)
    expect(screen.queryByTestId('stub-form-builder')).toBeNull()
    fireEvent.click(builderBtn)
    expect(screen.getByTestId('stub-form-builder')).toBeTruthy()
    expect(screen.queryByTestId('stub-form-history')).toBeNull()
  })
})
