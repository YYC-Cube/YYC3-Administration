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
        'src/imports/**',
        // 大型 UI 页面组件（E2E 覆盖，单元测试代价过高）
        'src/app/components/**/dashboard*.tsx',
        'src/app/components/**/chat-interface*.tsx',
        'src/app/components/**/command-palette*.tsx',
        'src/app/components/**/cyberpunk-*.tsx',
        'src/app/components/**/left-panel-page.tsx',
        'src/app/components/**/window-bar.tsx',
        'src/app/components/**/*-page.tsx',
        // 入口文件
        'src/app/App.tsx',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
      include: ['src/**/*.{ts,tsx}'],
      all: true,
      // 基线棘轮 = 当前实际覆盖率(P1/P2 死代码与死测试清理后实测:
      // statements 21.87 / branches 12.62),取整略低防抖动;只升不降,
      // P2 目标:核心路径 ≥60%(见审计报告 7.3-4)
      thresholds: {
        statements: 21,
        branches: 12,
        functions: 19,
        lines: 22,
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
