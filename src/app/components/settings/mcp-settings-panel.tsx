/**
 * @file components/settings/mcp-settings-panel.tsx
 * @description MCP Settings Panel - Model Context Protocol Management
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-17
 * @updated 2026-03-17
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags settings,mcp,protocol
 */

import { Plug } from 'lucide-react'

import { useThemeColors } from '../hooks/use-theme-colors'

import { useSettingsStore } from '@/stores/useSettingsStore'

export function MCPSettingsPanel() {
  const tc = useThemeColors()
  const { settings } = useSettingsStore()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: tc.primary }}>
          MCP 连接管理
        </h2>
        <p style={{ color: tc.textSecondary }}>
          配置模型上下文协议连接 ({settings.mcpConfigs.length} 个)
        </p>
      </div>
      <div
        className="p-12 rounded-xl text-center"
        style={{ background: tc.bgElevated, border: `1px solid ${tc.borderSubtle}` }}
      >
        <Plug size={48} style={{ color: tc.textMuted }} className="mx-auto mb-4" />
        <p style={{ color: tc.textMuted }}>MCP 连接管理面板</p>
      </div>
    </div>
  )
}
