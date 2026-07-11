/**
 * @file secure-storage.test.ts
 * @description YYC³ Secure Storage — Unit Tests
 *   Covers: encrypted set/get, migration, removal, error handling.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 */

import { beforeEach, describe, expect, it } from 'vitest'

import {
  getSecure,
  hasSecure,
  migrateToSecure,
  removeSecure,
  setSecure,
} from '../../src/lib/secure-storage'

// ==========================================
// Setup: Clear localStorage before each test
// ==========================================

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

// ==========================================
// Tests
// ==========================================

describe('SecureStorage — Encrypted Set/Get', () => {
  it('should encrypt and store a value', async () => {
    await setSecure('api_key', 'sk-test-12345')
    const raw = localStorage.getItem('yyc3_enc_api_key')
    expect(raw).not.toBeNull()
    expect(raw).toContain('__encrypted__:')
    expect(raw).not.toContain('sk-test-12345')
  })

  it('should decrypt and return the value', async () => {
    await setSecure('api_key', 'sk-test-12345')
    const value = await getSecure('api_key')
    expect(value).toBe('sk-test-12345')
  })

  it('should return null for non-existent key', async () => {
    const value = await getSecure('nonexistent')
    expect(value).toBeNull()
  })

  it('should handle Unicode values', async () => {
    await setSecure('unicode_key', '密钥 🔑 ñ é ü')
    const value = await getSecure('unicode_key')
    expect(value).toBe('密钥 🔑 ñ é ü')
  })

  it('should overwrite existing value', async () => {
    await setSecure('key', 'value1')
    await setSecure('key', 'value2')
    const value = await getSecure('key')
    expect(value).toBe('value2')
  })
})

describe('SecureStorage — hasSecure', () => {
  it('should return true for existing key', async () => {
    await setSecure('exists', 'data')
    expect(hasSecure('exists')).toBe(true)
  })

  it('should return false for non-existent key', () => {
    expect(hasSecure('missing')).toBe(false)
  })
})

describe('SecureStorage — removeSecure', () => {
  it('should remove a stored value', async () => {
    await setSecure('temp', 'data')
    expect(hasSecure('temp')).toBe(true)

    removeSecure('temp')
    expect(hasSecure('temp')).toBe(false)
    expect(await getSecure('temp')).toBeNull()
  })
})

describe('SecureStorage — migrateToSecure', () => {
  it('should migrate plaintext to encrypted storage', async () => {
    // Set plaintext value (simulating legacy data)
    localStorage.setItem('legacy_key', 'plaintext-value')

    await migrateToSecure('legacy_key')

    // Should now be in secure storage
    expect(hasSecure('legacy_key')).toBe(true)
    const value = await getSecure('legacy_key')
    expect(value).toBe('plaintext-value')

    // Original plaintext should be removed
    expect(localStorage.getItem('legacy_key')).toBeNull()
  })

  it('should not re-migrate if already encrypted', async () => {
    await setSecure('already_secure', 'encrypted-value')
    const rawBefore = localStorage.getItem('yyc3_enc_already_secure')

    await migrateToSecure('already_secure')

    const rawAfter = localStorage.getItem('yyc3_enc_already_secure')
    expect(rawAfter).toBe(rawBefore)
  })

  it('should handle non-existent plaintext gracefully', async () => {
    await migrateToSecure('nonexistent_plain')
    expect(hasSecure('nonexistent_plain')).toBe(false)
  })
})
