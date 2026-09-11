import path from 'path'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

import type { Plugin } from 'vite'

// BUILD_ID: 每次部署唯一标识，用于 PWA 缓存失效 & 版本追踪
// 格式: YYYYMMDDHHmmss（UTC 时间戳）
const BUILD_ID = new Date()
  .toISOString()
  .replace(/[-:T]/g, '')
  .slice(0, 14)

// 注入 BUILD_ID meta 标签到 HTML，用于运行时版本检测 & 缓存失效
const buildIdPlugin: Plugin = {
  name: 'build-id-meta',
  transformIndexHtml: (html) =>
    html.replace(
      '</head>',
      `  <meta name="yyc3-build-id" content="${BUILD_ID}" />\n  </head>`,
    ),
}

export default defineConfig({
  // Custom domain: admin.yyc3.vip — use root-relative paths
  base: '/',

  define: {
    __BUILD_ID__: JSON.stringify(BUILD_ID),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },

  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    buildIdPlugin,
    // PWA 多端适配 — Service Worker 离线缓存 + 安装引导
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'YYC³ Administration',
        short_name: 'YYC³',
        description: 'AI Marketing Automation Terminal - Enterprise Management Platform',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        lang: 'zh-CN',
        icons: [
          { src: '/yyc3-icons/Web App/android-chrome-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/yyc3-icons/Web App/android-chrome-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/yyc3-icons/Web App/android-chrome-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        categories: ['business', 'productivity'],
      },
      workbox: {
        // Clean up old precaches on new SW activation
        cleanupOutdatedCaches: true,
        // vendor-monaco(~4MB,懒加载)超出默认 2MiB 预缓存上限
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /\.(js|css|woff2)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: `static-assets-${BUILD_ID}`,
              expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /\.(png|jpg|svg|ico|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: `image-cache-${BUILD_ID}`,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /^\/api\//i,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache', expiration: { maxEntries: 100, maxAgeSeconds: 5 * 60 } },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  // Optimization settings to prevent dynamic import issues
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'recharts',
      'lucide-react',
      'motion/react',
      // 预打包避免 dev server 运行中发现新依赖触发整页 reload
      // (并行 E2E 下该 reload 会随机打断用例——monaco 为懒加载首用)
      'monaco-editor/esm/vs/editor/editor.api',
      'monaco-editor/esm/vs/basic-languages/_.contribution',
    ],
    force: true,
  },

  build: {
    // Add cache busting
    manifest: true,
    // 回落至接近默认值——P1 代码分割后大 chunk 应当重新告警
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // 分组 vendor:页面级分割由 React.lazy 自动完成,此处仅将
        // 独立大件拆出以利并行加载与长期缓存(库版本不变则缓存命中)。
        // 注意:细粒度 manualChunks 曾引发 chunk 循环初始化问题,
        // 因此仅拆"叶子型"大库,不拆共享框架代码。
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('monaco-editor')) {
            // 编辑器核心 ~4MB:独立懒加载 chunk(code-editor 为 React.lazy),
            // 不进首屏 vendor;SW 预缓存需放宽单文件上限(见 workbox)
            return 'vendor-monaco'
          }
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
            return 'vendor-react'
          }
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor')) {
            return 'vendor-charts'
          }
          if (
            id.includes('highlight.js') ||
            id.includes('react-markdown') ||
            id.includes('remark') ||
            id.includes('rehype') ||
            id.includes('unified') ||
            id.includes('micromark') ||
            id.includes('mdast')
          ) {
            return 'vendor-markdown'
          }
          return 'vendor'
        },
        // Add hash to filenames for cache busting
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
    commonjsOptions: {
      include: [/node_modules/],
    },
  },

  // Development server settings
  server: {
    fs: {
      strict: false,
    },
  },

  // Clear cache on startup
  cacheDir: '.vite',
})
