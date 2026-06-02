import { Download, Smartphone, WifiOff, X } from 'lucide-react'
import { memo, useCallback, useEffect, useState } from 'react'

import { useI18n } from './i18n-context'

// ==========================================
// YYC³ PWA 安装提示 + 离线状态指示器
// Phase 6: Service Worker 生命周期管理
// ==========================================

const PWA_DISMISSED_KEY = 'yyc3_pwa_dismissed'
const PWA_DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * PWA install prompt banner.
 * Listens for the `beforeinstallprompt` event and displays a dismissible
 * installation banner. Also shows an "offline ready" toast when applicable.
 * Memoized with `React.memo`.
 */
export const PWAInstallPrompt = memo(function PWAInstallPrompt() {
  const { t } = useI18n()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // Listen for beforeinstallprompt
  useEffect(() => {
    // Check if dismissed recently
    try {
      const dismissed = localStorage.getItem(PWA_DISMISSED_KEY)
      if (dismissed && Date.now() - Number(dismissed) < PWA_DISMISS_DURATION) return
    } catch {
      /* ignore */
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show banner after 3 seconds
      setTimeout(() => setShowBanner(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // Online/offline status
  useEffect(() => {
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  // Detect if already installed
  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
    }
    const handler = () => {
      setInstalled(true)
      setShowBanner(false)
    }
    window.addEventListener('appinstalled', handler)
    return () => window.removeEventListener('appinstalled', handler)
  }, [])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
    }
    setDeferredPrompt(null)
    setShowBanner(false)
  }, [deferredPrompt])

  const handleDismiss = useCallback(() => {
    setShowBanner(false)
    try {
      localStorage.setItem(PWA_DISMISSED_KEY, String(Date.now()))
    } catch {
      /* ignore */
    }
  }, [])

  // Offline indicator (always visible when offline)
  const offlineIndicator = !isOnline && (
    <div
      className="fixed bottom-4 left-4 z-[200] flex items-center gap-2 px-3 py-2 rounded-xl border"
      style={{
        background: 'rgba(10,10,10,0.95)',
        borderColor: 'rgba(0,95,115,0.4)',
        boxShadow: '0 0 15px rgba(0,95,115,0.2)',
        backdropFilter: 'blur(10px)',
        animation: 'spring-in 0.4s var(--spring-easing) both',
      }}
    >
      <WifiOff
        className="w-4 h-4 text-[#005f73]"
        style={{ animation: 'neon-pulse 2s ease-in-out infinite' }}
      />
      <span className="text-xs text-[#005f73]">Offline</span>
    </div>
  )

  // Install banner
  if (!showBanner || installed) return <>{offlineIndicator}</>

  return (
    <>
      {offlineIndicator}
      <div
        className="fixed bottom-6 right-6 z-[200] max-w-xs rounded-2xl border overflow-hidden"
        style={{
          background: 'rgba(10,10,10,0.95)',
          borderColor: 'rgba(0,240,255,0.3)',
          boxShadow: '0 0 30px rgba(0,240,255,0.15), 0 0 60px rgba(0,240,255,0.05)',
          backdropFilter: 'blur(20px)',
          animation: 'spring-in 0.5s var(--spring-easing) both',
        }}
      >
        {/* Accent top bar */}
        <div
          className="h-0.5"
          style={{ background: 'linear-gradient(90deg, #00f0ff, #00d4ff, #00ffcc)' }}
        />

        <div className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,212,255,0.15))',
                border: '1px solid rgba(0,240,255,0.3)',
              }}
            >
              <Smartphone className="w-5 h-5 text-[#00f0ff]" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm text-white/80 mb-0.5">{t('pwa.installTitle')}</h4>
              <p className="text-[10px] text-white/30 leading-relaxed">{t('pwa.installDesc')}</p>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg hover:bg-white/5 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5 text-white/20" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleDismiss}
              className="flex-1 py-2 rounded-xl text-xs transition-all duration-300 border"
              style={{
                borderColor: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.4)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              {t('pwa.dismiss')}
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(0,240,255,0.2), rgba(0,212,255,0.2))',
                border: '1px solid rgba(0,240,255,0.4)',
                color: '#00f0ff',
                boxShadow: '0 0 12px rgba(0,240,255,0.15)',
              }}
            >
              <Download className="w-3.5 h-3.5" />
              {t('pwa.install')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
})
