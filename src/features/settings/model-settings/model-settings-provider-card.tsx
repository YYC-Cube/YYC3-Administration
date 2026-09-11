/**
 * @file model-settings-provider-card.tsx
 * @description 模型设置 — 服务商卡片与复制按钮(P2-③ 第四刀)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags models,settings,providers
 */

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bot,
  Box,
  Brain,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Cloud,
  Copy,
  Cpu,
  Database,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  FileCode2,
  Github,
  Globe,
  KeyRound,
  Layers,
  Loader2,
  MessageSquare,
  MinusCircle,
  PlusCircle,
  RefreshCw,
  Rocket,
  Server,
  Shield,
  Sparkles,
  Star,
  Trash2,
  Wifi,
  X,
  XCircle,
  Zap,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import type {
  DiagnosticResult,
  ModelDef,
  ProviderDef,
} from '@/features/settings/model-settings/model-settings-data'

import { useI18n } from '@/app/components/i18n-context'
import { PROVIDERS } from '@/features/settings/model-settings/model-settings-data'
import { useThemeColors } from '@/shared/hooks/use-theme-colors'

function CopyButton({ text }: { text: string }) {
  const { t: i } = useI18n()
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).catch(() => {})
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="p-1 rounded text-white/20 hover:text-white/50 hover:bg-white/[0.04] transition-all"
      title={i('ms.copy')}
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
    </button>
  )
}

/* ================================================================
   Provider Card
   ================================================================ */

