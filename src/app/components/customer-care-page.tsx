import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  Phone,
  Plus,
  Search,
  TrendingUp,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useThemeColors } from "./hooks/use-theme-colors";
import { useI18n } from "./i18n-context";
import { type ThemeMode, useThemeSwitcher } from "./theme-switcher-context";

// ==========================================
// Types & Interfaces
// ==========================================

interface Customer {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  status: "pending" | "inProgress" | "completed" | "archived";
  level: "vip" | "high" | "normal" | "low";
  source: "referral" | "online" | "offline" | "event";
  lastContact: string;
  nextFollowUp: string;
  responsible: string;
  aiScore: number;
  value: number;
}

// ==========================================
// Mock Data
// ==========================================

const generateMockCustomers = (): Customer[] => [
  {
    id: "C001",
    name: "张明远",
    company: "星际科技有限公司",
    phone: "138-0000-1234",
    email: "zhangmy@startech.com",
    status: "pending",
    level: "vip",
    source: "referral",
    lastContact: "2天前",
    nextFollowUp: "今天 14:00",
    responsible: "李经理",
    aiScore: 92,
    value: 580000,
  },
  {
    id: "C002",
    name: "王建华",
    company: "云端数据服务",
    phone: "139-1111-5678",
    email: "wangjh@clouddata.cn",
    status: "inProgress",
    level: "high",
    source: "online",
    lastContact: "昨天",
    nextFollowUp: "明天 10:30",
    responsible: "陈专员",
    aiScore: 85,
    value: 320000,
  },
  {
    id: "C003",
    name: "陈雅文",
    company: "智链网络科技",
    phone: "136-2222-9012",
    email: "chenyw@smartchain.net",
    status: "inProgress",
    level: "normal",
    source: "event",
    lastContact: "3天前",
    nextFollowUp: "今天 16:00",
    responsible: "张主管",
    aiScore: 78,
    value: 150000,
  },
  {
    id: "C004",
    name: "李思琪",
    company: "量子计算研究院",
    phone: "137-3333-3456",
    email: "lisiqi@quantum.edu",
    status: "completed",
    level: "high",
    source: "referral",
    lastContact: "1周前",
    nextFollowUp: "下周一",
    responsible: "王顾问",
    aiScore: 88,
    value: 420000,
  },
  {
    id: "C005",
    name: "赵鹏飞",
    company: "未来能源集团",
    phone: "135-4444-7890",
    email: "zhaopf@futureenergy.com",
    status: "pending",
    level: "vip",
    source: "offline",
    lastContact: "今天",
    nextFollowUp: "明天 9:00",
    responsible: "刘总监",
    aiScore: 95,
    value: 750000,
  },
  {
    id: "C006",
    name: "孙晓梅",
    company: "创新软件工作室",
    phone: "133-5555-2341",
    email: "sunxm@innov-soft.com",
    status: "inProgress",
    level: "normal",
    source: "online",
    lastContact: "5天前",
    nextFollowUp: "本周五",
    responsible: "李经理",
    aiScore: 72,
    value: 95000,
  },
  {
    id: "C007",
    name: "周志强",
    company: "数字化转型咨询",
    phone: "138-6666-8765",
    email: "zhouzq@digital-trans.cn",
    status: "archived",
    level: "low",
    source: "event",
    lastContact: "2周前",
    nextFollowUp: "-",
    responsible: "陈专员",
    aiScore: 62,
    value: 48000,
  },
  {
    id: "C008",
    name: "吴雨晴",
    company: "绿色能源科技",
    phone: "139-7777-4321",
    email: "wuyq@green-energy.com",
    status: "pending",
    level: "high",
    source: "referral",
    lastContact: "昨天",
    nextFollowUp: "今天 15:30",
    responsible: "张主管",
    aiScore: 89,
    value: 380000,
  },
];

const weeklyTrendData = [
  { day: "周一", customers: 245, followUps: 128, tasks: 89 },
  { day: "周二", customers: 268, followUps: 145, tasks: 102 },
  { day: "周三", customers: 291, followUps: 156, tasks: 115 },
  { day: "周四", customers: 312, followUps: 172, tasks: 128 },
  { day: "周五", customers: 335, followUps: 189, tasks: 142 },
  { day: "周六", customers: 298, followUps: 161, tasks: 108 },
  { day: "周日", customers: 276, followUps: 138, tasks: 95 },
];

// ==========================================
// Theme Helper Function
// ==========================================

