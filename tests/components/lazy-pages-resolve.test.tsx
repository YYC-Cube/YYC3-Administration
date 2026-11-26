/**
 * @file lazy-pages-resolve.test.tsx
 * @description 懒加载页面全量解析测试(85×4 门禁冲刺)
 *   既有 lazy-pages.test.tsx 只覆盖注册表判定与 null 早退;本文件将
 *   全部 37 个页面模块 mock 为轻桩并真实渲染,驱动全部 React.lazy
 *   import() thunk 与 default 提取回调(此前为覆盖盲区:77 个未覆盖函数)。
 *   页面实现本身由 E2E/页面级单测守护,此处只验证注册表装载管线。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-11-27
 * @tags P2,testing,components,lazy-loading,gate85
 */

import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest'

// 页面桩:渲染带 data-testid 标记的空 div,证明 lazy 解析已完成
const pageStubs = vi.hoisted(() => {
  const elementFor = (tag: string) => ({
    $$typeof: Symbol.for('react.element'),
    type: 'div',
    key: null,
    ref: null,
    props: { 'data-testid': `lazy-resolved-${tag}` },
    _owner: null,
  })
  const stubFor = (tag: string) => function Stub() {
    return elementFor(tag)
  }
  return { stubFor }
})

// ── 37 个页面模块全部桩化(与 lazy-pages.tsx 的 import() 一一对应)──
vi.mock('@/features/customer/pages/clm-page', () => ({ CLMPage: pageStubs.stubFor('CLMPage') }))
vi.mock('@/features/supply-chain/pages/smart-form-system', () => ({ SmartFormPage: pageStubs.stubFor('SmartFormPage') }))
vi.mock('@/features/toolkit/pages/ai-call-page', () => ({ AICallPage: pageStubs.stubFor('AICallPage') }))
vi.mock('@/features/customer/pages/customer-care-page', () => ({ CustomerCarePage: pageStubs.stubFor('CustomerCarePage') }))
vi.mock('@/features/customer/pages/number-database', () => ({ NumberDatabasePage: pageStubs.stubFor('NumberDatabasePage') }))
vi.mock('@/features/toolkit/pages/ai-tools-page', () => ({ AIToolsPage: pageStubs.stubFor('AIToolsPage') }))
vi.mock('@/features/toolkit/pages/workflow-page', () => ({ WorkflowPage: pageStubs.stubFor('WorkflowPage') }))
vi.mock('@/features/overview/pages/activity-log', () => ({ ActivityLogPage: pageStubs.stubFor('ActivityLogPage') }))
vi.mock('@/features/toolkit/pages/collab-creation-page', () => ({ CollabCreationPage: pageStubs.stubFor('CollabCreationPage') }))
vi.mock('@/features/overview/pages/insights-enhanced', () => ({ InsightsEnhancedPage: pageStubs.stubFor('InsightsEnhancedPage') }))
vi.mock('@/features/toolkit/pages/quick-actions-page', () => ({ QuickActionsPage: pageStubs.stubFor('QuickActionsPage') }))
vi.mock('@/features/toolkit/pages/task-board-page', () => ({ TaskBoardPage: pageStubs.stubFor('TaskBoardPage') }))
vi.mock('@/features/dev-workspace/left-panel-page', () => ({ LeftPanelPage: pageStubs.stubFor('LeftPanelPage') }))
vi.mock('@/features/finance/pages/finance-page', () => ({ FinancePage: pageStubs.stubFor('FinancePage') }))
vi.mock('@/features/finance/pages/salary-page', () => ({ SalaryPage: pageStubs.stubFor('SalaryPage') }))
vi.mock('@/features/platform/pages/parameter-settings-page', () => ({ ParameterSettingsPage: pageStubs.stubFor('ParameterSettingsPage') }))
vi.mock('@/features/platform/pages/platform-settings-page', () => ({ PlatformSettingsPage: pageStubs.stubFor('PlatformSettingsPage') }))
vi.mock('@/features/platform/pages/wechat-config-page', () => ({ WechatConfigPage: pageStubs.stubFor('WechatConfigPage') }))
vi.mock('@/features/platform/pages/channel-center-page', () => ({ ChannelCenterPage: pageStubs.stubFor('ChannelCenterPage') }))
vi.mock('@/features/platform/pages/data-integration-page', () => ({ DataIntegrationPage: pageStubs.stubFor('DataIntegrationPage') }))
vi.mock('@/features/marketing/pages/marketing-strategy-page', () => ({ MarketingStrategyPage: pageStubs.stubFor('MarketingStrategyPage') }))
vi.mock('@/features/marketing/pages/campaign-execution-page', () => ({ CampaignExecutionPage: pageStubs.stubFor('CampaignExecutionPage') }))
vi.mock('@/features/marketing/pages/marketing-analytics-page', () => ({ MarketingAnalyticsPage: pageStubs.stubFor('MarketingAnalyticsPage') }))
vi.mock('@/features/marketing/pages/marketing-assets-page', () => ({ MarketingAssetsPage: pageStubs.stubFor('MarketingAssetsPage') }))
vi.mock('@/features/customer/pages/customer-acquisition-page', () => ({ CustomerAcquisitionPage: pageStubs.stubFor('CustomerAcquisitionPage') }))
vi.mock('@/features/customer/pages/brand-management-page', () => ({ BrandManagementPage: pageStubs.stubFor('BrandManagementPage') }))
vi.mock('@/features/platform/pages/smart-operations-page', () => ({ SmartOperationsPage: pageStubs.stubFor('SmartOperationsPage') }))
vi.mock('@/features/platform/pages/platform-integration-page', () => ({ PlatformIntegrationPage: pageStubs.stubFor('PlatformIntegrationPage') }))
vi.mock('@/features/marketing/pages/smart-creation-page', () => ({ SmartCreationPage: pageStubs.stubFor('SmartCreationPage') }))
vi.mock('@/features/marketing/pages/smart-marketing-engine-page', () => ({ SmartMarketingEnginePage: pageStubs.stubFor('SmartMarketingEnginePage') }))
vi.mock('@/features/marketing/pages/app-overview-page', () => ({ AppOverviewPage: pageStubs.stubFor('AppOverviewPage') }))
vi.mock('@/features/marketing/pages/decision-support-page', () => ({ DecisionSupportPage: pageStubs.stubFor('DecisionSupportPage') }))
vi.mock('@/features/marketing/pages/nlp-processing-page', () => ({ NLPProcessingPage: pageStubs.stubFor('NLPProcessingPage') }))
vi.mock('@/features/supply-chain/pages/procurement-page', () => ({ ProcurementPage: pageStubs.stubFor('ProcurementPage') }))
vi.mock('@/features/supply-chain/pages/inventory-page', () => ({ InventoryPage: pageStubs.stubFor('InventoryPage') }))
vi.mock('@/features/overview/pages/dashboard-page', () => ({ DashboardPage: pageStubs.stubFor('DashboardPage') }))
vi.mock('@/app/components/shell-pages', () => ({
  ChatPage: pageStubs.stubFor('ChatPage'),
  FormsTabPage: pageStubs.stubFor('FormsTabPage'),
}))
// PageLoadingFallback 依赖 i18n;挂载瞬间可能短暂渲染 fallback,桩化避免 Provider 要求
vi.mock('@/app/components/i18n-context', () => ({
  useI18n: () => ({ t: (k: string) => k, locale: 'zh' as const, setLocale: () => undefined }),
}))

