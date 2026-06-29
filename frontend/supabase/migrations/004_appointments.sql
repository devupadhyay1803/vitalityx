-- =====================================================================
-- VitalityX Health - Appointments Migration
-- =====================================================================

-- 1. Create the new appointments table
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.profiles(id) on delete cascade,
  staff_id uuid references public.profiles(id),
  title text,
  session_type text,
  status text check (status in ('Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled')) default 'Scheduled',
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  meeting_link text,
  location text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Drop the old sessions table
drop table if exists public.sessions cascade;

-- 3. Update the get_member_dashboard RPC to use the new appointments table
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
      select to_jsonb(a) from public.appointments a
      where a.member_id = p_member_id and a.status in ('Scheduled', 'Confirmed') and a.scheduled_start >= now()
      order by a.scheduled_start asc limit 1
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

-- 4. RLS Policies for Appointments
alter table public.appointments enable row level security;

-- Members: read only their appointments
create policy "appointments_member_read" on public.appointments
  for select using (auth.uid() = member_id);

-- Members: create appointment requests
create policy "appointments_member_insert" on public.appointments
  for insert with check (auth.uid() = member_id);

-- Members: update only reschedule/cancel before appointment
create policy "appointments_member_update" on public.appointments
  for update using (
    auth.uid() = member_id and scheduled_start > now()
  ) with check (
    auth.uid() = member_id and scheduled_start > now()
  );

-- Staff: full CRUD for assigned appointments (either they are the assigned coach or explicitly requested)
create policy "appointments_staff_select" on public.appointments
  for select using (
    auth.uid() = staff_id or exists (select 1 from public.profiles where id = auth.uid() and role in ('Admin', 'Ops'))
  );

create policy "appointments_staff_insert" on public.appointments
  for insert with check (
    auth.uid() = staff_id or exists (select 1 from public.profiles where id = auth.uid() and role in ('Admin', 'Ops'))
  );

create policy "appointments_staff_update" on public.appointments
  for update using (
    auth.uid() = staff_id or exists (select 1 from public.profiles where id = auth.uid() and role in ('Admin', 'Ops'))
  );

create policy "appointments_staff_delete" on public.appointments
  for delete using (
    auth.uid() = staff_id or exists (select 1 from public.profiles where id = auth.uid() and role in ('Admin', 'Ops'))
  );
