import {
  Activity, AlertTriangle, ArrowUpRight, Award,
  BarChart3, Bot, Brain, CheckCircle2,
  Clock, Cpu, Database,
  Image, Languages, LayoutDashboard,
  Link, Megaphone, MessageSquare, PenTool, PlayCircle,
  Radio, Rocket, Server, Settings as SettingsIcon,
  Shield, Sparkles, TrendingUp, UserPlus,
  Wrench as WrenchIcon, Zap,
} from "lucide-react";

import { useThemeColors } from "./hooks/use-theme-colors";
import { NeonCard } from "./neon-card";

import type { LucideIcon } from "lucide-react";

// ==========================================
// YYC³ Module Placeholder Page
// Reusable template for modules under construction
// Supports Guidelines-02 feature descriptions
// ==========================================

export interface ModuleFeature {
  title: string;
  desc: string;
  icon?: LucideIcon;
  color?: string;
  status?: "ready" | "beta" | "planned";
}

export interface ModulePageConfig {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  category: string;
  features: ModuleFeature[];
  aiCapabilities?: string[];
  stats?: { label: string; value: string; trend?: string; trendUp?: boolean }[];
}

const STATUS_MAP = {
  ready: { label: "已就绪", color: "#22c55e", icon: CheckCircle2 },
  beta: { label: "测试中", color: "#eab308", icon: Activity },
  planned: { label: "规划中", color: "#3b82f6", icon: Clock },
};

export function ModulePlaceholderPage({ config }: { config: ModulePageConfig }) {
  const tc = useThemeColors();
  const Icon = config.icon;

  return (
    <div className="h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 z-10" style={{
        background: `linear-gradient(90deg, ${config.color}, ${tc.primary}, ${tc.secondary})`,
        opacity: 0.5,
      }} />

      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{
            background: tc.alpha(config.color, 0.1),
            border: `1px solid ${tc.alpha(config.color, 0.2)}`,
            boxShadow: `0 0 15px ${tc.alpha(config.color, 0.1)}`,
          }}>
            <Icon className="w-5 h-5" style={{ color: config.color }} />
          </div>
          <div>
            <h1 className="tracking-wider flex items-center gap-2" style={{
              color: tc.primary,
              textShadow: `0 0 15px ${tc.alpha(tc.primary, 0.4)}`,
            }}>
              {config.title}
            </h1>
            <p className="text-[10px] text-white/20 tracking-wider">{config.subtitle}</p>
          </div>
          <span className="ml-2 px-2 py-0.5 rounded-full text-[9px]" style={{
            background: tc.alpha(config.color, 0.08),
            color: config.color,
            border: `1px solid ${tc.alpha(config.color, 0.15)}`,
          }}>
            {config.category}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      {config.stats && config.stats.length > 0 && (
        <div className="px-6 pb-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {config.stats.map((stat, idx) => (
              <NeonCard key={idx} color={config.color}>
                <div style={{ animation: `spring-in 0.35s var(--spring-easing) ${idx * 0.05}s both` }}>
                  <p className="text-[10px] text-white/30 mb-1">{stat.label}</p>
                  <p className="text-xl mb-0.5" style={{
                    color: config.color,
                    textShadow: `0 0 12px ${tc.alpha(config.color, 0.3)}`,
                  }}>
                    {stat.value}
                  </p>
                  {stat.trend && (
                    <div className="flex items-center gap-1">
                      {stat.trendUp !== undefined && (
                        <ArrowUpRight className="w-2.5 h-2.5" style={{
                          color: stat.trendUp ? "#22c55e" : "#ef4444",
                          transform: stat.trendUp ? "none" : "rotate(90deg)",
                        }} />
                      )}
                      <span className="text-[9px]" style={{
                        color: stat.trendUp ? "#22c55e" : stat.trendUp === false ? "#ef4444" : "rgba(255,255,255,0.2)",
                      }}>
                        {stat.trend}
                      </span>
                    </div>
                  )}
                </div>
              </NeonCard>
            ))}
          </div>
        </div>
      )}

      {/* Feature Cards Grid */}
      <div className="px-6 pb-5">
        <h2 className="text-[12px] text-white/35 tracking-wider mb-3 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" style={{ color: tc.primary }} />
          功能模块
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {config.features.map((feature, idx) => {
            const FIcon = feature.icon || Sparkles;
            const fColor = feature.color || config.color;
            const statusInfo = feature.status ? STATUS_MAP[feature.status] : STATUS_MAP.planned;
            const StatusIcon = statusInfo.icon;
            return (
              <NeonCard key={idx} color={fColor}>
                <div style={{ animation: `spring-in 0.35s var(--spring-easing) ${idx * 0.04}s both` }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{
                        background: tc.alpha(fColor, 0.1),
                        border: `1px solid ${tc.alpha(fColor, 0.2)}`,
                      }}>
                        <FIcon className="w-3.5 h-3.5" style={{ color: fColor }} />
                      </div>
                      <h4 className="text-[12px] text-white/70">{feature.title}</h4>
                    </div>
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px]" style={{
                      background: tc.alpha(statusInfo.color, 0.08),
                      color: statusInfo.color,
                      border: `1px solid ${tc.alpha(statusInfo.color, 0.15)}`,
                    }}>
                      <StatusIcon className="w-2.5 h-2.5" />
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/20 leading-relaxed">{feature.desc}</p>
                </div>
              </NeonCard>
            );
          })}
        </div>
      </div>

      {/* AI Capabilities */}
      {config.aiCapabilities && config.aiCapabilities.length > 0 && (
        <div className="px-6 pb-8">
          <h2 className="text-[12px] text-white/35 tracking-wider mb-3 flex items-center gap-2">
            <Bot className="w-3.5 h-3.5" style={{ color: tc.accent }} />
            AI 智能特性
          </h2>
          <NeonCard color={tc.accent} hoverable={false}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              {config.aiCapabilities.map((cap, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 py-1.5"
                  style={{ animation: `spring-in 0.3s var(--spring-easing) ${idx * 0.03}s both` }}
                >
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{
                    background: tc.accent,
                    boxShadow: `0 0 4px ${tc.alpha(tc.accent, 0.5)}`,
                  }} />
                  <span className="text-[11px] text-white/35">{cap}</span>
                </div>
              ))}
            </div>
          </NeonCard>
        </div>
      )}
    </div>
  );
}

