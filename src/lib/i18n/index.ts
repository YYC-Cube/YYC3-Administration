/**
 * @yyc3/i18n-core — Module Entry (Inlined)
 *
 * Source-referenced from docs/i18n-core with paths adapted for direct
 * consumption by the host Vite + React + TypeScript project.
 */

// Core Engine
export { I18nEngine, i18n, t } from './engine'
export type { I18nEngineConfig } from './engine'

// Cache System
export { LRUCache } from './cache'
export type { CacheConfig, CacheStats } from './cache'

// Plugin System
export { PluginManager } from './plugins'
export type { I18nContext, I18nPlugin } from './plugins'

// Built-in Plugins
export { MissingKeyReporter, PerformanceTracker, createConsoleLogger } from './plugins/index'

// Formatter utilities
export { formatRelativeTime, interpolate, pluralize } from './formatter'
export type { TranslateParams } from './formatter'

// Locale detection
export { detectSystemLocale, isChineseLocale, normalizeLocale } from './detector'
export type { LocaleDetectionResult } from './detector'

// RTL Utilities
export {
  RTL_LOCALES,
  createMirroredLayout,
  flipSpacing,
  getAlignment,
  getDirection,
  getOppositeAlignment,
  isRTL,
  mirrorPosition,
  setupDocumentDirection,
  transformClassForRTL,
} from './rtl-utils'

// Core Types
export type {
  HorizontalAlignment,
  Locale,
  RTLLocale,
  SpacingProperty,
  TextDirection,
  TranslationMap,
} from './types'

// Registry
export { SUPPORTED_LOCALES, isSupportedLocale } from './registry'
