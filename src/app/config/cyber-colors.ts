/**
 * YYC³ Cyberpunk Color System - Unified Cyan Theme
 * 统一青色调配色方案，简化视觉层次
 */

export const CYBER_COLORS = {
  // Primary Cyan Shades (主青色系)
  primary: '#00f0ff',        // 主青色 - 核心交互元素
  primaryLight: '#00ffff',   // 浅青色 - 高亮状态
  primaryDark: '#00d0df',    // 深青色 - Hover状态
  
  // Secondary Cyan-Green Shades (青绿色系 - 替代原品红/黄色)
  secondary: '#00d4ff',      // 浅蓝青 - 替代品红
  accent: '#00ffcc',         // 青绿色 - 替代黄色
  success: '#00ffc8',        // 成功/完成 - 替代绿色
  highlight: '#41ffdd',      // 高亮青绿 - 特殊强调
  
  // Neutral & Status (中性/状态色)
  muted: '#008b9d',          // 暗青色 - 次要元素/设置
  warning: '#00b8d4',        // 警告青 - 替代橙色
  destructive: '#ff0040',    // 保留红色 - 危险/删除操作
  
  // Opacity Variants (透明度变体)
  primaryAlpha10: 'rgba(0, 240, 255, 0.1)',
  primaryAlpha20: 'rgba(0, 240, 255, 0.2)',
  primaryAlpha40: 'rgba(0, 240, 255, 0.4)',
  primaryAlpha60: 'rgba(0, 240, 255, 0.6)',
  
  secondaryAlpha10: 'rgba(0, 212, 255, 0.1)',
  secondaryAlpha20: 'rgba(0, 212, 255, 0.2)',
  secondaryAlpha40: 'rgba(0, 212, 255, 0.4)',
  
  accentAlpha10: 'rgba(0, 255, 204, 0.1)',
  accentAlpha20: 'rgba(0, 255, 204, 0.2)',
  accentAlpha40: 'rgba(0, 255, 204, 0.4)',
} as const;

/**
 * Color Mapping - Old Multi-Color to New Unified Cyan
 * 旧配色到新统一青色的映射关系
 */
export const COLOR_MIGRATION = {
  '#ff00ff': CYBER_COLORS.secondary,    // 品红 → 浅蓝青
  '#ffff00': CYBER_COLORS.accent,       // 黄色 → 青绿色
  '#00ff41': CYBER_COLORS.success,      // 绿色 → 成功青绿
  '#ff8c00': CYBER_COLORS.highlight,    // 橙色 → 高亮青绿
  '#ff0040': CYBER_COLORS.destructive,  // 保留红色
  '#00f0ff': CYBER_COLORS.primary,      // 主青色保持
} as const;

/**
 * Gradient Presets (渐变预设)
 */
export const CYBER_GRADIENTS = {
  primary: `linear-gradient(135deg, ${CYBER_COLORS.primary}, ${CYBER_COLORS.primaryLight})`,
  secondary: `linear-gradient(135deg, ${CYBER_COLORS.secondary}, ${CYBER_COLORS.accent})`,
  accent: `linear-gradient(135deg, ${CYBER_COLORS.accent}, ${CYBER_COLORS.highlight})`,
  brand: `linear-gradient(135deg, ${CYBER_COLORS.primary}, ${CYBER_COLORS.accent})`,
} as const;

/**
 * Shadow Presets (阴影预设)
 */
export const CYBER_SHADOWS = {
  primary: `0 0 15px ${CYBER_COLORS.primaryAlpha40}`,
  secondary: `0 0 15px ${CYBER_COLORS.secondaryAlpha40}`,
  accent: `0 0 15px ${CYBER_COLORS.accentAlpha40}`,
  glow: `0 0 20px ${CYBER_COLORS.primaryAlpha60}, 0 0 40px ${CYBER_COLORS.primaryAlpha40}`,
} as const;
