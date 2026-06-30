-- =====================================================================
-- VitalityX Health - Add Insert Policies for Documents
-- =====================================================================

-- Allow members to insert their own documents into the public.documents table
create policy "documents_member_insert" on public.documents
  for insert with check (auth.uid() = member_id);

-- Allow members to upload their own files to the documents storage bucket
create policy "storage_member_insert" on storage.objects
  for insert with check (
    bucket_id = 'documents' and 
    (auth.uid())::text = (string_to_array(name, '/'))[1]
  );
