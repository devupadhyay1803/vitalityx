-- =====================================================================
-- VitalityX Health - Complete Schema Migration
-- Run this ENTIRE file once in Supabase SQL Editor
-- (Project → SQL Editor → New query → paste → Run)
-- Idempotent: safe to re-run.
-- =====================================================================

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";

-- ---------- Clean reset of any prior incompatible schema ----------
-- (Safe: there is no real production data yet. Re-runnable.)
drop table if exists public.staff_access_logs       cascade;
drop table if exists public.supplement_subscriptions cascade;
drop table if exists public.orders                  cascade;
drop table if exists public.daily_checkins          cascade;
drop table if exists public.messages                cascade;
drop table if exists public.genetic_traits          cascade;
drop table if exists public.biomarkers              cascade;
drop table if exists public.lab_results             cascade;
drop table if exists public.protocol_completions    cascade;
drop table if exists public.protocol_items          cascade;
drop table if exists public.sessions                cascade;
drop table if exists public.client_records          cascade;

-- profiles: keep the table (it links to auth.users) but make sure it has the right columns
-- These ADDs are idempotent (IF NOT EXISTS guards).
alter table if exists public.profiles add column if not exists email              text;
alter table if exists public.profiles add column if not exists dob                date;
alter table if exists public.profiles add column if not exists biological_sex     text;
alter table if exists public.profiles add column if not exists health_goal        text;
alter table if exists public.profiles add column if not exists notification_prefs jsonb default '{}'::jsonb;
alter table if exists public.profiles add column if not exists created_at         timestamptz default now();

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  email text,
  role text check (role in ('Member','Coach','Admin','Ops')) default 'Member',
  dob date,
  biological_sex text,
  health_goal text,
  notification_prefs jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- ---------- client_records ----------
create table if not exists public.client_records (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.profiles(id) on delete cascade unique,
  assigned_coach_id uuid references public.profiles(id),
  intake jsonb default '{}'::jsonb,
  consented boolean default false,
  consented_at timestamptz,
  consent_version text,
  created_at timestamptz default now()
);

-- ---------- sessions ----------
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.profiles(id) on delete cascade,
  coach_id uuid references public.profiles(id),
  scheduled_at timestamptz,
  status text default 'upcoming',
  notes text,
  created_at timestamptz default now()
);

-- ---------- protocol_items ----------
create table if not exists public.protocol_items (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.profiles(id) on delete cascade,
  title text,
  why_text text,
  created_by uuid references public.profiles(id),
  active boolean default true,
  created_at timestamptz default now()
);

-- ---------- protocol_completions ----------
create table if not exists public.protocol_completions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.profiles(id) on delete cascade,
  item_id uuid references public.protocol_items(id) on delete cascade,
  completed_at timestamptz default now()
);

-- ---------- lab_results ----------
create table if not exists public.lab_results (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.profiles(id) on delete cascade,
  biological_age numeric,
  tested_at date,
  pdf_url text,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- ---------- biomarkers ----------
create table if not exists public.biomarkers (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.profiles(id) on delete cascade,
  lab_result_id uuid references public.lab_results(id) on delete set null,
  name text,
  value numeric,
  unit text,
  target_min numeric,
  target_max numeric,
  status text check (status in ('optimal','borderline','elevated')),
  tested_at date
);

-- ---------- genetic_traits ----------
create table if not exists public.genetic_traits (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.profiles(id) on delete cascade,
  trait_name text,
  variant text,
  plain_language_summary text,
  impact text check (impact in ('positive','neutral','risk'))
);

-- ---------- messages ----------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  content text,
  created_at timestamptz default now()
);

-- ---------- daily_checkins ----------
create table if not exists public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.profiles(id) on delete cascade,
  sleep_score int check (sleep_score between 1 and 10),
  energy_score int check (energy_score between 1 and 10),
  mood_score int check (mood_score between 1 and 10),
  checked_in_at timestamptz default now()
);

-- ---------- orders ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.profiles(id) on delete set null,
  stripe_session_id text unique,
  amount_total int,
  currency text default 'usd',
  status text default 'pending',
  items jsonb,
  created_at timestamptz default now()
);

-- ---------- supplement_subscriptions ----------
create table if not exists public.supplement_subscriptions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.profiles(id) on delete cascade,
  stripe_subscription_id text unique,
  product_name text,
  status text default 'active',
  created_at timestamptz default now()
);

-- ---------- staff_access_logs ----------
create table if not exists public.staff_access_logs (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references public.profiles(id) on delete set null,
  member_id uuid references public.profiles(id) on delete set null,
  resource_type text,
  accessed_at timestamptz default now()
);

-- =====================================================================
-- Trigger: auto-create profile + client_record on new auth user
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_role text;
  v_full_name text;
