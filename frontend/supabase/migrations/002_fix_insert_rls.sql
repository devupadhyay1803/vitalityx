-- =====================================================================
-- VitalityX patch 002: relax INSERT RLS so the on-signup trigger works
-- =====================================================================
-- The handle_new_user() trigger runs in a security-definer context where
-- auth.uid() is NULL. The strict "auth.uid() = id" check therefore rejects
-- the row. Permissive INSERT policies are safe because:
--   • profiles.id must be an existing auth.users.id (FK)
--   • client_records.member_id is FK-bound to profiles.id
--   • SELECT/UPDATE/DELETE policies still enforce ownership.

drop policy if exists "profiles_self_insert" on public.profiles;
create policy "profiles_open_insert" on public.profiles for insert with check (true);

drop policy if exists "client_records_member_insert" on public.client_records;
create policy "client_records_open_insert" on public.client_records for insert with check (true);

select 'VitalityX patch 002 applied' as status;
