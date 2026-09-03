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
    title: '实现 WebSocket 实时通知推送',
    description:
      '当前系统依赖轮询获取通知，延迟较高。需要接入 WebSocket 实现毫秒级推送，支持断线重连和消息队列。',
    type: 'feature',
    priority: 'high',
    confidence: 0.93,
    reasoning: '对话中多次提及"实时通知"和"推送延迟"问题，推断为高优先级功能需求',
    tags: ['websocket', 'realtime', 'notification'],
    estimatedHours: 12,
    relatedFiles: ['src/services/notification.ts', 'src/hooks/useWebSocket.ts'],
  },
  {
    title: '添加 API 请求速率限制中间��',
    description:
      '检测到多处未设防的 API 端点，需要实现 Token Bucket 限流算法，防止恶意请求导致服务降级。',
    type: 'feature',
    priority: 'high',
    confidence: 0.91,
    reasoning: '对话分析发现安全性讨论，提到"API滥用"和"限流"关键词',
    tags: ['security', 'API', 'middleware'],
    estimatedHours: 6,
    relatedFiles: ['src/middleware/rateLimit.ts'],
  },
  {
    title: '修复用户会话并发冲突',
    description: '同一用户多端登录时出现数据覆盖问题，需实现乐观锁或版本控制机制。',
    type: 'bug',
    priority: 'critical',
    confidence: 0.88,
    reasoning: '对话中明确描述了"多端登录冲突"的 bug 现象',
    tags: ['bug', 'session', 'concurrency'],
    estimatedHours: 8,
  },
]

const CODE_INFERENCE_POOL: TaskInferenceResult[] = [
  {
    title: '重构 TODO: 移除硬编码的 API 端点',
    description: '代码扫描发现 15 处硬编码 URL，应迁移至环境变量配置，提升部署灵活性。',
    type: 'refactor',
    priority: 'medium',
    confidence: 0.95,
    reasoning: '代码中发现大量 // TODO: move to env config 注释',
    tags: ['refactor', 'config', 'env'],
    estimatedHours: 3,
    relatedFiles: ['src/api/endpoints.ts', 'src/config/env.ts'],
  },
  {
    title: '修复 FIXME: 内存泄漏 - useEffect 清理',
    description: '多个组件中 useEffect 缺少清理函数，长时间运行后 EventListener 和 Timer 未释放。',
    type: 'bug',
    priority: 'high',
    confidence: 0.97,
    reasoning: '代码扫描发现 8 处 // FIXME: memory leak 注释',
    tags: ['bug', 'memory', 'useEffect'],
    estimatedHours: 4,
    relatedFiles: ['src/hooks/useInterval.ts', 'src/components/dashboard-page.tsx'],
  },
  {
    title: '补全 TypeScript 严格模式类型定义',
    description: 'tsconfig 启用 strict 后发现 23 处 implicit any，需要逐一添加类型注解。',
    type: 'refactor',
    priority: 'low',
    confidence: 0.94,
    reasoning: '代码分析检测到大量 @ts-ignore 和 any 类型使用',
    tags: ['typescript', 'strict', 'types'],
    estimatedHours: 5,
  },
  {
    title: '添加单元测试: 数据转换工具函数',
    description: 'src/utils/transform.ts 包含 12 个工具函数但零测试覆盖，需编写 Jest 测试用例。',
    type: 'test',
    priority: 'medium',
    confidence: 0.89,
    reasoning: '代码覆盖率分析显示该模块测试覆盖率为 0%',
    tags: ['test', 'jest', 'utils'],
    estimatedHours: 4,
    relatedFiles: ['src/utils/transform.ts', 'src/utils/__tests__/transform.test.ts'],
  },
]

const DESCRIPTION_INFERENCE_POOL: TaskInferenceResult[] = [
  {
    title: '实现暗色/亮色主题切换过渡动画',
    description:
      '当前主题切换是瞬时的，用户体验生硬。添加 300ms 渐变过渡，包括背景色、文字颜色和边框的平滑变化。',
    type: 'feature',
    priority: 'low',
    confidence: 0.86,
    reasoning: '用户描述中提到"主题切换太突兀"',
    tags: ['UX', 'theme', 'animation'],
    estimatedHours: 3,
  },
  {
    title: '优化首屏加载性能 - 代码分割',
    description:
      '分析描述推断需要对路由级组件实施 React.lazy 动态导入，配合 Suspense 骨架屏降低 FCP。',
    type: 'refactor',
    priority: 'high',
    confidence: 0.92,
    reasoning: '描述中重点强调"加载太慢"和"首屏白屏"问题',
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
