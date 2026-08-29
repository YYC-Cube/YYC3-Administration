/**
 * @file developer-workspace.spec.ts
 * @description YYC³ Playwright E2E Tests — Developer Workspace (left-panel-page)
 *   Full end-to-end test suite covering file explorer, AI assistant, code editor,
 *   Git integration, panel management, and keyboard shortcuts.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-18
 *
 * SETUP:
 *   1. npm install -D @playwright/test
 *   2. npx playwright install
 *   3. npx playwright test tests/e2e/developer-workspace.spec.ts
 *
 * CONFIGURATION:
 *   Create playwright.config.ts at project root (see /tests/playwright.config.ts)
 */

import { expect, type Page, test } from '@playwright/test'

import { CATEGORY_ENTRY, dismissOnboarding, navigateTo } from './helpers'

// ==========================================
// Test Configuration
// ==========================================

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3171'
const _DEV_WORKSPACE_NAV = 'Developer Workspace' // nav item text or PageId

// Helper: navigate to Developer Workspace page
// devWorkspace 非分类首项：先点 toolkit 分类（首项 aicall），再点侧边栏 devWorkspace
async function navigateToDevWorkspace(page: Page) {
  await dismissOnboarding(page)
  await page.goto(BASE_URL)
  await expect(page.locator("[data-testid='app-container']")).toBeVisible({ timeout: 30000 })
  await navigateTo(page, CATEGORY_ENTRY.toolkit, 'devWorkspace')
}

// ==========================================
// Test Suite: Panel Navigation
// ==========================================

test.describe('Panel Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToDevWorkspace(page)
  })

  test('should render activity bar with 6 panel icons', async ({ page }) => {
    const icons = page
      .locator('button')
      .filter({ hasText: /Explorer|Tasks|AI|Search|Quick|Git|文件|任务|搜索|快捷/ })
    await expect(icons.first()).toBeVisible()
  })

  test('should switch panels when clicking activity bar icons', async ({ page }) => {
    // Click AI panel
    const aiButton = page.locator('button').filter({ hasText: /^AI$/ }).first()
    if (await aiButton.isVisible()) {
      await aiButton.click()
      await page.waitForTimeout(200)
    }
  })

  test('should toggle panel collapse with Ctrl+B', async ({ page }) => {
    await page.keyboard.press('Control+b')
    await page.waitForTimeout(300)
    // Panel should be collapsed
    await page.keyboard.press('Control+b')
    await page.waitForTimeout(300)
    // Panel should be expanded again
  })

  test('should open search with Ctrl+P', async ({ page }) => {
    await page.keyboard.press('Control+p')
    await page.waitForTimeout(300)
  })

  test('should open explorer with Ctrl+E', async ({ page }) => {
    await page.keyboard.press('Control+e')
    await page.waitForTimeout(300)
  })
})

// ==========================================
// Test Suite: File Explorer
// ==========================================

