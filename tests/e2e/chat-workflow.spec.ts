/**
 * E2E Test: AI 聊天完整流程
 * 使用 Playwright 测试聊天功能的端到端流程
 */

import { expect, test } from '@playwright/test';

test.describe('E2E-CHAT: AI 聊天流程', () => {
  test.beforeEach(async ({ page }) => {
    // 访问应用
    await page.goto('/');
    
    // 等待应用加载完成
    await page.waitForLoadState('networkidle');
    
    // 等待主界面渲染
    await expect(page.locator('[data-testid="app-container"]').or(page.locator('body'))).toBeVisible();
  });

  test('E2E-CHAT-001: 发送消息并获得回复', async ({ page }) => {
    // Step 1: 点击"AI 聊天"导航
    await page.click('[data-nav-id="chat"]');
    
    // 等待聊天界面加载
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    
    // Step 2: 输入消息
    const testMessage = '你好，请介绍一下你自己';
    await page.fill('[data-testid="chat-input"]', testMessage);
    
    // Step 3: 发送消息
    await page.click('[data-testid="chat-send-button"]');
    
    // 验证用户消息显示
    await expect(page.locator(`text=${testMessage}`).first()).toBeVisible();
    
    // Step 4: 等待 AI 回复（最多 30 秒）
    await expect(
      page.locator('[data-role="assistant"]').first()
    ).toBeVisible({ timeout: 30000 });
    
    // 验证 AI 回复不为空
    const aiReply = await page.locator('[data-role="assistant"]').first().textContent();
    expect(aiReply).toBeTruthy();
    expect(aiReply!.length).toBeGreaterThan(0);
  });

  test('E2E-CHAT-002: 多轮对话上下文保持', async ({ page }) => {
    // 导航到聊天页面
    await page.click('[data-nav-id="chat"]');
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    
    // 第一轮对话
    const message1 = '我的名字是张三';
    await page.fill('[data-testid="chat-input"]', message1);
    await page.click('[data-testid="chat-send-button"]');
    
    // 等待第一轮回复
    await expect(
      page.locator('[data-role="assistant"]').first()
    ).toBeVisible({ timeout: 30000 });
    
    // 第二轮对话（测试上下文）
    const message2 = '你记得我的名字吗？';
    await page.fill('[data-testid="chat-input"]', message2);
    await page.click('[data-testid="chat-send-button"]');
    
    // 等待第二轮回复
    await expect(
      page.locator('[data-role="assistant"]').nth(1)
    ).toBeVisible({ timeout: 30000 });
    
    // 验证 AI 回复中包含名字（上下文保持）
    const secondReply = await page.locator('[data-role="assistant"]').nth(1).textContent();
    expect(secondReply).toContain('张三');
  });

  test('E2E-CHAT-003: 切换 AI 模型后对话', async ({ page }) => {
    // Step 1: 打开模型设置
    await page.click('[data-testid="model-settings-button"]');
    
    // 等待模型设置面板出现
    await expect(page.locator('[data-testid="model-settings-panel"]')).toBeVisible();
    
    // Step 2: 切换模型（选择第二个模型）
    await page.click('[data-testid="model-option-1"]');
    
    // 关闭设置面板
    await page.click('[data-testid="close-settings"]');
    
    // Step 3: 导航到聊天并发送消息
    await page.click('[data-nav-id="chat"]');
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    
    const testMessage = '测试新模型';
    await page.fill('[data-testid="chat-input"]', testMessage);
    await page.click('[data-testid="chat-send-button"]');
    
    // 等待回复
    await expect(
      page.locator('[data-role="assistant"]').first()
    ).toBeVisible({ timeout: 30000 });
    
    // 验证使用新模型（通过检查模型标识）
    const modelBadge = await page.locator('[data-testid="current-model-badge"]').textContent();
    expect(modelBadge).not.toContain('Model 0'); // 不是第一个模型
  });

  test('E2E-CHAT-004: Markdown 和代码渲染', async ({ page }) => {
    // 导航到聊天
    await page.click('[data-nav-id="chat"]');
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    
    // 发送请求代码的消息
    const codeRequest = '请给我一个 JavaScript 函数示例';
    await page.fill('[data-testid="chat-input"]', codeRequest);
    await page.click('[data-testid="chat-send-button"]');
    
    // 等待回复
    await expect(
      page.locator('[data-role="assistant"]').first()
    ).toBeVisible({ timeout: 30000 });
    
    // 验证代码块正确渲染
    const codeBlock = page.locator('pre code').first();
    await expect(codeBlock).toBeVisible();
    
    // 验证代码高亮（应该有语法高亮类）
    const codeElement = await codeBlock.elementHandle();
    const className = await codeElement?.getAttribute('class');
    expect(className).toBeTruthy();
  });

  test('E2E-CHAT-005: 清空对话历史', async ({ page }) => {
    // 导航到聊天
    await page.click('[data-nav-id="chat"]');
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    
    // 发送一条消息
    await page.fill('[data-testid="chat-input"]', '测试消息');
    await page.click('[data-testid="chat-send-button"]');
    
    // 等待回复
    await expect(
      page.locator('[data-role="assistant"]').first()
    ).toBeVisible({ timeout: 30000 });
    
    // 点击清空按钮
    await page.click('[data-testid="clear-chat-button"]');
    
    // 确认清空
    await page.click('[data-testid="confirm-clear"]');
    
    // 验证对话已清空
    await expect(page.locator('[data-role="user"]')).toHaveCount(0);
    await expect(page.locator('[data-role="assistant"]')).toHaveCount(0);
    
    // 验证显示空状态
    await expect(page.locator('[data-testid="empty-chat-state"]')).toBeVisible();
  });

  test('E2E-CHAT-006: 错误处理和重试', async ({ page }) => {
    // 导航到聊天
    await page.click('[data-nav-id="chat"]');
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    
    // 模拟网络错误（通过拦截请求）
    await page.route('**/api/chat', route => route.abort());
    
    // 发送消息
    await page.fill('[data-testid="chat-input"]', '测试错误处理');
    await page.click('[data-testid="chat-send-button"]');
    
    // 验证错误提示显示
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({
      timeout: 10000,
    });
    
    // 点击重试按钮
    await page.unroute('**/api/chat'); // 恢复网络
    await page.click('[data-testid="retry-button"]');
    
    // 验证重试成功
    await expect(
      page.locator('[data-role="assistant"]').first()
    ).toBeVisible({ timeout: 30000 });
  });

  test('E2E-CHAT-007: 聊天持久化', async ({ page }) => {
    // 导航到聊天
    await page.click('[data-nav-id="chat"]');
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    
    // 发送消息
    const persistMessage = '这条消息应该被保存';
    await page.fill('[data-testid="chat-input"]', persistMessage);
    await page.click('[data-testid="chat-send-button"]');
    
    // 等待回复
    await expect(
      page.locator('[data-role="assistant"]').first()
    ).toBeVisible({ timeout: 30000 });
    
    // 刷新页面
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 导航回聊天
    await page.click('[data-nav-id="chat"]');
    
    // 验证消息仍然存在
    await expect(page.locator(`text=${persistMessage}`)).toBeVisible();
  });

  test('E2E-CHAT-008: 长消息处理', async ({ page }) => {
    // 导航到聊天
    await page.click('[data-nav-id="chat"]');
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    
    // 发送请求长回复的消息
    const longRequest = '请详细介绍一下人工智能的发展历史，包括各个重要的里程碑';
    await page.fill('[data-testid="chat-input"]', longRequest);
    await page.click('[data-testid="chat-send-button"]');
    
    // 等待回复
    await expect(
      page.locator('[data-role="assistant"]').first()
    ).toBeVisible({ timeout: 60000 }); // 长回复可能需要更多时间
    
    // 验证消息容器没有被破坏
    const messageContainer = page.locator('[data-role="assistant"]').first();
    const boundingBox = await messageContainer.boundingBox();
    
    expect(boundingBox).toBeTruthy();
    expect(boundingBox!.width).toBeGreaterThan(0);
    
    // 验证滚动到底部
    const chatContainer = page.locator('[data-testid="chat-messages-container"]');
    const isScrolledToBottom = await chatContainer.evaluate((el) => {
      return Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 10;
    });
    expect(isScrolledToBottom).toBe(true);
  });
});