const getThemeClasses = (theme: ThemeMode) => {
  if (theme === "liquidGlass") {
    return {
      // 容器
      container: "bg-transparent",
      header: "border-b border-white/10 backdrop-blur-md bg-white/5",

      // 卡片
      statCard: "glass-card",
      chartCard: "glass-card",

      // 搜索筛选
      searchContainer: "glass-card p-6",
      searchInput: "input-liquid w-full pl-11 pr-4 py-3",
      filterSelect: "input-liquid w-full px-4 py-3 appearance-none",

      // 表格
      tableContainer: "glass-card overflow-hidden",
      tableHeader: "backdrop-blur-sm bg-white/5",
      tableRow: "hover:bg-white/5 transition-all duration-300",

      // 按钮
      addButton: "btn-liquid px-4 py-2 flex items-center gap-2",
      resetButton: "text-[var(--liquid-primary)] hover:opacity-80 transition-opacity",
      actionButton: "p-1.5 rounded-lg backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 transition-all",

      // 文字颜色
      textPrimary: "text-white",
      textSecondary: "text-white/70",
      textMuted: "text-white/50",
      textIcon: "text-white/60",

      // 强调色
      accentPrimary: "text-[var(--liquid-primary)]",
      accentBorder: "border-[var(--liquid-primary)]",
    };
  }

  // Cyberpunk theme (default)
  return {
    // 容器
    container: "bg-[#0a0a0a]",
    header: "border-[#00f0ff]/30 bg-[#0f0f0f]/80",

    // 卡片
    statCard: "rounded-xl border p-5 relative overflow-hidden group transition-all duration-300",
    chartCard: "rounded-xl bg-[#0f0f0f]/50 border border-[#00f0ff]/20 p-6",

    // 搜索筛选
    searchContainer: "rounded-xl bg-[#0f0f0f]/50 border border-[#00f0ff]/20 p-4",
    searchInput: "w-full pl-11 pr-4 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#333]",
    filterSelect: "w-full px-4 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#333] appearance-none",

    // 表格
    tableContainer: "rounded-xl bg-[#0f0f0f]/50 border border-[#00f0ff]/20 overflow-hidden",
    tableHeader: "bg-[#1a1a1a] border-b border-[#00f0ff]/20",
    tableRow: "hover:bg-[#1a1a1a]/50 transition-colors",

    // 按钮
    addButton: "px-4 py-2 rounded-lg bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 border border-[#00f0ff]/30 text-[#00f0ff] transition-all duration-300 flex items-center gap-2",
    resetButton: "text-[#00f0ff] hover:text-[#00f0ff]/80 transition-colors",
    actionButton: "p-1.5 rounded-lg border transition-all",

    // 文字颜色
    textPrimary: "text-gray-100",
    textSecondary: "text-gray-300",
    textMuted: "text-gray-400",
    textIcon: "text-gray-400",

    // 强调色
    accentPrimary: "text-[#00f0ff]",
    accentBorder: "border-[#00f0ff]",
  };
};

// ==========================================
// Main Component
// ==========================================

/**
 * Customer Care Center page.
 * Displays a filterable, sortable customer list with status management,
 * AI scoring, source tracking, trend charts, and theme-aware styling
 * (supports both cyberpunk and liquid glass themes).
 */
