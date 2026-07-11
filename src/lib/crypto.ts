/**
 * @file lib/crypto.ts
 * @description YYC³ Browser-Safe Cryptographic Utilities
 *   Provides AES-GCM encryption/decryption using Web Crypto API.
 *   Used for encrypting sensitive data (API keys) in localStorage.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 * @tags security,crypto,encryption
 */

// ==========================================
// AES-GCM Encryption with Web Crypto API
// ==========================================

const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const IV_LENGTH = 12 // 96 bits for AES-GCM
const SALT_LENGTH = 16

/**
 * Derive an AES-GCM key from a password using PBKDF2.
 * Each derivation uses a unique salt for security.
 */
async function deriveKey(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
    'deriveKey',
  ])

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 150000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  )
}

/**
 * Encrypt a plaintext string using AES-GCM.
 * Returns a base64 string containing: salt (16B) + IV (12B) + ciphertext.
 *
 * @param plaintext - The string to encrypt
 * @param password - The encryption password (derived via PBKDF2)
 * @returns Base64-encoded encrypted payload
 */
export async function encrypt(plaintext: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const key = await deriveKey(password, salt)

  const enc = new TextEncoder()
  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv: iv as BufferSource },
    key,
    enc.encode(plaintext),
  )

  // Combine salt + iv + ciphertext
  const combined = new Uint8Array(SALT_LENGTH + IV_LENGTH + ciphertext.byteLength)
  combined.set(salt, 0)
  combined.set(iv, SALT_LENGTH)
  combined.set(new Uint8Array(ciphertext), SALT_LENGTH + IV_LENGTH)

  // Convert to base64
  return bytesToBase64(combined)
}

/**
 * Decrypt a base64-encoded AES-GCM payload.
 *
 * @param encrypted - Base64-encoded encrypted payload (from `encrypt`)
 * @param password - The encryption password
 * @returns Decrypted plaintext string
 * @throws Error if decryption fails (wrong password or corrupted data)
 */
export async function decrypt(encrypted: string, password: string): Promise<string> {
  const combined = base64ToBytes(encrypted)
  if (combined.length < SALT_LENGTH + IV_LENGTH) {
    throw new Error('Invalid encrypted payload: too short')
  }

  const salt = combined.slice(0, SALT_LENGTH)
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
  const ciphertext = combined.slice(SALT_LENGTH + IV_LENGTH)

  const key = await deriveKey(password, salt)

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: iv as BufferSource },
    key,
    ciphertext as BufferSource,
  )

  const dec = new TextDecoder()
  return dec.decode(decrypted)
}

/**
 * Generate a secure random token (for session IDs, etc.)
 * @param length - Token length in bytes (default 32 = 256 bits)
 * @returns Hex-encoded random token
 */
export function generateSecureToken(length: number = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Hash a password using SHA-256 (for demo storage).
 * In production, use a server-side bcrypt/argon2 implementation.
 */
export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder()
  const hash = await crypto.subtle.digest('SHA-256', enc.encode(password))
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Verify a password against a SHA-256 hash.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password)
  if (computed.length !== hash.length) return false
  // Timing-safe comparison
  let result = 0
  for (let i = 0; i < computed.length; i++) {
    result |= computed.charCodeAt(i) ^ hash.charCodeAt(i)
  }
  return result === 0
}

// ==========================================
// Base64 Helpers (for Uint8Array)
// ==========================================

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}
