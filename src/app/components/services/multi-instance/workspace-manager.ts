/**
 * @file workspace-manager.ts
 * @description YYC³ Multi-Instance — Workspace Manager for project/context isolation.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-18
 * @tags P2,multi-instance,workspace-manager,zustand
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Workspace, WorkspaceConfig, WorkspaceType } from "./types";

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  filter: { type?: WorkspaceType; search?: string };
}

interface WorkspaceActions {
  createWorkspace: (name: string, type: WorkspaceType, config?: WorkspaceConfig) => Workspace;
  updateWorkspace: (workspaceId: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (workspaceId: string) => void;
  activateWorkspace: (workspaceId: string) => void;
  duplicateWorkspace: (workspaceId: string) => Workspace;
  exportWorkspace: (workspaceId: string) => string;
  importWorkspace: (data: string) => Workspace;
  updateFilter: (filter: Partial<WorkspaceState["filter"]>) => void;
  getFilteredWorkspaces: () => Workspace[];
}

export const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>()(
  persist(
    (set, get) => ({
      workspaces: [],
      activeWorkspaceId: null,
      filter: {},

      createWorkspace: (name, type, config = {}) => {
        const workspace: Workspace = {
          id: crypto.randomUUID(),
          name,
          type,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          config,
          sessions: [],
          windowIds: [],
          isActive: false,
        };
        set((state) => ({ workspaces: [...state.workspaces, workspace] }));
        return workspace;
      },

      updateWorkspace: (workspaceId, updates) => {
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === workspaceId ? { ...w, ...updates, updatedAt: Date.now() } : w
          ),
        }));
      },

      deleteWorkspace: (workspaceId) => {
        set((state) => ({
          workspaces: state.workspaces.filter((w) => w.id !== workspaceId),
          activeWorkspaceId: state.activeWorkspaceId === workspaceId ? null : state.activeWorkspaceId,
        }));
      },

      activateWorkspace: (workspaceId) => {
        set((state) => ({
          activeWorkspaceId: workspaceId,
          workspaces: state.workspaces.map((w) => ({ ...w, isActive: w.id === workspaceId })),
        }));
      },

      duplicateWorkspace: (workspaceId) => {
        const original = get().workspaces.find((w) => w.id === workspaceId);
        if (!original) throw new Error("Workspace not found");
        const duplicated: Workspace = {
          ...original,
          id: crypto.randomUUID(),
          name: `${original.name} (Copy)`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          sessions: [],
          windowIds: [],
          isActive: false,
        };
        set((state) => ({ workspaces: [...state.workspaces, duplicated] }));
        return duplicated;
      },

      exportWorkspace: (workspaceId) => {
        const workspace = get().workspaces.find((w) => w.id === workspaceId);
        if (!workspace) throw new Error("Workspace not found");
        return JSON.stringify(workspace, null, 2);
      },

      importWorkspace: (data) => {
        const workspace = JSON.parse(data) as Workspace;
        workspace.id = crypto.randomUUID();
        workspace.createdAt = Date.now();
        workspace.updatedAt = Date.now();
        workspace.isActive = false;
        set((state) => ({ workspaces: [...state.workspaces, workspace] }));
        return workspace;
      },

      updateFilter: (filter) => {
        set((state) => ({ filter: { ...state.filter, ...filter } }));
      },

      getFilteredWorkspaces: () => {
        const { workspaces, filter } = get();
        let result = workspaces;
        if (filter.type) result = result.filter((w) => w.type === filter.type);
        if (filter.search) {
          const q = filter.search.toLowerCase();
          result = result.filter((w) => w.name.toLowerCase().includes(q));
        }
        return result;
      },
    }),
    {
      name: "yyc3-workspace-storage",
      partialize: (state) => ({ workspaces: state.workspaces }),
    }
  )
);
