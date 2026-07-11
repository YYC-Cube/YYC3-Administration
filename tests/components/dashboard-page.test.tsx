/**
 * @file dashboard-page.test.tsx
 * @description DashboardPage — Smoke Tests
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 */

import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AppProvider } from '../../src/app/components/app-context'
import { I18nProvider } from '../../src/app/components/i18n-context'
import { ThemeSwitcherProvider } from '../../src/app/components/theme-switcher-context'

import type { ReactNode } from 'react'

const TestWrapper = ({ children }: { children: ReactNode }) => (
  <ThemeSwitcherProvider defaultTheme="cyberpunk">
    <I18nProvider>
      <AppProvider>{children}</AppProvider>
    </I18nProvider>
  </ThemeSwitcherProvider>
)

describe('DashboardPage — Smoke', () => {
  it('renders without crashing', async () => {
    const { DashboardPage } = await import('../../src/app/components/dashboard-page')
    const { container } = render(<DashboardPage onOpenExport={() => {}} />, {
      wrapper: TestWrapper,
    })
    expect(container).toBeTruthy()
  })

  it('renders at least one child element', async () => {
    const { DashboardPage } = await import('../../src/app/components/dashboard-page')
    const { container } = render(<DashboardPage onOpenExport={() => {}} />, {
      wrapper: TestWrapper,
    })
    expect(container.children.length).toBeGreaterThan(0)
  })
})
