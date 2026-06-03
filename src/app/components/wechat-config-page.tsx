import {
  Bot,
  Check,
  Copy,
  Eye,
  EyeOff,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Settings,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useThemeColors } from './hooks/use-theme-colors'
import { NeonCard } from './neon-card'

// ==========================================
// YYC³ 微信配置页面 - WeChat Configuration
// 微信公众号·小程序·企业微信全生态配置管理
// ==========================================

type ConfigTab = 'basic' | 'menu' | 'reply' | 'message' | 'users' | 'stats'

export function WechatConfigPage() {
  const tc = useThemeColors()
  const [activeTab, setActiveTab] = useState<ConfigTab>('basic')
  const [showSecret, setShowSecret] = useState(false)
  const [copied, setCopied] = useState(false)

  // Read from environment — never hardcode secrets in source
  const wechatAppId = import.meta.env.VITE_WECHAT_APP_ID || '—'
  const wechatAppSecret = import.meta.env.VITE_WECHAT_APP_SECRET || '—'
  const wechatToken = import.meta.env.VITE_WECHAT_TOKEN || '—'
  const wechatEncodingAesKey = import.meta.env.VITE_WECHAT_ENCODING_AES_KEY || '—'

  const fanGrowthData = Array.from({ length: 7 }, (_, i) => ({
    day: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i],
    newFans: Math.floor(Math.random() * 500) + 100,
    lostFans: Math.floor(Math.random() * 100),
  }))

  const menuClickData = [
    { name: '产品介绍', value: 3200, color: '#22c55e' },
    { name: '客户服务', value: 2800, color: '#3b82f6' },
    { name: '在线咨询', value: 2100, color: '#8b5cf6' },
    { name: '最新活动', value: 1800, color: '#f97316' },
  ]

  const tabs = [
    { id: 'basic' as const, label: '基础配置', icon: Settings },
    { id: 'menu' as const, label: '菜单管理', icon: LayoutDashboard },
    { id: 'reply' as const, label: '自动回复', icon: Bot },
    { id: 'message' as const, label: '消息推送', icon: Megaphone },
    { id: 'users' as const, label: '用户管理', icon: UserPlus },
    { id: 'stats' as const, label: '数据统计', icon: TrendingUp },
  ]

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-1 z-10"
        style={{
          background: `linear-gradient(90deg, #22c55e, ${tc.primary}, ${tc.secondary})`,
          opacity: 0.5,
        }}
      />

      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{
              background: tc.alpha('#22c55e', 0.1),
              border: `1px solid ${tc.alpha('#22c55e', 0.2)}`,
              boxShadow: `0 0 15px ${tc.alpha('#22c55e', 0.1)}`,
            }}
          >
            <MessageSquare className="w-5 h-5" style={{ color: '#22c55e' }} />
          </div>
          <div>
            <h1
              className="tracking-wider"
              style={{
                color: tc.primary,
                textShadow: `0 0 15px ${tc.alpha(tc.primary, 0.4)}`,
              }}
            >
              微信配置
            </h1>
            <p className="text-[10px] text-white/20 tracking-wider">
              微信公众号·小程序·企业微信全生态配置管理 · AI智能运营
            </p>
          </div>
          <span
            className="ml-2 px-2 py-0.5 rounded-full text-[9px]"
            style={{
              background: tc.alpha('#22c55e', 0.08),
              color: '#22c55e',
              border: `1px solid ${tc.alpha('#22c55e', 0.15)}`,
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
            {
              label: '粉丝总数',
              value: '12.8万',
              trend: '+3.2% 本月',
              trendUp: true,
              color: '#22c55e',
            },
            { label: '消息响应率', value: '98.5%', trend: '优秀', trendUp: true, color: '#3b82f6' },
            {
              label: '菜单点击率',
              value: '15.2%',
              trend: '+2.1%',
              trendUp: true,
              color: '#8b5cf6',
            },
            { label: '模板消息', value: '24个', trend: '活跃', color: '#f97316' },
          ].map((stat, idx) => (
            <NeonCard key={idx} color={stat.color}>
              <div
                style={{ animation: `spring-in 0.35s var(--spring-easing) ${idx * 0.05}s both` }}
              >
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
                  <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
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
        <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1.5 whitespace-nowrap transition-all"
                style={{
                  background: isActive ? tc.alpha('#22c55e', 0.15) : tc.alpha(tc.card, 0.5),
                  border: `1px solid ${isActive ? tc.alpha('#22c55e', 0.3) : tc.alpha(tc.border, 0.1)}`,
                  color: isActive ? '#22c55e' : tc.mutedForeground,
                  boxShadow: isActive ? `0 0 15px ${tc.alpha('#22c55e', 0.2)}` : 'none',
                }}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-8">
        {activeTab === 'basic' && (
          <NeonCard color={tc.primary}>
            <h3 className="text-[12px] text-white/60 mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4" style={{ color: tc.primary }} />
              公众号基础配置
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-white/40 mb-1.5">AppID</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={wechatAppId}
                      readOnly
                      className="w-full px-3 py-2 pr-10 rounded-lg text-[12px]"
                      style={{
                        background: tc.alpha(tc.input, 0.5),
                        border: `1px solid ${tc.alpha(tc.border, 0.2)}`,
                        color: tc.foreground,
                      }}
                    />
                    <button
                      onClick={() => handleCopy(wechatAppId)}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      style={{ color: tc.mutedForeground }}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-white/40 mb-1.5">AppSecret</label>
                  <div className="relative">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={wechatAppSecret}
                      readOnly
                      className="w-full px-3 py-2 pr-10 rounded-lg text-[12px]"
                      style={{
                        background: tc.alpha(tc.input, 0.5),
                        border: `1px solid ${tc.alpha(tc.border, 0.2)}`,
                        color: tc.foreground,
                      }}
                    />
                    <button
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      style={{ color: tc.mutedForeground }}
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-white/40 mb-1.5">Token</label>
                  <input
                    type="text"
                    value={wechatToken}
                    className="w-full px-3 py-2 rounded-lg text-[12px]"
                    style={{
                      background: tc.alpha(tc.input, 0.5),
                      border: `1px solid ${tc.alpha(tc.border, 0.2)}`,
                      color: tc.foreground,
                    }}
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-white/40 mb-1.5">EncodingAESKey</label>
                  <input
                    type="text"
                    value={wechatEncodingAesKey}
                    className="w-full px-3 py-2 rounded-lg text-[12px]"
                    style={{
                      background: tc.alpha(tc.input, 0.5),
                      border: `1px solid ${tc.alpha(tc.border, 0.2)}`,
                      color: tc.foreground,
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-white/40 mb-1.5">服务器URL</label>
                <input
                  type="url"
                  value="https://api.yyc3.ai/wechat/callback"
                  className="w-full px-3 py-2 rounded-lg text-[12px]"
                  style={{
                    background: tc.alpha(tc.input, 0.5),
                    border: `1px solid ${tc.alpha(tc.border, 0.2)}`,
                    color: tc.foreground,
                  }}
                />
              </div>
            </div>
          </NeonCard>
        )}

        {activeTab === 'menu' && (
          <div className="space-y-4">
            <NeonCard color={tc.secondary}>
              <h3 className="text-[12px] text-white/60 mb-4 flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" style={{ color: tc.secondary }} />
                自定义菜单
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { name: '产品中心', type: 'view', submenus: 2 },
                  { name: '客户服务', type: 'click', submenus: 3 },
                  { name: '关于我们', type: 'view', submenus: 2 },
                ].map((menu, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg"
                    style={{
                      background: tc.alpha(tc.muted, 0.05),
                      border: `1px solid ${tc.alpha(tc.border, 0.1)}`,
                    }}
                  >
                    <h4 className="text-[11px] text-white/60 mb-2">{menu.name}</h4>
                    <div className="flex items-center justify-between text-[9px] text-white/40">
                      <span>类型: {menu.type}</span>
                      <span>{menu.submenus} 个子菜单</span>
                    </div>
                  </div>
                ))}
              </div>
            </NeonCard>

            <NeonCard color={tc.accent}>
              <h3 className="text-[12px] text-white/60 mb-3">菜单点击统计</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={menuClickData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {menuClickData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: tc.alpha(tc.card, 0.95),
                        border: `1px solid ${tc.alpha(tc.border, 0.3)}`,
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </NeonCard>
          </div>
        )}

        {activeTab === 'reply' && (
          <div className="space-y-4">
            {[
              {
                keyword: '价格',
                type: 'text',
                content: '感谢咨询，请问您需要了解哪个产品的价格？',
                enabled: true,
              },
              {
                keyword: '联系',
                type: 'text',
                content: '您好！客服电话：400-123-4567',
                enabled: true,
              },
              { keyword: '产品', type: 'news', content: '图文消息：产品介绍', enabled: true },
              { keyword: '帮助', type: 'text', content: 'AI智能客服为您服务', enabled: false },
            ].map((reply, idx) => (
              <NeonCard key={idx} color={tc.success}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-[11px] text-white/60">关键词: {reply.keyword}</h4>
                      <span
                        className="px-2 py-0.5 rounded-md text-[8px]"
                        style={{
                          background: tc.alpha(tc.accent, 0.1),
                          color: tc.accent,
                          border: `1px solid ${tc.alpha(tc.accent, 0.2)}`,
                        }}
                      >
                        {reply.type === 'text' ? '文本' : '图文'}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/40">{reply.content}</p>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={reply.enabled}
                      readOnly
                      className="w-4 h-4 rounded"
                      style={{ accentColor: tc.success }}
                    />
                    <span className="text-[9px] text-white/40">
                      {reply.enabled ? '已启用' : '已禁用'}
                    </span>
                  </label>
                </div>
              </NeonCard>
            ))}
          </div>
        )}

        {activeTab === 'message' && (
          <NeonCard color={tc.warning}>
            <h3 className="text-[12px] text-white/60 mb-4 flex items-center gap-2">
              <Megaphone className="w-4 h-4" style={{ color: tc.warning }} />
              模板消息管理
            </h3>
            <div className="space-y-3">
              {[
                { title: '订单确认通知', id: 'TM00001', sendCount: '2,345', enabled: true },
                { title: '支付成功通知', id: 'TM00002', sendCount: '1,890', enabled: true },
                { title: '活动提醒', id: 'TM00003', sendCount: '856', enabled: true },
                { title: '服务进度通知', id: 'TM00004', sendCount: '432', enabled: false },
              ].map((template, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg"
                  style={{
                    background: tc.alpha(tc.muted, 0.05),
                    border: `1px solid ${tc.alpha(tc.border, 0.1)}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[11px] text-white/60">{template.title}</h4>
                    <span
                      className="px-2 py-0.5 rounded-md text-[8px]"
                      style={{
                        background: tc.alpha(template.enabled ? tc.success : tc.muted, 0.1),
                        color: template.enabled ? tc.success : tc.mutedForeground,
                        border: `1px solid ${tc.alpha(template.enabled ? tc.success : tc.muted, 0.2)}`,
                      }}
                    >
                      {template.enabled ? '已启用' : '已禁用'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-white/40">
                    <span>模板ID: {template.id}</span>
                    <span>发送次数: {template.sendCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </NeonCard>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <NeonCard color={tc.primary}>
              <h3 className="text-[12px] text-white/60 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" style={{ color: tc.primary }} />
                用户标签管理
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: '潜在客户', count: 3280, color: '#22c55e' },
                  { name: '活跃用户', count: 5620, color: '#3b82f6' },
                  { name: 'VIP客户', count: 1240, color: '#eab308' },
                  { name: '流失预警', count: 890, color: '#ef4444' },
                ].map((tag, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg text-center"
                    style={{
                      background: tc.alpha(tag.color, 0.1),
                      border: `1px solid ${tc.alpha(tag.color, 0.2)}`,
                    }}
                  >
                    <p className="text-[10px] text-white/40 mb-1">{tag.name}</p>
                    <p className="text-lg" style={{ color: tag.color }}>
                      {tag.count.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </NeonCard>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-4">
            <NeonCard color={tc.accent}>
              <h3 className="text-[12px] text-white/60 mb-3">粉丝增长趋势</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fanGrowthData}>
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
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="newFans" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="lostFans" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </NeonCard>
          </div>
        )}
      </div>

      {/* AI Capabilities */}
      <div className="px-6 pb-8">
        <NeonCard color={tc.accent} hoverable={false}>
          <div className="flex items-start gap-3">
            <Bot className="w-5 h-5 shrink-0" style={{ color: tc.accent }} />
            <div>
              <h4 className="text-[11px] text-white/60 mb-2">AI 智能特性</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5">
                {[
                  '意图识别AI驱动智能回复',
                  '用户画像AI构建与更新',
                  '最佳推送时间AI预测',
                  '菜单结构AI优化推荐',
                  '用户流失AI识别与挽回',
                  '支付异常AI检测与风控',
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
  )
}
