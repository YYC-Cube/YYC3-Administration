/**
 * E2E Test: 设置和配置流程
 *
 * 认证由 playwright webServer 的 VITE_E2E=true 旁路处理，无需登录步骤。
 * 断言全部为真实断言——历史上本文件所有断言被 `isVisible().catch(() => false)`
 * 条件包裹，应用未渲染也能通过（空转测试），已全部移除。
 */

import { expect, test } from '@playwright/test'

import { CATEGORY_ENTRY, openApp } from './helpers'

test.describe('E2E-SETTINGS: 设置流程', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
  })

  test('E2E-SETTINGS-001: 打开参数设置', async ({ page }) => {
    await page.click(`[data-nav-id="${CATEGORY_ENTRY.platform}"]`)
    await expect(page.locator('main[role="main"] h1').first()).toContainText(/参数|设置/i, {
      timeout: 10000,
    })
  })

  test('E2E-SETTINGS-002: 设置页语言切换', async ({ page }) => {
    // 侧边栏底部齿轮按钮进入设置页
    await page.click('button[title="设置"]')
    const switcher = page.locator('[data-testid="language-switcher"]')
    await expect(switcher).toBeVisible({ timeout: 10000 })

    // 打开下拉并切换到 English
    await switcher.locator('button').first().click()
    const englishOption = switcher.locator('button', { hasText: 'English' }).last()
    await expect(englishOption).toBeVisible({ timeout: 5000 })
    await englishOption.click()
    await expect(switcher).toContainText('English', { timeout: 5000 })

    // 切回简体中文，恢复默认语言状态
    await switcher.locator('button').first().click()
    const zhOption = switcher.locator('button', { hasText: '简体中文' }).last()
    await expect(zhOption).toBeVisible({ timeout: 5000 })
    await zhOption.click()
    await expect(switcher).toContainText('简体中文', { timeout: 5000 })
  })
})

test.describe('E2E-SETTINGS: 面板操作', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
  })

  test('E2E-SETTINGS-003: 命令面板', async ({ page }) => {
    const modKey = process.platform === 'darwin' ? 'Meta' : 'Control'

    await page.keyboard.press(`${modKey}+k`)
    const palette = page.locator('[cmdk-root]')
    await expect(palette).toBeVisible({ timeout: 5000 })

    // 输入过滤词后应仍有可执行命令项
    await page.keyboard.type('dashboard')
    await expect(palette.locator('[cmdk-item]').first()).toBeVisible({ timeout: 5000 })

    await page.keyboard.press('Escape')
    await expect(palette).toBeHidden({ timeout: 5000 })
  })

  test('E2E-SETTINGS-004: 通知抽屉', async ({ page }) => {
    // 头部通知按钮（title=通知中心）
    const notifBtn = page.locator('button[title="通知中心"]')
    await expect(notifBtn.first()).toBeVisible({ timeout: 10000 })
    await notifBtn.first().click()

    // 抽屉打开后应渲染通知中心标题
    await expect(page.locator('h3', { hasText: '通知中心' })).toBeVisible({ timeout: 5000 })
  })
})
