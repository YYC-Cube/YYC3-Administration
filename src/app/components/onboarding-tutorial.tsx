import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Layers,
  LayoutDashboard,
  Search,
  Settings,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { useApp } from './app-context'
import { useI18n } from './i18n-context'

import type { ReactNode } from 'react'

// ==========================================
// YYC³ 新手引导教程 — Onboarding Tutorial
// Cyberpunk-themed step-by-step highlight guide
// ==========================================

interface TutorialStep {
  id: string
  titleKey: string
  descKey: string
  icon: (props: { className?: string; style?: React.CSSProperties }) => ReactNode
  color: string
  highlight: 'sidebar' | 'header' | 'dashboard' | 'search' | 'notification' | 'settings' | 'center'
  tipKey?: string
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    titleKey: 'onboard.welcomeTitle',
    descKey: 'onboard.welcomeDesc',
    icon: Layers,
    color: '#00f0ff',
    highlight: 'center',
    tipKey: 'onboard.welcomeTip',
  },
  {
    id: 'sidebar',
    titleKey: 'onboard.sidebarTitle',
    descKey: 'onboard.sidebarDesc',
    icon: ChevronRight,
    color: '#00f0ff',
    highlight: 'sidebar',
    tipKey: 'onboard.sidebarTip',
  },
  {
    id: 'dashboard',
    titleKey: 'onboard.dashboardTitle',
    descKey: 'onboard.dashboardDesc',
    icon: LayoutDashboard,
    color: '#00d4ff',
    highlight: 'dashboard',
    tipKey: 'onboard.dashboardTip',
  },
  {
    id: 'search',
    titleKey: 'onboard.searchTitle',
    descKey: 'onboard.searchDesc',
    icon: Search,
    color: '#00ffcc',
    highlight: 'search',
    tipKey: 'onboard.searchTip',
  },
  {
    id: 'notification',
    titleKey: 'onboard.notifTitle',
    descKey: 'onboard.notifDesc',
    icon: Bell,
    color: '#008b9d',
    highlight: 'notification',
    tipKey: 'onboard.notifTip',
  },
  {
    id: 'settings',
    titleKey: 'onboard.settingsTitle',
    descKey: 'onboard.settingsDesc',
    icon: Settings,
    color: '#005f73',
    highlight: 'settings',
    tipKey: 'onboard.settingsTip',
  },
]

/**
 * Multi-step onboarding tutorial overlay.
 * Guides new users through key features with step indicators, navigation
 * controls, and skip functionality. Persists completion status via `AppContext`.
 */
