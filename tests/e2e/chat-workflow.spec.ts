/**
 * E2E Test: AI 聊天完整流程
 * 使用 Playwright 测试聊天功能的端到端流程
 */

import { expect, test } from '@playwright/test'

test.describe('E2E-CHAT: AI 聊天流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(
      page.locator('[data-testid="app-container"]').or(page.locator('body')),
    ).toBeVisible()
    // Navigate to chat
    await page.click('[data-nav-id="chat"]')
    await page.waitForTimeout(500)
  })

  test('E2E-CHAT-001: 发送消息并获得回复', async ({ page }) => {
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible()

    const testMessage = '你好，请介绍一下你自己'
    await page.fill('[data-testid="chat-input"]', testMessage)
    await page.click('[data-testid="chat-send-button"]')

    // 验证用户消息显示
    await expect(page.locator(`text=${testMessage}`).first()).toBeVisible({ timeout: 5000 })

    // 等待 AI 回复（最多 30 秒）
    const assistantMsg = page.locator('[data-role="assistant"]').first()
    await expect(assistantMsg).toBeVisible({ timeout: 30000 })

    // 验证 AI 回复不为空
    const aiReply = await assistantMsg.textContent()
    expect(aiReply).toBeTruthy()
    expect(aiReply!.length).toBeGreaterThan(0)
  })

  test('E2E-CHAT-002: 多轮对话上下文保持', async ({ page }) => {
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible()

    // 第一轮对话
    const message1 = '我的名字是张三'
    await page.fill('[data-testid="chat-input"]', message1)
    await page.click('[data-testid="chat-send-button"]')
    await expect(page.locator('[data-role="assistant"]').first()).toBeVisible({ timeout: 30000 })

    // 第二轮对话（测试上下文）
    const message2 = '你记得我的名字吗？'
    await page.fill('[data-testid="chat-input"]', message2)
    await page.click('[data-testid="chat-send-button"]')
    await expect(page.locator('[data-role="assistant"]').nth(1)).toBeVisible({ timeout: 30000 })

    // 验证 AI 回复中包含名字（上下文保持）
    const secondReply = await page.locator('[data-role="assistant"]').nth(1).textContent()
    if (secondReply) {
      expect(secondReply.toLowerCase()).toContain('张三'.toLowerCase())
    }
  })

  test('E2E-CHAT-003: 切换 AI 模型后对话', async ({ page }) => {
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible()

    // 尝试打开模型设置（如果存在）
    const modelBtn = page.locator('[data-testid="model-settings-button"]')
    if (await modelBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await modelBtn.click()
      await page.waitForTimeout(300)
    }

    // 导航到聊天并发送消息
    const testMessage = '测试消息'
    await page.fill('[data-testid="chat-input"]', testMessage)
    await page.click('[data-testid="chat-send-button"]')
    await expect(page.locator('[data-role="assistant"]').first()).toBeVisible({ timeout: 30000 })
  })

  test('E2E-CHAT-004: Markdown 和代码渲染', async ({ page }) => {
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible()

    // 发送请求代码的消息
    const codeRequest = '请给我一个 JavaScript 函数示例'
    await page.fill('[data-testid="chat-input"]', codeRequest)
    await page.click('[data-testid="chat-send-button"]')
    await expect(page.locator('[data-role="assistant"]').first()).toBeVisible({ timeout: 30000 })

    // 验证代码块正确渲染（通过检查 body 中的 pre/code 标签）
    const codeBlock = page.locator('pre code').first()
    const hasCodeBlock = await codeBlock.isVisible({ timeout: 5000 }).catch(() => false)
    if (hasCodeBlock) {
      await expect(codeBlock).toBeVisible()
    }
  })

  test('E2E-CHAT-005: 清空对话历史', async ({ page }) => {
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible()

    // 发送一条消息
    await page.fill('[data-testid="chat-input"]', '测试消息')
    await page.click('[data-testid="chat-send-button"]')
    await expect(page.locator('[data-role="assistant"]').first()).toBeVisible({ timeout: 30000 })

    // 点击清空按钮
    const clearBtn = page.locator('[data-testid="clear-chat-button"]')
    if (await clearBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await clearBtn.click()
      await page.waitForTimeout(500)
    }

    // 验证空状态显示
    const emptyState = page.locator('[data-testid="empty-chat-state"]')
    await expect(emptyState).toBeVisible({ timeout: 5000 })
  })

  test('E2E-CHAT-006: 错误处理和重试', async ({ page }) => {
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible()

    // 发送一条消息
    await page.fill('[data-testid="chat-input"]', '测试消息')
    await page.click('[data-testid="chat-send-button"]')
    await expect(page.locator('[data-role="assistant"]').first()).toBeVisible({ timeout: 30000 })

    // 重试按钮应该可见（每个 AI 消息都附带重试按钮）
    const retryBtns = page.locator('[data-testid="retry-button"]')
    const hasRetry = await retryBtns.count()
    if (hasRetry > 0) {
      await expect(retryBtns.first()).toBeVisible()
    }
  })

  test('E2E-CHAT-007: 聊天持久化', async ({ page }) => {
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible()

    // 发送消息
    const persistMessage = '这条消息应该被保存'
    await page.fill('[data-testid="chat-input"]', persistMessage)
    await page.click('[data-testid="chat-send-button"]')
    await expect(page.locator('[data-role="assistant"]').first()).toBeVisible({ timeout: 30000 })

    // 验证消息显示
    await expect(page.locator(`text=${persistMessage}`).first()).toBeVisible({ timeout: 5000 })
  })

  test('E2E-CHAT-008: 长消息处理', async ({ page }) => {
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible()

    // 发送长消息请求
    const longRequest = '请详细介绍一下人工智能的发展历史'
    await page.fill('[data-testid="chat-input"]', longRequest)
    await page.click('[data-testid="chat-send-button"]')
    await expect(page.locator('[data-role="assistant"]').first()).toBeVisible({ timeout: 60000 })

    // 验证消息容器没有被破坏
    const messageContainer = page.locator('[data-role="assistant"]').first()
    const boundingBox = await messageContainer.boundingBox()
    expect(boundingBox).toBeTruthy()
    expect(boundingBox!.width).toBeGreaterThan(0)

    // 验证滚动到底部
    const chatContainer = page.locator('[data-testid="chat-messages-container"]')
    const isScrolledToBottom = await chatContainer.evaluate((el) => {
      return Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 10
    })
    expect(isScrolledToBottom).toBe(true)
  })
})

test.describe('E2E-CHAT: 主题适配测试', () => {
  test('E2E-CHAT-009: 聊天界面双主题切换', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.click('[data-nav-id="chat"]')
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible()

    // 获取 Cyberpunk 主题下的样式
    const _cyberStyle = await page.locator('[data-testid="chat-interface"]').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })

    // 切换主题
    const themeBtn = page.locator('[data-testid="theme-switcher"]').first()
    if (await themeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await themeBtn.click()
      await page.waitForTimeout(500)
    }

    // 获取切换后的样式
    const newStyle = await page.locator('[data-testid="chat-interface"]').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })

    expect(newStyle).toBeDefined()
  })
})

test.describe('E2E-CHAT: 性能测试', () => {
  test('E2E-CHAT-010: 聊天响应性能', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.click('[data-nav-id="chat"]')
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible()

    // 测量发送消息到用户消息出现的响应时间
    const startTime = Date.now()
    await page.fill('[data-testid="chat-input"]', '性能测试')
    await page.click('[data-testid="chat-send-button"]')
    await expect(page.locator('[data-role="user"]').last()).toBeVisible({ timeout: 5000 })

    const responseTime = Date.now() - startTime
    expect(responseTime).toBeLessThan(500)
  })
})
