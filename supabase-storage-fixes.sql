-- 1) Create the storage bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('interaction-files', 'interaction-files', true)
on conflict (id) do update set public = true;

-- 2) Enable RLS on storage.objects
alter table storage.objects enable row level security;

-- 3) Policy: Allow everyone to select/read files from interaction-files bucket
drop policy if exists "interaction_files_select" on storage.objects;
create policy "interaction_files_select"
on storage.objects for select
using ( bucket_id = 'interaction-files' );

-- 4) Policy: Allow authenticated users (teachers) to insert files
drop policy if exists "interaction_files_insert" on storage.objects;
create policy "interaction_files_insert"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'interaction-files' );

-- 5) Policy: Allow authenticated users to update their files
drop policy if exists "interaction_files_update" on storage.objects;
create policy "interaction_files_update"
on storage.objects for update
to authenticated
using ( bucket_id = 'interaction-files' );

-- 6) Policy: Allow authenticated users to delete their files
drop policy if exists "interaction_files_delete" on storage.objects;
create policy "interaction_files_delete"
on storage.objects for delete
to authenticated
using ( bucket_id = 'interaction-files' );
