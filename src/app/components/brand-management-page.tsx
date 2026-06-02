import {
  AlertCircle,
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  Eye,
  Globe,
  Heart,
  MessageSquare,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useState } from 'react'

import { useThemeColors } from './hooks/use-theme-colors'
import { NeonCard } from './neon-card'

// ==========================================
// YYC³ 品牌管理平台 - Brand Management Platform
// 品牌监测 · 口碑分析 · 声誉管理
// ==========================================

export function BrandManagementPage() {
  const tc = useThemeColors()

  const brandMetrics = [
    {
      label: '品牌提及',
      value: '127.5K',
      change: '+18.2%',
      icon: MessageSquare,
      color: tc.primary,
    },
    { label: '情感积极度', value: '86.5%', change: '+5.3%', icon: Heart, color: tc.success },
    { label: '品牌关注度', value: '2.4M', change: '+12.8%', icon: Eye, color: tc.secondary },
    { label: '品牌美誉度', value: '92.3', change: '+3.1%', icon: Star, color: tc.accent },
  ]

  const sentimentData = [
    { category: '产品质量', positive: 88, neutral: 10, negative: 2 },
    { category: '客户服务', positive: 82, neutral: 15, negative: 3 },
    { category: '品牌形象', positive: 92, neutral: 6, negative: 2 },
    { category: '性价比', positive: 75, neutral: 20, negative: 5 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: tc.textPrimary }}>
            品牌管理平台
          </h1>
          <p className="text-sm" style={{ color: tc.textSecondary }}>
            品牌监测 · 口碑分析 · 声誉管理
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium"
          style={{ background: tc.gradientButton, color: tc.textPrimary, boxShadow: tc.shadowMd }}
        >
          <Shield className="w-5 h-5" />
          生成报告
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {brandMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <NeonCard key={metric.label} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Icon className="w-8 h-8" style={{ color: metric.color }} />
                <div
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{ background: tc.alpha(tc.success, 0.1), color: tc.success }}
                >
                  {metric.change}
                </div>
              </div>
              <p className="text-sm mb-1" style={{ color: tc.textMuted }}>
                {metric.label}
              </p>
              <p className="text-2xl font-bold" style={{ color: tc.textPrimary }}>
                {metric.value}
              </p>
            </NeonCard>
          )
        })}
      </div>

      <NeonCard className="p-6">
        <h2 className="text-xl font-semibold mb-6" style={{ color: tc.textPrimary }}>
          情感分析概览
        </h2>
        <div className="space-y-4">
          {sentimentData.map((item) => (
            <div key={item.category}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium" style={{ color: tc.textPrimary }}>
                  {item.category}
                </span>
                <span className="text-sm" style={{ color: tc.textMuted }}>
                  积极度 {item.positive}%
                </span>
              </div>
              <div
                className="flex h-3 rounded-full overflow-hidden"
                style={{ background: tc.bgInput }}
              >
                <div
                  className="flex-shrink-0"
                  style={{ width: `${item.positive}%`, background: tc.success }}
                />
                <div
                  className="flex-shrink-0"
                  style={{ width: `${item.neutral}%`, background: tc.textMuted }}
                />
                <div
                  className="flex-shrink-0"
                  style={{ width: `${item.negative}%`, background: tc.danger }}
                />
              </div>
            </div>
          ))}
        </div>
      </NeonCard>
    </div>
  )
}