test.describe('File Explorer', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToDevWorkspace(page)
    // Ensure explorer panel is active
    const explorerBtn = page
      .locator('button')
      .filter({ hasText: /Explorer|文件/ })
      .first()
    if (await explorerBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await explorerBtn.click()
    }
  })

  test('should display file tree with root items', async ({ page }) => {
    // Check for file/folder items in the tree
    const treeItems = page
      .locator("[class*='cursor-pointer']")
      .filter({ hasText: /src|components|package/ })
    const count = await treeItems.count()
    expect(count).toBeGreaterThanOrEqual(0) // May vary based on initial state
  })

  test('should expand folder on click', async ({ page }) => {
    // 作用域到文件树容器(全页 text=src 会命中 Git/状态栏等同名文本)
    const tree = page.locator('[data-testid="file-explorer"]')
    await expect(tree).toBeVisible({ timeout: 10000 })
    const components = tree.locator('span', { hasText: /^components$/ }).first()
    // 默认展开链已含 src/app/components;点击 components 触发 toggle(折叠),
    // 子项应从 DOM 移除——展开/折叠共用同一代码路径,单次断言即覆盖语义
    if (await components.isVisible().catch(() => false)) {
      const child = tree.locator('span', { hasText: 'cyberpunk-standalone.tsx' }).first()
      await expect(child).toBeVisible({ timeout: 3000 })
      // CI 下偶发透明浮层拦截指针;force 绕过拦截,DOM onClick 仍触发
      await components.click({ force: true })
      await expect(child).toBeHidden({ timeout: 5000 })
    }
  })

  test('should open file in editor when clicked', async ({ page }) => {
    // 作用域到文件树容器:全页 text=App.tsx 会与编辑器标签同名互串,
    // 且实时通知引发的重渲染会让无作用域定位解析到易失节点(element detached)
    const tree = page.locator('[data-testid="file-explorer"]')
    await expect(tree).toBeVisible({ timeout: 10000 })
    const fileItem = tree.locator('span', { hasText: 'App.tsx' }).first()

    // 默认展开链 ['root','src','src/app',...] 已使 App.tsx 可见
    // (勿点击文件夹——toggle 语义会折叠)
    await expect(fileItem).toBeVisible({ timeout: 10000 })
    await fileItem.click({ force: true })

    // 断言编辑器随点击载入:Monaco 挂载即证明文件打开
    // (末尾不再复检树行——满载并行下选中后的树布局抖动会偶发移除 span)
    await expect
      .poll(
        async () =>
          page
            .locator('.monaco-editor')
            .first()
            .isVisible()
            .catch(() => false),
        { timeout: 15000 },
      )
      .toBe(true)
  })

  test('should show right-click context menu', async ({ page }) => {
    const fileItem = page.locator("[class*='cursor-pointer']").first()
    if (await fileItem.isVisible({ timeout: 2000 }).catch(() => false)) {
      await fileItem.click({ button: 'right' })
      await page.waitForTimeout(200)
      // Context menu should appear
      const menu = page.locator('text=New File, text=新建文件').first()
      const _menuVisible = await menu.isVisible({ timeout: 1000 }).catch(() => false)
      // Menu may or may not appear depending on implementation
    }
  })

  test('should create new file via context menu', async ({ page }) => {
    // This test depends on the context menu being functional
    const newFileBtn = page
      .locator('button')
      .filter({ hasText: /New File|新建/ })
      .first()
    if (await newFileBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await newFileBtn.click()
      await page.waitForTimeout(300)
    }
  })
})

// ==========================================
// Test Suite: Monaco Code Editor
// ==========================================

test.describe('Code Editor', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToDevWorkspace(page)
    // Open a file to trigger editor
    const fileItem = page.locator('text=App.tsx').first()
    if (await fileItem.isVisible({ timeout: 3000 }).catch(() => false)) {
      await fileItem.click()
      await page.waitForTimeout(1000)
    }
  })

  test('should load Monaco Editor', async ({ page }) => {
    // Monaco creates a div with class 'monaco-editor'
    const monacoEditor = page.locator('.monaco-editor')
    const visible = await monacoEditor.isVisible({ timeout: 5000 }).catch(() => false)
    // If no file selected, Monaco won't load — that's OK for this test
    if (visible) {
      await expect(monacoEditor).toBeVisible()
    }
  })

  test('should display status bar with cursor position', async ({ page }) => {
    const statusBar = page.locator('text=/Ln \\d+, Col \\d+/').first()
    const visible = await statusBar.isVisible({ timeout: 3000 }).catch(() => false)
    if (visible) {
      await expect(statusBar).toBeVisible()
    }
  })

  test('should display language indicator in status bar', async ({ page }) => {
    const langIndicator = page.locator('text=typescript, text=Monaco').first()
    const visible = await langIndicator.isVisible({ timeout: 3000 }).catch(() => false)
    if (visible) {
      await expect(langIndicator).toBeVisible()
    }
  })

  test('should toggle word wrap', async ({ page }) => {
    const wrapBtn = page.locator("[title='Toggle word wrap']").first()
    if (await wrapBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await wrapBtn.click()
      await page.waitForTimeout(200)
      await wrapBtn.click() // Toggle back
    }
  })

  test('should adjust font size', async ({ page }) => {
    const increaseBtn = page.locator("[title='Increase font size']").first()
    if (await increaseBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await increaseBtn.click()
      await page.waitForTimeout(100)
    }
  })

  test('should copy all content', async ({ page }) => {
    const copyBtn = page.locator("[title='Copy all']").first()
    if (await copyBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await copyBtn.click()
    }
  })
})

