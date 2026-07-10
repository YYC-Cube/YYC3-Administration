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
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Single vendor chunk — avoids circular dependency issues caused by
        // fine-grained manualChunks splitting (vendor-other ↔ vendor-react cycle).
        // Rollup automatically resolves import order within a single chunk.
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            return 'vendor'
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
