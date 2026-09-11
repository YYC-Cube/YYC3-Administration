/**
 * @file index.ts
 * @description YYC³ Multi-Instance System — Barrel exports.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-18
 * @tags P2,multi-instance,export
 */

export type * from '@/features/dev-workspace/multi-instance/types'
export { useWindowStore } from '@/features/dev-workspace/multi-instance/window-manager'
export { useWorkspaceStore } from '@/features/dev-workspace/multi-instance/workspace-manager'
export { useSessionStore } from '@/features/dev-workspace/multi-instance/session-manager'
export { IPCManager, ipcManager } from '@/features/dev-workspace/multi-instance/ipc-manager'
