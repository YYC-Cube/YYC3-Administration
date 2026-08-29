/**
 * E2E Test: 全页面渲染冒烟(P2 切片)
 *
 * 目的:遍历全部导航可达页面,断言每页内容区真实渲染。
 * 这是 P1 代码分割(35 页 React.lazy 化)的直接回归防线——
 * 任何一个页面的动态导入失败都会在此暴露。
 *
 * 分类映射镜像 src/app/components/nav-config.ts(见 CATEGORY_PAGES),
 * 若导航结构调整需同步更新此处。
 */

import { expect, test } from '@playwright/test'

import { CATEGORY_ENTRY, dismissOnboarding } from './helpers'

/** 分类 → 页面 id 列表(镜像 nav-config.ts) */
const CATEGORY_PAGES: Record<string, readonly string[]> = {
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

// 串行遍历:单 worker 顺序访问,避免并发压垮 dev server
test.describe.configure({ mode: 'serial' })

test.describe('E2E-SMOKE: 全页面渲染', () => {
  test('遍历全部导航页面且内容区渲染非空', async ({ page }) => {
    await dismissOnboarding(page)
    await page.goto('/')
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible({ timeout: 30000 })

    const failures: string[] = []

    for (const [cat, pages] of Object.entries(CATEGORY_PAGES)) {
      // 头部分类按钮(data-nav-id=分类首项)——当前分类的首项会同时出现在
      // 头部按钮与侧边栏子项中,必须按容器作用域区分,避免 strict 冲突
      const catBtn = page
        .locator('nav')
        .first()
        .locator(`[data-nav-id="${CATEGORY_ENTRY[cat as keyof typeof CATEGORY_ENTRY]}"]`)
      await expect(catBtn).toBeVisible({ timeout: 10000 })
      await catBtn.click()

      for (const pid of pages) {
        if (pid !== CATEGORY_ENTRY[cat as keyof typeof CATEGORY_ENTRY]) {
          const item = page.locator('aside').first().locator(`[data-nav-id="${pid}"]`)
          await expect(item).toBeVisible({ timeout: 10000 })
          await item.click()
        }

        // 断言内容区渲染出非空内容(懒加载 chunk 拉取 + Suspense 完成)
        try {
          await expect
            .poll(async () => (await page.locator('main[role="main"]').innerText()).trim().length, {
              timeout: 15000,
            })
            .toBeGreaterThan(10)
        } catch {
          failures.push(pid)
        }
      }
    }

    expect(`渲染失败的页面: [${failures.join(', ')}]`).toBe('渲染失败的页面: []')
  })
})
