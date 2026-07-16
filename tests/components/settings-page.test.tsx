/**
 * @file settings-page.test.tsx
 * @description Settings Page — Component Tests
 *   Covers: category navigation, search input, theme cards, language selector,
 *   quick action buttons, page title.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ThemeSwitcherProvider } from '../../src/app/components/theme-switcher-context'

import type { ReactNode } from 'react'

// In-memory "translations" for tests. The real zh.ts stg.* keys are unfilled (key = value),
// so we provide a proper dict so tests can assert against expected Chinese text.
const MOCK_MESSAGES: Record<string, string> = {
  'stg.systemSettings': '系统设置',
  'stg.pageDesc': '系统设置与个性化配置',
  'stg.searchPlaceholder': '搜索设置...',
  'stg.cat.general': '通用设置',
  'stg.cat.generalDesc': '通用设置描述',
  'stg.cat.account': '账号信息',
  'stg.cat.accountDesc': '账号信息描述',
  'stg.cat.agents': '智能体管理',
  'stg.cat.agentsDesc': '智能体管理描述',
  'stg.cat.models': '模型配置',
  'stg.cat.modelsDesc': '模型配置描述',
  'stg.exportConfig': '导出配置',
  'stg.importConfig': '导入配置',
  'stg.resetSettings': '重置设置',
  'stg.themeCyb': 'Cyberpunk',
  'stg.themeLq': 'Liquid Glass',
  'stg.themeDesc': '选择主题风格',
  'stg.cyberpunkDesc': '赛博朋克风格',
  'stg.liquidGlassDesc': '液态玻璃风格',
  'stg.langZh': '简体中文',
}

// Mock the i18n-context module so the component tree gets resolved Chinese text.
vi.mock('../../src/app/components/i18n-context', () => ({
  I18nProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useI18n: () => ({
    t: (key: string) => MOCK_MESSAGES[key] ?? key,
    locale: 'zh',
    setLocale: vi.fn(),
    isZh: true,
    isEn: false,
    flags: {},
    labels: {},
  }),
}))

const TestWrapper = ({ children }: { children: ReactNode }) => (
  <ThemeSwitcherProvider defaultTheme="cyberpunk">{children}</ThemeSwitcherProvider>
)

describe('SettingsPage — Navigation Sidebar', () => {
  it('renders all category buttons in sidebar', async () => {
    const { SettingsPage } = await import('../../src/app/components/settings-page-standalone')
    render(<SettingsPage />, { wrapper: TestWrapper })

    // "通用设置" appears both in sidebar + heading, use getAllByText
    const general = screen.getAllByText('通用设置')
    expect(general.length).toBeGreaterThanOrEqual(1)

    // Other sidebar-only labels
    expect(screen.getByText('账号信息')).toBeTruthy()
    expect(screen.getByText('智能体管理')).toBeTruthy()
    expect(screen.getByText('模型配置')).toBeTruthy()
  })
})

describe('SettingsPage — Search Input', () => {
  it('renders search placeholder', async () => {
    const { SettingsPage } = await import('../../src/app/components/settings-page-standalone')
    render(<SettingsPage />, { wrapper: TestWrapper })

    expect(screen.getByPlaceholderText('搜索设置...')).toBeTruthy()
  })

  it('accepts typed search text', async () => {
    const { SettingsPage } = await import('../../src/app/components/settings-page-standalone')
    render(<SettingsPage />, { wrapper: TestWrapper })

    const input = screen.getByPlaceholderText('搜索设置...') as HTMLInputElement
    await userEvent.type(input, '主题')
    expect(input.value).toBe('主题')
  })
})

describe('SettingsPage — Theme Cards', () => {
  it('renders both theme option cards', async () => {
    const { SettingsPage } = await import('../../src/app/components/settings-page-standalone')
    render(<SettingsPage />, { wrapper: TestWrapper })

    expect(screen.getByText('Cyberpunk')).toBeTruthy()
    expect(screen.getByText('Liquid Glass')).toBeTruthy()
  })

  it('renders theme descriptions in Chinese', async () => {
    const { SettingsPage } = await import('../../src/app/components/settings-page-standalone')
    render(<SettingsPage />, { wrapper: TestWrapper })

    expect(screen.getByText('赛博朋克风格')).toBeTruthy()
    expect(screen.getByText('液态玻璃风格')).toBeTruthy()
  })
})

describe('SettingsPage — Language Selector', () => {
  it('shows Chinese as default language', async () => {
    const { SettingsPage } = await import('../../src/app/components/settings-page-standalone')
    render(<SettingsPage />, { wrapper: TestWrapper })

    expect(screen.getByText('简体中文')).toBeTruthy()
  })
})

describe('SettingsPage — Quick Action Buttons', () => {
  it('renders export/import/reset buttons', async () => {
    const { SettingsPage } = await import('../../src/app/components/settings-page-standalone')
    render(<SettingsPage />, { wrapper: TestWrapper })

    expect(screen.getByText('导出配置')).toBeTruthy()
    expect(screen.getByText('导入配置')).toBeTruthy()
    expect(screen.getByText('重置设置')).toBeTruthy()
  })
})

describe('SettingsPage — General Settings Content', () => {
  it('renders page title', async () => {
    const { SettingsPage } = await import('../../src/app/components/settings-page-standalone')
    render(<SettingsPage />, { wrapper: TestWrapper })

    expect(screen.getByText('系统设置')).toBeTruthy()
  })

  it('renders general settings section heading', async () => {
    const { SettingsPage } = await import('../../src/app/components/settings-page-standalone')
    render(<SettingsPage />, { wrapper: TestWrapper })

    // Default active tab is "通用设置" which shows the heading
    const headings = screen.getAllByText('通用设置')
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })
})