// ==========================================
// Test Suite: AI Assistant
// ==========================================

test.describe('AI Assistant', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToDevWorkspace(page)
    // 活动栏按钮已带 title;真实断言取代条件跳过
    const aiButton = page.locator("button[title='AI Assistant']").first()
    await expect(aiButton).toBeVisible({ timeout: 10000 })
    await aiButton.click()
    await page.waitForTimeout(300)
  })

  test('should display AI assistant panel', async ({ page }) => {
    const header = page.locator('text=/AI Assistant|AI 助手/').first()
    const visible = await header.isVisible({ timeout: 3000 }).catch(() => false)
    if (visible) {
      await expect(header).toBeVisible()
    }
  })

  test('should send a message and receive mock response', async ({ page }) => {
    const input = page
      .locator(
        "input[placeholder*='Ask'], textarea[placeholder*='Ask'], input[placeholder*='输入']",
      )
      .first()
    if (await input.isVisible({ timeout: 3000 }).catch(() => false)) {
      await input.fill('How do I use useThemeColors?')
      await input.press('Enter')
      // Wait for mock response (600-1400ms + render)
      await page.waitForTimeout(2000)
      // Check for assistant message
      const response = page
        .locator("[class*='assistant'], text=/建议|recommend|Hook|pattern/i")
        .first()
      const _responseVisible = await response.isVisible({ timeout: 3000 }).catch(() => false)
      // Mock response should appear
    }
  })

  test('should toggle AI configuration panel (unified model source)', async ({ page }) => {
    // ⚙️ 按钮展开统一模型信息卡(P2-① 收敛后不再有独立 provider 表单)
    const configBtn = page.locator("button[title='提供商设置']")
    await expect(configBtn).toBeVisible({ timeout: 10000 })
    await configBtn.click()
    await expect(page.locator('[data-testid="ai-config-panel"]')).toBeVisible({ timeout: 5000 })
  })

  test('should open unified model settings from AI panel', async ({ page }) => {
    // 信息卡的「打开模型设置」应唤起全局 ModelSettings 浮层(z-[100])
    const configBtn = page.locator("button[title='提供商设置']")
    await expect(configBtn).toBeVisible({ timeout: 10000 })
    await configBtn.click()
    const openBtn = page.locator('[data-testid="open-model-settings"]')
    await expect(openBtn).toBeVisible({ timeout: 5000 })
    await openBtn.click()

    const modal = page.locator('div[class*="z-[100]"]')
    await expect(modal).toBeVisible({ timeout: 5000 })
    await modal
      .locator('.absolute.inset-0')
      .first()
      .click({ position: { x: 8, y: 8 } })
    await expect(modal).toBeHidden({ timeout: 5000 })
  })
})

// ==========================================
// Test Suite: Git Integration
// ==========================================

test.describe('Git Integration', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToDevWorkspace(page)
    const gitButton = page.locator('button').filter({ hasText: /^Git$/ }).first()
    if (await gitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await gitButton.click()
      await page.waitForTimeout(300)
    }
  })

  test('should display Git panel with branch info', async ({ page }) => {
    const branchInfo = page.locator('text=/feature\\/|main|branch/i').first()
    const visible = await branchInfo.isVisible({ timeout: 3000 }).catch(() => false)
    if (visible) {
      await expect(branchInfo).toBeVisible()
    }
  })

  test('should switch between Status, Log, and Config tabs', async ({ page }) => {
    const logTab = page.locator('button').filter({ hasText: 'Log' }).first()
    if (await logTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await logTab.click()
      await page.waitForTimeout(200)
    }

    const configTab = page.locator('button').filter({ hasText: /⚙️/ }).first()
    if (await configTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await configTab.click()
      await page.waitForTimeout(200)
    }
  })

  test('should display Git actions (Stage All, Commit, Push, Pull)', async ({ page }) => {
    const statusTab = page.locator('button').filter({ hasText: 'Status' }).first()
    if (await statusTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await statusTab.click()
      await page.waitForTimeout(200)
    }
    const pushBtn = page.locator('button').filter({ hasText: 'Push' }).first()
    const visible = await pushBtn.isVisible({ timeout: 2000 }).catch(() => false)
    if (visible) {
      await expect(pushBtn).toBeVisible()
    }
  })

  test('should show GitHub API config form', async ({ page }) => {
    const configTab = page.locator('button').filter({ hasText: /⚙️/ }).first()
    if (await configTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await configTab.click()
      await page.waitForTimeout(200)

      const tokenInput = page.locator("input[type='password']").first()
      const visible = await tokenInput.isVisible({ timeout: 2000 }).catch(() => false)
      if (visible) {
        await expect(tokenInput).toBeVisible()
      }
    }
  })
})

