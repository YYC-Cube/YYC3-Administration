import {
  Brain,
  CheckCircle2,
  Clock,
  FileText,
  Image,
  Music,
  Sparkles,
  Star,
  TrendingUp,
  Video,
  Wand2,
  Zap,
} from 'lucide-react'
import { useState } from 'react'

import { useThemeColors } from './hooks/use-theme-colors'
import { useI18n } from './i18n-context'
import { NeonCard } from './neon-card'

// ==========================================
// YYC³ 智能创作工具 - Smart Creation Tools
// AI文案生成 · 图片设计 · 视频制作
// ==========================================

interface CreationTemplate {
  id: string
  name: string
  type: 'text' | 'image' | 'video' | 'audio'
  description: string
  icon: typeof FileText
  usage: number
  rating: number
}

export function SmartCreationPage() {
  const tc = useThemeColors()
  const { t } = useI18n()
  const [selectedType, setSelectedType] = useState<'all' | CreationTemplate['type']>('all')

  const templates: CreationTemplate[] = [
    {
      id: 'T001',
      name: '产品文案生成',
      type: 'text',
      description: 'AI生成吸引人的产品描述文案',
      icon: FileText,
      usage: 1250,
      rating: 4.8,
    },
    {
      id: 'T002',
      name: '社交媒体图文',
      type: 'image',
      description: '快速生成社交媒体配图和文案',
      icon: Image,
      usage: 980,
      rating: 4.7,
    },
    {
      id: 'T003',
      name: '短视频脚本',
      type: 'video',
      description: 'AI生成短视频拍摄脚本和分镜',
      icon: Video,
      usage: 750,
      rating: 4.9,
    },
    {
      id: 'T004',
      name: '品牌BGM制作',
      type: 'audio',
      description: 'AI生成符合品牌调性的背景音乐',
      icon: Music,
      usage: 420,
      rating: 4.6,
    },
    {
      id: 'T005',
      name: '广告标语生成',
      type: 'text',
      description: '创意广告语和Slogan生成',
      icon: Sparkles,
      usage: 1580,
      rating: 4.9,
    },
    {
      id: 'T006',
      name: '海报设计',
      type: 'image',
      description: 'AI辅助海报设计和排版',
      icon: Image,
      usage: 890,
      rating: 4.7,
    },
  ]

  const filteredTemplates = templates.filter(
    (t) => selectedType === 'all' || t.type === selectedType,
  )

  const stats = [
    { label: '创作总量', value: '12.5K', change: '+28.3%', icon: Wand2, color: tc.primary },
    { label: '用户满意度', value: '96.8%', change: '+4.2%', icon: Star, color: tc.success },
    { label: 'AI生成速度', value: '2.3s', change: '-15.8%', icon: Zap, color: tc.secondary },
    { label: '采纳率', value: '89.2%', change: '+6.5%', icon: TrendingUp, color: tc.accent },
  ]

  const recentCreations = [
    { id: 'C001', title: '618大促海报', type: 'image', status: 'completed', time: '5分钟前' },
    {
      id: 'C002',
      title: '产品介绍视频脚本',
      type: 'video',
      status: 'processing',
      time: '10分钟前',
    },
    { id: 'C003', title: '品牌故事文案', type: 'text', status: 'completed', time: '15分钟前' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: tc.textPrimary }}>
            {t('nav.aiCreativeTools')}
          </h1>
          <p className="text-sm" style={{ color: tc.textSecondary }}>
            AI文案生成 · 图片设计 · 视频制作
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium"
          style={{ background: tc.gradientButton, color: tc.textPrimary, boxShadow: tc.shadowMd }}
        >
          <Wand2 className="w-5 h-5" />
          开始创作
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <NeonCard key={stat.label} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Icon className="w-8 h-8" style={{ color: stat.color }} />
                <div
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{
                    background:
                      stat.change.startsWith('+') ||
                      (stat.change.startsWith('-') && parseFloat(stat.change) < 0)
                        ? tc.alpha(tc.success, 0.1)
                        : tc.alpha(tc.danger, 0.1),
                    color:
                      stat.change.startsWith('+') ||
                      (stat.change.startsWith('-') && parseFloat(stat.change) < 0)
                        ? tc.success
                        : tc.danger,
                  }}
                >
                  {stat.change}
                </div>
              </div>
              <p className="text-sm mb-1" style={{ color: tc.textMuted }}>
                {stat.label}
              </p>
              <p className="text-2xl font-bold" style={{ color: tc.textPrimary }}>
                {stat.value}
              </p>
            </NeonCard>
          )
        })}
      </div>

      <NeonCard className="p-6">
        <h2 className="text-xl font-semibold mb-6" style={{ color: tc.textPrimary }}>
          最近创作
        </h2>
        <div className="space-y-3">
          {recentCreations.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-lg"
              style={{ background: tc.bgCard, border: `1px solid ${tc.borderSubtle}` }}
            >
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5" style={{ color: tc.primary }} />
                <div>
                  <h3 className="font-medium" style={{ color: tc.textPrimary }}>
                    {item.title}
                  </h3>
                  <p className="text-xs" style={{ color: tc.textMuted }}>
                    {item.type} · {item.time}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.status === 'completed' ? (
                  <div
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                    style={{ background: tc.alpha(tc.success, 0.1), color: tc.success }}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    已完成
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                    style={{ background: tc.alpha(tc.primary, 0.1), color: tc.primary }}
                  >
                    <Clock className="w-3 h-3 animate-spin" />
                    生成中
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </NeonCard>

      <div className="flex items-center gap-3">
        {(['all', 'text', 'image', 'video', 'audio'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: selectedType === type ? tc.alpha(tc.primary, 0.15) : tc.bgCard,
              color: selectedType === type ? tc.primary : tc.textSecondary,
              border: `1px solid ${selectedType === type ? tc.primary : tc.borderSubtle}`,
              boxShadow: selectedType === type ? tc.neonGlow(tc.primary, 0.3) : 'none',
            }}
          >
            {type === 'all'
              ? '全部'
              : type === 'text'
                ? '文案'
                : type === 'image'
                  ? '图片'
                  : type === 'video'
                    ? '视频'
                    : '音频'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => {
          const Icon = template.icon
          return (
            <NeonCard key={template.id} className="p-6 cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ background: tc.alpha(tc.primary, 0.15) }}
                >
                  <Icon className="w-6 h-6" style={{ color: tc.primary }} />
                </div>
                <div
                  className="flex items-center gap-1 text-sm font-medium"
                  style={{ color: tc.warning }}
                >
                  <Star className="w-4 h-4 fill-current" />
                  {template.rating}
                </div>
              </div>

              <h3 className="text-lg font-bold mb-2" style={{ color: tc.textPrimary }}>
                {template.name}
              </h3>
              <p className="text-sm mb-4 line-clamp-2" style={{ color: tc.textSecondary }}>
                {template.description}
              </p>

              <div
                className="flex items-center justify-between mb-4 pb-4"
                style={{ borderBottom: `1px solid ${tc.borderSubtle}` }}
              >
                <span className="text-xs" style={{ color: tc.textMuted }}>
                  使用 {template.usage} 次
                </span>
              </div>

              <button
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all opacity-0 group-hover:opacity-100"
                style={{
                  background: tc.alpha(tc.primary, 0.1),
                  color: tc.primary,
                  border: `1px solid ${tc.borderSubtle}`,
                }}
              >
                <Wand2 className="w-4 h-4" />
                立即使用
              </button>
            </NeonCard>
          )
        })}
      </div>
    </div>
  )
}
