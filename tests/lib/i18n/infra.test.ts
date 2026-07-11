/**
 * @file infra.test.ts
 * @description i18n 基础设施模块单元测试（backoff / rate-limit）
 * @author YanYuCloudCube Team <admin@0379.email>
 */

import { describe, expect, it, vi } from 'vitest'

import {
  type BackoffPolicy,
  computeBackoff,
  createRetryRunner,
  DEFAULT_BACKOFF_POLICY,
  sleepWithAbort,
} from '../../../src/lib/i18n/infra/backoff'
import { createFixedWindowRateLimiter } from '../../../src/lib/i18n/infra/rate-limit'

// ==========================================
// computeBackoff
// ==========================================

describe('computeBackoff — 指数退避计算', () => {
  const policy: BackoffPolicy = {
    initialMs: 1000,
    maxMs: 30000,
    factor: 2,
    jitter: 0,
  }

  it('第一次重试延迟 = initialMs', () => {
    expect(computeBackoff(policy, 1)).toBe(1000)
  })

  it('第二次重试延迟 = initialMs * factor', () => {
    expect(computeBackoff(policy, 2)).toBe(2000)
  })

  it('第三次重试延迟 = initialMs * factor^2', () => {
    expect(computeBackoff(policy, 3)).toBe(4000)
  })

  it('不超过 maxMs', () => {
    const smallMaxPolicy: BackoffPolicy = { ...policy, maxMs: 5000 }
    expect(computeBackoff(smallMaxPolicy, 10)).toBe(5000)
  })

  it('jitter > 0 时增加随机性', () => {
    const jitterPolicy: BackoffPolicy = { ...policy, jitter: 0.5 }
    const delay = computeBackoff(jitterPolicy, 1)
    // base=1000, jitter 最大=500，所以 delay 在 1000-1500 之间
    expect(delay).toBeGreaterThanOrEqual(1000)
    expect(delay).toBeLessThanOrEqual(1500)
  })
})

describe('DEFAULT_BACKOFF_POLICY — 默认策略', () => {
  it('包含合理的默认值', () => {
    expect(DEFAULT_BACKOFF_POLICY.initialMs).toBe(1000)
    expect(DEFAULT_BACKOFF_POLICY.maxMs).toBe(30000)
    expect(DEFAULT_BACKOFF_POLICY.factor).toBe(2)
    expect(DEFAULT_BACKOFF_POLICY.jitter).toBe(0.1)
  })
})

// ==========================================
// sleepWithAbort
// ==========================================

describe('sleepWithAbort — 可中止的延时', () => {
  it('正常完成', async () => {
    const start = Date.now()
    await sleepWithAbort(50)
    const elapsed = Date.now() - start
    expect(elapsed).toBeGreaterThanOrEqual(40)
  })

  it('参数 <= 0 立即返回', async () => {
    await sleepWithAbort(0)
    await sleepWithAbort(-1)
    // 不抛出错误即可
  })

  it('被 AbortSignal 中止时 reject', async () => {
    const controller = new AbortController()
    const promise = sleepWithAbort(10000, controller.signal)
    setTimeout(() => controller.abort(), 10)
    await expect(promise).rejects.toThrow('aborted')
  })
})

// ==========================================
// createRetryRunner
// ==========================================

describe('createRetryRunner — 重试运行器', () => {
  it('第一次成功不重试', async () => {
    const fn = vi.fn().mockResolvedValue('ok')
    const retry = createRetryRunner<string>({ maxAttempts: 3 })
    const result = await retry(fn)
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('失败后重试直到成功', async () => {
    let attempt = 0
    const fn = vi.fn().mockImplementation(async () => {
      attempt++
      if (attempt < 3) throw new Error('fail')
      return 'success'
    })
    const retry = createRetryRunner<string>({
      maxAttempts: 3,
      backoffPolicy: { initialMs: 1, maxMs: 10, factor: 2, jitter: 0 },
    })
    const result = await retry(fn)
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('超过最大重试次数后抛出错误', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fail'))
    const retry = createRetryRunner<string>({
      maxAttempts: 2,
      backoffPolicy: { initialMs: 1, maxMs: 5, factor: 2, jitter: 0 },
    })
    await expect(retry(fn)).rejects.toThrow('always fail')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('shouldRetry 返回 false 时不重试', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('no-retry'))
    const retry = createRetryRunner<string>({
      maxAttempts: 5,
      shouldRetry: () => false,
    })
    await expect(retry(fn)).rejects.toThrow('no-retry')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('使用默认 maxAttempts=3', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'))
    const retry = createRetryRunner({
      maxAttempts: 3,
      backoffPolicy: { initialMs: 1, maxMs: 5, factor: 2, jitter: 0 },
    })
    await expect(retry(fn)).rejects.toThrow('fail')
    expect(fn).toHaveBeenCalledTimes(3)
  })
})

// ==========================================
// createFixedWindowRateLimiter
// ==========================================

describe('createFixedWindowRateLimiter — 固定窗口限流', () => {
  it('在限制内允许请求', () => {
    const limiter = createFixedWindowRateLimiter({
      maxRequests: 5,
      windowMs: 10000,
    })
    for (let i = 0; i < 5; i++) {
      const result = limiter.consume()
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(4 - i)
    }
  })

  it('超过限制时拒绝', () => {
    const limiter = createFixedWindowRateLimiter({
      maxRequests: 3,
      windowMs: 10000,
    })
    limiter.consume()
    limiter.consume()
    limiter.consume()
    const result = limiter.consume()
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('rejected 时返回 retryAfterMs > 0', () => {
    let fakeNow = 1000
    const limiter = createFixedWindowRateLimiter({
      maxRequests: 1,
      windowMs: 5000,
      now: () => fakeNow,
    })
    limiter.consume() // windowStartMs stays 0 since 1000-0 < 5000
    fakeNow = 2000 // 1秒后
    const result = limiter.consume()
    expect(result.allowed).toBe(false)
    // retryAfterMs = windowStartMs(0) + windowMs(5000) - nowMs(2000) = 3000
    expect(result.retryAfterMs).toBe(3000)
  })

  it('窗口重置后允许新请求', () => {
    let fakeNow = 0
    const limiter = createFixedWindowRateLimiter({
      maxRequests: 2,
      windowMs: 1000,
      now: () => fakeNow,
    })
    limiter.consume()
    limiter.consume()
    expect(limiter.consume().allowed).toBe(false)

    fakeNow = 1001 // 窗口过期
    expect(limiter.consume().allowed).toBe(true)
    expect(limiter.consume().allowed).toBe(true)
    expect(limiter.consume().allowed).toBe(false)
  })

  it('reset 重置计数器', () => {
    const limiter = createFixedWindowRateLimiter({
      maxRequests: 2,
      windowMs: 10000,
    })
    limiter.consume()
    limiter.consume()
    expect(limiter.consume().allowed).toBe(false)
    limiter.reset()
    expect(limiter.consume().allowed).toBe(true)
  })

  it('maxRequests 最小为 1', () => {
    const limiter = createFixedWindowRateLimiter({
      maxRequests: 0,
      windowMs: 1000,
    })
    // maxRequests 被 clamp 到 1
    expect(limiter.consume().allowed).toBe(true)
    expect(limiter.consume().allowed).toBe(false)
  })
})
