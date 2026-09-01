-- =============================================================================
-- YYC³ Administration — P3 数据面一期(随认证)
-- 表:profiles(用户档案)/ user_settings(设置 jsonb 单文档)
-- 安全:全表 RLS,仅属主可读写;角色列对所有者不可变(仅服务端/管理员可改)
-- 应用方式:Supabase Dashboard → SQL Editor 粘贴执行(或 supabase CLI: db push)
-- =============================================================================

-- ─────────────────────────────────────────────
-- 1. profiles:应用侧用户档案(镜像 auth.users)
-- ─────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     text not null default 'user',
  display_name text,
  -- 与前端 UserRole 对齐;viewer 最小权限默认
  role         text not null default 'viewer'
    check (role in ('admin', 'manager', 'agent', 'viewer')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
-- 删除走级联(auth.users 删除),不开放属主 delete

-- 角色对所有者不可变(防前端自我提权):BEFORE UPDATE 锁定 role 列
create or replace function public.profiles_keep_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.role := old.role;
  return new;
end;
$$;

drop trigger if exists trg_profiles_keep_role on public.profiles;
create trigger trg_profiles_keep_role
  before update on public.profiles
  for each row execute function public.profiles_keep_role();

-- updated_at 自动维护
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- 注册即建档(handle_new_user 为 SECURITY DEFINER,由 auth 触发调用)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1), 'user'),
    coalesce(new.raw_user_meta_data ->> 'display_name', new.email),
    'viewer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────
-- 2. user_settings:每用户设置单文档(jsonb)
--    一期范围:useSettingsStore.settings 整体(含 agents/mcp/rules/skills)
--    AI 模型密钥(yyc3_enc_*)与本地演示数据不在此期
-- ─────────────────────────────────────────────
create table if not exists public.user_settings (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  -- 防失控写入:单文档上限 256KB
  constraint settings_size_limit check (octet_length(data::text) < 262144)
);

alter table public.user_settings enable row level security;

create policy "settings_select_own" on public.user_settings
  for select using (auth.uid() = user_id);
create policy "settings_insert_own" on public.user_settings
  for insert with check (auth.uid() = user_id);
create policy "settings_update_own" on public.user_settings
  for update using (auth.uid() = user_id);
create policy "settings_delete_own" on public.user_settings
  for delete using (auth.uid() = user_id);

drop trigger if exists trg_settings_touch on public.user_settings;
create trigger trg_settings_touch
  before update on public.user_settings
  for each row execute function public.touch_updated_at();

create index if not exists idx_user_settings_updated
  on public.user_settings (updated_at desc);
