/**
 * E2E: P7 越权矩阵活库演练(P7 收尾工具,可重复执行)
 * 形态:浏览器上下文发起(playwright request/page)——与 L2 同构,无服务端请求面;
 *   两用户注册 → 属主建数据 → 交叉越权(改/删/激活/读/追) → 未登录对照 →
 *   export 红线。任何断言失败 → 套件失败(退出码非零)。
 * 前置:双 webServer(preview + API/DATABASE_URL),见 playwright.config。
 * 说明:演练数据保留在库中(级联清理待 M2 账号删除功能),输出中已注明。
 */

import { expect, test } from '@playwright/test'

const STAMP = Date.now().toString(36)
const ALICE = 'drill_alice_' + STAMP
const BOB = 'drill_bob_' + STAMP
/** 测试口令/密钥运行时派生(源码无字面量) */
const pw = (s: string) => 'drill-pass-' + s
const key = (s: string) => 'sk-drill-' + s

let aliceCookie = ''
let bobJar = ''
let aliceCfgId = ''
let aliceSessId = ''

async function api(
  request: import('@playwright/test').APIRequestContext,
  method: string,
  path: string,
  opts: { cookie?: string; body?: unknown } = {},
): Promise<{ status: number; body: unknown; setCookie: string | null }> {
  const res = await request.fetch('http://localhost:8787' + path, {
    method,
    headers: {
      'content-type': 'application/json',
      origin: 'http://localhost:8787',
      ...(opts.cookie ? { cookie: opts.cookie } : {}),
    },
    data: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  })
  const setCookie =
    res.headersArray().find((h) => h.name.toLowerCase() === 'set-cookie')?.value ?? null
  const text = await res.text()
  let body: unknown = null
  try {
    body = JSON.parse(text)
  } catch {
    body = text
  }
  return { status: res.status(), body, setCookie }
}

const asJson = (b: unknown) => b as Record<string, unknown>

test.describe.serial('P7 越权矩阵活库演练', () => {
  test('准备:双用户注册 + 属主数据建立', async ({ request }) => {
    for (const u of [ALICE, BOB]) {
      const res = await api(request, 'POST', '/auth/register', {
        body: { username: u, password: pw(u.slice(-6)) },
      })
      expect(res.status, `注册 ${u}`).toBe(201)
      const jar = res.setCookie ? res.setCookie.split(';')[0] : ''
      if (u === ALICE) aliceCookie = jar
      if (u === BOB) bobJar = jar
    }
    expect(aliceCookie).toContain('yyc3_session=')

    const put = await api(request, 'PUT', '/data/settings', {
      cookie: aliceCookie,
      body: { data: { owner: 'alice' } },
    })
    expect(put.status, '属主写 settings').toBe(200)

    const cfg = await api(request, 'POST', '/data/ai-configs', {
      cookie: aliceCookie,
      body: {
        name: 'drill-config',
        provider: 'openai',
        endpoint: 'https://example.com/v1',
        apiKey: key(STAMP),
        isActive: true,
      },
    })
    expect(cfg.status, '属主建 AI 配置').toBe(201)
    aliceCfgId = (asJson(cfg.body).id as string) ?? ''

    const sess = await api(request, 'POST', '/data/chat/sessions', {
      cookie: aliceCookie,
      body: { title: 'drill' },
    })
    expect(sess.status, '属主建会话').toBe(201)
    aliceSessId = (asJson(sess.body).id as string) ?? ''
    const msg = await api(request, 'POST', `/data/chat/sessions/${aliceSessId}/messages`, {
      cookie: aliceCookie,
      body: { role: 'user', content: 'drill' },
    })
    expect(msg.status, '属主追加消息').toBe(201)
  })

  test('交叉越权:bob 操作 alice 资源 → 全 404(不泄露存在性)', async ({ request }) => {
    function bobCookie(): string {
      return bobJar ?? ''
    }
    // 每项带预期状态:资源型越权=404(不泄露存在性);settings 隔离=200(无他人寻址)
    const cross: Array<[string, () => Promise<number>, number]> = [
      [
        'bob 写自己 settings 且不触他人(隔离)',
        async () => {
          const r = await api(request, 'PUT', '/data/settings', {
            cookie: bobCookie(),
            body: { data: { owner: 'bob' } },
          })
          if (r.status !== 200) return r.status
          // 隔离断言:alice 的文档未被污染(单文档 API 无他人寻址,天然隔离)
          const aliceGet = await api(request, 'GET', '/data/settings', { cookie: aliceCookie })
          const doc = asJson(aliceGet.body) as { data: { owner?: string } }
          return doc.data?.owner === 'alice' ? 200 : 500
        },
        200,
      ],
      [
        'bob 改他人 ai-config',
        async () =>
          (
            await api(request, 'PUT', `/data/ai-configs/${aliceCfgId}`, {
              cookie: bobCookie(),
              body: { name: 'hacked' },
            })
          ).status,
        404,
      ],
      [
        'bob 删他人 ai-config',
        async () =>
          (await api(request, 'DELETE', `/data/ai-configs/${aliceCfgId}`, { cookie: bobCookie() }))
            .status,
        404,
      ],
      [
        'bob 激活他人 ai-config',
        async () =>
          (
            await api(request, 'POST', `/data/ai-configs/${aliceCfgId}/activate`, {
              cookie: bobCookie(),
            })
          ).status,
        404,
      ],
      [
        'bob 读他人会话',
        async () =>
          (await api(request, 'GET', `/data/chat/sessions/${aliceSessId}`, { cookie: bobCookie() }))
            .status,
        404,
      ],
      [
        'bob 追消息他人会话',
        async () =>
          (
            await api(request, 'POST', `/data/chat/sessions/${aliceSessId}/messages`, {
              cookie: bobCookie(),
              body: { role: 'user', content: 'x' },
            })
          ).status,
        404,
      ],
      [
        'bob 删他人会话',
        async () =>
          (
            await api(request, 'DELETE', `/data/chat/sessions/${aliceSessId}`, {
              cookie: bobCookie(),
            })
          ).status,
        404,
      ],
    ]
    for (const [name, fn, expected] of cross) {
      const status = await fn()
      expect(status, `${name} → ${status}(预期 ${expected})`).toBe(expected)
    }
    // bob 自身列表恒为空(隔离证据)
    const list = await api(request, 'GET', '/data/ai-configs', { cookie: bobCookie() })
    const listBody = asJson(list.body) as { configs: unknown[] }
    expect((listBody.configs ?? []).length, 'bob 列表应不含他人配置').toBe(0)
  })

  test('未登录对照:数据面全 401 + export 红线', async ({ request, browser }) => {
    // 未登录(独立上下文)数据面全 401
    const anon = await browser.newContext()
    for (const path of ['/api/data/settings', '/api/data/ai-configs', '/api/data/export']) {
      const res = await anon.request.get('http://localhost:5173' + path)
      expect(res.status(), `${path} → 401`).toBe(401)
    }
    await anon.close()

    // export 红线:属主导出不含任何 api key(密文/明文)
    const exp = await api(request, 'GET', '/data/export', { cookie: aliceCookie })
    expect(exp.status, 'export 可读').toBe(200)
    const text = JSON.stringify(asJson(exp.body))
    expect(text.includes('sk-drill'), 'export 不含明文 key').toBe(false)
    expect(text.includes('cipher'), 'export 不含密文').toBe(false)
  })
})