begin
  v_role := coalesce(new.raw_user_meta_data->>'role', 'Member');
  v_full_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, full_name, email, role)
  values (new.id, v_full_name, new.email, v_role)
  on conflict (id) do nothing;

  if v_role = 'Member' then
    insert into public.client_records (member_id)
    values (new.id)
    on conflict (member_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- Dashboard RPC: returns all member dashboard data in 1 round trip
-- =====================================================================
create or replace function public.get_member_dashboard(p_member_id uuid)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  result jsonb;
begin
  -- Authorization: caller must be the member OR their assigned coach
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if auth.uid() <> p_member_id and not exists (
    select 1 from public.client_records
    where member_id = p_member_id and assigned_coach_id = auth.uid()
  ) then
    raise exception 'forbidden';
  end if;

  select jsonb_build_object(
    'profile', (select to_jsonb(p) from public.profiles p where p.id = p_member_id),
    'client_record', (select to_jsonb(cr) from public.client_records cr where cr.member_id = p_member_id),
    'protocol_items', coalesce((
      select jsonb_agg(to_jsonb(pi) order by pi.created_at)
      from public.protocol_items pi
      where pi.member_id = p_member_id and pi.active = true
    ), '[]'::jsonb),
    'completions_today', coalesce((
      select jsonb_agg(item_id)
      from public.protocol_completions
      where member_id = p_member_id
        and completed_at::date = current_date
    ), '[]'::jsonb),
    'completions_7d', coalesce((
      select count(*)::int from public.protocol_completions
      where member_id = p_member_id and completed_at >= now() - interval '7 days'
    ), 0),
    'latest_biomarkers', coalesce((
      select jsonb_agg(to_jsonb(b) order by b.tested_at desc nulls last)
      from (
        select * from public.biomarkers
        where member_id = p_member_id
        order by tested_at desc nulls last limit 3
      ) b
    ), '[]'::jsonb),
    'bio_age_trend', coalesce((
      select jsonb_agg(jsonb_build_object('tested_at', tested_at, 'biological_age', biological_age) order by tested_at)
      from public.lab_results
      where member_id = p_member_id and biological_age is not null
    ), '[]'::jsonb),
    'next_session', (
      select to_jsonb(s) from public.sessions s
      where s.member_id = p_member_id and s.scheduled_at >= now()
      order by s.scheduled_at asc limit 1
    ),
    'days_on_protocol', coalesce((
      select extract(day from now() - min(created_at))::int
      from public.protocol_items where member_id = p_member_id
    ), 0),
    'coach', (
      select to_jsonb(p) from public.profiles p
      where p.id = (select assigned_coach_id from public.client_records where member_id = p_member_id)
    )
  ) into result;

  return result;
end;
$$;

-- =====================================================================
-- RLS
-- =====================================================================

alter table public.profiles enable row level security;
drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read" on public.profiles
  for select using (
    auth.uid() = id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('Coach','Admin','Ops'))
  );
drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);
drop policy if exists "profiles_self_insert" on public.profiles;
create policy "profiles_self_insert" on public.profiles
  for insert with check (auth.uid() = id);

alter table public.client_records enable row level security;
drop policy if exists "client_records_member_read" on public.client_records;
create policy "client_records_member_read" on public.client_records
  for select using (
    auth.uid() = member_id or auth.uid() = assigned_coach_id
    or exists (select 1 from public.profiles where id = auth.uid() and role in ('Admin','Ops'))
  );
drop policy if exists "client_records_member_update" on public.client_records;
create policy "client_records_member_update" on public.client_records
  for update using (
    auth.uid() = member_id or auth.uid() = assigned_coach_id
    or exists (select 1 from public.profiles where id = auth.uid() and role in ('Admin','Ops'))
  );
drop policy if exists "client_records_member_insert" on public.client_records;
create policy "client_records_member_insert" on public.client_records
  for insert with check (
    auth.uid() = member_id
    or exists (select 1 from public.profiles where id = auth.uid() and role in ('Coach','Admin','Ops'))
  );

-- Health data tables: member sees own; assigned coach sees member's; admins see all.
-- Uses a security-definer helper so policy expressions stay simple.

create or replace function public.is_assigned_coach(p_member uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.client_records
    where member_id = p_member and assigned_coach_id = auth.uid()
  );
$$;

create or replace function public.is_admin_or_ops()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('Admin','Ops')
  );
$$;

-- biomarkers
alter table public.biomarkers enable row level security;
drop policy if exists "bm_read"  on public.biomarkers;
drop policy if exists "bm_write" on public.biomarkers;
create policy "bm_read"  on public.biomarkers for select using (auth.uid() = member_id or public.is_assigned_coach(member_id) or public.is_admin_or_ops());
create policy "bm_write" on public.biomarkers for all    using (auth.uid() = member_id or public.is_assigned_coach(member_id) or public.is_admin_or_ops())
                                                        with check (auth.uid() = member_id or public.is_assigned_coach(member_id) or public.is_admin_or_ops());

