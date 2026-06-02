/**
 * @file workspace-selector.tsx
 * @description YYC³ Multi-Instance — Workspace Selector component for switching
 *   between project workspaces, creating new ones, and managing workspace lifecycle.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-18
 * @updated 2026-03-18
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags P2,frontend,multi-instance,workspace-selector
 */

import {
  Bot, Briefcase, Bug, ChevronDown, Copy,
  FolderOpen, Layers, Plus, Trash2, X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";

import { useWorkspaceStore } from "../services/multi-instance/workspace-manager";

import type { ThemeColors } from "../hooks/use-theme-colors";
import type { WorkspaceType } from "../services/multi-instance/types";

const WS_TYPE_ICONS: Record<WorkspaceType, { icon: typeof Briefcase; color: string; label: string }> = {
  project: { icon: Briefcase, color: "#3b82f6", label: "项目" },
  "ai-session": { icon: Bot, color: "#a78bfa", label: "AI 会话" },
  debug: { icon: Bug, color: "#ef4444", label: "调试" },
  custom: { icon: Layers, color: "#22c55e", label: "自定义" },
};

export function WorkspaceSelector({ tc }: { tc: ThemeColors }) {
  const { workspaces, activeWorkspaceId, createWorkspace, activateWorkspace, deleteWorkspace, duplicateWorkspace } = useWorkspaceStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<WorkspaceType>("project");

  const activeWs = workspaces.find((w) => w.id === activeWorkspaceId);
  const activeCfg = activeWs ? WS_TYPE_ICONS[activeWs.type] : null;

  const handleCreate = useCallback(() => {
    if (!newName.trim()) return;
    const ws = createWorkspace(newName.trim(), newType);
    activateWorkspace(ws.id);
    setNewName("");
    setShowCreateDialog(false);
    setIsOpen(false);
  }, [newName, newType, createWorkspace, activateWorkspace]);

  return (
    <div className="relative">
      {/* Trigger button */}
      <button onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all hover:bg-white/5"
        style={{ borderColor: tc.borderSubtle, background: activeWs ? `${activeCfg?.color ?? tc.primary}08` : "transparent" }}>
        <FolderOpen className="w-3 h-3" style={{ color: activeCfg?.color ?? tc.textMuted }} />
        <span className="text-[9px] max-w-[100px] truncate" style={{ color: tc.textPrimary }}>
          {activeWs?.name ?? "无工作区"}
        </span>
        <ChevronDown className="w-3 h-3" style={{ color: tc.textMuted, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              className="absolute top-full left-0 mt-1 w-56 rounded-xl border py-1 z-50"
              style={{ background: tc.bgElevated, borderColor: tc.borderDefault, boxShadow: tc.shadowLg }}
            >
              {/* Workspace list */}
              {workspaces.length === 0 && (
                <div className="px-3 py-3 text-center">
                  <Layers className="w-5 h-5 mx-auto mb-1 opacity-30" style={{ color: tc.textMuted }} />
                  <p className="text-[9px]" style={{ color: tc.textMuted }}>暂无工作区</p>
                </div>
              )}

              {workspaces.map((ws) => {
                const cfg = WS_TYPE_ICONS[ws.type];
                const Icon = cfg.icon;
                const isActive = ws.id === activeWorkspaceId;

                return (
                  <div key={ws.id}
                    className="flex items-center gap-2 px-3 py-1.5 cursor-pointer group transition-colors hover:bg-white/5"
                    style={{ background: isActive ? `${cfg.color}08` : "transparent" }}
                    onClick={() => { activateWorkspace(ws.id); setIsOpen(false); }}
                  >
                    <Icon className="w-3 h-3 shrink-0" style={{ color: cfg.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] truncate" style={{ color: isActive ? tc.textPrimary : tc.textSecondary }}>{ws.name}</p>
                      <p className="text-[7px]" style={{ color: tc.textMuted }}>{cfg.label}</p>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); duplicateWorkspace(ws.id); }}
                        className="p-0.5 rounded hover:bg-white/10" title="Duplicate">
                        <Copy className="w-2.5 h-2.5" style={{ color: tc.textMuted }} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteWorkspace(ws.id); }}
                        className="p-0.5 rounded hover:bg-white/10" title="Delete">
                        <Trash2 className="w-2.5 h-2.5" style={{ color: "#ef4444" }} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Create button */}
              <div className="border-t mt-1 pt-1" style={{ borderColor: tc.borderSubtle }}>
                <button onClick={() => setShowCreateDialog(true)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] transition-colors hover:bg-white/5"
                  style={{ color: tc.primary }}>
                  <Plus className="w-3 h-3" /> 新建工作区
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create dialog */}
      <AnimatePresence>
        {showCreateDialog && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40"
            onClick={() => setShowCreateDialog(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-80 rounded-xl border p-4" style={{ background: tc.bgElevated, borderColor: tc.borderDefault, boxShadow: tc.shadowLg }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[12px]" style={{ color: tc.textPrimary }}>新建工作区</p>
                <button onClick={() => setShowCreateDialog(false)}>
                  <X className="w-3.5 h-3.5" style={{ color: tc.textMuted }} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[9px] block mb-1" style={{ color: tc.textMuted }}>名称</label>
                  <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)}
                    placeholder="我的项目"
                    onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
                    className="w-full text-[11px] px-2.5 py-1.5 rounded-lg border outline-none"
                    style={{ background: tc.bgInput, borderColor: tc.borderDefault, color: tc.textPrimary }} />
                </div>

                <div>
                  <label className="text-[9px] block mb-1" style={{ color: tc.textMuted }}>类型</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(Object.entries(WS_TYPE_ICONS) as [WorkspaceType, typeof WS_TYPE_ICONS[WorkspaceType]][]).map(([type, cfg]) => (
                      <button key={type} onClick={() => setNewType(type)}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-[9px] transition-all"
                        style={{
                          background: newType === type ? `${cfg.color}12` : "transparent",
                          borderColor: newType === type ? `${cfg.color}30` : tc.borderSubtle,
                          color: newType === type ? cfg.color : tc.textMuted,
                        }}>
                        <cfg.icon className="w-3 h-3" />
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-1.5 pt-1">
                  <button onClick={() => setShowCreateDialog(false)} className="text-[10px] px-3 py-1 rounded-lg border"
                    style={{ borderColor: tc.borderDefault, color: tc.textMuted }}>取消</button>
                  <button onClick={handleCreate} disabled={!newName.trim()}
                    className="text-[10px] px-3 py-1 rounded-lg border transition-all"
                    style={{ background: `${tc.primary}15`, borderColor: `${tc.primary}30`, color: tc.primary, opacity: newName.trim() ? 1 : 0.4 }}>
                    创建
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}