/**
 * @file ndb-knowledge-tab.tsx
 * @description 号牌库·知识标签页(F-11 自 number-database-tabs.tsx 按 Tab 域拆出)
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags customer,tabs,KnowledgeTab
 */

import { Award, BookOpen, Eye, FileText, MessageSquare } from 'lucide-react'

import { StatCard } from '../number-database-shared'

import { useI18n } from '@/app/components/i18n-context'

export function KnowledgeTab() {
  const { t } = useI18n()
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label={t('ndb.knowledgeDocs')}
          value="1,247"
          icon={FileText}
          color="#00f0ff"
          change="+32"
        />
        <StatCard
          label={t('ndb.todayTraining')}
          value="3"
          icon={BookOpen}
          color="#00d4ff"
          change="1 active"
        />
        <StatCard
          label={t('ndb.aiMeetingNotes')}
          value="89"
          icon={MessageSquare}
          color="#00ffcc"
          change="+5"
        />
        <StatCard
          label={t('ndb.teamMotivation')}
          value="94.2"
          icon={Award}
          color="#00ffc8"
          change="+2.8"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Knowledge Base */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,240,255,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-[#00f0ff]" />
            {t('ndb.knowledgeBase')}
          </h3>
          <div className="space-y-2">
            {[
              {
                title: 'ndbk.doc.1.title',
                type: 'ndbk.doc.1.type',
                views: 342,
                date: 'ndbk.doc.1.date',
                color: '#00f0ff',
              },
              {
                title: 'ndbk.doc.2.title',
                type: 'ndbk.doc.2.type',
                views: 567,
                date: 'ndbk.doc.2.date',
                color: '#00d4ff',
              },
              {
                title: 'ndbk.doc.3.title',
                type: 'ndbk.doc.3.type',
                views: 1204,
                date: 'ndbk.doc.3.date',
                color: '#00ffcc',
              },
              {
                title: 'ndbk.doc.4.title',
                type: 'ndbk.doc.4.type',
                views: 298,
                date: 'ndbk.doc.4.date',
                color: '#00ffc8',
              },
              {
                title: 'ndbk.doc.5.title',
                type: 'ndbk.doc.5.type',
                views: 189,
                date: 'ndbk.doc.5.date',
                color: '#008b9d',
              },
            ].map((doc, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all duration-200 hover:border-white/10"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: 'rgba(255,255,255,0.04)',
                }}
              >
                <FileText className="w-4 h-4 shrink-0" style={{ color: `${doc.color}60` }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-white/60 truncate">{t(doc.title)}</p>
                  <p className="text-[9px] text-white/20">
                    {t(doc.type)} · {t(doc.date)}
                  </p>
                </div>
                <span className="text-[9px] text-white/15 flex items-center gap-1">
                  <Eye className="w-2.5 h-2.5" /> {doc.views}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Motivations */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: 'rgba(10,10,10,0.5)', borderColor: 'rgba(0,255,200,0.12)' }}
        >
          <h3 className="text-[10px] text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-[#00ffc8]" />
            {t('ndb.dailyMotivation')}
          </h3>
          <div className="space-y-3">
            {[
              {
                name: 'ndbk.motivation.1.name',
                role: 'ndbk.motivation.1.role',
                msg: 'ndbk.motivation.1.msg',
                type: 'ndb.encourage',
                score: 96,
                color: '#00ffc8',
              },
              {
                name: 'ndbk.motivation.2.name',
                role: 'ndbk.motivation.2.role',
                msg: 'ndbk.motivation.2.msg',
                type: 'ndb.encourage',
                score: 94,
                color: '#00f0ff',
              },
              {
                name: 'ndbk.motivation.3.name',
                role: 'ndbk.motivation.3.role',
                msg: 'ndbk.motivation.3.msg',
                type: 'ndb.admonish',
                score: 72,
                color: '#00ffcc',
              },
              {
                name: 'ndbk.motivation.4.name',
                role: 'ndbk.motivation.4.role',
                msg: 'ndbk.motivation.4.msg',
                type: 'ndb.admonish',
                score: 78,
                color: '#008b9d',
              },
            ].map((m, i) => (
              <div
                key={i}
                className="rounded-xl p-3 border"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: 'rgba(255,255,255,0.04)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ background: `${m.color}15`, border: `1px solid ${m.color}25` }}
                    >
                      <span className="text-[9px]" style={{ color: m.color }}>
                        {t(m.name).charAt(0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-white/60">{t(m.name)}</span>
                      <span className="text-[9px] text-white/20 ml-1.5">{t(m.role)}</span>
                    </div>
                  </div>
                  <span
                    className="text-[8px] px-1.5 py-0.5 rounded-full"
                    style={{
                      background:
                        m.type === 'ndb.encourage' ? 'rgba(0,255,200,0.1)' : 'rgba(0,139,157,0.1)',
                      color: m.type === 'ndb.encourage' ? '#00ffc8' : '#008b9d',
                      border: `1px solid ${m.type === 'ndb.encourage' ? 'rgba(0,255,200,0.2)' : 'rgba(0,139,157,0.2)'}`,
                    }}
                  >
                    {t(m.type)}
                  </span>
                </div>
                <p className="text-[10px] text-white/35 leading-relaxed">{t(m.msg)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[8px] text-white/15">{t('ndb.perfIndex')}</span>
                  <div className="flex-1 h-1 rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${m.score}%`, background: m.color }}
                    />
                  </div>
                  <span className="text-[9px] tabular-nums" style={{ color: m.color }}>
                    {m.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ===========================================================
// Tab: Monitor (效能监控大屏)
// ===========================================================
