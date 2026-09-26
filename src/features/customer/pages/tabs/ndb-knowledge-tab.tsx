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
                title: '量子加密通信解决方案白皮书',
                type: '技术文档',
                views: 342,
                date: '3月12日',
                color: '#00f0ff',
              },
              {
                title: '2026Q1 产品更新说明',
                type: '产品资料',
                views: 567,
                date: '3月10日',
                color: '#00d4ff',
              },
              {
                title: '客户续约话术模板 v3.2',
                type: '话术库',
                views: 1204,
                date: '3月8日',
                color: '#00ffcc',
              },
              {
                title: '竞品分析报告：AI智能呼叫赛道',
                type: '市场分析',
                views: 298,
                date: '3月5日',
                color: '#00ffc8',
              },
              {
                title: '新人入职培训手册 2026版',
                type: '培训资料',
                views: 189,
                date: '3月1日',
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
                  <p className="text-[11px] text-white/60 truncate">{doc.title}</p>
                  <p className="text-[9px] text-white/20">
                    {doc.type} · {doc.date}
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
                name: '张伟',
                role: '高级销售',
                msg: '本周签约3单，连续突破记录！你的专业度和执行力令人钦佩，继续保持这股冲劲！',
                type: '鼓励',
                score: 96,
                color: '#00ffc8',
              },
              {
                name: '李娜',
                role: '客户经理',
                msg: '客户满意度评分4.9，全团队最高！你对客户的用心被看到了，期待下个月更精彩的表现！',
                type: '鼓励',
                score: 94,
                color: '#00f0ff',
              },
              {
                name: '王磊',
                role: '技术支持',
                msg: '本周工单解决率有所下降，建议优先处理高优先级工单。相信你的技术能力，调整节奏就好！',
                type: '诫勉',
                score: 72,
                color: '#00ffcc',
              },
              {
                name: '刘洋',
                role: '售前顾问',
                msg: '方案制作质量很高，但交付周期偏长。尝试用模板化��法提效，你一定能做到的！',
                type: '诫勉',
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
                        {m.name[0]}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-white/60">{m.name}</span>
                      <span className="text-[9px] text-white/20 ml-1.5">{m.role}</span>
                    </div>
                  </div>
                  <span
                    className="text-[8px] px-1.5 py-0.5 rounded-full"
                    style={{
                      background: m.type === '鼓励' ? 'rgba(0,255,200,0.1)' : 'rgba(0,139,157,0.1)',
                      color: m.type === '鼓励' ? '#00ffc8' : '#008b9d',
                      border: `1px solid ${m.type === '鼓励' ? 'rgba(0,255,200,0.2)' : 'rgba(0,139,157,0.2)'}`,
                    }}
                  >
                    {m.type}
                  </span>
                </div>
                <p className="text-[10px] text-white/35 leading-relaxed">{m.msg}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[8px] text-white/15">绩效指数</span>
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
