import {
  Activity, ArrowDownRight, ArrowUpRight, BarChart3, Bot, Brain, ChevronRight, ClipboardList,
  Cpu, Download, Phone, PhoneCall, Shield, Users, Wifi,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Pie, PieChart, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

import { useApp, useLiveKPI } from "./app-context";
import { CyberTooltip } from "./cyber-tooltip";
import { useThemeColors } from "./hooks/use-theme-colors";
import { useI18n } from "./i18n-context";
import { NeonCard } from "./neon-card";

// ==========================================
// 数据驾驶舱 — Dashboard Page
// YYC³ 言语智能 Data Cockpit
// Phase 4: + Live KPI, refresh flash, export btn
// ==========================================

interface DashboardPageProps {
  onOpenExport?: () => void;
}

/**
 * Data Cockpit dashboard page.
 * Displays live KPI cards, 7-day trends, customer stage distribution,
 * hourly call heatmap, AI capability radar, and system health metrics.
 *
 * @param onOpenExport - Optional callback to open the data export modal.
 */
export function DashboardPage({ onOpenExport }: DashboardPageProps) {
  const { setActivePage, recentActivities } = useApp();
  const liveKPI = useLiveKPI();
  const { t } = useI18n();
  const tc = useThemeColors();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [flashIdx, setFlashIdx] = useState<number | null>(null);

  // Move all data arrays inside component to access t()
  const weeklyTrendData = useMemo(() => [
    { day: t("week.mon"), customers: 42, calls: 35, aiTasks: 128 },
    { day: t("week.tue"), customers: 56, calls: 48, aiTasks: 156 },
    { day: t("week.wed"), customers: 38, calls: 32, aiTasks: 112 },
    { day: t("week.thu"), customers: 67, calls: 58, aiTasks: 189 },
    { day: t("week.fri"), customers: 72, calls: 64, aiTasks: 201 },
    { day: t("week.sat"), customers: 45, calls: 28, aiTasks: 95 },
    { day: t("week.sun"), customers: 52, calls: 42, aiTasks: 167 },
  ], [t]);

  const customerStageData = useMemo(() => [
    { name: t("clm.stage.acquisition"), value: 342, color: tc.primary },
    { name: t("clm.stage.conversion"), value: 156, color: tc.secondary },
    { name: t("clm.stage.closing"), value: 89, color: tc.accent },
    { name: t("clm.stage.service"), value: 534, color: tc.success },
    { name: t("clm.stage.loyalty"), value: 267, color: tc.muted },
  ], [t, tc]);

  const hourlyCallData = useMemo(() => [
    { hour: "08", calls: 12 }, { hour: "09", calls: 28 },
    { hour: "10", calls: 45 }, { hour: "11", calls: 52 },
    { hour: "12", calls: 18 }, { hour: "13", calls: 35 },
    { hour: "14", calls: 48 }, { hour: "15", calls: 56 },
    { hour: "16", calls: 42 }, { hour: "17", calls: 30 },
    { hour: "18", calls: 15 }, { hour: "19", calls: 8 },
  ], []);

  const aiPerformanceData = useMemo(() => [
    { name: t("dash.intentRecog"), value: 96, fill: tc.primary },
    { name: t("dash.sentimentAnalysis"), value: 89, fill: tc.secondary },
    { name: t("dash.scriptMatch"), value: 92, fill: tc.accent },
    { name: t("dash.conversionPredict"), value: 85, fill: tc.success },
  ], [t, tc]);

  const quickNavItems = useMemo(() => [
    { label: t("clm.title"), page: "clm" as const, icon: Users, color: tc.secondary, desc: t("dash.clmDesc") },
    { label: t("call.title"), page: "aicall" as const, icon: Phone, color: tc.accent, desc: t("dash.aicallDesc") },
    { label: t("tools.title"), page: "tools" as const, icon: Brain, color: tc.success, desc: t("dash.toolsDesc") },
    { label: t("insights.title"), page: "insights" as const, icon: BarChart3, color: tc.primary, desc: t("dash.insightsDesc") },
  ], [t, tc]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = currentTime.toLocaleTimeString("zh-CN", { hour12: false });
  const dateStr = currentTime.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" });

  // Trigger flash animation when KPIs update
  useEffect(() => {
    if (liveKPI.refreshKey === 0) return;
    const idx = liveKPI.refreshKey % 4;
    setFlashIdx(idx);
    const timer = setTimeout(() => setFlashIdx(null), 800);
    return () => clearTimeout(timer);
  }, [liveKPI.refreshKey]);

  // Performance: memoize chart data (static)
  const chartData = useMemo(() => ({
    weeklyTrend: weeklyTrendData,
    customerStage: customerStageData,
    hourlyCalls: hourlyCallData,
    aiPerformance: aiPerformanceData,
  }), [weeklyTrendData, customerStageData, hourlyCallData, aiPerformanceData]);

  // Dynamic metric values from live KPI
  const liveMetrics = useMemo(() => [
    { label: t("dash.totalCustomers"), value: liveKPI.customers.toLocaleString(), icon: Users, color: tc.primary, change: "+12.5%", up: true, sublabel: t("dash.vsLastMonth") },
    { label: t("dash.todayCalls"), value: String(liveKPI.calls), icon: PhoneCall, color: tc.accent, change: `+${liveKPI.calls - 247}`, up: true, sublabel: t("dash.realtime") },
    { label: t("dash.aiTasksDone"), value: liveKPI.aiTasks.toLocaleString(), icon: Brain, color: tc.secondary, change: "+23.7%", up: true, sublabel: t("dash.weeklyAccum") },
    { label: t("dash.sysResponse"), value: `${liveKPI.responseMs}ms`, icon: Zap, color: tc.success, change: "-18%", up: true, sublabel: t("dash.avgLatency") },
  ], [liveKPI.customers, liveKPI.calls, liveKPI.aiTasks, liveKPI.responseMs, t, tc]);

  function formatTimeAgo(d: Date) {
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return t("common.justNow");
    if (diff < 3600000) return t("common.minutesAgo", { n: Math.floor(diff / 60000) });
    if (diff < 86400000) return t("common.hoursAgo", { n: Math.floor(diff / 3600000) });
    return t("common.daysAgo", { n: Math.floor(diff / 86400000) });
  }

  return (
    <div className="h-full overflow-y-auto p-6" style={{ scrollbarWidth: "none", animation: "spring-in 0.4s var(--spring-easing) both" }}>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="tracking-wider flex items-center gap-3"
            style={{ color: tc.primary, textShadow: `0 0 15px ${tc.alpha(tc.primary, 0.5)}` }}
          >
            <BarChart3 className="w-6 h-6" />
            {t("dash.title")}
          </h2>
          <p className="text-xs text-white/25 mt-1 tracking-wider">
            {t("dash.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Export button */}
          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] transition-all duration-300"
              style={{
                background: tc.alpha(tc.primary, 0.06),
                border: `1px solid ${tc.alpha(tc.primary, 0.2)}`,
                color: tc.primary,
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 12px ${tc.alpha(tc.primary, 0.2)}`; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
            >
              <Download className="w-3 h-3" />
              {t("dash.exportData")}
            </button>
          )}
          {/* Live clock */}
          <div className="text-right hidden sm:block">
            <p
              className="text-lg tracking-[0.15em] tabular-nums"
              style={{ color: tc.primary, textShadow: `0 0 10px ${tc.alpha(tc.primary, 0.4)}` }}
            >
              {timeStr}
            </p>
            <p className="text-[10px] text-white/20">{dateStr}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border"
            style={{
              background: tc.alpha(tc.primary, 0.05),
              borderColor: tc.alpha(tc.primary, 0.2),
            }}
          >
            <div className="w-2 h-2 rounded-full"
              style={{ background: tc.success, boxShadow: `0 0 6px ${tc.success}`, animation: "neon-pulse 2s ease-in-out infinite" }}
            />
            <span className="text-[10px] tracking-wider" style={{ color: tc.success }}>{t("dash.allNominal")}</span>
          </div>
        </div>
      </div>

      {/* === TOP METRICS with Live KPI === */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {liveMetrics.map((m, i) => {
          const Icon = m.icon;
          const isFlashing = flashIdx === i;
          return (
            <NeonCard key={i} color={m.color}>
              <div style={{ animation: isFlashing ? "value-pulse 0.6s ease-out" : "none" }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1">{m.label}</p>
                    <p className="text-2xl tabular-nums" style={{ color: m.color, textShadow: `0 0 12px ${m.color}50` }}>
                      {m.value}
                    </p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: `${m.color}12`,
                      border: `1px solid ${m.color}25`,
                      boxShadow: `0 0 10px ${m.color}15`,
                      animation: isFlashing ? "data-pulse-ring 0.8s ease-out" : "none",
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: `${m.color}90` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px]" style={{ color: m.up ? tc.success : tc.muted }}>
                    {m.up ? <ArrowUpRight className="w-3 h-3 inline" /> : <ArrowDownRight className="w-3 h-3 inline" />}
                    {m.change}
                  </span>
                  <span className="text-[9px] text-white/15">{m.sublabel}</span>
                </div>
              </div>
            </NeonCard>
          );
        })}
      </div>

      {/* === CHARTS ROW 1: Area + Pie === */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">
        {/* Weekly Trend Area Chart */}
        <div className="xl:col-span-2">
          <NeonCard color="#00f0ff" hoverable={false}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs text-white/40 uppercase tracking-wider">{t("dash.weeklyTrends")}</h3>
              <div className="flex items-center gap-3">
                {[
                  { label: t("dash.customers"), color: tc.primary },
                  { label: t("dash.calls"), color: tc.accent },
                  { label: t("dash.aiTasks"), color: tc.secondary },
                ].map((l, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: l.color, boxShadow: `0 0 4px ${l.color}` }} />
                    <span className="text-[9px] text-white/30">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-56 w-full" style={{ minHeight: '224px', minWidth: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.weeklyTrend}>
                  <defs>
                    <linearGradient id="dashGradCyan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={tc.primary} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={tc.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="dashGradYellow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={tc.accent} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={tc.accent} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="dashGradMagenta" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={tc.secondary} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={tc.secondary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }} axisLine={{ stroke: "rgba(255,255,255,0.05)" }} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.15)", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CyberTooltip />} />
                  <Area type="monotone" dataKey="customers" name={t("dash.customers")} stroke={tc.primary} strokeWidth={2} fill="url(#dashGradCyan)" />
                  <Area type="monotone" dataKey="calls" name={t("dash.calls")} stroke={tc.accent} strokeWidth={2} fill="url(#dashGradYellow)" />
                  <Area type="monotone" dataKey="aiTasks" name={t("dash.aiTasks")} stroke={tc.secondary} strokeWidth={1.5} fill="url(#dashGradMagenta)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </NeonCard>
        </div>

        {/* Customer Stage Pie Chart */}
        <NeonCard color="#00d4ff" hoverable={false}>
          <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">{t("dash.stageDist")}</h3>
          <div className="h-56 w-full flex items-center justify-center" style={{ minHeight: '224px', minWidth: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.customerStage}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.customerStage.map((entry, i) => (
                    <Cell key={`pie-cell-stage-${i}`} fill={entry.color} style={{ filter: `drop-shadow(0 0 6px ${entry.color}60)` }} />
                  ))}
                </Pie>
                <Tooltip content={<CyberTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {chartData.customerStage.map((s, i) => (
              <div key={`legend-stage-${i}`} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                <span className="text-[9px] text-white/30">{s.name} {s.value}</span>
              </div>
            ))}
          </div>
        </NeonCard>
      </div>

      {/* === CHARTS ROW 2: Bar + Radial + Quick Nav === */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-6">
        {/* Hourly Call Volume */}
        <NeonCard color="#00ffcc" hoverable={false}>
          <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">{t("dash.hourlyCalls")}</h3>
          <div className="h-44 w-full" style={{ minHeight: '176px', minWidth: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.hourlyCalls}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="hour" tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.15)", fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CyberTooltip />} />
                <Bar dataKey="calls" name={t("dash.callVolume")} radius={[4, 4, 0, 0]}>
                  {chartData.hourlyCalls.map((entry, i) => (
                    <Cell
                      key={`bar-cell-${entry.hour}-${i}`}
                      fill={`rgba(0,255,204,${0.3 + (entry.calls / 60) * 0.7})`}
                      style={{ filter: "drop-shadow(0 0 4px rgba(0,255,204,0.3))" }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </NeonCard>

        {/* AI Performance Radial */}
        <NeonCard color="#00ffc8" hoverable={false}>
          <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">{t("dash.aiMatrix")}</h3>
          <div className="h-44 w-full" style={{ minHeight: '176px', minWidth: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%" cy="50%"
                innerRadius="25%" outerRadius="90%"
                data={chartData.aiPerformance}
                startAngle={180} endAngle={0}
              >
                <RadialBar
                  background={{ fill: "rgba(255,255,255,0.03)" }}
                  dataKey="value"
                  cornerRadius={6}
                />
                <Tooltip content={<CyberTooltip />} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {chartData.aiPerformance.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: d.fill }} />
                <span className="text-[9px] text-white/30">{d.name} {d.value}%</span>
              </div>
            ))}
          </div>
        </NeonCard>

        {/* Quick Navigation */}
        <NeonCard color="#00f0ff" hoverable={false}>
          <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">{t("dash.quickNav")}</h3>
          <div className="space-y-2">
            {quickNavItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={i}
                  onClick={() => setActivePage(item.page)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-300 group"
                  style={{
                    background: "rgba(10,10,10,0.4)",
                    borderColor: `${item.color}15`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${item.color}40`;
                    e.currentTarget.style.boxShadow = `0 0 12px ${item.color}15`;
                    e.currentTarget.style.background = `${item.color}08`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${item.color}15`;
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.background = "rgba(10,10,10,0.4)";
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${item.color}12`, border: `1px solid ${item.color}25` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-xs text-white/60 group-hover:text-white/80 transition-colors">{item.label}</p>
                    <p className="text-[9px] text-white/20">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-white/10 group-hover:text-white/30 transition-colors" />
                </button>
              );
            })}
          </div>
        </NeonCard>
      </div>

      {/* === BOTTOM ROW: Activity Feed + System Status === */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Activity Feed */}
        <div className="xl:col-span-2">
          <NeonCard color="#00d4ff" hoverable={false}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs text-white/40 uppercase tracking-wider">{t("dash.activityFeed")}</h3>
              <span className="text-[9px] text-white/15">{t("dash.recentCount", { count: recentActivities.length })}</span>
            </div>
            <div className="space-y-1.5">
              {recentActivities.slice(0, 6).map((act, i) => {
                const typeIcons: Record<string, typeof Users> = {
                  customer: Users,
                  call: Phone,
                  system: Cpu,
                  ai: Bot,
                };
                const Icon = typeIcons[act.type] || Activity;
                return (
                  <div
                    key={act.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300"
                    style={{
                      background: i === 0 ? `${act.color}08` : "transparent",
                      borderLeft: i === 0 ? `2px solid ${act.color}60` : "2px solid transparent",
                      animation: `spring-in 0.3s var(--spring-easing) ${i * 0.05}s both`,
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${act.color}10`, border: `1px solid ${act.color}20` }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: `${act.color}80` }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/50 truncate">
                        <span style={{ color: `${act.color}90` }}>{act.action}</span>
                        <span className="text-white/20"> · </span>
                        {act.target}
                      </p>
                    </div>
                    <span className="text-[9px] text-white/15 shrink-0">{formatTimeAgo(act.timestamp)}</span>
                  </div>
                );
              })}
            </div>
          </NeonCard>
        </div>

        {/* System Health */}
        <NeonCard color="#00ffc8" hoverable={false}>
          <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">{t("dash.systemHealth")}</h3>
          <div className="space-y-4">
            {[
              { label: t("dash.cpuUsage"), value: 42, color: tc.primary, icon: Cpu },
              { label: t("dash.memUsage"), value: 67, color: tc.secondary, icon: Activity },
              { label: t("dash.netLatency"), value: liveKPI.responseMs, max: 100, unit: "ms", color: tc.success, icon: Wifi },
              { label: t("dash.securityScore"), value: 98, color: tc.accent, icon: Shield },
            ].map((sys, i) => {
              const Icon = sys.icon;
              const percent = sys.max ? (sys.value / sys.max) * 100 : sys.value;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3 h-3" style={{ color: `${sys.color}70` }} />
                      <span className="text-[10px] text-white/30">{sys.label}</span>
                    </div>
                    <span className="text-xs tabular-nums" style={{ color: sys.color }}>
                      {sys.value}{sys.unit || "%"}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${percent}%`,
                        background: `linear-gradient(90deg, ${sys.color}, ${sys.color}80)`,
                        boxShadow: `0 0 6px ${sys.color}50`,
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Uptime & Version */}
            <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex justify-between text-[10px] mb-1.5">
                <span className="text-white/20">{t("dash.uptime")}</span>
                <span style={{ color: tc.success }}>99.97% SLA</span>
              </div>
              <div className="flex justify-between text-[10px] mb-1.5">
                <span className="text-white/20">{t("dash.aiEngine")}</span>
                <span style={{ color: tc.primary }}>{t("dash.aiEngineVer")}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-white/20">{t("dash.dataSync")}</span>
                <span style={{ color: tc.secondary }}>{t("dash.dataSyncStatus")}</span>
              </div>
            </div>
          </div>
        </NeonCard>
      </div>

      {/* === Phase 8: Form Quick Stat === */}
      <FormDashboardCard onGoToForms={() => setActivePage("forms")} />
    </div>
  );
}

// Phase 8: Form submission mini-dashboard card
function FormDashboardCard({ onGoToForms }: { onGoToForms: () => void }) {
  const { t } = useI18n();
  const [count, setCount] = useState(0);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("yyc3_form_submissions");
      const d = raw ? JSON.parse(raw) : [];
      setCount(Array.isArray(d) ? d.length : 0);
    } catch { /* */ }
  }, []);

  return (
    <div className="mt-6">
      <NeonCard color="#008b9d" hoverable={false}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,139,157,0.1)", border: "1px solid rgba(0,139,157,0.25)" }}>
              <ClipboardList className="w-5 h-5 text-[#008b9d]" />
            </div>
            <div>
              <h3 className="text-xs text-white/50">{t("dash.smartFormSystem")}</h3>
              <p className="text-[10px] text-white/20">{t("dash.formStats", { count })}</p>
            </div>
          </div>
          <button
            onClick={onGoToForms}
            className="px-3 py-1.5 rounded-xl text-[10px] flex items-center gap-1 transition-all duration-300"
            style={{ background: "rgba(0,139,157,0.08)", border: "1px solid rgba(0,139,157,0.2)", color: "#008b9d" }}
          >
            {t("dash.goTo")}
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </NeonCard>
    </div>
  );
}