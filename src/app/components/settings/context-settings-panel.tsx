/**
 * @file components/settings/context-settings-panel.tsx
 * @description Context Settings Panel - Code Indexing & Document Management
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-17
 * @updated 2026-03-17
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags settings,context,indexing
 */

import { FolderTree } from 'lucide-react'

import { useThemeColors } from '../hooks/use-theme-colors'

import { useSettingsStore } from '@/stores/useSettingsStore'

export function ContextSettingsPanel() {
  const tc = useThemeColors()
  const { settings: _settings } = useSettingsStore()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: tc.primary }}>
          上下文管理
        </h2>
        <p style={{ color: tc.textSecondary }}>代码索引和文档集管理</p>
      </div>
      <div
        className="p-12 rounded-xl text-center"
        style={{ background: tc.bgElevated, border: `1px solid ${tc.borderSubtle}` }}
      >
        <FolderTree size={48} style={{ color: tc.textMuted }} className="mx-auto mb-4" />
        <p style={{ color: tc.textMuted }}>上下文管理面板</p>
      </div>
    </div>
  )
}
