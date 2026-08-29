/**
 * @file model-settings-diagnostics.tsx
 * @description 模型设置 — 智能诊断面板(P2-③ 第三刀)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags models,settings,diagnostics
 */

import {
  Activity,
  ArrowRight,
  Bug,
  CheckCircle2,
  Clock,
  Cpu,
  Lightbulb,
  Loader2,
  RefreshCw,
  Wifi,
  XCircle,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useMemo, useState } from 'react'

import type {
  DiagnosticResult,
  ProviderDef,
} from '@/features/settings/model-settings/model-settings-data'

import { useI18n } from '@/app/components/i18n-context'
import { PROVIDERS } from '@/features/settings/model-settings/model-settings-data'
import { useThemeColors } from '@/shared/hooks/use-theme-colors'

function SmartDiagnosticsPanel({
  providers,
  apiKeys: _apiKeys,
  diagnostics,
  onRunDiagnostic,
  onSelectModel,
  activeModelKey,
}: {
  providers: ProviderDef[]
  apiKeys: Record<string, string>
  diagnostics: Record<string, DiagnosticResult>
  onRunDiagnostic: (providerId: string, modelId: string) => void
  onSelectModel: (providerId: string, modelId: string) => void
  activeModelKey: string | null
}) {
  const { t: i } = useI18n()
  const [running, setRunning] = useState(false)

  const allModels = useMemo(() => {
    const list: { providerId: string; providerName: string; modelId: string; modelName: string }[] =
      []
    providers.forEach((p) => {
      p.models.forEach((m) => {
        list.push({ providerId: p.id, providerName: p.shortName, modelId: m.id, modelName: m.name })
      })
    })
    return list
  }, [providers])

  const handleRunAll = async () => {
    setRunning(true)
    for (const m of allModels) {
      onRunDiagnostic(m.providerId, m.modelId)
      await new Promise((r) => setTimeout(r, 300))
    }
    setTimeout(() => setRunning(false), 2000)
  }

  const totalModels = allModels.length
  const testedModels = Object.values(diagnostics).filter(
    (d) => d.status === 'success' || d.status === 'error',
  ).length
  const onlineModels = Object.values(diagnostics).filter((d) => d.status === 'success').length
  const errorModels = Object.values(diagnostics).filter((d) => d.status === 'error').length
  const avgLatency = (() => {
    const latencies = Object.values(diagnostics)
      .filter((d) => d.latency != null)
      .map((d) => d.latency!)
    return latencies.length > 0
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
      : 0
  })()

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: i('ms.diagTotal'),
            value: String(totalModels),
            icon: Cpu,
            color: 'text-white/50',
          },
          {
            label: i('ms.diagTested'),
            value: String(testedModels),
            icon: Activity,
            color: 'text-cyan-400',
          },
          {
            label: i('ms.diagOnline'),
            value: String(onlineModels),
            icon: Wifi,
            color: 'text-emerald-400',
          },
          {
            label: i('ms.diagLatency'),
            value: avgLatency ? avgLatency + 'ms' : '-',
            icon: Clock,
            color: 'text-amber-400',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] text-center"
          >
            <card.icon className={`w-4 h-4 ${card.color} mx-auto mb-1`} />
            <div className={`text-[16px] ${card.color}`}>{card.value}</div>
            <div className="text-[9px] text-white/20 mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Run all diagnostics */}
      <button
        onClick={handleRunAll}
        disabled={running}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/15 text-cyan-400 text-[12px] hover:from-cyan-500/20 hover:to-blue-500/20 transition-all disabled:opacity-50"
      >
        {running ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Activity className="w-4 h-4" />
        )}
        {running ? i('ms.diagRunning') : i('ms.diagRunAll')}
      </button>

      {/* Results by provider */}
      {providers.map((provider) => {
        const providerDiags = provider.models
          .map((m) => ({ model: m, diag: diagnostics[provider.id + ':' + m.id] }))
          .filter((d) => d.diag)
        if (providerDiags.length === 0) return null
        return (
          <div key={provider.id} className="space-y-1.5">
            <div className="flex items-center gap-2">
              <provider.icon className={`w-3.5 h-3.5 ${provider.color}`} />
              <span className="text-[11px] text-white/50">{i(provider.name)}</span>
              <span className="text-[9px] text-white/15">
                {i('ms.onlineCount', {
                  count:
                    providerDiags.filter((d) => d.diag.status === 'success').length +
                    '/' +
                    providerDiags.length,
                })}
              </span>
            </div>
            {providerDiags.map(({ model, diag }) => {
              const modelKey = provider.id + ':' + model.id
              const isActive = activeModelKey === modelKey
              return (
                <div
                  key={model.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all group ${
                    isActive
                      ? 'bg-[#00f0ff]/[0.06] border border-[#00f0ff]/20'
                      : diag.status === 'success'
                        ? 'bg-emerald-500/[0.03] border border-emerald-500/10 hover:border-emerald-500/20'
                        : diag.status === 'error'
                          ? 'bg-red-500/[0.03] border border-red-500/10'
                          : 'bg-white/[0.01] border border-white/[0.04]'
                  }`}
                >
                  {isActive ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00f0ff] shrink-0" />
                  ) : diag.status === 'success' ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400/60 shrink-0" />
                  ) : diag.status === 'error' ? (
                    <XCircle className="w-3 h-3 text-red-400/60 shrink-0" />
                  ) : (
                    <Loader2 className="w-3 h-3 text-cyan-400/60 animate-spin shrink-0" />
                  )}
                  <span
                    className={`text-[10px] flex-1 ${isActive ? 'text-[#00f0ff]' : 'text-white/50'}`}
                  >
                    {model.name}
                  </span>
                  {isActive && (
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[#00f0ff]/20 text-[#00f0ff]/80 border border-[#00f0ff]/20 shrink-0">
                      {i('ms.currentModel')}
                    </span>
                  )}
                  {diag.latency != null && (
                    <span
                      className={`text-[9px] ${isActive ? 'text-[#00f0ff]/50' : diag.status === 'success' ? 'text-emerald-400/40' : 'text-white/20'}`}
                    >
                      {diag.latency}ms
                    </span>
                  )}
                  {diag.status === 'error' && (
                    <span className="text-[9px] text-red-400/50 max-w-[180px] truncate">
                      {diag.message}
                    </span>
                  )}
                  {diag.status === 'success' && !isActive && (
                    <button
                      onClick={() => onSelectModel(provider.id, model.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] text-[#00f0ff]/60 hover:text-[#00f0ff] hover:bg-[#00f0ff]/10 border border-transparent hover:border-[#00f0ff]/15 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                    >
                      <ArrowRight className="w-3 h-3" />
                      {i('ms.diagSelectUse')}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}

      {/* AI suggestions */}
      {errorModels > 0 && (
        <div className="rounded-xl border border-amber-500/15 bg-gradient-to-br from-amber-500/[0.04] to-orange-500/[0.02] p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span className="text-[12px] text-amber-400/80">{i('ms.diagSuggestTitle')}</span>
          </div>
          <div className="space-y-1.5 pl-6">
            {Object.values(diagnostics)
              .filter((d) => d.status === 'error')
              .slice(0, 3)
              .map((diag, idx) => (
                <div key={idx} className="text-[10px] text-white/35 flex items-start gap-1.5">
                  <Bug className="w-3 h-3 text-amber-400/40 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-amber-400/50">{diag.modelName}</strong>:{' '}
                    {diag.message.includes('401')
                      ? i('ms.diagSuggest401')
                      : diag.message.includes('429')
                        ? i('ms.diagSuggest429')
                        : diag.message.includes('网络') ||
                            diag.message.includes('Network') ||
                            diag.message.includes('fetch')
                          ? i('ms.diagSuggestNetwork')
                          : diag.message.includes('超时') ||
                              diag.message.includes('timeout') ||
                              diag.message.includes('Timeout')
                            ? i('ms.diagSuggestTimeout')
                            : i('ms.diagSuggestDefault')}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ================================================================
   Main Component: ModelSettings
   ================================================================ */

export { SmartDiagnosticsPanel }
