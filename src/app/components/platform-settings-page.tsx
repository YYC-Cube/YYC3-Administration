import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Cpu,
  Link,
  Server,
  Shield,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useThemeColors } from './hooks/use-theme-colors'
import { useI18n } from './i18n-context'
import { NeonCard } from './neon-card'

// ==========================================
// YYC³ 平台设置页面 - Platform Settings
// 平台级统一配置管理 · 微服务架构 · 云原生AIOps
// ==========================================

type SettingTab =
  | 'overview'
  | 'interface'
  | 'integration'
  | 'security'
  | 'performance'
  | 'monitoring'

export function PlatformSettingsPage() {
  const tc = useThemeColors()
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState<SettingTab>('overview')

  // Mock performance data
  const performanceData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    cpu: 30 + Math.random() * 40,
    memory: 40 + Math.random() * 30,
    requests: 100 + Math.random() * 150,
  }))

  const tabs = [
    { id: 'overview' as const, label: t('plt.cat.overview'), icon: Server },
    { id: 'interface' as const, label: t('plt.cat.interface'), icon: Cpu },
    { id: 'integration' as const, label: t('plt.cat.integration'), icon: Link },
    { id: 'security' as const, label: t('plt.cat.security'), icon: Shield },
    { id: 'performance' as const, label: t('plt.cat.performance'), icon: Zap },
    { id: 'monitoring' as const, label: t('plt.cat.monitoring'), icon: Activity },
  ]

  return (
    <div className="h-full overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-1 z-10"
        style={{
          background: `linear-gradient(90deg, #3b82f6, ${tc.primary}, ${tc.secondary})`,
          opacity: 0.5,
        }}
      />

      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{
              background: tc.alpha('#3b82f6', 0.1),
              border: `1px solid ${tc.alpha('#3b82f6', 0.2)}`,
              boxShadow: `0 0 15px ${tc.alpha('#3b82f6', 0.1)}`,
            }}
          >
            <Server className="w-5 h-5" style={{ color: '#3b82f6' }} />
          </div>
          <div>
            <h1
              className="tracking-wider"
              style={{
                color: tc.primary,
                textShadow: `0 0 15px ${tc.alpha(tc.primary, 0.4)}`,
              }}
            >
              {t('plt.title')}
            </h1>
            <p className="text-[10px] text-white/20 tracking-wider">{t('plt.desc')}</p>
          </div>
          <span
            className="ml-2 px-2 py-0.5 rounded-full text-[9px]"
            style={{
              background: tc.alpha('#3b82f6', 0.08),
              color: '#3b82f6',
              border: `1px solid ${tc.alpha('#3b82f6', 0.15)}`,
            }}
          >
            t('plt.platformIntegration')
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-6 pb-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: t('plt.stat.health'),
              value: '98%',
              trend: '+2%',
              trendUp: true,
              color: '#22c55e',
            },
            {
              label: t('plt.stat.activeApis'),
              value: '256',
              trend: t('plt.stable'),
              color: '#3b82f6',
            },
            {
              label: t('plt.stat.integratedPlatforms'),
              value: t('plt.stat.eightPlatforms'),
              trend: t('plt.stat.oneThisMonth'),
              trendUp: true,
              color: '#8b5cf6',
            },
            {
              label: t('plt.stat.performanceIndex'),
              value: 'A+',
              trend: t('plt.excellent'),
              trendUp: true,
              color: '#eab308',
            },
          ].map((stat, idx) => (
            <NeonCard key={idx} color={stat.color}>
              <div
                style={{ animation: `spring-in 0.35s var(--spring-easing) ${idx * 0.05}s both` }}
              >
                <p className="text-[10px] text-white/30 mb-1">{stat.label}</p>
                <p
                  className="text-xl mb-0.5"
                  style={{
                    color: stat.color,
                    textShadow: `0 0 12px ${tc.alpha(stat.color, 0.3)}`,
                  }}
                >
                  {stat.value}
                </p>
                {stat.trend && (
                  <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {stat.trend}
                  </span>
                )}
              </div>
            </NeonCard>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1.5 whitespace-nowrap transition-all"
                style={{
                  background: isActive ? tc.alpha(tc.primary, 0.15) : tc.alpha(tc.card, 0.5),
                  border: `1px solid ${isActive ? tc.alpha(tc.primary, 0.3) : tc.alpha(tc.border, 0.1)}`,
                  color: isActive ? tc.primary : tc.mutedForeground,
                  boxShadow: isActive ? `0 0 15px ${tc.alpha(tc.primary, 0.2)}` : 'none',
                }}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-8">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Platform Health */}
            <NeonCard color={tc.primary}>
              <h3 className="text-[12px] text-white/60 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" style={{ color: tc.primary }} />
                {t('plt.platformHealth')}
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={tc.primary} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={tc.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="hour"
                      stroke={tc.alpha(tc.foreground, 0.2)}
                      tick={{ fill: tc.alpha(tc.foreground, 0.4), fontSize: 10 }}
                    />
                    <YAxis
                      stroke={tc.alpha(tc.foreground, 0.2)}
                      tick={{ fill: tc.alpha(tc.foreground, 0.4), fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: tc.alpha(tc.card, 0.95),
                        border: `1px solid ${tc.alpha(tc.border, 0.3)}`,
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="cpu"
                      stroke={tc.primary}
                      fill="url(#cpuGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </NeonCard>

            {/* Service Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  name: t('plt.service.apiGateway'),
                  status: 'running',
                  uptime: '99.97%',
                  color: '#22c55e',
                },
                {
                  name: t('plt.service.dbCluster'),
                  status: 'running',
                  uptime: '99.95%',
                  color: '#3b82f6',
                },
                {
                  name: t('plt.service.cacheService'),
                  status: 'running',
                  uptime: '99.99%',
                  color: '#8b5cf6',
                },
                {
                  name: t('plt.service.messageQueue'),
                  status: 'warning',
                  uptime: '98.50%',
                  color: '#eab308',
                },
              ].map((service, idx) => (
                <NeonCard key={idx} color={service.color}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: service.color,
                          boxShadow: `0 0 8px ${tc.alpha(service.color, 0.6)}`,
                        }}
                      />
                      <div>
                        <h4 className="text-[11px] text-white/60">{service.name}</h4>
                        <p className="text-[9px] text-white/30">
                          t('plt.uptime'): {service.uptime}
                        </p>
                      </div>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-md text-[8px]"
                      style={{
                        background: tc.alpha(service.color, 0.1),
                        color: service.color,
                        border: `1px solid ${tc.alpha(service.color, 0.2)}`,
                      }}
                    >
                      service.status === 'running' ? t('plt.normal') : t('plt.warning')
                    </span>
                  </div>
                </NeonCard>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'interface' && (
          <div className="space-y-4">
            <NeonCard color={tc.secondary}>
              <h3 className="text-[12px] text-white/60 mb-4 flex items-center gap-2">
                <Cpu className="w-4 h-4" style={{ color: tc.secondary }} />
                {t('plt.apiConfig')}
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'REST API', endpoint: '/api/v1', requests: '1.2M/day', latency: '45ms' },
                  { name: 'GraphQL', endpoint: '/graphql', requests: '350K/day', latency: '38ms' },
                  { name: 'WebSocket', endpoint: '/ws', requests: '80K/day', latency: '12ms' },
                ].map((api, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg"
                    style={{
                      background: tc.alpha(tc.muted, 0.05),
                      border: `1px solid ${tc.alpha(tc.border, 0.1)}`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-[11px] text-white/60">{api.name}</h4>
                        <p className="text-[9px] text-white/30">{api.endpoint}</p>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded-md text-[8px]"
                        style={{
                          background: tc.alpha(tc.success, 0.1),
                          color: tc.success,
                          border: `1px solid ${tc.alpha(tc.success, 0.2)}`,
                        }}
                      >
                        t('plt.online')
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[9px] text-white/40">
                      <span>t('plt.requests'): {api.requests}</span>
                      <span>t('plt.latency'): {api.latency}</span>
                    </div>
                  </div>
                ))}
              </div>
            </NeonCard>
          </div>
        )}

        {activeTab === 'integration' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  platform: t('param.wechat'),
                  status: 'active',
                  sync: t('plt.sync.realtime'),
                  lastSync: t('plt.sync.2minAgo'),
                },
                {
                  platform: t('param.dingtalk'),
                  status: 'active',
                  sync: t('plt.sync.scheduled'),
                  lastSync: t('plt.sync.10minAgo'),
                },
                {
                  platform: t('param.feishu'),
                  status: 'inactive',
                  sync: t('plt.sync.notConfigured'),
                  lastSync: '-',
                },
                {
                  platform: t('param.douyin'),
                  status: 'inactive',
                  sync: t('plt.sync.notConfigured'),
                  lastSync: '-',
                },
              ].map((integration, idx) => (
                <NeonCard key={idx} color={tc.primary}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[12px] text-white/70">{integration.platform}</h4>
                      <span
                        className="px-2 py-0.5 rounded-md text-[8px] flex items-center gap-1"
                        style={{
                          background: tc.alpha(
                            integration.status === 'active' ? tc.success : tc.muted,
                            0.1,
                          ),
                          color: integration.status === 'active' ? tc.success : tc.mutedForeground,
                          border: `1px solid ${tc.alpha(
                            integration.status === 'active' ? tc.success : tc.muted,
                            0.2,
                          )}`,
                        }}
                      >
                        {integration.status === 'active' ? (
                          <CheckCircle2 className="w-2.5 h-2.5" />
                        ) : (
                          <AlertTriangle className="w-2.5 h-2.5" />
                        )}
                        integration.status === 'active' ? t('plt.enabled') : t('plt.disabled')
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-white/40">
                      <span>t('plt.syncMethod'): {integration.sync}</span>
                      <span>t('plt.lastSync'): {integration.lastSync}</span>
                    </div>
                  </div>
                </NeonCard>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <NeonCard color={tc.destructive}>
            <h3 className="text-[12px] text-white/60 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" style={{ color: tc.destructive }} />
              {t('plt.cat.security')}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: t('plt.dataEncryption'), value: 'AES-256', status: 'enabled' },
                  { label: t('plt.accessControl'), value: 'RBAC', status: 'enabled' },
                  { label: t('plt.multiFactorAuth'), value: 'TOTP + SMS', status: 'enabled' },
                  { label: t('plt.auditLog'), value: t('plt.fullRecord'), status: 'enabled' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg"
                    style={{
                      background: tc.alpha(tc.muted, 0.05),
                      border: `1px solid ${tc.alpha(tc.border, 0.1)}`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-[11px] text-white/60">{item.label}</h4>
                      <CheckCircle2 className="w-3.5 h-3.5" style={{ color: tc.success }} />
                    </div>
                    <p className="text-[9px] text-white/30">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </NeonCard>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-4">
            <NeonCard color={tc.warning}>
              <h3 className="text-[12px] text-white/60 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" style={{ color: tc.warning }} />
                {t('plt.performanceMonitor')}
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <XAxis
                      dataKey="hour"
                      stroke={tc.alpha(tc.foreground, 0.2)}
                      tick={{ fill: tc.alpha(tc.foreground, 0.4), fontSize: 10 }}
                    />
                    <YAxis
                      stroke={tc.alpha(tc.foreground, 0.2)}
                      tick={{ fill: tc.alpha(tc.foreground, 0.4), fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: tc.alpha(tc.card, 0.95),
                        border: `1px solid ${tc.alpha(tc.border, 0.3)}`,
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                    />
                    <Line type="monotone" dataKey="cpu" stroke="#eab308" strokeWidth={2} />
                    <Line type="monotone" dataKey="memory" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </NeonCard>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { metric: t('plt.cacheHitRate'), value: '94.5%', status: 'good' },
                { metric: t('plt.avgResponseTime'), value: '45ms', status: 'good' },
                { metric: t('plt.errorRate'), value: '0.02%', status: 'good' },
              ].map((perf, idx) => (
                <NeonCard key={idx} color={tc.success}>
                  <div className="text-center">
                    <p className="text-[10px] text-white/30 mb-2">{perf.metric}</p>
                    <p
                      className="text-2xl"
                      style={{
                        color: tc.success,
                        textShadow: `0 0 15px ${tc.alpha(tc.success, 0.3)}`,
                      }}
                    >
                      {perf.value}
                    </p>
                  </div>
                </NeonCard>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div className="space-y-4">
            <NeonCard color={tc.accent}>
              <h3 className="text-[12px] text-white/60 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" style={{ color: tc.accent }} />
                {t('plt.alertRules')}
              </h3>
              <div className="space-y-3">
                {[
                  {
                    name: t('plt.alert.cpuHigh'),
                    threshold: '> 85%',
                    severity: 'critical',
                    enabled: true,
                  },
                  {
                    name: t('plt.alert.memHigh'),
                    threshold: '> 90%',
                    severity: 'warning',
                    enabled: true,
                  },
                  {
                    name: t('plt.alert.apiSlow'),
                    threshold: '> 1000ms',
                    severity: 'warning',
                    enabled: true,
                  },
                  {
                    name: t('plt.alert.errorRateAbnormal'),
                    threshold: '> 1%',
                    severity: 'critical',
                    enabled: false,
                  },
                ].map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg"
                    style={{
                      background: tc.alpha(tc.muted, 0.05),
                      border: `1px solid ${tc.alpha(tc.border, 0.1)}`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[11px] text-white/60">{rule.name}</h4>
                      <span
                        className="px-2 py-0.5 rounded-md text-[8px]"
                        style={{
                          background: tc.alpha(
                            rule.severity === 'critical' ? tc.destructive : tc.warning,
                            0.1,
                          ),
                          color: rule.severity === 'critical' ? tc.destructive : tc.warning,
                          border: `1px solid ${tc.alpha(
                            rule.severity === 'critical' ? tc.destructive : tc.warning,
                            0.2,
                          )}`,
                        }}
                      >
                        rule.severity === 'critical' ? t('plt.critical') : t('plt.warning')
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-white/40">
                      <span>t('plt.threshold'): {rule.threshold}</span>
                      <span style={{ color: rule.enabled ? tc.success : tc.mutedForeground }}>
                        rule.enabled ? t('plt.enabled') : t('plt.disabled')
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </NeonCard>
          </div>
        )}
      </div>

      {/* AI Capabilities */}
      <div className="px-6 pb-8">
        <NeonCard color={tc.accent} hoverable={false}>
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 shrink-0" style={{ color: tc.accent }} />
            <div>
              <h4 className="text-[11px] text-white/60 mb-2">{t('plt.aiFeatures')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5">
                {[
                  t('plt.ai.healthAssessment'),
                  t('plt.ai.apiAnalysis'),
                  t('plt.ai.cacheOptimization'),
                  t('plt.ai.anomalyDetection'),
                  t('plt.ai.alertDenoise'),
                  t('plt.ai.capacityPlanning'),
                ].map((cap, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div
                      className="w-1 h-1 rounded-full shrink-0"
                      style={{
                        background: tc.accent,
                        boxShadow: `0 0 4px ${tc.alpha(tc.accent, 0.5)}`,
                      }}
                    />
                    <span className="text-[10px] text-white/35">{cap}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </NeonCard>
      </div>
    </div>
  )
}
