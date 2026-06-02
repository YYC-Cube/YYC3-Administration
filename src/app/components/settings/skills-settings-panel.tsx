/**
 * @file components/settings/skills-settings-panel.tsx
 * @description Skills Settings Panel - Custom Skills Management
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-17
 * @updated 2026-03-17
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags settings,skills,custom
 */

import { Zap } from 'lucide-react'

import { useThemeColors } from '../hooks/use-theme-colors'

import { useSettingsStore } from '@/stores/useSettingsStore'

export function SkillsSettingsPanel() {
  const tc = useThemeColors()
  const { settings } = useSettingsStore()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: tc.primary }}>
          技能管理
        </h2>
        <p style={{ color: tc.textSecondary }}>自定义技能和能力 ({settings.skills.length} 个)</p>
      </div>
      <div
        className="p-12 rounded-xl text-center"
        style={{ background: tc.bgElevated, border: `1px solid ${tc.borderSubtle}` }}
      >
        <Zap size={48} style={{ color: tc.textMuted }} className="mx-auto mb-4" />
        <p style={{ color: tc.textMuted }}>技能管理面板</p>
      </div>
    </div>
  )
}
