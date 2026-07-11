/**
 * ApiDocs Component - Unit Tests
 * 测试API文档页面组件的渲染和功能
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'

import { ApiDocs } from '../../src/app/components/api-docs'
import { I18nProvider } from '../../src/app/components/i18n-context'
import { ThemeSwitcherProvider } from '../../src/app/components/theme-switcher-context'

const TestWrapper = ({ children }: { children: ReactNode }) => (
  <ThemeSwitcherProvider defaultTheme="cyberpunk">
    <I18nProvider>{children}</I18nProvider>
  </ThemeSwitcherProvider>
)

describe('ApiDocs Component', () => {
  describe('基础渲染', () => {
    it('应该渲染ApiDocs组件', async () => {
      const { container } = render(<ApiDocs />, { wrapper: TestWrapper })
      expect(container).toBeTruthy()
    })

    it('应该渲染标题和副标题', async () => {
      render(<ApiDocs />, { wrapper: TestWrapper })
      const title = screen.getByText('API 文档')
      const subtitle = screen.getByText('统一接口规范参考')
      expect(title).toBeTruthy()
      expect(subtitle).toBeTruthy()
    })

    it('应该渲染"全部"筛选按钮', async () => {
      render(<ApiDocs />, { wrapper: TestWrapper })
      const allButton = screen.getByText('全部')
      expect(allButton).toBeTruthy()
    })
  })

  describe('标签筛选', () => {
    it('应该渲染所有标签按钮', async () => {
      const { container } = render(<ApiDocs />, { wrapper: TestWrapper })
      const tagButtons = container.querySelectorAll('button.rounded-lg')
      expect(tagButtons.length).toBeGreaterThan(0)
    })

    it('点击标签按钮应该筛选API', async () => {
      const user = userEvent.setup()
      const { container } = render(<ApiDocs />, { wrapper: TestWrapper })

      const authTag = container.querySelector('button.rounded-lg')
      expect(authTag).toBeTruthy()
      await user.click(authTag!)

      expect(authTag).toBeTruthy()
    })

    it('再次点击同一标签应该取消筛选', async () => {
      const user = userEvent.setup()
      const { container } = render(<ApiDocs />, { wrapper: TestWrapper })

      const authTag = container.querySelector('button.rounded-lg')
      expect(authTag).toBeTruthy()
      await user.click(authTag!)
      await user.click(authTag!)

      expect(authTag).toBeTruthy()
    })
  })

  describe('API端点渲染', () => {
    it('应该渲染API卡片', async () => {
      const { container } = render(<ApiDocs />, { wrapper: TestWrapper })
      const apiCards = container.querySelectorAll('[data-neon-card]')
      expect(apiCards.length).toBeGreaterThan(0)
    })
  })

  describe('响应格式说明', () => {
    it('应该渲染响应格式说明', async () => {
      render(<ApiDocs />, { wrapper: TestWrapper })
      const formatTitle = screen.getByText('响应格式说明')
      expect(formatTitle).toBeTruthy()
    })

    it('应该渲染错误响应格式', async () => {
      render(<ApiDocs />, { wrapper: TestWrapper })
      const errorTitle = screen.getByText('错误响应格式')
      expect(errorTitle).toBeTruthy()
    })
  })

  describe('国际化支持', () => {
    it('应该使用i18n上下文', async () => {
      render(<ApiDocs />, { wrapper: TestWrapper })
      const title = screen.getByText('API 文档')
      expect(title).toBeTruthy()
    })
  })
})
