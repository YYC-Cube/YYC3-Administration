/**
 * E2E 共享辅助
 *
 * 认证：playwright webServer 以 VITE_E2E=true 启动 dev server，
 * AuthProvider 直接注入 admin 会话，无需登录步骤。
 *
 * 桌面端导航模型（重要）：
 *   顶部头部渲染 8 个分类按钮，data-nav-id = 分类首项 id；
 *   侧边栏只渲染「当前分类」的子项。因此非分类首项的页面
 *   （如 devWorkspace、contacts）必须两步导航：先点头部分类，
 *   再点侧边栏子项。
 */

import { expect, type Page } from '@playwright/test'

/** 分类首项 id（= 头部分类按钮的 data-nav-id），按 nav-config.ts */
export const CATEGORY_ENTRY = {
  overview: 'dashboard',
  conversation: 'chat',
  customer: 'clm',
  toolkit: 'aicall',
  platform: 'paramSettings',
  finance: 'finance',
  supplyChain: 'forms',
  marketing: 'appOverview',
} as const

/**
 * 跳过首次访问引导（OnboardingTutorial）。
 * 全屏遮罩（z-200）会拦截一切点击，必须在新 context 装载前写入标记。
 */
export async function dismissOnboarding(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('yyc3_onboarding_done', 'true')
  })
}

/** 打开应用并等待应用壳就绪（dev server 冷启动下模块转换较慢，给足 30s） */
export async function appReady(page: Page): Promise<void> {
  await page.goto('/')
  await page.waitForLoadState('load')
  await expect(page.locator('[data-testid="app-container"]')).toBeVisible({ timeout: 30000 })
}

/**
 * 两步导航到任意页面。
 * @param categoryFirstId 头部分类按钮的 data-nav-id（分类首项）
 * @param targetId 目标页面 id；缺省或等于分类首项时仅一步
 */
export async function navigateTo(
  page: Page,
  categoryFirstId: string,
  targetId?: string,
): Promise<void> {
  await page.click(`[data-nav-id="${categoryFirstId}"]`)
  if (targetId && targetId !== categoryFirstId) {
    await page.click(`[data-nav-id="${targetId}"]`)
  }
  await page.waitForTimeout(400)
}

/** 常用组合：新页面就绪（含引导遮罩排除） */
export async function openApp(page: Page): Promise<void> {
  await dismissOnboarding(page)
  await appReady(page)
}
