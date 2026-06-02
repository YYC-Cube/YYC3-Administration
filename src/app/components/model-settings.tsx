import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bot,
  Bug,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Cloud,
  Copy,
  Cpu,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  FileCode2,
  Globe,
  Lightbulb,
  Loader2,
  MinusCircle,
  Plug,
  Plus,
  PlusCircle,
  RefreshCw,
  Search,
  Server,
  Settings2,
  Shield,
  Sparkles,
  Terminal,
  Trash2,
  Wifi,
  X,
  XCircle,
  Zap,
} from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { type AIModel, useAIModel } from './ai-model-context'
import { useThemeTokens } from './hooks/use-theme-tokens'
import { useI18n } from './i18n-context'

/* ================================================================
   Types
   ================================================================ */

interface ProviderDef {
  id: string
  name: string
  shortName: string
  icon: React.ElementType
  color: string
  colorBg: string
  colorBorder: string
  description: string
  baseURL: string
  apiKeyUrl: string
  apiKeyPlaceholder: string
  models: ModelDef[]
  openaiCompatible: boolean
  docsUrl: string
}

interface ModelDef {
  id: string
  name: string
  description: string
  contextWindow?: string
  pricing?: string
}

interface MCPServerConfig {
  id: string
  name: string
  description: string
  command: string
  args: string[]
  env: Record<string, string>
  enabled: boolean
}

interface DiagnosticResult {
  providerId: string
  modelName: string
  status: 'idle' | 'testing' | 'success' | 'error'
  latency?: number
  message: string
  modelResponse?: string
  timestamp?: number
}

interface OllamaDetectedModel {
  name: string
  size: string
  status: 'online' | 'offline'
  quantization: string
}

/* ================================================================
   Provider Definitions
   ================================================================ */

const PROVIDERS: ProviderDef[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    shortName: 'GPT',
    icon: Cloud,
    color: 'text-emerald-400',
    colorBg: 'bg-emerald-500/10',
    colorBorder: 'border-emerald-500/20',
    description: 'ms.prov.openai.desc',
    baseURL: 'https://api.openai.com/v1/chat/completions',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    apiKeyPlaceholder: 'sk-proj-...',
    openaiCompatible: true,
    docsUrl: 'https://platform.openai.com/docs',
    models: [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'ms.mdl.gpt4o',
        contextWindow: '128K',
        pricing: '$2.5/1M input',
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o-mini',
        description: 'ms.mdl.gpt4oMini',
        contextWindow: '128K',
        pricing: '$0.15/1M input',
      },
      {
        id: 'o3-mini',
        name: 'o3-mini',
        description: 'ms.mdl.o3Mini',
        contextWindow: '128K',
        pricing: '$1.1/1M input',
      },
      {
        id: 'o4-mini',
        name: 'o4-mini',
        description: 'ms.mdl.o4Mini',
        contextWindow: '200K',
        pricing: '$1.1/1M input',
      },
    ],
  },
  {
    id: 'claude',
    name: 'Anthropic',
    shortName: 'Claude',
    icon: Shield,
    color: 'text-orange-400',
    colorBg: 'bg-orange-500/10',
    colorBorder: 'border-orange-500/20',
    description: 'ms.prov.claude.desc',
    baseURL: 'https://api.anthropic.com/v1/messages',
    apiKeyUrl: 'https://console.anthropic.com/settings/keys',
    apiKeyPlaceholder: 'sk-ant-...',
    openaiCompatible: false,
    docsUrl: 'https://docs.anthropic.com',
    models: [
      {
        id: 'claude-sonnet-4-20250514',
        name: 'Claude Sonnet 4',
        description: 'ms.mdl.claudeSonnet4',
        contextWindow: '200K',
        pricing: '$3/1M input',
      },
      {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku',
        description: 'ms.mdl.claudeHaiku',
        contextWindow: '200K',
        pricing: '$0.8/1M input',
      },
    ],
  },
  {
    id: 'zhipu',
    name: 'ms.prov.zhipu.name',
    shortName: 'GLM',
    icon: Cpu,
    color: 'text-blue-400',
    colorBg: 'bg-blue-500/10',
    colorBorder: 'border-blue-500/20',
    description: 'ms.prov.zhipu.desc',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    apiKeyUrl: 'https://open.bigmodel.cn/usercenter/apikeys',
    apiKeyPlaceholder: 'ms.prov.zhipu.keyHint',
    openaiCompatible: true,
    docsUrl: 'https://open.bigmodel.cn/dev/api/normal-model/glm-4',
    models: [
      { id: 'glm-5', name: 'GLM-5', description: 'ms.mdl.glm5', contextWindow: '128K' },
      { id: 'glm-4.7', name: 'GLM-4.7', description: 'ms.mdl.glm47' },
      { id: 'glm-4.6', name: 'GLM-4.6', description: 'ms.mdl.glm46' },
      { id: 'glm-4.5', name: 'GLM-4.5', description: 'ms.mdl.glm45', contextWindow: '128K' },
      { id: 'glm-4.5-air', name: 'GLM-4.5-Air', description: 'ms.mdl.glm45Air' },
    ],
  },
  {
    id: 'qwen',
    name: 'ms.prov.qwen.name',
    shortName: 'QWEN',
    icon: Globe,
    color: 'text-purple-400',
    colorBg: 'bg-purple-500/10',
    colorBorder: 'border-purple-500/20',
    description: 'ms.prov.qwen.desc',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    apiKeyUrl: 'https://dashscope.console.aliyun.com/apiKey',
    apiKeyPlaceholder: 'sk-...',
    openaiCompatible: true,
    docsUrl: 'https://help.aliyun.com/zh/model-studio/getting-started/first-api-call-to-qwen',
    models: [
      { id: 'qwen3-max', name: 'Qwen3-Max', description: 'ms.mdl.qwen3Max', contextWindow: '128K' },
      { id: 'qwen-plus', name: 'Qwen-Plus', description: 'ms.mdl.qwenPlus', contextWindow: '128K' },
      {
        id: 'qwen3-coder-plus',
        name: 'Qwen3-Coder-Plus',
        description: 'ms.mdl.qwen3Coder',
        contextWindow: '128K',
      },
      {
        id: 'qwen-vl-max',
        name: 'Qwen-VL-Max',
        description: 'ms.mdl.qwenVlMax',
        contextWindow: '32K',
      },
    ],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    shortName: 'DS',
    icon: Zap,
    color: 'text-cyan-400',
    colorBg: 'bg-cyan-500/10',
    colorBorder: 'border-cyan-500/20',
    description: 'ms.prov.deepseek.desc',
    baseURL: 'https://api.deepseek.com/v1/chat/completions',
    apiKeyUrl: 'https://platform.deepseek.com/api_keys',
    apiKeyPlaceholder: 'sk-...',
    openaiCompatible: true,
    docsUrl: 'https://api-docs.deepseek.com',
    models: [
      {
        id: 'deepseek-chat',
        name: 'DeepSeek V3.2',
        description: 'ms.mdl.dsChat',
        contextWindow: '128K',
        pricing: '$0.27/1M input',
      },
      {
        id: 'deepseek-reasoner',
        name: 'DeepSeek R1',
        description: 'ms.mdl.dsReasoner',
        contextWindow: '128K',
        pricing: '$0.55/1M input',
      },
    ],
  },
  {
    id: 'ollama',
    name: 'ms.prov.ollama.name',
    shortName: 'Local',
    icon: Server,
    color: 'text-amber-400',
    colorBg: 'bg-amber-500/10',
    colorBorder: 'border-amber-500/20',
    description: 'ms.prov.ollama.desc',
    baseURL: 'http://localhost:11434/api/chat',
    apiKeyUrl: '',
    apiKeyPlaceholder: '',
    openaiCompatible: false,
    docsUrl: 'https://ollama.com',
    models: [], // Auto-detected via /api/tags scan
  },
]

