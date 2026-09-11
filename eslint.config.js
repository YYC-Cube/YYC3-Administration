import js from '@eslint/js'
import prettierConfig from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      'coverage',
      'docs',
      'src/imports',
      '.vite',
      'playwright-report',
      'test-results',
      'src/lib/i18n/lit-controller.ts',
      '*.config.js',
      '*.config.mjs',
      '*.config.d.ts',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: true }],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // P2-④ 防回流:旧平铺目录已迁移 @/shared 与 @/features,禁止回流;
      // 跨目录导入强制 '@/' 别名(移位稳定,见审计报告 7.3-④)
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/app/components/ui/*',
                '@/app/components/hooks/*',
                '@/app/components/services/*',
                '@/app/components/panels/*',
                '@/app/components/settings/*',
              ],
              message: '旧平铺目录已迁移:ui/hooks→@/shared,services→@/services,panels→@/features/dev-workspace,settings→@/features/settings',
            },
            {
              regex: '^\.\./.+/',
              message: "跨目录导入必须使用 '@/' 别名(仅同目录可用 './')",
            },
          ],
        },
      ],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        },
      ],
    },
  },

  prettierConfig,
)
