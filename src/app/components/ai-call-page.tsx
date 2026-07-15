import {
  Activity,
  Clock,
  Headphones,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Settings,
  Sparkles,
  Timer,
  TrendingUp,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useState } from 'react'

import { useThemeColors } from './hooks/use-theme-colors'
import { useI18n } from './i18n-context'
import { NeonCard } from './neon-card'

interface CallRecord {
  id: string
  name: string
  phone: string
  duration: string
  status: 'incoming' | 'outgoing' | 'missed' | 'completed'
  time: string
  aiAnalysis: string
}

interface ActiveCall {
  id: string
  name: string
  phone: string
  duration: number
  status: 'connecting' | 'active' | 'hold'
}

export function AICallPage() {
  const tc = useThemeColors()
  const { t: translate } = useI18n()

  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null)
  const [callHistory, setCallHistory] = useState<CallRecord[]>([
    {
      id: '1',
      name: '张明远',
      phone: '138-0000-1234',
      duration: '08:32',
      status: 'completed',
      time: '10分钟前',
      aiAnalysis: '客户意向度高，建议重点跟进',
    },
    {
      id: '2',
      name: '李思琪',
      phone: '139-1111-5678',
      duration: '03:15',
      status: 'completed',
      time: '30分钟前',
      aiAnalysis: '需求明确，价格敏感',
    },
    {
      id: '3',
      name: '王建华',
      phone: '137-2222-9012',
      duration: '00:00',
      status: 'missed',
      time: '1小时前',
      aiAnalysis: '未接来电，建议回拨',
    },
    {
      id: '4',
      name: '陈雅文',
      phone: '136-3333-3456',
      duration: '12:45',
      status: 'completed',
      time: '2小时前',
      aiAnalysis: '已成交，需后续服务跟进',
    },
    {
      id: '5',
      name: '赵鹏飞',
      phone: '135-4444-7890',
      duration: '05:20',
      status: 'outgoing',
      time: '3小时前',
      aiAnalysis: 'AI推荐优质客户',
    },
  ])

  const handleCall = (record: CallRecord) => {
    setActiveCall({
      id: record.id,
      name: record.name,
      phone: record.phone,
      duration: 0,
      status: 'connecting',
    })
  }

  const handleEndCall = () => {
    if (activeCall) {
      setCallHistory((prev) => [
        {
          ...activeCall,
          duration: formatDuration(activeCall.duration),
          status: 'completed',
          time: '刚刚',
          aiAnalysis: 'AI正在分析通话内容...',
        },
        ...prev,
      ])
      setActiveCall(null)
    }
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const recentStats = [
    { label: translate('ac.callsToday'), value: '28', icon: Phone, change: '+12%' },
    { label: translate('ac.connectRate'), value: '87%', icon: Activity, change: '+5%' },
    { label: translate('ac.avgDuration'), value: '6.5min', icon: Clock, change: '-1.2min' },
    {
      label: translate('ac.aiAnalysis'),
      value: '100%',
      icon: Headphones,
      change: translate('ac.fullCoverage'),
    },
  ]

  return (
    <div className="space-y-6" style={{ color: tc.textPrimary }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: tc.textPrimary }}>
            {translate('nav.aicall')}
          </h1>
          <p className="text-sm" style={{ color: tc.textSecondary }}>
            {translate('ac.subtitle')}
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium"
          style={{ background: tc.gradientButton, color: tc.textPrimary, boxShadow: tc.shadowMd }}
        >
          <Settings className="w-5 h-5" />
          {translate('ac.callSettings')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {recentStats.map((stat) => (
          <NeonCard key={stat.label} color={tc.accent} hoverable={false} className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="p-2 rounded-lg"
                style={{ background: tc.bgCard, border: `1px solid ${tc.borderSubtle}` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: tc.accent }} />
              </div>
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{ background: tc.alpha(tc.success, 0.15), color: tc.success }}
              >
                {stat.change}
              </span>
            </div>
            <p className="text-sm mb-1" style={{ color: tc.textMuted }}>
              {stat.label}
            </p>
            <p className="text-2xl font-bold" style={{ color: tc.textPrimary }}>
              {stat.value}
            </p>
          </NeonCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <NeonCard color={tc.primary} hoverable={false} className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold" style={{ color: tc.textPrimary }}>
              {translate('ac.callHistory')}
            </h2>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 rounded-lg text-sm"
                style={{
                  background: tc.bgCard,
                  color: tc.textSecondary,
                  border: `1px solid ${tc.borderSubtle}`,
                }}
              >
                {translate('ac.all')}
              </button>
              <button
                className="px-4 py-2 rounded-lg text-sm"
                style={{
                  background: tc.bgCard,
                  color: tc.textSecondary,
                  border: `1px solid ${tc.borderSubtle}`,
                }}
              >
                {translate('ac.missed')}
              </button>
              <button
                className="px-4 py-2 rounded-lg text-sm"
                style={{
                  background: tc.bgCard,
                  color: tc.textSecondary,
                  border: `1px solid ${tc.borderSubtle}`,
                }}
              >
                {translate('ac.aiAnalysis')}
              </button>
            </div>
          </div>

          {activeCall ? (
            <div
              className="rounded-xl p-8 text-center"
              style={{ background: tc.bgCard, border: `1px solid ${tc.borderSubtle}` }}
            >
              <div className="mb-6">
                <div
                  className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4"
                  style={{
                    background: tc.bgCard,
                    border: `2px solid ${tc.accent}`,
                    boxShadow: `0 0 30px ${tc.accent}40`,
                  }}
                >
                  <User className="w-12 h-12" style={{ color: tc.accent }} />
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: tc.textPrimary }}>
                  {activeCall.name}
                </h3>
                <p style={{ color: tc.textSecondary }}>{activeCall.phone}</p>
                <p className="text-3xl font-mono mt-4" style={{ color: tc.accent }}>
                  {formatDuration(activeCall.duration)}
                </p>
                <p className="text-sm mt-2" style={{ color: tc.textMuted }}>
                  {activeCall.status === 'connecting'
                    ? translate('ac.connecting')
                    : translate('ac.inCall')}
                </p>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: isMuted ? tc.destructive : tc.bgCard,
                    border: `1px solid ${isMuted ? tc.destructive : tc.borderSubtle}`,
                  }}
                >
                  {isMuted ? (
                    <MicOff className="w-6 h-6" style={{ color: tc.destructive }} />
                  ) : (
                    <Mic className="w-6 h-6" style={{ color: tc.textSecondary }} />
                  )}
                </button>
                <button
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: isSpeakerOn ? tc.alpha(tc.success, 0.15) : tc.bgCard,
                    border: `1px solid ${isSpeakerOn ? tc.success : tc.borderSubtle}`,
                  }}
                >
                  {isSpeakerOn ? (
                    <Volume2 className="w-6 h-6" style={{ color: tc.success }} />
                  ) : (
                    <VolumeX className="w-6 h-6" style={{ color: tc.textSecondary }} />
                  )}
                </button>
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: isRecording ? tc.alpha(tc.warning, 0.15) : tc.bgCard,
                    border: `1px solid ${isRecording ? tc.warning : tc.borderSubtle}`,
                  }}
                >
                  <Timer
                    className="w-6 h-6"
                    style={{ color: isRecording ? tc.warning : tc.textSecondary }}
                  />
                </button>
                <button
                  onClick={handleEndCall}
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: tc.destructive,
                    boxShadow: `0 0 20px ${tc.destructive}40`,
                  }}
                >
                  <PhoneOff className="w-7 h-7 text-white" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {callHistory.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-opacity-80 transition-all cursor-pointer"
                  style={{
                    background: tc.bgCard,
                    border: `1px solid ${tc.borderSubtle}`,
                  }}
                  onClick={() => handleCall(record)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        record.status === 'missed' ? 'animate-pulse' : ''
                      }`}
                      style={{
                        background: tc.bgCard,
                        border: `1px solid ${
                          record.status === 'missed' ? tc.destructive : tc.borderSubtle
                        }`,
                      }}
                    >
                      {record.status === 'missed' ? (
                        <PhoneOff className="w-5 h-5" style={{ color: tc.destructive }} />
                      ) : record.status === 'incoming' ? (
                        <Phone className="w-5 h-5" style={{ color: tc.success }} />
                      ) : (
                        <Phone className="w-5 h-5" style={{ color: tc.accent }} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium" style={{ color: tc.textPrimary }}>
                        {record.name}
                      </h4>
                      <p className="text-sm" style={{ color: tc.textSecondary }}>
                        {record.phone}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm" style={{ color: tc.textSecondary }}>
                      {record.time}
                    </p>
                    <p className="text-xs" style={{ color: tc.textMuted }}>
                      {record.duration}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </NeonCard>

        <NeonCard color={tc.secondary} hoverable={false} className="p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: tc.textPrimary }}>
            {translate('ac.aiCallAnalysis')}
          </h2>
          <div className="space-y-3">
            {callHistory.slice(0, 3).map((record) => (
              <div
                key={record.id}
                className="p-3 rounded-lg"
                style={{ background: tc.bgCard, border: `1px solid ${tc.borderSubtle}` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4" style={{ color: tc.accent }} />
                  <span className="text-sm font-medium" style={{ color: tc.textPrimary }}>
                    {record.name}
                  </span>
                </div>
                <p className="text-xs" style={{ color: tc.textSecondary }}>
                  {record.aiAnalysis}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-lg" style={{ background: tc.alpha(tc.success, 0.15) }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5" style={{ color: tc.success }} />
              <span className="font-medium" style={{ color: tc.success }}>
                {translate('ac.aiRecommendedCall')}
              </span>
            </div>
            <p className="text-sm" style={{ color: tc.textSecondary }}>
              {translate('ac.aiRecommendDesc')}
            </p>
            <div className="mt-3 space-y-2">
              <div
                className="flex items-center justify-between p-2 rounded-lg"
                style={{ background: tc.bgCard }}
              >
                <span style={{ color: tc.textPrimary }}>张明远</span>
                <span className="text-xs" style={{ color: tc.accent }}>
                  {translate('ac.intentScore')} 92%
                </span>
              </div>
              <div
                className="flex items-center justify-between p-2 rounded-lg"
                style={{ background: tc.bgCard }}
              >
                <span style={{ color: tc.textPrimary }}>李思琪</span>
                <span className="text-xs" style={{ color: tc.accent }}>
                  {translate('ac.intentScore')} 85%
                </span>
              </div>
            </div>
          </div>
        </NeonCard>
      </div>
    </div>
  )
}
