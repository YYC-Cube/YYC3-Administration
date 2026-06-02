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
  retries: process.env.CI ? 2 : 0,
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
    command: "pnpm dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
