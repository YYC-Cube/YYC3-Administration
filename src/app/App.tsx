import { Component, ErrorInfo, ReactNode } from 'react'
import { HashRouter } from 'react-router'

import { AppProvider, useApp } from '@/app/components/app-context'
import { AuthProvider } from '@/app/components/auth-context'
import { CyberpunkStandalone } from '@/app/components/cyberpunk-standalone'
import { CyberpunkWidget } from '@/app/components/cyberpunk-widget'
import { DemoEnvironmentBanner } from '@/app/components/demo-environment-banner'
import { I18nProvider, useI18n } from '@/app/components/i18n-context'
import { LiquidGlassWrapper } from '@/app/components/liquid-glass-wrapper'
import { PWAInstallPrompt } from '@/app/components/pwa-install'
import { RouteSync } from '@/app/components/route-sync'
import { ThemeSwitcherProvider } from '@/app/components/theme-switcher-context'
import { UserDataSync } from '@/app/components/user-data-sync'
import { APP_VERSION } from '@/app/version'
import { ContactsProvider } from '@/features/customer/pages/contacts-context'
import { Toaster } from '@/shared/ui'

// Preload all components to prevent dynamic import errors

// Version management
if (typeof window !== 'undefined') {
  const storedVersion = localStorage.getItem('yyc_app_version')
  if (storedVersion !== APP_VERSION) {
    // Version updated silently — no console output in production
    localStorage.setItem('yyc_app_version', APP_VERSION)
    if ('caches' in window) {
      caches.keys().then((names) => names.forEach((name) => caches.delete(name)))
    }
  }
}

// Error Boundary to catch dynamic import errors

/**
 * Localized error-fallback UI. Rendered by ErrorBoundary inside its own
 * `<I18nProvider>` because the boundary itself sits above the app-level provider
 * in the tree, so `useI18n()` would otherwise have no context to read from.
 */
function ErrorFallback() {
  const { t } = useI18n()
  return (
    <div
      className="flex items-center justify-center min-h-screen p-4"
      style={{ background: '#0a0a0a', color: '#ffffff' }}
    >
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4" style={{ color: '#00f0ff' }}>
          {t('app.loadErrorTitle')}
        </h1>
        <p className="mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {t('app.loadErrorDesc')}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 rounded transition-colors"
          style={{
            background: '#00f0ff',
            color: '#0a0a0a',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#00d4ff')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#00f0ff')}
        >
          {t('app.refreshPage')}
        </button>
      </div>
    </div>
  )
}

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <I18nProvider>
          <ErrorFallback />
        </I18nProvider>
      )
    }

    return this.props.children
  }
}

function AppContent() {
  const { appMode, setAppMode } = useApp()

  return (
    <LiquidGlassWrapper>
      <div className="size-full" data-testid="app-container">
        {appMode === 'standalone' ? (
          <CyberpunkStandalone onSwitchMode={() => setAppMode('widget')} />
        ) : (
          <CyberpunkWidget onSwitchMode={() => setAppMode('standalone')} />
        )}
        <PWAInstallPrompt />
        <Toaster position="bottom-right" />
      </div>
    </LiquidGlassWrapper>
  )
}

/**
 * Root application component.
 * Wraps the component tree with ThemeSwitcher → I18n → Auth → App → Contacts providers,
 * mounts RouteSync (hash ↔ state) and UserDataSync (P3 Supabase settings sync lifecycle),
 * and an error boundary for resilient rendering.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <ThemeSwitcherProvider>
          <I18nProvider>
            {/* 演示环境警示:Supabase 未配置时于所有页面(含登录页)展示,
                激活真实后端后自动隐藏(F-02);置于 I18nProvider 内以使用 useI18n */}
            <DemoEnvironmentBanner />
            <AuthProvider>
              <AppProvider>
                <RouteSync />
                {/* P3 数据面挂载件:未配置 Supabase 时返回 null,零副作用;
                    必须置于 AuthProvider 内(详见组件 @file 说明) */}
                <UserDataSync />
                <ContactsProvider>
                  <AppContent />
                </ContactsProvider>
              </AppProvider>
            </AuthProvider>
          </I18nProvider>
        </ThemeSwitcherProvider>
      </HashRouter>
    </ErrorBoundary>
  )
}
