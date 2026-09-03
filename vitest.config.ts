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
      all: true,
      // 基线棘轮 = 当前实际覆盖率(P2-④ 重组+排除语义对齐后实测:
      // statements 28.63 / branches 17.02 / functions 30.4 / lines 29.28),取整略低防抖动;只升不降,
      // P2 目标:核心路径 ≥60%(见审计报告 7.3-4)
      thresholds: {
        statements: 31,
        branches: 19,
        functions: 34,
        lines: 31,
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
