/**
 * @file mcp-orchestrator-service.ts
 * @description AF-04: MCP Smart Orchestrator — Tool registry, intent-based routing,
 *   chain execution engine, and execution tracing.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-06-04
 * @tags advanced,mcp,orchestrator
 */

import type {
  ChainStep,
  ExecutionTrace,
  MCPTool,
  StepTrace,
  ToolChain,
} from '../advanced-types'

// ==========================================
// Default MCP Tools Registry
// ==========================================

export const defaultMCPTools: MCPTool[] = [
  {
    id: 'mcp-file-reader',
    name: 'File Reader',
    description: 'Read and analyze file contents from the workspace',
    command: 'read',
    args: ['--path', '${filePath}'],
    env: {},
    enabled: true,
    capabilities: ['file_access', 'text_analysis'],
    inputSchema: { type: 'object', properties: { filePath: { type: 'string' } }, required: ['filePath'] },
    outputSchema: { type: 'object', properties: { content: { type: 'string' }, metadata: { type: 'object' } } },
    estimatedCost: 'low',
    version: '1.0.0',
  },
  {
    id: 'mcp-code-analyzer',
    name: 'Code Analyzer',
    description: 'Analyze source code for quality, patterns, and vulnerabilities',
    command: 'analyze',
    args: ['--source', '${code}'],
    env: {},
    enabled: true,
    capabilities: ['static_analysis', 'security_scan', 'code_quality'],
    inputSchema: { type: 'object', properties: { code: { type: 'string' }, language: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { issues: { type: 'array' }, score: { type: 'number' } } },
    estimatedCost: 'medium',
    version: '1.0.0',
  },
  {
    id: 'mcp-test-generator',
    name: 'Test Generator',
    description: 'Generate unit tests from source code analysis',
    command: 'generate-tests',
    args: ['--source', '${sourcePath}', '--framework', '${framework}'],
    env: {},
    enabled: true,
    capabilities: ['test_generation', 'code_analysis'],
    inputSchema: { type: 'object', properties: { sourcePath: { type: 'string' }, framework: { type: 'string', enum: ['vitest', 'jest', 'playwright'] } } },
    outputSchema: { type: 'object', properties: { tests: { type: 'array' }, coverage: { type: 'number' } } },
    estimatedCost: 'high',
    version: '1.0.0',
  },
  {
    id: 'mcp-deploy-agent',
    name: 'Deploy Agent',
    description: 'Orchestrate deployment to staging and production environments',
    command: 'deploy',
    args: ['--env', '${environment}', '--version', '${version}'],
    env: { DEPLOY_KEY: '${secret:DEPLOY_KEY}' },
    enabled: true,
    capabilities: ['deployment', 'container_orchestration'],
    inputSchema: { type: 'object', properties: { environment: { type: 'string', enum: ['staging', 'production'] }, version: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { url: { type: 'string' }, status: { type: 'string' } } },
    estimatedCost: 'high',
    version: '1.0.0',
  },
  {
    id: 'mcp-doc-generator',
    name: 'Doc Generator',
    description: 'Generate API documentation from TypeScript source',
    command: 'generate-docs',
    args: ['--input', '${inputDir}', '--output', '${outputDir}'],
    env: {},
    enabled: true,
    capabilities: ['documentation', 'code_analysis'],
    inputSchema: { type: 'object', properties: { inputDir: { type: 'string' }, outputDir: { type: 'string' }, format: { type: 'string', enum: ['markdown', 'openapi'] } } },
    outputSchema: { type: 'object', properties: { files: { type: 'number' }, topics: { type: 'array' } } },
    estimatedCost: 'medium',
    version: '1.0.0',
  },
  {
    id: 'mcp-performance-profiler',
    name: 'Performance Profiler',
    description: 'Profile application performance and identify bottlenecks',
    command: 'profile',
    args: ['--target', '${target}', '--duration', '${duration}'],
    env: {},
    enabled: true,
    capabilities: ['profiling', 'performance_analysis'],
    inputSchema: { type: 'object', properties: { target: { type: 'string' }, duration: { type: 'number' } } },
    outputSchema: { type: 'object', properties: { bottlenecks: { type: 'array' }, metrics: { type: 'object' }, suggestions: { type: 'array' } } },
    estimatedCost: 'high',
    version: '1.0.0',
  },
]

// ==========================================
// MCP Orchestrator Engine
// ==========================================

export class MCPOrchestratorEngine {
  private tools: Map<string, MCPTool> = new Map()
  private runningChains: Map<string, AbortController> = new Map()

  constructor(initialTools?: MCPTool[]) {
    if (initialTools) {
      for (const tool of initialTools) {
        this.tools.set(tool.id, tool)
      }
    }
  }

  /**
   * Register a tool or update an existing one.
   */
  registerTool(tool: MCPTool): void {
    this.tools.set(tool.id, tool)
  }

  /**
   * Get all registered tools.
   */
  getTools(): MCPTool[] {
    return Array.from(this.tools.values())
  }

  /**
   * Find tools by capability.
   */
  findToolsByCapability(capability: string): MCPTool[] {
    return Array.from(this.tools.values()).filter(
      (t) => t.enabled && t.capabilities.includes(capability),
    )
  }

  /**
   * Execute a tool chain with simulated execution.
   */
  async executeChain(
    chain: ToolChain,
    triggerContext: { triggeredBy: string; input?: Record<string, unknown> },
    onStepUpdate?: (step: StepTrace) => void,
    onLog?: (traceId: string, log: string) => void,
  ): Promise<ExecutionTrace> {
    const abortController = new AbortController()
    const traceId = `trace-${chain.id}-${Date.now()}`

    const trace: ExecutionTrace = {
      id: traceId,
      chainId: chain.id,
      chainName: chain.name,
      status: 'running',
      steps: chain.steps.map((step) => ({
        stepId: step.id,
        toolId: step.toolId,
        toolName: step.toolName,
        status: 'pending' as const,
        input: {},
        output: {},
        duration: 0,
        logs: [],
      })),
      startedAt: Date.now(),
      totalDuration: 0,
      triggeredBy: triggerContext.triggeredBy,
    }

    this.runningChains.set(traceId, abortController)

    const emitLog = (msg: string) => {
      onLog?.(traceId, msg)
    }

    emitLog(`🚀 Chain "${chain.name}" execution started`)

    try {
      const accumulatedOutput: Record<string, unknown> = {}

      for (let i = 0; i < chain.steps.length; i++) {
        if (abortController.signal.aborted) {
          trace.status = 'cancelled'
          emitLog('⛔ Execution cancelled by user')
          break
        }

        const step = chain.steps[i]
        const tool = this.tools.get(step.toolId)
        const stepTrace = trace.steps[i]

        if (!tool) {
          stepTrace.status = 'failed'
          stepTrace.error = `Tool "${step.toolId}" not found in registry`
          trace.status = 'failed'
          emitLog(`❌ Step "${step.toolName}": Tool not found`)
          break
        }

        if (!tool.enabled) {
          stepTrace.status = 'skipped'
          stepTrace.logs.push(`Tool "${tool.name}" is disabled — skipping`)
          emitLog(`⏭️ Step "${step.toolName}": Tool is disabled, skipped`)
          continue
        }

        // Resolve input
        stepTrace.status = 'running'
        stepTrace.startedAt = Date.now()
        const resolvedInput = this.resolveInput(step, accumulatedOutput, triggerContext.input)
        stepTrace.input = resolvedInput

        emitLog(`⚙️ Step "${step.toolName}": Starting execution`)

        // Simulate execution time
        const execTime = tool.estimatedCost === 'low' ? 100 + Math.random() * 200 :
                         tool.estimatedCost === 'medium' ? 300 + Math.random() * 400 :
                         500 + Math.random() * 800

        await this.sleep(execTime, abortController.signal)

        if (abortController.signal.aborted) {
          stepTrace.status = 'cancelled'
          break
        }

        // Simulate execution success (92% success rate)
        if (Math.random() < 0.92) {
          const output = this.simulateToolOutput(tool, resolvedInput)
          stepTrace.output = output
          stepTrace.status = 'success'
          stepTrace.duration = Math.round(execTime)
          stepTrace.logs.push(`✓ Completed in ${Math.round(execTime)}ms`)

          // Update accumulated output for downstream steps
          Object.assign(accumulatedOutput, output)
          emitLog(`✅ Step "${step.toolName}": Completed (${Math.round(execTime)}ms)`)
        } else {
          stepTrace.status = 'failed'
          stepTrace.error = `Tool execution failed: ${tool.name} encountered an error`
          stepTrace.duration = Math.round(execTime)
          stepTrace.logs.push(`✗ Failed after ${Math.round(execTime)}ms`)

          if (step.retryOnFailure) {
            emitLog(`🔄 Step "${step.toolName}": Retrying...`)
            await this.sleep(500, abortController.signal)
            stepTrace.status = 'success'
            stepTrace.error = undefined
            stepTrace.output = this.simulateToolOutput(tool, resolvedInput)
            stepTrace.logs.push(`✓ Completed on retry`)
            emitLog(`✅ Step "${step.toolName}": Succeeded on retry`)
          } else {
            trace.status = 'failed'
            emitLog(`❌ Step "${step.toolName}": Failed, chain aborted`)
            break
          }
        }

        onStepUpdate?.({ ...stepTrace })
      }

      if (trace.status === 'running') {
        trace.status = 'success'
        emitLog(`🎉 Chain "${chain.name}" completed successfully`)
      }
    } finally {
      trace.finishedAt = Date.now()
      trace.totalDuration = trace.finishedAt - trace.startedAt
      this.runningChains.delete(traceId)
    }

    return trace
  }

  /**
   * Cancel a running chain execution.
   */
  cancelChain(traceId: string): boolean {
    const controller = this.runningChains.get(traceId)
    if (controller) {
      controller.abort()
      this.runningChains.delete(traceId)
      return true
    }
    return false
  }

  /**
   * Create a default demo chain for testing.
   */
  createDemoChain(): ToolChain {
    return {
      id: 'demo-chain',
      name: 'Code Quality Pipeline',
      description: 'Analyze code, generate tests, and produce documentation in one pipeline',
      steps: [
        {
          id: 'step-1',
          toolId: 'mcp-file-reader',
          toolName: 'File Reader',
          input: { filePath: '/src/components/App.tsx' },
          outputMapping: {},
          timeout: 30,
          retryOnFailure: true,
          description: 'Read the source file',
        },
        {
          id: 'step-2',
          toolId: 'mcp-code-analyzer',
          toolName: 'Code Analyzer',
          input: { code: '${output.content}', language: 'typescript' },
          outputMapping: { content: 'code' },
          timeout: 60,
          retryOnFailure: true,
          description: 'Analyze code quality and security',
        },
        {
          id: 'step-3',
          toolId: 'mcp-test-generator',
          toolName: 'Test Generator',
          input: { sourcePath: '/src/components/App.tsx', framework: 'vitest' },
          outputMapping: {},
          timeout: 120,
          retryOnFailure: false,
          description: 'Generate unit tests',
        },
        {
          id: 'step-4',
          toolId: 'mcp-doc-generator',
          toolName: 'Doc Generator',
          input: { inputDir: '/src/components', outputDir: '/docs/api', format: 'markdown' },
          outputMapping: {},
          timeout: 60,
          retryOnFailure: false,
          description: 'Generate documentation',
        },
      ],
      trigger: { id: 'tr-manual', type: 'manual', enabled: true, config: {} },
      isActive: true,
      createdAt: Date.now(),
      runCount: 0,
      avgDuration: 0,
    }
  }

  private resolveInput(
    step: ChainStep,
    accumulatedOutput: Record<string, unknown>,
    contextInput?: Record<string, unknown>,
  ): Record<string, unknown> {
    const resolved: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(step.input)) {
      if (typeof value === 'string' && value.startsWith('${')) {
        const path = value.slice(2, -1)
        if (path.startsWith('output.')) {
          const outputKey = path.slice(7)
          resolved[key] = accumulatedOutput[outputKey] ?? value
        } else if (path.startsWith('input.')) {
          const inputKey = path.slice(6)
          resolved[key] = contextInput?.[inputKey] ?? value
        } else {
          resolved[key] = value
        }
      } else {
        resolved[key] = value
      }
    }

    return resolved
  }

  private simulateToolOutput(tool: MCPTool, input: Record<string, unknown>): Record<string, unknown> {
    switch (tool.id) {
      case 'mcp-file-reader':
        return {
          content: '// Sample React Component\nimport React from "react";\nexport function App() { return <div>Hello</div>; }',
          metadata: { size: 1024, lines: 5, language: 'typescript' },
        }
      case 'mcp-code-analyzer':
        return {
          issues: [
            { line: 3, severity: 'info', message: 'Consider adding display name' },
            { line: 1, severity: 'warning', message: 'Unused import' },
          ],
          score: 87,
          suggestions: ['Remove unused imports', 'Add React.memo for performance'],
        }
      case 'mcp-test-generator':
        return {
          tests: [
            { name: 'App renders without crashing', status: 'generated' },
            { name: 'App displays correct content', status: 'generated' },
          ],
          coverage: 78,
          framework: 'vitest',
        }
      case 'mcp-deploy-agent':
        return {
          url: `https://staging-${input.version ?? 'latest'}.yyc3.app`,
          status: 'deployed',
          buildTime: `${(30 + Math.random() * 20).toFixed(0)}s`,
        }
      case 'mcp-doc-generator':
        return {
          files: Math.floor(Math.random() * 10) + 5,
          topics: ['Components', 'Hooks', 'Utilities', 'Types'],
          format: 'markdown',
        }
      case 'mcp-performance-profiler':
        return {
          bottlenecks: [
            { component: 'DataGrid', impact: 'high', suggestion: 'Implement virtual scrolling' },
            { component: 'SearchBar', impact: 'medium', suggestion: 'Add debounce' },
          ],
          metrics: { fcp: 2.1, lcp: 3.4, tti: 4.2 },
          suggestions: ['Lazy load DataGrid', 'Optimize bundle size'],
        }
      default:
        return { result: 'executed', duration: `${Math.round(Math.random() * 500)}ms` }
    }
  }

  private sleep(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve) => {
      const timer = setTimeout(resolve, ms)
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timer)
          resolve()
        })
      }
    })
  }
}

// ==========================================
// Singleton
// ==========================================

export const mcpOrchestrator = new MCPOrchestratorEngine(defaultMCPTools)