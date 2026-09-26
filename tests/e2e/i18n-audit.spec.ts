/**
 * E2E Test: 全局 i18n 审计(中英文语言切换可用性 + 全页面统一性)
 *
 * 三层检测:
 *   1. 可用性——登录页/顶栏/设置页三处语言入口真实点击切换 + localStorage 持久化
 *   2. 覆盖——37 个导航页面 × {zh, en} 全量遍历,检测原始 key 泄漏(t 未命中回落)
 *   3. 量化——EN 模式下页面可见 CJK 字符计数(硬编码中文残留指标),产出 JSON 报告
 *
 * 产物: test-results/i18n-audit-report.json
 * 基线模式: I18N_AUDIT_REPORT_ONLY=1 时仅产出报告不做硬断言(用于修复前取证)
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { expect, type Page, test } from '@playwright/test'

import { CATEGORY_ENTRY, dismissOnboarding, navigateTo, openApp } from './helpers'
import { CATEGORY_PAGES } from './page-registry'

const REPORT_ONLY = process.env.I18N_AUDIT_REPORT_ONLY === '1'

/** t() 命名空间前缀 → 原始 key 泄漏检测(已知 namespace 集合,规避 URL/版本号误报) */
const T_NAMESPACES = [
  'nav',
  'stg',
  'ch',
  'collab',
  'di',
  'ma',
  'tools',
  'care',
  'ndb',
  'cb',
  'quickActions',
  'brand',
  'dash',
  'call',
  'onboard',
  'forms',
  'chat',
  'auth',
  'profile',
  'common',
  'clm',
  'smart',
  'theme',
  'salary',
  'finance',
  'inv',
  'prc',
  'wx',
  'param',
  'plt',
  'integ',
  'eb',
  'log',
  'mp',
  'cmd',
]
const RAW_KEY_RE = new RegExp(
  `(?:^|[\\s>])(?:${T_NAMESPACES.join('|')})\\.[A-Za-z0-9]+(?:\\.[A-Za-z0-9]+)+`,
  'g',
)
const CJK_RE = /[\u4e00-\u9fff]/g

interface PageAudit {
  locale: string
  pageId: string
  rawKeys: string[]
  cjkCount: number
  cjkSamples: string[]
}

const auditResults: PageAudit[] = []

/** 遍历全部导航页面并采集文本指标 */
async function auditAllPages(page: Page, locale: 'zh' | 'en'): Promise<void> {
  for (const [category, pages] of Object.entries(CATEGORY_PAGES)) {
    for (const pageId of pages) {
      await navigateTo(page, CATEGORY_ENTRY[category as keyof typeof CATEGORY_ENTRY], pageId)
      const text = await page.locator('[data-testid="app-container"]').innerText({ timeout: 15000 })
      const rawKeys = [...new Set((text.match(RAW_KEY_RE) ?? []).map((s) => s.trim()))]
      const cjkMatches = text.match(CJK_RE) ?? []
      auditResults.push({
        locale,
        pageId,
        rawKeys,
        cjkCount: cjkMatches.length,
        cjkSamples: locale === 'en' ? [...new Set(cjkMatches)].slice(0, 12) : [],
      })
    }
  }
}

async function writeReport(): Promise<void> {
  const dir = 'test-results'
  mkdirSync(dir, { recursive: true })
  const summary = {
    generatedAt: new Date().toISOString(),
    totalAudits: auditResults.length,
    pagesWithRawKeys: auditResults
      .filter((r) => r.rawKeys.length > 0)
      .map((r) => `${r.locale}:${r.pageId}`),
    enCjkTotal: auditResults.filter((r) => r.locale === 'en').reduce((s, r) => s + r.cjkCount, 0),
    enCjkByPage: Object.fromEntries(
      auditResults
        .filter((r) => r.locale === 'en' && r.cjkCount > 0)
        .map((r) => [r.pageId, r.cjkCount] as const)
        .sort((a, b) => b[1] - a[1]),
    ),
    audits: auditResults,
  }
  writeFileSync(path.join(dir, 'i18n-audit-report.json'), JSON.stringify(summary, null, 2))
}

test.describe.configure({ mode: 'serial' })

