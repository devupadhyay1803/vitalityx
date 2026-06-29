-- =====================================================================
-- VitalityX Health - Live Notifications System
-- =====================================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null,
  category text not null,
  entity_id uuid,
  entity_type text,
  link text,
  is_read boolean default false,
  created_at timestamptz default now(),
  read_at timestamptz,
  metadata jsonb default '{}'::jsonb
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Policies
-- 1. Users can only read their own notifications.
create policy "notifications_read_own" on public.notifications
  for select using (auth.uid() = user_id);

-- 2. Users can update their own notifications (e.g. to mark as read).
create policy "notifications_update_own" on public.notifications
  for update using (auth.uid() = user_id);

-- 3. Users can delete their own notifications.
create policy "notifications_delete_own" on public.notifications
  for delete using (auth.uid() = user_id);

-- NOTE: No insert policy is created.
-- All inserts MUST happen server-side using the service_role key to bypass RLS.