-- lab_results
alter table public.lab_results enable row level security;
drop policy if exists "lab_read"  on public.lab_results;
drop policy if exists "lab_write" on public.lab_results;
create policy "lab_read"  on public.lab_results for select using (auth.uid() = member_id or public.is_assigned_coach(member_id) or public.is_admin_or_ops());
create policy "lab_write" on public.lab_results for all    using (auth.uid() = member_id or public.is_assigned_coach(member_id) or public.is_admin_or_ops())
                                                          with check (auth.uid() = member_id or public.is_assigned_coach(member_id) or public.is_admin_or_ops());

-- genetic_traits
alter table public.genetic_traits enable row level security;
drop policy if exists "gen_read"  on public.genetic_traits;
drop policy if exists "gen_write" on public.genetic_traits;
create policy "gen_read"  on public.genetic_traits for select using (auth.uid() = member_id or public.is_assigned_coach(member_id) or public.is_admin_or_ops());
create policy "gen_write" on public.genetic_traits for all    using (auth.uid() = member_id or public.is_assigned_coach(member_id) or public.is_admin_or_ops())
                                                              with check (auth.uid() = member_id or public.is_assigned_coach(member_id) or public.is_admin_or_ops());

-- protocol_items
alter table public.protocol_items enable row level security;
drop policy if exists "pi_read"  on public.protocol_items;
drop policy if exists "pi_write" on public.protocol_items;
create policy "pi_read"  on public.protocol_items for select using (auth.uid() = member_id or public.is_assigned_coach(member_id) or public.is_admin_or_ops());
create policy "pi_write" on public.protocol_items for all    using (auth.uid() = member_id or public.is_assigned_coach(member_id) or public.is_admin_or_ops())
                                                              with check (auth.uid() = member_id or public.is_assigned_coach(member_id) or public.is_admin_or_ops());

-- protocol_completions
alter table public.protocol_completions enable row level security;
drop policy if exists "pc_read"  on public.protocol_completions;
drop policy if exists "pc_write" on public.protocol_completions;
create policy "pc_read"  on public.protocol_completions for select using (auth.uid() = member_id or public.is_assigned_coach(member_id) or public.is_admin_or_ops());
create policy "pc_write" on public.protocol_completions for all    using (auth.uid() = member_id or public.is_assigned_coach(member_id) or public.is_admin_or_ops())
                                                                    with check (auth.uid() = member_id or public.is_assigned_coach(member_id) or public.is_admin_or_ops());

-- daily_checkins
alter table public.daily_checkins enable row level security;
drop policy if exists "dc_read"  on public.daily_checkins;
drop policy if exists "dc_write" on public.daily_checkins;
create policy "dc_read"  on public.daily_checkins for select using (auth.uid() = member_id or public.is_assigned_coach(member_id) or public.is_admin_or_ops());
create policy "dc_write" on public.daily_checkins for all    using (auth.uid() = member_id or public.is_assigned_coach(member_id) or public.is_admin_or_ops())
                                                              with check (auth.uid() = member_id or public.is_assigned_coach(member_id) or public.is_admin_or_ops());

-- sessions
alter table public.sessions enable row level security;
drop policy if exists "ss_read"  on public.sessions;
drop policy if exists "ss_write" on public.sessions;
create policy "ss_read"  on public.sessions for select using (auth.uid() = member_id or auth.uid() = coach_id or public.is_admin_or_ops());
create policy "ss_write" on public.sessions for all    using (auth.uid() = member_id or auth.uid() = coach_id or public.is_admin_or_ops())
                                                        with check (auth.uid() = member_id or auth.uid() = coach_id or public.is_admin_or_ops());

-- supplement_subscriptions
alter table public.supplement_subscriptions enable row level security;
drop policy if exists "subs_read"  on public.supplement_subscriptions;
drop policy if exists "subs_write" on public.supplement_subscriptions;
create policy "subs_read"  on public.supplement_subscriptions for select using (auth.uid() = member_id or public.is_assigned_coach(member_id) or public.is_admin_or_ops());
create policy "subs_write" on public.supplement_subscriptions for all    using (auth.uid() = member_id or public.is_admin_or_ops())
                                                                          with check (auth.uid() = member_id or public.is_admin_or_ops());

-- orders
alter table public.orders enable row level security;
drop policy if exists "orders_read"  on public.orders;
create policy "orders_read"  on public.orders for select using (auth.uid() = member_id or public.is_admin_or_ops());

-- messages: sender or receiver
alter table public.messages enable row level security;
drop policy if exists "messages_party" on public.messages;
create policy "messages_party" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert" on public.messages
  for insert with check (auth.uid() = sender_id);

-- staff_access_logs: only admins/ops can read; service role writes
alter table public.staff_access_logs enable row level security;
drop policy if exists "staff_logs_admin_read" on public.staff_access_logs;
create policy "staff_logs_admin_read" on public.staff_access_logs
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('Admin','Ops'))
  );

-- =====================================================================
-- Realtime: enable for messages
-- =====================================================================
alter publication supabase_realtime add table public.messages;

-- Done.
select 'VitalityX schema migration complete' as status;