export function OnboardingTutorial() {
  const { onboardingDone, setOnboardingDone } = useApp()
  const { t } = useI18n()
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (!onboardingDone) {
      const timer = setTimeout(() => setIsVisible(true), 800)
      return () => clearTimeout(timer)
    }
  }, [onboardingDone])

  const handleComplete = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      setOnboardingDone(true)
      setIsVisible(false)
      setIsExiting(false)
    }, 400)
  }, [setOnboardingDone])

  const handleNext = useCallback(() => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleComplete()
    }
  }, [currentStep, handleComplete])

  const handlePrev = useCallback(() => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1)
  }, [currentStep])

  const handleSkip = useCallback(() => {
    handleComplete()
  }, [handleComplete])

  // Keyboard navigation
  useEffect(() => {
    if (!isVisible || onboardingDone) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext()
      else if (e.key === 'ArrowLeft') handlePrev()
      else if (e.key === 'Escape') handleSkip()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isVisible, onboardingDone, handleNext, handlePrev, handleSkip])

  if (onboardingDone || !isVisible) return null

  const step = tutorialSteps[currentStep]
  const Icon = step.icon
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{
        animation: isExiting
          ? 'tutorial-fade-out 0.4s ease-out forwards'
          : 'tutorial-fade-in 0.5s ease-out both',
      }}
    >
      {/* Backdrop with spotlight */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
        }}
        onClick={handleSkip}
      />

      {/* Highlight indicator */}
      {step.highlight !== 'center' && (
        <div
          className="absolute pointer-events-none transition-all duration-700"
          style={{
            ...(step.highlight === 'sidebar'
              ? { left: 0, top: 64, bottom: 40, width: 70 }
              : step.highlight === 'header'
                ? { left: 0, right: 0, top: 0, height: 64 }
                : step.highlight === 'dashboard'
                  ? { left: 70, top: 64, right: 0, bottom: 40 }
                  : step.highlight === 'search'
                    ? { right: 130, top: 10, width: 100, height: 44 }
                    : step.highlight === 'notification'
                      ? { right: 90, top: 10, width: 44, height: 44 }
                      : step.highlight === 'settings'
                        ? { left: 70, top: 64, right: 0, bottom: 40 }
                        : {}),
            border: `2px solid ${step.color}60`,
            borderRadius: 16,
            boxShadow: `0 0 30px ${step.color}30, 0 0 60px ${step.color}15, inset 0 0 30px ${step.color}10`,
            animation: 'border-glow 2s ease-in-out infinite',
          }}
        />
      )}

      {/* Main tutorial card */}
      <div
        className="relative z-10 w-[90vw] max-w-lg mx-4 rounded-2xl border overflow-hidden"
        style={{
          background: 'rgba(10,10,10,0.95)',
          borderColor: `${step.color}40`,
          boxShadow: `0 0 40px ${step.color}30, 0 0 80px ${step.color}10, inset 0 0 30px rgba(0,0,0,0.5)`,
          backdropFilter: 'blur(20px)',
          animation: isExiting ? 'none' : 'spring-in 0.5s var(--spring-easing) 0.1s both',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar progress */}
        <div className="h-1 relative" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${step.color}, #00d4ff)`,
              boxShadow: `0 0 8px ${step.color}`,
            }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 transition-colors z-20"
          title={t('onboard.skip')}
        >
          <X className="w-4 h-4 text-white/25 hover:text-white/60" />
        </button>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Step counter */}
          <div className="flex items-center gap-2 mb-5">
            <span
              className="text-[9px] px-2 py-0.5 rounded-full tracking-wider uppercase"
              style={{
                background: `${step.color}12`,
                border: `1px solid ${step.color}30`,
                color: step.color,
              }}
            >
              {currentStep + 1} / {tutorialSteps.length}
            </span>
            <span className="text-[9px] text-white/15 tracking-wider">ONBOARDING</span>
          </div>

          {/* Icon + Title */}
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: `${step.color}15`,
                border: `1px solid ${step.color}30`,
                boxShadow: `0 0 20px ${step.color}25, inset 0 0 10px ${step.color}10`,
              }}
            >
              <Icon className="w-7 h-7" style={{ color: step.color }} />
            </div>
            <div>
              <h3
                className="text-white/90 text-base sm:text-lg tracking-wide"
                style={{ textShadow: `0 0 15px ${step.color}40` }}
              >
                {t(step.titleKey)}
              </h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-white/50 leading-relaxed mb-4">{t(step.descKey)}</p>

          {/* Tip */}
          {step.tipKey && (
            <div
              className="flex items-start gap-2 px-3 py-2.5 rounded-xl mb-6"
              style={{
                background: `${step.color}08`,
                border: `1px solid ${step.color}15`,
              }}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: step.color }} />
              <p className="text-[11px]" style={{ color: `${step.color}90` }}>
                {t(step.tipKey)}
              </p>
            </div>
          )}

          {/* Step dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {tutorialSteps.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrentStep(i)}
                className="transition-all duration-300"
                style={{
                  width: i === currentStep ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background:
                    i === currentStep
                      ? step.color
                      : i < currentStep
                        ? `${step.color}50`
                        : 'rgba(255,255,255,0.08)',
                  boxShadow: i === currentStep ? `0 0 8px ${step.color}` : 'none',
                }}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handleSkip}
              className="text-xs text-white/20 hover:text-white/40 transition-colors px-3 py-2"
            >
              {t('onboard.skip')}
            </button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs transition-all duration-300 border"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderColor: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  {t('onboard.prev')}
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-5 py-2 rounded-xl text-xs transition-all duration-300 border"
                style={{
                  background: `${step.color}15`,
                  borderColor: `${step.color}40`,
                  color: step.color,
                  boxShadow: `0 0 12px ${step.color}20`,
                }}
              >
                {currentStep < tutorialSteps.length - 1 ? (
                  <div className="contents">
                    {t('onboard.next')}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="contents">
                    <Zap className="w-3.5 h-3.5" />
                    {t('onboard.finish')}
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom decorative line */}
        <div
          className="h-0.5"
          style={{
            background: `linear-gradient(90deg, transparent, ${step.color}40, #00d4ff40, transparent)`,
          }}
        />
      </div>
    </div>
  )
}
