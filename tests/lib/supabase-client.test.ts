/**
 * Unit Tests: supabase-client 环境门控(P3-11.1)
 * 未配置环境(测试环境即如此)必须零副作用回落本地认证
 */

import { describe, expect, it } from 'vitest'

import { isSupabaseConfigured, supabase } from '../../src/lib/supabase-client'

describe('supabase-client — 环境门控', () => {
  it('未配置 VITE_SUPABASE_* 时 client 为 null 且开关为 false(本地演示认证)', () => {
    // 测试环境未注入 Supabase 变量——门控应保持关闭
    expect(isSupabaseConfigured).toBe(false)
    expect(supabase).toBeNull()
  })
})
