import { Component, ErrorInfo, ReactNode } from "react";

import { AIModelProvider } from "./components/ai-model-context";
import { AppProvider, useApp } from "./components/app-context";
import { ContactsProvider } from "./components/contacts-context";
import { CyberpunkStandalone } from "./components/cyberpunk-standalone";
import { CyberpunkWidget } from "./components/cyberpunk-widget";
import { I18nProvider } from "./components/i18n-context";
import { LiquidGlassWrapper } from "./components/liquid-glass-wrapper";
import { PWAInstallPrompt } from "./components/pwa-install";
import { ThemeSwitcherProvider } from "./components/theme-switcher-context";
import { APP_VERSION } from "./version";

// Preload all components to prevent dynamic import errors
import "./components/preload-fix";

// Version management
if (typeof window !== "undefined") {
  const storedVersion = localStorage.getItem("yyc_app_version");
  if (storedVersion !== APP_VERSION) {
    // Version updated silently — no console output in production
    localStorage.setItem("yyc_app_version", APP_VERSION);
    if ("caches" in window) {
      caches.keys().then((names) => names.forEach((name) => caches.delete(name)));
    }
  }
}

// Error Boundary to catch dynamic import errors
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4" style={{ background: '#0a0a0a', color: '#ffffff' }}>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4" style={{ color: '#00f0ff' }}>
              加载错误 / Loading Error
            </h1>
            <p className="mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
              请刷新页面重试 / Please refresh the page
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded transition-colors"
              style={{ 
                background: '#00f0ff', 
                color: '#0a0a0a',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#00d4ff'}
              onMouseLeave={e => e.currentTarget.style.background = '#00f0ff'}
            >
              刷新页面 / Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const { appMode, setAppMode } = useApp();

  return (
    <LiquidGlassWrapper>
      <div className="size-full">
        {appMode === "standalone" ? (
          <CyberpunkStandalone onSwitchMode={() => setAppMode("widget")} />
        ) : (
          <CyberpunkWidget onSwitchMode={() => setAppMode("standalone")} />
        )}
        <PWAInstallPrompt />
      </div>
    </LiquidGlassWrapper>
  );
}

/**
 * Root application component.
 * Wraps the component tree with ThemeSwitcher → I18n → App → Contacts → AIModel providers
 * and an error boundary for resilient rendering.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <ThemeSwitcherProvider>
        <I18nProvider>
          <AppProvider>
            <ContactsProvider>
              <AIModelProvider>
                <AppContent />
              </AIModelProvider>
            </ContactsProvider>
          </AppProvider>
        </I18nProvider>
      </ThemeSwitcherProvider>
    </ErrorBoundary>
  );
}