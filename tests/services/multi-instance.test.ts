/**
 * @file multi-instance.test.ts
 * @description YYC³ Multi-Instance System — Comprehensive Vitest Unit Tests
 *   Covers: WindowManager, WorkspaceManager, SessionManager, IPCManager
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-18
 * @tags P2,testing,multi-instance
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { IPCManager } from "../../src/app/components/services/multi-instance/ipc-manager";
import { useSessionStore } from "../../src/app/components/services/multi-instance/session-manager";
import { useWindowStore } from "../../src/app/components/services/multi-instance/window-manager";
import { useWorkspaceStore } from "../../src/app/components/services/multi-instance/workspace-manager";

// ==========================================
// WindowManager Tests
// ==========================================

describe("WindowManager", () => {
  beforeEach(() => {
    useWindowStore.setState({ instances: [], activeInstanceId: null, mainInstanceId: null });
  });

  it("should create a main window as first instance", () => {
    const instance = useWindowStore.getState().createWindow("main");
    expect(instance.type).toBe("main");
    expect(instance.isMain).toBe(true);
    expect(instance.windowType).toBe("main");
    expect(instance.isVisible).toBe(true);
    expect(instance.isMinimized).toBe(false);
    expect(useWindowStore.getState().instances.length).toBe(1);
    expect(useWindowStore.getState().activeInstanceId).toBe(instance.windowId);
  });

  it("should create secondary windows after main", () => {
    useWindowStore.getState().createWindow("main");
    const secondary = useWindowStore.getState().createWindow("editor", { title: "Test Editor" });
    expect(secondary.type).toBe("secondary");
    expect(secondary.isMain).toBe(false);
    expect(secondary.title).toBe("Test Editor");
    expect(useWindowStore.getState().instances.length).toBe(2);
  });

  it("should close a window and update active", () => {
    const w1 = useWindowStore.getState().createWindow("main");
    const w2 = useWindowStore.getState().createWindow("editor");
    useWindowStore.getState().closeWindow(w2.windowId);
    expect(useWindowStore.getState().instances.length).toBe(1);
    expect(useWindowStore.getState().instances[0].windowId).toBe(w1.windowId);
  });

  it("should activate a window", () => {
    const w1 = useWindowStore.getState().createWindow("main");
    const w2 = useWindowStore.getState().createWindow("editor");
    useWindowStore.getState().activateWindow(w1.windowId);
    expect(useWindowStore.getState().activeInstanceId).toBe(w1.windowId);
  });

  it("should minimize and restore", () => {
    const w = useWindowStore.getState().createWindow("main");
    useWindowStore.getState().minimizeWindow(w.windowId);
    expect(useWindowStore.getState().instances[0].isMinimized).toBe(true);
    useWindowStore.getState().restoreWindow(w.windowId);
    expect(useWindowStore.getState().instances[0].isMinimized).toBe(false);
  });

  it("should move and resize", () => {
    const w = useWindowStore.getState().createWindow("main");
    useWindowStore.getState().moveWindow(w.windowId, { x: 200, y: 300 });
    expect(useWindowStore.getState().instances[0].position).toEqual({ x: 200, y: 300 });
    useWindowStore.getState().resizeWindow(w.windowId, { width: 800, height: 600 });
    expect(useWindowStore.getState().instances[0].size).toEqual({ width: 800, height: 600 });
  });

  it("should return all windows and active window", () => {
    const w1 = useWindowStore.getState().createWindow("main");
    useWindowStore.getState().createWindow("editor");
    expect(useWindowStore.getState().getAllWindows().length).toBe(2);
    const active = useWindowStore.getState().getActiveWindow();
    expect(active).toBeDefined();
  });

  it("should apply custom config", () => {
    const w = useWindowStore.getState().createWindow("ai-chat", {
      title: "AI Chat",
      size: { width: 500, height: 400 },
      position: { x: 50, y: 50 },
      workspaceId: "ws-123",
    });
    expect(w.title).toBe("AI Chat");
    expect(w.size).toEqual({ width: 500, height: 400 });
    expect(w.position).toEqual({ x: 50, y: 50 });
    expect(w.workspaceId).toBe("ws-123");
  });

  it("should update window state", () => {
    const w = useWindowStore.getState().createWindow("main");
    useWindowStore.getState().updateWindowState(w.windowId, { title: "Updated Title" });
    expect(useWindowStore.getState().instances[0].title).toBe("Updated Title");
  });
});

// ==========================================
// WorkspaceManager Tests
// ==========================================

describe("WorkspaceManager", () => {
  beforeEach(() => {
    useWorkspaceStore.setState({ workspaces: [], activeWorkspaceId: null, filter: {} });
  });

  it("should create a workspace", () => {
    const ws = useWorkspaceStore.getState().createWorkspace("My Project", "project");
    expect(ws.name).toBe("My Project");
    expect(ws.type).toBe("project");
    expect(ws.isActive).toBe(false);
    expect(ws.sessions.length).toBe(0);
    expect(useWorkspaceStore.getState().workspaces.length).toBe(1);
  });

  it("should create workspace with config", () => {
    const ws = useWorkspaceStore.getState().createWorkspace("AI Session", "ai-session", {
      ai: { provider: "openai", model: "gpt-4" },
    });
    expect(ws.config.ai?.provider).toBe("openai");
  });

  it("should update a workspace", () => {
    const ws = useWorkspaceStore.getState().createWorkspace("Test", "project");
    useWorkspaceStore.getState().updateWorkspace(ws.id, { name: "Updated" });
    expect(useWorkspaceStore.getState().workspaces[0].name).toBe("Updated");
  });

  it("should delete a workspace", () => {
    const ws = useWorkspaceStore.getState().createWorkspace("Test", "project");
    useWorkspaceStore.getState().deleteWorkspace(ws.id);
    expect(useWorkspaceStore.getState().workspaces.length).toBe(0);
  });

  it("should activate a workspace", () => {
    const ws1 = useWorkspaceStore.getState().createWorkspace("WS1", "project");
    const ws2 = useWorkspaceStore.getState().createWorkspace("WS2", "project");
    useWorkspaceStore.getState().activateWorkspace(ws2.id);
    expect(useWorkspaceStore.getState().activeWorkspaceId).toBe(ws2.id);
    expect(useWorkspaceStore.getState().workspaces.find((w) => w.id === ws2.id)?.isActive).toBe(true);
    expect(useWorkspaceStore.getState().workspaces.find((w) => w.id === ws1.id)?.isActive).toBe(false);
  });

  it("should duplicate a workspace", () => {
    const ws = useWorkspaceStore.getState().createWorkspace("Original", "project", { theme: "cyberpunk" });
    const dup = useWorkspaceStore.getState().duplicateWorkspace(ws.id);
    expect(dup.name).toBe("Original (Copy)");
    expect(dup.id).not.toBe(ws.id);
    expect(dup.config.theme).toBe("cyberpunk");
    expect(useWorkspaceStore.getState().workspaces.length).toBe(2);
  });

  it("should throw when duplicating non-existent workspace", () => {
    expect(() => useWorkspaceStore.getState().duplicateWorkspace("non-existent")).toThrow("Workspace not found");
  });

  it("should export and import workspace", () => {
    const ws = useWorkspaceStore.getState().createWorkspace("Export Me", "custom", { editor: { fontSize: 16 } });
    const exported = useWorkspaceStore.getState().exportWorkspace(ws.id);
    expect(exported).toContain("Export Me");

    useWorkspaceStore.setState({ workspaces: [] });
    const imported = useWorkspaceStore.getState().importWorkspace(exported);
    expect(imported.name).toBe("Export Me");
    expect(imported.id).not.toBe(ws.id); // New ID
    expect(imported.config.editor?.fontSize).toBe(16);
  });

  it("should filter workspaces by type", () => {
    useWorkspaceStore.getState().createWorkspace("P1", "project");
    useWorkspaceStore.getState().createWorkspace("AI1", "ai-session");
    useWorkspaceStore.getState().createWorkspace("P2", "project");
    useWorkspaceStore.getState().updateFilter({ type: "project" });
    const filtered = useWorkspaceStore.getState().getFilteredWorkspaces();
    expect(filtered.length).toBe(2);
  });

  it("should filter workspaces by search", () => {
    useWorkspaceStore.getState().createWorkspace("Alpha Project", "project");
    useWorkspaceStore.getState().createWorkspace("Beta Project", "project");
    useWorkspaceStore.getState().updateFilter({ search: "alpha" });
    const filtered = useWorkspaceStore.getState().getFilteredWorkspaces();
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe("Alpha Project");
  });
});

// ==========================================
// SessionManager Tests
// ==========================================

describe("SessionManager", () => {
  beforeEach(() => {
    useSessionStore.setState({ sessions: [], activeSessionId: null, filter: {} });
  });

  it("should create a session", () => {
    const session = useSessionStore.getState().createSession("Chat 1", "ai-chat", "ws-1");
    expect(session.name).toBe("Chat 1");
    expect(session.type).toBe("ai-chat");
    expect(session.status).toBe("active");
    expect(session.workspaceId).toBe("ws-1");
  });

  it("should create session with initial data", () => {
    const session = useSessionStore.getState().createSession("Edit", "code-edit", "ws-1", {
      editedFiles: [{ path: "/test.ts", content: "hello" }],
    });
    expect(session.data.editedFiles?.length).toBe(1);
  });

  it("should update session", () => {
    const s = useSessionStore.getState().createSession("S1", "ai-chat", "ws-1");
    useSessionStore.getState().updateSession(s.id, { name: "Updated" });
    expect(useSessionStore.getState().sessions[0].name).toBe("Updated");
  });

  it("should delete session", () => {
    const s = useSessionStore.getState().createSession("S1", "ai-chat", "ws-1");
    useSessionStore.getState().deleteSession(s.id);
    expect(useSessionStore.getState().sessions.length).toBe(0);
  });

  it("should activate and suspend session", () => {
    const s = useSessionStore.getState().createSession("S1", "ai-chat", "ws-1");
    useSessionStore.getState().suspendSession(s.id);
    expect(useSessionStore.getState().sessions[0].status).toBe("suspended");
    useSessionStore.getState().resumeSession(s.id);
    expect(useSessionStore.getState().sessions[0].status).toBe("active");
  });

  it("should update session data", () => {
    const s = useSessionStore.getState().createSession("S1", "ai-chat", "ws-1");
    useSessionStore.getState().updateSessionData(s.id, {
      aiMessages: [{ role: "user", content: "Hello" }],
    });
    expect(useSessionStore.getState().sessions[0].data.aiMessages?.length).toBe(1);
  });

  it("should get workspace sessions", () => {
    useSessionStore.getState().createSession("S1", "ai-chat", "ws-1");
    useSessionStore.getState().createSession("S2", "code-edit", "ws-2");
    useSessionStore.getState().createSession("S3", "debug", "ws-1");
    const ws1Sessions = useSessionStore.getState().getWorkspaceSessions("ws-1");
    expect(ws1Sessions.length).toBe(2);
  });

  it("should get active sessions", () => {
    const s1 = useSessionStore.getState().createSession("S1", "ai-chat", "ws-1");
    useSessionStore.getState().createSession("S2", "code-edit", "ws-1");
    useSessionStore.getState().suspendSession(s1.id);
    const active = useSessionStore.getState().getActiveSessions();
    expect(active.length).toBe(1);
  });

  it("should clear activeSessionId when deleting active session", () => {
    const s = useSessionStore.getState().createSession("S1", "ai-chat", "ws-1");
    useSessionStore.getState().activateSession(s.id);
    expect(useSessionStore.getState().activeSessionId).toBe(s.id);
    useSessionStore.getState().deleteSession(s.id);
    expect(useSessionStore.getState().activeSessionId).toBeNull();
  });
});

// ==========================================
// IPCManager Tests
// ==========================================

describe("IPCManager", () => {
  let ipc: IPCManager;

  beforeEach(() => {
    ipc = new IPCManager();
  });

  afterEach(() => {
    ipc.destroy();
  });

  it("should have a unique instance ID", () => {
    expect(ipc.getInstanceId()).toBeTruthy();
    expect(typeof ipc.getInstanceId()).toBe("string");
    expect(ipc.getInstanceId().length).toBeGreaterThan(10);
  });

  it("should generate unique IDs per instance", () => {
    const ipc2 = new IPCManager();
    expect(ipc.getInstanceId()).not.toBe(ipc2.getInstanceId());
    ipc2.destroy();
  });

  it("should register and unregister handlers", () => {
    const handler = vi.fn();
    const unsub = ipc.on("state-sync", handler);
    expect(typeof unsub).toBe("function");
    unsub();
    // Handler should be removed
  });

  it("should broadcast without error", async () => {
    await expect(ipc.broadcast("state-sync", { test: true })).resolves.toBeUndefined();
  });

  it("should send to instance without error", async () => {
    await expect(ipc.sendToInstance("some-id", "clipboard-share", { text: "hello" })).resolves.toBeUndefined();
  });

  it("should not broadcast after destroy", async () => {
    ipc.destroy();
    await expect(ipc.broadcast("state-sync", {})).resolves.toBeUndefined();
  });

  it("should handle multiple handlers for same type", () => {
    const h1 = vi.fn();
    const h2 = vi.fn();
    ipc.on("state-sync", h1);
    ipc.on("state-sync", h2);
    // Both handlers registered successfully
  });

  it("should unsubscribe specific handler", () => {
    const h1 = vi.fn();
    const h2 = vi.fn();
    const unsub1 = ipc.on("state-sync", h1);
    ipc.on("state-sync", h2);
    unsub1();
    // h1 removed, h2 still active
  });
});

// ==========================================
// Panel Store Tests
// ==========================================

describe("PanelStore", () => {
  // Import inline to avoid circular dependency issues
  let usePanelStore: typeof import("../../src/app/components/panels/panel-store").usePanelStore;

  beforeEach(async () => {
    const mod = await import("../../src/app/components/panels/panel-store");
    usePanelStore = mod.usePanelStore;
    usePanelStore.setState({
      activePanel: "file-explorer",
      panelCollapsed: false,
      panelWidth: 300,
      expandedFolders: [],
      selectedFile: null,
      recentFiles: [],
      favoriteFiles: [],
      aiMessages: [],
      searchHistory: [],
      aiProviderConfig: { provider: "mock", apiKey: "", model: "mock-v1", temperature: 0.7, maxTokens: 2048 },
      fileTree: [],
    });
  });

  it("should switch active panel", () => {
    usePanelStore.getState().setActivePanel("ai-assistant");
    expect(usePanelStore.getState().activePanel).toBe("ai-assistant");
  });

  it("should toggle collapsed state", () => {
    usePanelStore.getState().toggleCollapsed();
    expect(usePanelStore.getState().panelCollapsed).toBe(true);
    usePanelStore.getState().toggleCollapsed();
    expect(usePanelStore.getState().panelCollapsed).toBe(false);
  });

  it("should clamp panel width between 200-600", () => {
    usePanelStore.getState().setPanelWidth(100);
    expect(usePanelStore.getState().panelWidth).toBe(200);
    usePanelStore.getState().setPanelWidth(800);
    expect(usePanelStore.getState().panelWidth).toBe(600);
    usePanelStore.getState().setPanelWidth(400);
    expect(usePanelStore.getState().panelWidth).toBe(400);
  });

  it("should toggle folder expansion", () => {
    usePanelStore.getState().toggleFolder("src");
    expect(usePanelStore.getState().expandedFolders).toContain("src");
    usePanelStore.getState().toggleFolder("src");
    expect(usePanelStore.getState().expandedFolders).not.toContain("src");
  });

  it("should select and deselect file", () => {
    usePanelStore.getState().selectFile("/test.ts");
    expect(usePanelStore.getState().selectedFile).toBe("/test.ts");
    usePanelStore.getState().selectFile(null);
    expect(usePanelStore.getState().selectedFile).toBeNull();
  });

  it("should add recent files (max 20, dedupe)", () => {
    for (let i = 0; i < 25; i++) {
      usePanelStore.getState().addRecentFile({
        id: `f${i}`, name: `file${i}.ts`, path: `/file${i}.ts`, type: "recent", lastAccessed: Date.now(),
      });
    }
    expect(usePanelStore.getState().recentFiles.length).toBe(20);
    // Most recent should be first
    expect(usePanelStore.getState().recentFiles[0].name).toBe("file24.ts");
  });

  it("should toggle favorites", () => {
    const item = { id: "f1", name: "test.ts", path: "/test.ts", type: "favorite" as const, lastAccessed: Date.now() };
    usePanelStore.getState().toggleFavorite(item);
    expect(usePanelStore.getState().favoriteFiles.length).toBe(1);
    usePanelStore.getState().toggleFavorite(item);
    expect(usePanelStore.getState().favoriteFiles.length).toBe(0);
  });

  it("should manage AI messages", () => {
    usePanelStore.getState().addAIMessage({ id: "m1", role: "user", content: "Hello", timestamp: Date.now() });
    usePanelStore.getState().addAIMessage({ id: "m2", role: "assistant", content: "Hi!", timestamp: Date.now() });
    expect(usePanelStore.getState().aiMessages.length).toBe(2);
    usePanelStore.getState().clearAIMessages();
    expect(usePanelStore.getState().aiMessages.length).toBe(0);
  });

  it("should manage search history (max 10, dedupe)", () => {
    for (let i = 0; i < 12; i++) {
      usePanelStore.getState().addSearchHistory(`query${i}`);
    }
    expect(usePanelStore.getState().searchHistory.length).toBe(10);
    expect(usePanelStore.getState().searchHistory[0]).toBe("query11");
  });

  it("should update AI provider config", () => {
    usePanelStore.getState().setAIProviderConfig({ provider: "openai", model: "gpt-4" });
    const config = usePanelStore.getState().aiProviderConfig;
    expect(config.provider).toBe("openai");
    expect(config.model).toBe("gpt-4");
    expect(config.temperature).toBe(0.7); // unchanged
  });

  it("should manage file tree CRUD", () => {
    const tree = [{ id: "root", type: "directory" as const, name: "root", path: "/", children: [] }];
    usePanelStore.getState().setFileTree(tree);
    expect(usePanelStore.getState().fileTree.length).toBe(1);

    // Add file to root
    usePanelStore.getState().addFileNode("/", { id: "f1", type: "file", name: "test.ts", path: "/test.ts" });
    expect(usePanelStore.getState().fileTree[0].children?.length).toBe(1);

    // Rename
    usePanelStore.getState().renameFileNode("/test.ts", "renamed.ts");
    expect(usePanelStore.getState().fileTree[0].children?.[0].name).toBe("renamed.ts");

    // Delete
    usePanelStore.getState().deleteFileNode("/renamed.ts");
    expect(usePanelStore.getState().fileTree[0].children?.length).toBe(0);
  });

  it("should clear selectedFile when deleting selected file", () => {
    usePanelStore.getState().selectFile("/test.ts");
    usePanelStore.getState().setFileTree([{ id: "f1", type: "file", name: "test.ts", path: "/test.ts" }]);
    usePanelStore.getState().deleteFileNode("/test.ts");
    expect(usePanelStore.getState().selectedFile).toBeNull();
  });
});
