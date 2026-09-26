/**
 * @file task-board-ai.ts
 * @description 任务板 AI 推断模拟器:会话/代码/描述三池随机推断
 *   (真实模型接入前的演示层,P2-③ 巨石拆分)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags task-board,ai,simulation,toolkit
 */

import type { TaskInferenceResult } from './task-board-data'

const CONVERSATION_INFERENCE_POOL: TaskInferenceResult[] = [
  {
    title: 'tbai.conv.1.title',
    description: 'tbai.conv.1.desc',
    type: 'feature',
    priority: 'high',
    confidence: 0.93,
    reasoning: 'tbai.conv.1.reasoning',
    tags: ['websocket', 'realtime', 'notification'],
    estimatedHours: 12,
    relatedFiles: ['src/services/notification.ts', 'src/hooks/useWebSocket.ts'],
  },
  {
    title: 'tbai.conv.2.title',
    description: 'tbai.conv.2.desc',
    type: 'feature',
    priority: 'high',
    confidence: 0.91,
    reasoning: 'tbai.conv.2.reasoning',
    tags: ['security', 'API', 'middleware'],
    estimatedHours: 6,
    relatedFiles: ['src/middleware/rateLimit.ts'],
  },
  {
    title: 'tbai.conv.3.title',
    description: 'tbai.conv.3.desc',
    type: 'bug',
    priority: 'critical',
    confidence: 0.88,
    reasoning: 'tbai.conv.3.reasoning',
    tags: ['bug', 'session', 'concurrency'],
    estimatedHours: 8,
  },
]

const CODE_INFERENCE_POOL: TaskInferenceResult[] = [
  {
    title: 'tbai.code.1.title',
    description: 'tbai.code.1.desc',
    type: 'refactor',
    priority: 'medium',
    confidence: 0.95,
    reasoning: 'tbai.code.1.reasoning',
    tags: ['refactor', 'config', 'env'],
    estimatedHours: 3,
    relatedFiles: ['src/api/endpoints.ts', 'src/config/env.ts'],
  },
  {
    title: 'tbai.code.2.title',
    description: 'tbai.code.2.desc',
    type: 'bug',
    priority: 'high',
    confidence: 0.97,
    reasoning: 'tbai.code.2.reasoning',
    tags: ['bug', 'memory', 'useEffect'],
    estimatedHours: 4,
    relatedFiles: ['src/hooks/useInterval.ts', 'src/components/dashboard-page.tsx'],
  },
  {
    title: 'tbai.code.3.title',
    description: 'tbai.code.3.desc',
    type: 'refactor',
    priority: 'low',
    confidence: 0.94,
    reasoning: 'tbai.code.3.reasoning',
    tags: ['typescript', 'strict', 'types'],
    estimatedHours: 5,
  },
  {
    title: 'tbai.code.4.title',
    description: 'tbai.code.4.desc',
    type: 'test',
    priority: 'medium',
    confidence: 0.89,
    reasoning: 'tbai.code.4.reasoning',
    tags: ['test', 'jest', 'utils'],
    estimatedHours: 4,
    relatedFiles: ['src/utils/transform.ts', 'src/utils/__tests__/transform.test.ts'],
  },
]

const DESCRIPTION_INFERENCE_POOL: TaskInferenceResult[] = [
  {
    title: 'tbai.desc.1.title',
    description: 'tbai.desc.1.desc',
    type: 'feature',
    priority: 'low',
    confidence: 0.86,
    reasoning: 'tbai.desc.1.reasoning',
    tags: ['UX', 'theme', 'animation'],
    estimatedHours: 3,
  },
  {
    title: 'tbai.desc.2.title',
    description: 'tbai.desc.2.desc',
    type: 'refactor',
    priority: 'high',
    confidence: 0.92,
    reasoning: 'tbai.desc.2.reasoning',
    tags: ['performance', 'lazy', 'code-splitting'],
    estimatedHours: 8,
    relatedFiles: ['src/app/App.tsx', 'src/app/routes.ts'],
  },
]

/** Simulated AI inference engine */
export class AIInferenceSimulator {
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async inferFromConversation(_text: string): Promise<TaskInferenceResult[]> {
    await this.delay(1500 + Math.random() * 1500)
    const count = 1 + Math.floor(Math.random() * 2)
    const results: TaskInferenceResult[] = []
    const pool = [...CONVERSATION_INFERENCE_POOL]
    for (let i = 0; i < count && pool.length > 0; i++) {
      const idx = Math.floor(Math.random() * pool.length)
      results.push({ ...pool[idx], confidence: 0.8 + Math.random() * 0.18 })
      pool.splice(idx, 1)
    }
    return results
  }

  async inferFromCode(_code: string): Promise<TaskInferenceResult[]> {
    await this.delay(2000 + Math.random() * 1000)
    const count = 2 + Math.floor(Math.random() * 2)
    const results: TaskInferenceResult[] = []
    const pool = [...CODE_INFERENCE_POOL]
    for (let i = 0; i < count && pool.length > 0; i++) {
      const idx = Math.floor(Math.random() * pool.length)
      results.push({ ...pool[idx], confidence: 0.85 + Math.random() * 0.14 })
      pool.splice(idx, 1)
    }
    return results
  }

  async inferFromDescription(_desc: string): Promise<TaskInferenceResult[]> {
    await this.delay(1000 + Math.random() * 1000)
    const pool = [...DESCRIPTION_INFERENCE_POOL]
    const count = 1 + Math.floor(Math.random() * pool.length)
    const results: TaskInferenceResult[] = []
    for (let i = 0; i < count && pool.length > 0; i++) {
      const idx = Math.floor(Math.random() * pool.length)
      results.push({ ...pool[idx], confidence: 0.82 + Math.random() * 0.16 })
      pool.splice(idx, 1)
    }
    return results
  }
}

export const aiInference = new AIInferenceSimulator()

// ==========================================
// Drag & Drop Task Card
// ==========================================
