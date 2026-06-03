/**
 * @file pipeline-executor-service.ts
 * @description AF-02: Automation Pipeline Executor — Simulated pipeline execution engine.
 *   Manages pipeline run lifecycle: stage execution, parallel/serial flow, retry logic, logging.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-06-04
 * @tags advanced,automation,pipeline
 */

import type {
  LogEntry,
  PipelineDefinition,
  PipelineRun,
  StageRun,
  StageStatus,
  TriggerType,
} from '../advanced-types'

// ==========================================
// Pipeline Executor Engine
// ==========================================

export class PipelineExecutor {
  private runningPipelines: Map<string, AbortController> = new Map()

  /**
   * Execute a pipeline definition.
   * Returns a PipelineRun with simulated stage progression.
   */
  async execute(
    pipeline: PipelineDefinition,
    triggeredBy: TriggerType = 'manual',
    triggeredVia: string = 'user',
    commitSha?: string,
    commitMessage?: string,
    onLog?: (entry: LogEntry) => void,
    onStageChange?: (stageRun: StageRun) => void,
  ): Promise<PipelineRun> {
    const abortController = new AbortController()
    const pipelineId = pipeline.id
    const runId = `run-${pipelineId}-${Date.now()}`

    const run: PipelineRun = {
      id: runId,
      pipelineId,
      pipelineName: pipeline.name,
      status: 'running',
      stages: pipeline.stages.map((stage) => ({
        stageId: stage.id,
        name: stage.name,
        type: stage.type,
        status: 'pending' as StageStatus,
        duration: 0,
        retryAttempt: 0,
        output: '',
      })),
      startedAt: Date.now(),
      triggeredBy,
      triggeredVia,
      commitSha,
      commitMessage,
      duration: 0,
      logs: [],
    }

    this.runningPipelines.set(runId, abortController)
    this.emitLog(run, { level: 'info', stage: 'system', message: `Pipeline "${pipeline.name}" started` }, onLog)

    try {
      // Topological sort: execute stages in dependency order
      const executionOrder = this.topologicalSort(pipeline.stages.map((s) => ({
        id: s.id,
        dependsOn: s.dependsOn,
      })))

      const stageMap = new Map(pipeline.stages.map((s) => [s.id, s]))

      for (const stageId of executionOrder) {
        if (abortController.signal.aborted) {
          run.status = 'cancelled'
          break
        }

        const stageDef = stageMap.get(stageId)
        if (!stageDef) continue

        const stageRun = run.stages.find((s) => s.stageId === stageId)!
        stageRun.status = 'running'
        stageRun.startedAt = Date.now()
        this.emitLog(run, { level: 'info', stage: stageDef.name, message: `Stage "${stageDef.name}" started` }, onLog)
        onStageChange?.({ ...stageRun })

        // Simulate execution time (100-800ms per stage)
        const executionTime = stageDef.type === 'deploy' ? 800 + Math.random() * 400 :
                              stageDef.type === 'test' ? 400 + Math.random() * 300 :
                              stageDef.type === 'build' ? 500 + Math.random() * 300 :
                              200 + Math.random() * 200

        await this.sleep(executionTime, abortController.signal)

        if (abortController.signal.aborted) {
          stageRun.status = 'cancelled'
          break
        }

        // Simulate success (90%) or failure (10%)
        const isSuccess = Math.random() > 0.1 || stageDef.type === 'lint'

        if (isSuccess) {
          stageRun.status = 'success'
          stageRun.output = `✓ ${stageDef.name} completed successfully\n` +
            `  - Type: ${stageDef.type}\n` +
            `  - Duration: ${executionTime.toFixed(0)}ms\n` +
            `  - Warnings: ${Math.floor(Math.random() * 3)}\n`
          stageRun.duration = Math.round(executionTime)

          this.emitLog(run, {
            level: 'info',
            stage: stageDef.name,
            message: `Stage "${stageDef.name}" completed (${executionTime.toFixed(0)}ms)`,
          }, onLog)
        } else {
          stageRun.status = 'failed'
          stageRun.error = `Error: ${stageDef.name} failed at step ${Math.floor(Math.random() * 3) + 1}`
          stageRun.output = `✗ ${stageDef.name} failed\n` +
            `  - Error: ${stageRun.error}\n`

          this.emitLog(run, {
            level: 'error',
            stage: stageDef.name,
            message: `Stage "${stageDef.name}" failed: ${stageRun.error}`,
          }, onLog)

          // Retry logic
          if (stageDef.retryCount > 0 && stageRun.retryAttempt < stageDef.retryCount) {
            stageRun.retryAttempt++
            stageRun.status = 'running'
            this.emitLog(run, {
              level: 'warn',
              stage: stageDef.name,
              message: `Retrying "${stageDef.name}" (attempt ${stageRun.retryAttempt}/${stageDef.retryCount})...`,
            }, onLog)

            await this.sleep(stageDef.retryDelay * 1000, abortController.signal)

            // Retry always succeeds in simulation
            stageRun.status = 'success'
            stageRun.error = undefined
            stageRun.output = `✓ ${stageDef.name} completed on retry ${stageRun.retryAttempt}\n`
            this.emitLog(run, {
              level: 'info',
              stage: stageDef.name,
              message: `Stage "${stageDef.name}" succeeded on retry`,
            }, onLog)
          } else {
            run.status = 'failed'
            break
          }
        }

        stageRun.finishedAt = Date.now()
        onStageChange?.({ ...stageRun })
      }

      // If all stages completed, mark as success
      if (run.status === 'running') {
        run.status = 'success'
        this.emitLog(run, { level: 'info', stage: 'system', message: `Pipeline "${pipeline.name}" completed successfully` }, onLog)
      }
    } catch (error) {
      run.status = 'failed'
      this.emitLog(run, {
        level: 'error',
        stage: 'system',
        message: `Pipeline failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }, onLog)
    } finally {
      run.finishedAt = Date.now()
      run.duration = run.finishedAt - run.startedAt
      this.runningPipelines.delete(runId)
    }

    return run
  }

  /**
   * Cancel a running pipeline.
   */
  cancel(runId: string): boolean {
    const controller = this.runningPipelines.get(runId)
    if (controller) {
      controller.abort()
      this.runningPipelines.delete(runId)
      return true
    }
    return false
  }

  /**
   * Check if a pipeline is currently running.
   */
  isRunning(runId: string): boolean {
    return this.runningPipelines.has(runId)
  }

  private emitLog(run: PipelineRun, entry: Omit<LogEntry, 'id' | 'timestamp'>, onLog?: (entry: LogEntry) => void) {
    const logEntry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      ...entry,
    }
    run.logs.push(logEntry)
    onLog?.(logEntry)
  }

  private topologicalSort(nodes: { id: string; dependsOn: string[] }[]): string[] {
    const visited = new Set<string>()
    const result: string[] = []

    function visit(nodeId: string) {
      if (visited.has(nodeId)) return
      visited.add(nodeId)
      const node = nodes.find((n) => n.id === nodeId)
      if (node) {
        for (const dep of node.dependsOn) {
          visit(dep)
        }
      }
      result.push(nodeId)
    }

    for (const node of nodes) {
      visit(node.id)
    }

    return result
  }

  private sleep(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, _reject) => {
      const timer = setTimeout(resolve, ms)
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timer)
          resolve() // Resolve instead of reject to allow graceful cancellation
        })
      }
    })
  }
}

// ==========================================
// Singleton
// ==========================================

export const pipelineExecutor = new PipelineExecutor()

// ==========================================
// Demo Helpers
// ==========================================

export function createDemoPipeline(): PipelineDefinition {
  return {
    id: 'demo-pipeline',
    name: 'YYC³ Build & Deploy',
    description: 'Automated build, test, and deployment pipeline for the YYC³ Administration platform.',
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    env: {
      NODE_ENV: 'production',
      PNPM_VERSION: '9',
    },
    triggers: [
      { id: 'tr-1', type: 'manual', enabled: true, config: {} },
      { id: 'tr-2', type: 'git_push', enabled: true, config: { branch: 'main' } },
    ],
    stages: [
      {
        id: 'stage-1',
        name: 'Install Dependencies',
        type: 'build',
        commands: ['pnpm install --frozen-lockfile'],
        dependsOn: [],
        timeout: 120,
        retryCount: 1,
        retryDelay: 5,
        parallel: false,
      },
      {
        id: 'stage-2',
        name: 'TypeScript Type Check',
        type: 'lint',
        commands: ['pnpm type-check'],
        dependsOn: ['stage-1'],
        timeout: 60,
        retryCount: 0,
        retryDelay: 0,
        parallel: false,
      },
      {
        id: 'stage-3',
        name: 'Lint & Style Check',
        type: 'lint',
        commands: ['pnpm lint'],
        dependsOn: ['stage-1'],
        timeout: 60,
        retryCount: 0,
        retryDelay: 0,
        parallel: true,
      },
      {
        id: 'stage-4',
        name: 'Unit Tests',
        type: 'test',
        commands: ['pnpm test -- --coverage'],
        dependsOn: ['stage-2', 'stage-3'],
        timeout: 120,
        retryCount: 1,
        retryDelay: 10,
        parallel: false,
      },
      {
        id: 'stage-5',
        name: 'Build Production',
        type: 'build',
        commands: ['pnpm build'],
        dependsOn: ['stage-4'],
        timeout: 180,
        retryCount: 0,
        retryDelay: 0,
        parallel: false,
      },
      {
        id: 'stage-6',
        name: 'Deploy to Staging',
        type: 'deploy',
        commands: ['pnpm deploy:staging'],
        dependsOn: ['stage-5'],
        timeout: 300,
        retryCount: 1,
        retryDelay: 15,
        parallel: false,
      },
    ],
  }
}