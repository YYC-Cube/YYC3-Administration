/**
 * @file components/settings/models-settings-panel.tsx
 * @description Models Settings Panel - AI Model Configuration
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-17
 * @updated 2026-03-17
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags settings,models,ai
 */

import { Cpu } from 'lucide-react'

import { useThemeColors } from '../hooks/use-theme-colors'

import { useSettingsStore } from '@/stores/useSettingsStore'

export function ModelsSettingsPanel() {
  const tc = useThemeColors()
  const { settings } = useSettingsStore()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: tc.primary }}>
          模型配置
        </h2>
        <p style={{ color: tc.textSecondary }}>管理AI模型和API密钥 ({settings.models.length} 个)</p>
      </div>
      <div
        className="p-12 rounded-xl text-center"
        style={{ background: tc.bgElevated, border: `1px solid ${tc.borderSubtle}` }}
      >
        <Cpu size={48} style={{ color: tc.textMuted }} className="mx-auto mb-4" />
        <p style={{ color: tc.textMuted }}>模型配置面板</p>
      </div>
    </div>
  )
}
