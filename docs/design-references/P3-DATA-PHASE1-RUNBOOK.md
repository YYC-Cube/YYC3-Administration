# P3 数据面一期 · 激活 Runbook(随认证)

> 前置:Supabase 项目创建(https://supabase.com/dashboard → New Project)
> 代码已全部交付并 env 门控——**注入环境变量那一刻,Auth 与数据一期同时激活**。

## 激活步骤(共 4 步)

1. **建表**:Dashboard → SQL Editor → 粘贴执行
   `supabase/migrations/0001_phase1_profiles_settings.sql`
   (profiles + user_settings,全表 RLS,角色列所有者不可变)
2. **认证配置**:Authentication → Providers → Email 启用;Redirect URLs 添加
   `https://admin.yyc3.vip/**`(本地调试加 `http://localhost:3171/**`)
3. **注入 env**(本地 `.env`;生产经 deploy.yml secrets → 构建参数):
   ```
   VITE_SUPABASE_URL=https://<project>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon key>
   ```
4. **验证**:登录 → 修改任意设置 → 1.5s 后 Table Editor 查 user_settings
   应出现该用户行;退出重登 → 设置还原(云端水合)。

## 行为说明

| 场景         | 行为                                          |
| ------------ | --------------------------------------------- |
| 未配置 env   | 零影响:本地 localStorage 演示模式(现状不变)   |
| 已配置未登录 | 登录墙后本地模式                              |
| 登录(首次)   | 本地设置为初始真相,此后变更防抖上行           |
| 登录(再次)   | 云端文档水合覆盖(远端键优先,本地新增键保留)   |
| 登出         | 停止同步;AI 模型密钥(加密存储)不迁移,仍留本机 |

## 一期范围与边界

- ✅ settings 全量(general/agents/mcp/rules/skills/context)
- ❌ AI 模型密钥(yyc3*enc*\*,AES-GCM 本机)——三期评估
- ❌ 业务实体(客户/库存/任务板)——三期单独立项
- 角色(admin 等)存 profiles.role,**仅 SQL/服务端可改**(触发器锁定);
  首注册一律 viewer,提权用 Dashboard 手工 UPDATE。
