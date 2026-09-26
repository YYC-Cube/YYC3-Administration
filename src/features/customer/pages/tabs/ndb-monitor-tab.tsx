/**
 * @file ndb-monitor-tab.tsx
 * @description 号牌库·监控标签页(F-11 自 number-database-tabs.tsx 按 Tab 域拆出)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags customer,tabs,MonitorTab
 */

import { Activity, AlertTriangle, Eye, Gauge, Radio, Shield, Zap } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { funnelData } from '../number-database-data'
import { NeonTooltip, StatCard } from '../number-database-shared'

import { useI18n } from '@/app/components/i18n-context'

export function MonitorTab() {
  const { t } = useI18n()
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label={t('ndb.realtimeVisits')}
          value="2,847"
          icon={Eye}
          color="#00f0ff"
          change="+342"
        />
        <StatCard
          label={t('ndb.apiResponseTime')}
          value="12ms"
          icon={Zap}
          color="#00ffc8"
          change="-3ms"
        />
        <StatCard
          label={t('ndb.sysAvailability')}
          value="99.97%"
          icon={Shield}
          color="#00ffcc"
          change="30d"
        />
        <StatCard
          label={t('ndb.anomalyAlerts')}
          value="0"
          icon={AlertTriangle}
          color="#005f73"
          change={t('ndb.sysNormal')}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Conversion Funnel */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,240,255,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Gauge className="w-3.5 h-3.5 text-[#00f0ff]" />
            {t('ndb.funnelAnalysis')}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={funnelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="name"
                tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => t(v)}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<NeonTooltip />} />
              <Bar dataKey="value" name={t('ndbm2.quantity')} radius={[4, 4, 0, 0]}>
                {funnelData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} opacity={0.7} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Real-time Metrics Grid */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,95,115,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[#005f73]" />
            {t('ndb.metricsPanel')}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: 'ndbm2.metric.1.label',
                value: '34%',
                max: 100,
                current: 34,
                color: '#00ffc8',
                threshold: 80,
              },
              {
                label: 'ndbm2.metric.2.label',
                value: '62%',
                max: 100,
                current: 62,
                color: '#00ffcc',
                threshold: 85,
              },
              {
                label: 'ndbm2.metric.3.label',
                value: '18MB/s',
                max: 100,
                current: 18,
                color: '#00f0ff',
                threshold: 90,
              },
              {
                label: 'ndbm2.metric.4.label',
                value: '245Mbps',
                max: 1000,
                current: 24.5,
                color: '#00d4ff',
                threshold: 80,
              },
              {
                label: 'ndbm2.metric.5.label',
                value: '1,247',
                max: 5000,
                current: 25,
                color: '#008b9d',
                threshold: 80,
              },
              {
                label: 'ndbm2.metric.6.label',
                value: '3',
                max: 100,
                current: 3,
                color: '#00ffc8',
                threshold: 50,
              },
            ].map((m, i) => (
              <div
                key={i}
                className="rounded-xl p-3"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] text-white/25">{t(m.label)}</span>
                  <span className="text-xs tabular-nums" style={{ color: m.color }}>
                    {m.value}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${m.current}%`,
                      background: m.color,
                      boxShadow: `0 0 6px ${m.color}40`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Behavior Analysis */}
      <div
        className="rounded-2xl p-5 border"
        style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,255,204,0.12)' }}
      >
        <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#00ffcc]" />
          {t('ndb.behaviorAnalysis')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {[
            {
              page: 'ndbm2.page.1.page',
              visits: 4523,
              avgTime: '3:42',
              heat: 95,
              color: '#00f0ff',
            },
            {
              page: 'ndbm2.page.2.page',
              visits: 3891,
              avgTime: '5:18',
              heat: 88,
              color: '#00d4ff',
            },
            {
              page: 'ndbm2.page.3.page',
              visits: 2674,
              avgTime: '8:45',
              heat: 82,
              color: '#00ffcc',
            },
            {
              page: 'ndbm2.page.4.page',
              visits: 2145,
              avgTime: '2:56',
              heat: 72,
              color: '#00ffc8',
            },
            {
              page: 'ndbm2.page.5.page',
              visits: 1892,
              avgTime: '4:12',
              heat: 65,
              color: '#008b9d',
            },
            {
              page: 'ndbm2.page.6.page',
              visits: 1567,
              avgTime: '6:33',
              heat: 58,
              color: '#005f73',
            },
          ].map((p, i) => (
            <div
              key={i}
              className="rounded-xl p-3 text-center border transition-all duration-200 hover:border-white/10"
              style={{ background: `${p.color}08`, borderColor: `${p.color}15` }}
            >
              <div
                className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center relative"
                style={{ background: `${p.color}15`, border: `1px solid ${p.color}25` }}
              >
                <span className="text-xs" style={{ color: p.color }}>
                  {p.heat}
                </span>
                <div
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                  style={{
                    background: p.heat >= 80 ? '#005f73' : p.heat >= 60 ? '#00ffcc' : '#00ffc8',
                    boxShadow: `0 0 4px ${p.heat >= 80 ? '#005f73' : p.heat >= 60 ? '#00ffcc' : '#00ffc8'}`,
                    animation: p.heat >= 80 ? 'neon-pulse 1.5s ease-in-out infinite' : 'none',
                  }}
                />
              </div>
              <p className="text-[10px] text-white/50">{t(p.page)}</p>
              <p className="text-[9px] text-white/20">
                {t('ndbm2.visits', { visits: p.visits.toLocaleString() })}
              </p>
              <p className="text-[8px] text-white/15">{t('ndbm2.avgStay', { time: p.avgTime })}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
