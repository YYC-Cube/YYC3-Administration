/**
 * @file panels/layout-presets.ts
 * @description YYC³ Layout Presets — Pre-configured workspace layouts
 *   for different workflows (development, debugging, writing, analytics).
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 * @tags layout,presets,workspace
 */

import type { PanelType } from './panel-types'

// ==========================================
// Types
// ==========================================

export interface LayoutPreset {
  id: string
  name: string
  description: string
  icon: string
  /** Active panel in left sidebar */
  activePanel: PanelType
  /** Panel width in pixels */
  panelWidth: number
  /** Whether the left panel is collapsed */
  panelCollapsed: boolean
  /** Expanded folder IDs */
  expandedFolders: string[]
  /** Whether the editor is visible */
  editorVisible: boolean
  /** Whether the AI assistant is visible */
  aiAssistantVisible: boolean
  /** AI assistant width (if visible) */
  aiAssistantWidth: number
}

// ==========================================
// Built-in Presets
// ==========================================

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: 'development',
    name: '开发模式',
    description: '文件浏览 + 编辑器 + AI 助手三栏布局',
    icon: 'Code',
    activePanel: 'file-explorer',
    panelWidth: 280,
    panelCollapsed: false,
    expandedFolders: ['root', 'src', 'src/app', 'src/app/components'],
    editorVisible: true,
    aiAssistantVisible: true,
    aiAssistantWidth: 380,
  },
  {
    id: 'debugging',
    name: '调试模式',
    description: '文件浏览 + 编辑器 + Git 集成',
    icon: 'Bug',
    activePanel: 'git-integration',
    panelWidth: 300,
    panelCollapsed: false,
    expandedFolders: ['root', 'src'],
    editorVisible: true,
    aiAssistantVisible: false,
    aiAssistantWidth: 0,
  },
  {
    id: 'writing',
    name: '写作模式',
    description: '最大化编辑器，隐藏侧边栏',
    icon: 'PenTool',
    activePanel: 'file-explorer',
    panelWidth: 240,
    panelCollapsed: true,
    expandedFolders: ['root'],
    editorVisible: true,
    aiAssistantVisible: true,
    aiAssistantWidth: 320,
  },
  {
    id: 'analytics',
    name: '数据分析',
    description: '全局搜索 + 任务管理 + AI 助手',
    icon: 'BarChart3',
    activePanel: 'global-search',
    panelWidth: 320,
    panelCollapsed: false,
    expandedFolders: [],
    editorVisible: false,
    aiAssistantVisible: true,
    aiAssistantWidth: 420,
  },
  {
    id: 'minimal',
    name: '极简模式',
    description: '仅编辑器，无面板',
    icon: 'Minus',
    activePanel: 'file-explorer',
    panelWidth: 200,
    panelCollapsed: true,
    expandedFolders: [],
    editorVisible: true,
    aiAssistantVisible: false,
    aiAssistantWidth: 0,
  },
]

/**
 * Get a preset by ID.
 */
export function getPreset(id: string): LayoutPreset | undefined {
  return LAYOUT_PRESETS.find((p) => p.id === id)
}

/**
 * Save a custom user preset to localStorage.
 */
export function saveCustomPreset(preset: LayoutPreset): void {
  try {
    const existing = loadCustomPresets()
    const updated = [...existing.filter((p) => p.id !== preset.id), preset]
    localStorage.setItem('yyc3_custom_layouts', JSON.stringify(updated))
  } catch {
    /* ignore */
  }
}

/**
 * Load custom user presets from localStorage.
 */
export function loadCustomPresets(): LayoutPreset[] {
  try {
    const raw = localStorage.getItem('yyc3_custom_layouts')
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return []
}

/**
 * Delete a custom preset by ID.
 */
export function deleteCustomPreset(id: string): void {
  try {
    const existing = loadCustomPresets()
    const updated = existing.filter((p) => p.id !== id)
    localStorage.setItem('yyc3_custom_layouts', JSON.stringify(updated))
  } catch {
    /* ignore */
  }
}

/**
 * Get all presets (built-in + custom).
 */
export function getAllPresets(): LayoutPreset[] {
  return [...LAYOUT_PRESETS, ...loadCustomPresets()]
}
