-- =====================================================================
-- VitalityX Health - Care Team Module
-- =====================================================================

create extension if not exists moddatetime schema extensions;

create table if not exists public.staff_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  credentials text,
  specialization text,
  profile_photo text,
  bio text,
  years_experience integer,
  languages text,
  timezone text,
  phone text,
  booking_enabled boolean default true,
  accepts_messages boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.care_team_assignments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles(id) on delete cascade,
  staff_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('Physician', 'Health Coach', 'Nutritionist', 'Functional Medicine Practitioner', 'Lab Coordinator', 'Customer Success', 'Primary Care Lead')),
  is_primary boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(member_id, staff_id)
);

-- RLS
alter table public.staff_profiles enable row level security;
alter table public.care_team_assignments enable row level security;

-- staff_profiles: Anyone authenticated can read. Staff can update their own.
create policy "staff_profiles_read_all" on public.staff_profiles
  for select using (auth.role() = 'authenticated');

create policy "staff_profiles_update_own" on public.staff_profiles
  for update using (auth.uid() = id);

-- care_team_assignments: Members can read their own. Staff can read all and manage all.
create policy "care_team_assignments_member_read" on public.care_team_assignments
  for select using (auth.uid() = member_id);

create policy "care_team_assignments_staff_read" on public.care_team_assignments
  for select using (exists (select 1 from public.profiles where id = auth.uid() and role in ('Admin', 'Ops', 'Coach')));

create policy "care_team_assignments_staff_insert" on public.care_team_assignments
  for insert with check (exists (select 1 from public.profiles where id = auth.uid() and role in ('Admin', 'Ops')));

create policy "care_team_assignments_staff_update" on public.care_team_assignments
  for update using (exists (select 1 from public.profiles where id = auth.uid() and role in ('Admin', 'Ops')));

create policy "care_team_assignments_staff_delete" on public.care_team_assignments
  for delete using (exists (select 1 from public.profiles where id = auth.uid() and role in ('Admin', 'Ops')));

-- Triggers for updated_at
create trigger handle_updated_at_staff_profiles
  before update on public.staff_profiles
  for each row execute procedure extensions.moddatetime (updated_at);

create trigger handle_updated_at_care_team_assignments
  before update on public.care_team_assignments
  for each row execute procedure extensions.moddatetime (updated_at);
