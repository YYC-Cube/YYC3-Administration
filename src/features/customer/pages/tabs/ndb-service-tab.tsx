/**
 * @file ndb-service-tab.tsx
 * @description 号牌库·服务标签页(F-11 自 number-database-tabs.tsx 按 Tab 域拆出)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags customer,tabs,ServiceTab
 */

import { AlertTriangle, Clock, Flame, Sparkles, Star, Ticket } from 'lucide-react'

import { StatCard } from '../number-database-shared'

import { useI18n } from '@/app/components/i18n-context'

export function ServiceTab() {
  const { t } = useI18n()
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label={t('ndb.activeTickets')}
          value="37"
          icon={Ticket}
          color="#00f0ff"
          change="+8"
        />
        <StatCard
          label={t('ndb.avgResolveTime')}
          value="4.2h"
          icon={Clock}
          color="#00ffc8"
          change="-1.3h"
        />
        <StatCard
          label={t('ndb.satisfactionScore')}
          value="4.8/5"
          icon={Star}
          color="#00ffcc"
          change="+0.2"
        />
        <StatCard
          label={t('ndb.churnAlert')}
          value="3"
          icon={AlertTriangle}
          color="#005f73"
          change={t('ndb.urgentAttention')}
          trend="down"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Tickets */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,240,255,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Ticket className="w-3.5 h-3.5 text-[#00f0ff]" />
            {t('ndb.ticketSystem')}
          </h3>
          <div className="space-y-2">
            {[
              {
                id: 'T-892',
                title: 'ndbs.ticket.1.title',
                customer: 'ndbs.ticket.1.customer',
                channel: 'ndbs.channel.online',
                priority: 'ndb.medium',
                status: 'ndbs.ticketStatus.processing',
                color: '#00f0ff',
              },
              {
                id: 'T-893',
                title: 'ndbs.ticket.2.title',
                customer: 'ndbs.ticket.2.customer',
                channel: 'ndbs.channel.email',
                priority: 'ndb.high',
                status: 'ndbs.ticketStatus.pending',
                color: '#005f73',
              },
              {
                id: 'T-894',
                title: 'ndbs.ticket.3.title',
                customer: 'ndbs.ticket.3.customer',
                channel: 'ndbs.channel.phone',
                priority: 'ndb.low',
                status: 'ndbs.ticketStatus.resolved',
                color: '#00ffc8',
              },
              {
                id: 'T-895',
                title: 'ndbs.ticket.4.title',
                customer: 'ndbs.ticket.4.customer',
                channel: 'ndbs.channel.online',
                priority: 'ndb.medium',
                status: 'ndbs.ticketStatus.processing',
                color: '#00ffcc',
              },
              {
                id: 'T-896',
                title: 'ndbs.ticket.5.title',
                customer: 'ndbs.ticket.5.customer',
                channel: 'ndbs.channel.email',
                priority: 'ndb.high',
                status: 'ndbs.ticketStatus.pending',
                color: '#005f73',
              },
            ].map((ticket, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: 'rgba(255,255,255,0.04)',
                }}
              >
                <span className="text-[9px] text-white/15 tabular-nums w-12 shrink-0">
                  {ticket.id}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white/60 truncate">{t(ticket.title)}</p>
                  <p className="text-[9px] text-white/20">
                    {t(ticket.customer)} · {t(ticket.channel)}
                  </p>
                </div>
                <span
                  className="text-[8px] px-1.5 py-0.5 rounded-full"
                  style={{
                    background:
                      ticket.priority === 'ndb.high'
                        ? 'rgba(0,95,115,0.1)'
                        : ticket.priority === 'ndb.medium'
                          ? 'rgba(0,255,204,0.1)'
                          : 'rgba(0,255,200,0.1)',
                    color:
                      ticket.priority === 'ndb.high'
                        ? '#005f73'
                        : ticket.priority === 'ndb.medium'
                          ? '#00ffcc'
                          : '#00ffc8',
                  }}
                >
                  {t(ticket.priority)}
                </span>
                <span
                  className="text-[8px] px-1.5 py-0.5 rounded-full"
                  style={{
                    background:
                      ticket.status === 'ndbs.ticketStatus.resolved'
                        ? 'rgba(0,255,200,0.1)'
                        : ticket.status === 'ndbs.ticketStatus.processing'
                          ? 'rgba(0,240,255,0.1)'
                          : 'rgba(0,95,115,0.1)',
                    color:
                      ticket.status === 'ndbs.ticketStatus.resolved'
                        ? '#00ffc8'
                        : ticket.status === 'ndbs.ticketStatus.processing'
                          ? '#00f0ff'
                          : '#005f73',
                  }}
                >
                  {t(ticket.status)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Churn Alert + Wake-up */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,95,115,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-[#005f73]" />
            {t('ndb.churnWakeup')}
          </h3>
          <div className="space-y-3">
            {[
              {
                name: 'ndbs.churn.1.name',
                company: 'ndbs.churn.1.company',
                days: 7,
                health: 38,
                strategy: 'ndbs.churn.1.strategy',
                channel: 'ndbs.churn.1.channel',
                color: '#005f73',
              },
              {
                name: 'ndbs.churn.2.name',
                company: 'ndbs.churn.2.company',
                days: 5,
                health: 42,
                strategy: 'ndbs.churn.2.strategy',
                channel: 'ndbs.churn.2.channel',
                color: '#005f73',
              },
              {
                name: 'ndbs.churn.3.name',
                company: 'ndbs.churn.3.company',
                days: 3,
                health: 55,
                strategy: 'ndbs.churn.3.strategy',
                channel: 'ndbs.churn.3.channel',
                color: '#00ffcc',
              },
            ].map((a, i) => (
              <div
                key={i}
                className="rounded-xl p-3 border"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: `${a.color}15` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-white/60">{t(a.name)}</span>
                    <span className="text-[9px] text-white/20">{t(a.company)}</span>
                  </div>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded"
                    style={{ background: `${a.color}15`, color: a.color }}
                  >
                    {t('ndb.daysNoContact', { days: a.days })}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] text-white/20">{t('ndb.healthScore')}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${a.health}%`,
                        background: a.health > 50 ? '#00ffcc' : '#005f73',
                      }}
                    />
                  </div>
                  <span
                    className="text-[9px] tabular-nums"
                    style={{ color: a.health > 50 ? '#00ffcc' : '#005f73' }}
                  >
                    {a.health}
                  </span>
                </div>
                <p className="text-[9px] text-white/25 mb-1">
                  <Sparkles className="w-2.5 h-2.5 inline text-[#00d4ff]/60 mr-1" />
                  {t('ndb.aiStrategy')}: {t(a.strategy)}
                </p>
                <p className="text-[8px] text-white/15">
                  {t('ndb.recommendChannel')}: {t(a.channel)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ===========================================================
// Tab: Knowledge (知识赋能平台)
// ===========================================================
