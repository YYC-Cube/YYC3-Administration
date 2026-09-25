/**
 * @file lib/url-host.ts
 * @description URL 主机精确匹配工具。
 *   用于替代 `url.includes('domain.com')` 式子串校验——后者可被
 *   `https://evil.com/anthropic.com` 或 `https://anthropic.com.evil.com`
 *   绕过(CodeQL: js/incomplete-url-substring-sanitization)。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags security,url,validation
 */

/**
 * 判断 URL 的 hostname 是否精确等于 `host` 或为其子域。
 * 非法 URL 返回 false(安全侧优先)。
 *
 * @example
 * isHost('https://api.anthropic.com/v1', 'anthropic.com') // true
 * isHost('https://anthropic.com.evil.com/', 'anthropic.com') // false
 * isHost('https://evil.com/?u=anthropic.com', 'anthropic.com') // false
 */
export function isHost(url: string, host: string): boolean {
  try {
    const h = new URL(url).hostname.toLowerCase()
    const target = host.toLowerCase()
    return h === target || h.endsWith('.' + target)
  } catch {
    return false
  }
}
