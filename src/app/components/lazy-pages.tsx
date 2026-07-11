/* eslint-disable react-refresh/only-export-components */
/**
 * @file lazy-pages.tsx
 * @description YYC³ Lazy-loaded page components for code splitting.
 *   Wraps non-critical pages with React.lazy + Suspense to reduce initial bundle size.
 *   Core pages (Dashboard, Chat, Settings) remain eagerly loaded for instant first render.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 * @tags performance,code-splitting,lazy-loading
 */

import { Loader2 } from 'lucide-react'
import { type ComponentType, lazy, Suspense } from 'react'

import { ErrorBoundary } from './error-boundary'

import type { PageId } from './app-context'

// ==========================================
// Loading Placeholder
// ==========================================

function PageLoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        <p className="text-sm text-white/40">加载中...</p>
      </div>
    </div>
  )
}

// ==========================================
// Lazy Page Definitions
// ==========================================

// Core pages — eagerly loaded (imported directly in cyberpunk-standalone.tsx)
// Non-core pages — lazy loaded below

const LazyCLMPage = lazy(() =>
  import('./contact-book').then((m) => ({ default: m.ContactBookPage })),
)
const LazyAICallPage = lazy(() =>
  import('./customer-care-page').then((m) => ({ default: m.CustomerCarePage })),
)
const LazyCustomerCarePage = lazy(() =>
  import('./customer-care-page').then((m) => ({ default: m.CustomerCarePage })),
)
const LazyNumberDatabasePage = lazy(() =>
  import('./number-database').then((m) => ({ default: m.NumberDatabasePage })),
)
const LazyFormsTabPage = lazy(() =>
  import('./smart-form-system').then((m) => ({ default: m.SmartFormPage })),
)
const LazyAIToolsPage = lazy(() =>
  import('./ai-tools-page').then((m) => ({ default: m.AIToolsPage })),
)
const LazyWorkflowPage = lazy(() =>
  import('./campaign-execution-page').then((m) => ({ default: m.CampaignExecutionPage })),
)
const LazyActivityLogPage = lazy(() =>
  import('./activity-log').then((m) => ({ default: m.ActivityLogPage })),
)
const LazyCollabCreationPage = lazy(() =>
  import('./collab-creation-page').then((m) => ({ default: m.CollabCreationPage })),
)
const LazyInsightsEnhancedPage = lazy(() =>
  import('./insights-enhanced').then((m) => ({ default: m.InsightsEnhancedPage })),
)
const LazyQuickActionsPage = lazy(() =>
  import('./quick-actions-page').then((m) => ({ default: m.QuickActionsPage })),
)
const LazyTaskBoardPage = lazy(() =>
  import('./task-board-page').then((m) => ({ default: m.TaskBoardPage })),
)
const LazyLeftPanelPage = lazy(() =>
  import('./left-panel-page').then((m) => ({ default: m.LeftPanelPage })),
)
const LazyFinancePage = lazy(() =>
  import('./finance-page').then((m) => ({ default: m.FinancePage })),
)
const LazySalaryPage = lazy(() => import('./salary-page').then((m) => ({ default: m.SalaryPage })))

// Platform Integration
const LazyParameterSettingsPage = lazy(() =>
  import('./parameter-settings-page').then((m) => ({ default: m.ParameterSettingsPage })),
)
const LazyPlatformSettingsPage = lazy(() =>
  import('./platform-settings-page').then((m) => ({ default: m.PlatformSettingsPage })),
)
const LazyWechatConfigPage = lazy(() =>
  import('./wechat-config-page').then((m) => ({ default: m.WechatConfigPage })),
)
const LazyChannelCenterPage = lazy(() =>
  import('./channel-center-page').then((m) => ({ default: m.ChannelCenterPage })),
)
const LazyDataIntegrationPage = lazy(() =>
  import('./data-integration-page').then((m) => ({ default: m.DataIntegrationPage })),
)

// AI Marketing
const LazyMarketingStrategyPage = lazy(() =>
  import('./marketing-strategy-page').then((m) => ({ default: m.MarketingStrategyPage })),
)
const LazyCampaignExecutionPage = lazy(() =>
  import('./campaign-execution-page').then((m) => ({ default: m.CampaignExecutionPage })),
)
const LazyMarketingAnalyticsPage = lazy(() =>
  import('./marketing-analytics-page').then((m) => ({ default: m.MarketingAnalyticsPage })),
)
const LazyMarketingAssetsPage = lazy(() =>
  import('./marketing-assets-page').then((m) => ({ default: m.MarketingAssetsPage })),
)
const LazyCustomerAcquisitionPage = lazy(() =>
  import('./customer-acquisition-page').then((m) => ({ default: m.CustomerAcquisitionPage })),
)
const LazyBrandManagementPage = lazy(() =>
  import('./brand-management-page').then((m) => ({ default: m.BrandManagementPage })),
)
const LazySmartOperationsPage = lazy(() =>
  import('./smart-operations-page').then((m) => ({ default: m.SmartOperationsPage })),
)
const LazyPlatformIntegrationPage = lazy(() =>
  import('./platform-integration-page').then((m) => ({ default: m.PlatformIntegrationPage })),
)
const LazySmartCreationPage = lazy(() =>
  import('./smart-creation-page').then((m) => ({ default: m.SmartCreationPage })),
)
const LazySmartMarketingEnginePage = lazy(() =>
  import('./smart-marketing-engine-page').then((m) => ({ default: m.SmartMarketingEnginePage })),
)
const LazyAppOverviewPage = lazy(() =>
  import('./app-overview-page').then((m) => ({ default: m.AppOverviewPage })),
)
const LazyDecisionSupportPage = lazy(() =>
  import('./decision-support-page').then((m) => ({ default: m.DecisionSupportPage })),
)
const LazyNLPProcessingPage = lazy(() =>
  import('./nlp-processing-page').then((m) => ({ default: m.NLPProcessingPage })),
)

