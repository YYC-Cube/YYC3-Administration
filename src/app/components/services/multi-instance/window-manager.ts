/**
 * @file window-manager.ts
 * @description YYC³ Multi-Instance — Web-based Window Manager using Zustand.
 *   In web context, "windows" are virtual panels/tabs within the SPA.
 *   For desktop (Tauri/Electron), replace the mock implementations with native APIs.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-18
 * @tags P2,multi-instance,window-manager,zustand
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AppInstance, WindowConfig, WindowType } from "./types";

interface WindowState {
  instances: AppInstance[];
  activeInstanceId: string | null;
  mainInstanceId: string | null;
}

interface WindowActions {
  createWindow: (type: WindowType, config?: WindowConfig) => AppInstance;
  closeWindow: (windowId: string) => void;
  activateWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  restoreWindow: (windowId: string) => void;
  moveWindow: (windowId: string, position: { x: number; y: number }) => void;
  resizeWindow: (windowId: string, size: { width: number; height: number }) => void;
  updateWindowState: (windowId: string, updates: Partial<AppInstance>) => void;
  reorderWindows: (fromIndex: number, toIndex: number) => void;
  getAllWindows: () => AppInstance[];
  getActiveWindow: () => AppInstance | undefined;
}

export const useWindowStore = create<WindowState & WindowActions>()(
  persist(
    (set, get) => ({
      instances: [],
      activeInstanceId: null,
      mainInstanceId: null,

      createWindow: (type, config = {}) => {
        const instanceId = crypto.randomUUID();
        const windowId = `window-${instanceId}`;
        const existingCount = get().instances.length;

        const instance: AppInstance = {
          id: instanceId,
          type: existingCount === 0 ? "main" : "secondary",
          windowId,
          windowType: type,
          title: config.title || `YYC³ - ${type}`,
          createdAt: Date.now(),
          lastActiveAt: Date.now(),
          isMain: existingCount === 0,
          isVisible: true,
          isMinimized: false,
          position: config.position || { x: 100 + existingCount * 50, y: 100 + existingCount * 50 },
          size: config.size || { width: 1200, height: 800 },
          workspaceId: config.workspaceId,
          sessionIds: [],
          state: {},
        };

        set((state) => ({
          instances: [...state.instances, instance],
          activeInstanceId: instance.windowId,
          mainInstanceId: state.mainInstanceId || instance.id,
        }));

        return instance;
      },

      closeWindow: (windowId) => {
        set((state) => ({
          instances: state.instances.filter((i) => i.windowId !== windowId),
          activeInstanceId: state.activeInstanceId === windowId
            ? (state.instances.find((i) => i.windowId !== windowId)?.windowId ?? null)
            : state.activeInstanceId,
        }));
      },

      activateWindow: (windowId) => {
        set((state) => ({
          activeInstanceId: windowId,
          instances: state.instances.map((i) =>
            i.windowId === windowId ? { ...i, lastActiveAt: Date.now() } : i
          ),
        }));
      },

      minimizeWindow: (windowId) => {
        set((state) => ({
          instances: state.instances.map((i) =>
            i.windowId === windowId ? { ...i, isMinimized: true } : i
          ),
        }));
      },

      restoreWindow: (windowId) => {
        set((state) => ({
          instances: state.instances.map((i) =>
            i.windowId === windowId ? { ...i, isMinimized: false, isVisible: true } : i
          ),
        }));
      },

      moveWindow: (windowId, position) => {
        set((state) => ({
          instances: state.instances.map((i) =>
            i.windowId === windowId ? { ...i, position } : i
          ),
        }));
      },

      resizeWindow: (windowId, size) => {
        set((state) => ({
          instances: state.instances.map((i) =>
            i.windowId === windowId ? { ...i, size } : i
          ),
        }));
      },

      updateWindowState: (windowId, updates) => {
        set((state) => ({
          instances: state.instances.map((i) =>
            i.windowId === windowId ? { ...i, ...updates } : i
          ),
        }));
      },

      getAllWindows: () => get().instances,

      getActiveWindow: () => {
        const { instances, activeInstanceId } = get();
        return instances.find((i) => i.windowId === activeInstanceId);
      },

      reorderWindows: (fromIndex, toIndex) => {
        set((state) => {
          const items = [...state.instances];
          if (fromIndex < 0 || fromIndex >= items.length || toIndex < 0 || toIndex >= items.length) {
            return state;
          }
          const [moved] = items.splice(fromIndex, 1);
          items.splice(toIndex, 0, moved);
          return { instances: items };
        });
      },
    }),
    {
      name: "yyc3-window-storage",
      partialize: (state) => ({ instances: state.instances }),
    }
  )
);