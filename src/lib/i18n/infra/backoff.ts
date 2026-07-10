/**
 * file backoff.ts
 * description 指数退避重试
 * module @yyc3/i18n-core
 * author YanYuCloudCube Team <admin@0379.email>
 * version 2.3.0
 * created 2026-04-24
 * updated 2026-04-24
 * status active
 * tags [module],[infra]
 *
 * copyright YanYuCloudCube Team
 * license MIT
 *
 * brief 指数退避重试
 */
// Browser-compatible sleep — no node:timers/promises dependency

export type BackoffPolicy = {
  initialMs: number
  maxMs: number
  factor: number
  jitter: number
}

const DEFAULT_BACKOFF_POLICY: BackoffPolicy = {
  initialMs: 1000,
  maxMs: 30000,
  factor: 2,
  jitter: 0.1,
}

export function computeBackoff(policy: BackoffPolicy, attempt: number): number {
  const base = policy.initialMs * policy.factor ** Math.max(attempt - 1, 0)
  const jitter = base * policy.jitter * Math.random()
  return Math.min(policy.maxMs, Math.round(base + jitter))
}

export async function sleepWithAbort(ms: number, abortSignal?: AbortSignal): Promise<void> {
  if (ms <= 0) {
    return
  }
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => resolve(), ms)
    abortSignal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(new Error('aborted'))
      },
      { once: true },
    )
  })
}

export function createRetryRunner<T>(options: {
  maxAttempts?: number
  backoffPolicy?: Partial<BackoffPolicy>
  shouldRetry?: (error: Error, attempt: number) => boolean
}) {
  const maxAttempts = options.maxAttempts ?? 3
  const policy: BackoffPolicy = { ...DEFAULT_BACKOFF_POLICY, ...options.backoffPolicy }
  const shouldRetry = options.shouldRetry ?? ((_: Error, attempt: number) => attempt < maxAttempts)

  return async function retryRunner(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        if (!shouldRetry(lastError, attempt)) {
          throw lastError
        }

        if (attempt < maxAttempts) {
          const delayMs = computeBackoff(policy, attempt)
          await sleepWithAbort(delayMs)
        }
      }
    }

    throw lastError!
  }
}

export { DEFAULT_BACKOFF_POLICY }
