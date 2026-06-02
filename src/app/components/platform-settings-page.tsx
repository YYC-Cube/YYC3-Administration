import {
  Activity, AlertTriangle, BarChart3, CheckCircle2, Cpu, Database, Link,
  Server, Settings, Shield, TrendingUp, Zap,
} from "lucide-react";
import { useState } from "react";
import {
  Area, AreaChart, Line, LineChart, ResponsiveContainer, Tooltip,
  XAxis, YAxis,
} from "recharts";

import { useThemeColors } from "./hooks/use-theme-colors";
import { NeonCard } from "./neon-card";


// ==========================================
// YYC³ 平台设置页面 - Platform Settings
// 平台级统一配置管理 · 微服务架构 · 云原生AIOps
// ==========================================

type SettingTab = "overview" | "interface" | "integration" | "security" | "performance" | "monitoring";

export function PlatformSettingsPage() {
  const tc = useThemeColors();
  const [activeTab, setActiveTab] = useState<SettingTab>("overview");

  // Mock performance data
  const performanceData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    cpu: 30 + Math.random() * 40,
    memory: 40 + Math.random() * 30,
    requests: 100 + Math.random() * 150,
  }));

  const tabs = [
    { id: "overview" as const, label: "概览", icon: Server },
    { id: "interface" as const, label: "接口设置", icon: Cpu },
    { id: "integration" as const, label: "集成管理", icon: Link },
    { id: "security" as const, label: "安全设置", icon: Shield },
    { id: "performance" as const, label: "性能配置", icon: Zap },
    { id: "monitoring" as const, label: "监控设置", icon: Activity },
  ];

  return (
    <div className="h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
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
              background: tc.alpha("#3b82f6", 0.1),
              border: `1px solid ${tc.alpha("#3b82f6", 0.2)}`,
              boxShadow: `0 0 15px ${tc.alpha("#3b82f6", 0.1)}`,
            }}
          >
            <Server className="w-5 h-5" style={{ color: "#3b82f6" }} />
          </div>
          <div>
            <h1
              className="tracking-wider"
              style={{
                color: tc.primary,
                textShadow: `0 0 15px ${tc.alpha(tc.primary, 0.4)}`,
              }}
            >
              平台设置
            </h1>
            <p className="text-[10px] text-white/20 tracking-wider">
              平台级统一配置管理 · 微服务架构 · 云原生AIOps
            </p>
          </div>
          <span
            className="ml-2 px-2 py-0.5 rounded-full text-[9px]"
            style={{
              background: tc.alpha("#3b82f6", 0.08),
              color: "#3b82f6",
              border: `1px solid ${tc.alpha("#3b82f6", 0.15)}`,
            }}
          >
            平台集成
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-6 pb-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "平台健康度", value: "98%", trend: "+2%", trendUp: true, color: "#22c55e" },
            { label: "活跃接口", value: "256", trend: "稳定", color: "#3b82f6" },
            { label: "集成平台", value: "8个", trend: "+1 本月", trendUp: true, color: "#8b5cf6" },
            { label: "性能指数", value: "A+", trend: "优秀", trendUp: true, color: "#eab308" },
          ].map((stat, idx) => (
            <NeonCard key={idx} color={stat.color}>
              <div style={{ animation: `spring-in 0.35s var(--spring-easing) ${idx * 0.05}s both` }}>
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
                  <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>
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
        <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1.5 whitespace-nowrap transition-all"
                style={{
                  background: isActive ? tc.alpha(tc.primary, 0.15) : tc.alpha(tc.card, 0.5),
                  border: `1px solid ${isActive ? tc.alpha(tc.primary, 0.3) : tc.alpha(tc.border, 0.1)}`,
                  color: isActive ? tc.primary : tc.mutedForeground,
                  boxShadow: isActive ? `0 0 15px ${tc.alpha(tc.primary, 0.2)}` : "none",
                }}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-8">
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Platform Health */}
            <NeonCard color={tc.primary}>
              <h3 className="text-[12px] text-white/60 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" style={{ color: tc.primary }} />
                平台健康状态
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
                        borderRadius: "8px",
                        fontSize: "11px",
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
                { name: "API网关", status: "running", uptime: "99.97%", color: "#22c55e" },
                { name: "数据库集群", status: "running", uptime: "99.95%", color: "#3b82f6" },
                { name: "缓存服务", status: "running", uptime: "99.99%", color: "#8b5cf6" },
                { name: "消息队列", status: "warning", uptime: "98.50%", color: "#eab308" },
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
                        <p className="text-[9px] text-white/30">运行时间: {service.uptime}</p>
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
                      {service.status === "running" ? "正常" : "警告"}
                    </span>
                  </div>
                </NeonCard>
              ))}
            </div>
          </div>
        )}

        {activeTab === "interface" && (
          <div className="space-y-4">
            <NeonCard color={tc.secondary}>
              <h3 className="text-[12px] text-white/60 mb-4 flex items-center gap-2">
                <Cpu className="w-4 h-4" style={{ color: tc.secondary }} />
                API 接口配置
              </h3>
              <div className="space-y-3">
                {[
                  { name: "REST API", endpoint: "/api/v1", requests: "1.2M/day", latency: "45ms" },
                  { name: "GraphQL", endpoint: "/graphql", requests: "350K/day", latency: "38ms" },
                  { name: "WebSocket", endpoint: "/ws", requests: "80K/day", latency: "12ms" },
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
                        在线
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[9px] text-white/40">
                      <span>请求: {api.requests}</span>
                      <span>延迟: {api.latency}</span>
                    </div>
                  </div>
                ))}
              </div>
            </NeonCard>
          </div>
        )}

        {activeTab === "integration" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { platform: "微信公众号", status: "active", sync: "实时同步", lastSync: "2分钟前" },
                { platform: "钉钉应用", status: "active", sync: "定时同步", lastSync: "10分钟前" },
                { platform: "飞书应用", status: "inactive", sync: "未配置", lastSync: "-" },
                { platform: "抖音开放平台", status: "inactive", sync: "未配置", lastSync: "-" },
              ].map((integration, idx) => (
                <NeonCard key={idx} color={tc.primary}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[12px] text-white/70">{integration.platform}</h4>
                      <span
                        className="px-2 py-0.5 rounded-md text-[8px] flex items-center gap-1"
                        style={{
                          background: tc.alpha(
                            integration.status === "active" ? tc.success : tc.muted,
                            0.1
                          ),
                          color: integration.status === "active" ? tc.success : tc.mutedForeground,
                          border: `1px solid ${tc.alpha(
                            integration.status === "active" ? tc.success : tc.muted,
                            0.2
                          )}`,
                        }}
                      >
                        {integration.status === "active" ? (
                          <CheckCircle2 className="w-2.5 h-2.5" />
                        ) : (
                          <AlertTriangle className="w-2.5 h-2.5" />
                        )}
                        {integration.status === "active" ? "已启用" : "未启用"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-white/40">
                      <span>同步方式: {integration.sync}</span>
                      <span>最近同步: {integration.lastSync}</span>
                    </div>
                  </div>
                </NeonCard>
              ))}
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <NeonCard color={tc.destructive}>
            <h3 className="text-[12px] text-white/60 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" style={{ color: tc.destructive }} />
              安全设置
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: "数据加密", value: "AES-256", status: "enabled" },
                  { label: "访问控制", value: "RBAC", status: "enabled" },
                  { label: "多因素认证", value: "TOTP + SMS", status: "enabled" },
                  { label: "审计日志", value: "完整记录", status: "enabled" },
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

        {activeTab === "performance" && (
          <div className="space-y-4">
            <NeonCard color={tc.warning}>
              <h3 className="text-[12px] text-white/60 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" style={{ color: tc.warning }} />
                性能监控
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
                        borderRadius: "8px",
                        fontSize: "11px",
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
                { metric: "缓存命中率", value: "94.5%", status: "good" },
                { metric: "平均响应时间", value: "45ms", status: "good" },
                { metric: "错误率", value: "0.02%", status: "good" },
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

        {activeTab === "monitoring" && (
          <div className="space-y-4">
            <NeonCard color={tc.accent}>
              <h3 className="text-[12px] text-white/60 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" style={{ color: tc.accent }} />
                告警规则配置
              </h3>
              <div className="space-y-3">
                {[
                  { name: "CPU使用率过高", threshold: "> 85%", severity: "critical", enabled: true },
                  { name: "内存使用率过高", threshold: "> 90%", severity: "warning", enabled: true },
                  { name: "API响应时间过长", threshold: "> 1000ms", severity: "warning", enabled: true },
                  { name: "错误率异常", threshold: "> 1%", severity: "critical", enabled: false },
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
                            rule.severity === "critical" ? tc.destructive : tc.warning,
                            0.1
                          ),
                          color: rule.severity === "critical" ? tc.destructive : tc.warning,
                          border: `1px solid ${tc.alpha(
                            rule.severity === "critical" ? tc.destructive : tc.warning,
                            0.2
                          )}`,
                        }}
                      >
                        {rule.severity === "critical" ? "严重" : "警告"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-white/40">
                      <span>阈值: {rule.threshold}</span>
                      <span style={{ color: rule.enabled ? tc.success : tc.mutedForeground }}>
                        {rule.enabled ? "已启用" : "已禁用"}
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
              <h4 className="text-[11px] text-white/60 mb-2">AI 智能特性</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5">
                {[
                  "平台健康度AI评估",
                  "API性能AI分析与瓶颈识别",
                  "缓存命中率AI优化",
                  "异常检测AI算法",
                  "告警降噪AI模型",
                  "容量规划AI预测",
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
  );
}
