/**
 * @file multi-end.test.tsx
 * @description YYC3 multi-end module — comprehensive unit tests
 *   Covers: breakpoints, platform detection, PlatformAware, MobileBottomNav
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 */

import { render, screen } from '@testing-library/react'
import { createContext, useContext } from 'react'
import { describe, expect, it, vi } from 'vitest'

import {
  BREAKPOINTS,
  useBreakpoint,
  useIsDesktop,
  useIsMobile,
  useIsTablet,
} from '../../src/multi-end/breakpoints'
import { MobileBottomNav } from '../../src/multi-end/MobileBottomNav'
import {
  detectPlatform,
  getPlatformCapabilities,
  getPlatformLabel,
} from '../../src/multi-end/platform'
import {
  BreakpointAware,
  DesktopOnly,
  MobileOnly,
  PlatformAware,
} from '../../src/multi-end/PlatformAware'

import type { Breakpoint, PlatformCapabilities } from '../../src/multi-end'
import type { ReactNode } from 'react'

// ==========================================
// Mock app-context & i18n-context for MobileBottomNav
// ==========================================

const MockAppContext = createContext<{ activePage: string; setActivePage: (p: string) => void }>({
  activePage: 'dashboard',
  setActivePage: () => {},
})

vi.mock('../../src/app/components/app-context', () => ({
  useApp: () => useContext(MockAppContext),
  AppProvider: ({ children }: { children: ReactNode }) => children,
}))

vi.mock('../../src/app/components/i18n-context', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: 'zh-CN',
    setLocale: () => {},
  }),
}))

// ==========================================
// Mock window.innerWidth
// ==========================================

function setViewport(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    get: () => width,
  })
  window.dispatchEvent(new Event('resize'))
}

// ==========================================
// 1. Breakpoints
// ==========================================

describe('Breakpoints', () => {
  it('should define 5 breakpoint values', () => {
    expect(BREAKPOINTS.xs).toBe(0)
    expect(BREAKPOINTS.sm).toBe(480)
    expect(BREAKPOINTS.md).toBe(768)
    expect(BREAKPOINTS.lg).toBe(1024)
    expect(BREAKPOINTS.xl).toBe(1280)
  })

  it('should have ascending breakpoint values', () => {
    const values = Object.values(BREAKPOINTS)
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1])
    }
  })
})

describe('useIsMobile', () => {
  function TestComp() {
    return <div data-testid="result">{useIsMobile() ? 'mobile' : 'desktop'}</div>
  }

  it('returns true when viewport < 768px', () => {
    setViewport(480)
    render(<TestComp />)
    expect(screen.getByTestId('result').textContent).toBe('mobile')
  })

  it('returns false when viewport >= 768px', () => {
    setViewport(1024)
    render(<TestComp />)
    expect(screen.getByTestId('result').textContent).toBe('desktop')
  })
})

describe('useBreakpoint', () => {
  function TestComp() {
    return <div data-testid="bp">{useBreakpoint()}</div>
  }

  const cases: [number, Breakpoint][] = [
    [320, 'xs'],
    [479, 'xs'],
    [480, 'sm'],
    [767, 'sm'],
    [768, 'md'],
    [1023, 'md'],
    [1024, 'lg'],
    [1279, 'lg'],
    [1280, 'xl'],
    [1920, 'xl'],
  ]

  cases.forEach(([width, expected]) => {
    it(`returns "${expected}" at ${width}px`, () => {
      setViewport(width)
      render(<TestComp />)
      expect(screen.getByTestId('bp').textContent).toBe(expected)
    })
  })
})

describe('useIsTablet', () => {
  function TestComp() {
    return <div data-testid="result">{useIsTablet() ? 'tablet' : 'no'}</div>
  }

  it('returns true at 900px (md range)', () => {
    setViewport(900)
    render(<TestComp />)
    expect(screen.getByTestId('result').textContent).toBe('tablet')
  })

  it('returns false at 1200px', () => {
    setViewport(1200)
    render(<TestComp />)
    expect(screen.getByTestId('result').textContent).toBe('no')
  })
})

describe('useIsDesktop', () => {
  function TestComp() {
    return <div data-testid="result">{useIsDesktop() ? 'desktop' : 'no'}</div>
  }

  it('returns true at 1440px', () => {
    setViewport(1440)
    render(<TestComp />)
    expect(screen.getByTestId('result').textContent).toBe('desktop')
  })

  it('returns false at 500px', () => {
    setViewport(500)
    render(<TestComp />)
    expect(screen.getByTestId('result').textContent).toBe('no')
  })
})

// ==========================================
// 2. Platform Detection
// ==========================================

