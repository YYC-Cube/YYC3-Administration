import {
  Activity, AlertTriangle, BarChart3, CheckCircle2, Clock, Cpu,
  Database, HardDrive, RefreshCw, Server, Settings,
  TrendingUp, Wifi, Zap,
} from "lucide-react";
import { useState } from "react";

import { useThemeColors } from "./hooks/use-theme-colors";
import { NeonCard } from "./neon-card";

// ==========================================
// YYC³ 智能运维系统 - Smart Operations System
// 系统监控 · 性能优化 · 自动化运维
// ==========================================

export function SmartOperationsPage() {
  const tc = useThemeColors();

  const systemMetrics = [
    { label: "系统正常运行时间", value: "99.98%", icon: CheckCircle2, color: tc.success },
    { label: "CPU使用率", value: "42%", icon: Cpu, color: tc.primary },
    { label: "内存使用", value: "68%", icon: HardDrive, color: tc.secondary },
    { label: "网络流量", value: "2.4GB/s", icon: Wifi, color: tc.accent },
  ];

  const services = [
    { name: "API服务", status: "online", uptime: 99.99, requests: 125000 },
    { name: "数据库", status: "online", uptime: 99.95, requests: 89000 },
    { name: "缓存服务", status: "online", uptime: 99.98, requests: 210000 },
    { name: "消息队列", status: "warning", uptime: 98.50, requests: 45000 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: tc.textPrimary }}>
            智能运维系统
          </h1>
          <p className="text-sm" style={{ color: tc.textSecondary }}>
            系统监控 · 性能优化 · 自动化运维
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: tc.bgCard, color: tc.textSecondary, border: `1px solid ${tc.borderSubtle}` }}>
            <RefreshCw className="w-4 h-4" />
            刷新
          </button>
          <button className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium" style={{ background: tc.gradientButton, color: tc.textPrimary, boxShadow: tc.shadowMd }}>
            <Settings className="w-5 h-5" />
            配置
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {systemMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <NeonCard key={metric.label} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Icon className="w-8 h-8" style={{ color: metric.color }} />
              </div>
              <p className="text-sm mb-1" style={{ color: tc.textMuted }}>{metric.label}</p>
              <p className="text-2xl font-bold" style={{ color: tc.textPrimary }}>{metric.value}</p>
            </NeonCard>
          );
        })}
      </div>

      <NeonCard className="p-6">
        <h2 className="text-xl font-semibold mb-6" style={{ color: tc.textPrimary }}>服务状态监控</h2>
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.name} className="p-4 rounded-lg" style={{ background: tc.bgCard, border: `1px solid ${tc.borderSubtle}` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${service.status === 'online' ? 'animate-pulse' : ''}`} style={{ background: service.status === 'online' ? tc.success : tc.warning, boxShadow: service.status === 'online' ? `0 0 10px ${tc.success}` : `0 0 10px ${tc.warning}` }} />
                  <h3 className="font-semibold" style={{ color: tc.textPrimary }}>{service.name}</h3>
                </div>
                <span className="text-sm font-medium" style={{ color: service.status === 'online' ? tc.success : tc.warning }}>
                  {service.status === 'online' ? '正常运行' : '警告'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs mb-1" style={{ color: tc.textMuted }}>正常运行时间</p>
                  <p className="font-bold" style={{ color: tc.textPrimary }}>{service.uptime}%</p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: tc.textMuted }}>请求处理</p>
                  <p className="font-bold" style={{ color: tc.primary }}>{service.requests.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </NeonCard>
    </div>
  );
}
