import path from 'path'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
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

/**
 * CSP 构建期加固(F-03):
 * - 生产构建移除 connect-src 中的 localhost/127.0.0.1 回环白名单
 *   (浏览器直连 AI/edge-proxy 仅限 DEV);
 * - 若配置 VITE_AI_PROXY_URL,自动将其源(origin)注入 connect-src
 *   (幂等:已包含时不重复追加)。
 * index.html 中的静态 CSP 为 DEV 基线(保留回环 + *.supabase.co);
 * *.supabase.co 在生产也保留——未配置 VITE_SUPABASE_* 时零请求、零影响,
 * 配置后无需再改 CSP(P3 激活的前置阻断已解除)。
 */
const cspHardenPlugin = (env: Record<string, string>): Plugin => ({
  name: 'csp-harden',
  apply: 'build',
  transformIndexHtml: (html) => {
    // 从构建环境(含 .env.production)读取代理地址
    const proxy = env.VITE_AI_PROXY_URL?.trim() ?? ''
    const originMatch = proxy.match(/^https?:\/\/[^/\s]+/i)
    const proxyOrigin = originMatch ? originMatch[0] : ''
    return html.replace(
      /(<meta\s+http-equiv="Content-Security-Policy"[^>]*content=")([^"]*)(")/,
      (_m, head: string, csp: string, tail: string) => {
        let next = csp
          .replace(/\s*http:\/\/localhost:\*/g, '')
          .replace(/\s*http:\/\/127\.0\.0\.1:\*/g, '')
        if (proxyOrigin && !next.includes(proxyOrigin)) {
          next = next.replace(/connect-src [^;]*/, (d) => `${d} ${proxyOrigin}`)
        }
        return `${head}${next}${tail}`
      },
    )
  },
})

export default defineConfig(({ mode }) => {
  // 供 csp-harden 等插件读取 .env[.production] 中的 VITE_ 变量
  const env = loadEnv(mode, process.cwd(), '')

  return {
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
    cspHardenPlugin(env),
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
        // F-04: 恢复 2MiB 单文件预缓存上限(此前为容纳 vendor-monaco 放宽到
        // 5MiB,导致首访强制预缓存 3.7MB 编辑器——绝大多数用户用不到)
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        // F-04: monaco 懒加载 chunk(js+css)显式排除预缓存;
        // 首次使用编辑器后由下方 runtimeCaching(static-assets-*)
        // CacheFirst 按需缓存,用过即离线可用
        globIgnores: ['**/vendor-monaco*'],
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
  }
})
