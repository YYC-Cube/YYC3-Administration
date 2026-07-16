/**
 * @file index.ts
 * @description Unified export index for all hooks
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2025-07-11
 * @tags hooks, export
 */

export {
  useThemeColors,
  getThemeNavColor,
  LIQUID_GLASS_NAV_COLORS,
  type ThemeColors,
} from './use-theme-colors'
export {
  useGlobalShortcuts,
  formatCombo,
  DEFAULT_SHORTCUTS,
  type ShortcutDef,
} from './use-global-shortcuts'
export { useThemeTokens } from './use-theme-tokens'
