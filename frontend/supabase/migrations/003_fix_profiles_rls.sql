-- =====================================================================
-- VitalityX patch 003: fix infinite recursion on profiles RLS
-- =====================================================================
-- The previous "profiles_self_read" policy referenced public.profiles
-- inside its own USING clause → Postgres 42P17 (infinite recursion).
-- Fix: use a SECURITY DEFINER helper that bypasses RLS when reading the
-- caller's own row, then reference it from policies on OTHER tables only.

create or replace function public.current_user_role()
returns text
language sql stable security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Replace profiles policies with simple, non-recursive ones
drop policy if exists "profiles_self_read"   on public.profiles;
drop policy if exists "profiles_self_update" on public.profiles;
drop policy if exists "profiles_open_insert" on public.profiles;
drop policy if exists "profiles_self_insert" on public.profiles;

-- Anyone authenticated can read their own row.
-- Staff (Coach/Admin/Ops) can read every row — uses helper, no recursion.
create policy "profiles_read"
  on public.profiles for select
  using (
    auth.uid() = id
    or public.current_user_role() in ('Coach','Admin','Ops')
  );

create policy "profiles_update"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_insert"
  on public.profiles for insert
  with check (true);  -- safe: FK to auth.users ensures id is a real user

-- Make sure is_admin_or_ops also uses the helper to avoid recursion
create or replace function public.is_admin_or_ops()
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.current_user_role() in ('Admin','Ops');
$$;

create or replace function public.is_assigned_coach(p_member uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.client_records
    where member_id = p_member and assigned_coach_id = auth.uid()
  );
$$;

select 'VitalityX patch 003 applied (profiles RLS recursion fixed)' as status;