import type { PageId } from '@/app/components/app-context'

import { renderLazyPage } from '@/app/components/lazy-pages'

const REGISTRY_IDS: PageId[] = [
  'clm', 'smartForm', 'aicall', 'customerCare', 'contacts',
  'tools', 'workflow', 'logs', 'collab', 'insights',
  'quickActions', 'taskBoard', 'devWorkspace', 'finance', 'salary',
  'paramSettings', 'platformSettings', 'wechatConfig', 'channelCenter', 'dataIntegration',
  'marketingPlan', 'promotionExec', 'marketingAnalytics', 'marketingAssets', 'customerAcquisition',
  'brandMgmt', 'intelligentOps', 'platformHub', 'aiCreativeTools', 'aiMarketingEngine',
  'appOverview', 'aiDecisionSupport', 'nlpProcessing', 'procurement', 'inventory',
  'dashboard', 'chat', 'forms',
]

/** 每个 pageId 期望解析出的桩标记 */
const EXPECTED_TESTID: Record<string, string> = {
  clm: 'lazy-resolved-CLMPage',
  smartForm: 'lazy-resolved-SmartFormPage',
  aicall: 'lazy-resolved-AICallPage',
  customerCare: 'lazy-resolved-CustomerCarePage',
  contacts: 'lazy-resolved-NumberDatabasePage',
  tools: 'lazy-resolved-AIToolsPage',
  workflow: 'lazy-resolved-WorkflowPage',
  logs: 'lazy-resolved-ActivityLogPage',
  collab: 'lazy-resolved-CollabCreationPage',
  insights: 'lazy-resolved-InsightsEnhancedPage',
  quickActions: 'lazy-resolved-QuickActionsPage',
  taskBoard: 'lazy-resolved-TaskBoardPage',
  devWorkspace: 'lazy-resolved-LeftPanelPage',
  finance: 'lazy-resolved-FinancePage',
  salary: 'lazy-resolved-SalaryPage',
  paramSettings: 'lazy-resolved-ParameterSettingsPage',
  platformSettings: 'lazy-resolved-PlatformSettingsPage',
  wechatConfig: 'lazy-resolved-WechatConfigPage',
  channelCenter: 'lazy-resolved-ChannelCenterPage',
  dataIntegration: 'lazy-resolved-DataIntegrationPage',
  marketingPlan: 'lazy-resolved-MarketingStrategyPage',
  promotionExec: 'lazy-resolved-CampaignExecutionPage',
  marketingAnalytics: 'lazy-resolved-MarketingAnalyticsPage',
  marketingAssets: 'lazy-resolved-MarketingAssetsPage',
  customerAcquisition: 'lazy-resolved-CustomerAcquisitionPage',
  brandMgmt: 'lazy-resolved-BrandManagementPage',
  intelligentOps: 'lazy-resolved-SmartOperationsPage',
  platformHub: 'lazy-resolved-PlatformIntegrationPage',
  aiCreativeTools: 'lazy-resolved-SmartCreationPage',
  aiMarketingEngine: 'lazy-resolved-SmartMarketingEnginePage',
  appOverview: 'lazy-resolved-AppOverviewPage',
  aiDecisionSupport: 'lazy-resolved-DecisionSupportPage',
  nlpProcessing: 'lazy-resolved-NLPProcessingPage',
  procurement: 'lazy-resolved-ProcurementPage',
  inventory: 'lazy-resolved-InventoryPage',
  dashboard: 'lazy-resolved-DashboardPage',
  chat: 'lazy-resolved-ChatPage',
  forms: 'lazy-resolved-FormsTabPage',
}

