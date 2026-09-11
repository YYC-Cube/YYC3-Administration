/**
 * @file lib/supabase-client.ts
 * @description Supabase 客户端(P3-11.1 认证后端,PKCE 流)
 *   环境门控:未配置 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 时
 *   supabase 为 null,应用完全回落本地演示认证——零影响接入。
 *   客户端仅持 anon key(公开),真实鉴权由服务端 RLS 执行;
 *   客户端会话仅作 UX 门控(审计报告 11.1 落地要点)。
 * @author YanYuCloudCube Team <admin@0379.email>
 * @tags auth,supabase,pkce,p3
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

/** 是否已配置 Supabase(决定认证走真实后端或本地演示) */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string, {
      auth: {
        // SPA 静态站(GitHub Pages)推荐 PKCE;supabase-js v2 对 OAuth 流
        // 默认即 PKCE,显式声明以自文档化
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null
