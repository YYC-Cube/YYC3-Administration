import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  Info,
  Link,
  Mail,
  RotateCcw,
  Save,
  Settings,
  Shield,
  Zap,
} from 'lucide-react'
import { useState } from 'react'

import { useThemeColors } from './hooks/use-theme-colors'
import { NeonCard } from './neon-card'

// ==========================================
// YYC³ 参数设置页面 - Parameter Settings
// 系统级参数配置管理 · AI智能推荐 · 配置验证与自动优化
// ==========================================

interface SystemConfig {
  siteName: string
  siteUrl: string
  adminEmail: string
  timezone: string
  language: string
  currency: string
  dateFormat: string
  timeFormat: string
}

interface EmailConfig {
  smtpHost: string
  smtpPort: string
  smtpUser: string
  smtpPassword: string
  smtpEncryption: 'none' | 'ssl' | 'tls'
  fromName: string
  fromEmail: string
}

interface SecurityConfig {
  passwordMinLength: number
  passwordRequireSpecial: boolean
  passwordRequireNumber: boolean
  passwordRequireUpper: boolean
  sessionTimeout: number
  maxLoginAttempts: number
  twoFactorAuth: boolean
  ipWhitelist: string
}

type ConfigSection = 'system' | 'platform' | 'email' | 'security'