// ==========================================
// Lazy Page Registry
// ==========================================

interface LazyPageEntry {
  component: ComponentType
  name: string
}

/** Map of page IDs to their lazy-loaded components */
const lazyPageRegistry: Partial<Record<PageId, LazyPageEntry>> = {
  clm: { component: LazyCLMPage, name: 'CLM' },
  aicall: { component: LazyAICallPage, name: 'AI Call' },
  customerCare: { component: LazyCustomerCarePage, name: 'Customer Care' },
  contacts: { component: LazyNumberDatabasePage, name: 'Contacts' },
  forms: { component: LazyFormsTabPage, name: 'Forms' },
  tools: { component: LazyAIToolsPage, name: 'AI Tools' },
  workflow: { component: LazyWorkflowPage, name: 'Workflow' },
  logs: { component: LazyActivityLogPage, name: 'Activity Log' },
  collab: { component: LazyCollabCreationPage, name: 'Collaboration' },
  insights: { component: LazyInsightsEnhancedPage, name: 'Insights' },
  quickActions: { component: LazyQuickActionsPage, name: 'Quick Actions' },
  taskBoard: { component: LazyTaskBoardPage, name: 'Task Board' },
  devWorkspace: { component: LazyLeftPanelPage, name: 'Dev Workspace' },
  finance: { component: LazyFinancePage, name: 'Finance' },
  salary: { component: LazySalaryPage, name: 'Salary' },
  paramSettings: { component: LazyParameterSettingsPage, name: 'Parameter Settings' },
  platformSettings: { component: LazyPlatformSettingsPage, name: 'Platform Settings' },
  wechatConfig: { component: LazyWechatConfigPage, name: 'WeChat Config' },
  channelCenter: { component: LazyChannelCenterPage, name: 'Channel Center' },
  dataIntegration: { component: LazyDataIntegrationPage, name: 'Data Integration' },
  marketingPlan: { component: LazyMarketingStrategyPage, name: 'Marketing Plan' },
  promotionExec: { component: LazyCampaignExecutionPage, name: 'Campaign Execution' },
  marketingAnalytics: { component: LazyMarketingAnalyticsPage, name: 'Marketing Analytics' },
  marketingAssets: { component: LazyMarketingAssetsPage, name: 'Marketing Assets' },
  customerAcquisition: { component: LazyCustomerAcquisitionPage, name: 'Customer Acquisition' },
  brandMgmt: { component: LazyBrandManagementPage, name: 'Brand Management' },
  intelligentOps: { component: LazySmartOperationsPage, name: 'Intelligent Ops' },
  platformHub: { component: LazyPlatformIntegrationPage, name: 'Platform Hub' },
  aiCreativeTools: { component: LazySmartCreationPage, name: 'AI Creative Tools' },
  aiMarketingEngine: { component: LazySmartMarketingEnginePage, name: 'AI Marketing Engine' },
  appOverview: { component: LazyAppOverviewPage, name: 'App Overview' },
  aiDecisionSupport: { component: LazyDecisionSupportPage, name: 'AI Decision Support' },
  nlpProcessing: { component: LazyNLPProcessingPage, name: 'NLP Processing' },
}

/**
 * Check if a page has a lazy-loaded component.
 * Pages not in this map are rendered eagerly (dashboard, chat, settings).
 */
export function hasLazyPage(pageId: PageId): boolean {
  return pageId in lazyPageRegistry
}

/**
 * Render a lazy-loaded page wrapped with Suspense and ErrorBoundary.
 * Returns null if the page is not in the lazy registry.
 */
export function renderLazyPage(pageId: PageId, props?: Record<string, unknown>) {
  const entry = lazyPageRegistry[pageId]
  if (!entry) return null

  const Component = entry.component
  return (
    <ErrorBoundary name={entry.name}>
      <Suspense fallback={<PageLoadingFallback />}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  )
}

// Re-export components for direct use if needed
export {
  LazyCLMPage,
  LazyCollabCreationPage,
  LazyFinancePage,
  LazyInsightsEnhancedPage,
  LazyLeftPanelPage,
  LazyQuickActionsPage,
  LazySalaryPage,
  LazyTaskBoardPage,
}
