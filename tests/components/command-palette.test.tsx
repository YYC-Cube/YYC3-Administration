/**
 * @file command-palette.test.tsx
 * @description CommandPalette — Smoke Tests
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 */

import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AppProvider } from '../../src/app/components/app-context'
import { I18nProvider } from '../../src/app/components/i18n-context'
import { ThemeSwitcherProvider } from '../../src/app/components/theme-switcher-context'

import type { ReactNode } from 'react'

const TestWrapper = ({ children }: { children: ReactNode }) => (
  <ThemeSwitcherProvider defaultTheme="cyberpunk">
    <I18nProvider>
      <AppProvider>{children}</AppProvider>
    </I18nProvider>
  </ThemeSwitcherProvider>
)

describe('CommandPalette — Smoke', () => {
  it('renders without crashing when open', async () => {
    const { CommandPalette } = await import('../../src/app/components/command-palette')
    const { container } = render(<CommandPalette open={true} onClose={() => {}} />, {
      wrapper: TestWrapper,
    })
    expect(container).toBeTruthy()
  })

  it('renders without crashing when closed', async () => {
    const { CommandPalette } = await import('../../src/app/components/command-palette')
    const { container } = render(<CommandPalette open={false} onClose={() => {}} />, {
      wrapper: TestWrapper,
    })
    expect(container).toBeTruthy()
  })
})
