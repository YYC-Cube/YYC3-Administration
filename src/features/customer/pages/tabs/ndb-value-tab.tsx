/**
 * @file ndb-value-tab.tsx
 * @description 号牌库·价值标签页(F-11 自 number-database-tabs.tsx 按 Tab 域拆出)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags customer,tabs,ValueTab
 */

import { Brain, Clock, Target } from 'lucide-react'
import {} from 'recharts'

import { funnelData } from '../number-database-data'

import type { Contact } from '../number-database-data'

export function ValueTab({ contacts: _contacts }: { contacts: Contact[] }) {
  return (
    <div className="space-y-6">
      {/* Funnel */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,139,157,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-[#008b9d]" />
            销售漏斗 · Conversion Funnel
          </h3>
          <div className="space-y-2">
            {funnelData.map((stage, i) => {
              const maxVal = funnelData[0].value
              const widthPct = Math.max(20, (stage.value / maxVal) * 100)
              const convRate =
                i > 0 ? ((stage.value / funnelData[i - 1].value) * 100).toFixed(1) : '100'
              return (
                <div
                  key={stage.name}
                  className="relative"
                  style={{ animation: `spring-in 0.3s var(--spring-easing) ${i * 0.05}s both` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-white/30 w-8 text-right shrink-0">
                      {stage.name}
                    </span>
                    <div className="flex-1 relative">
                      <div
                        className="h-8 rounded-lg flex items-center px-3 transition-all duration-500"
                        style={{
                          width: `${widthPct}%`,
                          background: `${stage.fill}15`,
                          border: `1px solid ${stage.fill}30`,
                          boxShadow: `0 0 8px ${stage.fill}15`,
                        }}
                      >
                        <span className="text-[11px] tabular-nums" style={{ color: stage.fill }}>
                          {stage.value.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {i > 0 && (
                      <span className="text-[9px] text-white/20 w-12 text-right shrink-0">
                        {convRate}%
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Customer Portraits */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,212,255,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Brain className="w-3.5 h-3.5 text-[#00d4ff]" />
            全景客户画像 · RFM 分层
          </h3>
          <div className="space-y-2">
            {[
              {
                tier: 'S 级',
                label: '战略客户',
                count: 5,
                value: '¥1,920K',
                color: '#00d4ff',
                desc: '高频·高价值·活跃',
              },
              {
                tier: 'A 级',
                label: '核心客户',
                count: 12,
                value: '¥864K',
                color: '#00ffcc',
                desc: '高频·中高价值',
              },
              {
                tier: 'B 级',
                label: '成长客户',
                count: 28,
                value: '¥420K',
                color: '#00f0ff',
                desc: '中频·中等价值',
              },
              {
                tier: 'C 级',
                label: '潜力客户',
                count: 45,
                value: '¥156K',
                color: '#00ffc8',
                desc: '低频·待培育',
              },
              {
                tier: 'D 级',
                label: '休眠客户',
                count: 18,
                value: '¥32K',
                color: '#005f73',
                desc: '极低频·需唤醒',
              },
            ].map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 hover:border-white/10"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: 'rgba(255,255,255,0.04)',
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${t.color}15`, border: `1px solid ${t.color}30` }}
                >
                  <span className="text-[10px]" style={{ color: t.color }}>
                    {t.tier}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white/60">
                    {t.label} <span className="text-white/20">· {t.desc}</span>
                  </p>
                  <p className="text-[9px] text-white/20">{t.count}位客户</p>
                </div>
                <span className="text-xs tabular-nums" style={{ color: t.color }}>
                  {t.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Follow-up Timeline */}
      <div
        className="rounded-2xl p-5 border"
        style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,240,255,0.12)' }}
      >
        <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[#00f0ff]" />
          跟进记录图谱 · Follow-up Timeline
        </h3>
        <div className="relative pl-6">
          <div
            className="absolute left-2 top-0 bottom-0 w-px"
            style={{ background: 'linear-gradient(to bottom, #00f0ff40, #00d4ff40, transparent)' }}
          />
          {[
            {
              time: '今天 14:30',
              action: 'AI 自动跟进',
              target: '陈雅文 · 智链网络',
              detail: '发送续约方案v2.1，客户已读',
              color: '#00ffc8',
            },
            {
              time: '今天 10:15',
              action: '电话沟通',
              target: '张明远 · 星际科技',
              detail: '技术方案讨论，客户反馈积极',
              color: '#00f0ff',
            },
            {
              time: '昨天 16:00',
              action: '邮���发送',
              target: '孙浩然 · 智造工业',
              detail: '产品对比文档+报价单',
              color: '#00ffcc',
            },
            {
              time: '昨天 11:30',
              action: 'AI 智能提醒',
              target: '王建华 · 量子计算',
              detail: '客户3天未响应，建议换种方式联系',
              color: '#005f73',
            },
            {
              time: '3月11日',
              action: '视频会议',
              target: '赵鹏飞 · 未来能源',
              detail: '年度合作复盘，双方确认续约意向',
              color: '#00d4ff',
            },
            {
              time: '3月10日',
              action: '工单创建',
              target: '李思琪 · 云端数据',
              detail: '数据分析模块优化需求 #T-892',
              color: '#008b9d',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="relative mb-4 last:mb-0"
              style={{ animation: `spring-in 0.3s var(--spring-easing) ${i * 0.04}s both` }}
            >
              <div
                className="absolute -left-4 top-1 w-3 h-3 rounded-full border-2"
                style={{ borderColor: item.color, background: `${item.color}30` }}
              />
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] text-white/20">{item.time}</span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{ background: `${item.color}15`, color: item.color }}
                    >
                      {item.action}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/60 mt-0.5">{item.target}</p>
                  <p className="text-[9px] text-white/25">{item.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ===========================================================
// Tab: Service (服务体验升级)
// ===========================================================
