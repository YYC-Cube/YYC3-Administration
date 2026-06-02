import {
  Activity, AlertCircle, ArrowDownRight, ArrowUpRight, Brain, Check,
  CheckCircle2, ChevronRight, Code, Copy, Cpu,
  Database, FileSearch, Gauge, HardDrive,
  Loader2, Lock, Network, Pause, Play, RotateCcw,
  Shield, Sparkles, Terminal, X, Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useApp } from "./app-context";
import { useThemeColors } from "./hooks/use-theme-colors";
import { useI18n } from "./i18n-context";
import { NeonCard } from "./neon-card";

// ==========================================
// YYC³ AI 工具矩阵 — Interactive Tool Page
// Phase 2A: 工具实际化 · 模拟执行 · 实时反馈
// ==========================================

/** Execution status of an AI tool task. */
type ToolStatus = "idle" | "running" | "success" | "error";

/** A single log entry from an AI tool execution. */
interface ToolLogEntry {
  timestamp: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

/** Configuration for each AI tool with simulation data. */
interface ToolConfig {
  id: string;
  nameKey: string;
  descKey: string;
  icon: typeof Cpu;
  color: string;
  detailIcon: typeof Code;
  metrics: { label: string; value: string; change: string; positive: boolean }[];
  capabilities: string[];
  simulationLogs: string[];
  resultSummary: string;
}

const toolConfigs: ToolConfig[] = [
  {
    id: "code-gen",
    nameKey: "tools.codeGen",
    descKey: "tools.codeGenDesc",
    icon: Cpu,
    color: "#00f0ff",
    detailIcon: Code,
    metrics: [
      { label: "生成效率", value: "3.2s", change: "-0.8s", positive: true },
      { label: "代码质量", value: "96.4%", change: "+2.1%", positive: true },
      { label: "覆盖率", value: "89%", change: "+5%", positive: true },
      { label: "Bug 率", value: "0.3%", change: "-0.2%", positive: true },
    ],
    capabilities: ["React/TS 代码生成", "API 接口自动生成", "单元测试生成", "代码重构优化", "文档自动生成"],
    simulationLogs: [
      "正在分析项目结构...",
      "检测到 TypeScript 配置: strict mode",
      "扫描已有组件: 32 个 TSX 文件",
      "构建 AST 语法树...",
      "AI 模型加载: YYC³-Ultra v4.2",
      "生成代码模板 (React + Hooks)...",
      "应用 ESLint 规则校验...",
      "TypeScript 类型检查: 0 errors",
      "代码质量评分: 96.4/100",
      "生成完成 · 输出 3 个文件",
    ],
    resultSummary: "已生成 3 个高质量 TypeScript React 组件，通过全部类型检查和 ESLint 规则。代码覆盖率 89%，无安全漏洞。",
  },
  {
    id: "data-flow",
    nameKey: "tools.dataFlow",
    descKey: "tools.dataFlowDesc",
    icon: Activity,
    color: "#00d4ff",
    detailIcon: Network,
    metrics: [
      { label: "数据吞吐", value: "12.8K/s", change: "+2.1K", positive: true },
      { label: "延迟", value: "3.2ms", change: "-1.8ms", positive: true },
      { label: "异常率", value: "0.01%", change: "-0.02%", positive: true },
      { label: "流水线", value: "8 active", change: "+2", positive: true },
    ],
    capabilities: ["实时数据流监控", "异常检测告警", "流量预测分析", "管道健康评估", "自动扩缩容"],
    simulationLogs: [
      "启动数据流监控服务...",
      "连接 8 个数据管道...",
      "实时吞吐量: 12,847 records/s",
      "延迟检测: P50=1.2ms P99=3.2ms",
      "异常检测模型加载完成",
      "扫描最近 1 小时数据: 46.2M 条",
      "发现 1 个潜在瓶颈: Pipeline #3",
      "自动优化建议已生成",
      "流量预测: 未来 4h 峰值 15.2K/s",
      "监控报告已保存",
    ],
    resultSummary: "8 条数据管道运行正常，检测到 Pipeline #3 存在潜在瓶颈，已自动生成优化建议。预测未来 4 小时流量峰值为 15.2K/s。",
  },
  {
    id: "security",
    nameKey: "tools.security",
    descKey: "tools.securityDesc",
    icon: Shield,
    color: "#00ffcc",
    detailIcon: Lock,
    metrics: [
      { label: "安全评分", value: "A+", change: "+1级", positive: true },
      { label: "漏洞数", value: "0", change: "-3", positive: true },
      { label: "防护率", value: "99.97%", change: "+0.02%", positive: true },
      { label: "扫描次数", value: "1,247", change: "+89", positive: true },
    ],
    capabilities: ["代码漏洞扫描", "依赖安全审计", "API 安全检测", "敏感数据检测", "合规性检查"],
    simulationLogs: [
      "启动安全扫描引擎...",
      "加载漏洞数据库: CVE 2024-2025",
      "扫描源代码: 32 文件 / 8,420 行",
      "依赖包审计: 47 packages",
      "检测 SQL 注入风险: 0",
      "检测 XSS 风险: 0",
      "检测敏感数据泄露: 0",
      "API 端点安全评估: 全部通过",
      "OWASP Top 10 合规检查: PASS",
      "安全评级: A+ · 0 威胁",
    ],
    resultSummary: "全量安全扫描完成：32 文件、47 依赖包均通过检查。0 漏洞、0 敏感数据泄露，OWASP Top 10 全部合规。安全评级 A+。",
  },
  {
    id: "knowledge",
    nameKey: "tools.knowledge",
    descKey: "tools.knowledgeDesc",
    icon: Brain,
    color: "#00ffc8",
    detailIcon: FileSearch,
    metrics: [
      { label: "知识��点", value: "24.6K", change: "+1.2K", positive: true },
      { label: "关联度", value: "94.8%", change: "+3.1%", positive: true },
      { label: "查询速度", value: "8ms", change: "-4ms", positive: true },
      { label: "更新频率", value: "实时", change: "实时", positive: true },
    ],
    capabilities: ["知识图谱构建", "语义搜索引擎", "实体关系抽取", "知识推理引擎", "自动问答系统"],
    simulationLogs: [
      "初始化知识图谱引擎...",
      "加载知识库: 24,600 个节点",
      "构建实体关系索引...",
      "语义向量化处理: 2,048 维",
      "关联分析: 发现 312 个新关联",
      "知识推理: 生成 45 条推断",
      "验证推断准确率: 94.8%",
      "更新图谱结构...",
      "索引重建完成: 8ms 查询延迟",
      "知识图谱更新完成",
    ],
    resultSummary: "知识图谱更新完成：24.6K 节点，发现 312 个新实体关联，生成 45 条推断（准确率 94.8%）。查询延迟优化至 8ms。",
  },
  {
    id: "perf",
    nameKey: "tools.perf",
    descKey: "tools.perfDesc",
    icon: Zap,
    color: "#008b9d",
    detailIcon: Gauge,
    metrics: [
      { label: "FPS", value: "60", change: "+0", positive: true },
      { label: "加载时间", value: "1.2s", change: "-0.4s", positive: true },
      { label: "内存", value: "128MB", change: "-32MB", positive: true },
      { label: "优化项", value: "7", change: "+3", positive: true },
    ],
    capabilities: ["性能瓶颈诊断", "内存泄漏检测", "渲染优化建议", "Bundle 分析", "Lighthouse 评估"],
    simulationLogs: [
      "启动性能分析引擎...",
      "监测 FPS: 稳定 60fps",
      "内存快照采集...",
      "检测内存泄漏: 0 项",
      "Bundle 大小分析: 847KB (gzipped)",
      "发现 3 个懒加载优化机会",
      "发现 2 个重复渲染组件",
      "发现 2 个未使用导入",
      "生成优化方案: 预估提升 18%",
      "性能报告已生成",
    ],
    resultSummary: "性能分析完成：FPS 稳定 60，无内存泄漏。发现 7 个优化机会（3 懒加载、2 重复渲染、2 未使用导入），预估优化后提升 18%。",
  },
  {
    id: "warehouse",
    nameKey: "tools.warehouse",
    descKey: "tools.warehouseDesc",
    icon: Database,
    color: "#00f0ff",
    detailIcon: HardDrive,
    metrics: [
      { label: "数据量", value: "2.4TB", change: "+128GB", positive: true },
      { label: "查询延迟", value: "45ms", change: "-12ms", positive: true },
      { label: "可用性", value: "99.99%", change: "+0.01%", positive: true },
      { label: "分片数", value: "16", change: "+4", positive: true },
    ],
    capabilities: ["分布式存储管理", "数据分片优化", "查询性能调优", "自动备份恢复", "数据生命周期"],
    simulationLogs: [
      "连接数据仓库集群...",
      "节点状态: 16/16 在线",
      "数据量统计: 2.4TB / 3,847万条",
      "分片健康检查: 全部正常",
      "查询优化器启动...",
      "索引分析: 发现 4 个低效索引",
      "自动重建索引: idx_customer_stage",
      "查询延迟优化: 57ms → 45ms",
      "备份状态: 最近备份 2h 前",
      "数据仓库状态报告已生成",
    ],
    resultSummary: "数据仓库集群 16 节点全部在线，总数据量 2.4TB。优化 4 个低效索引后查询延迟降至 45ms，可用性 99.99%。",
  },
];

/**
 * Enhanced AI Tools page with interactive tool panels.
 * Each tool can be "launched" to run a simulated execution with
 * real-time log streaming, metrics dashboard, and result summary.
 */
export function AIToolsPage() {
  const { t } = useI18n();
  const { addNotification, addActivity } = useApp();
  const tc = useThemeColors();
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [toolStates, setToolStates] = useState<Record<string, ToolStatus>>({});
  const [toolLogs, setToolLogs] = useState<Record<string, ToolLogEntry[]>>({});
  const [copiedResult, setCopiedResult] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  const activeTool = toolConfigs.find(tc => tc.id === selectedTool);

  // Auto-scroll log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [toolLogs]);

  const runTool = useCallback((toolId: string) => {
    const config = toolConfigs.find(tc => tc.id === toolId);
    if (!config) return;

    setToolStates(prev => ({ ...prev, [toolId]: "running" }));
    setToolLogs(prev => ({ ...prev, [toolId]: [] }));

    // Simulate log streaming
    config.simulationLogs.forEach((msg, i) => {
      setTimeout(() => {
        const entry: ToolLogEntry = {
          timestamp: new Date().toISOString().slice(11, 23),
          message: msg,
          type: i === config.simulationLogs.length - 1 ? "success" : "info",
        };
        setToolLogs(prev => ({
          ...prev,
          [toolId]: [...(prev[toolId] || []), entry],
        }));

        // Final log → mark success
        if (i === config.simulationLogs.length - 1) {
          setTimeout(() => {
            setToolStates(prev => ({ ...prev, [toolId]: "success" }));
            addNotification({
              title: `${t(config.nameKey)} 执行完成`,
              message: config.resultSummary.slice(0, 60) + "…",
              type: "success",
              color: config.color,
            });
            addActivity({
              action: "AI 工具执行",
              target: `${t(config.nameKey)} · 执行成功`,
              type: "ai",
              color: config.color,
            });
          }, 300);
        }
      }, (i + 1) * 600);
    });
  }, [t, addNotification, addActivity]);

  const resetTool = useCallback((toolId: string) => {
    setToolStates(prev => ({ ...prev, [toolId]: "idle" }));
    setToolLogs(prev => ({ ...prev, [toolId]: [] }));
  }, []);

  // Grid view
  if (!activeTool) {
    return (
      <div className="h-full overflow-y-auto p-6" style={{ scrollbarWidth: "none", animation: "spring-in 0.4s var(--spring-easing) both" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="tracking-wider flex items-center gap-3" style={{ color: tc.success, textShadow: `0 0 15px ${tc.alpha(tc.success, 0.5)}` }}>
              <Sparkles className="w-6 h-6" />
              {t("tools.title")}
            </h2>
            <p className="text-xs text-white/25 mt-1 tracking-wider">AI Tool Matrix — Phase 2A Interactive Tools</p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="px-3 py-1.5 rounded-xl text-[10px] flex items-center gap-1.5"
              style={{ background: tc.alpha(tc.success, 0.06), border: `1px solid ${tc.alpha(tc.success, 0.15)}`, color: tc.success }}
            >
              <CheckCircle2 className="w-3 h-3" />
              {toolConfigs.length} 工具就绪
            </div>
          </div>
        </div>

        {/* Overview stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {[
            { label: "工具总数", value: "6", icon: Cpu, color: "#00f0ff", sub: "全部在线" },
            { label: "今日执行", value: "47", icon: Play, color: "#00ffc8", sub: "+12 vs 昨日" },
            { label: "成功率", value: "99.4%", icon: CheckCircle2, color: "#00ffcc", sub: "近 7 天" },
            { label: "平均耗时", value: "4.8s", icon: Zap, color: "#00d4ff", sub: "-1.2s 优化" },
          ].map((m, i) => {
            const Icon = m.icon;
            return (
              <NeonCard key={i} color={m.color}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1">{m.label}</p>
                    <p className="text-xl" style={{ color: m.color, textShadow: `0 0 10px ${m.color}50` }}>{m.value}</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${m.color}10`, border: `1px solid ${m.color}20` }}>
                    <Icon className="w-4 h-4" style={{ color: `${m.color}80` }} />
                  </div>
                </div>
                <p className="text-[10px] mt-2 text-white/20">{m.sub}</p>
              </NeonCard>
            );
          })}
        </div>

        {/* Tool Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {toolConfigs.map((tool, i) => {
            const Icon = tool.icon;
            const status = toolStates[tool.id] || "idle";
            return (
              <NeonCard key={tool.id} color={tool.color}>
                <div className="flex items-start gap-4 mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                    style={{
                      background: `${tool.color}15`,
                      border: `1px solid ${tool.color}30`,
                      boxShadow: `0 0 10px ${tool.color}20`,
                      animation: status === "running" ? "neon-pulse 1.5s ease-in-out infinite" : "none",
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: tool.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white/90 mb-0.5" style={{ textShadow: `0 0 8px ${tool.color}40` }}>{t(tool.nameKey)}</h3>
                    <p className="text-xs text-white/40 leading-relaxed">{t(tool.descKey)}</p>
                  </div>
                </div>

                {/* Capabilities */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {tool.capabilities.slice(0, 3).map((cap, j) => (
                    <span
                      key={j}
                      className="text-[9px] px-2 py-0.5 rounded-full"
                      style={{ background: `${tool.color}08`, color: `${tool.color}90`, border: `1px solid ${tool.color}20` }}
                    >
                      {cap}
                    </span>
                  ))}
                  {tool.capabilities.length > 3 && (
                    <span className="text-[9px] text-white/20">+{tool.capabilities.length - 3}</span>
                  )}
                </div>

                {/* Status Badge + Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: status === "running" ? tool.color : status === "success" ? "#00ffc8" : "rgba(255,255,255,0.15)",
                        boxShadow: status === "running" ? `0 0 6px ${tool.color}` : status === "success" ? "0 0 6px #00ffc8" : "none",
                        animation: status === "running" ? "neon-pulse 1s ease-in-out infinite" : "none",
                      }}
                    />
                    <span className="text-[10px]" style={{
                      color: status === "running" ? tool.color : status === "success" ? "#00ffc8" : "rgba(255,255,255,0.25)",
                    }}>
                      {status === "running" ? "执行中…" : status === "success" ? "已完成" : "就绪"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedTool(tool.id)}
                      className="px-3 py-1.5 rounded-xl text-[10px] transition-all duration-300 flex items-center gap-1"
                      style={{
                        background: `${tool.color}08`,
                        border: `1px solid ${tool.color}25`,
                        color: tool.color,
                      }}
                    >
                      详情 <ChevronRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => { setSelectedTool(tool.id); runTool(tool.id); }}
                      disabled={status === "running"}
                      className="px-3 py-1.5 rounded-xl text-[10px] transition-all duration-300 flex items-center gap-1 disabled:opacity-40"
                      style={{
                        background: `linear-gradient(135deg, ${tool.color}20, rgba(0,212,255,0.15))`,
                        border: `1px solid ${tool.color}40`,
                        color: tool.color,
                        boxShadow: `0 0 8px ${tool.color}15`,
                      }}
                    >
                      <Play className="w-3 h-3" /> {t("tools.launch")}
                    </button>
                  </div>
                </div>
              </NeonCard>
            );
          })}
        </div>
      </div>
    );
  }

  // Detail view
  const ToolIcon = activeTool.icon;
  const DetailIcon = activeTool.detailIcon;
  const status = toolStates[activeTool.id] || "idle";
  const logs = toolLogs[activeTool.id] || [];

  return (
    <div className="h-full overflow-y-auto p-6" style={{ scrollbarWidth: "none", animation: "spring-in 0.4s var(--spring-easing) both" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedTool(null)}
            className="p-2 rounded-xl transition-colors hover:bg-white/5"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <ChevronRight className="w-4 h-4 text-white/30 rotate-180" />
          </button>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: `${activeTool.color}15`,
              border: `1px solid ${activeTool.color}30`,
              boxShadow: `0 0 12px ${activeTool.color}20`,
            }}
          >
            <ToolIcon className="w-5 h-5" style={{ color: activeTool.color }} />
          </div>
          <div>
            <h2 className="tracking-wider flex items-center gap-2" style={{ color: activeTool.color, textShadow: `0 0 15px ${activeTool.color}50` }}>
              {t(activeTool.nameKey)}
            </h2>
            <p className="text-xs text-white/25 mt-0.5">{t(activeTool.descKey)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status === "success" && (
            <button
              onClick={() => resetTool(activeTool.id)}
              className="px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all duration-300"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
            >
              <RotateCcw className="w-3 h-3" /> 重置
            </button>
          )}
          <button
            onClick={() => status === "idle" || status === "success" ? runTool(activeTool.id) : undefined}
            disabled={status === "running"}
            className="px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all duration-300 disabled:opacity-40"
            style={{
              background: `linear-gradient(135deg, ${activeTool.color}20, rgba(0,212,255,0.15))`,
              border: `1px solid ${activeTool.color}50`,
              color: activeTool.color,
              boxShadow: `0 0 12px ${activeTool.color}20`,
            }}
          >
            {status === "running" ? (
              <><Loader2 className="w-3.5 h-3.5" style={{ animation: "icon-spin 1s linear infinite" }} /> 执行中…</>
            ) : (
              <><Play className="w-3.5 h-3.5" /> 启动工具</>
            )}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {activeTool.metrics.map((m, i) => (
          <NeonCard key={i} color={activeTool.color}>
            <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1">{m.label}</p>
            <p className="text-xl" style={{ color: activeTool.color, textShadow: `0 0 10px ${activeTool.color}50` }}>{m.value}</p>
            <p className="text-[10px] mt-2 flex items-center gap-1" style={{ color: m.positive ? "#00ffc8" : "#005f73" }}>
              {m.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {m.change}
            </p>
          </NeonCard>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Execution Log */}
        <div className="xl:col-span-2">
          <NeonCard color={activeTool.color} hoverable={false}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs text-white/40 uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5" />
                执行日志 · Execution Log
              </h3>
              {status === "running" && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: activeTool.color, animation: "neon-pulse 1s ease-in-out infinite" }} />
                  <span className="text-[10px]" style={{ color: activeTool.color }}>LIVE</span>
                </div>
              )}
            </div>

            <div
              className="rounded-xl p-4 overflow-y-auto"
              style={{
                background: "rgba(0,0,0,0.5)",
                border: `1px solid ${activeTool.color}15`,
                minHeight: 280,
                maxHeight: 400,
                scrollbarWidth: "none",
                fontFamily: "'Fira Code', monospace",
              }}
            >
              {logs.length === 0 && status === "idle" ? (
                <div className="flex flex-col items-center justify-center h-48 text-center">
                  <DetailIcon className="w-10 h-10 mb-3" style={{ color: `${activeTool.color}30` }} />
                  <p className="text-sm text-white/20 mb-1">点击「启动工具」开始执行</p>
                  <p className="text-[10px] text-white/10">AI 将自动分析并生成执行报告</p>
                </div>
              ) : (
                <>
                  {logs.map((log, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 mb-1.5"
                      style={{ animation: `spring-in 0.2s var(--spring-easing) both` }}
                    >
                      <span className="text-[9px] text-white/15 shrink-0 w-20">{log.timestamp}</span>
                      <span className="text-[9px] shrink-0" style={{
                        color: log.type === "success" ? "#00ffc8" : log.type === "warning" ? "#00d4ff" : log.type === "error" ? "#005f73" : `${activeTool.color}80`,
                      }}>
                        {log.type === "success" ? "✓" : log.type === "warning" ? "⚠" : log.type === "error" ? "✗" : "▸"}
                      </span>
                      <span className="text-[11px]" style={{
                        color: log.type === "success" ? "#00ffc8" : "rgba(255,255,255,0.55)",
                      }}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                  {status === "running" && (
                    <div className="flex items-center gap-2 mt-2" style={{ animation: "neon-pulse 1.5s ease-in-out infinite" }}>
                      <span className="text-[9px] text-white/15 w-20">&nbsp;</span>
                      <Loader2 className="w-3 h-3" style={{ color: activeTool.color, animation: "icon-spin 1s linear infinite" }} />
                      <span className="text-[10px]" style={{ color: `${activeTool.color}60` }}>处理中…</span>
                    </div>
                  )}
                  <div ref={logEndRef} />
                </>
              )}
            </div>

            {/* Result Summary */}
            {status === "success" && (
              <div
                className="mt-4 rounded-xl p-4 border"
                style={{
                  background: "rgba(0,255,200,0.03)",
                  borderColor: "rgba(0,255,200,0.15)",
                  animation: "spring-in 0.4s var(--spring-easing) both",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00ffc8]" style={{ filter: "drop-shadow(0 0 4px #00ffc8)" }} />
                    <span className="text-xs text-[#00ffc8]">执行完成 · Result Summary</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeTool.resultSummary);
                      setCopiedResult(true);
                      setTimeout(() => setCopiedResult(false), 2000);
                    }}
                    className="text-[9px] px-2 py-1 rounded-lg flex items-center gap-1 transition-all"
                    style={{ background: "rgba(0,255,200,0.06)", border: "1px solid rgba(0,255,200,0.15)", color: "#00ffc8" }}
                  >
                    {copiedResult ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                    {copiedResult ? "已复制" : "复制"}
                  </button>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">{activeTool.resultSummary}</p>
              </div>
            )}
          </NeonCard>
        </div>

        {/* Right Panel: Capabilities + Info */}
        <div className="space-y-5">
          <NeonCard color={activeTool.color} hoverable={false}>
            <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">功能列表 · Capabilities</h3>
            <div className="space-y-2">
              {activeTool.capabilities.map((cap, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-300"
                  style={{
                    background: `${activeTool.color}05`,
                    border: `1px solid ${activeTool.color}10`,
                    animation: `spring-in 0.3s var(--spring-easing) ${i * 0.05}s both`,
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: activeTool.color, boxShadow: `0 0 4px ${activeTool.color}` }} />
                  <span className="text-xs text-white/50">{cap}</span>
                </div>
              ))}
            </div>
          </NeonCard>

          <NeonCard color={activeTool.color} hoverable={false}>
            <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">执行状态 · Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/25">运行状态</span>
                <span className="text-[10px] flex items-center gap-1.5" style={{
                  color: status === "running" ? activeTool.color : status === "success" ? "#00ffc8" : "rgba(255,255,255,0.3)",
                }}>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: status === "running" ? activeTool.color : status === "success" ? "#00ffc8" : "rgba(255,255,255,0.15)",
                      animation: status === "running" ? "neon-pulse 1s ease-in-out infinite" : "none",
                    }}
                  />
                  {status === "running" ? "运行中" : status === "success" ? "已完成" : "空闲"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/25">日志条数</span>
                <span className="text-[10px]" style={{ color: activeTool.color }}>{logs.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/25">AI 模型</span>
                <span className="text-[10px] text-white/40">YYC³-Ultra v4.2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/25">执行引擎</span>
                <span className="text-[10px] text-white/40">五维闭环 v1.8</span>
              </div>
              {status === "running" && (
                <div className="mt-2">
                  <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (logs.length / activeTool.simulationLogs.length) * 100)}%`,
                        background: `linear-gradient(90deg, ${activeTool.color}, #00ffc8)`,
                        boxShadow: `0 0 6px ${activeTool.color}50`,
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                  <p className="text-[9px] text-white/15 mt-1 text-right">
                    {logs.length}/{activeTool.simulationLogs.length}
                  </p>
                </div>
              )}
            </div>
          </NeonCard>
        </div>
      </div>
    </div>
  );
}