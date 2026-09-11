/**
 * @file index.ts
 * @description Unified export index for all components
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2025-07-11
 * @tags components, export
 */

export { NeonCard } from '@/app/components/neon-card'
export { DashboardPage } from '@/features/overview/pages/dashboard-page'
export { AppOverviewPage } from '@/features/marketing/pages/app-overview-page'
export { ThemeSwitcherProvider, useThemeSwitcher } from '@/app/components/theme-switcher-context'
export { NAV_CATEGORIES } from '@/app/components/nav-config'

export * from '@/shared/ui'
export * from '@/shared/hooks'