test.describe('E2E-I18N: 语言切换可用性', () => {
  test('I18N-UI-001 登录页: 默认中文,切换英文即时生效并持久化', async ({ page }) => {
    await dismissOnboarding(page)
    // 跳过 E2E 自动登录,进入真实未登录态
    // 注意: 全新 context 的 localStorage 本为空(默认 zh),此处不得 removeItem——
    // addInitScript 在每次导航(含下方 reload)都会重新执行,会破坏持久化验证
    await page.addInitScript(() => {
      sessionStorage.setItem('yyc3_e2e_skip_auto_login', '1')
    })
    await page.goto('/')
    await page.waitForLoadState('load')

    // 默认中文: 用户名标签 + 登录按钮
    const userLabel = page.getByText('用户名 / 邮箱', { exact: true })
    await expect(userLabel).toBeVisible({ timeout: 15000 })
    await expect(page.getByRole('button', { name: '登录', exact: true })).toBeVisible()

    // 切换到英文
    await page.getByRole('button', { name: /English/ }).click()
    await expect(page.getByText('Username / Email', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In', exact: true })).toBeVisible()

    // 持久化: 重载后仍是英文
    await page.reload()
    await expect(page.getByText('Username / Email', { exact: true })).toBeVisible({
      timeout: 15000,
    })
    const saved = await page.evaluate(() => localStorage.getItem('yyc3_locale'))
    expect(saved).toBe('en')
  })

  test('I18N-UI-002 登录页: 注册模式双语全量切换', async ({ page }) => {
    await dismissOnboarding(page)
    await page.addInitScript(() => {
      sessionStorage.setItem('yyc3_e2e_skip_auto_login', '1')
      localStorage.setItem('yyc3_locale', 'en')
    })
    await page.goto('/')
    await page.waitForLoadState('load')
    await expect(page.getByText('Username / Email', { exact: true })).toBeVisible({
      timeout: 15000,
    })

    // 切到注册模式
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(page.getByText('Display Name', { exact: true })).toBeVisible()
    await expect(page.getByText('Email', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign Up', exact: true })).toBeVisible()

    // 注册模式下切回中文
    await page.getByRole('button', { name: /中文/ }).click()
    await expect(page.getByText('显示名称', { exact: true })).toBeVisible()
    await expect(page.getByText('邮箱', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '注册', exact: true })).toBeVisible()
  })

  test('I18N-UI-003 顶栏 Globe: 切换即时生效并持久化', async ({ page }) => {
    await openApp(page)
    // 默认中文 — 顶栏 Tab 显示分类标签(设计如此, data-nav-id 取分类首项 dashboard)
    const dashBtn = page.locator('[data-nav-id="dashboard"]').first()
    await expect(dashBtn).toHaveText(/概览/)

    await page
      .getByRole('button', { name: /语言|Language/ })
      .first()
      .click()
    await page.getByRole('button', { name: /🇺🇸/ }).last().click()

    await expect(dashBtn).toHaveText(/Overview/i, { timeout: 5000 })
    const saved = await page.evaluate(() => localStorage.getItem('yyc3_locale'))
    expect(saved).toBe('en')

    // 重载持久化
    await page.reload()
    await expect(page.locator('[data-nav-id="dashboard"]').first()).toHaveText(/Overview/i, {
      timeout: 15000,
    })
  })

  test('I18N-UI-004 设置页语言选择器: 切换生效', async ({ page }) => {
    await openApp(page)
    await page.evaluate(() => localStorage.setItem('yyc3_locale', 'zh'))
    await navigateTo(page, CATEGORY_ENTRY.platform, 'settings')
    const switcher = page.locator('[data-testid="language-switcher"]')
    await expect(switcher).toBeVisible({ timeout: 15000 })

    await switcher.getByRole('button').first().click()
    await switcher.getByRole('button', { name: /🇺🇸/ }).click()

    // 选择器回显英文原生名
    await expect(switcher).toContainText('English')
    const saved = await page.evaluate(() => localStorage.getItem('yyc3_locale'))
    expect(saved).toBe('en')
  })
})

test.describe('E2E-I18N: 全页面覆盖审计', () => {
  test('I18N-COVER-zh: 中文遍历 37 页无原始 key 泄漏', async ({ page }) => {
    await openApp(page)
    await page.evaluate(() => localStorage.setItem('yyc3_locale', 'zh'))
    await page.reload()
    await page.waitForLoadState('load')
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible({ timeout: 30000 })

    await auditAllPages(page, 'zh')
    const offenders = auditResults.filter((r) => r.locale === 'zh' && r.rawKeys.length > 0)
    await writeReport()
    if (!REPORT_ONLY) {
      expect(
        offenders.map((r) => `${r.pageId}: ${r.rawKeys.join(', ')}`),
        'zh 模式存在原始 key 泄漏',
      ).toEqual([])
    }
  })

  test('I18N-COVER-en: 英文遍历 37 页无原始 key 泄漏 + CJK 量化', async ({ page }) => {
    await openApp(page)
    await page.evaluate(() => localStorage.setItem('yyc3_locale', 'en'))
    await page.reload()
    await page.waitForLoadState('load')
    await expect(page.locator('[data-testid="app-container"]')).toBeVisible({ timeout: 30000 })

    await auditAllPages(page, 'en')
    await writeReport()

    const offenders = auditResults.filter((r) => r.locale === 'en' && r.rawKeys.length > 0)
    if (!REPORT_ONLY) {
      expect(
        offenders.map((r) => `${r.pageId}: ${r.rawKeys.join(', ')}`),
        'en 模式存在原始 key 泄漏',
      ).toEqual([])
    }
  })
})
