/**
 * @file page-registry.ts
 * @description E2E 共享页面注册表——分类 → 页面 id 镜像 src/app/components/nav-config.ts
 *
 * 单一真源:page-smoke(渲染冒烟)与 i18n-audit(语言覆盖审计)共用,
 * 导航结构调整时只需更新此处。
 */

export const CATEGORY_PAGES: Record<string, readonly string[]> = {
  overview: ['dashboard', 'logs', 'insights'],
  conversation: ['chat'],
  customer: ['clm', 'customerCare', 'contacts', 'customerAcquisition', 'brandMgmt'],
  toolkit: [
    'aicall',
    'tools',
    'workflow',
    'collab',
    'quickActions',
    'taskBoard',
    'devWorkspace',
    'apiDocs',
  ],
  platform: [
    'paramSettings',
    'platformSettings',
    'wechatConfig',
    'channelCenter',
    'dataIntegration',
    'platformHub',
    'intelligentOps',
    'settings',
    'profile',
  ],
  finance: ['finance', 'salary'],
  supplyChain: ['forms', 'smartForm', 'procurement', 'inventory'],
  marketing: [
    'appOverview',
    'marketingPlan',
    'promotionExec',
    'marketingAnalytics',
    'marketingAssets',
    'aiCreativeTools',
    'aiMarketingEngine',
    'aiDecisionSupport',
    'nlpProcessing',
  ],
}