describe('Platform Detection', () => {
  it('detectPlatform returns a valid platform', () => {
    const platform = detectPlatform()
    expect(['web', 'pwa', 'mobile', 'desktop']).toContain(platform)
  })

  it('getPlatformCapabilities returns all required fields', () => {
    const caps = getPlatformCapabilities()
    const keys: (keyof PlatformCapabilities)[] = [
      'supportsWasm',
      'supportsWebGPU',
      'supportsIndexedDB',
      'supportsFileSystem',
      'supportsPushNotification',
      'maxStorageSize',
      'isTouchDevice',
      'isOfflineCapable',
      'isStandalone',
    ]
    keys.forEach((k) => expect(caps).toHaveProperty(k))
  })

  it('capability flags are booleans', () => {
    const caps = getPlatformCapabilities()
    expect(typeof caps.supportsWasm).toBe('boolean')
    expect(typeof caps.isTouchDevice).toBe('boolean')
  })

  it('maxStorageSize is positive', () => {
    const caps = getPlatformCapabilities()
    expect(caps.maxStorageSize).toBeGreaterThan(0)
  })

  it('getPlatformLabel returns Chinese labels', () => {
    const labels = getPlatformLabel()
    expect(labels.web).toBe('Web 端')
    expect(labels.pwa).toBe('PWA 应用')
    expect(labels.mobile).toBe('移动端')
    expect(labels.desktop).toBe('桌面端')
  })
})

// ==========================================
// 3. PlatformAware Components
// ==========================================

describe('PlatformAware', () => {
  it('renders children when platform matches', () => {
    render(
      <PlatformAware platforms={['web', 'pwa', 'mobile', 'desktop']}>
        <span data-testid="content">Visible</span>
      </PlatformAware>,
    )
    expect(screen.getByTestId('content')).toBeDefined()
  })

  it('renders fallback when platform mismatch', () => {
    render(
      <PlatformAware platforms={[]} fallback={<span data-testid="fb">FB</span>}>
        <span>Hidden</span>
      </PlatformAware>,
    )
    expect(screen.getByTestId('fb')).toBeDefined()
  })

  it('renders empty when no fallback and mismatch', () => {
    const { container } = render(
      <PlatformAware platforms={[]}>
        <span>Hidden</span>
      </PlatformAware>,
    )
    expect(container.innerHTML).toBe('')
  })
})

describe('MobileOnly', () => {
  it('renders on mobile viewport', () => {
    setViewport(480)
    const { container } = render(
      <MobileOnly>
        <span data-testid="m">M</span>
      </MobileOnly>,
    )
    expect(container.innerHTML).not.toBe('')
  })

  it('renders fallback on desktop viewport', () => {
    setViewport(1440)
    render(
      <MobileOnly fallback={<span data-testid="fb">FB</span>}>
        <span>M</span>
      </MobileOnly>,
    )
    expect(screen.getByTestId('fb')).toBeDefined()
  })
})

describe('DesktopOnly', () => {
  it('renders on desktop viewport', () => {
    setViewport(1440)
    render(
      <DesktopOnly>
        <span data-testid="d">D</span>
      </DesktopOnly>,
    )
    expect(screen.getByTestId('d')).toBeDefined()
  })

  it('hides on mobile viewport', () => {
    setViewport(480)
    const { container } = render(
      <DesktopOnly>
        <span>D</span>
      </DesktopOnly>,
    )
    expect(container.innerHTML).toBe('')
  })
})

describe('BreakpointAware', () => {
  it('renders when breakpoint matches', () => {
    setViewport(1440)
    render(
      <BreakpointAware breakpoints={['xl']}>
        <span data-testid="xl">XL</span>
      </BreakpointAware>,
    )
    expect(screen.getByTestId('xl')).toBeDefined()
  })

  it('renders fallback when breakpoint mismatches', () => {
    setViewport(480)
    render(
      <BreakpointAware breakpoints={['xl']} fallback={<span data-testid="fb">FB</span>}>
        <span>XL</span>
      </BreakpointAware>,
    )
    expect(screen.getByTestId('fb')).toBeDefined()
  })
})

// ==========================================
// 4. MobileBottomNav
// ==========================================

describe('MobileBottomNav', () => {
  it('renders on mobile viewport', () => {
    setViewport(480)
    const { container } = render(<MobileBottomNav />)
    expect(container.querySelector('nav')).toBeDefined()
  })

  it('does not render on desktop viewport', () => {
    setViewport(1440)
    const { container } = render(<MobileBottomNav />)
    expect(container.innerHTML).toBe('')
  })

  it('renders 5 navigation buttons', () => {
    setViewport(480)
    const { container } = render(<MobileBottomNav />)
    expect(container.querySelectorAll('button').length).toBe(5)
  })
})

// ==========================================
// 5. Integration
// ==========================================

describe('Integration', () => {
  it('BreakpointAware + MobileOnly works together', () => {
    setViewport(479)
    render(
      <MobileOnly>
        <BreakpointAware breakpoints={['xs']}>
          <span data-testid="xs-mobile">OK</span>
        </BreakpointAware>
      </MobileOnly>,
    )
    expect(screen.getByTestId('xs-mobile')).toBeDefined()
  })
})
