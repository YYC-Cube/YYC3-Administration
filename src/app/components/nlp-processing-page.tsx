import {
  AlertTriangle, BarChart3, Brain, CheckCircle2, Eye,
  Filter, Heart, MessageSquare, Search,
  Sparkles, Tag, ThumbsDown, ThumbsUp, TrendingUp, Users,
} from "lucide-react";
import { useState } from "react";

import { useThemeColors } from "./hooks/use-theme-colors";
import { NeonCard } from "./neon-card";

// ==========================================
// YYC³ 自然语言处理 - Natural Language Processing
// 情感分析 · 智能分类 · 关键词提取
// ==========================================

interface TextAnalysis {
  id: string;
  text: string;
  sentiment: "positive" | "neutral" | "negative";
  score: number;
  keywords: string[];
  category: string;
  source: string;
  timestamp: string;
}

export function NLPProcessingPage() {
  const tc = useThemeColors();
  const [selectedSentiment, setSelectedSentiment] = useState<"all" | TextAnalysis["sentiment"]>("all");

  const analyses: TextAnalysis[] = [
    {
      id: "T001",
      text: "这个产品真的太好用了！客服态度也特别好，五星好评！",
      sentiment: "positive",
      score: 96,
      keywords: ["产品", "好用", "客服", "好评"],
      category: "产品反馈",
      source: "微信评论",
      timestamp: "5分钟前",
    },
    {
      id: "T002",
      text: "活动力度还可以，但物流速度有待提升，希望能改进。",
      sentiment: "neutral",
      score: 62,
      keywords: ["活动", "物流", "速度", "改进"],
      category: "服务建议",
      source: "抖音评论",
      timestamp: "12分钟前",
    },
    {
      id: "T003",
      text: "收到的商品和描述不符，非常失望，要求退货！",
      sentiment: "negative",
      score: 15,
      keywords: ["商品", "描述不符", "失望", "退货"],
      category: "投诉建议",
      source: "小红书评论",
      timestamp: "25分钟前",
    },
    {
      id: "T004",
      text: "品牌理念很赞，产品质量优秀，会继续支持！",
      sentiment: "positive",
      score: 92,
      keywords: ["品牌", "理念", "质量", "支持"],
      category: "品牌认知",
      source: "微博评论",
      timestamp: "1小时前",
    },
  ];

  const filteredAnalyses = analyses.filter(a => selectedSentiment === "all" || a.sentiment === selectedSentiment);

  const stats = [
    { label: "已处理文本", value: "128.5K", change: "+32.8%", icon: MessageSquare, color: tc.primary },
    { label: "积极情感", value: "78.2%", change: "+5.3%", icon: Heart, color: tc.success },
    { label: "分类准确率", value: "94.6%", change: "+2.1%", icon: Tag, color: tc.secondary },
    { label: "响应速度", value: "0.3s", change: "-18.5%", icon: Sparkles, color: tc.accent },
  ];

  const keywordCloud = [
    { word: "产品", count: 1250, sentiment: "positive" },
    { word: "服务", count: 980, sentiment: "positive" },
    { word: "质量", count: 850, sentiment: "positive" },
    { word: "物流", count: 620, sentiment: "neutral" },
    { word: "客服", count: 580, sentiment: "positive" },
    { word: "价格", count: 450, sentiment: "neutral" },
    { word: "体验", count: 420, sentiment: "positive" },
    { word: "速度", count: 380, sentiment: "neutral" },
  ];

  const categories = [
    { name: "产品反馈", count: 3580, positive: 82, neutral: 15, negative: 3 },
    { name: "服务建议", count: 2150, positive: 68, neutral: 28, negative: 4 },
    { name: "投诉建议", count: 890, positive: 12, neutral: 25, negative: 63 },
    { name: "品牌认知", count: 1420, positive: 88, neutral: 10, negative: 2 },
  ];

  const getSentimentConfig = (sentiment: TextAnalysis["sentiment"]) => {
    switch (sentiment) {
      case "positive":
        return { label: "积极", color: tc.success, icon: ThumbsUp, bgColor: tc.alpha(tc.success, 0.1) };
      case "neutral":
        return { label: "中性", color: tc.textMuted, icon: MessageSquare, bgColor: tc.alpha(tc.textMuted, 0.1) };
      case "negative":
        return { label: "消极", color: tc.danger, icon: ThumbsDown, bgColor: tc.alpha(tc.danger, 0.1) };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: tc.textPrimary }}>
            自然语言处理
          </h1>
          <p className="text-sm" style={{ color: tc.textSecondary }}>
            情感分析 · 智能分类 · 关键词提取
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: tc.alpha(tc.primary, 0.1), border: `1px solid ${tc.primary}` }}>
          <Brain className="w-5 h-5 animate-pulse" style={{ color: tc.primary }} />
          <span className="text-sm font-medium" style={{ color: tc.primary }}>实时分析中</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <NeonCard key={stat.label} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Icon className="w-8 h-8" style={{ color: stat.color }} />
                <div className="px-2 py-1 rounded text-xs font-medium" style={{ background: stat.change.startsWith("+") || (stat.change.startsWith("-") && stat.label === "响应速度") ? tc.alpha(tc.success, 0.1) : tc.alpha(tc.danger, 0.1), color: stat.change.startsWith("+") || (stat.change.startsWith("-") && stat.label === "响应速度") ? tc.success : tc.danger }}>
                  {stat.change}
                </div>
              </div>
              <p className="text-sm mb-1" style={{ color: tc.textMuted }}>{stat.label}</p>
              <p className="text-2xl font-bold" style={{ color: tc.textPrimary }}>{stat.value}</p>
            </NeonCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <NeonCard className="p-6">
          <h2 className="text-xl font-semibold mb-6" style={{ color: tc.textPrimary }}>热门关键词</h2>
          <div className="flex flex-wrap gap-3">
            {keywordCloud.map((keyword) => {
              const size = Math.min(Math.max(keyword.count / 50, 14), 28);
              return (
                <div
                  key={keyword.word}
                  className="px-4 py-2 rounded-lg cursor-pointer transition-all hover:scale-110"
                  style={{
                    background: tc.alpha(keyword.sentiment === "positive" ? tc.success : tc.textMuted, 0.1),
                    border: `1px solid ${tc.alpha(keyword.sentiment === "positive" ? tc.success : tc.textMuted, 0.2)}`,
                    fontSize: `${size}px`,
                    color: keyword.sentiment === "positive" ? tc.success : tc.textPrimary,
                    fontWeight: 600,
                  }}
                >
                  {keyword.word}
                  <span className="ml-2 text-xs" style={{ color: tc.textMuted }}>
                    {keyword.count}
                  </span>
                </div>
              );
            })}
          </div>
        </NeonCard>

        <NeonCard className="p-6">
          <h2 className="text-xl font-semibold mb-6" style={{ color: tc.textPrimary }}>文本分类统计</h2>
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium" style={{ color: tc.textPrimary }}>{category.name}</span>
                  <span className="text-sm" style={{ color: tc.textMuted }}>{category.count} 条</span>
                </div>
                <div className="flex h-3 rounded-full overflow-hidden" style={{ background: tc.bgInput }}>
                  <div className="flex-shrink-0" style={{ width: `${category.positive}%`, background: tc.success }} />
                  <div className="flex-shrink-0" style={{ width: `${category.neutral}%`, background: tc.textMuted }} />
                  <div className="flex-shrink-0" style={{ width: `${category.negative}%`, background: tc.danger }} />
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span style={{ color: tc.success }}>积极 {category.positive}%</span>
                  <span style={{ color: tc.textMuted }}>中性 {category.neutral}%</span>
                  <span style={{ color: tc.danger }}>消极 {category.negative}%</span>
                </div>
              </div>
            ))}
          </div>
        </NeonCard>
      </div>

      <div className="flex items-center gap-3">
        {(["all", "positive", "neutral", "negative"] as const).map((sentiment) => (
          <button
            key={sentiment}
            onClick={() => setSelectedSentiment(sentiment)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: selectedSentiment === sentiment ? tc.alpha(tc.primary, 0.15) : tc.bgCard,
              color: selectedSentiment === sentiment ? tc.primary : tc.textSecondary,
              border: `1px solid ${selectedSentiment === sentiment ? tc.primary : tc.borderSubtle}`,
              boxShadow: selectedSentiment === sentiment ? tc.neonGlow(tc.primary, 0.3) : "none",
            }}
          >
            {sentiment === "all" ? "全部" : getSentimentConfig(sentiment as TextAnalysis["sentiment"]).label}
          </button>
        ))}
      </div>

      <NeonCard className="p-6">
        <h2 className="text-xl font-semibold mb-6" style={{ color: tc.textPrimary }}>文本分析结果</h2>
        <div className="space-y-4">
          {filteredAnalyses.map((analysis) => {
            const sentimentConfig = getSentimentConfig(analysis.sentiment);
            const SentimentIcon = sentimentConfig.icon;

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
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: sentimentConfig.bgColor }}>
                      <SentimentIcon className="w-5 h-5" style={{ color: sentimentConfig.color }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold" style={{ color: tc.textPrimary }}>{analysis.category}</span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: tc.bgInput, color: tc.textSecondary }}>
                          {analysis.source}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: tc.textMuted }}>{analysis.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: sentimentConfig.bgColor, color: sentimentConfig.color }}>
                      {sentimentConfig.label}
                    </div>
                    <div className="px-3 py-1 rounded-full text-sm font-bold" style={{ background: tc.alpha(tc.primary, 0.15), color: tc.primary }}>
                      {analysis.score}分
                    </div>
                  </div>
                </div>

                <p className="mb-4 text-sm" style={{ color: tc.textPrimary }}>{analysis.text}</p>

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
                      #{keyword}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </NeonCard>
    </div>
  );
}
