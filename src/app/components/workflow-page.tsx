import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Cpu,
  FileText,
  Play,
  RefreshCw,
  Rocket,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { useState } from 'react'

import { useThemeColors } from './hooks/use-theme-colors'
import { useI18n } from './i18n-context'
import { NeonCard } from './neon-card'

interface WorkflowNode {
  id: string
  name: string
  icon: typeof Cpu
  status: 'pending' | 'active' | 'completed' | 'error'
  description: string
  progress?: number
}

interface Workflow {
  id: string
  name: string
  status: 'draft' | 'running' | 'paused' | 'completed' | 'failed'
  nodes: WorkflowNode[]
  createdAt: string
  lastRun: string
  runCount: number
  avgDuration: string
}

interface ActiveTask {
  id: string
  name: string
  workflow: string
  progress: number
  status: 'running' | 'waiting' | 'completed'
  eta: string
}

export function WorkflowPage() {
  const tc = useThemeColors()
  const { t: translate } = useI18n()

  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)

  const workflows: Workflow[] = [
    {
      id: 'WF001',
      name: '客户跟进自动化',
      status: 'running',
      createdAt: '2024-05-20',
      lastRun: '5分钟前',
      runCount: 156,
      avgDuration: '2.3分钟',
      nodes: [
        {
          id: '1',
          name: '输入分析',
          icon: FileText,
          status: 'completed',
          description: '分析客户数据',
          progress: 100,
        },
        {
          id: '2',
          name: '意图识别',
          icon: Target,
          status: 'completed',
          description: '识别客户意图',
          progress: 100,
        },
        {
          id: '3',
          name: '任务执行',
          icon: Rocket,
          status: 'active',
          description: '执行跟进任务',
          progress: 65,
        },
        {
          id: '4',
          name: '结果优化',
          icon: TrendingUp,
          status: 'pending',
          description: '优化执行结果',
          progress: 0,
        },
        {
          id: '5',
          name: '学习反馈',
          icon: Cpu,
          status: 'pending',
          description: 'AI学习反馈',
          progress: 0,
        },
      ],
    },
    {
      id: 'WF002',
      name: '数据同步流水线',
      status: 'running',
      createdAt: '2024-05-18',
      lastRun: '2分钟前',
      runCount: 892,
      avgDuration: '45秒',
      nodes: [
        {
          id: '1',
          name: '输入分析',
          icon: FileText,
          status: 'completed',
          description: '数据源检测',
          progress: 100,
        },
        {
          id: '2',
          name: '意图识别',
          icon: Target,
          status: 'completed',
          description: '同步策略识别',
          progress: 100,
        },
        {
          id: '3',
          name: '任务执行',
          icon: Rocket,
          status: 'completed',
          description: '数据同步',
          progress: 100,
        },
        {
          id: '4',
          name: '结果优化',
          icon: TrendingUp,
          status: 'active',
          description: '数据清洗',
          progress: 40,
        },
        {
          id: '5',
          name: '学习反馈',
          icon: Cpu,
          status: 'pending',
          description: '质量评估',
          progress: 0,
        },
      ],
    },
    {
      id: 'WF003',
      name: '营销活动触发',
      status: 'paused',
      createdAt: '2024-05-22',
      lastRun: '1小时前',
      runCount: 28,
      avgDuration: '5.1分钟',
      nodes: [
        {
          id: '1',
          name: '输入分析',
          icon: FileText,
          status: 'completed',
          description: '活动条件检测',
          progress: 100,
        },
        {
          id: '2',
          name: '意图识别',
          icon: Target,
          status: 'completed',
          description: '触发规则匹配',
          progress: 100,
        },
        {
          id: '3',
          name: '任务执行',
          icon: Rocket,
          status: 'pending',
          description: '发送营销消息',
          progress: 0,
        },
        {
          id: '4',
          name: '结果优化',
          icon: TrendingUp,
          status: 'pending',
          description: '效果追踪',
          progress: 0,
        },
        {
          id: '5',
          name: '学习反馈',
          icon: Cpu,
          status: 'pending',
          description: '转化率分析',
          progress: 0,
        },
      ],
    },
    {
      id: 'WF004',
      name: 'AI内容生成',
      status: 'completed',
      createdAt: '2024-05-21',
      lastRun: '昨天',
      runCount: 45,
      avgDuration: '8.2分钟',
      nodes: [
        {
          id: '1',
          name: '输入分析',
          icon: FileText,
          status: 'completed',
          description: '主题分析',
          progress: 100,
        },
        {
          id: '2',
          name: '意图识别',
          icon: Target,
          status: 'completed',
          description: '内容意图',
          progress: 100,
        },
        {
          id: '3',
          name: '任务执行',
          icon: Rocket,
          status: 'completed',
          description: 'AI生成',
          progress: 100,
        },
        {
          id: '4',
          name: '结果优化',
          icon: TrendingUp,
          status: 'completed',
          description: '内容优化',
          progress: 100,
        },
        {
          id: '5',
          name: '学习反馈',
          icon: Cpu,
          status: 'completed',
          description: '质量评分',
          progress: 100,
        },
      ],
    },
  ]

  const activeTasks: ActiveTask[] = [
    {
      id: 'T001',
      name: '客户跟进 - 张明远',
      workflow: '客户跟进自动化',
      progress: 75,
      status: 'running',
      eta: '约30秒',
    },
    {
      id: 'T002',
      name: '数据同步 - 订单数据',
      workflow: '数据同步流水线',
      progress: 40,
      status: 'running',
      eta: '约20秒',
    },
    {
      id: 'T003',
      name: '客户跟进 - 李思琪',
      workflow: '客户跟进自动化',
      progress: 0,
      status: 'waiting',
      eta: '等待中',
    },
    {
      id: 'T004',
      name: '营销推送 - 会员组',
      workflow: '营销活动触发',
      progress: 0,
      status: 'waiting',
      eta: '流程暂停',
    },
  ]

  const stats = [
    { label: '已完成任务', value: '1,234', icon: CheckCircle2, color: tc.success },
    { label: '活跃工作流', value: '8', icon: Activity, color: tc.accent },
    { label: '平均耗时', value: '2.1分钟', icon: Clock, color: tc.secondary },
    { label: '成功率', value: '99.2%', icon: TrendingUp, color: tc.success },
  ]

  const getStatusColor = (status: Workflow['status']): string => {
    switch (status) {
      case 'running':
        return tc.success
      case 'paused':
        return tc.warning
      case 'completed':
        return tc.success
      case 'failed':
        return tc.destructive
      default:
        return tc.textMuted
    }
  }

  return (
    <div className="space-y-6" style={{ color: tc.textPrimary }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: tc.textPrimary }}>
            {translate('workflow.title')}
          </h1>
          <p className="text-sm" style={{ color: tc.textSecondary }}>
            五维闭环工作流系统 · 自动化任务编排
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{
              background: tc.bgCard,
              color: tc.textSecondary,
              border: `1px solid ${tc.borderSubtle}`,
            }}
          >
            <RefreshCw className="w-4 h-4" />
            刷新
          </button>
          <button
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium"
            style={{ background: tc.gradientButton, color: tc.textPrimary, boxShadow: tc.shadowMd }}
          >
            <Play className="w-5 h-5" />
            新建工作流
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <NeonCard key={stat.label} color={stat.color} hoverable={false} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className="w-8 h-8" style={{ color: stat.color }} />
            </div>
            <p className="text-sm mb-1" style={{ color: tc.textMuted }}>
              {stat.label}
            </p>
            <p className="text-2xl font-bold" style={{ color: tc.textPrimary }}>
              {stat.value}
            </p>
          </NeonCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <NeonCard color={tc.primary} hoverable={false} className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold" style={{ color: tc.textPrimary }}>
              工作流列表
            </h2>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 rounded-lg text-sm"
                style={{
                  background: tc.bgCard,
                  color: tc.textSecondary,
                  border: `1px solid ${tc.borderSubtle}`,
                }}
              >
                全部
              </button>
              <button
                className="px-4 py-2 rounded-lg text-sm"
                style={{
                  background: tc.alpha(tc.success, 0.15),
                  color: tc.success,
                  border: `1px solid ${tc.success}`,
                }}
              >
                运行中
              </button>
              <button
                className="px-4 py-2 rounded-lg text-sm"
                style={{
                  background: tc.bgCard,
                  color: tc.textSecondary,
                  border: `1px solid ${tc.borderSubtle}`,
                }}
              >
                已暂停
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="rounded-xl overflow-hidden cursor-pointer"
                style={{
                  background: tc.bgCard,
                  border: `1px solid ${tc.borderSubtle}`,
                }}
                onClick={() =>
                  setSelectedWorkflow(selectedWorkflow === workflow.id ? null : workflow.id)
                }
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${workflow.status === 'running' ? 'animate-pulse' : ''}`}
                        style={{
                          background: getStatusColor(workflow.status),
                          boxShadow: `0 0 10px ${getStatusColor(workflow.status)}`,
                        }}
                      />
                      <h3 className="font-semibold" style={{ color: tc.textPrimary }}>
                        {workflow.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm" style={{ color: tc.textSecondary }}>
                        运行次数: {workflow.runCount}
                      </span>
                      <span className="text-sm" style={{ color: tc.textSecondary }}>
                        平均耗时: {workflow.avgDuration}
                      </span>
                    </div>
                  </div>

                  {selectedWorkflow === workflow.id && (
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: tc.borderSubtle }}>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm" style={{ color: tc.textSecondary }}>
                          工作流节点
                        </span>
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ background: tc.alpha(tc.success, 0.15), color: tc.success }}
                        >
                          {workflow.nodes.filter((n) => n.status === 'completed').length}/
                          {workflow.nodes.length} 完成
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {workflow.nodes.map((node, index) => (
                          <div key={node.id} className="flex items-center">
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-12 h-12 rounded-lg flex items-center justify-center ${node.status === 'active' ? 'animate-pulse' : ''}`}
                                style={{
                                  background:
                                    node.status === 'completed'
                                      ? tc.alpha(tc.success, 0.15)
                                      : node.status === 'active'
                                        ? tc.alpha(tc.accent, 0.15)
                                        : tc.bgCard,
                                  border: `1px solid ${
                                    node.status === 'completed'
                                      ? tc.success
                                      : node.status === 'active'
                                        ? tc.accent
                                        : tc.borderSubtle
                                  }`,
                                }}
                              >
                                {node.status === 'completed' ? (
                                  <CheckCircle2 className="w-6 h-6" style={{ color: tc.success }} />
                                ) : (
                                  <node.icon
                                    className="w-6 h-6"
                                    style={{ color: tc.textSecondary }}
                                  />
                                )}
                              </div>
                              <span
                                className="text-xs mt-2 text-center"
                                style={{ color: tc.textSecondary }}
                              >
                                {node.name}
                              </span>
                            </div>
                            {index < workflow.nodes.length - 1 && (
                              <ArrowRight
                                className="w-4 h-4 mx-2"
                                style={{ color: tc.borderSubtle }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </NeonCard>

        <NeonCard color={tc.secondary} hoverable={false} className="p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: tc.textPrimary }}>
            实时任务
          </h2>

          <div className="space-y-3">
            {activeTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-lg"
                style={{ background: tc.bgCard, border: `1px solid ${tc.borderSubtle}` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm" style={{ color: tc.textPrimary }}>
                    {task.name}
                  </span>
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      background:
                        task.status === 'running'
                          ? tc.alpha(tc.accent, 0.15)
                          : task.status === 'completed'
                            ? tc.alpha(tc.success, 0.15)
                            : tc.alpha(tc.warning, 0.15),
                      color:
                        task.status === 'running'
                          ? tc.accent
                          : task.status === 'completed'
                            ? tc.success
                            : tc.warning,
                    }}
                  >
                    {task.status === 'running'
                      ? '运行中'
                      : task.status === 'completed'
                        ? '已完成'
                        : '等待中'}
                  </span>
                </div>
                <p className="text-xs mb-2" style={{ color: tc.textSecondary }}>
                  {task.workflow}
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 h-2 rounded-full"
                    style={{ background: tc.bgCard, border: `1px solid ${tc.borderSubtle}` }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${task.progress}%`,
                        background: tc.accent,
                        boxShadow: `0 0 10px ${tc.accent}`,
                      }}
                    />
                  </div>
                  <span className="text-xs" style={{ color: tc.textSecondary }}>
                    {task.progress}%
                  </span>
                </div>
                <p className="text-xs mt-2" style={{ color: tc.textMuted }}>
                  {task.eta}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-lg" style={{ background: tc.alpha(tc.accent, 0.15) }}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5" style={{ color: tc.accent }} />
              <span className="font-medium" style={{ color: tc.accent }}>
                工作流效率提示
              </span>
            </div>
            <p className="text-sm" style={{ color: tc.textSecondary }}>
              当前系统负载正常，建议优化"数据同步流水线"的执行频率以降低资源消耗。
            </p>
          </div>
        </NeonCard>
      </div>
    </div>
  )
}
