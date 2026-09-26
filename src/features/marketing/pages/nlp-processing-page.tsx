import { Brain, Heart, MessageSquare, Sparkles, Tag, ThumbsDown, ThumbsUp } from 'lucide-react'
import { useState } from 'react'

import { useI18n } from '@/app/components/i18n-context'
import { NeonCard } from '@/app/components/neon-card'
import { useThemeColors } from '@/shared/hooks/use-theme-colors'

// ==========================================
// YYC³ 自然语言处理 - Natural Language Processing
// 情感分析 · 智能分类 · 关键词提取
// ==========================================

interface TextAnalysis {
  id: string
  text: string
  sentiment: 'positive' | 'neutral' | 'negative'
  score: number
  keywords: string[]
  category: string
  source: string
  timestamp: string
}

export function NLPProcessingPage() {
  const tc = useThemeColors()
  const { t } = useI18n()
  const [selectedSentiment, setSelectedSentiment] = useState<'all' | TextAnalysis['sentiment']>(
    'all',
  )

  const analyses: TextAnalysis[] = [
    {
      id: 'T001',
      text: 'nlp.review.t1',
      sentiment: 'positive',
      score: 96,
      keywords: ['nlp.kw.product', 'nlp.kw.easyToUse', 'nlp.kw.cs', 'nlp.kw.praise'],
      category: 'nlp.cat.productFeedback',
      source: 'nlp.src.wechat',
      timestamp: 'nlp.time.5min',
    },
    {
      id: 'T002',
      text: 'nlp.review.t2',
      sentiment: 'neutral',
      score: 62,
      keywords: ['nlp.kw.campaign', 'nlp.kw.logistics', 'nlp.kw.speed', 'nlp.kw.improve'],
      category: 'nlp.cat.serviceSuggestion',
      source: 'nlp.src.douyin',
      timestamp: 'nlp.time.12min',
    },
    {
      id: 'T003',
      text: 'nlp.review.t3',
      sentiment: 'negative',
      score: 15,
      keywords: ['nlp.kw.goods', 'nlp.kw.mismatch', 'nlp.kw.disappointed', 'nlp.kw.refund'],
      category: 'nlp.cat.complaint',
      source: 'nlp.src.xiaohongshu',
      timestamp: 'nlp.time.25min',
    },
    {
      id: 'T004',
      text: 'nlp.review.t4',
      sentiment: 'positive',
      score: 92,
      keywords: ['nlp.kw.brand', 'nlp.kw.concept', 'nlp.kw.quality', 'nlp.kw.support'],
      category: 'nlp.cat.brandAwareness',
      source: 'nlp.src.weibo',
      timestamp: 'nlp.time.1hour',
    },
  ]

  const filteredAnalyses = analyses.filter(
    (a) => selectedSentiment === 'all' || a.sentiment === selectedSentiment,
  )

  const stats = [
    {
      label: 'nlp.stat.processed',
      value: '128.5K',
      change: '+32.8%',
      icon: MessageSquare,
      color: tc.primary,
    },
    { label: 'nlp.stat.positive', value: '78.2%', change: '+5.3%', icon: Heart, color: tc.success },
    { label: 'nlp.stat.accuracy', value: '94.6%', change: '+2.1%', icon: Tag, color: tc.secondary },
    { label: 'nlp.stat.responseSpeed', value: '0.3s', change: '-18.5%', icon: Sparkles, color: tc.accent },
  ]

  const keywordCloud = [
    { word: 'nlp.kw.product', count: 1250, sentiment: 'positive' },
    { word: 'nlp.kw.service', count: 980, sentiment: 'positive' },
    { word: 'nlp.kw.quality', count: 850, sentiment: 'positive' },
    { word: 'nlp.kw.logistics', count: 620, sentiment: 'neutral' },
    { word: 'nlp.kw.cs', count: 580, sentiment: 'positive' },
    { word: 'nlp.kw.price', count: 450, sentiment: 'neutral' },
    { word: 'nlp.kw.experience', count: 420, sentiment: 'positive' },
    { word: 'nlp.kw.speed', count: 380, sentiment: 'neutral' },
  ]

  const categories = [
    { name: 'nlp.cat.productFeedback', count: 3580, positive: 82, neutral: 15, negative: 3 },
    { name: 'nlp.cat.serviceSuggestion', count: 2150, positive: 68, neutral: 28, negative: 4 },
    { name: 'nlp.cat.complaint', count: 890, positive: 12, neutral: 25, negative: 63 },
    { name: 'nlp.cat.brandAwareness', count: 1420, positive: 88, neutral: 10, negative: 2 },
  ]

  const getSentimentConfig = (sentiment: TextAnalysis['sentiment']) => {
    switch (sentiment) {
      case 'positive':
        return {
          label: t('nlp.sentiment.positive'),
          color: tc.success,
          icon: ThumbsUp,
          bgColor: tc.alpha(tc.success, 0.1),
        }
      case 'neutral':
        return {
          label: t('nlp.sentiment.neutral'),
          color: tc.textMuted,
          icon: MessageSquare,
          bgColor: tc.alpha(tc.textMuted, 0.1),
        }
      case 'negative':
        return {
          label: t('nlp.sentiment.negative'),
          color: tc.danger,
          icon: ThumbsDown,
          bgColor: tc.alpha(tc.danger, 0.1),
        }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: tc.textPrimary }}>
            {t('nav.nlpProcessing')}
          </h1>
          <p className="text-sm" style={{ color: tc.textSecondary }}>
            {t('nlp.subtitle')}
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-lg"
          style={{ background: tc.alpha(tc.primary, 0.1), border: `1px solid ${tc.primary}` }}
        >
          <Brain className="w-5 h-5 animate-pulse" style={{ color: tc.primary }} />
          <span className="text-sm font-medium" style={{ color: tc.primary }}>
            {t('nlp.liveAnalysis')}
          </span>
        </div>
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
                      (stat.change.startsWith('-') && stat.label === 'nlp.stat.responseSpeed')
                        ? tc.alpha(tc.success, 0.1)
                        : tc.alpha(tc.danger, 0.1),
                    color:
                      stat.change.startsWith('+') ||
                      (stat.change.startsWith('-') && stat.label === 'nlp.stat.responseSpeed')
                        ? tc.success
                        : tc.danger,
                  }}
                >
                  {stat.change}
                </div>
              </div>
              <p className="text-sm mb-1" style={{ color: tc.textMuted }}>
                {t(stat.label)}
              </p>
              <p className="text-2xl font-bold" style={{ color: tc.textPrimary }}>
                {stat.value}
              </p>
            </NeonCard>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <NeonCard className="p-6">
          <h2 className="text-xl font-semibold mb-6" style={{ color: tc.textPrimary }}>
            {t('nlp.hotKeywords')}
          </h2>
          <div className="flex flex-wrap gap-3">
            {keywordCloud.map((keyword) => {
              const size = Math.min(Math.max(keyword.count / 50, 14), 28)
              return (
                <div
                  key={keyword.word}
                  className="px-4 py-2 rounded-lg cursor-pointer transition-all hover:scale-110"
                  style={{
                    background: tc.alpha(
                      keyword.sentiment === 'positive' ? tc.success : tc.textMuted,
                      0.1,
                    ),
                    border: `1px solid ${tc.alpha(keyword.sentiment === 'positive' ? tc.success : tc.textMuted, 0.2)}`,
                    fontSize: `${size}px`,
                    color: keyword.sentiment === 'positive' ? tc.success : tc.textPrimary,
                    fontWeight: 600,
                  }}
                >
                  {t(keyword.word)}
                  <span className="ml-2 text-xs" style={{ color: tc.textMuted }}>
                    {keyword.count}
                  </span>
                </div>
              )
            })}
          </div>
        </NeonCard>

        <NeonCard className="p-6">
          <h2 className="text-xl font-semibold mb-6" style={{ color: tc.textPrimary }}>
            {t('nlp.categoryStats')}
          </h2>
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium" style={{ color: tc.textPrimary }}>
                    {t(category.name)}
                  </span>
                  <span className="text-sm" style={{ color: tc.textMuted }}>
                    {t('nlp.countUnit', { count: category.count })}
                  </span>
                </div>
                <div
                  className="flex h-3 rounded-full overflow-hidden"
                  style={{ background: tc.bgInput }}
                >
                  <div
                    className="flex-shrink-0"
                    style={{ width: `${category.positive}%`, background: tc.success }}
                  />
                  <div
                    className="flex-shrink-0"
                    style={{ width: `${category.neutral}%`, background: tc.textMuted }}
                  />
                  <div
                    className="flex-shrink-0"
                    style={{ width: `${category.negative}%`, background: tc.danger }}
                  />
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span style={{ color: tc.success }}>
                    {t('nlp.positivePct', { p: category.positive })}
                  </span>
                  <span style={{ color: tc.textMuted }}>
                    {t('nlp.neutralPct', { p: category.neutral })}
                  </span>
                  <span style={{ color: tc.danger }}>
                    {t('nlp.negativePct', { p: category.negative })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </NeonCard>
      </div>

      <div className="flex items-center gap-3">
        {(['all', 'positive', 'neutral', 'negative'] as const).map((sentiment) => (
          <button
            key={sentiment}
            onClick={() => setSelectedSentiment(sentiment)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: selectedSentiment === sentiment ? tc.alpha(tc.primary, 0.15) : tc.bgCard,
              color: selectedSentiment === sentiment ? tc.primary : tc.textSecondary,
              border: `1px solid ${selectedSentiment === sentiment ? tc.primary : tc.borderSubtle}`,
              boxShadow: selectedSentiment === sentiment ? tc.neonGlow(tc.primary, 0.3) : 'none',
            }}
          >
            {sentiment === 'all'
              ? t('nlp.all')
              : getSentimentConfig(sentiment as TextAnalysis['sentiment']).label}
          </button>
        ))}
      </div>

      <NeonCard className="p-6">
        <h2 className="text-xl font-semibold mb-6" style={{ color: tc.textPrimary }}>
          {t('nlp.analysisResults')}
        </h2>
        <div className="space-y-4">
          {filteredAnalyses.map((analysis) => {
            const sentimentConfig = getSentimentConfig(analysis.sentiment)
            const SentimentIcon = sentimentConfig.icon

            return (
              <div
                key={analysis.id}
                className="p-5 rounded-lg transition-all"
                style={{
                  background: tc.bgCard,
                  border: `1px solid ${tc.borderSubtle}`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: sentimentConfig.bgColor }}
                    >
                      <SentimentIcon className="w-5 h-5" style={{ color: sentimentConfig.color }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold" style={{ color: tc.textPrimary }}>
                          {t(analysis.category)}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{ background: tc.bgInput, color: tc.textSecondary }}
                        >
                          {t(analysis.source)}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: tc.textMuted }}>
                        {t(analysis.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{ background: sentimentConfig.bgColor, color: sentimentConfig.color }}
                    >
                      {sentimentConfig.label}
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-sm font-bold"
                      style={{ background: tc.alpha(tc.primary, 0.15), color: tc.primary }}
                    >
                      {t('nlp.scoreUnit', { score: analysis.score })}
                    </div>
                  </div>
                </div>

                <p className="mb-4 text-sm" style={{ color: tc.textPrimary }}>
                  {t(analysis.text)}
                </p>

                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: tc.alpha(tc.primary, 0.1),
                        color: tc.primary,
                        border: `1px solid ${tc.alpha(tc.primary, 0.2)}`,
                      }}
                    >
                      #{t(keyword)}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </NeonCard>
    </div>
  )
}
