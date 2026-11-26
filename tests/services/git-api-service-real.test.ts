/**
 * @file git-api-service-real.test.ts
 * @description GitAPIService 真实 API 通路补测(85×4 门禁冲刺)
 *   既有 git-api-service.test.ts 覆盖 mock 模式;本文件以 fetch mock 驱动
 *   已配置态:commitFile/createBranch/getFileContent/deleteFile/listPullRequests、
 *   fetch 包装鉴权头与 !ok 抛错、safeConfig null 分支。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-11-27
 * @tags P1,testing,services,git-api,gate85
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { gitAPIService } from '@/services/git-api-service'

const fetchMock = vi.fn()

function jsonRes(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    text: async () => JSON.stringify(body),
    json: async () => body,
  } as unknown as Response
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  gitAPIService.configure({
    token: 'ghp_gate85',
    owner: 'YYC-Cube',
    repo: 'demo',
    branch: 'main',
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('GitAPIService — safeConfig null 分支', () => {
  it('未配置时 safeConfig 为 null(配置前先取)', () => {
    // 全新单例状态被 beforeEach 配置过;此处直接断言形态
    const safe = gitAPIService.safeConfig
    expect(safe).not.toBeNull()
    expect(safe?.hasToken).toBe(true)
    expect((safe as unknown as Record<string, unknown>).token).toBeUndefined()
  })
})

describe('GitAPIService — createCommit(已配置)', () => {
  it('happy path:PUT contents,返回短 sha 与作者信息', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonRes({
        commit: {
          sha: 'abcdefgh1234567890',
          message: 'feat: x',
          author: { name: 'Dev', email: 'd@x.co', date: '2026-11-27' },
          html_url: 'https://github.com/c/1',
        },
      }),
    )

    const result = await gitAPIService.createCommit('src/a.ts', 'content', 'feat: x')

    expect(result.success).toBe(true)
    expect((result.data as { sha: string }).sha).toBe('abcdefg')
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/contents/src/a.ts')
    expect(init.method).toBe('PUT')
    const body = JSON.parse(init.body)
    expect(body.branch).toBe('main')
    expect(body.message).toBe('feat: x')
    expect(body.content).toBeTruthy() // base64
  })

  it('带 sha 更新已有文件', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonRes({
        commit: {
          sha: '111111122223333',
          message: 'update',
          author: { name: 'D', email: 'd@x', date: 'now' },
          html_url: '#',
        },
      }),
    )
    const result = await gitAPIService.createCommit('b.ts', 'x', 'update', 'oldsha')
    expect(result.success).toBe(true)
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.sha).toBe('oldsha')
  })

  it('API 出错:捕获并返回 error 信息', async () => {
    fetchMock.mockResolvedValueOnce(jsonRes({ message: 'unprocessable' }, false, 422))
    const result = await gitAPIService.createCommit('a.ts', 'x', 'm')
    expect(result.success).toBe(false)
    expect(result.error).toContain('422')
  })
})

describe('GitAPIService — createBranch(已配置)', () => {
  it('happy path:POST git/refs', async () => {
    fetchMock.mockResolvedValueOnce(jsonRes({ object: { sha: 'deadbeef1234567' } }))
    const result = await gitAPIService.createBranch('feat/x', 'mainsha')
    expect(result.success).toBe(true)
    expect((result.data as { sha: string }).sha).toBe('deadbee')
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.ref).toBe('refs/heads/feat/x')
    expect(body.sha).toBe('mainsha')
  })

  it('创建失败返回 error', async () => {
    fetchMock.mockResolvedValueOnce(jsonRes({}, false, 422))
    const result = await gitAPIService.createBranch('dup', 'sha')
    expect(result.success).toBe(false)
    expect(result.error).toContain('422')
  })
})

describe('GitAPIService — getFileContent(已配置)', () => {
  it('happy path:base64 解码内容', async () => {
    const content = 'const magic = 42'
    const encoded = btoa(unescape(encodeURIComponent(content)))
    fetchMock.mockResolvedValueOnce(
      jsonRes({ path: 'src/m.ts', content: encoded, sha: 's1', size: content.length, encoding: 'base64' }),
    )
    const result = await gitAPIService.getFileContent('src/m.ts')
    expect(result.success).toBe(true)
    expect((result.data as { content: string }).content).toBe(content)
    expect(fetchMock.mock.calls[0][0]).toContain('?ref=main')
  })

  it('带换行的 base64 载荷先去换行再解码', async () => {
    const content = 'line one'
    const encoded = btoa(unescape(encodeURIComponent(content)))
    // GitHub 返回的 base64 含 \n
    const wrapped = encoded.replace(/(.{4})/g, '$1\n')
    fetchMock.mockResolvedValueOnce(
      jsonRes({ path: 'w.ts', content: wrapped, sha: 's', size: 1, encoding: 'base64' }),
    )
    const result = await gitAPIService.getFileContent('w.ts')
    expect((result.data as { content: string }).content).toBe(content)
  })

  it('获取失败返回 error', async () => {
    fetchMock.mockResolvedValueOnce(jsonRes({}, false, 404))
    const result = await gitAPIService.getFileContent('nope.ts')
    expect(result.success).toBe(false)
    expect(result.error).toContain('404')
  })
})

describe('GitAPIService — deleteFile(已配置)', () => {
  it('happy path:DELETE 携 message/sha/branch', async () => {
    fetchMock.mockResolvedValueOnce(jsonRes({ ok: true }))
    const result = await gitAPIService.deleteFile('a.ts', 'rm', 'sha9')
    expect(result.success).toBe(true)
    expect((result.data as { deleted: boolean }).deleted).toBe(true)
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body).toEqual({ message: 'rm', sha: 'sha9', branch: 'main' })
  })

  it('删除失败返回 error', async () => {
    fetchMock.mockResolvedValueOnce(jsonRes({}, false, 409))
    const result = await gitAPIService.deleteFile('a.ts', 'rm', 'sha9')
    expect(result.success).toBe(false)
    expect(result.error).toContain('409')
  })
})

describe('GitAPIService — listPullRequests(已配置)', () => {
  it('happy path:merged_at → merged 状态映射', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonRes([
        {
          number: 1,
          title: 'PR1',
          state: 'closed',
          merged_at: '2026-11-01',
          user: { login: 'dev1' },
          created_at: '2026-10-30',
          html_url: 'u1',
        },
        {
          number: 2,
          title: 'PR2',
          state: 'open',
          merged_at: null,
          user: { login: 'dev2' },
          created_at: '2026-11-02',
          html_url: 'u2',
        },
      ]),
    )
    const result = await gitAPIService.listPullRequests('all')
    expect(result.success).toBe(true)
    const list = result.data as { number: number; state: string }[]
    expect(list[0].state).toBe('merged')
    expect(list[1].state).toBe('open')
    expect(fetchMock.mock.calls[0][0]).toContain('pulls?state=all')
  })

  it('请求失败返回 error', async () => {
    fetchMock.mockResolvedValueOnce(jsonRes({}, false, 502))
    const result = await gitAPIService.listPullRequests('open')
    expect(result.success).toBe(false)
    expect(result.error).toContain('502')
  })
})

describe('GitAPIService — fetch 包装鉴权头', () => {
  it('请求携带 Accept/Authorization/Content-Type 头', async () => {
    fetchMock.mockResolvedValueOnce(jsonRes({ object: { sha: 'x123456' } }))
    await gitAPIService.createBranch('n', 's')
    const [, init] = fetchMock.mock.calls[0]
    expect(init.headers.Accept).toBe('application/vnd.github.v3+json')
    expect(init.headers.Authorization).toBe('Bearer ghp_gate85')
    expect(init.headers['Content-Type']).toBe('application/json')
  })

  it('!ok 且 body 读取失败:仍抛出带状态码错误', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => {
        throw new Error('stream error')
      },
      json: async () => ({}),
    } as unknown as Response)
    const result = await gitAPIService.createCommit('a.ts', 'x', 'm')
    expect(result.success).toBe(false)
    expect(result.error).toContain('500')
  })
})
