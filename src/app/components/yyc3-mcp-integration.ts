/**
 * @file yyc3-mcp-integration.ts
 * @description YYC³ MCP Servers 集成 — 将 @yyc3/mcp-servers 1.0.0 连接到数智协同中台
 *
 * 功能：
 * - AI 模型连接（OpenAI / Claude / DeepSeek）
 * - Git API 集成
 * - 智能协作平台对接
 * - 数据同步与任务调度
 */

// ==========================================
// MCP Server 类型定义
// ==========================================

export type MCPServerType = 'ai-hub' | 'git-api' | 'collaboration' | 'data-sync' | 'task-scheduler'

export interface MCPServerConfig {
  type: MCPServerType
  endpoint: string
  apiKey?: string
  options: Record<string, unknown>
  enabled: boolean
  healthCheckInterval: number // 秒
}

export interface MCPConnectionStatus {
  serverType: MCPServerType
  connected: boolean
  lastPing: Date
  latency: number // 毫秒
  errorCount: number
  lastError?: string
}

export interface AIModelConfig {
  provider: 'openai' | 'claude' | 'deepseek'
  model: string
  temperature: number
  maxTokens: number
  systemPrompt?: string
}

export interface GitOperationResult {
  success: boolean
  operation: string
  output: string
  error?: string
  timestamp: Date
}

export interface CollaborationMessage {
  id: string
  type: 'task' | 'message' | 'notification' | 'alert'
  source: string
  target: string
  payload: Record<string, unknown>
  priority: 'low' | 'medium' | 'high' | 'urgent'
  timestamp: Date
}

// ==========================================
// MCP Client 类
// ==========================================

export class Yyc3MCPClient {
  private static instance: Yyc3MCPClient
  private servers: Map<MCPServerType, MCPServerConfig> = new Map()
  private connectionStatuses: Map<MCPServerType, MCPConnectionStatus> = new Map()
  private healthCheckTimers: Map<MCPServerType, NodeJS.Timeout> = new Map()

  private constructor() {}

  public static getInstance(): Yyc3MCPClient {
    if (!Yyc3MCPClient.instance) {
      Yyc3MCPClient.instance = new Yyc3MCPClient()
    }
    return Yyc3MCPClient.instance
  }

  /**
   * 注册 MCP Server
   */
  registerServer(config: MCPServerConfig): void {
    this.servers.set(config.type, config)

    this.connectionStatuses.set(config.type, {
      serverType: config.type,
      connected: false,
      lastPing: new Date(),
      latency: 0,
      errorCount: 0,
    })

    if (config.enabled) {
      this.startHealthCheck(config.type)
    }
  }

  /**
   * 启动健康检查
   */
  private startHealthCheck(serverType: MCPServerType): void {
    const existingTimer = this.healthCheckTimers.get(serverType)
    if (existingTimer) {
      clearInterval(existingTimer)
    }

    const config = this.servers.get(serverType)
    if (!config) return

    const timer = setInterval(async () => {
      await this.checkServerHealth(serverType)
    }, config.healthCheckInterval * 1000)

    this.healthCheckTimers.set(serverType, timer)

    // 立即执行一次检查
    this.checkServerHealth(serverType)
  }

