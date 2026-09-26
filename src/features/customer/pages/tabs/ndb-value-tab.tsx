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

import { useI18n } from '@/app/components/i18n-context'

export function ValueTab({ contacts: _contacts }: { contacts: Contact[] }) {
  const { t } = useI18n()
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
            {t('ndbv.funnelTitle')}
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
                      {t(stage.name)}
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
            {t('ndbv.rfmTitle')}
          </h3>
          <div className="space-y-2">
            {[
              {
                tier: 'ndb.tierS',
                label: 'ndb.strategicCustomers',
                count: 5,
                value: '¥1,920K',
                color: '#00d4ff',
                desc: 'ndbv.desc.s',
              },
              {
                tier: 'ndb.tierA',
                label: 'ndb.coreCustomers',
                count: 12,
                value: '¥864K',
                color: '#00ffcc',
                desc: 'ndbv.desc.a',
              },
              {
                tier: 'ndb.tierB',
                label: 'ndb.growthCustomers',
                count: 28,
                value: '¥420K',
                color: '#00f0ff',
                desc: 'ndbv.desc.b',
              },
              {
                tier: 'ndb.tierC',
                label: 'ndb.potentialCustomers',
                count: 45,
                value: '¥156K',
                color: '#00ffc8',
                desc: 'ndbv.desc.c',
              },
              {
                tier: 'ndb.tierD',
                label: 'ndb.dormantCustomers',
                count: 18,
                value: '¥32K',
                color: '#005f73',
                desc: 'ndbv.desc.d',
              },
            ].map((item, i) => (
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
                  style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}
                >
                  <span className="text-[10px]" style={{ color: item.color }}>
                    {t(item.tier)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white/60">
                    {t(item.label)} <span className="text-white/20">· {t(item.desc)}</span>
                  </p>
                  <p className="text-[9px] text-white/20">
                    {t('ndbv.customerCount', { count: item.count })}
                  </p>
                </div>
                <span className="text-xs tabular-nums" style={{ color: item.color }}>
                  {item.value}
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
          {t('ndbv.timelineTitle')}
        </h3>
        <div className="relative pl-6">
          <div
            className="absolute left-2 top-0 bottom-0 w-px"
            style={{ background: 'linear-gradient(to bottom, #00f0ff40, #00d4ff40, transparent)' }}
          />
          {[
            {
              time: 'ndbv.tl.1.time',
              action: 'ndbv.tl.1.action',
              target: 'ndbv.tl.1.target',
              detail: 'ndbv.tl.1.detail',
              color: '#00ffc8',
            },
            {
              time: 'ndbv.tl.2.time',
              action: 'ndbv.tl.2.action',
              target: 'ndbv.tl.2.target',
              detail: 'ndbv.tl.2.detail',
              color: '#00f0ff',
            },
            {
              time: 'ndbv.tl.3.time',
              action: 'ndbv.tl.3.action',
              target: 'ndbv.tl.3.target',
              detail: 'ndbv.tl.3.detail',
              color: '#00ffcc',
            },
            {
              time: 'ndbv.tl.4.time',
              action: 'ndbv.tl.4.action',
              target: 'ndbv.tl.4.target',
              detail: 'ndbv.tl.4.detail',
              color: '#005f73',
            },
            {
              time: 'ndbv.tl.5.time',
              action: 'ndbv.tl.5.action',
              target: 'ndbv.tl.5.target',
              detail: 'ndbv.tl.5.detail',
              color: '#00d4ff',
            },
            {
              time: 'ndbv.tl.6.time',
              action: 'ndbv.tl.6.action',
              target: 'ndbv.tl.6.target',
              detail: 'ndbv.tl.6.detail',
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
                    <span className="text-[9px] text-white/20">{t(item.time)}</span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{ background: `${item.color}15`, color: item.color }}
                    >
                      {t(item.action)}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/60 mt-0.5">{t(item.target)}</p>
                  <p className="text-[9px] text-white/25">{t(item.detail)}</p>
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
