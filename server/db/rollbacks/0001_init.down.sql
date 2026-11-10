-- =============================================================================
-- YYC³ Administration — 0001_init 回滚(P2, ADR-0003 PG 15)
-- 用途:P8 回滚演练 / 紧急回退。执行(psql):
--   psql "$DATABASE_URL" -f server/db/rollbacks/0001_init.down.sql
-- 顺序:先子表后父表(级联已设,顺序仅为可读性)
-- =============================================================================

drop table if exists chat_messages;
drop table if exists chat_sessions;
drop table if exists ai_configs;
drop table if exists user_settings;
drop table if exists users;

-- 账表由 drizzle migrator 维护,不在本回滚范围(保留应用史)
