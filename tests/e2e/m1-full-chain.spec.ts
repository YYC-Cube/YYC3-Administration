/**
 * E2E: M1 全链实地测试(P6 验收)
 * 链路:浏览器 UI 注册/登录(VITE_API_MODE 构建 → 前端走自托管 API)
 *   → preview 同源代理 /api → Hono 后端 → PostgreSQL。
 * 前置:playwright.config 双 webServer(preview:5173 + API:8787);
 *   DATABASE_URL 就绪(本地 .env / CI job services)。
 * 说明:单 test 顺序流——Playwright 每个测试均新建 context/page,
 *   认证态(Cookie)无法跨测试共享,故全链在单一 page 内连续推进;
 *   401 隔离证据用 browser fixture 独立未登录上下文对照。
 */

import { expect, test } from '@playwright/test'

const USER = 'e2e_m1_' + Date.now().toString(36)
const PASS = 'e2e-pass-' + Date.now().toString(36)

test('M1 全链:注册登录 → settings 闭环 → 配置契约 → 401 隔离', async ({ page, browser }) => {
  // 跳过 E2E 认证旁路,走真实 UI 注册(API 模式)
  await page.addInitScript(() => {
    sessionStorage.setItem('yyc3_e2e_skip_auto_login', '1')
  })
  await page.goto('/')
  const userInput = page.getByPlaceholder('admin 或 admin@yyc3.local')
  await expect(userInput).toBeVisible({ timeout: 20_000 })
  await userInput.fill(USER)
  await page.getByPlaceholder('••••••••').fill(PASS)
  // 切到注册模式:模式切换链接文案固定('注册新账户'),与提交按钮区分
  await page.getByRole('button', { name: '注册新账户' }).click()
  // 注册模式表单字段:username(保留)/email(必填,本地校验;API 契约不消费)/密码
  // (placeholder 变为校验文案'至少 6 位')/显示名称(本地校验必填,API 侧可选)
  const emailInput = page.getByPlaceholder('you@example.com')
  await expect(emailInput).toBeVisible({ timeout: 5_000 })
  await emailInput.fill(USER + '@e2e.local')
  const pwdInput = page.getByPlaceholder('至少 6 位')
  if (!(await pwdInput.inputValue())) {
    await pwdInput.fill(PASS)
  }
  await page.getByPlaceholder('您的显示名称').fill('E2E Tester')
  // 提交:精确匹配提交按钮('注册'),避开模式切换链接
  await page.getByRole('button', { name: '注册', exact: true }).click()
  // 认证成功 = 应用壳层可见(认证墙消失)
  await expect(page.locator("[data-testid='app-container']")).toBeVisible({ timeout: 20_000 })

  // ── settings 云闭环(浏览器内同源 fetch:Cookie 自动携带、CSP 同源放行) ──
  const put = await page.evaluate(async () => {
    const res = await fetch('/api/data/settings', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ data: { theme: 'cyberpunk', e2eMarker: 'M1-OK' } }),
    })
    return { status: res.status, body: await res.text() }
  })
  expect(put.status, 'PUT 响应体: ' + put.body).toBe(200)
  const putBody = JSON.parse(put.body) as {
    data: Record<string, unknown>
    updatedAt: string | null
  }
  expect(putBody.data.e2eMarker).toBe('M1-OK')
  expect(putBody.updatedAt).toBeTruthy()

  // 新浏览器请求回读(PG 持久化证据:非内存态)
  const get = await page.evaluate(async () => {
    const res = await fetch('/api/data/settings')
    return { status: res.status, body: await res.text() }
  })
  expect(get.status, 'GET 响应体: ' + get.body).toBe(200)
  const body = JSON.parse(get.body) as { data: Record<string, unknown> }
  expect(body.data.theme).toBe('cyberpunk')
  expect(body.data.e2eMarker).toBe('M1-OK')

  // ── ai-configs 契约边界(登录态列表结构;DTO 无密文由契约测试锁定) ──
  const list = await page.evaluate(async () => {
    const res = await fetch('/api/data/ai-configs')
    return { status: res.status, body: await res.text() }
  })
  expect(list.status, 'LIST 响应体: ' + list.body).toBe(200)
  const listBody = JSON.parse(list.body) as { configs: unknown[]; activeId: string | null }
  expect(Array.isArray(listBody.configs)).toBe(true)

  // ── 401 隔离对照:独立未登录上下文访问数据面必拒 ──
  const anon = await browser.newContext()
  const anonRes = await anon.request.get('http://localhost:5173/api/data/settings')
  expect(anonRes.status()).toBe(401)
  await anon.close()
})
