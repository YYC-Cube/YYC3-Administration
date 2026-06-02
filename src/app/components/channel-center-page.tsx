import {
  Activity, AlertTriangle, BarChart3, CheckCircle2, Clock, DollarSign,
  Megaphone, Radio, Settings, TrendingUp, Users,
} from "lucide-react";
import { useState } from "react";
import {
  Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip,
  XAxis, YAxis,
} from "recharts";

import { useThemeColors } from "./hooks/use-theme-colors";
import { NeonCard } from "./neon-card";


// ==========================================
// YYC³ 渠道中心页面 - Channel Center
// 全渠道统一管理 · 多渠道集成 · 数据分析
// ==========================================

type ChannelTab = "overview" | "config" | "sync" | "analytics" | "operations";

interface Channel {
  id: string;
  name: string;
  type: string;
  status: "connected" | "disconnected" | "warning";
  users: number;
  orders: number;
  revenue: number;
  roi: number;
}

export function ChannelCenterPage() {
  const tc = useThemeColors();
  const [activeTab, setActiveTab] = useState<ChannelTab>("overview");

  const channels: Channel[] = [
    { id: "wechat", name: "微信公众号", type: "WeChat", status: "connected", users: 28500, orders: 1240, revenue: 156000, roi: 4.2 },
    { id: "douyin", name: "抖音", type: "Douyin", status: "connected", users: 15200, orders: 680, revenue: 89000, roi: 3.8 },
    { id: "xiaohongshu", name: "小红书", type: "XHS", status: "connected", users: 12800, orders: 520, revenue: 68000, roi: 3.5 },
    { id: "feishu", name: "飞书", type: "Feishu", status: "warning", users: 8600, orders: 280, revenue: 38000, roi: 2.9 },
    { id: "dingtalk", name: "钉钉", type: "DingTalk", status: "connected", users: 6400, orders: 210, revenue: 29000, roi: 2.6 },
    { id: "alipay", name: "支付宝生活号", type: "Alipay", status: "disconnected", users: 0, orders: 0, revenue: 0, roi: 0 },
  ];

  const channelGrowthData = Array.from({ length: 7 }, (_, i) => ({
    day: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"][i],
    wechat: 1200 + Math.random() * 300,
    douyin: 800 + Math.random() * 200,
    xiaohongshu: 600 + Math.random() * 150,
  }));

  const tabs = [
    { id: "overview" as const, label: "概览", icon: Radio },
    { id: "config" as const, label: "渠道配置", icon: Settings },
    { id: "sync" as const, label: "数据同步", icon: Activity },
    { id: "analytics" as const, label: "数据分析", icon: BarChart3 },
    { id: "operations" as const, label: "运营管理", icon: Megaphone },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return tc.success;
      case "warning":
        return tc.warning;
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
      case "warning":
        return "异常";
      case "disconnected":
        return "未连接";
      default:
        return "未知";
    }
  };

  return (
    <div className="h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-1 z-10"
        style={{
          background: `linear-gradient(90deg, #f97316, ${tc.primary}, ${tc.secondary})`,
          opacity: 0.5,
        }}
      />

      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{
              background: tc.alpha("#f97316", 0.1),
              border: `1px solid ${tc.alpha("#f97316", 0.2)}`,
              boxShadow: `0 0 15px ${tc.alpha("#f97316", 0.1)}`,
            }}
          >
            <Radio className="w-5 h-5" style={{ color: "#f97316" }} />
          </div>
          <div>
            <h1
              className="tracking-wider"
              style={{
                color: tc.primary,
                textShadow: `0 0 15px ${tc.alpha(tc.primary, 0.4)}`,
              }}
            >
              渠道中心
            </h1>
            <p className="text-[10px] text-white/20 tracking-wider">
              全渠道统一管理 · 微信/抖音/小红书/飞书/钉钉多渠道集成
            </p>
          </div>
          <span
            className="ml-2 px-2 py-0.5 rounded-full text-[9px]"
            style={{
              background: tc.alpha("#f97316", 0.08),
              color: "#f97316",
              border: `1px solid ${tc.alpha("#f97316", 0.15)}`,
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
            { label: "接入渠道", value: "6个", trend: "全部在线", trendUp: true, color: "#f97316" },
            { label: "日活用户", value: "5.8万", trend: "+12%", trendUp: true, color: "#22c55e" },
            { label: "同步任务", value: "32个", trend: "运行中", color: "#3b82f6" },
            { label: "渠道ROI", value: "4.2x", trend: "+0.8", trendUp: true, color: "#8b5cf6" },
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
                  background: isActive ? tc.alpha("#f97316", 0.15) : tc.alpha(tc.card, 0.5),
                  border: `1px solid ${isActive ? tc.alpha("#f97316", 0.3) : tc.alpha(tc.border, 0.1)}`,
                  color: isActive ? "#f97316" : tc.mutedForeground,
                  boxShadow: isActive ? `0 0 15px ${tc.alpha("#f97316", 0.2)}` : "none",
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
            {/* Channel Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {channels.map((channel, idx) => (
                <NeonCard key={idx} color={getStatusColor(channel.status)}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            background: getStatusColor(channel.status),
                            boxShadow: `0 0 8px ${tc.alpha(getStatusColor(channel.status), 0.6)}`,
                          }}
                        />
                        <h4 className="text-[12px] text-white/70">{channel.name}</h4>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded-md text-[8px]"
                        style={{
                          background: tc.alpha(getStatusColor(channel.status), 0.1),
                          color: getStatusColor(channel.status),
                          border: `1px solid ${tc.alpha(getStatusColor(channel.status), 0.2)}`,
                        }}
                      >
                        {getStatusText(channel.status)}
                      </span>
                    </div>

                    {channel.status !== "disconnected" && (
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <p className="text-white/30">用户数</p>
                          <p className="text-white/60">{channel.users.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-white/30">订单数</p>
                          <p className="text-white/60">{channel.orders.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-white/30">营收</p>
                          <p className="text-white/60">¥{(channel.revenue / 1000).toFixed(1)}K</p>
                        </div>
                        <div>
                          <p className="text-white/30">ROI</p>
                          <p className="text-white/60">{channel.roi}x</p>
                        </div>
                      </div>
                    )}

                    {channel.status === "disconnected" && (
                      <button
                        className="w-full px-3 py-2 rounded-lg text-[10px] transition-all"
                        style={{
                          background: tc.alpha(tc.primary, 0.1),
                          border: `1px solid ${tc.alpha(tc.primary, 0.2)}`,
                          color: tc.primary,
                        }}
                      >
                        立即配置
                      </button>
                    )}
                  </div>
                </NeonCard>
              ))}
            </div>

            {/* Growth Trend */}
            <NeonCard color={tc.accent}>
              <h3 className="text-[12px] text-white/60 mb-3">渠道用户增长趋势</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={channelGrowthData}>
                    <XAxis
                      dataKey="day"
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
                    <Line type="monotone" dataKey="wechat" stroke="#22c55e" strokeWidth={2} />
                    <Line type="monotone" dataKey="douyin" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="xiaohongshu" stroke="#ec4899" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </NeonCard>
          </div>
        )}

        {activeTab === "config" && (
          <div className="space-y-4">
            {channels.map((channel, idx) => (
              <NeonCard key={idx} color={tc.primary}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: tc.alpha(tc.primary, 0.1),
                        border: `1px solid ${tc.alpha(tc.primary, 0.2)}`,
                      }}
                    >
                      <Radio className="w-5 h-5" style={{ color: tc.primary }} />
                    </div>
                    <div>
                      <h4 className="text-[12px] text-white/70">{channel.name}</h4>
                      <p className="text-[10px] text-white/30">{channel.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="px-2 py-1 rounded-md text-[9px] flex items-center gap-1"
                      style={{
                        background: tc.alpha(getStatusColor(channel.status), 0.1),
                        color: getStatusColor(channel.status),
                        border: `1px solid ${tc.alpha(getStatusColor(channel.status), 0.2)}`,
                      }}
                    >
                      {channel.status === "connected" && <CheckCircle2 className="w-2.5 h-2.5" />}
                      {channel.status === "warning" && <AlertTriangle className="w-2.5 h-2.5" />}
                      {getStatusText(channel.status)}
                    </span>
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
                      测试连接
                    </button>
                  </div>
                </div>
              </NeonCard>
            ))}
          </div>
        )}

        {activeTab === "sync" && (
          <div className="space-y-4">
            <NeonCard color={tc.secondary}>
              <h3 className="text-[12px] text-white/60 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" style={{ color: tc.secondary }} />
                数据同步任务
              </h3>
              <div className="space-y-3">
                {[
                  { source: "微信公众号", target: "主数据库", type: "实时同步", status: "running", lastSync: "1分钟前" },
                  { source: "抖音", target: "主数据库", type: "定时同步", status: "running", lastSync: "5分钟前" },
                  { source: "小红书", target: "主数据库", type: "增量同步", status: "running", lastSync: "8分钟前" },
                  { source: "飞书", target: "主数据库", type: "定时同步", status: "warning", lastSync: "2小时前" },
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
                        <h4 className="text-[11px] text-white/60">
                          {task.source} → {task.target}
                        </h4>
                        <p className="text-[9px] text-white/30">{task.type}</p>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded-md text-[8px] flex items-center gap-1"
                        style={{
                          background: tc.alpha(task.status === "running" ? tc.success : tc.warning, 0.1),
                          color: task.status === "running" ? tc.success : tc.warning,
                          border: `1px solid ${tc.alpha(
                            task.status === "running" ? tc.success : tc.warning,
                            0.2
                          )}`,
                        }}
                      >
                        {task.status === "running" ? <Activity className="w-2.5 h-2.5 animate-spin" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                        {task.status === "running" ? "运行中" : "异常"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] text-white/40">
                      <Clock className="w-3 h-3" />
                      <span>最近同步: {task.lastSync}</span>
                    </div>
                  </div>
                ))}
              </div>
            </NeonCard>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-4">
            {/* ROI Comparison */}
            <NeonCard color={tc.accent}>
              <h3 className="text-[12px] text-white/60 mb-3">渠道ROI对比</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={channels.filter(c => c.status !== "disconnected")}>
                    <XAxis
                      dataKey="name"
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
                    <Bar dataKey="roi" fill={tc.accent} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </NeonCard>

            {/* Revenue Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { metric: "总营收", value: "¥380K", trend: "+15%", icon: DollarSign },
                { metric: "平均订单价值", value: "¥139", trend: "+8%", icon: TrendingUp },
                { metric: "转化率", value: "4.8%", trend: "+1.2%", icon: Users },
              ].map((item, idx) => (
                <NeonCard key={idx} color={tc.success}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] text-white/30 mb-1">{item.metric}</p>
                      <p
                        className="text-xl mb-1"
                        style={{
                          color: tc.success,
                          textShadow: `0 0 12px ${tc.alpha(tc.success, 0.3)}`,
                        }}
                      >
                        {item.value}
                      </p>
                      <p className="text-[9px]" style={{ color: tc.success }}>
                        {item.trend}
                      </p>
                    </div>
                    <item.icon className="w-5 h-5" style={{ color: tc.alpha(tc.success, 0.5) }} />
                  </div>
                </NeonCard>
              ))}
            </div>
          </div>
        )}

        {activeTab === "operations" && (
          <NeonCard color={tc.warning}>
            <h3 className="text-[12px] text-white/60 mb-4 flex items-center gap-2">
              <Megaphone className="w-4 h-4" style={{ color: tc.warning }} />
              跨渠道营销活动
            </h3>
            <div className="space-y-3">
              {[
                { name: "春季促销活动", channels: ["微信", "抖音", "小红书"], status: "active", reach: "18.5万" },
                { name: "新品发布会", channels: ["全渠道"], status: "scheduled", reach: "预计25万" },
                { name: "会员日活动", channels: ["微信", "支付宝"], status: "ended", reach: "12.3万" },
              ].map((campaign, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg"
                  style={{
                    background: tc.alpha(tc.muted, 0.05),
                    border: `1px solid ${tc.alpha(tc.border, 0.1)}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[11px] text-white/60">{campaign.name}</h4>
                    <span
                      className="px-2 py-0.5 rounded-md text-[8px]"
                      style={{
                        background: tc.alpha(
                          campaign.status === "active" ? tc.success : campaign.status === "scheduled" ? tc.warning : tc.muted,
                          0.1
                        ),
                        color: campaign.status === "active" ? tc.success : campaign.status === "scheduled" ? tc.warning : tc.mutedForeground,
                        border: `1px solid ${tc.alpha(
                          campaign.status === "active" ? tc.success : campaign.status === "scheduled" ? tc.warning : tc.muted,
                          0.2
                        )}`,
                      }}
                    >
                      {campaign.status === "active" ? "进行中" : campaign.status === "scheduled" ? "已排期" : "已结束"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-white/40">
                    <span>渠道: {campaign.channels.join(", ")}</span>
                    <span>触达: {campaign.reach}</span>
                  </div>
                </div>
              ))}
            </div>
          </NeonCard>
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
                  "渠道配置智能验证与错误诊断",
                  "数据冲突AI智能解决",
                  "渠道效果AI评估与排名",
                  "转化归因AI模型",
                  "内容发布时间AI优化",
                  "渠道选择AI推荐",
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
