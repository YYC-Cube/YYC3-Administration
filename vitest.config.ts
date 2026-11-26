import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    css: true,
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html', 'lcov', 'text-summary'],
      // F-12 覆盖率双口径:
      //   默认(排除口径):业务页面组件由 E2E 覆盖,排除出单测分母,
      //     棘轮阈值基于此口径(只升不降)。
      //   COV_ALL=1(全口径):仅排除基建噪音,业务页面计入分母——
      //     `pnpm test:coverage:all`,用于诚实公示真实整体覆盖水平,
      //     不参与 CI 门禁(大 UI 组件的交互由 Playwright 守护)。
      exclude: process.env.COV_ALL
        ? [
            'node_modules/',
            'tests/',
            '**/*.d.ts',
            '**/*.config.*',
            '**/dist/**',
            '**/coverage/**',
            'src/app/version.ts',
            'src/main.tsx',
            'src/vite-env.d.ts',
          ]
        : [
            'node_modules/',
            'tests/',
            '**/*.d.ts',
            '**/*.config.*',
            '**/dist/**',
            '**/coverage/**',
            'src/app/version.ts',
            // 大型 UI 页面组件(E2E 覆盖,单元测试代价过高)——P2-④ 重组后路径
            'src/features/**/pages/**',
            'src/features/**/chat-interface*.tsx',
            'src/features/dev-workspace/left-panel-page.tsx',
            'src/features/dev-workspace/window-bar.tsx',
            'src/features/dev-workspace/panels/**',
            'src/features/settings/model-settings/**',
            'src/app/components/**/command-palette*.tsx',
            'src/app/components/**/cyberpunk-*.tsx',
            // 入口文件
            'src/app/App.tsx',
            'src/main.tsx',
            'src/vite-env.d.ts',
          ],
      include: ['src/**/*.{ts,tsx}'],
      // 注:vitest 4 移除 coverage.all 选项——include 列出的未测试文件
      // 仍会计入分母(语义等价于 v3 的 all: true)
      // 基线棘轮 = 当前实际覆盖率,只升不降。历史:2026-10-19 棘轮 70/66/72/72;
      // 2026-11-01 branches 66→65(CI Node 24 地板取证);2026-11-02 批次三回调 66。
      // 2026-11-27 85×4 冲刺(test/my-mgmt-gate-85):新增 9 个测试文件 ~140 用例
      // (ai-proxy 网络通路/code-editor/全量 lazy 解析/particle-canvas/NeonCard 交互/
      // UserDataSync 双模/user-data-sync 生命周期/git-api 真实通路/useAuthStore 会话自愈/
      // doc-sync+self-data-sync/use-chat-stream 补测),门禁口径实测
      // S 92.56 / B 85.8 / F 90.6 / L 94.3 → 阈值 85×4(branches 实测 85.8%,
      // 保留 0.8pp CI 抖动余量)。只升不降。
      ...(process.env.COV_ALL
        ? {}
        : {
            thresholds: {
              statements: 85,
              branches: 85,
              functions: 85,
              lines: 85,
            },
          }),
    },
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['tests/e2e/**/*', 'node_modules/**/*'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@server': path.resolve(__dirname, './server'),
    },
  },
});
