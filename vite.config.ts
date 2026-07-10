import path from 'path'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Custom domain: admin.yyc3.vip — use root-relative paths
  base: '/',

  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
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
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /\.(js|css|woff2)$/i,
            handler: 'CacheFirst',
            options: { cacheName: 'static-assets', expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 } },
          },
          {
            urlPattern: /\.(png|jpg|svg|ico|webp)$/i,
            handler: 'CacheFirst',
            options: { cacheName: 'image-cache', expiration: { maxEntries: 100, maxAgeSeconds: 60 * 24 * 60 * 60 } },
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
      '@emotion/is-prop-valid',
      '@emotion/react',
      '@emotion/styled',
    ],
    force: true,
  },

  build: {
    // Add cache busting
    manifest: true,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // React core + Recharts (must be in same chunk to avoid forwardRef load-order issues)
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/') ||
            id.includes('node_modules/recharts/') ||
            id.includes('node_modules/d3-') ||
            id.includes('node_modules/d3/')
          ) {
            return 'vendor-react'
          }
          // Motion/animation
          if (id.includes('node_modules/motion/') || id.includes('node_modules/framer-motion/')) {
            return 'vendor-motion'
          }
          // Monaco editor
          if (id.includes('node_modules/monaco-editor') || id.includes('node_modules/@monaco-editor')) {
            return 'vendor-monaco'
          }
          // Lucide icons
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-lucide'
          }
          // Markdown / remark / rehype / unified
          if (id.includes('node_modules/react-markdown') || id.includes('node_modules/remark-') || id.includes('node_modules/rehype-') || id.includes('node_modules/unified') || id.includes('node_modules/hast') || id.includes('node_modules/mdast') || id.includes('node_modules/lowlight') || id.includes('node_modules/highlight')) {
            return 'vendor-markdown'
          }
          // Radix UI primitives
          if (id.includes('node_modules/@radix-ui/')) {
            return 'vendor-radix'
          }
          // React Router
          if (id.includes('node_modules/react-router') || id.includes('node_modules/@remix-run')) {
            return 'vendor-router'
          }
          // React DnD
          if (id.includes('node_modules/react-dnd')) {
            return 'vendor-dnd'
          }
          // Date handling
          if (id.includes('node_modules/date-fns') || id.includes('node_modules/dayjs')) {
            return 'vendor-dates'
          }
          // Zustand state management
          if (id.includes('node_modules/zustand')) {
            return 'vendor-state'
          }
          // Forms
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform')) {
            return 'vendor-forms'
          }
          // UI utility packages
          if (id.includes('node_modules/cmdk') || id.includes('node_modules/sonner') || id.includes('node_modules/vaul') || id.includes('node_modules/embla-') || id.includes('node_modules/input-otp')) {
            return 'vendor-ui-utils'
          }
          // Popper / positioning
          if (id.includes('node_modules/react-popper') || id.includes('node_modules/@popperjs')) {
            return 'vendor-popper'
          }
          // Carousel / slider
          if (id.includes('node_modules/react-slick') || id.includes('node_modules/slick-')) {
            return 'vendor-slider'
          }
          // Other node_modules → shared vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor-other'
          }
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