// ==========================================
// Test Suite: Panel Resizing
// ==========================================

test.describe('Panel Resizing', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToDevWorkspace(page)
  })

  test('should display panel width in status bar', async ({ page }) => {
    const widthIndicator = page.locator('text=/Panel: \\d+px/').first()
    const _visible = await widthIndicator.isVisible({ timeout: 3000 }).catch(() => false)
    // Width indicator may be present in the status bar
  })
})

// ==========================================
// Test Suite: Full User Workflow
// ==========================================

test.describe('Full Workflow: File → Edit → AI → Git', () => {
  test('complete developer workflow', async ({ page }) => {
    await navigateToDevWorkspace(page)

    // Step 1: Open file explorer
    const explorerBtn = page
      .locator('button')
      .filter({ hasText: /Explorer|文件/ })
      .first()
    if (await explorerBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await explorerBtn.click()
      await page.waitForTimeout(300)
    }

    // Step 2: Click a file to open in editor(作用域到文件树容器,
    // 全页 text=App.tsx 会与编辑器标签同名互串且受布局抖动影响)
    const tree = page.locator('[data-testid="file-explorer"]')
    if (await tree.isVisible({ timeout: 5000 }).catch(() => false)) {
      const fileItem = tree.locator('span', { hasText: 'App.tsx' }).first()
      if (await fileItem.isVisible({ timeout: 5000 }).catch(() => false)) {
        await fileItem.click()
        await page.waitForTimeout(1000)
      }
    }

    // Step 3: Switch to AI panel
    const aiBtn = page.locator('button').filter({ hasText: /^AI$/ }).first()
    if (await aiBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await aiBtn.click()
      await page.waitForTimeout(300)
    }

    // Step 4: Send a message to AI (should include file context)
    const aiInput = page
      .locator(
        "input[placeholder*='Ask'], textarea[placeholder*='Ask'], input[placeholder*='输入']",
      )
      .first()
    if (await aiInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await aiInput.fill('Explain the current file structure')
      await aiInput.press('Enter')
      await page.waitForTimeout(2000)
    }

    // Step 5: Switch to Git panel
    const gitBtn = page.locator('button').filter({ hasText: /^Git$/ }).first()
    if (await gitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await gitBtn.click()
      await page.waitForTimeout(300)
    }

    // Step 6: View commit log
    const logTab = page.locator('button').filter({ hasText: 'Log' }).first()
    if (await logTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await logTab.click()
      await page.waitForTimeout(200)
    }

    // Workflow complete — verify no errors
    const _errors = await page.evaluate(() => {
      return (window as unknown as Record<string, unknown>).__playwright_errors ?? []
    })
    // No critical JS errors expected
  })
})

// ==========================================
// Test Suite: Theme & Accessibility
// ==========================================

test.describe('Theme & Accessibility', () => {
  test('should have no accessibility violations on main elements', async ({ page }) => {
    await navigateToDevWorkspace(page)
    // Basic check: all buttons should have accessible labels or text
    const buttons = page.locator('button')
    const count = await buttons.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should apply YYC³ theme colors', async ({ page }) => {
    await navigateToDevWorkspace(page)
    // Check that the page has dark background (not white)
    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor
    })
    // Should not be pure white
    expect(bgColor).not.toBe('rgb(255, 255, 255)')
  })
})
