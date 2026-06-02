import {
  Activity, AlertCircle, CheckCircle2, Clock, Database,
  Globe, Link, MessageSquare, Pause, Play, RefreshCw,
  Settings, ShoppingCart, Users, Zap,
} from "lucide-react";
import { useState } from "react";

import { useThemeColors } from "./hooks/use-theme-colors";
import { NeonCard } from "./neon-card";

// ==========================================
// YYC³ 平台对接中心 - Platform Integration Center
// 多平台连接 · 数据同步 · API管理
// ==========================================

interface Platform {
  id: string;
  name: string;
  type: string;
  status: "connected" | "disconnected" | "error";
  icon: typeof Globe;
  lastSync: string;
  dataCount: number;
  color: string;
}

export function PlatformIntegrationPage() {
  const tc = useThemeColors();

  const platforms: Platform[] = [
    { id: "wechat", name: "微信公众号", type: "社交媒体", status: "connected", icon: MessageSquare, lastSync: "2分钟前", dataCount: 15420, color: tc.success },
    { id: "douyin", name: "抖音", type: "短视频", status: "connected", icon: Activity, lastSync: "5分钟前", dataCount: 28350, color: tc.primary },
    { id: "xiaohongshu", name: "小红书", type: "社交电商", status: "connected", icon: ShoppingCart, lastSync: "10分钟前", dataCount: 12890, color: tc.secondary },
    { id: "weibo", name: "微博", type: "社交媒体", status: "error", icon: Globe, lastSync: "1小时前", dataCount: 8740, color: tc.danger },
    { id: "baidu", name: "百度推广", type: "搜索广告", status: "connected", icon: Globe, lastSync: "3分钟前", dataCount: 21450, color: tc.accent },
    { id: "dingding", name: "钉钉", type: "企业协作", status: "disconnected", icon: Users, lastSync: "未连接", dataCount: 0, color: tc.textMuted },
  ];

  const stats = [
    { label: "已连接平台", value: platforms.filter(p => p.status === "connected").length.toString(), icon: CheckCircle2, color: tc.success },
    { label: "待连接", value: platforms.filter(p => p.status === "disconnected").length.toString(), icon: Clock, color: tc.textMuted },
    { label: "异常平台", value: platforms.filter(p => p.status === "error").length.toString(), icon: AlertCircle, color: tc.danger },
    { label: "同步数据量", value: `${(platforms.reduce((sum, p) => sum + p.dataCount, 0) / 1000).toFixed(1)}K`, icon: Database, color: tc.primary },
  ];

  const getStatusConfig = (status: Platform["status"]) => {
    switch (status) {
      case "connected":
        return { label: "已连接", color: tc.success, icon: CheckCircle2 };
      case "disconnected":
        return { label: "未连接", color: tc.textMuted, icon: Clock };
      case "error":
        return { label: "连接异常", color: tc.danger, icon: AlertCircle };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: tc.textPrimary }}>
            平台对接中心
          </h1>
          <p className="text-sm" style={{ color: tc.textSecondary }}>
            多平台连接 · 数据同步 · API管理
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium" style={{ background: tc.gradientButton, color: tc.textPrimary, boxShadow: tc.shadowMd }}>
          <Link className="w-5 h-5" />
          添加平台
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <NeonCard key={stat.label} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Icon className="w-8 h-8" style={{ color: stat.color }} />
              </div>
              <p className="text-sm mb-1" style={{ color: tc.textMuted }}>{stat.label}</p>
              <p className="text-2xl font-bold" style={{ color: tc.textPrimary }}>{stat.value}</p>
            </NeonCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const statusConfig = getStatusConfig(platform.status);
          const StatusIcon = statusConfig.icon;

          return (
            <NeonCard key={platform.id} className="p-6" style={{ borderColor: platform.status === "connected" ? tc.borderDefault : platform.status === "error" ? tc.danger : tc.borderSubtle }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: tc.alpha(platform.color, 0.15) }}>
                    <Icon className="w-6 h-6" style={{ color: platform.color }} />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: tc.textPrimary }}>{platform.name}</h3>
                    <p className="text-xs" style={{ color: tc.textMuted }}>{platform.type}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4" style={{ padding: '8px 12px', borderRadius: '8px', background: tc.alpha(statusConfig.color, 0.1) }}>
                <StatusIcon className="w-4 h-4" style={{ color: statusConfig.color }} />
                <span className="text-sm font-medium" style={{ color: statusConfig.color }}>{statusConfig.label}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs mb-1" style={{ color: tc.textMuted }}>最后同步</p>
                  <p className="text-sm font-medium" style={{ color: tc.textPrimary }}>{platform.lastSync}</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: tc.textMuted }}>数据量</p>
                  <p className="text-sm font-medium" style={{ color: tc.primary }}>{platform.dataCount.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium" style={{ background: tc.alpha(tc.primary, 0.1), color: tc.primary, border: `1px solid ${tc.borderSubtle}` }}>
                  <RefreshCw className="w-4 h-4" />
                  同步
                </button>
                <button className="px-3 py-2 rounded-lg" style={{ background: tc.bgCard, color: tc.textSecondary, border: `1px solid ${tc.borderSubtle}` }}>
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </NeonCard>
          );
        })}
      </div>
    </div>
  );
}
