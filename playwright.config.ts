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
  workers: process.env.CI ? 2 : undefined,
  
  // 测试报告
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],
  
  // 共享设置
  use: {
    // 基础 URL
    baseURL: 'http://localhost:5173',
    
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
  webServer: {
    command: 'npm run dev',
    port: 5173,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});
