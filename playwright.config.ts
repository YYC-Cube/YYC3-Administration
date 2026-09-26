/**
 * @file playwright.config.ts
 * @description YYC³ Playwright Configuration — E2E test setup for the
 *   Developer Workspace and full application testing.
 *
 * ⚠ 单一配置源：本文件位于仓库根目录,`playwright test` 从根目录解析时
 *   即命中此文件(此前曾与 tests/playwright.config.ts 双源漂移——CI 实际
 *   用的是这里的 dev-server 3171 旧配置,导致 E2E 全量 ERR_CONNECTION_REFUSED,
 *   见 CI run 36211008325 取证)。规范配置已收敛于此,tests/ 下不再保留副本。
 *
 * USAGE:
 *   pnpm test:e2e                              # Run all tests
 *   pnpm test:e2e -- --project=chromium        # Single browser project
 *   pnpm test:e2e:ui                           # Run with Playwright UI
 *   pnpm test:e2e:report                       # View HTML report
 *
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v2.0.0
 */

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
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
    //
    // ⚠ CI 拆除挂死规避(run 36214765395 取证:65 例 3 分钟全绿后进程静默
    //   26 分钟直至超时):sh -c 'pnpm build && pnpm preview' 的三代进程链
    //   令 Playwright 杀不干净,存活孙进程持有的 stdio 管道阻塞退出。
    //   故 CI 上由 workflow 预构建 + 预启动 detached preview,此处仅复用
    //   (reuseExistingServer),Playwright 不 spawn 即无拆除问题;
    //   服务器生命周期由 CI 的 always() 步骤显式管理
    command: "VITE_E2E=true pnpm build && VITE_E2E=true pnpm preview --port 5173 --strictPort",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 240_000, // 含 build 时长(CI 2 核约 1~2 分钟)
    gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
  },
});
