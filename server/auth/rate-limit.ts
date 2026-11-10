/**
 * @file server/auth/rate-limit.ts
 * @description YYC³ Administration 自托管后端 —— 认证限流(P3, F-19 清偿)
 *   内存滑动窗口(单实例部署足够;多实例时换共享存储,P8 评估)。
 *   策略:login 5 次/60s(键=ip:username),register 3 次/1h(键=ip)。
 *   时间源可注入(now)以便测试;条目在访问时惰性修剪,无后台定时器。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags backend,p3,auth,rate-limit
 */

export interface RateLimitOptions {
  windowMs: number
  max: number
  now?: () => number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSec: number
}

export function createRateLimiter(opts: RateLimitOptions) {
  const hits = new Map<string, number[]>()
  const now = opts.now ?? (() => Date.now())

  return {
    check(key: string): RateLimitResult {
      const t = now()
      const windowStart = t - opts.windowMs
      const recent = (hits.get(key) ?? []).filter((ts) => ts > windowStart)
      if (recent.length >= opts.max) {
        hits.set(key, recent)
        const retryAfterSec = Math.max(1, Math.ceil((recent[0] + opts.windowMs - t) / 1000))
        return { allowed: false, remaining: 0, retryAfterSec }
      }
      recent.push(t)
      hits.set(key, recent)
      return { allowed: true, remaining: opts.max - recent.length, retryAfterSec: 0 }
    },
  }
}

export const loginLimiter = createRateLimiter({ windowMs: 60_000, max: 5 })
export const registerLimiter = createRateLimiter({ windowMs: 3_600_000, max: 3 })
