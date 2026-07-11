/**
 * @file lib/secure-storage.ts
 * @description YYC³ Secure Storage — AES-GCM encrypted localStorage wrapper.
 *   Replaces plaintext localStorage for sensitive data (API keys, tokens).
 *   Uses Web Crypto API (AES-GCM + PBKDF2) for browser-safe encryption.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 * @tags security,storage,encryption
 */

import { decrypt, encrypt } from './crypto'

// ==========================================
// Types
// ==========================================

const STORAGE_PREFIX = 'yyc3_enc_'
const KEY_MARKER = '__encrypted__:'

// Master key is derived from a combination of:
// 1. A static app secret (compiled into the bundle)
// 2. A per-session random salt stored in sessionStorage
// This prevents trivial localStorage inspection while remaining browser-only.
// For true security, use a backend proxy with server-side key management.

const APP_SECRET = 'YYC3-Administration-v1-2026'
const SALT_KEY = 'yyc3_master_salt'

// ==========================================
// Master Key Management
// ==========================================

let cachedMasterKey: string | null = null

/**
 * Get or create the master encryption key.
 * The key is derived from APP_SECRET + a random salt stored in sessionStorage.
 */
function getMasterKey(): string {
  if (cachedMasterKey) return cachedMasterKey

  let salt = sessionStorage.getItem(SALT_KEY)
  if (!salt) {
    // Generate a random salt on first load
    const bytes = crypto.getRandomValues(new Uint8Array(16))
    salt = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    sessionStorage.setItem(SALT_KEY, salt)
  }

  cachedMasterKey = `${APP_SECRET}:${salt}`
  return cachedMasterKey
}

/**
 * Reset the master key (forces re-encryption of all data).
 * Call this on logout to invalidate cached encrypted data.
 */
export function resetMasterKey(): void {
  cachedMasterKey = null
  sessionStorage.removeItem(SALT_KEY)
}

// ==========================================
// Public API
// ==========================================

/**
 * Encrypt and store a value in localStorage.
 * The value is encrypted with AES-GCM before being persisted.
 *
 * @param key - Storage key (will be prefixed internally)
 * @param value - Plaintext value to encrypt and store
 */
export async function setSecure(key: string, value: string): Promise<void> {
  try {
    const masterKey = getMasterKey()
    const encrypted = await encrypt(value, masterKey)
    localStorage.setItem(STORAGE_PREFIX + key, KEY_MARKER + encrypted)
  } catch (err) {
    console.error(`SecureStorage: Failed to encrypt key "${key}"`, err)
    // Fallback: do not store plaintext, fail gracefully
  }
}

/**
 * Retrieve and decrypt a value from localStorage.
 *
 * @param key - Storage key
 * @returns Decrypted plaintext value, or null if not found/decryption failed
 */
export async function getSecure(key: string): Promise<string | null> {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key)
    if (!raw) return null

    // Check for encrypted marker
    if (!raw.startsWith(KEY_MARKER)) {
      // Legacy plaintext data — return as-is for migration
      return raw
    }

    const encrypted = raw.slice(KEY_MARKER.length)
    const masterKey = getMasterKey()
    return await decrypt(encrypted, masterKey)
  } catch (err) {
    console.error(`SecureStorage: Failed to decrypt key "${key}"`, err)
    return null
  }
}

/**
 * Remove a value from secure storage.
 * @param key - Storage key
 */
export function removeSecure(key: string): void {
  localStorage.removeItem(STORAGE_PREFIX + key)
}

/**
 * Migrate a plaintext localStorage value to encrypted storage.
 * If the key exists in plaintext (no marker), encrypts and re-stores it.
 *
 * @param key - The original (unprefixed) storage key to migrate
 */
export async function migrateToSecure(key: string): Promise<void> {
  try {
    // Check if already migrated
    const existing = localStorage.getItem(STORAGE_PREFIX + key)
    if (existing && existing.startsWith(KEY_MARKER)) return

    // Check for plaintext value at the original key
    const plaintext = localStorage.getItem(key)
    if (plaintext) {
      await setSecure(key, plaintext)
      localStorage.removeItem(key) // Remove plaintext copy
    }
  } catch {
    // Migration failure is non-fatal
  }
}

/**
 * Check if a key exists in secure storage.
 */
export function hasSecure(key: string): boolean {
  const raw = localStorage.getItem(STORAGE_PREFIX + key)
  return raw !== null
}
