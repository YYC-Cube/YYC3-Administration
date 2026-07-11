/**
 * @file crypto.test.ts
 * @description YYC³ Crypto Utilities — Unit Tests
 *   Covers: AES-GCM encrypt/decrypt, password hashing, token generation.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 */

import { describe, expect, it } from 'vitest'

import {
  decrypt,
  encrypt,
  generateSecureToken,
  hashPassword,
  verifyPassword,
} from '../../src/lib/crypto'

// ==========================================
// AES-GCM Encrypt/Decrypt
// ==========================================

describe('Crypto — AES-GCM Encrypt/Decrypt', () => {
  it('should encrypt and decrypt text correctly', async () => {
    const plaintext = 'sk-1234567890abcdef'
    const password = 'my-secret-password'
    const encrypted = await encrypt(plaintext, password)

    expect(encrypted).not.toBe(plaintext)
    expect(typeof encrypted).toBe('string')

    const decrypted = await decrypt(encrypted, password)
    expect(decrypted).toBe(plaintext)
  })

  it('should produce different ciphertext for same plaintext (random IV)', async () => {
    const plaintext = 'same-data'
    const password = 'password'
    const enc1 = await encrypt(plaintext, password)
    const enc2 = await encrypt(plaintext, password)

    expect(enc1).not.toBe(enc2)

    const dec1 = await decrypt(enc1, password)
    const dec2 = await decrypt(enc2, password)
    expect(dec1).toBe(plaintext)
    expect(dec2).toBe(plaintext)
  })

  it('should fail decryption with wrong password', async () => {
    const plaintext = 'secret-data'
    const encrypted = await encrypt(plaintext, 'correct-password')

    await expect(decrypt(encrypted, 'wrong-password')).rejects.toThrow()
  })

  it('should handle empty string', async () => {
    const encrypted = await encrypt('', 'pass')
    const decrypted = await decrypt(encrypted, 'pass')
    expect(decrypted).toBe('')
  })

  it('should handle Unicode/Chinese text', async () => {
    const plaintext = '这是一个密钥 🔑 sk-test'
    const encrypted = await encrypt(plaintext, '密码')
    const decrypted = await decrypt(encrypted, '密码')
    expect(decrypted).toBe(plaintext)
  })

  it('should throw on invalid encrypted payload', async () => {
    await expect(decrypt('invalid-base64!!!', 'pass')).rejects.toThrow()
  })
})

// ==========================================
// Password Hashing
// ==========================================

describe('Crypto — Password Hashing', () => {
  it('should hash a password to a hex string', async () => {
    const hash = await hashPassword('mypassword')
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('should produce the same hash for same password', async () => {
    const hash1 = await hashPassword('test123')
    const hash2 = await hashPassword('test123')
    expect(hash1).toBe(hash2)
  })

  it('should produce different hashes for different passwords', async () => {
    const hash1 = await hashPassword('password1')
    const hash2 = await hashPassword('password2')
    expect(hash1).not.toBe(hash2)
  })
})

// ==========================================
// Password Verification
// ==========================================

describe('Crypto — Password Verification', () => {
  it('should verify correct password', async () => {
    const hash = await hashPassword('correct-pass')
    const valid = await verifyPassword('correct-pass', hash)
    expect(valid).toBe(true)
  })

  it('should reject wrong password', async () => {
    const hash = await hashPassword('correct-pass')
    const valid = await verifyPassword('wrong-pass', hash)
    expect(valid).toBe(false)
  })

  it('should reject empty password', async () => {
    const hash = await hashPassword('somepass')
    const valid = await verifyPassword('', hash)
    expect(valid).toBe(false)
  })

  it('should handle hash length mismatch safely', async () => {
    const valid = await verifyPassword('test', 'short')
    expect(valid).toBe(false)
  })
})

// ==========================================
// Token Generation
// ==========================================

describe('Crypto — Secure Token Generation', () => {
  it('should generate a hex token of expected length', () => {
    const token = generateSecureToken(32)
    expect(token).toMatch(/^[0-9a-f]{64}$/) // 32 bytes = 64 hex chars
  })

  it('should generate unique tokens', () => {
    const tokens = new Set<string>()
    for (let i = 0; i < 100; i++) {
      tokens.add(generateSecureToken(16))
    }
    expect(tokens.size).toBe(100) // All unique
  })

  it('should support custom byte length', () => {
    const token8 = generateSecureToken(8)
    const token16 = generateSecureToken(16)
    const token32 = generateSecureToken(32)

    expect(token8.length).toBe(16) // 8 bytes = 16 hex chars
    expect(token16.length).toBe(32)
    expect(token32.length).toBe(64)
  })
})