function ProviderCard({
  provider,
  apiKey,
  customUrl,
  onApiKeyChange,
  onUrlChange,
  onAddModel,
  onRemoveModel,
  onTestConnection,
  onSelectModel,
  activeModelKey,
  diagnostics,
  expanded,
  onToggle,
  onRemoveProvider,
  isCustom,
}: {
  provider: ProviderDef
  apiKey: string
  customUrl: string
  onApiKeyChange: (key: string) => void
  onUrlChange: (url: string) => void
  onAddModel: (model: ModelDef) => void
  onRemoveModel: (modelId: string) => void
  onTestConnection: (modelId: string) => void
  onSelectModel: (modelId: string) => void
  activeModelKey: string | null
  diagnostics: Record<string, DiagnosticResult>
  expanded: boolean
  onToggle: () => void
  onRemoveProvider?: () => void
  isCustom?: boolean
}) {
  const [showKey, setShowKey] = useState(false)
  const [addingModel, setAddingModel] = useState(false)
  const [newModelName, setNewModelName] = useState('')
  const [newModelId, setNewModelId] = useState('')
  const [editingUrl, setEditingUrl] = useState(false)
  const [urlDraft, setUrlDraft] = useState(customUrl || provider.baseURL)
  const { t: i } = useI18n()
  const Icon = provider.icon

  const activeUrl = customUrl || provider.baseURL

  const hasAnyOnline = Object.values(diagnostics).some((d) => d.status === 'success')
  const hasAnyError = Object.values(diagnostics).some((d) => d.status === 'error')
  const isTesting = Object.values(diagnostics).some((d) => d.status === 'testing')
  const hasActiveModel = activeModelKey ? activeModelKey.startsWith(provider.id + ':') : false

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all ${
        hasActiveModel
          ? 'border-[#00f0ff]/25 bg-[#00f0ff]/[0.02]'
          : 'border-white/[0.06] bg-white/[0.02]'
      }`}
      style={{
        boxShadow: hasActiveModel
          ? '0 0 20px -6px rgba(0,240,255,0.12), inset 0 1px 0 rgba(255,255,255,0.04)'
          : 'inset 0 1px 0 rgba(255,255,255,0.02)',
      }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] transition-all"
      >
        <div
          className={`w-8 h-8 rounded-lg ${provider.colorBg} border ${provider.colorBorder} flex items-center justify-center`}
        >
          <Icon className={`w-4 h-4 ${provider.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-white/85">{i(provider.name)}</span>
            {provider.openaiCompatible && (
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#00f0ff]/10 text-[#00f0ff]/50 border border-[#00f0ff]/10">
                {i('ms.openaiCompat')}
              </span>
            )}
          </div>
          <div className="text-[10px] text-white/25 mt-0.5">{i(provider.description)}</div>
        </div>
        {/* Status indicator */}
        <div className="flex items-center gap-2">
          {hasActiveModel && (
            <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[#00f0ff]/20 text-[#00f0ff]/70 border border-[#00f0ff]/15 shrink-0">
              {i('ms.inUse')}
            </span>
          )}
          {apiKey && (
            <div
              className="w-2 h-2 rounded-full bg-emerald-400/60"
              title={i('ms.apiKeyConfigured')}
            />
          )}
          {hasAnyOnline && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/60" />}
          {hasAnyError && !hasAnyOnline && <AlertCircle className="w-3.5 h-3.5 text-red-400/60" />}
          {isTesting && <Loader2 className="w-3.5 h-3.5 text-cyan-400/60 animate-spin" />}
          <span className="text-[10px] text-white/20">
            {i('ms.modelCount', { count: provider.models.length })}
          </span>
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-white/20" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-white/20" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/[0.04]">
          {/* API Endpoint */}
          <div className="pt-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-white/30 uppercase tracking-wider">
                {i('ms.apiEndpoint')}
              </label>
              <div className="flex items-center gap-1">
                {!editingUrl ? (
                  <button
                    onClick={() => {
                      setEditingUrl(true)
                      setUrlDraft(activeUrl)
                    }}
                    className="text-[9px] text-white/20 hover:text-white/50 px-1.5 py-0.5 rounded hover:bg-white/[0.04] transition-all"
                  >
                    <Edit3 className="w-3 h-3 inline mr-1" />
                    {i('ms.edit')}
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        onUrlChange(urlDraft)
                        setEditingUrl(false)
                      }}
                      className="text-[9px] text-emerald-400/70 hover:text-emerald-400 px-1.5 py-0.5 rounded hover:bg-emerald-500/10 transition-all"
                    >
                      <Check className="w-3 h-3 inline mr-0.5" />
                      {i('ms.save')}
                    </button>
                    <button
                      onClick={() => setEditingUrl(false)}
                      className="text-[9px] text-white/20 hover:text-white/50 px-1.5 py-0.5 rounded hover:bg-white/[0.04] transition-all"
                    >
                      {i('ms.cancel')}
                    </button>
                  </div>
                )}
                <CopyButton text={activeUrl} />
              </div>
            </div>
            {editingUrl ? (
              <input
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[11px] text-white/70 font-mono focus:outline-none focus:border-[#00f0ff]/40"
              />
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[11px] text-white/40 font-mono truncate flex-1">
                  {activeUrl}
                </span>
              </div>
            )}
          </div>

          {/* API Key */}
          {provider.id !== 'ollama' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-white/30 uppercase tracking-wider">
                  {i('ms.apiKey')}
                </label>
                {provider.apiKeyUrl && (
                  <a
                    href={provider.apiKeyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[9px] text-[#00f0ff]/60 hover:text-[#00f0ff] transition-all"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {i('ms.getApiKey')}
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => onApiKeyChange(e.target.value)}
                    placeholder={i(provider.apiKeyPlaceholder)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 pr-8 text-[11px] text-white/70 font-mono focus:outline-none focus:border-[#00f0ff]/40 placeholder:text-white/10"
                  />
                  <button
                    onClick={() => setShowKey((p) => !p)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/15 hover:text-white/40 transition-all"
                  >
                    {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              {!apiKey && (
                <div className="flex items-center gap-1.5 text-[10px] text-amber-400/50">
                  <AlertCircle className="w-3 h-3" />
                  <span>{i('ms.noApiKey')}</span>
                </div>
              )}
            </div>
          )}

          {/* Models list */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-white/30 uppercase tracking-wider">
                {i('ms.modelList')}
              </label>
              <button
                onClick={() => setAddingModel(true)}
                className="flex items-center gap-1 text-[9px] text-white/25 hover:text-white/50 px-1.5 py-0.5 rounded hover:bg-white/[0.04] transition-all"
              >
                <PlusCircle className="w-3 h-3" /> {i('ms.addModel')}
              </button>
            </div>
            <div className="space-y-1">
              {provider.models.map((model) => {
                const diag = diagnostics[model.id]
                const modelKey = provider.id + ':' + model.id
                const isActive = activeModelKey === modelKey
                return (
                  <div
                    key={model.id}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all group ${
                      isActive
                        ? 'bg-[#00f0ff]/[0.08] border border-[#00f0ff]/25'
                        : 'bg-white/[0.01] hover:bg-white/[0.03] border border-transparent'
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        isActive
                          ? 'bg-[#00f0ff]'
                          : diag?.status === 'success'
                            ? 'bg-emerald-400'
                            : diag?.status === 'error'
                              ? 'bg-red-400'
                              : diag?.status === 'testing'
                                ? 'bg-cyan-400 animate-pulse'
                                : 'bg-white/10'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] ${isActive ? 'text-[#00f0ff]' : 'text-white/60'}`}
                        >
                          {model.name}
                        </span>
                        {isActive && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[#00f0ff]/20 text-[#00f0ff]/80 border border-[#00f0ff]/20">
                            {i('ms.currentModel')}
                          </span>
                        )}
                        {model.contextWindow && (
                          <span className="text-[8px] text-white/15 bg-white/[0.03] px-1 py-0.5 rounded">
                            {model.contextWindow}
                          </span>
                        )}
                      </div>
                      <div className="text-[9px] text-white/20 truncate">
                        {i(model.description)}
                      </div>
                    </div>
                    {model.pricing && (
                      <span className="text-[8px] text-white/15">{model.pricing}</span>
                    )}
                    {diag?.status === 'success' && diag.latency != null && (
                      <span className="text-[9px] text-emerald-400/50">{diag.latency}ms</span>
                    )}
                    <div className="flex items-center gap-0.5">
                      {!isActive && (
                        <button
                          onClick={() => onSelectModel(model.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] text-[#00f0ff]/60 hover:text-[#00f0ff] hover:bg-[#00f0ff]/10 transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-[#00f0ff]/15"
                          title={i('ms.selectModel')}
                        >
                          <ArrowRight className="w-3 h-3" />
                          <span>{i('ms.useModel')}</span>
                        </button>
                      )}
                      <button
                        onClick={() => onTestConnection(model.id)}
                        disabled={diag?.status === 'testing'}
                        className="p-1 rounded text-white/15 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all opacity-0 group-hover:opacity-100"
                        title={i('ms.testConnection')}
                      >
                        {diag?.status === 'testing' ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Zap className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        onClick={() => onRemoveModel(model.id)}
                        className="p-1 rounded text-white/15 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                        title={i('ms.removeModel')}
                      >
                        <MinusCircle className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Add model form */}
            {addingModel && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-[#00f0ff]/20 bg-[#00f0ff]/[0.03]">
                <input
                  value={newModelId}
                  onChange={(e) => setNewModelId(e.target.value)}
                  placeholder={i('ms.modelIdPlaceholder')}
                  className="flex-1 bg-transparent text-[11px] text-white/70 font-mono placeholder:text-white/15 focus:outline-none"
                />
                <input
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  placeholder={i('ms.displayNamePlaceholder')}
                  className="flex-1 bg-transparent text-[11px] text-white/70 placeholder:text-white/15 focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (newModelId && newModelName) {
                      onAddModel({
                        id: newModelId,
                        name: newModelName,
                        description: i('ms.customModel'),
                      })
                      setNewModelId('')
                      setNewModelName('')
                      setAddingModel(false)
                    }
                  }}
                  disabled={!newModelId || !newModelName}
                  className="p-1 text-emerald-400/60 hover:text-emerald-400 disabled:opacity-30 transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setAddingModel(false)
                    setNewModelId('')
                    setNewModelName('')
                  }}
                  className="p-1 text-white/20 hover:text-white/50 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Test all + diagnostics summary */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => provider.models.forEach((m) => onTestConnection(m.id))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] transition-all border ${provider.colorBg} ${provider.colorBorder} ${provider.color}`}
            >
              <Activity className="w-3 h-3" /> {i('ms.testAll')}
            </button>
            {provider.docsUrl && (
              <a
                href={provider.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] text-white/25 hover:text-white/50 hover:bg-white/[0.04] transition-all border border-white/[0.04]"
              >
                <FileCode2 className="w-3 h-3" /> {i('ms.apiDocs')}
              </a>
            )}
            {isCustom && onRemoveProvider && (
              <button
                onClick={onRemoveProvider}
                className="flex items-center gap-1 ml-auto px-3 py-1.5 rounded-lg text-[10px] text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all border border-red-500/10"
              >
                <Trash2 className="w-3 h-3" /> {i('ms.removeProvider')}
              </button>
            )}
          </div>

          {/* Diagnostic error details */}
          {Object.entries(diagnostics)
            .filter(([, d]) => d.status === 'error')
            .map(([modelId, diag]) => (
              <div
                key={modelId}
                className="px-3 py-2 rounded-lg bg-red-500/[0.04] border border-red-500/10 space-y-1"
              >
                <div className="flex items-center gap-1.5">
                  <XCircle className="w-3 h-3 text-red-400/60" />
                  <span className="text-[10px] text-red-400/70">{diag.modelName}</span>
                  {diag.latency != null && (
                    <span className="text-[9px] text-white/15 ml-auto">{diag.latency}ms</span>
                  )}
                </div>
                <div className="text-[9px] text-white/30 pl-4.5">{diag.message}</div>
              </div>
            ))}
          {Object.entries(diagnostics)
            .filter(([, d]) => d.status === 'success' && d.modelResponse)
            .map(([modelId, diag]) => (
              <div
                key={modelId}
                className="px-3 py-2 rounded-lg bg-emerald-500/[0.03] border border-emerald-500/10 space-y-1"
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400/60" />
                  <span className="text-[10px] text-emerald-400/70">{diag.modelName}</span>
                  <span className="text-[9px] text-emerald-400/30 ml-auto">{diag.latency}ms</span>
                </div>
                <div className="text-[9px] text-white/25 pl-4.5 font-mono">
                  {diag.modelResponse}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

/* ================================================================
   MCP Config Panel
   ================================================================ */

export { CopyButton, ProviderCard }
