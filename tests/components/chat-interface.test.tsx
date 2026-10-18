/**
 * @file chat-interface.test.tsx
 * @description ChatInterface — Smoke Tests
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 */

import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { ReactNode } from 'react'

import { AppProvider } from '@/app/components/app-context'
import { I18nProvider } from '@/app/components/i18n-context'
import { ThemeSwitcherProvider } from '@/app/components/theme-switcher-context'

const TestWrapper = ({ children }: { children: ReactNode }) => (
  <ThemeSwitcherProvider defaultTheme="cyberpunk">
    <I18nProvider>
      <AppProvider>{children}</AppProvider>
    </I18nProvider>
  </ThemeSwitcherProvider>
)

describe('ChatInterface — Smoke', () => {
  // 首个用例含动态 import + 完整 Provider 挂载，jsdom 下约 3–6s，显式放宽超时避免 CI 抖动
  it('renders without crashing', async () => {
    const { ChatInterface } = await import('@/features/conversation/pages/chat-interface')
    const { container } = render(<ChatInterface />, { wrapper: TestWrapper })
    expect(container).toBeTruthy()
  }, 15000)

  it('renders at least one element', async () => {
    const { ChatInterface } = await import('@/features/conversation/pages/chat-interface')
    const { container } = render(<ChatInterface />, { wrapper: TestWrapper })
    expect(container.children.length).toBeGreaterThan(0)
  })
})
