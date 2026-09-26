/**
 * @file playwright.config.ts
 * @description YYC³ Playwright Configuration — E2E test setup for the
 *   Developer Workspace and full application testing.
 *
 * USAGE:
 *   npx playwright test                         # Run all tests
 *   npx playwright test tests/e2e/              # Run E2E tests only
 *   npx playwright test --headed                # Run with visible browser
 *   npx playwright test --ui                    # Run with Playwright UI
 *   npx playwright show-report                  # View HTML report
 *
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 */

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { open: "never" }],
    ["json", { outputFile: "test-results/results.json" }],
    ["list"],
  ],
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 13"] },
    },
  ],
  webServer: {
    // 生产构建 + vite preview 静态服务(Playwright 官方最佳实践):
    // - vite dev 按需编译在 CI(2C/7G)上会因 page-smoke 全页遍历触发全模块编译,
    //   内存峰值导致 dev server 被 OOM 杀死 → 后续用例 ERR_CONNECTION_REFUSED
    // - preview 无按需编译,内存平稳,且测的是真实生产 bundle
    // VITE_E2E=true 于 build 时静态内联:注入 E2E 认证旁路并关演示横幅/mock 实时数据
    command: "VITE_E2E=true pnpm build && VITE_E2E=true pnpm preview --port 5173 --strictPort",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 240_000, // 含 build 时长(CI 2 核约 1~2 分钟)
  },
});
