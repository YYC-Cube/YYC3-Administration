import {
  Activity, AlertTriangle, BarChart3, CheckCircle2, Clock, Cpu,
  Database, GitBranch, Pause, Play, Settings, TrendingUp,
} from "lucide-react";
import { useState } from "react";
import {
  Area, AreaChart, Line, LineChart, ResponsiveContainer, Tooltip,
  XAxis, YAxis,
} from "recharts";

import { useThemeColors } from "./hooks/use-theme-colors";
import { NeonCard } from "./neon-card";


// ==========================================
// YYC³ 数据集成页面 - Data Integration
// 企业级数据集成 · 实时CDC同步 · 数据质量保障
// ==========================================

type IntegrationTab = "sources" | "sync" | "transform" | "quality" | "lineage" | "monitoring";

interface DataSource {
  id: string;
  name: string;
  type: string;
  status: "connected" | "disconnected" | "error";
  lastSync: string;
  records: number;
  quality: number;
}

export function DataIntegrationPage() {
  const tc = useThemeColors();
  const [activeTab, setActiveTab] = useState<IntegrationTab>("sources");

  const dataSources: DataSource[] = [
    { id: "mysql-1", name: "主业务数据库", type: "MySQL", status: "connected", lastSync: "1分钟前", records: 2840000, quality: 98 },
    { id: "pg-1", name: "分析数据库", type: "PostgreSQL", status: "connected", lastSync: "3分钟前", records: 1560000, quality: 95 },
    { id: "redis-1", name: "缓存数据库", type: "Redis", status: "connected", lastSync: "实时", records: 128000, quality: 100 },
    { id: "mongo-1", name: "文档数据库", type: "MongoDB", status: "connected", lastSync: "5分钟前", records: 890000, quality: 92 },
    { id: "kafka-1", name: "消息队列", type: "Kafka", status: "connected", lastSync: "实时", records: 56000, quality: 97 },
    { id: "api-1", name: "外部API", type: "REST API", status: "error", lastSync: "2小时前", records: 0, quality: 0 },
  ];

  const syncThroughputData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    records: 5000 + Math.random() * 10000,
    errors: Math.random() * 100,
  }));

  const qualityTrendData = Array.from({ length: 7 }, (_, i) => ({
    day: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"][i],
    completeness: 92 + Math.random() * 6,
    accuracy: 88 + Math.random() * 8,
    consistency: 90 + Math.random() * 7,
  }));

  const tabs = [
    { id: "sources" as const, label: "数据源", icon: Database },
    { id: "sync" as const, label: "数据同步", icon: Activity },
    { id: "transform" as const, label: "数据转换", icon: Cpu },
    { id: "quality" as const, label: "数据质量", icon: CheckCircle2 },
    { id: "lineage" as const, label: "数据血缘", icon: GitBranch },
    { id: "monitoring" as const, label: "监控", icon: BarChart3 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return tc.success;
      case "error":
        return tc.destructive;
      case "disconnected":
        return tc.muted;
      default:
        return tc.muted;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "connected":
        return "已连接";
      case "error":
        return "错误";
      case "disconnected":
        return "未连接";
      default:
        return "未知";
    }
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 95) return tc.success;
    if (quality >= 85) return tc.warning;
    return tc.destructive;
  };

  return (
    <div className="h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-1 z-10"
        style={{
          background: `linear-gradient(90deg, #06b6d4, ${tc.primary}, ${tc.secondary})`,
          opacity: 0.5,
        }}
      />

      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{
              background: tc.alpha("#06b6d4", 0.1),
              border: `1px solid ${tc.alpha("#06b6d4", 0.2)}`,
              boxShadow: `0 0 15px ${tc.alpha("#06b6d4", 0.1)}`,
            }}
          >
            <Database className="w-5 h-5" style={{ color: "#06b6d4" }} />
          </div>
          <div>
            <h1
              className="tracking-wider"
              style={{
                color: tc.primary,
                textShadow: `0 0 15px ${tc.alpha(tc.primary, 0.4)}`,
              }}
            >
              数据集成
            </h1>
            <p className="text-[10px] text-white/20 tracking-wider">
              企业级数据集成 · 实时CDC同步 · 数据质量保障 · 数据血缘
            </p>
          </div>
          <span
            className="ml-2 px-2 py-0.5 rounded-full text-[9px]"
            style={{
              background: tc.alpha("#06b6d4", 0.08),
              color: "#06b6d4",
              border: `1px solid ${tc.alpha("#06b6d4", 0.15)}`,
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
            { label: "数据源", value: "15个", trend: "+2 本月", trendUp: true, color: "#06b6d4" },
            { label: "同步任务", value: "48个", trend: "运行中", color: "#22c55e" },
            { label: "数据质量", value: "94分", trend: "+3分", trendUp: true, color: "#8b5cf6" },
            { label: "日处理量", value: "2.1TB", trend: "稳定", color: "#f97316" },
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
                  background: isActive ? tc.alpha("#06b6d4", 0.15) : tc.alpha(tc.card, 0.5),
                  border: `1px solid ${isActive ? tc.alpha("#06b6d4", 0.3) : tc.alpha(tc.border, 0.1)}`,
                  color: isActive ? "#06b6d4" : tc.mutedForeground,
                  boxShadow: isActive ? `0 0 15px ${tc.alpha("#06b6d4", 0.2)}` : "none",
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
        {activeTab === "sources" && (
          <div className="space-y-4">
            {dataSources.map((source, idx) => (
              <NeonCard key={idx} color={getStatusColor(source.status)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: tc.alpha(getStatusColor(source.status), 0.1),
                        border: `1px solid ${tc.alpha(getStatusColor(source.status), 0.2)}`,
                      }}
                    >
                      <Database className="w-5 h-5" style={{ color: getStatusColor(source.status) }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-[12px] text-white/70">{source.name}</h4>
                        <span
                          className="px-2 py-0.5 rounded-md text-[8px]"
                          style={{
                            background: tc.alpha(getStatusColor(source.status), 0.1),
                            color: getStatusColor(source.status),
                            border: `1px solid ${tc.alpha(getStatusColor(source.status), 0.2)}`,
                          }}
                        >
                          {source.type}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-md text-[8px] flex items-center gap-1"
                          style={{
                            background: tc.alpha(getStatusColor(source.status), 0.1),
                            color: getStatusColor(source.status),
                            border: `1px solid ${tc.alpha(getStatusColor(source.status), 0.2)}`,
                          }}
                        >
                          {source.status === "connected" && <CheckCircle2 className="w-2.5 h-2.5" />}
                          {source.status === "error" && <AlertTriangle className="w-2.5 h-2.5" />}
                          {getStatusText(source.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[9px] text-white/40">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          最近同步: {source.lastSync}
                        </span>
                        {source.records > 0 && (
                          <>
                            <span>记录数: {source.records.toLocaleString()}</span>
                            <span>质量: {source.quality}分</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-1 rounded-lg text-[10px] transition-all"
                      style={{
                        background: tc.alpha(tc.secondary, 0.1),
                        border: `1px solid ${tc.alpha(tc.secondary, 0.2)}`,
                        color: tc.secondary,
                      }}
                    >
                      配置
                    </button>
                    <button
                      className="px-3 py-1 rounded-lg text-[10px] transition-all"
                      style={{
                        background: tc.alpha(tc.accent, 0.1),
                        border: `1px solid ${tc.alpha(tc.accent, 0.2)}`,
                        color: tc.accent,
                      }}
                    >
                      测试
                    </button>
                  </div>
                </div>
              </NeonCard>
            ))}
          </div>
        )}

        {activeTab === "sync" && (
          <div className="space-y-4">
            <NeonCard color={tc.primary}>
              <h3 className="text-[12px] text-white/60 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" style={{ color: tc.primary }} />
                同步任务列表
              </h3>
              <div className="space-y-3">
                {[
                  { name: "用户数据同步", source: "MySQL", target: "PostgreSQL", mode: "实时CDC", status: "running" },
                  { name: "订单数据同步", source: "MySQL", target: "MongoDB", mode: "增量同步", status: "running" },
                  { name: "日志数据归档", source: "Kafka", target: "S3", mode: "批量同步", status: "running" },
                  { name: "分析数据更新", source: "PostgreSQL", target: "Redis", mode: "定时同步", status: "paused" },
                ].map((task, idx) => (
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
                        <h4 className="text-[11px] text-white/60">{task.name}</h4>
                        <p className="text-[9px] text-white/30">
                          {task.source} → {task.target}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded-md text-[8px]"
                          style={{
                            background: tc.alpha(tc.accent, 0.1),
                            color: tc.accent,
                            border: `1px solid ${tc.alpha(tc.accent, 0.2)}`,
                          }}
                        >
                          {task.mode}
                        </span>
                        <button
                          className="w-6 h-6 rounded-md flex items-center justify-center"
                          style={{
                            background: tc.alpha(task.status === "running" ? tc.success : tc.warning, 0.1),
                            border: `1px solid ${tc.alpha(task.status === "running" ? tc.success : tc.warning, 0.2)}`,
                            color: task.status === "running" ? tc.success : tc.warning,
                          }}
                        >
                          {task.status === "running" ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </NeonCard>

            {/* Sync Throughput */}
            <NeonCard color={tc.accent}>
              <h3 className="text-[12px] text-white/60 mb-3">同步吞吐量 (记录/小时)</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={syncThroughputData}>
                    <defs>
                      <linearGradient id="throughputGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={tc.accent} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={tc.accent} stopOpacity={0} />
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
                      dataKey="records"
                      stroke={tc.accent}
                      fill="url(#throughputGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </NeonCard>
          </div>
        )}

        {activeTab === "transform" && (
          <NeonCard color={tc.secondary}>
            <h3 className="text-[12px] text-white/60 mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4" style={{ color: tc.secondary }} />
              数据转换规则
            </h3>
            <div className="space-y-3">
              {[
                { name: "用户数据脱敏", type: "数据脱敏", fields: ["phone", "email", "idCard"], status: "active" },
                { name: "订单金额转换", type: "格式转换", fields: ["amount"], status: "active" },
                { name: "时间戳标准化", type: "类型转换", fields: ["createdAt", "updatedAt"], status: "active" },
                { name: "地址信息清洗", type: "数据清洗", fields: ["address"], status: "inactive" },
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
                    <div>
                      <h4 className="text-[11px] text-white/60">{rule.name}</h4>
                      <p className="text-[9px] text-white/30">字段: {rule.fields.join(", ")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded-md text-[8px]"
                        style={{
                          background: tc.alpha(tc.accent, 0.1),
                          color: tc.accent,
                          border: `1px solid ${tc.alpha(tc.accent, 0.2)}`,
                        }}
                      >
                        {rule.type}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-md text-[8px]"
                        style={{
                          background: tc.alpha(rule.status === "active" ? tc.success : tc.muted, 0.1),
                          color: rule.status === "active" ? tc.success : tc.mutedForeground,
                          border: `1px solid ${tc.alpha(rule.status === "active" ? tc.success : tc.muted, 0.2)}`,
                        }}
                      >
                        {rule.status === "active" ? "已启用" : "已禁用"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </NeonCard>
        )}

        {activeTab === "quality" && (
          <div className="space-y-4">
            {/* Quality Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { dimension: "完整性", score: 94, threshold: 90, color: tc.success },
                { dimension: "准确性", score: 91, threshold: 85, color: tc.success },
                { dimension: "一致性", score: 88, threshold: 85, color: tc.warning },
              ].map((item, idx) => (
                <NeonCard key={idx} color={item.color}>
                  <div className="text-center">
                    <p className="text-[10px] text-white/30 mb-2">{item.dimension}</p>
                    <p
                      className="text-3xl mb-1"
                      style={{
                        color: item.color,
                        textShadow: `0 0 15px ${tc.alpha(item.color, 0.3)}`,
                      }}
                    >
                      {item.score}
                      <span className="text-lg">分</span>
                    </p>
                    <p className="text-[9px] text-white/30">阈值: {item.threshold}分</p>
                  </div>
                </NeonCard>
              ))}
            </div>

            {/* Quality Trend */}
            <NeonCard color={tc.accent}>
              <h3 className="text-[12px] text-white/60 mb-3">数据质量趋势</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={qualityTrendData}>
                    <XAxis
                      dataKey="day"
                      stroke={tc.alpha(tc.foreground, 0.2)}
                      tick={{ fill: tc.alpha(tc.foreground, 0.4), fontSize: 10 }}
                    />
                    <YAxis
                      stroke={tc.alpha(tc.foreground, 0.2)}
                      tick={{ fill: tc.alpha(tc.foreground, 0.4), fontSize: 10 }}
                      domain={[80, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        background: tc.alpha(tc.card, 0.95),
                        border: `1px solid ${tc.alpha(tc.border, 0.3)}`,
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                    />
                    <Line type="monotone" dataKey="completeness" stroke="#22c55e" strokeWidth={2} />
                    <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="consistency" stroke="#eab308" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </NeonCard>
          </div>
        )}

        {activeTab === "lineage" && (
          <NeonCard color={tc.warning}>
            <h3 className="text-[12px] text-white/60 mb-4 flex items-center gap-2">
              <GitBranch className="w-4 h-4" style={{ color: tc.warning }} />
              数据血缘关系
            </h3>
            <div className="space-y-4">
              {[
                {
                  table: "users",
                  upstream: ["user_raw", "user_profile"],
                  downstream: ["user_analytics", "user_report"],
                },
                {
                  table: "orders",
                  upstream: ["order_raw", "payment_info"],
                  downstream: ["sales_analytics", "revenue_report"],
                },
              ].map((lineage, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg"
                  style={{
                    background: tc.alpha(tc.muted, 0.05),
                    border: `1px solid ${tc.alpha(tc.border, 0.1)}`,
                  }}
                >
                  <div className="text-center mb-3">
                    <div
                      className="inline-block px-3 py-2 rounded-lg"
                      style={{
                        background: tc.alpha(tc.warning, 0.15),
                        border: `1px solid ${tc.alpha(tc.warning, 0.3)}`,
                      }}
                    >
                      <h4 className="text-[12px]" style={{ color: tc.warning }}>
                        {lineage.table}
                      </h4>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] text-white/30 mb-2">上游数据源</p>
                      <div className="space-y-1">
                        {lineage.upstream.map((source, sidx) => (
                          <div
                            key={sidx}
                            className="px-2 py-1 rounded text-[10px] text-white/50"
                            style={{
                              background: tc.alpha(tc.muted, 0.05),
                              border: `1px solid ${tc.alpha(tc.border, 0.05)}`,
                            }}
                          >
                            {source}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] text-white/30 mb-2">下游数据表</p>
                      <div className="space-y-1">
                        {lineage.downstream.map((target, tidx) => (
                          <div
                            key={tidx}
                            className="px-2 py-1 rounded text-[10px] text-white/50"
                            style={{
                              background: tc.alpha(tc.muted, 0.05),
                              border: `1px solid ${tc.alpha(tc.border, 0.05)}`,
                            }}
                          >
                            {target}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </NeonCard>
        )}

        {activeTab === "monitoring" && (
          <div className="space-y-4">
            {/* Real-time Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { metric: "吞吐量", value: "8.5K/s", status: "good", icon: Activity },
                { metric: "延迟", value: "45ms", status: "good", icon: Clock },
                { metric: "错误率", value: "0.02%", status: "good", icon: CheckCircle2 },
                { metric: "队列积压", value: "128", status: "warning", icon: AlertTriangle },
              ].map((item, idx) => (
                <NeonCard key={idx} color={item.status === "good" ? tc.success : tc.warning}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] text-white/30 mb-1">{item.metric}</p>
                      <p
                        className="text-lg"
                        style={{
                          color: item.status === "good" ? tc.success : tc.warning,
                          textShadow: `0 0 12px ${tc.alpha(
                            item.status === "good" ? tc.success : tc.warning,
                            0.3
                          )}`,
                        }}
                      >
                        {item.value}
                      </p>
                    </div>
                    <item.icon className="w-4 h-4" style={{ color: tc.alpha(item.status === "good" ? tc.success : tc.warning, 0.5) }} />
                  </div>
                </NeonCard>
              ))}
            </div>

            {/* Alert Rules */}
            <NeonCard color={tc.destructive}>
              <h3 className="text-[12px] text-white/60 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" style={{ color: tc.destructive }} />
                告警规则
              </h3>
              <div className="space-y-3">
                {[
                  { name: "同步延迟过高", condition: "> 1分钟", severity: "critical", enabled: true },
                  { name: "错误率异常", condition: "> 1%", severity: "warning", enabled: true },
                  { name: "数据质量下降", condition: "< 85分", severity: "warning", enabled: true },
                  { name: "吞吐量下降", condition: "< 1K/s", severity: "info", enabled: false },
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
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded-md text-[8px]"
                          style={{
                            background: tc.alpha(
                              rule.severity === "critical" ? tc.destructive : rule.severity === "warning" ? tc.warning : tc.accent,
                              0.1
                            ),
                            color: rule.severity === "critical" ? tc.destructive : rule.severity === "warning" ? tc.warning : tc.accent,
                            border: `1px solid ${tc.alpha(
                              rule.severity === "critical" ? tc.destructive : rule.severity === "warning" ? tc.warning : tc.accent,
                              0.2
                            )}`,
                          }}
                        >
                          {rule.severity === "critical" ? "严重" : rule.severity === "warning" ? "警告" : "信息"}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-md text-[8px]"
                          style={{
                            background: tc.alpha(rule.enabled ? tc.success : tc.muted, 0.1),
                            color: rule.enabled ? tc.success : tc.mutedForeground,
                            border: `1px solid ${tc.alpha(rule.enabled ? tc.success : tc.muted, 0.2)}`,
                          }}
                        >
                          {rule.enabled ? "已启用" : "已禁用"}
                        </span>
                      </div>
                    </div>
                    <p className="text-[9px] text-white/30">触发条件: {rule.condition}</p>
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
                  "连接池大小AI动态调整",
                  "同步性能AI优化",
                  "数据冲突AI智能解决",
                  "转换规则AI智能推荐",
                  "数据质量AI评分",
                  "血缘关系AI自动发现",
                  "异常检测AI算法",
                  "智能映射字段推荐",
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
