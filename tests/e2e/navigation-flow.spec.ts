/**
 * E2E Test: 导航和页面切换流程
 * 使用 Playwright 测试导航系统
 *
 * 认证由 playwright webServer 的 VITE_E2E=true 旁路处理（AuthProvider
 * 直接注入 admin 会话），此处无需登录步骤。
 * 断言策略：全部落在 <main> 内容区，避免侧边栏标签文字造成假通过。
 */

import { expect, test } from '@playwright/test'

import { CATEGORY_ENTRY, openApp } from './helpers'

test.describe('E2E-NAV: 导航流程', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
  })

  test('E2E-NAV-001: 仪表盘页面加载', async ({ page }) => {
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible()
    // 主内容区与导航区均应存在
    await expect(page.locator('main[role="main"]')).toBeVisible()
    await expect(page.locator('nav').first()).toBeVisible()
  })

  test('E2E-NAV-002: 切换到客户管理', async ({ page }) => {
    // clm 是 customer 分类首项，头部按钮直达
    await page.click(`[data-nav-id="${CATEGORY_ENTRY.customer}"]`)
    await expect(page.locator('main[role="main"] h1').first()).toContainText(/客户|CLM/i, {
      timeout: 10000,
    })
  })

  test('E2E-NAV-003: 切换到联系人', async ({ page }) => {
    // contacts 非分类首项：先切 customer 分类，再点侧边栏子项
    await page.click(`[data-nav-id="${CATEGORY_ENTRY.customer}"]`)
    await page.click('[data-nav-id="contacts"]')
    await expect(page.locator('main[role="main"]')).toContainText(/联系人|联系/i, {
      timeout: 10000,
    })
  })

  test('E2E-NAV-004: 桌面头部分类按钮导航（回归 3af578b）', async ({ page }) => {
    // 平台分类首项即 paramSettings，单步直达
    await page.click(`[data-nav-id="${CATEGORY_ENTRY.platform}"]`)
    await expect(page.locator('main[role="main"] h1').first()).toContainText(/参数|设置/i, {
      timeout: 10000,
    })
  })
})

test.describe('E2E-NAV: 主题切换', () => {
  test('E2E-NAV-005: 切换主题', async ({ page }) => {
    await openApp(page)

    const themeSwitcher = page.locator('[data-testid="theme-switcher"]').first()
    await expect(themeSwitcher).toBeVisible({ timeout: 10000 })

    // 切换按钮的 title 随当前主题变化，是可靠的无侵入断言点
    const titleBefore = await themeSwitcher.getAttribute('title')
    expect(titleBefore).toBeTruthy()

    await themeSwitcher.click()
    await expect
      .poll(async () => themeSwitcher.getAttribute('title'), { timeout: 5000 })
      .not.toBe(titleBefore)
  })
})

test.describe('E2E-NAV: 响应式', () => {
  test('E2E-NAV-006: 移动端导航', async ({ page, isMobile }) => {
    test.skip(!isMobile, '仅移动端视口执行')

    await openApp(page)

    // 移动端应有可打开的导航入口（汉堡菜单或底部导航）
    const menuButton = page
      .locator('[data-testid="menu-toggle"]')
      .or(page.locator('[aria-label*="menu" i]'))
      .or(page.locator('[aria-label*="导航" i]'))
    await expect(menuButton.first()).toBeVisible({ timeout: 10000 })
  })
})
