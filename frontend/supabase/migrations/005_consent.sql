-- =====================================================================
-- VitalityX Health - Consent Records Migration
-- =====================================================================

create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  consent_version text not null,
  consent_text text not null,
  ip_address text,
  user_agent text,
  accepted_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

-- Index for quick lookups
create index if not exists consent_records_user_id_idx on public.consent_records(user_id);

-- RLS
alter table public.consent_records enable row level security;

-- Members can insert their own consent
create policy "consent_insert" on public.consent_records
  for insert with check (auth.uid() = user_id);

-- Members can read their own consent, Staff can read all
create policy "consent_select" on public.consent_records
  for select using (
    auth.uid() = user_id or 
    exists (select 1 from public.profiles where id = auth.uid() and role in ('Admin', 'Ops', 'Coach'))
  );

-- No updates or deletes allowed (immutable audit log)
