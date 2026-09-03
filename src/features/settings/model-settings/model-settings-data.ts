/**
 * @file model-settings-data.ts
 * @description 模型设置的数据层:类型定义、服务商预设表(PROVIDERS)与
 *   默认 MCP 服务器配置。自 model-settings.tsx 首刀拆分(P2-③),
 *   后续预设表可独立演进(如接入云端目录)。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags models,settings,data
 */
import {
  Bot,
  Box,
  Brain,
  Building2,
  Cloud,
  Cpu,
  Database,
  Globe,
  Layers,
  MessageSquare,
  Rocket,
  Server,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react'

export { PROVIDERS, DEFAULT_MCP_SERVERS, STORAGE_KEYS, loadJSON, saveJSON }
export type { ProviderDef, ModelDef, MCPServerConfig, DiagnosticResult, OllamaDetectedModel }

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
