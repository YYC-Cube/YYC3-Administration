/**
 * @file use-mcp-orchestrator.ts
 * @description React hook for AF-04: MCP Smart Orchestrator.
 *   Manages tool registry, chain execution, and execution tracing.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-06-04
 * @tags advanced,hooks,mcp,orchestrator
 */

import { useCallback } from 'react'

import { useOrchestratorStore } from '../advanced-stores'
import { mcpOrchestrator } from '../services/mcp-orchestrator-service'

import type { MCPTool, ToolChain } from '../advanced-types'

export function useMCPOrchestrator() {
  const {
    tools,
    chains,
    traces,
    activeTraceId,
    isExecuting,
    selectedChainId,
    registerTool,
    updateTool,
    removeTool,
    toggleTool,
    addChain,
    updateChain,
    removeChain,
    addTrace,
    completeTrace,
    setActiveTrace,
    setIsExecuting,
    setSelectedChain,
  } = useOrchestratorStore()

  const executeChain = useCallback(
    async (chain: ToolChain, input?: Record<string, unknown>) => {
      setIsExecuting(true)

      const trace = await mcpOrchestrator.executeChain(
        chain,
        { triggeredBy: 'user', input },
        (stepUpdate) => {
          useOrchestratorStore.getState().updateTraceStep(trace.id, stepUpdate.stepId, stepUpdate)
        },
        (_traceId, _log) => {
          // Could add log store here
        },
      )

      addTrace(trace)
      completeTrace(trace.id, trace.status)
      setActiveTrace(trace.id)
      setIsExecuting(false)

      // Update chain run count and avg duration
      const existingChain = chains.find((c) => c.id === chain.id)
      if (existingChain) {
        const newRunCount = existingChain.runCount + 1
        const newAvgDuration =
          (existingChain.avgDuration * existingChain.runCount + trace.totalDuration) / newRunCount
        updateChain(chain.id, {
          runCount: newRunCount,
          avgDuration: Math.round(newAvgDuration),
        })
      }

      return trace
    },
    [addTrace, completeTrace, setActiveTrace, setIsExecuting, updateChain, chains],
  )

  const cancelExecution = useCallback(
    (traceId: string) => {
      const cancelled = mcpOrchestrator.cancelChain(traceId)
      if (cancelled) {
        completeTrace(traceId, 'cancelled')
      }
      return cancelled
    },
    [completeTrace],
  )

  const addDemoChain = useCallback(() => {
    const demoChain = mcpOrchestrator.createDemoChain()
    addChain(demoChain)
    return demoChain
  }, [addChain])

  const getToolsByCapability = useCallback(
    (capability: string): MCPTool[] => {
      return tools.filter((t) => t.enabled && t.capabilities.includes(capability))
    },
    [tools],
  )

  const activeTrace = traces.find((t) => t.id === activeTraceId) ?? null
  const selectedChain = chains.find((c) => c.id === selectedChainId) ?? null
  const enabledTools = tools.filter((t) => t.enabled)
  const recentTraces = traces.slice(0, 10)

  return {
    tools,
    chains,
    traces,
    activeTraceId,
    activeTrace,
    isExecuting,
    selectedChainId,
    selectedChain,
    enabledTools,
    recentTraces,
    registerTool,
    updateTool,
    removeTool,
    toggleTool,
    addChain,
    updateChain,
    removeChain,
    executeChain,
    cancelExecution,
    addDemoChain,
    setActiveTrace,
    setSelectedChain,
    getToolsByCapability,
  }
}
