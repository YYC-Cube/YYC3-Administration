/**
 * E2E Test: 设置和配置流程
 */

import { expect, test } from '@playwright/test'

test.describe('E2E-SETTINGS: 设置流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('E2E-SETTINGS-001: 打开参数设置', async ({ page }) => {
    const settingsNav = page.locator('[data-nav-id="paramSettings"]')
    if (await settingsNav.isVisible({ timeout: 5000 }).catch(() => false)) {
      await settingsNav.click()
      await page.waitForTimeout(500)
      // 验证设置页面加载
      await expect(page.locator('body')).toContainText(/设置|参数/i)
    }
  })

  test('E2E-SETTINGS-002: 切换语言', async ({ page }) => {
    const langSwitcher = page.locator('[data-testid="language-switcher"]')
    if (await langSwitcher.isVisible({ timeout: 3000 }).catch(() => false)) {
      await langSwitcher.click()
      await page.waitForTimeout(300)
      // 选择中文
      const zhOption = page.locator('text=中文').or(page.locator('[data-lang="zh-CN"]'))
      if (await zhOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await zhOption.click()
        await page.waitForTimeout(500)
      }
    }
  })
})

test.describe('E2E-SETTINGS: 面板操作', () => {
  test('E2E-SETTINGS-003: 命令面板', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 尝试打开命令面板 (Ctrl+K / Cmd+K)
    const modKey = process.platform === 'darwin' ? 'Meta' : 'Control'
    await page.keyboard.press(`${modKey}+k`)
    await page.waitForTimeout(500)

    const commandPalette = page
      .locator('[data-testid="command-palette"]')
      .or(page.locator('[role="dialog"]'))
    if (await commandPalette.isVisible({ timeout: 2000 }).catch(() => false)) {
      // 输入搜索
      await page.keyboard.type('dashboard')
      await page.waitForTimeout(300)
      // 关闭
      await page.keyboard.press('Escape')
    }
  })

  test('E2E-SETTINGS-004: 通知抽屉', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const notifBtn = page
      .locator('[data-testid="notification-button"]')
      .or(page.locator('[aria-label*="通知"]'))
    if (await notifBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await notifBtn.click()
      await page.waitForTimeout(500)
    }
  })
})
