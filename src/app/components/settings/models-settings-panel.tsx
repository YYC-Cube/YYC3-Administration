/**
 * @file components/settings/models-settings-panel.tsx
 * @description Models Settings Panel — AI 模型统一入口
 *   P2-① 收敛后,模型/密钥/多服务商配置的编辑 UI 统一在全局模型设置
 *   (ModelSettings,加密存储于 useAIModelStore);本面板仅作概览与跳转。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags settings,models,ai
 */

import { Cpu, KeyRound, ShieldCheck } from 'lucide-react'

import { useThemeColors } from '../hooks/use-theme-colors'

import { useAIModelStore } from '@/stores/useAIModelStore'

export function ModelsSettingsPanel() {
  const tc = useThemeColors()
  const aiModels = useAIModelStore((s) => s.aiModels)
  const activeModelId = useAIModelStore((s) => s.activeModelId)
  const openModelSettings = useAIModelStore((s) => s.openModelSettings)
  const activeModel = aiModels.find((m) => m.id === activeModelId) ?? null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: tc.primary }}>
          模型配置
        </h2>
        <p style={{ color: tc.textSecondary }}>
          AI 模型统一管理({aiModels.length} 个配置,激活:
          {activeModel ? activeModel.name : '未激活'})
        </p>
      </div>

      <div
        className="p-8 rounded-xl text-center space-y-3"
        style={{ background: tc.bgElevated, border: `1px solid ${tc.borderSubtle}` }}
      >
        <Cpu size={40} style={{ color: tc.textMuted }} className="mx-auto" />
        <p style={{ color: tc.textSecondary }} className="text-sm">
          模型、API 密钥与多服务商配置已收敛至全局模型设置
        </p>
        <p
          className="text-xs flex items-center justify-center gap-1.5"
          style={{ color: tc.textMuted }}
        >
          <ShieldCheck size={12} /> 密钥经 AES-GCM 加密存储
          <KeyRound size={12} /> 聊天 / AI 助手 / 编辑器快捷操作共享同一配置
        </p>
        <button
          type="button"
          onClick={openModelSettings}
          data-testid="open-model-settings-from-settings"
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
          style={{
            background: tc.bgInput,
            border: `1px solid ${tc.borderDefault}`,
            color: tc.primary,
          }}
        >
          ⚙️ 打开模型设置
        </button>
      </div>
    </div>
  )
}