const DEFAULT_MCP_SERVERS: MCPServerConfig[] = [
  {
    id: 'mcp-filesystem',
    name: 'Filesystem',
    description: 'ms.mcp.filesystem',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/app/designs'],
    env: {},
    enabled: true,
  },
  {
    id: 'mcp-fetch',
    name: 'Fetch',
    description: 'ms.mcp.fetch',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-fetch'],
    env: {},
    enabled: true,
  },
  {
    id: 'mcp-postgres',
    name: 'PostgreSQL',
    description: 'ms.mcp.postgres',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-postgres'],
    env: { DATABASE_URL: 'postgresql://user:pwd@localhost:5432/yanyucloud' },
    enabled: false,
  },
]

/* ================================================================
   Local Storage Helpers
   ================================================================ */

const STORAGE_KEYS = {
  providerKeys: 'yyc3-provider-api-keys',
  providerUrls: 'yyc3-provider-urls',
  mcpServers: 'yyc3-mcp-servers',
  customProviders: 'yyc3-custom-providers',
  ollamaCache: 'yanyucloud_ollama_cache_',
}

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
function saveJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* noop */
  }
}

/* ================================================================
   Sub-Components
   ================================================================ */

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

function MCPConfigPanel() {
  const { t: i } = useI18n()
  const [servers, setServers] = useState<MCPServerConfig[]>(() =>
    loadJSON(STORAGE_KEYS.mcpServers, DEFAULT_MCP_SERVERS),
  )
  const [addingServer, setAddingServer] = useState(false)
  const [newServer, setNewServer] = useState({
    name: '',
    command: '',
    args: '',
    env: '',
    description: '',
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [jsonMode, setJsonMode] = useState(false)
  const [jsonDraft, setJsonDraft] = useState('')
  const [jsonError, setJsonError] = useState('')

  useEffect(() => {
    saveJSON(STORAGE_KEYS.mcpServers, servers)
  }, [servers])

  const handleToggle = (id: string) => {
    setServers((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)))
  }
  const handleRemove = (id: string) => {
    setServers((prev) => prev.filter((s) => s.id !== id))
  }
  const handleAdd = () => {
    if (!newServer.name || !newServer.command) return
    let envObj: Record<string, string> = {}
    try {
      if (newServer.env) envObj = JSON.parse(newServer.env)
    } catch {
      /* invalid json */
    }
    const server: MCPServerConfig = {
      id: 'mcp-' + Date.now(),
      name: newServer.name,
      description: newServer.description || newServer.name,
      command: newServer.command,
      args: newServer.args ? newServer.args.split(/\s+/) : [],
      env: envObj,
      enabled: true,
    }
    setServers((prev) => [...prev, server])
    setNewServer({ name: '', command: '', args: '', env: '', description: '' })
    setAddingServer(false)
  }

  const handleExportJson = () => {
    const mcpConfig: Record<string, any> = { mcpServers: {} }
    servers
      .filter((s) => s.enabled)
      .forEach((s) => {
        mcpConfig.mcpServers[s.name.toLowerCase()] = {
          command: s.command,
          args: s.args,
          ...(Object.keys(s.env).length > 0 ? { env: s.env } : {}),
        }
      })
    setJsonDraft(JSON.stringify(mcpConfig, null, 2))
    setJsonMode(true)
    setJsonError('')
  }

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonDraft)
      const mcpServers = parsed.mcpServers || parsed
      const imported: MCPServerConfig[] = Object.entries(mcpServers).map(
        ([name, conf]: [string, any]) => ({
          id: 'mcp-' + Date.now() + '-' + name,
          name,
          description: conf.description || name,
          command: conf.command || '',
          args: conf.args || [],
          env: conf.env || {},
          enabled: true,
        }),
      )
      setServers(imported)
      setJsonMode(false)
      setJsonError('')
    } catch (e: unknown) {
      setJsonError(i('ms.jsonParseFail', { msg: e instanceof Error ? e.message : String(e) }))
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Plug className="w-4 h-4 text-violet-400" />
          <span className="text-[12px] text-white/70">{i('ms.mcpTitle')}</span>
          <span className="text-[9px] text-white/20 bg-white/[0.03] px-1.5 py-0.5 rounded">
            {i('ms.mcpEnabled', {
              enabled: servers.filter((s) => s.enabled).length,
              total: servers.length,
            })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1 px-2 py-1 rounded text-[9px] text-white/25 hover:text-white/50 hover:bg-white/[0.04] transition-all"
          >
            <Terminal className="w-3 h-3" /> {jsonMode ? i('ms.listMode') : i('ms.jsonMode')}
          </button>
        </div>
      </div>

      {/* JSON Mode */}
      {jsonMode && (
        <div className="space-y-2">
          <textarea
            value={jsonDraft}
            onChange={(e) => {
              setJsonDraft(e.target.value)
              setJsonError('')
            }}
            rows={12}
            className="w-full bg-black/20 border border-white/[0.06] rounded-lg px-3 py-2 text-[10px] text-white/60 font-mono focus:outline-none focus:border-violet-500/40 resize-none"
            placeholder='{"mcpServers": { "filesystem": { "command": "npx", "args": [...] } }}'
          />
          {jsonError && (
            <div className="text-[10px] text-red-400/70 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {jsonError}
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={handleImportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/15 border border-violet-500/20 text-violet-400 text-[10px] hover:bg-violet-500/25 transition-all"
            >
              <Check className="w-3 h-3" /> {i('ms.importJson')}
            </button>
            <button
              onClick={() => setJsonMode(false)}
              className="px-3 py-1.5 rounded-lg text-white/30 text-[10px] hover:bg-white/[0.04] transition-all"
            >
              {i('ms.cancel')}
            </button>
            <CopyButton text={jsonDraft} />
          </div>
          <div className="text-[9px] text-white/20 px-1">{i('ms.mcpJsonDesc')}</div>
        </div>
      )}

      {/* Server list */}
      {!jsonMode && (
        <div className="space-y-2">
          {servers.map((server) => (
            <div
              key={server.id}
              className={`rounded-xl border p-3 space-y-2 transition-all ${
                server.enabled
                  ? 'border-white/[0.06] bg-white/[0.02]'
                  : 'border-white/[0.03] bg-white/[0.01] opacity-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <button onClick={() => handleToggle(server.id)} className="shrink-0">
                  <div
                    className={`w-8 h-4 rounded-full transition-all ${server.enabled ? 'bg-violet-500/30' : 'bg-white/[0.06]'}`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full transition-all mt-[1px] ${
                        server.enabled ? 'bg-violet-400 ml-[17px]' : 'bg-white/20 ml-[1px]'
                      }`}
                    />
                  </div>
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-white/60">{server.name}</div>
                  <div className="text-[9px] text-white/20">{i(server.description)}</div>
                </div>
                <button
                  onClick={() => setEditingId(editingId === server.id ? null : server.id)}
                  className="p-1 rounded text-white/15 hover:text-white/40 hover:bg-white/[0.04] transition-all"
                >
                  <Settings2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleRemove(server.id)}
                  className="p-1 rounded text-white/15 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {editingId === server.id && (
                <div className="space-y-2 pl-10">
                  <div className="text-[9px] text-white/20 space-y-1 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-white/30 w-16 shrink-0">command:</span>
                      <span className="text-white/50">{server.command}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-white/30 w-16 shrink-0">args:</span>
                      <span className="text-white/50 break-all">{JSON.stringify(server.args)}</span>
                    </div>
                    {Object.keys(server.env).length > 0 && (
                      <div className="flex items-start gap-2">
                        <span className="text-white/30 w-16 shrink-0">env:</span>
                        <span className="text-white/50 break-all">
                          {JSON.stringify(server.env)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add server */}
          {addingServer ? (
            <div className="rounded-xl border border-dashed border-violet-500/20 bg-violet-500/[0.03] p-3 space-y-2">
              <div className="text-[10px] text-violet-400/70 mb-1">{i('ms.addMcpServer')}</div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={newServer.name}
                  onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                  placeholder={i('ms.mcpNamePlaceholder')}
                  className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5 text-[10px] text-white/70 font-mono focus:outline-none focus:border-violet-500/40 placeholder:text-white/10"
                />
                <input
                  value={newServer.command}
                  onChange={(e) => setNewServer({ ...newServer, command: e.target.value })}
                  placeholder={i('ms.mcpCommandPlaceholder')}
                  className="bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5 text-[10px] text-white/70 font-mono focus:outline-none focus:border-violet-500/40 placeholder:text-white/10"
                />
              </div>
              <input
                value={newServer.args}
                onChange={(e) => setNewServer({ ...newServer, args: e.target.value })}
                placeholder={i('ms.mcpArgsPlaceholder')}
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5 text-[10px] text-white/70 font-mono focus:outline-none focus:border-violet-500/40 placeholder:text-white/10"
              />
              <input
                value={newServer.env}
                onChange={(e) => setNewServer({ ...newServer, env: e.target.value })}
                placeholder={i('ms.mcpEnvPlaceholder')}
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5 text-[10px] text-white/70 font-mono focus:outline-none focus:border-violet-500/40 placeholder:text-white/10"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={!newServer.name || !newServer.command}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-500/15 text-violet-400 text-[10px] hover:bg-violet-500/25 transition-all disabled:opacity-30 border border-violet-500/20"
                >
                  <Plus className="w-3 h-3" /> {i('ms.add')}
                </button>
                <button
                  onClick={() => setAddingServer(false)}
                  className="px-3 py-1.5 rounded-lg text-white/30 text-[10px] hover:bg-white/[0.04] transition-all"
                >
                  {i('ms.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingServer(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-white/[0.06] text-white/20 hover:text-white/40 hover:border-white/[0.12] transition-all text-[11px]"
            >
              <Plus className="w-3.5 h-3.5" /> {i('ms.addMcpServer')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ================================================================
   Smart Diagnostics Panel
   ================================================================ */

function SmartDiagnosticsPanel({
  providers,
  apiKeys,
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

type TabKey = 'providers' | 'ollama' | 'mcp' | 'diagnostics'

/**
 * AI Model Settings modal.
 * Full-featured multi-tab configuration panel for managing AI service providers
 * (OpenAI, Ollama, custom), MCP tool connections, and diagnostic testing.
 * Supports add/edit/delete models, API key management, endpoint configuration,
 * and real-time connectivity diagnostics with streaming test.
 */
export function ModelSettings() {
  const {
    modelSettingsOpen,
    closeModelSettings,
    aiModels,
    addAIModel,
    removeAIModel,
    updateAIModel,
    activateAIModel,
    activeModelId,
  } = useAIModel()
  const t = useThemeTokens()
  const { t: i } = useI18n()

  const [activeTab, setActiveTab] = useState<TabKey>('providers')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedProvider, setExpandedProvider] = useState<string | null>('zhipu')

  // Provider API keys & URLs (persisted)
  const [apiKeys, setApiKeys] = useState<Record<string, string>>(() =>
    loadJSON(STORAGE_KEYS.providerKeys, {}),
  )
  const [customUrls, setCustomUrls] = useState<Record<string, string>>(() =>
    loadJSON(STORAGE_KEYS.providerUrls, {}),
  )

  // Custom providers (user-added)
  const [customProviders, setCustomProviders] = useState<ProviderDef[]>(() =>
    loadJSON(STORAGE_KEYS.customProviders, []),
  )
  const [addingProvider, setAddingProvider] = useState(false)
  const [newProvider, setNewProvider] = useState({ name: '', baseURL: '', apiKeyUrl: '' })

  // Diagnostics
  const [diagnostics, setDiagnostics] = useState<Record<string, DiagnosticResult>>({})

  // Pending activation
  const pendingActivationRef = useRef<string | null>(null)
  const [selectionToast, setSelectionToast] = useState<string | null>(null)

  // Ollama
  const [ollamaHost, setOllamaHost] = useState('http://localhost:11434')
  const [ollamaScanning, setOllamaScanning] = useState(false)
  const [ollamaModels, setOllamaModels] = useState<OllamaDetectedModel[]>([])
  const [ollamaConnected, setOllamaConnected] = useState(false)

  // Auto-activate newly added model if pending
  useEffect(() => {
    const pendingName = pendingActivationRef.current
    if (!pendingName) return
    const found = aiModels.find((m) => m.name === pendingName && !m.isActive)
    if (found) {
      pendingActivationRef.current = null
      activateAIModel(found.id)
    }
  }, [aiModels, activateAIModel])

  // Persist keys & urls
  useEffect(() => {
    saveJSON(STORAGE_KEYS.providerKeys, apiKeys)
  }, [apiKeys])
  useEffect(() => {
    saveJSON(STORAGE_KEYS.providerUrls, customUrls)
  }, [customUrls])
  useEffect(() => {
    saveJSON(STORAGE_KEYS.customProviders, customProviders)
  }, [customProviders])

  // Sync API keys from provider config to store models
  useEffect(() => {
    for (const provider of [...PROVIDERS, ...customProviders]) {
      const key = apiKeys[provider.id]
      if (!key) continue
      const url = customUrls[provider.id] || provider.baseURL
      for (const storeModel of aiModels) {
        if (storeModel.endpoint === url && storeModel.apiKey !== key) {
          const isMatch = provider.models.some(
            (m) => m.id === storeModel.name || m.name === storeModel.name,
          )
          if (isMatch) {
            updateAIModel(storeModel.id, { apiKey: key })
          }
        }
      }
    }
  }, [apiKeys, customUrls, customProviders, aiModels, updateAIModel])

  // All providers = built-in + custom
  const allProviders = useMemo(() => [...PROVIDERS, ...customProviders], [customProviders])

  // Filtered providers
  const filteredProviders = useMemo(() => {
    if (!searchQuery) return allProviders
    const q = searchQuery.toLowerCase()
    return allProviders.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.models.some((m) => m.name.toLowerCase().includes(q)),
    )
  }, [allProviders, searchQuery])

  // Provider-scoped model mutations
  const handleProviderAddModel = useCallback((providerId: string, model: ModelDef) => {
    setCustomProviders((prev) =>
      prev.map((p) => (p.id === providerId ? { ...p, models: [...p.models, model] } : p)),
    )
  }, [])

  const handleProviderRemoveModel = useCallback((providerId: string, modelId: string) => {
    setCustomProviders((prev) =>
      prev.map((p) =>
        p.id === providerId ? { ...p, models: p.models.filter((m) => m.id !== modelId) } : p,
      ),
    )
  }, [])

  // Real diagnostic test — actual HTTP connectivity check
  const handleTestConnection = useCallback(
    (providerId: string, modelId: string) => {
      const provider = allProviders.find((p) => p.id === providerId)
      if (!provider) return
      const model = provider.models.find((m) => m.id === modelId)
      if (!model) return
      const diagKey = providerId + ':' + modelId
      const providerApiKey = apiKeys[providerId] || ''
      const url = customUrls[providerId] || provider.baseURL

      if (providerId !== 'ollama' && !providerApiKey) {
        setDiagnostics((prev) => ({
          ...prev,
          [diagKey]: {
            providerId,
            modelName: model.name,
            status: 'error',
            message: i('ms.testNoApiKey'),
            timestamp: Date.now(),
          },
        }))
        return
      }
      if (!url) {
        setDiagnostics((prev) => ({
          ...prev,
          [diagKey]: {
            providerId,
            modelName: model.name,
            status: 'error',
            message: i('ms.testNoUrl'),
            timestamp: Date.now(),
          },
        }))
        return
      }

      setDiagnostics((prev) => ({
        ...prev,
        [diagKey]: {
          providerId,
          modelName: model.name,
          status: 'testing',
          message: i('ms.testSending'),
          timestamp: Date.now(),
        },
      }))

      const start = performance.now()
      const controller = new AbortController()
      const timeoutMs = 20000
      const timer = setTimeout(() => controller.abort(), timeoutMs)

      const setResult = (
        result: Omit<DiagnosticResult, 'providerId' | 'modelName' | 'timestamp'>,
      ) => {
        setDiagnostics((prev) => ({
          ...prev,
          [diagKey]: { providerId, modelName: model.name, timestamp: Date.now(), ...result },
        }))
      }

      ;(async () => {
        try {
          let resp: Response
          if (providerId === 'ollama') {
            const ollamaBase = url.replace(/\/+$/, '')
            const chatUrl = ollamaBase.includes('/api/chat')
              ? ollamaBase
              : ollamaBase.replace(/\/api\/.*$/, '') + '/api/chat'
            resp = await fetch(chatUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: model.id,
                messages: [{ role: 'user', content: 'Hi, respond with exactly: YANYUCLOUD_OK' }],
                stream: false,
              }),
              signal: controller.signal,
            })
          } else if (providerId === 'claude') {
            resp = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': providerApiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true',
              },
              body: JSON.stringify({
                model: model.id,
                max_tokens: 20,
                messages: [{ role: 'user', content: 'Hi, respond with exactly: YANYUCLOUD_OK' }],
              }),
              signal: controller.signal,
            })
          } else {
            resp = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + providerApiKey,
              },
              body: JSON.stringify({
                model: model.id,
                messages: [{ role: 'user', content: 'Hi, respond with exactly: YANYUCLOUD_OK' }],
                stream: false,
                max_tokens: 20,
                temperature: 0,
              }),
              signal: controller.signal,
            })
          }

          clearTimeout(timer)
          const latency = Math.round(performance.now() - start)

          if (!resp.ok) {
            const errText = await resp.text().catch(() => '')
            let detail = ''
            try {
              const j = JSON.parse(errText)
              detail = j.error?.message || j.message || errText.slice(0, 200)
            } catch {
              detail = errText.slice(0, 200)
            }
            const s = resp.status
            const statusMsg =
              s === 401
                ? i('ms.testError401')
                : s === 403
                  ? i('ms.testError403')
                  : s === 404
                    ? providerId === 'ollama'
                      ? i('ms.testError404Ollama', { model: model.id })
                      : i('ms.testError404')
                    : s === 429
                      ? i('ms.testError429')
                      : 'HTTP ' + s
            setResult({
              status: 'error',
              message: statusMsg + (detail ? '。' + detail : ''),
              latency,
            })
            return
          }

          const data = await resp.json().catch(() => null)
          let reply = ''
          if (providerId === 'ollama') reply = data?.message?.content || ''
          else if (providerId === 'claude') reply = data?.content?.[0]?.text || ''
          else reply = data?.choices?.[0]?.message?.content || data?.result || ''

          setResult({
            status: 'success',
            message: i('ms.testSuccess'),
            latency,
            modelResponse: reply.slice(0, 100),
          })
        } catch (err: unknown) {
          clearTimeout(timer)
          const latency = Math.round(performance.now() - start)
          if (err instanceof DOMException && err.name === 'AbortError') {
            setResult({
              status: 'error',
              message: i('ms.testTimeout', { seconds: String(timeoutMs / 1000) }),
              latency,
            })
            return
          }
          const msg = err instanceof Error ? err.message : ''
          const networkMsg =
            msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('fetch')
              ? i('ms.testNetworkFail')
              : i('ms.testException', { msg: msg.slice(0, 200) })
          setResult({ status: 'error', message: networkMsg, latency })
        }
      })()
    },
    [allProviders, apiKeys, customUrls, i],
  )

  // Select model — add to store if needed + activate
  const handleSelectModel = useCallback(
    (providerId: string, modelId: string) => {
      const provider = allProviders.find((p) => p.id === providerId)
      if (!provider) return
      const model = provider.models.find((m) => m.id === modelId)
      if (!model) return
      const url = customUrls[providerId] || provider.baseURL
      const key = apiKeys[providerId] || ''
      const providerType: AIModel['provider'] =
        providerId === 'openai' ? 'openai' : providerId === 'ollama' ? 'ollama' : 'custom'

      const storeModelName = model.id

      const existing = aiModels.find(
        (m) => (m.name === storeModelName || m.name === model.name) && m.endpoint === url,
      )

      if (existing) {
        updateAIModel(existing.id, { apiKey: key, name: storeModelName })
        activateAIModel(existing.id)
      } else {
        pendingActivationRef.current = storeModelName
        addAIModel({
          name: storeModelName,
          provider: providerType,
          endpoint: url,
          apiKey: key,
          isActive: false,
        })
      }
      setSelectionToast(model.name)
      setTimeout(() => setSelectionToast(null), 2500)
    },
    [allProviders, customUrls, apiKeys, aiModels, activateAIModel, addAIModel, updateAIModel],
  )

  // Compute the "active model key" (providerId:modelId)
  const activeModelKey = useMemo(() => {
    if (!activeModelId) return null
    const activeModel = aiModels.find((m) => m.id === activeModelId)
    if (!activeModel) return null

    for (const provider of allProviders) {
      const url = customUrls[provider.id] || provider.baseURL
      for (const model of provider.models) {
        if (
          (activeModel.name === model.id || activeModel.name === model.name) &&
          activeModel.endpoint === url
        ) {
          return provider.id + ':' + model.id
        }
      }
    }
    for (const provider of allProviders) {
      for (const model of provider.models) {
        const n = activeModel.name.toLowerCase()
        if (n === model.name.toLowerCase() || n === model.id.toLowerCase()) {
          return provider.id + ':' + model.id
        }
      }
    }
    return null
  }, [activeModelId, aiModels, allProviders, customUrls])

  // Add custom provider
  const handleAddProvider = useCallback(() => {
    if (!newProvider.name || !newProvider.baseURL) return
    const id = 'custom-' + Date.now()
    const provider: ProviderDef = {
      id,
      name: newProvider.name,
      shortName: newProvider.name.slice(0, 4),
      icon: Bot,
      color: 'text-pink-400',
      colorBg: 'bg-pink-500/10',
      colorBorder: 'border-pink-500/20',
      description: i('ms.customProviderDesc'),
      baseURL: newProvider.baseURL,
      apiKeyUrl: newProvider.apiKeyUrl,
      apiKeyPlaceholder: 'sk-...',
      openaiCompatible: true,
      docsUrl: '',
      models: [],
    }
    setCustomProviders((prev) => [...prev, provider])
    setNewProvider({ name: '', baseURL: '', apiKeyUrl: '' })
    setAddingProvider(false)
    setExpandedProvider(id)
  }, [newProvider, i])

  const handleRemoveProvider = useCallback((id: string) => {
    setCustomProviders((prev) => prev.filter((p) => p.id !== id))
  }, [])

  // Auto-detect Ollama models on mount
  useEffect(() => {
    const autoDetect = async () => {
      try {
        const url = ollamaHost.replace(/\/+$/, '') + '/api/tags'
        const r = await fetch(url)
        if (!r.ok) return
        const data = await r.json()
        interface OllamaApiModel {
          name?: string
          model?: string
          size?: number
          details?: { quantization_level?: string; family?: string }
        }
        const models: OllamaDetectedModel[] = (data.models || []).map((m: OllamaApiModel) => ({
          name: (m.name || m.model) as string,
          size: m.size ? (m.size / 1e9).toFixed(1) + ' GB' : 'N/A',
          status: 'online' as const,
          quantization: m.details?.quantization_level || m.details?.family || 'N/A',
        }))
        setOllamaModels(models)
        setOllamaConnected(true)
      } catch {
        // Ollama not running — user can manually scan later
      }
    }
    autoDetect()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Ollama scan
  const handleScanOllama = useCallback(() => {
    setOllamaScanning(true)
    setOllamaModels([])
    setOllamaConnected(false)
    const url = ollamaHost.replace(/\/+$/, '') + '/api/tags'
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error('HTTP ' + r.status)
        return r.json()
      })
      .then((data) => {
        /** Ollama API model entry shape */
        interface OllamaApiModel {
          name?: string
          model?: string
          size?: number
          details?: { quantization_level?: string; family?: string }
        }
        const models: OllamaDetectedModel[] = (data.models || []).map((m: OllamaApiModel) => ({
          name: (m.name || m.model) as string,
          size: m.size ? (m.size / 1e9).toFixed(1) + ' GB' : 'N/A',
          status: 'online' as const,
          quantization: m.details?.quantization_level || m.details?.family || 'N/A',
        }))
        setOllamaModels(models)
        setOllamaConnected(true)
        setOllamaScanning(false)
      })
      .catch(() => {
        setOllamaModels([])
        setOllamaScanning(false)
        setOllamaConnected(false)
      })
  }, [ollamaHost])

  const handleImportOllama = useCallback(
    (model: OllamaDetectedModel) => {
      addAIModel({
        name: model.name,
        provider: 'ollama',
        endpoint: ollamaHost.replace(/\/+$/, '') + '/api/chat',
        apiKey: '',
        isActive: false,
        isDetected: true,
      })
    },
    [addAIModel, ollamaHost],
  )

  if (!modelSettingsOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className={`absolute inset-0 ${t.overlayBg} backdrop-blur-md`}
        onClick={closeModelSettings}
      />
      <div
        className={`relative w-[920px] max-w-[95vw] max-h-[88vh] ${t.modalBg} border ${t.modalBorder} rounded-2xl flex flex-col overflow-hidden`}
        style={{ boxShadow: t.modalShadow, animation: 'modalIn 0.2s ease-out' }}
      >
        {/* Header */}
        <div className={`flex items-center gap-3 px-5 py-4 border-b ${t.sectionBorder}`}>
          <div
            className={`w-9 h-9 rounded-xl ${t.accentBg} border ${t.accentBorder} flex items-center justify-center`}
          >
            <Sparkles className={`w-4 h-4 ${t.accent}`} />
          </div>
          <div className="flex-1">
            <div className={`text-[14px] ${t.textPrimary}`}>{i('ms.title')}</div>
            <div className={`text-[11px] ${t.textTertiary}`}>{i('ms.subtitle')}</div>
          </div>
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] w-48">
            <Search className="w-3.5 h-3.5 text-white/20" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={i('ms.searchPlaceholder')}
              className="bg-transparent text-[11px] text-white/60 placeholder:text-white/15 focus:outline-none w-full"
            />
          </div>
          <button
            onClick={closeModelSettings}
            className={`p-2 rounded-lg ${t.textMuted} hover:text-white/60 ${t.hoverBg} transition-all`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 px-5 pt-3 pb-0 border-b ${t.sectionBorder} overflow-x-auto`}>
          {[
            { key: 'providers' as const, label: i('ms.tab.providers'), icon: Cloud },
            { key: 'ollama' as const, label: i('ms.tab.ollama'), icon: Server },
            { key: 'mcp' as const, label: i('ms.tab.mcp'), icon: Plug },
            { key: 'diagnostics' as const, label: i('ms.tab.diagnostics'), icon: Activity },
          ].map(({ key, label, icon: TabIcon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-[11px] transition-all border-b-2 whitespace-nowrap ${
                activeTab === key
                  ? `${t.activeTabText} border-current ${t.activeBg}`
                  : `${t.textTertiary} border-transparent hover:text-white/50`
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0 p-5">
          {/* Providers Tab */}
          {activeTab === 'providers' && (
            <div className="space-y-3">
              {/* Active model indicator */}
              {activeModelId &&
                (() => {
                  const activeModel = aiModels.find((m) => m.id === activeModelId)
                  const matchedProvider = activeModelKey
                    ? allProviders.find((p) => activeModelKey.startsWith(p.id + ':'))
                    : null
                  return (
                    <div
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#00f0ff]/[0.06] border border-[#00f0ff]/15 mb-1"
                      style={{ boxShadow: '0 0 16px -4px rgba(0,240,255,0.1)' }}
                    >
                      {matchedProvider ? (
                        <div
                          className={`w-6 h-6 rounded-lg ${matchedProvider.colorBg} border ${matchedProvider.colorBorder} flex items-center justify-center`}
                        >
                          <matchedProvider.icon className={`w-3 h-3 ${matchedProvider.color}`} />
                        </div>
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-[#00f0ff]" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-[#00f0ff]">
                            {activeModel?.name || i('ms.unknown')}
                          </span>
                          {matchedProvider && (
                            <span className="text-[9px] text-white/20">
                              {i(matchedProvider.name)}
                            </span>
                          )}
                        </div>
                        <div className="text-[9px] text-white/15 font-mono truncate">
                          {activeModel?.endpoint}
                        </div>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#00f0ff]/20 text-[#00f0ff]/70 border border-[#00f0ff]/15 shrink-0">
                        {i('ms.currentlyUsing')}
                      </span>
                    </div>
                  )
                })()}

              {/* Provider cards */}
              {filteredProviders.map((provider) => {
                const providerDiags: Record<string, DiagnosticResult> = {}
                provider.models.forEach((m) => {
                  const d = diagnostics[provider.id + ':' + m.id]
                  if (d) providerDiags[m.id] = d
                })

                return (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    apiKey={apiKeys[provider.id] || ''}
                    customUrl={customUrls[provider.id] || ''}
                    onApiKeyChange={(key) =>
                      setApiKeys((prev) => ({ ...prev, [provider.id]: key }))
                    }
                    onUrlChange={(url) =>
                      setCustomUrls((prev) => ({ ...prev, [provider.id]: url }))
                    }
                    onAddModel={(model) => handleProviderAddModel(provider.id, model)}
                    onRemoveModel={(modelId) => handleProviderRemoveModel(provider.id, modelId)}
                    onTestConnection={(modelId) => handleTestConnection(provider.id, modelId)}
                    onSelectModel={(modelId) => handleSelectModel(provider.id, modelId)}
                    activeModelKey={activeModelKey}
                    diagnostics={providerDiags}
                    expanded={expandedProvider === provider.id}
                    onToggle={() =>
                      setExpandedProvider((prev) => (prev === provider.id ? null : provider.id))
                    }
                    isCustom={!PROVIDERS.find((p) => p.id === provider.id)}
                    onRemoveProvider={
                      !PROVIDERS.find((p) => p.id === provider.id)
                        ? () => handleRemoveProvider(provider.id)
                        : undefined
                    }
                  />
                )
              })}

              {/* Add custom provider */}
              {addingProvider ? (
                <div className="rounded-xl border border-dashed border-[#00d4ff]/20 bg-[#00d4ff]/[0.03] p-4 space-y-3">
                  <div className="text-[11px] text-[#00d4ff]/70 mb-1">
                    {i('ms.addProviderTitle')}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">
                        {i('ms.providerName')}
                      </label>
                      <input
                        value={newProvider.name}
                        onChange={(e) => setNewProvider((p) => ({ ...p, name: e.target.value }))}
                        placeholder={i('ms.providerNamePlaceholder')}
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[11px] text-white/70 placeholder:text-white/10 focus:outline-none focus:border-[#00d4ff]/40"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">
                        {i('ms.apiKeyUrlLabel')}
                      </label>
                      <input
                        value={newProvider.apiKeyUrl}
                        onChange={(e) =>
                          setNewProvider((p) => ({ ...p, apiKeyUrl: e.target.value }))
                        }
                        placeholder="https://..."
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[11px] text-white/70 placeholder:text-white/10 focus:outline-none focus:border-[#00d4ff]/40 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">
                      {i('ms.baseUrl')}
                    </label>
                    <input
                      value={newProvider.baseURL}
                      onChange={(e) => setNewProvider((p) => ({ ...p, baseURL: e.target.value }))}
                      placeholder="https://api.example.com/v1/chat/completions"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[11px] text-white/70 placeholder:text-white/10 focus:outline-none focus:border-[#00d4ff]/40 font-mono"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleAddProvider}
                      disabled={!newProvider.name || !newProvider.baseURL}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00d4ff]/15 text-[#00d4ff] text-[11px] hover:bg-[#00d4ff]/25 transition-all disabled:opacity-30 border border-[#00d4ff]/20"
                    >
                      <Plus className="w-3 h-3" /> {i('ms.addProvider')}
                    </button>
                    <button
                      onClick={() => setAddingProvider(false)}
                      className="px-4 py-2 rounded-lg text-white/30 text-[11px] hover:bg-white/[0.04] transition-all"
                    >
                      {i('ms.cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingProvider(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/[0.08] text-white/25 hover:text-white/50 hover:border-white/[0.15] transition-all text-[12px]"
                >
                  <Plus className="w-4 h-4" /> {i('ms.addProviderBtn')}
                </button>
              )}

              {/* Tip */}
              <div className="px-4 py-2.5 rounded-xl bg-[#00f0ff]/[0.03] border border-[#00f0ff]/10 flex items-start gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-[#00f0ff]/50 shrink-0 mt-0.5" />
                <div className="text-[10px] text-white/25">
                  <strong className="text-[#00f0ff]/40">{i('ms.providerTip')}</strong>
                  {i('ms.providerTipContent')}
                </div>
              </div>
            </div>
          )}

          {/* Ollama Tab */}
          {activeTab === 'ollama' && (
            <div className="space-y-4">
              <div
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3"
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)' }}
              >
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-amber-400" />
                  <span className="text-[12px] text-white/70">{i('ms.ollamaEndpoint')}</span>
                  <div
                    className={`ml-auto flex items-center gap-1.5 text-[10px] ${ollamaConnected ? 'text-emerald-400' : 'text-white/25'}`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${ollamaConnected ? 'bg-emerald-400' : 'bg-white/15'}`}
                    />
                    {ollamaConnected ? i('ms.ollamaConnected') : i('ms.ollamaDisconnected')}
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    value={ollamaHost}
                    onChange={(e) => setOllamaHost(e.target.value)}
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white/70 font-mono focus:outline-none focus:border-amber-500/40"
                  />
                  <button
                    onClick={handleScanOllama}
                    disabled={ollamaScanning}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500/15 text-amber-400 text-[11px] hover:bg-amber-500/25 transition-all disabled:opacity-50 border border-amber-500/20"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${ollamaScanning ? 'animate-spin' : ''}`} />
                    {ollamaScanning ? i('ms.ollamaScanning') : i('ms.ollamaScan')}
                  </button>
                </div>
                <div className="text-[10px] text-white/20">{i('ms.ollamaDesc')}</div>
              </div>

              {ollamaModels.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] text-white/30 uppercase tracking-wider">
                      {i('ms.detectedModels', { count: ollamaModels.length })}
                    </div>
                    {!ollamaConnected && (
                      <span className="text-[9px] text-amber-400/40">{i('ms.simulatedData')}</span>
                    )}
                  </div>
                  {ollamaModels.map((model) => {
                    const alreadyImported = aiModels.some(
                      (m) => m.name === model.name && m.provider === 'ollama',
                    )
                    return (
                      <div
                        key={model.name}
                        className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-amber-500/15 transition-all"
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${model.status === 'online' ? 'bg-emerald-400' : 'bg-white/15'}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] text-white/70">{model.name}</div>
                          <div className="text-[10px] text-white/25">
                            {model.size} · {model.quantization}
                          </div>
                        </div>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded ${
                            model.status === 'online'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-white/[0.04] text-white/20'
                          }`}
                        >
                          {model.status === 'online' ? i('ms.ollamaOnline') : i('ms.ollamaOffline')}
                        </span>
                        {alreadyImported ? (
                          <span className="text-[10px] text-white/20 flex items-center gap-1">
                            <Check className="w-3 h-3" /> {i('ms.imported')}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleImportOllama(model)}
                            disabled={model.status === 'offline'}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-[10px] hover:bg-amber-500/20 transition-all disabled:opacity-30 border border-amber-500/20"
                          >
                            <Plus className="w-3 h-3" /> {i('ms.import')}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {ollamaModels.length === 0 && !ollamaScanning && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mb-4">
                    <Server className="w-7 h-7 text-white/10" />
                  </div>
                  <p className="text-[12px] text-white/25 mb-1">{i('ms.noOllamaModels')}</p>
                  <p className="text-[10px] text-white/15">{i('ms.noOllamaModelsDesc')}</p>
                </div>
              )}

              {ollamaScanning && ollamaModels.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/[0.06] border border-amber-500/15 flex items-center justify-center mb-4 relative">
                    <Server className="w-7 h-7 text-amber-400/40" />
                    <div className="absolute inset-0 rounded-2xl border-2 border-amber-400/30 animate-ping" />
                  </div>
                  <p className="text-[12px] text-amber-400/60 mb-1">{i('ms.ollamaScanningMsg')}</p>
                  <p className="text-[10px] text-white/15">{ollamaHost}/api/tags</p>
                </div>
              )}
            </div>
          )}

          {/* MCP Tab */}
          {activeTab === 'mcp' && <MCPConfigPanel />}

          {/* Diagnostics Tab */}
          {activeTab === 'diagnostics' && (
            <SmartDiagnosticsPanel
              providers={allProviders}
              apiKeys={apiKeys}
              diagnostics={diagnostics}
              onRunDiagnostic={handleTestConnection}
              onSelectModel={handleSelectModel}
              activeModelKey={activeModelKey}
            />
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-between px-5 py-3 border-t ${t.sectionBorder} ${t.surfaceInset}`}
        >
          <div className="flex items-center gap-3">
            <span className={`text-[10px] ${t.textMuted}`}>
              {i('ms.footerStats', {
                providers: allProviders.length,
                models: allProviders.reduce((sum, p) => sum + p.models.length, 0),
              })}
            </span>
            {Object.values(diagnostics).filter((d) => d.status === 'success').length > 0 && (
              <span className="text-[10px] text-emerald-400/40">
                {i('ms.online', {
                  count: Object.values(diagnostics).filter((d) => d.status === 'success').length,
                })}
              </span>
            )}
          </div>
          <button
            onClick={closeModelSettings}
            className={`px-4 py-1.5 rounded-lg ${t.badgeBg} ${t.textTertiary} text-[11px] ${t.hoverBg} transition-all`}
          >
            {i('ms.done')}
          </button>
        </div>

        {/* Selection toast */}
        {selectionToast && (
          <div
            className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00f0ff]/20 border border-[#00f0ff]/25 backdrop-blur-sm"
            style={{
              boxShadow: '0 4px 20px rgba(0,240,255,0.15)',
              animation: 'modalIn 0.15s ease-out',
            }}
          >
            <CheckCircle2 className="w-4 h-4 text-[#00f0ff]" />
            <span className="text-[12px] text-[#00f0ff]">
              {i('ms.switchedTo')} <strong>{selectionToast}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Modal animation keyframe */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
