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

import { useI18n } from '@/app/components/i18n-context'
import { NeonCard } from '@/app/components/neon-card'
import { useThemeColors } from '@/shared/hooks/use-theme-colors'

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
      name: 'wfp.wf1.name',
      status: 'running',
      createdAt: '2024-05-20',
      lastRun: 'wfp.time.5minAgo',
      runCount: 156,
      avgDuration: 'wfp.wf1.avgDuration',
      nodes: [
        {
          id: '1',
          name: 'wfp.node.input',
          icon: FileText,
          status: 'completed',
          description: 'wfp.wf1.desc.input',
          progress: 100,
        },
        {
          id: '2',
          name: 'wfp.node.intent',
          icon: Target,
          status: 'completed',
          description: 'wfp.wf1.desc.intent',
          progress: 100,
        },
        {
          id: '3',
          name: 'wfp.node.execute',
          icon: Rocket,
          status: 'active',
          description: 'wfp.wf1.desc.execute',
          progress: 65,
        },
        {
          id: '4',
          name: 'wfp.node.optimize',
          icon: TrendingUp,
          status: 'pending',
          description: 'wfp.wf1.desc.optimize',
          progress: 0,
        },
        {
          id: '5',
          name: 'wfp.node.learn',
          icon: Cpu,
          status: 'pending',
          description: 'wfp.wf1.desc.learn',
          progress: 0,
        },
      ],
    },
    {
      id: 'WF002',
      name: 'wfp.wf2.name',
      status: 'running',
      createdAt: '2024-05-18',
      lastRun: 'wfp.time.2minAgo',
      runCount: 892,
      avgDuration: 'wfp.wf2.avgDuration',
      nodes: [
        {
          id: '1',
          name: 'wfp.node.input',
          icon: FileText,
          status: 'completed',
          description: 'wfp.wf2.desc.input',
          progress: 100,
        },
        {
          id: '2',
          name: 'wfp.node.intent',
          icon: Target,
          status: 'completed',
          description: 'wfp.wf2.desc.intent',
          progress: 100,
        },
        {
          id: '3',
          name: 'wfp.node.execute',
          icon: Rocket,
          status: 'completed',
          description: 'wfp.wf2.desc.execute',
          progress: 100,
        },
        {
          id: '4',
          name: 'wfp.node.optimize',
          icon: TrendingUp,
          status: 'active',
          description: 'wfp.wf2.desc.optimize',
          progress: 40,
        },
        {
          id: '5',
          name: 'wfp.node.learn',
          icon: Cpu,
          status: 'pending',
          description: 'wfp.wf2.desc.learn',
          progress: 0,
        },
      ],
    },
    {
      id: 'WF003',
      name: 'wfp.wf3.name',
      status: 'paused',
      createdAt: '2024-05-22',
      lastRun: 'wfp.time.1hAgo',
      runCount: 28,
      avgDuration: 'wfp.wf3.avgDuration',
      nodes: [
        {
          id: '1',
          name: 'wfp.node.input',
          icon: FileText,
          status: 'completed',
          description: 'wfp.wf3.desc.input',
          progress: 100,
        },
        {
          id: '2',
          name: 'wfp.node.intent',
          icon: Target,
          status: 'completed',
          description: 'wfp.wf3.desc.intent',
          progress: 100,
        },
        {
          id: '3',
          name: 'wfp.node.execute',
          icon: Rocket,
          status: 'pending',
          description: 'wfp.wf3.desc.execute',
          progress: 0,
        },
        {
          id: '4',
          name: 'wfp.node.optimize',
          icon: TrendingUp,
          status: 'pending',
          description: 'wfp.wf3.desc.optimize',
          progress: 0,
        },
        {
          id: '5',
          name: 'wfp.node.learn',
          icon: Cpu,
          status: 'pending',
          description: 'wfp.wf3.desc.learn',
          progress: 0,
        },
      ],
    },
    {
      id: 'WF004',
      name: 'wfp.wf4.name',
      status: 'completed',
      createdAt: '2024-05-21',
      lastRun: 'wfp.time.yesterday',
      runCount: 45,
      avgDuration: 'wfp.wf4.avgDuration',
      nodes: [
        {
          id: '1',
          name: 'wfp.node.input',
          icon: FileText,
          status: 'completed',
          description: 'wfp.wf4.desc.input',
          progress: 100,
        },
        {
          id: '2',
          name: 'wfp.node.intent',
          icon: Target,
          status: 'completed',
          description: 'wfp.wf4.desc.intent',
          progress: 100,
        },
        {
          id: '3',
          name: 'wfp.node.execute',
          icon: Rocket,
          status: 'completed',
          description: 'wfp.wf4.desc.execute',
          progress: 100,
        },
        {
          id: '4',
          name: 'wfp.node.optimize',
          icon: TrendingUp,
          status: 'completed',
          description: 'wfp.wf4.desc.optimize',
          progress: 100,
        },
        {
          id: '5',
          name: 'wfp.node.learn',
          icon: Cpu,
          status: 'completed',
          description: 'wfp.wf4.desc.learn',
          progress: 100,
        },
      ],
    },
  ]

  const activeTasks: ActiveTask[] = [
    {
      id: 'T001',
      name: 'wfp.task.t1.name',
      workflow: 'wfp.wf1.name',
      progress: 75,
      status: 'running',
      eta: 'wfp.eta.about30s',
    },
    {
      id: 'T002',
      name: 'wfp.task.t2.name',
      workflow: 'wfp.wf2.name',
      progress: 40,
      status: 'running',
      eta: 'wfp.eta.about20s',
    },
    {
      id: 'T003',
      name: 'wfp.task.t3.name',
      workflow: 'wfp.wf1.name',
      progress: 0,
      status: 'waiting',
      eta: 'wfp.eta.waiting',
    },
    {
      id: 'T004',
      name: 'wfp.task.t4.name',
      workflow: 'wfp.wf3.name',
      progress: 0,
      status: 'waiting',
      eta: 'wfp.eta.paused',
    },
  ]

  const stats = [
    { label: 'wfp.stat.completedTasks', value: '1,234', icon: CheckCircle2, color: tc.success },
    { label: 'wfp.stat.activeWorkflows', value: '8', icon: Activity, color: tc.accent },
    {
      label: 'wfp.stat.avgDuration',
      value: 'wfp.stat.avgDurationValue',
      icon: Clock,
      color: tc.secondary,
    },
    { label: 'wfp.stat.successRate', value: '99.2%', icon: TrendingUp, color: tc.success },
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
            {translate('wfp.subtitle')}
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
            {translate('wfp.refresh')}
          </button>
          <button
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium"
            style={{ background: tc.gradientButton, color: tc.textPrimary, boxShadow: tc.shadowMd }}
          >
            <Play className="w-5 h-5" />
            {translate('wfp.newWorkflow')}
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
              {translate(stat.label)}
            </p>
            <p className="text-2xl font-bold" style={{ color: tc.textPrimary }}>
              {translate(stat.value)}
            </p>
          </NeonCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <NeonCard color={tc.primary} hoverable={false} className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold" style={{ color: tc.textPrimary }}>
              {translate('wfp.listTitle')}
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
                {translate('wfp.filter.all')}
              </button>
              <button
                className="px-4 py-2 rounded-lg text-sm"
                style={{
                  background: tc.alpha(tc.success, 0.15),
                  color: tc.success,
                  border: `1px solid ${tc.success}`,
                }}
              >
                {translate('wfp.filter.running')}
              </button>
              <button
                className="px-4 py-2 rounded-lg text-sm"
                style={{
                  background: tc.bgCard,
                  color: tc.textSecondary,
                  border: `1px solid ${tc.borderSubtle}`,
                }}
              >
                {translate('wfp.filter.paused')}
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
                        {translate(workflow.name)}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm" style={{ color: tc.textSecondary }}>
                        {translate('wfp.runCount')}: {workflow.runCount}
                      </span>
                      <span className="text-sm" style={{ color: tc.textSecondary }}>
                        {translate('wfp.stat.avgDuration')}: {translate(workflow.avgDuration)}
                      </span>
                    </div>
                  </div>

                  {selectedWorkflow === workflow.id && (
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: tc.borderSubtle }}>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm" style={{ color: tc.textSecondary }}>
                          {translate('wfp.nodesTitle')}
                        </span>
                        <span
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ background: tc.alpha(tc.success, 0.15), color: tc.success }}
                        >
                          {workflow.nodes.filter((n) => n.status === 'completed').length}/
                          {workflow.nodes.length} {translate('wfp.completedShort')}
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
                                {translate(node.name)}
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
            {translate('wfp.realtimeTasks')}
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
                    {translate(task.name)}
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
                      ? translate('wfp.status.running')
                      : task.status === 'completed'
                        ? translate('wfp.status.completed')
                        : translate('wfp.status.waiting')}
                  </span>
                </div>
                <p className="text-xs mb-2" style={{ color: tc.textSecondary }}>
                  {translate(task.workflow)}
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
                  {translate(task.eta)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-lg" style={{ background: tc.alpha(tc.accent, 0.15) }}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5" style={{ color: tc.accent }} />
              <span className="font-medium" style={{ color: tc.accent }}>
                {translate('wfp.tipTitle')}
              </span>
            </div>
            <p className="text-sm" style={{ color: tc.textSecondary }}>
              {translate('wfp.tipBody')}
            </p>
          </div>
        </NeonCard>
      </div>
    </div>
  )
}
