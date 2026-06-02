/**
 * @file ipc-manager.ts
 * @description YYC³ Multi-Instance — Web-based IPC Manager using BroadcastChannel API.
 *   Enables cross-tab communication for state synchronization, resource sharing,
 *   and clipboard sharing between multiple browser tabs of the same application.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-03-18
 * @tags P2,multi-instance,ipc,broadcast-channel
 */

import type { IPCMessage, IPCMessageType } from "./types";

const IPC_CHANNEL_NAME = "yyc3-ipc-channel";

/**
 * Web-based IPC Manager using BroadcastChannel API.
 * Falls back to localStorage events if BroadcastChannel is not available.
 */
export class IPCManager {
  private messageHandlers: Map<IPCMessageType, Set<(message: IPCMessage) => void>> = new Map();
  private instanceId: string;
  private channel: BroadcastChannel | null = null;
  private isDestroyed = false;

  constructor() {
    this.instanceId = crypto.randomUUID();
    this.initializeChannel();
  }

  /** Initialize BroadcastChannel or fallback */
  private initializeChannel(): void {
    try {
      if (typeof BroadcastChannel !== "undefined") {
        this.channel = new BroadcastChannel(IPC_CHANNEL_NAME);
        this.channel.onmessage = (event: MessageEvent<IPCMessage>) => {
          if (event.data.senderId !== this.instanceId) {
            this.handleMessage(event.data);
          }
        };
      } else {
        // Fallback: localStorage events for cross-tab communication
        window.addEventListener("storage", this.handleStorageEvent);
      }
    } catch {
      // BroadcastChannel not supported
      window.addEventListener("storage", this.handleStorageEvent);
    }
  }

  /** Handle localStorage fallback events */
  private handleStorageEvent = (event: StorageEvent): void => {
    if (event.key === IPC_CHANNEL_NAME && event.newValue) {
      try {
        const message: IPCMessage = JSON.parse(event.newValue);
        if (message.senderId !== this.instanceId) {
          this.handleMessage(message);
        }
      } catch { /* ignore parse errors */ }
    }
  };

  /** Dispatch message to registered handlers */
  private handleMessage(message: IPCMessage): void {
    // Skip if targeted at another instance
    if (message.receiverId && message.receiverId !== this.instanceId) return;

    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => {
        try { handler(message); } catch (e) { console.error("[IPC] Handler error:", e); }
      });
    }
  }

  /** Register a message handler. Returns unsubscribe function. */
  on(messageType: IPCMessageType, handler: (message: IPCMessage) => void): () => void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, new Set());
    }
    this.messageHandlers.get(messageType)!.add(handler);
    return () => { this.messageHandlers.get(messageType)?.delete(handler); };
  }

  /** Broadcast a message to all other tabs/instances */
  async broadcast(type: IPCMessageType, data: any): Promise<void> {
    if (this.isDestroyed) return;

    const message: IPCMessage = {
      id: crypto.randomUUID(),
      type,
      senderId: this.instanceId,
      data,
      timestamp: Date.now(),
    };

    if (this.channel) {
      this.channel.postMessage(message);
    } else {
      // localStorage fallback
      try {
        localStorage.setItem(IPC_CHANNEL_NAME, JSON.stringify(message));
        // Clear immediately to allow next event
        setTimeout(() => localStorage.removeItem(IPC_CHANNEL_NAME), 50);
      } catch { /* ignore */ }
    }
  }

  /** Send a message to a specific instance */
  async sendToInstance(receiverId: string, type: IPCMessageType, data: any): Promise<void> {
    if (this.isDestroyed) return;

    const message: IPCMessage = {
      id: crypto.randomUUID(),
      type,
      senderId: this.instanceId,
      receiverId,
      data,
      timestamp: Date.now(),
    };

    if (this.channel) {
      this.channel.postMessage(message);
    } else {
      try {
        localStorage.setItem(IPC_CHANNEL_NAME, JSON.stringify(message));
        setTimeout(() => localStorage.removeItem(IPC_CHANNEL_NAME), 50);
      } catch { /* ignore */ }
    }
  }

  /** Get this instance's unique ID */
  getInstanceId(): string {
    return this.instanceId;
  }

  /** Clean up resources */
  destroy(): void {
    this.isDestroyed = true;
    this.channel?.close();
    this.channel = null;
    window.removeEventListener("storage", this.handleStorageEvent);
    this.messageHandlers.clear();
  }
}

/** Singleton IPC Manager instance */
export const ipcManager = new IPCManager();
