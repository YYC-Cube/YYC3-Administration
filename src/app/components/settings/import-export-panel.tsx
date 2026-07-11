/**
 * @file components/settings/import-export-panel.tsx
 * @description Import/Export Panel - Backup and Migration
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-17
 * @updated 2026-03-17
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags settings,import,export,backup
 */

import { Download, Upload } from 'lucide-react'

import { useThemeColors } from '../hooks/use-theme-colors'

import { useSettingsStore } from '@/stores/useSettingsStore'

export function ImportExportPanel() {
  const tc = useThemeColors()
  const { exportConfig, importConfig } = useSettingsStore()

  const handleExport = () => {
    const config = exportConfig()
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `yyc3-settings-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const config = JSON.parse(event.target?.result as string)
            importConfig(config)
            alert('配置导入成功！')
          } catch {
            alert('配置文件格式错误')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: tc.primary }}>
          导入/导出
        </h2>
        <p style={{ color: tc.textSecondary }}>备份和迁移您的设置</p>
      </div>
      <div className="grid gap-4">
        <button
          onClick={handleExport}
          className="p-6 rounded-xl text-left transition-transform hover:scale-105"
          style={{
            background: tc.bgElevated,
            border: `1px solid ${tc.borderDefault}`,
          }}
        >
          <Download size={24} style={{ color: tc.secondary }} className="mb-3" />
          <h3 className="font-semibold mb-1" style={{ color: tc.textPrimary }}>
            导出配置
          </h3>
          <p className="text-sm" style={{ color: tc.textSecondary }}>
            将当前设置导出为 JSON 文件
          </p>
        </button>

        <button
          onClick={handleImport}
          className="p-6 rounded-xl text-left transition-transform hover:scale-105"
          style={{
            background: tc.bgElevated,
            border: `1px solid ${tc.borderDefault}`,
          }}
        >
          <Upload size={24} style={{ color: tc.accent }} className="mb-3" />
          <h3 className="font-semibold mb-1" style={{ color: tc.textPrimary }}>
            导入配置
          </h3>
          <p className="text-sm" style={{ color: tc.textSecondary }}>
            从 JSON 文件恢复设置
          </p>
        </button>
      </div>
    </div>
  )
}
