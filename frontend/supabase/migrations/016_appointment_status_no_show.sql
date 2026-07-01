-- =====================================================================
-- VitalityX Health — Extend appointment status to include 'No Show'
-- =====================================================================

-- Drop existing check constraint and replace with the full canonical set
alter table public.appointments
  drop constraint if exists appointments_status_check;

alter table public.appointments
  add constraint appointments_status_check
  check (status in ('Scheduled', 'Confirmed', 'Rescheduled', 'Completed', 'Cancelled', 'No Show'));
