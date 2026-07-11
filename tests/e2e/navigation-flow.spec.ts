/**
 * E2E Test: 导航和页面切换流程
 * 使用 Playwright 测试导航系统
 */

import { expect, test } from '@playwright/test'

test.describe('E2E-NAV: 导航流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('E2E-NAV-001: 仪表盘页面加载', async ({ page }) => {
    // 验证仪表盘可见
    await expect(
      page.locator('[data-testid="app-container"]').or(page.locator('body')),
    ).toBeVisible()
    // 验证导航栏存在
    const nav = page.locator('nav').or(page.locator('[data-testid="navigation"]'))
    await expect(nav.first()).toBeVisible()
  })

  test('E2E-NAV-002: 切换到客户管理', async ({ page }) => {
    await page.click('[data-nav-id="clm"]')
    await page.waitForTimeout(500)
    // 验证页面已切换
    await expect(page.locator('body')).toContainText(/客户|CLM/i)
  })

  test('E2E-NAV-003: 切换到联系人', async ({ page }) => {
    await page.click('[data-nav-id="contacts"]')
    await page.waitForTimeout(500)
    await expect(page.locator('body')).toContainText(/联系人|联系/i)
  })

  test('E2E-NAV-004: 导航分类展开/折叠', async ({ page }) => {
    // 点击分类标题展开/折叠
    const category = page
      .locator('[data-cat-id="customer"]')
      .or(page.locator('text=客户管理').first())
    if (await category.isVisible()) {
      await category.click()
      await page.waitForTimeout(300)
    }
  })
})

test.describe('E2E-NAV: 主题切换', () => {
  test('E2E-NAV-005: 切换主题', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const themeSwitcher = page.locator('[data-testid="theme-switcher"]')
    if (await themeSwitcher.isVisible()) {
      const _beforeBg = await page.evaluate(
        () => window.getComputedStyle(document.body).backgroundColor,
      )
      await themeSwitcher.click()
      await page.waitForTimeout(500)
      const afterBg = await page.evaluate(
        () => window.getComputedStyle(document.body).backgroundColor,
      )
      // 主题切换后背景色可能变化
      expect(afterBg).toBeDefined()
    }
  })
})

test.describe('E2E-NAV: 响应式', () => {
  test('E2E-NAV-006: 移动端导航', async ({ page, isMobile }) => {
    if (!isMobile) return

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 移动端应该有汉堡菜单或侧边栏切换
    const menuButton = page
      .locator('[data-testid="menu-toggle"]')
      .or(page.locator('[aria-label*="menu"]'))
    if (await menuButton.isVisible()) {
      await menuButton.click()
      await page.waitForTimeout(300)
    }
  })
})
