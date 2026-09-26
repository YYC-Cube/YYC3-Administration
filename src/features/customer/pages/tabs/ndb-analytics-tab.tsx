/**
 * @file ndb-analytics-tab.tsx
 * @description 号牌库·分析标签页(F-11 自 number-database-tabs.tsx 按 Tab 域拆出)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags customer,tabs,AnalyticsTab
 */

import { Award, BarChart3, Globe, Lightbulb, Shield, Target, TrendingUp } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { channelData, monthlyRevenue, radarData } from '../number-database-data'
import { NeonTooltip, StatCard } from '../number-database-shared'

import { useI18n } from '@/app/components/i18n-context'

export function AnalyticsTab() {
  const { t } = useI18n()
  return (
    <div className="space-y-6">
      {/* Top metrics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label={t('ndb.yoyGrowth')}
          value="+23.7%"
          icon={TrendingUp}
          color="#00f0ff"
          change={t('ndb.vsLastYear')}
        />
        <StatCard
          label={t('ndb.momGrowth')}
          value="+8.2%"
          icon={BarChart3}
          color="#00d4ff"
          change={t('ndb.vsLastMonth')}
        />
        <StatCard
          label={t('ndb.targetRate')}
          value="87.5%"
          icon={Target}
          color="#00ffcc"
          change={t('ndb.targetGap', { pct: '12.5%' })}
          trend="up"
        />
        <StatCard
          label={t('ndb.teamRank')}
          value="TOP 3"
          icon={Award}
          color="#00ffc8"
          change={t('ndb.nationwide', { rank: 3 })}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Revenue vs Target */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,240,255,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-[#00f0ff]" />
            {t('ndb.revenueVsTarget')}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="month"
                tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<NeonTooltip />} />
              <Bar
                dataKey="revenue"
                fill="#00f0ff"
                radius={[4, 4, 0, 0]}
                opacity={0.8}
                name="实际营收"
              />
              <Bar
                dataKey="target"
                fill="#00d4ff"
                radius={[4, 4, 0, 0]}
                opacity={0.3}
                name="目标"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Channel Analysis */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,212,255,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-[#00d4ff]" />
            {t('ndb.channelAnalysis')}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={channelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                type="number"
                tick={{ fill: 'rgba(255,255,255,0.15)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="channel"
                type="category"
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<NeonTooltip />} />
              <Bar dataKey="value" name="客户数" radius={[0, 4, 4, 0]}>
                {channelData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} opacity={0.7} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar + Trend Prediction */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Radar */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,255,204,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#00ffcc]" />
            {t('ndb.radarChart')}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart outerRadius={80} data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="dim" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} />
              <PolarRadiusAxis
                angle={30}
                tick={{ fill: 'rgba(255,255,255,0.1)', fontSize: 8 }}
                domain={[0, 100]}
              />
              <Radar
                name="能力值"
                dataKey="value"
                stroke="#00f0ff"
                fill="#00f0ff"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Trend Prediction */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,255,200,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-[#00ffc8]" />
            {t('ndb.aiTrendPredict')}
          </h3>
          <div className="space-y-3">
            {[
              {
                title: 'Q2 营收预测',
                desc: '基于当前增长趋势，预计 Q2 可达 ¥165万，超额完成目标 12%',
                confidence: 87,
                color: '#00ffc8',
              },
              {
                title: '客户流失预警',
                desc: '3位客户健康度持续下降，建议72小时内安排专项跟进',
                confidence: 92,
                color: '#005f73',
              },
              {
                title: '转化率优化',
                desc: '「官网注册」渠道转化率低于均值，建议优化落地页内容',
                confidence: 78,
                color: '#00ffcc',
              },
              {
                title: '团队效能建议',
                desc: '张明远负载偏高(18客户)，建议将3位获客阶段客户分配给新人',
                confidence: 85,
                color: '#00d4ff',
              },
            ].map((p, i) => (
              <div
                key={i}
                className="rounded-xl p-3 border"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: 'rgba(255,255,255,0.04)',
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-white/60">{p.title}</span>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded"
                    style={{ background: `${p.color}15`, color: p.color }}
                  >
                    置信度 {p.confidence}%
                  </span>
                </div>
                <p className="text-[10px] text-white/30">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ===========================================================
// Tab: Collaboration (智能协同管理)
// ===========================================================