// ==========================================
// Pre-configured Module Pages
// ==========================================

export const MODULE_CONFIGS: Record<string, ModulePageConfig> = {
  // ========== 平台集成 ==========
  paramSettings: {
    id: "paramSettings",
    title: "参数设置",
    subtitle: "系统级参数配置管理 · AI智能推荐 · 配置验证与自动优化",
    icon: SettingsIcon,
    color: "#8b5cf6",
    category: "平台集成",
    stats: [
      { label: "配置项", value: "128", trend: "+3 本周", trendUp: true },
      { label: "安全评分", value: "96分", trend: "优秀", trendUp: true },
      { label: "配置版本", value: "v2.8", trend: "最新" },
      { label: "最近变更", value: "2h前", trend: "张运维" },
    ],
    features: [
      { title: "系统基础配置", desc: "系统名称、URL、管理员邮箱、国际化设置、智能时区检测", icon: SettingsIcon, color: "#8b5cf6", status: "ready" },
      { title: "平台连接参数", desc: "微信/钉钉/飞书/抖音/支付宝多平台API密钥管理与连接监控", icon: Link, color: "#3b82f6", status: "ready" },
      { title: "邮件服务配置", desc: "SMTP服务器、发件人设置、邮件模板管理、送达率分析", icon: MessageSquare, color: "#22c55e", status: "beta" },
      { title: "安全策略配置", desc: "密码策略、会话管理、2FA认证、IP白名单、异常检测", icon: Shield, color: "#ef4444", status: "ready" },
      { title: "配置版本管理", desc: "配置变更记录、版本对比、一键回滚、审批流程", icon: Clock, color: "#eab308", status: "beta" },
      { title: "AI智能优化", desc: "配置智能推荐、一键优化、安全漏洞扫描、合规检查", icon: Bot, color: "#06b6d4", status: "planned" },
    ],
    aiCapabilities: [
      "基于地理位置的时区自动推荐", "API密钥强度检测与安全评分",
      "连接配置智能验证与错误诊断", "SMTP服务器性能智能评估",
      "密码强度AI评估与改进建议", "异常登录行为AI检测与预警",
      "配置漂移自动检测", "预测性维护与问题预防",
    ],
  },
  platformSettings: {
    id: "platformSettings",
    title: "平台设置",
    subtitle: "平台级统一配置管理 · 微服务架构 · 云原生AIOps",
    icon: Server,
    color: "#3b82f6",
    category: "平台集成",
    stats: [
      { label: "平台健康度", value: "98%", trend: "+2%", trendUp: true },
      { label: "活跃接口", value: "256", trend: "稳定" },
      { label: "集成平台", value: "8个", trend: "+1 本月", trendUp: true },
      { label: "性能指数", value: "A+", trend: "优秀", trendUp: true },
    ],
    features: [
      { title: "平台基础配置", desc: "平台信息管理、参数配置、功能开关、健康检查", icon: Server, color: "#3b82f6", status: "ready" },
      { title: "接口设置", desc: "REST/GraphQL/WebSocket配置、密钥管理、限流配额", icon: Cpu, color: "#8b5cf6", status: "ready" },
      { title: "集成管理", desc: "第三方平台集成、数据同步、状态监控、测试验证", icon: Link, color: "#22c55e", status: "beta" },
      { title: "安全设置", desc: "加密策略、RBAC/ABAC、MFA认证、合规检查", icon: Shield, color: "#ef4444", status: "ready" },
      { title: "性能配置", desc: "缓存策略、负载均衡、CDN优化、数据库连接池", icon: Zap, color: "#eab308", status: "beta" },
      { title: "监控设置", desc: "系统/业务/行为指标、告警规则、仪表板可视化", icon: Activity, color: "#06b6d4", status: "planned" },
    ],
    aiCapabilities: [
      "平台健康度AI评估", "功能模块使用率AI分析",
      "API性能AI分析与瓶颈识别", "异常流量AI检测与防护",
      "缓存命中率AI优化", "负载均衡AI动态调度",
      "异常检测AI算法（基于历史基线）", "告警降噪AI模型",
    ],
  },
  wechatConfig: {
    id: "wechatConfig",
    title: "微信配置",
    subtitle: "微信公众号·小程序·企业微信全生态配置管理 · AI智能运营",
    icon: MessageSquare,
    color: "#22c55e",
    category: "平台集成",
    stats: [
      { label: "粉丝总数", value: "12.8万", trend: "+3.2% 本月", trendUp: true },
      { label: "消息响应率", value: "98.5%", trend: "优秀", trendUp: true },
      { label: "菜单点击率", value: "15.2%", trend: "+2.1%", trendUp: true },
      { label: "模板消息", value: "24个", trend: "活跃" },
    ],
    features: [
      { title: "公众号基础配置", desc: "AppID/Secret/Token配置、服务器验证、消息加解密", icon: SettingsIcon, color: "#22c55e", status: "ready" },
      { title: "菜单管理", desc: "自定义菜单编辑、类型配置、A/B测试、效果统计", icon: LayoutDashboard, color: "#3b82f6", status: "ready" },
      { title: "自动回复配置", desc: "关键词回复、多媒体回复、AI智能对话、意图识别", icon: Bot, color: "#8b5cf6", status: "beta" },
      { title: "消息推送", desc: "模板消息、精准推送、推送时间优化、A/B测试", icon: Megaphone, color: "#f97316", status: "ready" },
      { title: "用户管理", desc: "粉丝列表、标签分组、用户画像、流失预测", icon: UserPlus, color: "#ec4899", status: "beta" },
      { title: "微信支付", desc: "支付配置、订单管理、退款对账、风控反欺诈", icon: Award, color: "#eab308", status: "planned" },
    ],
    aiCapabilities: [
      "意图识别AI驱动智能回复", "用户画像AI构建与更新",
      "最佳推送时间AI预测", "菜单结构AI优化推荐",
      "用户流失AI识别与挽回", "支付异常AI检测与风控",
      "直播数据AI分析", "AI内容生成与剪辑",
    ],
  },
  channelCenter: {
    id: "channelCenter",
    title: "渠道中心",
    subtitle: "全渠道统一管理 · 微信/抖音/小红书/飞书/钉钉多渠道集成",
    icon: Radio,
    color: "#f97316",
    category: "平台集成",
    stats: [
      { label: "接入渠道", value: "6个", trend: "全部在线", trendUp: true },
      { label: "日活用户", value: "5.8万", trend: "+12%", trendUp: true },
      { label: "同步任务", value: "32个", trend: "运行中" },
      { label: "渠道ROI", value: "4.2x", trend: "+0.8", trendUp: true },
    ],
    features: [
      { title: "渠道配置管理", desc: "多渠道统一配置、认证授权、状态监控、快速部署", icon: SettingsIcon, color: "#f97316", status: "ready" },
      { title: "渠道数据同步", desc: "实时/定时/增量同步、冲突检测、一致性保障", icon: Activity, color: "#3b82f6", status: "beta" },
      { title: "渠道数据分析", desc: "跨渠道统一分析、转化归因、ROI评估、智能报表", icon: BarChart3, color: "#22c55e", status: "beta" },
      { title: "渠道运营管理", desc: "内容统一发布、活动管理、客服接入、销执行", icon: Megaphone, color: "#8b5cf6", status: "planned" },
      { title: "渠道监控告警", desc: "状态/性能指标监控、异常检测、故障自动诊断", icon: AlertTriangle, color: "#ef4444", status: "planned" },
    ],
    aiCapabilities: [
      "渠道配置智能验证与错误诊断", "数据冲突AI能解决",
      "渠道效果AI评估与排名", "转化归因AI模型",
      "内容发布时间AI优化", "渠道选择AI推荐",
      "异常检测AI算法", "故障预测AI预警",
    ],
  },
  dataIntegration: {
    id: "dataIntegration",
    title: "数据集成",
    subtitle: "企业级数据集成 · 实时CDC同步 · 数据质量保障 · 数据血缘",
    icon: Database,
    color: "#06b6d4",
    category: "平台集成",
    stats: [
      { label: "数据源", value: "15个", trend: "+2 本月", trendUp: true },
      { label: "同步任务", value: "48个", trend: "运行中" },
      { label: "数据质量", value: "94分", trend: "+3分", trendUp: true },
      { label: "日处理量", value: "2.1TB", trend: "稳定" },
    ],
    features: [
      { title: "数据源管理", desc: "MySQL/PG/Redis/MongoDB/API/Kafka等多数据源统一管理", icon: Database, color: "#06b6d4", status: "ready" },
      { title: "数据同步", desc: "实时CDC同步、定时批量、增量/全量、双向同步", icon: Activity, color: "#3b82f6", status: "beta" },
      { title: "数据转换", desc: "格式转换、类型映射、数据清洗、脱敏加密", icon: Cpu, color: "#8b5cf6", status: "beta" },
      { title: "数据质量", desc: "完整性/准确性/一致性/时效性/唯一性多维检查", icon: CheckCircle2, color: "#22c55e", status: "planned" },
      { title: "数据血缘", desc: "数据流向追踪、依赖管理、影响分析、血缘图谱", icon: TrendingUp, color: "#ec4899", status: "planned" },
      { title: "数据监控", desc: "任务监控、流实时监控、性能指标、异常检测告警", icon: AlertTriangle, color: "#ef4444", status: "planned" },
    ],
    aiCapabilities: [
      "连接池大小AI动态调整", "同步性能AI优化",
      "数据冲突AI智能解决", "转换规则AI智能推荐",
      "数据质量AI评分", "血缘关系AI自动发现",
      "异常检测AI算法", "智能映射字段推荐",
    ],
  },

  // ========== 智能营销 ==========
  marketingPlan: {
    id: "marketingPlan",
    title: "营销方案策划",
    subtitle: "AI驱动的智能营销策划 · 方案模板库 · 竞品分析 · ROI预测",
    icon: Megaphone,
    color: "#8b5cf6",
    category: "智能营销",
    stats: [
      { label: "活跃方案", value: "18", trend: "+3 本月", trendUp: true },
      { label: "AI生成方案", value: "42", trend: "本季度" },
      { label: "平均ROI", value: "3.8x", trend: "+0.6", trendUp: true },
      { label: "方案库模板", value: "156", trend: "持续更新" },
    ],
    features: [
      { title: "方案创建", desc: "支持手动创建和AI辅助生成营销方案", icon: PenTool, color: "#8b5cf6", status: "ready" },
      { title: "模板库", desc: "行业最佳实践方案模板，一键套用", icon: LayoutDashboard, color: "#3b82f6", status: "ready" },
      { title: "竞品分析", desc: "AI分析竞品营销策略，生成差异化建议", icon: TrendingUp, color: "#22c55e", status: "beta" },
      { title: "ROI预测", desc: "基于历史数据的投入产出AI预测模型", icon: BarChart3, color: "#f97316", status: "planned" },
    ],
    aiCapabilities: [
      "营销方案AI自动生成", "竞品策略AI分析与洞察",
      "目标人群AI精准定位", "投放渠道AI智能推荐",
      "方案效果AI预测", "预算分配AI优化",
    ],
  },
  promotionExec: {
    id: "promotionExec",
    title: "推广活动执行",
    subtitle: "全渠道活动执行引擎 · 自动化投放 · 实时监控 · 智能调优",
    icon: PlayCircle,
    color: "#22c55e",
    category: "智能营销",
    stats: [
      { label: "进行中活动", value: "7", trend: "活跃" },
      { label: "今日曝光", value: "85万", trend: "+23%", trendUp: true },
      { label: "转化率", value: "4.2%", trend: "+0.8%", trendUp: true },
      { label: "投放预算", value: "¥12万", trend: "本月" },
    ],
    features: [
      { title: "活动创建", desc: "多渠道活动创建、排期管理、素材配置", icon: PlayCircle, color: "#22c55e", status: "ready" },
      { title: "自动化投放", desc: "规则引擎驱动的自动化广告投放", icon: Zap, color: "#8b5cf6", status: "beta" },
      { title: "实时监控", desc: "活动效果实时大屏、异常告警", icon: Activity, color: "#3b82f6", status: "beta" },
      { title: "智能调优", desc: "AI实时调整投放策略和出价", icon: Bot, color: "#f97316", status: "planned" },
    ],
    aiCapabilities: [
      "投放时间AI优化", "出价策略AI调整",
      "受众定向AI扩展", "创意素材AI推荐",
      "预算分配AI动态调整", "活动效果AI实时预测",
    ],
  },
  marketingAnalytics: {
    id: "marketingAnalytics",
    title: "营销效果分析",
    subtitle: "全链路效果追踪 · 多维度归因分析 · AI洞察报告 · 智能报表",
    icon: BarChart3,
    color: "#3b82f6",
    category: "智能营销",
    stats: [
      { label: "追踪事件", value: "2.4亿", trend: "本月" },
      { label: "归因模型", value: "6种", trend: "已就绪", trendUp: true },
      { label: "报表数量", value: "48", trend: "自动生成" },
      { label: "洞察发现", value: "23条", trend: "本周", trendUp: true },
    ],
    features: [
      { title: "效果追踪", desc: "全链路用户行为追踪和转化统计", icon: TrendingUp, color: "#3b82f6", status: "ready" },
      { title: "归因分析", desc: "多触点归因模型：首次、末次、线性、时间衰减", icon: BarChart3, color: "#8b5cf6", status: "beta" },
      { title: "AI洞察", desc: "自动发现数据异常和增长机会", icon: Bot, color: "#22c55e", status: "planned" },
      { title: "智能报表", desc: "AI自动生成分析报表和管理层摘要", icon: LayoutDashboard, color: "#f97316", status: "planned" },
    ],
    aiCapabilities: [
      "数据异常AI自动发现", "转化漏斗AI优化建议",
      "用户行为AI聚类分析", "营销归因AI模型",
      "竞品效果AI对比分析", "智能报表AI自动生成",
    ],
  },
  marketingAssets: {
    id: "marketingAssets",
    title: "营销素材管理",
    subtitle: "创意素材中心 · AI智能生成 · 版权管理 · 素材效果分析",
    icon: Image,
    color: "#ec4899",
    category: "智能营销",
    stats: [
      { label: "素材总量", value: "3,280", trend: "+156 本月", trendUp: true },
      { label: "AI生成素材", value: "860", trend: "持续增长", trendUp: true },
      { label: "使用率", value: "72%", trend: "+5%", trendUp: true },
      { label: "存储空间", value: "128GB", trend: "已用48%" },
    ],
    features: [
      { title: "素材库", desc: "图片/视频/文案/音频多类型素材统一管理", icon: Image, color: "#ec4899", status: "ready" },
      { title: "AI创意生成", desc: "AI自动生成营销图片、视频和文案", icon: Sparkles, color: "#8b5cf6", status: "beta" },
      { title: "版权管理", desc: "素材版权追踪、使用授权、到期提醒", icon: Shield, color: "#ef4444", status: "planned" },
      { title: "效果分析", desc: "素材使用效果统计、AB测试、推荐排序", icon: BarChart3, color: "#3b82f6", status: "planned" },
    ],
    aiCapabilities: [
      "AI图片智能生成与编辑", "AI视频自动剪辑",
      "AI文案智能撰写", "素材效果AI预测",
      "素材标签AI自动归类", "相似素材AI推荐",
    ],
  },
  customerAcquisition: {
    id: "customerAcquisition",
    title: "客户获取系统",
    subtitle: "全渠道获客引擎 · 线索管理 · 智能评分 · 自动化培育",
    icon: UserPlus,
    color: "#22c55e",
    category: "智能营销",
    stats: [
      { label: "本月新线索", value: "2,180", trend: "+18%", trendUp: true },
      { label: "转化率", value: "12.5%", trend: "+2.3%", trendUp: true },
      { label: "获客成本", value: "¥45", trend: "-15%", trendUp: true },
      { label: "线索评分", value: "68分", trend: "平均分" },
    ],
    features: [
      { title: "线索收集", desc: "多渠道线索统一收集、去重、清洗", icon: UserPlus, color: "#22c55e", status: "ready" },
      { title: "智能评分", desc: "AI线索评分模型，识别高意向客户", icon: TrendingUp, color: "#8b5cf6", status: "beta" },
      { title: "自动培育", desc: "基于线索阶段的自动化邮件/短信培育流程", icon: Zap, color: "#3b82f6", status: "planned" },
      { title: "获客分析", desc: "渠道ROI分析、获客成��优化、漏斗分析", icon: BarChart3, color: "#f97316", status: "planned" },
    ],
    aiCapabilities: [
      "线索质量AI评分", "高意向客户AI识别",
      "最佳触达时间AI预测", "培育内容AI个性化推荐",
      "获客渠道AI优化", "客户生命周期AI预测",
    ],
  },
  brandMgmt: {
    id: "brandMgmt",
    title: "品牌管理平台",
    subtitle: "品牌资产管理 · 舆情监控 · 品牌健康度 · VI/CI一致性",
    icon: Award,
    color: "#eab308",
    category: "智能营销",
    stats: [
      { label: "品牌健康度", value: "92分", trend: "+3分", trendUp: true },
      { label: "舆情提及", value: "1.2万", trend: "本月" },
      { label: "正面率", value: "89%", trend: "+2%", trendUp: true },
      { label: "品牌资产", value: "256项", trend: "管理中" },
    ],
    features: [
      { title: "品牌资产库", desc: "Logo/字体/色彩/模板等品牌资产统一管理", icon: Award, color: "#eab308", status: "ready" },
      { title: "舆情监控", desc: "全网品牌舆情实时监控与预警", icon: Activity, color: "#ef4444", status: "beta" },
      { title: "品牌健康度", desc: "多维度品牌健康评估报告", icon: TrendingUp, color: "#22c55e", status: "planned" },
      { title: "VI一致性检查", desc: "AI检测品牌视觉元素使用一致性", icon: CheckCircle2, color: "#3b82f6", status: "planned" },
    ],
    aiCapabilities: [
      "舆情情感AI分析", "品牌提及AI实时追踪",
      "危机预警AI模型", "品牌健康度AI评估",
      "VI一致性AI检测", "竞品品牌AI对比分析",
    ],
  },
  intelligentOps: {
    id: "intelligentOps",
    title: "智能运维系统",
    subtitle: "AIOps智能运维 · 故障预测 · 自愈系统 · 容量规划",
    icon: WrenchIcon,
    color: "#ef4444",
    category: "智能营销",
    stats: [
      { label: "系统可用性", value: "99.97%", trend: "本月", trendUp: true },
      { label: "平均恢复", value: "2.1min", trend: "-30%", trendUp: true },
      { label: "告警数量", value: "12", trend: "本周" },
      { label: "自动修复率", value: "78%", trend: "+12%", trendUp: true },
    ],
    features: [
      { title: "系统监控", desc: "CPU/内存/磁盘/网络全方位实时监控", icon: Activity, color: "#ef4444", status: "ready" },
      { title: "故障预测", desc: "AI预测系统故障，提前预警和预防", icon: AlertTriangle, color: "#f97316", status: "beta" },
      { title: "自愈系统", desc: "常见故障自动检测、诊断和修复", icon: Zap, color: "#22c55e", status: "planned" },
      { title: "容量规划", desc: "AI预测资源需求，优化云资源成本", icon: TrendingUp, color: "#3b82f6", status: "planned" },
    ],
    aiCapabilities: [
      "故障预测AI预警", "根因分析AI定位",
      "自愈策略AI推荐", "容量AI动态规划",
      "告警降噪AI模型", "运维知识图谱AI构建",
    ],
  },
  platformHub: {
    id: "platformHub",
    title: "平台对接中心",
    subtitle: "第三方平台统一对接 · API网关 · 数据映射 · 连接监控",
    icon: Link,
    color: "#06b6d4",
    category: "智能营销",
    stats: [
      { label: "已对接平台", value: "12", trend: "+2 本月", trendUp: true },
      { label: "API调用", value: "158万", trend: "日均" },
      { label: "成功率", value: "99.8%", trend: "优秀", trendUp: true },
      { label: "响应时间", value: "45ms", trend: "P99" },
    ],
    features: [
      { title: "平台目录", desc: "可对接平台一览、文档、快速接入向导", icon: LayoutDashboard, color: "#06b6d4", status: "ready" },
      { title: "API网关", desc: "统一API网关、限流、熔断、缓存", icon: Server, color: "#8b5cf6", status: "beta" },
      { title: "数据映射", desc: "跨平台数据字段映射与转换规则", icon: Cpu, color: "#3b82f6", status: "planned" },
      { title: "连接监控", desc: "API调用监控、异常告警、性能分析", icon: Activity, color: "#ef4444", status: "planned" },
    ],
    aiCapabilities: [
      "API异常AI检测", "数据映射AI自动推荐",
      "平台兼容性AI评估", "连接故障AI自动修复",
      "流量模式AI分析", "API文档AI自动生成",
    ],
  },
  aiCreativeTools: {
    id: "aiCreativeTools",
    title: "智能创作工具",
    subtitle: "AI内容创作引擎 · 文案/图片/视频智能生成 · 多风格适配",
    icon: PenTool,
    color: "#8b5cf6",
    category: "智能营销",
    stats: [
      { label: "今日创作", value: "86", trend: "+42%", trendUp: true },
      { label: "创作类型", value: "12种", trend: "全覆盖" },
      { label: "满意度", value: "4.6/5", trend: "+0.3", trendUp: true },
      { label: "节省时间", value: "65%", trend: "平均", trendUp: true },
    ],
    features: [
      { title: "AI文案生成", desc: "营销文案、社交帖文、广告语AI智能撰写", icon: PenTool, color: "#8b5cf6", status: "ready" },
      { title: "AI图片生成", desc: "营销海报、商品图、社交配图AI创作", icon: Image, color: "#ec4899", status: "beta" },
      { title: "AI视频剪辑", desc: "短视频自动剪辑、字幕生成、配音合成", icon: PlayCircle, color: "#3b82f6", status: "planned" },
      { title: "多风格适配", desc: "根据品牌调性和渠道特性自动适配内容风格", icon: Sparkles, color: "#22c55e", status: "planned" },
    ],
    aiCapabilities: [
      "多风格文案AI生成", "营销图片AI智能生成",
      "视频脚本AI自动撰写", "内容质量AI评分",
      "品牌调性AI保持", "多语言内容AI翻译",
    ],
  },
  aiMarketingEngine: {
    id: "aiMarketingEngine",
    title: "智能营销引擎",
    subtitle: "营销自动化核心 · 智能推荐 · 个性化触达 · 全链路优化",
    icon: Rocket,
    color: "#f97316",
    category: "智能营销",
    stats: [
      { label: "自动化流程", value: "24", trend: "运行中" },
      { label: "个性化触达", value: "8.5万", trend: "日均", trendUp: true },
      { label: "转化提升", value: "+35%", trend: "vs手动", trendUp: true },
      { label: "引擎效率", value: "A+", trend: "评级", trendUp: true },
    ],
    features: [
      { title: "营销自动化", desc: "基于规则和AI的自动化营销工作流", icon: Zap, color: "#f97316", status: "ready" },
      { title: "智能推荐", desc: "基于用户画像的个性化产品和内容推荐", icon: Bot, color: "#8b5cf6", status: "beta" },
      { title: "触达优化", desc: "最佳道/时间/内容的智能触达策略", icon: TrendingUp, color: "#22c55e", status: "beta" },
      { title: "全链路优化", desc: "从曝光到成交全链路智能优化引擎", icon: Rocket, color: "#3b82f6", status: "planned" },
    ],
    aiCapabilities: [
      "用户行为AI预测", "个性化内容AI推荐",
      "最佳触达时间AI计算", "渠道组合AI优化",
      "营销效果AI实时优化", "用户生命周期AI管理",
    ],
  },
  appOverview: {
    id: "appOverview",
    title: "应用总览看板",
    subtitle: "全局运营数据一览 · 核心KPI大屏 · AI异常预警 · 趋势分析",
    icon: LayoutDashboard,
    color: "#00f0ff",
    category: "智能营销",
    stats: [
      { label: "日活用户", value: "12.8万", trend: "+8.5%", trendUp: true },
      { label: "今日营收", value: "¥48万", trend: "+15%", trendUp: true },
      { label: "系统健康", value: "99.9%", trend: "正常", trendUp: true },
      { label: "AI任务", value: "156", trend: "运行中" },
    ],
    features: [
      { title: "核心KPI大屏", desc: "营收/用户/转化/留存等核心指标实时展示", icon: BarChart3, color: "#00f0ff", status: "ready" },
      { title: "多维度分析", desc: "按渠道/产品/地域/时间多维度数据分析", icon: TrendingUp, color: "#8b5cf6", status: "ready" },
      { title: "AI异常预警", desc: "数据异常AI自动发现和预警通知", icon: AlertTriangle, color: "#ef4444", status: "beta" },
      { title: "趋势预测", desc: "基于AI的业务趋势预测和决策建议", icon: Bot, color: "#22c55e", status: "planned" },
    ],
    aiCapabilities: [
      "数据异常AI自动检测", "业务趋势AI预测",
      "KPI达成AI预警", "运营策略AI建议",
      "智能报表AI自动生成", "竞品数据AI分析",
    ],
  },
  aiDecisionSupport: {
    id: "aiDecisionSupport",
    title: "智能决策支持",
    subtitle: "AI辅助商业决策 · 多场景推演 · 风险评估 · 策略优化",
    icon: Brain,
    color: "#a855f7",
    category: "智能营销",
    stats: [
      { label: "决策模型", value: "8个", trend: "已部署" },
      { label: "推演场景", value: "156", trend: "本月", trendUp: true },
      { label: "准确率", value: "89%", trend: "+3%", trendUp: true },
      { label: "决策效率", value: "+60%", trend: "提升", trendUp: true },
    ],
    features: [
      { title: "决策模型库", desc: "预置营销/运营/产品等多领域决策模型", icon: Brain, color: "#a855f7", status: "ready" },
      { title: "场景推演", desc: "What-if多场景推演和结果预测", icon: TrendingUp, color: "#3b82f6", status: "beta" },
      { title: "风险评估", desc: "决策风险AI量化评估和规避建议", icon: Shield, color: "#ef4444", status: "planned" },
      { title: "策略优化", desc: "基于历史数据的策略持续优化迭代", icon: Zap, color: "#22c55e", status: "planned" },
    ],
    aiCapabilities: [
      "多维度决策AI分析", "场景推演AI预测",
      "风险因子AI识别", "策略效果AI评估",
      "决策建议AI生成", "历史决策AI复盘",
    ],
  },
  nlpProcessing: {
    id: "nlpProcessing",
    title: "自然语言处理",
    subtitle: "NLP核心引擎 · 语义理解 · 情感分析 · 意图识别 · 文本生成",
    icon: Languages,
    color: "#14b8a6",
    category: "智能营销",
    stats: [
      { label: "日处理量", value: "580万", trend: "条文本" },
      { label: "识别准确率", value: "96.5%", trend: "+1.2%", trendUp: true },
      { label: "支持语言", value: "12种", trend: "持续扩展" },
      { label: "模型版本", value: "v3.2", trend: "最新" },
    ],
    features: [
      { title: "语义理解", desc: "深度语义分析、实体识别、关系抽取", icon: Languages, color: "#14b8a6", status: "ready" },
      { title: "情感分析", desc: "文本/评论/舆情多粒度情感分析", icon: TrendingUp, color: "#ec4899", status: "ready" },
      { title: "意图识别", desc: "用户意图分类、多轮对话理解", icon: Bot, color: "#8b5cf6", status: "beta" },
      { title: "文本生成", desc: "多风格高质量文本自动生成", icon: PenTool, color: "#3b82f6", status: "beta" },
    ],
    aiCapabilities: [
      "多语言语义AI理解", "细粒度情感AI分析",
      "用户意图AI分类", "知识图谱AI构建",
      "文本摘要AI生成", "机器翻译AI引擎",
    ],
  },
};