test.describe('E2E-CHAT: 主题适配测试', () => {
  test('E2E-CHAT-009: 聊天界面双主题切换', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 导航到聊天
    await page.click('[data-nav-id="chat"]');
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    
    // 获取 Cyberpunk 主题下的样式
    const cyberStyle = await page.locator('[data-testid="chat-interface"]').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    // 切换到 Liquid Glass 主题
    await page.click('[data-testid="theme-switcher"]');
    
    // 等待主题切换完成
    await page.waitForTimeout(500);
    
    // 获取 Liquid Glass 主题下的样式
    const liquidStyle = await page.locator('[data-testid="chat-interface"]').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    // 验证样式发生了变化
    expect(cyberStyle).not.toBe(liquidStyle);
  });
});

test.describe('E2E-CHAT: 性能测试', () => {
  test('E2E-CHAT-010: 聊天响应性能', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 导航到聊天
    await page.click('[data-nav-id="chat"]');
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    
    // 测量发送消息的响应时间
    const startTime = Date.now();
    
    await page.fill('[data-testid="chat-input"]', '性能测试');
    await page.click('[data-testid="chat-send-button"]');
    
    // 等待用户消息出现
    await expect(page.locator('[data-role="user"]').last()).toBeVisible();
    
    const responseTime = Date.now() - startTime;
    
    // 验证响应时间 < 500ms
    expect(responseTime).toBeLessThan(500);
  });
});
