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
      exclude: [
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
      // 基线棘轮 = 当前实际覆盖率,只升不降。2026-09-26 F-06 死代码清理
      // (46 文件/1.45 万行移出分母)后实测:statements 44.85 / branches 31.78 /
      // functions 47.87 / lines 46.4,取整略低防抖动。P2 目标:核心路径 ≥60%
      thresholds: {
        statements: 44,
        branches: 31,
        functions: 47,
        lines: 46,
      },
    },
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['tests/e2e/**/*', 'node_modules/**/*'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