export function ParameterSettingsPage() {
  const tc = useThemeColors()
  const [activeSection, setActiveSection] = useState<ConfigSection>('system')
  const [showPassword, setShowPassword] = useState(false)
  const [modified, setModified] = useState(false)

  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    siteName: 'YYC³ CloudPivot Intelli-Matrix',
    siteUrl: 'https://yyc3.ai',
    adminEmail: 'admin@yyc3.ai',
    timezone: 'Asia/Shanghai',
    language: 'zh-CN',
    currency: 'CNY',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm:ss',
  })

  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    smtpHost: 'smtp.example.com',
    smtpPort: '587',
    smtpUser: 'noreply@yyc3.ai',
    smtpPassword: '••••••••',
    smtpEncryption: 'tls',
    fromName: 'YYC³ System',
    fromEmail: 'noreply@yyc3.ai',
  })

  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>({
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    passwordRequireNumber: true,
    passwordRequireUpper: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    twoFactorAuth: false,
    ipWhitelist: '',
  })

  const handleSave = () => {
    // eslint-disable-next-line no-console
    console.log('Saving configuration...', { systemConfig, emailConfig, securityConfig })
    setModified(false)
    // Simulate save success
  }

  const handleReset = () => {
    // Reset to defaults
    setModified(false)
  }

  const sections = [
    { id: 'system' as const, label: '系统基础配置', icon: Settings, color: tc.primary },
    { id: 'platform' as const, label: '平台连接参数', icon: Link, color: tc.secondary },
    { id: 'email' as const, label: '邮件服务配置', icon: Mail, color: tc.success },
    { id: 'security' as const, label: '安全策略配置', icon: Shield, color: tc.destructive },
  ]

  return (
    <div className="h-full overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-1 z-10"
        style={{
          background: `linear-gradient(90deg, #8b5cf6, ${tc.primary}, ${tc.secondary})`,
          opacity: 0.5,
        }}
      />

      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{
                background: tc.alpha('#8b5cf6', 0.1),
                border: `1px solid ${tc.alpha('#8b5cf6', 0.2)}`,
                boxShadow: `0 0 15px ${tc.alpha('#8b5cf6', 0.1)}`,
              }}
            >
              <Settings className="w-5 h-5" style={{ color: '#8b5cf6' }} />
            </div>
            <div>
              <h1
                className="tracking-wider"
                style={{
                  color: tc.primary,
                  textShadow: `0 0 15px ${tc.alpha(tc.primary, 0.4)}`,
                }}
              >
                参数设置
              </h1>
              <p className="text-[10px] text-white/20 tracking-wider">
                系统级参数配置管理 · AI智能推荐 · 配置验证与自动优化
              </p>
            </div>
            <span
              className="ml-2 px-2 py-0.5 rounded-full text-[9px]"
              style={{
                background: tc.alpha('#8b5cf6', 0.08),
                color: '#8b5cf6',
                border: `1px solid ${tc.alpha('#8b5cf6', 0.15)}`,
              }}
            >
              平台集成
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5 transition-all"
              style={{
                background: tc.alpha(tc.muted, 0.1),
                border: `1px solid ${tc.alpha(tc.muted, 0.2)}`,
                color: tc.mutedForeground,
              }}
            >
              <RotateCcw className="w-3 h-3" />
              重置
            </button>
            <button
              onClick={handleSave}
              disabled={!modified}
              className="px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5 transition-all"
              style={{
                background: modified
                  ? `linear-gradient(135deg, ${tc.primary}, ${tc.secondary})`
                  : tc.alpha(tc.muted, 0.1),
                border: `1px solid ${modified ? tc.alpha(tc.primary, 0.3) : tc.alpha(tc.muted, 0.2)}`,
                color: modified ? '#fff' : tc.mutedForeground,
                opacity: modified ? 1 : 0.5,
                cursor: modified ? 'pointer' : 'not-allowed',
              }}
            >
              <Save className="w-3 h-3" />
              保存配置
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-6 pb-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: '配置项', value: '128', trend: '+3 本周', trendUp: true },
            { label: '安全评分', value: '96分', trend: '优秀', trendUp: true },
            { label: '配置版本', value: 'v2.8', trend: '最新' },
            { label: '最近变更', value: '2h前', trend: '张运维' },
          ].map((stat, idx) => (
            <NeonCard key={idx} color="#8b5cf6">
              <div
                style={{ animation: `spring-in 0.35s var(--spring-easing) ${idx * 0.05}s both` }}
              >
                <p className="text-[10px] text-white/30 mb-1">{stat.label}</p>
                <p
                  className="text-xl mb-0.5"
                  style={{
                    color: '#8b5cf6',
                    textShadow: `0 0 12px ${tc.alpha('#8b5cf6', 0.3)}`,
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

      {/* Section Tabs */}
      <div className="px-6 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {sections.map((section) => {
            const Icon = section.icon
            const isActive = activeSection === section.id
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className="px-4 py-2 rounded-lg text-[11px] flex items-center gap-2 whitespace-nowrap transition-all"
                style={{
                  background: isActive ? tc.alpha(section.color, 0.15) : tc.alpha(tc.card, 0.5),
                  border: `1px solid ${isActive ? tc.alpha(section.color, 0.3) : tc.alpha(tc.border, 0.1)}`,
                  color: isActive ? section.color : tc.mutedForeground,
                  boxShadow: isActive ? `0 0 15px ${tc.alpha(section.color, 0.2)}` : 'none',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {section.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Configuration Forms */}
      <div className="px-6 pb-8">
        {/* System Configuration */}
        {activeSection === 'system' && (
          <NeonCard color={tc.primary}>
            <div className="space-y-4">
              <h3 className="text-[13px] text-white/60 flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4" style={{ color: tc.primary }} />
                系统基础配置
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-white/40 mb-1.5">系统名称</label>
                  <input
                    type="text"
                    value={systemConfig.siteName}
                    onChange={(e) => {
                      setSystemConfig({ ...systemConfig, siteName: e.target.value })
                      setModified(true)
                    }}
                    className="w-full px-3 py-2 rounded-lg text-[12px] transition-all"
                    style={{
                      background: tc.alpha(tc.input, 0.5),
                      border: `1px solid ${tc.alpha(tc.border, 0.2)}`,
                      color: tc.foreground,
                    }}
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-white/40 mb-1.5">系统URL</label>
                  <input
                    type="url"
                    value={systemConfig.siteUrl}
                    onChange={(e) => {
                      setSystemConfig({ ...systemConfig, siteUrl: e.target.value })
                      setModified(true)
                    }}
                    className="w-full px-3 py-2 rounded-lg text-[12px] transition-all"
                    style={{
                      background: tc.alpha(tc.input, 0.5),
                      border: `1px solid ${tc.alpha(tc.border, 0.2)}`,
                      color: tc.foreground,
                    }}
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-white/40 mb-1.5">管理员邮箱</label>
                  <input
                    type="email"
                    value={systemConfig.adminEmail}
                    onChange={(e) => {
                      setSystemConfig({ ...systemConfig, adminEmail: e.target.value })
                      setModified(true)
                    }}
                    className="w-full px-3 py-2 rounded-lg text-[12px] transition-all"
                    style={{
                      background: tc.alpha(tc.input, 0.5),
                      border: `1px solid ${tc.alpha(tc.border, 0.2)}`,
                      color: tc.foreground,
                    }}
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-white/40 mb-1.5 flex items-center gap-1">
                    时区设置
                    <Info className="w-3 h-3 text-white/20" />
                  </label>
                  <select
                    value={systemConfig.timezone}
                    onChange={(e) => {
                      setSystemConfig({ ...systemConfig, timezone: e.target.value })
                      setModified(true)
                    }}
                    className="w-full px-3 py-2 rounded-lg text-[12px] transition-all"
                    style={{
                      background: tc.alpha(tc.input, 0.5),
                      border: `1px solid ${tc.alpha(tc.border, 0.2)}`,
                      color: tc.foreground,
                    }}
                  >
                    <option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</option>
                    <option value="America/New_York">America/New_York (UTC-5)</option>
                    <option value="Europe/London">Europe/London (UTC+0)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-white/40 mb-1.5">语言设置</label>
                  <select
                    value={systemConfig.language}
                    onChange={(e) => {
                      setSystemConfig({ ...systemConfig, language: e.target.value })
                      setModified(true)
                    }}
                    className="w-full px-3 py-2 rounded-lg text-[12px] transition-all"
                    style={{
                      background: tc.alpha(tc.input, 0.5),
                      border: `1px solid ${tc.alpha(tc.border, 0.2)}`,
                      color: tc.foreground,
                    }}
                  >
                    <option value="zh-CN">简体中文</option>
                    <option value="en-US">English</option>
                    <option value="ja-JP">日本語</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-white/40 mb-1.5">货币单位</label>
                  <select
                    value={systemConfig.currency}
                    onChange={(e) => {
                      setSystemConfig({ ...systemConfig, currency: e.target.value })
                      setModified(true)
                    }}
                    className="w-full px-3 py-2 rounded-lg text-[12px] transition-all"
                    style={{
                      background: tc.alpha(tc.input, 0.5),
                      border: `1px solid ${tc.alpha(tc.border, 0.2)}`,
                      color: tc.foreground,
                    }}
                  >
                    <option value="CNY">人民币 (¥)</option>
                    <option value="USD">美元 ($)</option>
                    <option value="EUR">欧元 (€)</option>
                  </select>
                </div>
              </div>
            </div>
          </NeonCard>
        )}

        {/* Platform Connections */}
        {activeSection === 'platform' && (
          <div className="space-y-4">
            {[
              { name: '微信公众号', platform: 'WeChat', enabled: true, status: 'connected' },
              { name: '钉钉应用', platform: 'DingTalk', enabled: true, status: 'connected' },
              { name: '飞书应用', platform: 'Feishu', enabled: false, status: 'disconnected' },
              { name: '抖音开放平台', platform: 'Douyin', enabled: false, status: 'disconnected' },
            ].map((platform, idx) => (
              <NeonCard key={idx} color={tc.secondary}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        background: tc.alpha(tc.secondary, 0.1),
                        border: `1px solid ${tc.alpha(tc.secondary, 0.2)}`,
                      }}
                    >
                      <Link className="w-4 h-4" style={{ color: tc.secondary }} />
                    </div>
                    <div>
                      <h4 className="text-[12px] text-white/70">{platform.name}</h4>
                      <p className="text-[10px] text-white/30">{platform.platform}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="px-2 py-1 rounded-md text-[9px] flex items-center gap-1"
                      style={{
                        background: tc.alpha(
                          platform.status === 'connected' ? tc.success : tc.muted,
                          0.1,
                        ),
                        color: platform.status === 'connected' ? tc.success : tc.mutedForeground,
                        border: `1px solid ${tc.alpha(
                          platform.status === 'connected' ? tc.success : tc.muted,
                          0.2,
                        )}`,
                      }}
                    >
                      {platform.status === 'connected' ? (
                        <CheckCircle2 className="w-2.5 h-2.5" />
                      ) : (
                        <AlertCircle className="w-2.5 h-2.5" />
                      )}
                      {platform.status === 'connected' ? '已连接' : '未连接'}
                    </span>
                    <button
                      className="px-3 py-1 rounded-lg text-[10px] transition-all"
                      style={{
                        background: tc.alpha(tc.primary, 0.1),
                        border: `1px solid ${tc.alpha(tc.primary, 0.2)}`,
                        color: tc.primary,
                      }}
                    >
                      配置
                    </button>
                  </div>
                </div>
              </NeonCard>
            ))}
          </div>
        )}

        {/* Email Configuration */}
        {activeSection === 'email' && (
          <NeonCard color={tc.success}>
            <div className="space-y-4">
              <h3 className="text-[13px] text-white/60 flex items-center gap-2 mb-4">
                <Mail className="w-4 h-4" style={{ color: tc.success }} />
                邮件服务配置
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-white/40 mb-1.5">SMTP 主机</label>
                  <input
                    type="text"
                    value={emailConfig.smtpHost}
                    onChange={(e) => {
                      setEmailConfig({ ...emailConfig, smtpHost: e.target.value })
                      setModified(true)
                    }}
                    className="w-full px-3 py-2 rounded-lg text-[12px]"
                    style={{
                      background: tc.alpha(tc.input, 0.5),
                      border: `1px solid ${tc.alpha(tc.border, 0.2)}`,
                      color: tc.foreground,
                    }}
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-white/40 mb-1.5">SMTP 端口</label>
                  <input
                    type="text"
                    value={emailConfig.smtpPort}
                    onChange={(e) => {
                      setEmailConfig({ ...emailConfig, smtpPort: e.target.value })
                      setModified(true)
                    }}
                    className="w-full px-3 py-2 rounded-lg text-[12px]"
                    style={{
                      background: tc.alpha(tc.input, 0.5),
                      border: `1px solid ${tc.alpha(tc.border, 0.2)}`,
                      color: tc.foreground,
                    }}
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-white/40 mb-1.5">SMTP 用户名</label>
                  <input
                    type="text"
                    value={emailConfig.smtpUser}
                    onChange={(e) => {
                      setEmailConfig({ ...emailConfig, smtpUser: e.target.value })
                      setModified(true)
                    }}
                    className="w-full px-3 py-2 rounded-lg text-[12px]"
                    style={{
                      background: tc.alpha(tc.input, 0.5),
                      border: `1px solid ${tc.alpha(tc.border, 0.2)}`,
                      color: tc.foreground,
                    }}
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-white/40 mb-1.5">SMTP 密码</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={emailConfig.smtpPassword}
                      onChange={(e) => {
                        setEmailConfig({ ...emailConfig, smtpPassword: e.target.value })
                        setModified(true)
                      }}
                      className="w-full px-3 py-2 pr-10 rounded-lg text-[12px]"
                      style={{
                        background: tc.alpha(tc.input, 0.5),
                        border: `1px solid ${tc.alpha(tc.border, 0.2)}`,
                        color: tc.foreground,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      style={{ color: tc.mutedForeground }}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-white/40 mb-1.5">加密方式</label>
                  <select
                    value={emailConfig.smtpEncryption}
                    onChange={(e) => {
                      setEmailConfig({
                        ...emailConfig,
                        smtpEncryption: e.target.value as 'none' | 'ssl' | 'tls',
                      })
                      setModified(true)
                    }}
                    className="w-full px-3 py-2 rounded-lg text-[12px]"
                    style={{
                      background: tc.alpha(tc.input, 0.5),
                      border: `1px solid ${tc.alpha(tc.border, 0.2)}`,
                      color: tc.foreground,
                    }}
                  >
                    <option value="none">None</option>
                    <option value="ssl">SSL</option>
                    <option value="tls">TLS</option>
                  </select>
                </div>
              </div>
            </div>
          </NeonCard>
        )}

        {/* Security Configuration */}
        {activeSection === 'security' && (
          <NeonCard color={tc.destructive}>
            <div className="space-y-4">
              <h3 className="text-[13px] text-white/60 flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4" style={{ color: tc.destructive }} />
                安全策略配置
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] text-white/40 mb-2">密码最小长度</label>
                  <input
                    type="range"
                    min="6"
                    max="20"
                    value={securityConfig.passwordMinLength}
                    onChange={(e) => {
                      setSecurityConfig({
                        ...securityConfig,
                        passwordMinLength: parseInt(e.target.value),
                      })
                      setModified(true)
                    }}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-white/30 mt-1">
                    <span>6</span>
                    <span className="text-white/60">{securityConfig.passwordMinLength} 位</span>
                    <span>20</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      label: '要求特殊字符',
                      value: securityConfig.passwordRequireSpecial,
                      key: 'passwordRequireSpecial' as const,
                    },
                    {
                      label: '要求数字',
                      value: securityConfig.passwordRequireNumber,
                      key: 'passwordRequireNumber' as const,
                    },
                    {
                      label: '要求大写字母',
                      value: securityConfig.passwordRequireUpper,
                      key: 'passwordRequireUpper' as const,
                    },
                    {
                      label: '启用双因素认证',
                      value: securityConfig.twoFactorAuth,
                      key: 'twoFactorAuth' as const,
                    },
                  ].map((item, idx) => (
                    <label
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all"
                      style={{
                        background: tc.alpha(tc.muted, 0.05),
                        border: `1px solid ${tc.alpha(tc.border, 0.1)}`,
                      }}
                    >
                      <span className="text-[11px] text-white/50">{item.label}</span>
                      <input
                        type="checkbox"
                        checked={item.value}
                        onChange={(e) => {
                          setSecurityConfig({ ...securityConfig, [item.key]: e.target.checked })
                          setModified(true)
                        }}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: tc.destructive }}
                      />
                    </label>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-white/40 mb-1.5">
                      会话超时 (分钟)
                    </label>
                    <input
                      type="number"
                      value={securityConfig.sessionTimeout}
                      onChange={(e) => {
                        setSecurityConfig({
                          ...securityConfig,
                          sessionTimeout: parseInt(e.target.value) || 0,
                        })
                        setModified(true)
                      }}
                      className="w-full px-3 py-2 rounded-lg text-[12px]"
                      style={{
                        background: tc.alpha(tc.input, 0.5),
                        border: `1px solid ${tc.alpha(tc.border, 0.2)}`,
                        color: tc.foreground,
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 mb-1.5">
                      最大登录尝试次数
                    </label>
                    <input
                      type="number"
                      value={securityConfig.maxLoginAttempts}
                      onChange={(e) => {
                        setSecurityConfig({
                          ...securityConfig,
                          maxLoginAttempts: parseInt(e.target.value) || 0,
                        })
                        setModified(true)
                      }}
                      className="w-full px-3 py-2 rounded-lg text-[12px]"
                      style={{
                        background: tc.alpha(tc.input, 0.5),
                        border: `1px solid ${tc.alpha(tc.border, 0.2)}`,
                        color: tc.foreground,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </NeonCard>
        )}
      </div>

      {/* AI Capabilities Info */}
      <div className="px-6 pb-8">
        <NeonCard color={tc.accent} hoverable={false}>
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 shrink-0" style={{ color: tc.accent }} />
            <div>
              <h4 className="text-[11px] text-white/60 mb-2">AI 智能特性</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5">
                {[
                  '基于地理位置的时区自动推荐',
                  'API密钥强度检测与安全评分',
                  '连接配置智能验证与错误诊断',
                  '密码强度AI评估与改进建议',
                  '异常登录行为AI检测与预警',
                  '配置漂移自动检测',
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
