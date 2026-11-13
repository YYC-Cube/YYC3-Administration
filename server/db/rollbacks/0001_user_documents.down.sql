-- =============================================================================
-- YYC³ Administration — 0001(user_documents) 回滚(P8 演练用)
-- 执行:psql "$DATABASE_URL" -f server/db/rollbacks/0001_user_documents.down.sql
-- =============================================================================

drop index if exists "user_documents_scope_idx";
drop index if exists "user_documents_user_scope_uq";
drop table if exists "user_documents";
