import {
  Activity, ArrowDown, ArrowUp, BarChart3, Brain,
  Calendar, DollarSign, Download, Filter, PieChart, ShoppingCart,
  Sparkles, Target, TrendingUp, Users,
} from "lucide-react";
import { useState } from "react";

import { useThemeColors } from "./hooks/use-theme-colors";
import { NeonCard } from "./neon-card";

// ==========================================
// YYC³ 营销效果分析 - Marketing Analytics
// 实时数据追踪 · AI智能分析 · 可视化报表
// ==========================================

interface MetricData {
  label: string;
  value: number;
  change: number;
  trend: "up" | "down";
  icon: typeof TrendingUp;
  color: string;
}

export function MarketingAnalyticsPage() {
  const tc = useThemeColors();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  const metrics: MetricData[] = [
    {
      label: "总投资回报率",
      value: 3.8,
      change: 12.5,
      trend: "up",
      icon: TrendingUp,
      color: tc.success,
    },
    {
      label: "转化率",
      value: 4.2,
      change: 0.8,
      trend: "up",
      icon: Target,
      color: tc.primary,
    },
    {
      label: "获客成本",
      value: 128,
      change: -8.3,
      trend: "down",
      icon: DollarSign,
      color: tc.secondary,
    },
    {
      label: "客户生命周期价值",
      value: 1580,
      change: 15.2,
      trend: "up",
      icon: Users,
      color: tc.accent,
    },
  ];

  const channelPerformance = [
    { channel: "抖音", roi: 4.2, cost: 45000, revenue: 189000, conversion: 5.8 },
    { channel: "微信", roi: 3.8, cost: 38000, revenue: 144400, conversion: 4.2 },
    { channel: "小红书", roi: 3.5, cost: 28000, revenue: 98000, conversion: 3.9 },
    { channel: "百度", roi: 2.9, cost: 35000, revenue: 101500, conversion: 3.1 },
  ];

  const campaignAnalytics = [
    {
      name: "618预热活动",
      impressions: 1250000,
      clicks: 52000,
      conversions: 2100,
      revenue: 315000,
      roi: 4.5,
    },
    {
      name: "新品上市推广",
      impressions: 850000,
      clicks: 34000,
      conversions: 1420,
      revenue: 213000,
      roi: 3.8,
    },
    {
      name: "会员专属优惠",
      impressions: 420000,
      clicks: 18500,
      conversions: 890,
      revenue: 142000,
      roi: 5.2,
    },
  ];

  const aiInsights = [
    {
      title: "最佳投放时段",
      content: "晚上20:00-22:00转化率最高，建议增加该时段预算配比30%",
      impact: "预计提升ROI 15%",
    },
    {
      title: "受众优化建议",
      content: "25-34岁女性用户转化率高出平均值42%，建议精准定向",
      impact: "预计降低获客成本 18%",
    },
    {
      title: "渠道组合优化",
      content: "抖音+小红书组合投放效果提升35%，建议增加联动策略",
      impact: "预计提升整体转化率 12%",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: tc.textPrimary }}>
            营销效果分析
          </h1>
          <p className="text-sm" style={{ color: tc.textSecondary }}>
            实时数据追踪 · AI智能分析 · 可视化报表
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {(["7d", "30d", "90d"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: timeRange === range ? tc.alpha(tc.primary, 0.15) : tc.bgCard,
                  color: timeRange === range ? tc.primary : tc.textSecondary,
                  border: `1px solid ${timeRange === range ? tc.primary : tc.borderSubtle}`,
                  boxShadow: timeRange === range ? tc.neonGlow(tc.primary, 0.3) : "none",
                }}
              >
                {range === "7d" ? "近7天" : range === "30d" ? "近30天" : "近90天"}
              </button>
            ))}
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tc.gradientButton,
              color: tc.textPrimary,
              boxShadow: tc.shadowMd,
            }}
          >
            <Download className="w-4 h-4" />
            导出报表
          </button>
        </div>
      </div>

      {/* 核心指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const TrendIcon = metric.trend === "up" ? ArrowUp : ArrowDown;

          return (
            <NeonCard key={metric.label} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Icon className="w-8 h-8" style={{ color: metric.color }} />
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                  style={{
                    background: tc.alpha(
                      metric.trend === "up" ? tc.success : tc.danger,
                      0.1
                    ),
                    color: metric.trend === "up" ? tc.success : tc.danger,
                  }}
                >
                  <TrendIcon className="w-3 h-3" />
                  {Math.abs(metric.change)}%
                </div>
              </div>
              <p className="text-sm mb-1" style={{ color: tc.textMuted }}>
                {metric.label}
              </p>
              <p className="text-3xl font-bold" style={{ color: tc.textPrimary }}>
                {metric.label.includes("率") ? `${metric.value}%` : metric.label.includes("成本") ? `¥${metric.value}` : metric.value}
              </p>
            </NeonCard>
          );
        })}
      </div>

      {/* AI智能洞察 */}
      <NeonCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-6 h-6" style={{ color: tc.primary }} />
          <h2 className="text-xl font-semibold" style={{ color: tc.textPrimary }}>
            AI智能洞察
          </h2>
          <div
            className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
            style={{
              background: tc.alpha(tc.primary, 0.1),
              color: tc.primary,
            }}
          >
            <Sparkles className="w-4 h-4" />
            实时分析
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiInsights.map((insight, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg transition-all"
              style={{
                background: tc.bgCard,
                border: `1px solid ${tc.borderSubtle}`,
              }}
            >
              <h3 className="font-semibold mb-2" style={{ color: tc.textPrimary }}>
                {insight.title}
              </h3>
              <p className="text-sm mb-3" style={{ color: tc.textSecondary }}>
                {insight.content}
              </p>
              <div
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: tc.success }}
              >
                <TrendingUp className="w-4 h-4" />
                {insight.impact}
              </div>
            </div>
          ))}
        </div>
      </NeonCard>

      {/* 渠道表现分析 */}
      <NeonCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold" style={{ color: tc.textPrimary }}>
            渠道表现分析
          </h2>
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tc.bgCard,
              color: tc.textSecondary,
              border: `1px solid ${tc.borderSubtle}`,
            }}
          >
            <Filter className="w-4 h-4" />
            筛选
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${tc.borderSubtle}` }}>
                <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: tc.textMuted }}>
                  渠道
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium" style={{ color: tc.textMuted }}>
                  投入成本
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium" style={{ color: tc.textMuted }}>
                  营收
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium" style={{ color: tc.textMuted }}>
                  ROI
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium" style={{ color: tc.textMuted }}>
                  转化率
                </th>
              </tr>
            </thead>
            <tbody>
              {channelPerformance.map((channel, idx) => (
                <tr
                  key={channel.channel}
                  style={{
                    borderBottom: idx < channelPerformance.length - 1 ? `1px solid ${tc.borderSubtle}` : "none",
                  }}
                >
                  <td className="py-4 px-4">
                    <span className="font-medium" style={{ color: tc.textPrimary }}>
                      {channel.channel}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right" style={{ color: tc.textSecondary }}>
                    ¥{channel.cost.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right font-medium" style={{ color: tc.success }}>
                    ¥{channel.revenue.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold"
                      style={{
                        background: tc.alpha(tc.primary, 0.15),
                        color: tc.primary,
                      }}
                    >
                      {channel.roi}x
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-medium" style={{ color: tc.textPrimary }}>
                    {channel.conversion}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </NeonCard>

      {/* 活动效果详情 */}
      <NeonCard className="p-6">
        <h2 className="text-xl font-semibold mb-6" style={{ color: tc.textPrimary }}>
          活动效果详情
        </h2>
        <div className="space-y-4">
          {campaignAnalytics.map((campaign) => {
            const ctr = ((campaign.clicks / campaign.impressions) * 100).toFixed(2);
            const conversionRate = ((campaign.conversions / campaign.clicks) * 100).toFixed(2);

            return (
              <div
                key={campaign.name}
                className="p-4 rounded-lg transition-all"
                style={{
                  background: tc.bgCard,
                  border: `1px solid ${tc.borderSubtle}`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold" style={{ color: tc.textPrimary }}>
                    {campaign.name}
                  </h3>
                  <div
                    className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold"
                    style={{
                      background: tc.alpha(tc.primary, 0.15),
                      color: tc.primary,
                      boxShadow: tc.neonGlow(tc.primary, 0.3),
                    }}
                  >
                    <BarChart3 className="w-4 h-4" />
                    ROI {campaign.roi}x
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs mb-1" style={{ color: tc.textMuted }}>
                      曝光量
                    </p>
                    <p className="font-bold" style={{ color: tc.textPrimary }}>
                      {(campaign.impressions / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: tc.textMuted }}>
                      点击量
                    </p>
                    <p className="font-bold" style={{ color: tc.textPrimary }}>
                      {(campaign.clicks / 1000).toFixed(1)}K
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: tc.textMuted }}>
                      点击率
                    </p>
                    <p className="font-bold" style={{ color: tc.secondary }}>
                      {ctr}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: tc.textMuted }}>
                      转化数
                    </p>
                    <p className="font-bold" style={{ color: tc.success }}>
                      {campaign.conversions}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: tc.textMuted }}>
                      转化率
                    </p>
                    <p className="font-bold" style={{ color: tc.accent }}>
                      {conversionRate}%
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </NeonCard>
    </div>
  );
}
