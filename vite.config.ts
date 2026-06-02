import path from 'path'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  // Custom domain: admin.yyc3.vip — use root-relative paths
  base: '/',

  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
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
        manualChunks: undefined,
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