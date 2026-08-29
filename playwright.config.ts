import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for E2E Testing
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',

  // 最大测试时间
  timeout: 60 * 1000,

  // 每个测试的断言超时
  expect: {
    timeout: 10000,
  },

  // 并发运行测试
  fullyParallel: true,

  // CI 环境下失败时不重试，本地可重试一次
  retries: process.env.CI ? 0 : 1,

  // 并发 worker 数量
  // 本地默认（CPU 核数一半）会以 20+ 并发压垮 vite dev server（模块转换
  // 排队导致整批假超时），限为 4；CI 维持 2
  workers: process.env.CI ? 2 : 4,

  // 测试报告
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],

  // 共享设置
  use: {
    // 基础 URL（与 vite dev server 端口一致）
    baseURL: 'http://localhost:3171',

    // 截图策略
    screenshot: 'only-on-failure',

    // 视频录制
    video: 'retain-on-failure',

    // 追踪
    trace: 'retain-on-failure',

    // 浏览器设置
    viewport: { width: 1280, height: 720 },

    // 忽略 HTTPS 错误
    ignoreHTTPSErrors: true,

    // 模拟网络条件（可选）
    // launchOptions: {
    //   slowMo: 50, // 减慢操作 50ms，便于观察
    // },
  },

  // 测试项目配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // 移动端测试
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Web Server 配置（自动启动开发服务器）
  // VITE_E2E=true 启用测试认证旁路：AuthProvider 直接注入 admin 会话，
  // 跳过登录墙（登录墙曾导致全部 E2E 用例失败，见审计报告 2.3 节）。
  // 注意 reuseExistingServer 必须为 false：复用一台未注入 VITE_E2E 的
  // 本地 dev server 会重新撞上登录墙，产生整批假失败。
  webServer: {
    command: 'VITE_E2E=true pnpm dev',
    port: 3171,
    timeout: 180 * 1000,
    reuseExistingServer: false,
  },
});
