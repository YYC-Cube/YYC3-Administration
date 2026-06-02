/**
 * @file index.ts
 * @description YYC³ Multi-Instance System — Barrel exports.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-18
 * @tags P2,multi-instance,export
 */

export type * from "./types";
export { useWindowStore } from "./window-manager";
export { useWorkspaceStore } from "./workspace-manager";
export { useSessionStore } from "./session-manager";
export { IPCManager, ipcManager } from "./ipc-manager";