afterEach(() => {
  cleanup()
})

afterAll(() => {
  vi.restoreAllMocks()
})

describe('renderLazyPage — 全注册表懒解析(85×4 冲刺:import thunk 全覆盖)', () => {
  it('38 个注册页全部经 lazy 管线解析为桩组件', async () => {
    for (const id of REGISTRY_IDS) {
      const { unmount } = render(renderLazyPage(id) as React.ReactElement)
      const testid = EXPECTED_TESTID[id]
      // lazy import() 为微任务链;waitFor 轮询直至桩标记出现
      await waitFor(
        () => {
          expect(screen.getByTestId(testid)).toBeTruthy()
        },
        { timeout: 3000, interval: 10 },
      )
      unmount()
    }
  }, 60000)

  it('批量并发渲染多个页面注册项均能解析(注册表共享安全)', async () => {
    const sample: PageId[] = ['dashboard', 'chat', 'forms', 'clm', 'inventory']
    const { unmount } = render(
      <div>
        {sample.map((id) => (
          <div key={id} data-testid={`slot-${id}`}>
            {renderLazyPage(id)}
          </div>
        ))}
      </div>,
    )
    for (const id of sample) {
      await waitFor(
        () => {
          expect(screen.getByTestId(EXPECTED_TESTID[id])).toBeTruthy()
        },
        { timeout: 3000, interval: 10 },
      )
    }
    unmount()
  }, 15000)
})