export function CustomerCarePage() {
  const { t } = useI18n();
  const { theme } = useThemeSwitcher();
  const tc = useThemeColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const mockCustomers = useMemo(() => generateMockCustomers(), []);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return mockCustomers.filter((customer) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        customer.name.toLowerCase().includes(searchLower) ||
        customer.company.toLowerCase().includes(searchLower) ||
        customer.phone.includes(searchQuery) ||
        customer.email.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus =
        statusFilter === "all" || customer.status === statusFilter;

      // Level filter
      const matchesLevel =
        levelFilter === "all" || customer.level === levelFilter;

      // Source filter
      const matchesSource =
        sourceFilter === "all" || customer.source === sourceFilter;

      return matchesSearch && matchesStatus && matchesLevel && matchesSource;
    });
  }, [mockCustomers, searchQuery, statusFilter, levelFilter, sourceFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalCustomers = mockCustomers.length;
    const todayFollowUps = mockCustomers.filter(
      (c) => c.nextFollowUp.includes("今天") || c.nextFollowUp.includes("今日")
    ).length;
    const activeTasks = mockCustomers.filter(
      (c) => c.status === "pending" || c.status === "inProgress"
    ).length;
    const teamEfficiency = 87.5;

    return { totalCustomers, todayFollowUps, activeTasks, teamEfficiency };
  }, [mockCustomers]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-[#00ffcc]";
      case "inProgress":
        return "text-[#00f0ff]";
      case "completed":
        return "text-[#00ff88]";
      case "archived":
        return "text-[#888888]";
      default:
        return "text-gray-400";
    }
  };

  // Get level badge
  const getLevelBadge = (level: string) => {
    switch (level) {
      case "vip":
        return "bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30";
      case "high":
        return "bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/30";
      case "normal":
        return "bg-[#00ffcc]/20 text-[#00ffcc] border-[#00ffcc]/30";
      case "low":
        return "bg-gray-600/20 text-gray-400 border-gray-600/30";
      default:
        return "";
    }
  };

  const themeClasses = getThemeClasses(theme);

  return (
    <div className={`h-full flex flex-col ${themeClasses.container} ${themeClasses.textPrimary} overflow-hidden`}>
      {/* Header */}
      <header className={`shrink-0 ${themeClasses.header} backdrop-blur-sm`}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${themeClasses.accentPrimary} flex items-center gap-3`}>
                <Users className="size-7" />
                {t("care.title")}
              </h1>
              <p className={`text-sm ${themeClasses.textMuted} mt-1`}>{t("care.subtitle")}</p>
            </div>
            <button className={themeClasses.addButton}>
              <UserPlus className="size-4" />
              {t("care.add")}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Customers */}
            <div className={`rounded-xl ${themeClasses.statCard}`}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: tc.alpha(tc.primary, 0.05) }} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <Users className="size-8" style={{ color: tc.primary }} />
                  <span className="text-xs text-gray-400">{t("care.newToday")}: +12</span>
                </div>
                <p className="text-sm text-gray-400 mb-1">{t("care.totalCustomers")}</p>
                <p className="text-3xl" style={{ color: tc.primary }}>{stats.totalCustomers}</p>
              </div>
            </div>

            {/* Today Follow-ups */}
            <div className={`rounded-xl ${themeClasses.statCard}`}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: tc.alpha(tc.secondary, 0.05) }} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <Calendar className="size-8" style={{ color: tc.secondary }} />
                  <span className="text-xs flex items-center gap-1" style={{ color: tc.secondary }}>
                    <AlertCircle className="size-3" />
                    {t("care.urgentCases", { count: 3 })}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-1">{t("care.todayFollowUps")}</p>
                <p className="text-3xl" style={{ color: tc.secondary }}>{stats.todayFollowUps}</p>
              </div>
            </div>

            {/* Active Tasks */}
            <div className={`rounded-xl ${themeClasses.statCard}`}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: tc.alpha(tc.accent, 0.05) }} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <CheckCircle2 className="size-8" style={{ color: tc.accent }} />
                  <span className="text-xs text-gray-400">{t("care.completed")}: 45</span>
                </div>
                <p className="text-sm text-gray-400 mb-1">{t("care.activeTasks")}</p>
                <p className="text-3xl" style={{ color: tc.accent }}>{stats.activeTasks}</p>
              </div>
            </div>

            {/* Team Efficiency */}
            <div className={`rounded-xl ${themeClasses.statCard}`}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: tc.alpha(tc.success, 0.05) }} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <TrendingUp className="size-8" style={{ color: tc.success }} />
                  <span className="text-xs" style={{ color: tc.success }}>↑ 12.5%</span>
                </div>
                <p className="text-sm text-gray-400 mb-1">{t("care.teamEfficiency")}</p>
                <p className="text-3xl" style={{ color: tc.success }}>{stats.teamEfficiency}%</p>
              </div>
            </div>
          </div>

          {/* Weekly Trend Chart */}
          <div className={`rounded-xl ${themeClasses.chartCard}`}>
            <h3 className="text-lg mb-4 flex items-center gap-2" style={{ color: tc.primary }}>
              <TrendingUp className="size-5" />
              {t("care.trendChart")}
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weeklyTrendData}>
                <defs>
                  <linearGradient id="customersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={tc.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={tc.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="followUpsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={tc.secondary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={tc.secondary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="tasksGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={tc.accent} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={tc.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" />
                <YAxis stroke="rgba(255,255,255,0.2)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tc.isCyberpunk ? "#1a1a1a" : "rgba(10,15,10,0.92)",
                    border: `1px solid ${tc.alpha(tc.primary, 0.3)}`,
                    borderRadius: "12px",
                    backdropFilter: tc.backdropFilter,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="customers"
                  stroke={tc.primary}
                  fillOpacity={1}
                  fill="url(#customersGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="followUps"
                  stroke={tc.secondary}
                  fillOpacity={1}
                  fill="url(#followUpsGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="tasks"
                  stroke={tc.accent}
                  fillOpacity={1}
                  fill="url(#tasksGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Search & Filter Bar */}
          <div className={themeClasses.searchContainer}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="lg:col-span-2 relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 size-5 ${themeClasses.textIcon}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("care.searchPlaceholder")}
                  className={`${themeClasses.searchInput} ${themeClasses.textPrimary} placeholder:text-white/40 focus:outline-none transition-all`}
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className={`absolute left-3 top-1/2 -translate-y-1/2 size-5 ${themeClasses.textIcon} pointer-events-none`} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`${themeClasses.filterSelect} pl-11 ${themeClasses.textPrimary} focus:outline-none transition-all`}
                >
                  <option value="all">{t("care.allStatus")}</option>
                  <option value="pending">{t("care.status.pending")}</option>
                  <option value="inProgress">{t("care.status.inProgress")}</option>
                  <option value="completed">{t("care.status.completed")}</option>
                  <option value="archived">{t("care.status.archived")}</option>
                </select>
              </div>

              {/* Level Filter */}
              <div className="relative">
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className={`${themeClasses.filterSelect} ${themeClasses.textPrimary} focus:outline-none transition-all`}
                >
                  <option value="all">{t("care.allLevels")}</option>
                  <option value="vip">{t("care.level.vip")}</option>
                  <option value="high">{t("care.level.high")}</option>
                  <option value="normal">{t("care.level.normal")}</option>
                  <option value="low">{t("care.level.low")}</option>
                </select>
              </div>
            </div>

            {/* Result Count */}
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className={themeClasses.textMuted}>
                {t("care.recordCount", { count: filteredCustomers.length })}
              </span>
              {(searchQuery || statusFilter !== "all" || levelFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setLevelFilter("all");
                    setSourceFilter("all");
                  }}
                  className={themeClasses.resetButton}
                >
                  {t("care.reset")}
                </button>
              )}
            </div>
          </div>

          {/* Customer List */}
          <div className={themeClasses.tableContainer}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={themeClasses.tableHeader}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${themeClasses.accentPrimary}`}>
                      {t("care.name")}
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${themeClasses.accentPrimary}`}>
                      {t("care.company")}
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${themeClasses.accentPrimary}`}>
                      {t("care.phone")}
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${themeClasses.accentPrimary}`}>
                      {t("care.status")}
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${themeClasses.accentPrimary}`}>
                      {t("care.level")}
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${themeClasses.accentPrimary}`}>
                      {t("care.lastContact")}
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${themeClasses.accentPrimary}`}>
                      {t("care.nextFollowUp")}
                    </th>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${themeClasses.accentPrimary}`}>
                      {t("care.responsible")}
                    </th>
                    <th className={`px-4 py-3 text-center text-sm font-semibold ${themeClasses.accentPrimary}`}>
                      {t("care.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className={`group ${themeClasses.tableRow}`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="size-8 rounded-full flex items-center justify-center text-sm"
                            style={{ background: tc.alpha(tc.primary, 0.2), color: tc.primary }}
                          >
                            {customer.name.charAt(0)}
                          </div>
                          <span className={`text-sm font-medium ${themeClasses.textPrimary}`}>
                            {customer.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className={`flex items-center gap-2 text-sm ${themeClasses.textSecondary}`}>
                          <Building2 className={`size-4 ${themeClasses.textMuted}`} />
                          {customer.company}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className={`flex items-center gap-2 text-sm ${themeClasses.textSecondary}`}>
                          <Phone className={`size-4 ${themeClasses.textMuted}`} />
                          {customer.phone}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getStatusColor(customer.status)}`}>
                          {t(`care.status.${customer.status}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getLevelBadge(customer.level)}`}
                        >
                          {t(`care.level.${customer.level}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className={`flex items-center gap-2 text-sm ${themeClasses.textMuted}`}>
                          <Clock className="size-4" />
                          {customer.lastContact}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-sm font-medium" style={{ color: tc.accent }}>
                          {customer.nextFollowUp}
                        </span>
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm ${themeClasses.textSecondary}`}>
                        {customer.responsible}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className={themeClasses.actionButton}
                            style={{
                              background: tc.alpha(tc.primary, 0.1),
                              borderColor: tc.alpha(tc.primary, 0.3),
                              color: tc.primary,
                            }}
                            title={t("care.viewDetails")}
                          >
                            <Eye className="size-4" />
                          </button>
                          <button
                            className={themeClasses.actionButton}
                            style={{
                              background: tc.alpha(tc.secondary, 0.1),
                              borderColor: tc.alpha(tc.secondary, 0.3),
                              color: tc.secondary,
                            }}
                            title={t("care.addFollowUp")}
                          >
                            <Plus className="size-4" />
                          </button>
                          <button
                            className={themeClasses.actionButton}
                            style={{
                              background: tc.alpha(tc.accent, 0.1),
                              borderColor: tc.alpha(tc.accent, 0.3),
                              color: tc.accent,
                            }}
                            title={t("care.assignTask")}
                          >
                            <Zap className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredCustomers.length === 0 && (
              <div className="py-12 text-center">
                <Users className={`size-12 mx-auto mb-3 ${themeClasses.textMuted}`} />
                <p className={themeClasses.textMuted}>{t("common.noData")}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}