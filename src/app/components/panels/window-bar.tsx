/**
 * @file window-bar.tsx
 * @description YYC³ Multi-Instance — Window Bar component with drag-and-drop tab
 *   reordering. Displays open instances, allows switching, closing, creating, and
 *   reordering via native HTML5 Drag & Drop API with visual drop indicators.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v2.0.0
 * @created 2026-03-18
 * @updated 2026-03-18
 * @status stable
 * @license MIT
 * @copyright Copyright (c) 2026 YanYuCloudCube Team
 * @tags P2,frontend,multi-instance,window-bar,drag-drop
 */

import {
  Bot, Code, Eye, GripVertical, Maximize2,
  Minimize2, Monitor, Plus, Settings, Terminal, X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";

import { useWindowStore } from "../services/multi-instance/window-manager";

import type { ThemeColors } from "../hooks/use-theme-colors";
import type { WindowType } from "../services/multi-instance/types";

const WINDOW_TYPE_ICONS: Record<WindowType, { icon: typeof Monitor; color: string; label: string }> = {
  main: { icon: Monitor, color: "#3b82f6", label: "主窗口" },
  editor: { icon: Code, color: "#22c55e", label: "编辑器" },
  preview: { icon: Eye, color: "#f97316", label: "预览" },
  terminal: { icon: Terminal, color: "#a78bfa", label: "终端" },
  "ai-chat": { icon: Bot, color: "#ec4899", label: "AI 对话" },
  settings: { icon: Settings, color: "#6b7280", label: "设置" },
};

export function WindowBar({ tc }: { tc: ThemeColors }) {
  const { instances, activeInstanceId, createWindow, closeWindow, activateWindow, minimizeWindow, restoreWindow, reorderWindows } = useWindowStore();
  const [showNewMenu, setShowNewMenu] = useState(false);

  // Drag state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);

  const handleCreateWindow = (type: WindowType) => {
    const config = WINDOW_TYPE_ICONS[type];
    createWindow(type, { title: `YYC³ - ${config.label}` });
    setShowNewMenu(false);
  };

  // --- Native HTML5 Drag & Drop Handlers ---
  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDragIndex(index);
    dragNodeRef.current = e.currentTarget;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
    // Semi-transparent drag feedback
    requestAnimationFrame(() => {
      if (dragNodeRef.current) {
        dragNodeRef.current.style.opacity = "0.4";
      }
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragIndex !== null && dragIndex !== index) {
      setDropTargetIndex(index);
    }
  }, [dragIndex]);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      setDropTargetIndex(index);
    }
  }, [dragIndex]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>, toIndex: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== toIndex) {
      reorderWindows(dragIndex, toIndex);
    }
    setDragIndex(null);
    setDropTargetIndex(null);
  }, [dragIndex, reorderWindows]);

  const handleDragEnd = useCallback(() => {
    if (dragNodeRef.current) {
      dragNodeRef.current.style.opacity = "1";
    }
    setDragIndex(null);
    setDropTargetIndex(null);
    dragNodeRef.current = null;
  }, []);

  if (instances.length === 0) {
    return (
      <div className="flex items-center h-8 px-2 border-b" style={{ borderColor: tc.borderSubtle, background: tc.bgCard }}>
        <button onClick={() => handleCreateWindow("main")}
          className="flex items-center gap-1.5 px-2 py-1 text-[9px] rounded-md border transition-all hover:bg-white/5"
          style={{ borderColor: tc.borderSubtle, color: tc.textMuted }}>
          <Plus className="w-3 h-3" /> 新建窗口
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center h-8 px-1 border-b gap-0.5 overflow-x-auto" style={{ borderColor: tc.borderSubtle, background: tc.bgCard }}>
      {/* Window tabs with native HTML5 drag-and-drop */}
      {instances.map((instance, index) => {
        const isActive = instance.windowId === activeInstanceId;
        const cfg = WINDOW_TYPE_ICONS[instance.windowType] ?? WINDOW_TYPE_ICONS.main;
        const Icon = cfg.icon;
        const isDraggedOver = dropTargetIndex === index && dragIndex !== index;
        const isBeingDragged = dragIndex === index;

        return (
          <div
            key={instance.windowId}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className="flex items-center gap-1 px-2 py-1 rounded-md cursor-grab shrink-0 group transition-all active:cursor-grabbing select-none"
            style={{
              background: isActive ? `${cfg.color}12` : isDraggedOver ? `${cfg.color}08` : "transparent",
              border: isDraggedOver
                ? `1px dashed ${cfg.color}60`
                : isActive
                  ? `1px solid ${cfg.color}30`
                  : "1px solid transparent",
              opacity: isBeingDragged ? 0.5 : 1,
              transform: isDraggedOver ? "scale(1.03)" : undefined,
              transition: "background 0.15s ease, border-color 0.15s ease, transform 0.15s ease",
            }}
            onClick={() => activateWindow(instance.windowId)}
          >
            {/* Drag grip — visible on hover */}
            <GripVertical className="w-2.5 h-2.5 opacity-0 group-hover:opacity-40 transition-opacity shrink-0" style={{ color: tc.textMuted }} />

            <Icon className="w-3 h-3" style={{ color: isActive ? cfg.color : tc.textMuted }} />
            <span className="text-[9px] max-w-[80px] truncate" style={{ color: isActive ? tc.textPrimary : tc.textSecondary }}>
              {instance.title.replace("YYC³ - ", "")}
            </span>
            {instance.isMinimized && (
              <button onClick={(e) => { e.stopPropagation(); restoreWindow(instance.windowId); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-2.5 h-2.5" style={{ color: tc.textMuted }} />
              </button>
            )}
            {!instance.isMinimized && instances.length > 1 && (
              <button onClick={(e) => { e.stopPropagation(); minimizeWindow(instance.windowId); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Minimize2 className="w-2.5 h-2.5" style={{ color: tc.textMuted }} />
              </button>
            )}
            {!instance.isMain && (
              <button onClick={(e) => { e.stopPropagation(); closeWindow(instance.windowId); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-2.5 h-2.5" style={{ color: "#ef4444" }} />
              </button>
            )}
          </div>
        );
      })}

      {/* New window button */}
      <div className="relative shrink-0">
        <button onClick={() => setShowNewMenu(!showNewMenu)}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/5 transition-colors">
          <Plus className="w-3 h-3" style={{ color: tc.textMuted }} />
        </button>

        <AnimatePresence>
          {showNewMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -4 }}
              className="absolute top-full left-0 mt-1 w-36 rounded-xl border py-1 z-50"
              style={{ background: tc.bgElevated, borderColor: tc.borderDefault, boxShadow: tc.shadowLg }}
            >
              {(Object.entries(WINDOW_TYPE_ICONS) as [WindowType, typeof WINDOW_TYPE_ICONS[WindowType]][]).map(([type, cfg]) => (
                <button key={type} onClick={() => handleCreateWindow(type)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] transition-colors hover:bg-white/5"
                  style={{ color: tc.textSecondary }}>
                  <cfg.icon className="w-3 h-3" style={{ color: cfg.color }} />
                  {cfg.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instance count */}
      <span className="text-[8px] px-1.5 py-0.5 rounded-full ml-auto shrink-0"
        style={{ background: `${tc.primary}08`, color: tc.textMuted }}>
        {instances.length} {instances.length === 1 ? "个窗口" : "个窗口"}
      </span>
    </div>
  );
}