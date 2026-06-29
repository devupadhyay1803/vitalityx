-- =====================================================================
-- VitalityX Health - Audit Logging System
-- =====================================================================

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id) on delete cascade,
  actor_role text not null,
  target_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  resource_type text,
  resource_id text,
  metadata jsonb default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz default now() not null
);

create index if not exists audit_logs_actor_id_idx on public.audit_logs(actor_id);
create index if not exists audit_logs_target_user_id_idx on public.audit_logs(target_user_id);
create index if not exists audit_logs_action_idx on public.audit_logs(action);
create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);

alter table public.audit_logs enable row level security;

-- Audit logs are strictly append-only. 
-- Service role handles inserts via our secure API endpoints to ensure data integrity.
-- Therefore, we DO NOT create an INSERT policy for public/authenticated users.

-- Only Admins can SELECT (Read) audit logs.
create policy "audit_logs_admin_read" on public.audit_logs
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'Admin')
  );

-- No UPDATE policy
-- No DELETE policy