  /**
   * 检查服务器健康状态
   */
  async checkServerHealth(serverType: MCPServerType): Promise<MCPConnectionStatus> {
    const config = this.servers.get(serverType)
    const currentStatus = this.connectionStatuses.get(serverType)

    if (!config || !currentStatus) {
      throw new Error(`Server ${serverType} not registered`)
    }

    const startTime = performance.now()

    try {
      let response: Response

      switch (serverType) {
        case 'ai-hub':
          response = await fetch(`${config.endpoint}/health`, {
            headers: { Authorization: `Bearer ${config.apiKey}` },
          })
          break

        case 'git-api':
          response = await fetch(`${config.endpoint}/api/health`)
          break

        case 'collaboration':
          response = await fetch(`${config.endpoint}/ws/health`, {
            method: 'GET',
          })
          break

        default:
          response = await fetch(`${config.endpoint}/health`)
      }

      const latency = Math.round(performance.now() - startTime)

      if (response.ok) {
        this.connectionStatuses.set(serverType, {
          ...currentStatus,
          connected: true,
          lastPing: new Date(),
          latency,
          errorCount: 0,
          lastError: undefined,
        })
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      this.connectionStatuses.set(serverType, {
        ...currentStatus,
        connected: false,
        lastPing: new Date(),
        latency: Math.round(performance.now() - startTime),
        errorCount: currentStatus.errorCount + 1,
        lastError: errorMessage,
      })

      console.error(`[MCP] Health check failed for ${serverType}:`, errorMessage)
    }

    return this.connectionStatuses.get(serverType)!
  }

  // ==========================================
  // AI Hub 操作
  // ==========================================

  async callAIModel(
    prompt: string,
    modelConfig: AIModelConfig,
    context?: string[],
  ): Promise<string> {
    const config = this.servers.get('ai-hub')
    if (!config || !config.enabled) {
      throw new Error('AI Hub server not configured or disabled')
    }

    const status = this.connectionStatuses.get('ai-hub')
    if (!status?.connected) {
      throw new Error('AI Hub server is not connected')
    }

    try {
      const response = await fetch(`${config.endpoint}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: modelConfig.model,
          messages: [
            ...(modelConfig.systemPrompt
              ? [{ role: 'system', content: modelConfig.systemPrompt }]
              : []),
            ...(context || []).map((text) => ({ role: 'user' as const, content: text })),
            { role: 'user', content: prompt },
          ],
          temperature: modelConfig.temperature,
          max_tokens: modelConfig.maxTokens,
        }),
      })

      if (!response.ok) {
        throw new Error(`AI request failed: HTTP ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('[MCP] AI call failed:', error)
      throw error
    }
  }

  // ==========================================
  // Git API 操作
  // ==========================================

  async executeGitOperation(
    operation: string,
    params: Record<string, unknown>,
  ): Promise<GitOperationResult> {
    const config = this.servers.get('git-api')
    if (!config || !config.enabled) {
      throw new Error('Git API server not configured or disabled')
    }

    const status = this.connectionStatuses.get('git-api')
    if (!status?.connected) {
      throw new Error('Git API server is not connected')
    }

    try {
      const response = await fetch(`${config.endpoint}/api/git/${operation}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
        },
        body: JSON.stringify(params),
      })

      const data = await response.json()

      return {
        success: response.ok,
        operation,
        output: data.output || '',
        error: data.error,
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        success: false,
        operation,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      }
    }
  }

  // ==========================================
  // 协作平台操作
  // ==========================================

  async sendCollaborationMessage(
    message: Omit<CollaborationMessage, 'id' | 'timestamp'>,
  ): Promise<string> {
    const config = this.servers.get('collaboration')
    if (!config || !config.enabled) {
      throw new Error('Collaboration server not configured or disabled')
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const fullMessage: CollaborationMessage = {
      ...message,
      id: messageId,
      timestamp: new Date(),
    }

    try {
      // 实际应用中应通过 WebSocket 发送
      // eslint-disable-next-line no-console
      console.log('[MCP] Sending collaboration message:', fullMessage)

      return messageId
    } catch (error) {
      console.error('[MCP] Failed to send collaboration message:', error)
      throw error
    }
  }

  // ==========================================
  // 状态查询
  // ==========================================

  getAllConnectionStatuses(): Map<MCPServerType, MCPConnectionStatus> {
    return new Map(this.connectionStatuses)
  }

  getServerConfig(serverType: MCPServerType): MCPServerConfig | undefined {
    return this.servers.get(serverType)
  }

  isServerConnected(serverType: MCPServerType): boolean {
    return this.connectionStatuses.get(serverType)?.connected ?? false
  }

  /**
   * 获取系统整体健康状态
   */
  getSystemHealth(): {
    overallStatus: 'healthy' | 'degraded' | 'unhealthy'
    servers: Array<{
      type: MCPServerType
      status: MCPConnectionStatus
      config: MCPServerConfig
    }>
    recommendations: string[]
  } {
    const statuses = Array.from(this.connectionStatuses.entries())
    const connectedCount = statuses.filter(([_, s]) => s.connected).length
    const totalCount = statuses.length

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    const recommendations: string[] = []

    if (connectedCount === totalCount) {
      overallStatus = 'healthy'
    } else if (connectedCount >= totalCount * 0.5) {
      overallStatus = 'degraded'
      recommendations.push('部分服务不可用，建议检查网络配置和服务器状态')
    } else {
      overallStatus = 'unhealthy'
      recommendations.push('多数服务不可用，请立即检查基础设施')
    }

    statuses.forEach(([type, status]) => {
      if (status.errorCount > 5) {
        recommendations.push(`${type} 服务频繁出错 (${status.errorCount}次)，建议排查`)
      }
      if (status.latency > 1000) {
        recommendations.push(`${type} 响应延迟过高 (${status.latency}ms)，建议优化`)
      }
    })

    return {
      overallStatus,
      servers: statuses.map(([type, status]) => ({
        type,
        status,
        config: this.servers.get(type)!,
      })),
      recommendations,
    }
  }

  /**
   * 断开所有连接
   */
  disconnectAll(): void {
    this.healthCheckTimers.forEach((timer) => clearInterval(timer))
    this.healthCheckTimers.clear()

    this.connectionStatuses.forEach((status, type) => {
      this.connectionStatuses.set(type, { ...status, connected: false })
    })
  }
}

// ==========================================
// 预配置的 MCP Server 实例
// ==========================================

export function initializeDefaultMCPConfiguration(): Yyc3MCPClient {
  const client = Yyc3MCPClient.getInstance()

  // AI Hub 配置
  client.registerServer({
    type: 'ai-hub',
    endpoint: process.env.YYC3_AI_HUB_ENDPOINT || 'https://api.yyc3.ai',
    apiKey: process.env.YYC3_AI_HUB_API_KEY,
    options: {
      timeout: 30000,
      retryAttempts: 3,
    },
    enabled: true,
    healthCheckInterval: 30,
  })

  // Git API 配置
  client.registerServer({
    type: 'git-api',
    endpoint: process.env.YYC3_GIT_API_ENDPOINT || 'https://git.yyc3.dev/api/v4',
    apiKey: process.env.YYC3_GIT_API_TOKEN,
    options: {
      timeout: 15000,
    },
    enabled: true,
    healthCheckInterval: 60,
  })

  // 协作平台配置
  client.registerServer({
    type: 'collaboration',
    endpoint: process.env.YYC3_COLLAB_ENDPOINT || 'wss://collab.yyc3.dev/ws',
    options: {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
    },
    enabled: true,
    healthCheckInterval: 15,
  })

  // 数据同步服务
  client.registerServer({
    type: 'data-sync',
    endpoint: process.env.YYC3_DATA_SYNC_ENDPOINT || 'https://sync.yyc3.dev',
    options: {
      syncInterval: 300000, // 5分钟
      batchSize: 100,
    },
    enabled: true,
    healthCheckInterval: 120,
  })

  // 任务调度器
  client.registerServer({
    type: 'task-scheduler',
    endpoint: process.env.YYC3_SCHEDULER_ENDPOINT || 'https://scheduler.yyc3.dev',
    options: {
      maxConcurrentTasks: 10,
      retryPolicy: 'exponential',
    },
    enabled: true,
    healthCheckInterval: 30,
  })

  return client
}

// ==========================================
// 导出单例实例
// ==========================================

export const yyc3McpClient = Yyc3MCPClient.getInstance()

export default Yyc3MCPClient
