/**
 * @file lazy-pages.test.tsx
 * @description 懒加载页面注册表单元测试 — hasLazyPage / renderLazyPage
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { describe, expect, it } from 'vitest'

import type { PageId } from '@/app/components/app-context'

import {
  hasLazyPage,
  LazyCLMPage,
  LazyCollabCreationPage,
  LazyFinancePage,
  LazyInsightsEnhancedPage,
  LazyLeftPanelPage,
  LazyQuickActionsPage,
  LazySalaryPage,
  LazyTaskBoardPage,
  renderLazyPage,
} from '@/app/components/lazy-pages'

describe('hasLazyPage — 懒加载注册表判定', () => {
  it('核心页面均已在懒加载注册表中', () => {
    const knownIds: PageId[] = ['dashboard', 'chat', 'clm', 'tools', 'workflow', 'forms']
    for (const id of knownIds) {
      expect(hasLazyPage(id), `期望 ${id} 命中注册表`).toBe(true)
    }
  })

  it('平台集成 / 智能营销 / 供应链页面均在注册表中', () => {
    const ids: PageId[] = [
      'paramSettings',
      'platformSettings',
      'wechatConfig',
      'channelCenter',
      'dataIntegration',
      'marketingPlan',
      'promotionExec',
      'marketingAnalytics',
      'marketingAssets',
      'customerAcquisition',
      'brandMgmt',
      'intelligentOps',
      'platformHub',
      'aiCreativeTools',
      'aiMarketingEngine',
      'appOverview',
      'aiDecisionSupport',
      'nlpProcessing',
      'procurement',
      'inventory',
      'smartForm',
      'aicall',
      'customerCare',
      'contacts',
      'logs',
      'insights',
      'collab',
      'quickActions',
      'taskBoard',
      'devWorkspace',
      'finance',
      'salary',
    ]
    for (const id of ids) {
      expect(hasLazyPage(id), `期望 ${id} 命中注册表`).toBe(true)
    }
  })

  it('未纳入懒加载的页面(settings/profile/apiDocs)返回 false', () => {
    expect(hasLazyPage('settings')).toBe(false)
    expect(hasLazyPage('profile')).toBe(false)
    expect(hasLazyPage('apiDocs')).toBe(false)
  })
})

describe('renderLazyPage — 渲染包装', () => {
  it('未注册的 pageId 返回 null(早退分支)', () => {
    expect(renderLazyPage('settings')).toBeNull()
    expect(renderLazyPage('profile')).toBeNull()
    expect(renderLazyPage('apiDocs')).toBeNull()
  })

  it('已注册的 pageId 返回可渲染的 React 元素(非 null)', () => {
    // 仅断言返回非空元素,不做真实渲染,避免拉起重量级懒加载页面
    expect(renderLazyPage('dashboard')).not.toBeNull()
    expect(renderLazyPage('clm')).not.toBeNull()
    expect(renderLazyPage('devWorkspace')).not.toBeNull()
  })

  it('透传 props 时仍返回 React 元素', () => {
    expect(renderLazyPage('chat', { someProp: 'value' })).not.toBeNull()
  })
})

describe('lazy-pages — 再导出组件', () => {
  it('再导出的懒加载组件均已定义', () => {
    const exported = [
      LazyCLMPage,
      LazyCollabCreationPage,
      LazyFinancePage,
      LazyInsightsEnhancedPage,
      LazyLeftPanelPage,
      LazyQuickActionsPage,
      LazySalaryPage,
      LazyTaskBoardPage,
    ]
    for (const c of exported) {
      expect(c).toBeDefined()
    }
  })
})
