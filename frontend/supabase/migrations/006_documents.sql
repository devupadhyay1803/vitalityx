-- =====================================================================
-- VitalityX Health - Documents & Storage Migration
-- =====================================================================

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.profiles(id) on delete cascade not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  category text not null,
  title text not null,
  description text,
  file_name text not null,
  storage_path text not null,
  mime_type text not null,
  file_size bigint not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index if not exists documents_member_id_idx on public.documents(member_id);

alter table public.documents enable row level security;

-- Member access: Can only read their own documents
create policy "documents_member_read" on public.documents
  for select using (auth.uid() = member_id);

-- Staff access: Can perform full CRUD
create policy "documents_staff_all" on public.documents
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('Admin', 'Ops', 'Coach'))
  );

-- =====================================================================
-- STORAGE BUCKET CONFIGURATION
-- =====================================================================
insert into storage.buckets (id, name, public) 
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- RLS for storage.objects
-- Allow staff to manage all files in the documents bucket
create policy "storage_staff_all" on storage.objects
  for all using (
    bucket_id = 'documents' and 
    exists (select 1 from public.profiles where id = auth.uid() and role in ('Admin', 'Ops', 'Coach'))
  );

-- Allow members to select their own files (where the path starts with their ID)
create policy "storage_member_read" on storage.objects
  for select using (
    bucket_id = 'documents' and 
    (auth.uid())::text = (string_to_array(name, '/'))[1]
  );
