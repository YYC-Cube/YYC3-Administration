/**
 * @file use-pipeline.ts
 * @description React hook for AF-02: Automation Pipeline.
 *   Wraps PipelineExecutor with store integration and pipeline lifecycle management.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-06-04
 * @tags advanced,hooks,pipeline
 */

import { useCallback, useRef } from 'react'

import { usePipelineStore } from '../advanced-stores'
import { createDemoPipeline, pipelineExecutor } from '../services/pipeline-executor-service'

import type { LogEntry, PipelineDefinition, StageRun } from '../advanced-types'

export function usePipeline() {
  const {
    pipelines,
    runs,
    activeRunId,
    isExecuting,
    addPipeline,
    updatePipeline,
    removePipeline,
    addRun,
    completeRun,
    setActiveRun,
    setIsExecuting,
    addLogEntry,
    togglePipeline,
  } = usePipelineStore()

  const onLogRef = useRef<((entry: LogEntry) => void) | null>(null)
  const onStageRef = useRef<((stageRun: StageRun) => void) | null>(null)

  const executePipeline = useCallback(
    async (pipeline: PipelineDefinition) => {
      setIsExecuting(true)
      setActiveRun(null)

      const onLog = (entry: LogEntry) => {
        addLogEntry('__pending__', entry)
        onLogRef.current?.(entry)
      }

      const onStageChange = (stageRun: StageRun) => {
        onStageRef.current?.(stageRun)
      }

      const run = await pipelineExecutor.execute(
        pipeline,
        'manual',
        'user',
        undefined,
        undefined,
        onLog,
        onStageChange,
      )

      addRun(run)
      completeRun(run.id, run.status)
      setActiveRun(run.id)

      return run
    },
    [addRun, completeRun, setActiveRun, setIsExecuting, addLogEntry],
  )

  const cancelPipeline = useCallback(
    (runId: string) => {
      const cancelled = pipelineExecutor.cancel(runId)
      if (cancelled) {
        completeRun(runId, 'cancelled')
      }
      return cancelled
    },
    [completeRun],
  )

  const addDemoPipeline = useCallback(() => {
    const demoPipeline = createDemoPipeline()
    addPipeline(demoPipeline)
    return demoPipeline
  }, [addPipeline])

  const activeRun = runs.find((r) => r.id === activeRunId) ?? null
  const recentRuns = runs.slice(0, 10)

  return {
    pipelines,
    runs,
    activeRunId,
    activeRun,
    isExecuting,
    recentRuns,
    addPipeline,
    updatePipeline,
    removePipeline,
    executePipeline,
    cancelPipeline,
    addDemoPipeline,
    togglePipeline,
    addRun,
    setActiveRun,
    onLogRef,
    onStageRef,
  }
}
