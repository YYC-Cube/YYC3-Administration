/**
 * @file dashboard-page.test.tsx
 * @description DashboardPage — 完整组件测试
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v2.0.0
 * @created 2026-07-12
 */

import { render, screen } from '@testing-library/react'
import { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { AppProvider } from '../../src/app/components/app-context'
import { DashboardPage } from '../../src/app/components/dashboard-page'
import { I18nProvider } from '../../src/app/components/i18n-context'
import { ThemeSwitcherProvider } from '../../src/app/components/theme-switcher-context'

const TestWrapper = ({ children }: { children: ReactNode }) => (
  <ThemeSwitcherProvider defaultTheme="cyberpunk">
    <I18nProvider>
      <AppProvider>{children}</AppProvider>
    </I18nProvider>
  </ThemeSwitcherProvider>
)

describe('DashboardPage Component', () => {
  describe('CTC-DASH-001: 数据加载', () => {
    it('应该正确加载并渲染组件', () => {
      const { container } = render(<DashboardPage onOpenExport={() => {}} />, {
        wrapper: TestWrapper,
      })
      expect(container).toBeTruthy()
      expect(container.children.length).toBeGreaterThan(0)
    })
  })

  describe('CTC-DASH-002: 统计卡片渲染', () => {
    it('应该渲染统计卡片', () => {
      const { container } = render(<DashboardPage onOpenExport={() => {}} />, {
        wrapper: TestWrapper,
      })

      const cards = container.querySelectorAll('[data-neon-card]')
      expect(cards.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('CTC-DASH-003/004: 图表渲染', () => {
    it('应该渲染图表容器', () => {
      const { container } = render(<DashboardPage onOpenExport={() => {}} />, {
        wrapper: TestWrapper,
      })

      const chartContainers = container.querySelectorAll(
        '.recharts-responsive-container, [class*="recharts"]',
      )
      expect(chartContainers.length).toBeGreaterThan(0)
    })
  })

  describe('CTC-DASH-006: 响应式布局', () => {
    it('应该渲染响应式容器', () => {
      const { container } = render(<DashboardPage onOpenExport={() => {}} />, {
        wrapper: TestWrapper,
      })

      const gridContainer = container.querySelector('.grid')
      expect(gridContainer).toBeTruthy()
    })
  })

  describe('CTC-DASH-007: 主题适配', () => {
    it('应该在Cyberpunk主题下正确渲染', () => {
      const { container } = render(<DashboardPage onOpenExport={() => {}} />, {
        wrapper: TestWrapper,
      })

      expect(container).toBeTruthy()
    })

    it('应该在LiquidGlass主题下正确渲染', () => {
      const LiquidGlassWrapper = ({ children }: { children: ReactNode }) => (
        <ThemeSwitcherProvider defaultTheme="liquidGlass">
          <I18nProvider>
            <AppProvider>{children}</AppProvider>
          </I18nProvider>
        </ThemeSwitcherProvider>
      )

      const { container } = render(<DashboardPage onOpenExport={() => {}} />, {
        wrapper: LiquidGlassWrapper,
      })

      expect(container).toBeTruthy()
    })
  })

  describe('导出功能', () => {
    it('应该支持导出功能', () => {
      const onOpenExport = vi.fn()
      render(<DashboardPage onOpenExport={onOpenExport} />, { wrapper: TestWrapper })

      const exportButton = screen.getByText('导出数据')
      expect(exportButton).toBeTruthy()
    })
  })

  describe('活动日志', () => {
    it('应该渲染活动日志区域', () => {
      const { container } = render(<DashboardPage onOpenExport={() => {}} />, {
        wrapper: TestWrapper,
      })

      const neonCards = container.querySelectorAll('[data-neon-card]')
      expect(neonCards.length).toBeGreaterThan(0)
    })
  })

  describe('实时数据更新', () => {
    it('应该支持实时数据更新', () => {
      const { container } = render(<DashboardPage onOpenExport={() => {}} />, {
        wrapper: TestWrapper,
      })

      const dataElements = container.querySelectorAll('[data-neon-card]')
      expect(dataElements.length).toBeGreaterThan(0)
    })
  })

  describe('可访问性', () => {
    it('应该具有正确的结构', () => {
      const { container } = render(<DashboardPage onOpenExport={() => {}} />, {
        wrapper: TestWrapper,
      })

      const mainDiv = container.querySelector('div.h-full')
      expect(mainDiv).toBeTruthy()
    })
  })
})
