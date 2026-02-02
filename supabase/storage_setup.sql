-- 1. Create a new storage bucket for avatars
-- Note: 'avatars' must be a public bucket for easy access
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. Enable RLS on objects
alter table storage.objects enable row level security;

-- 3. Policy: Public Read Access
-- Anyone can view profile pictures
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- 4. Policy: Authenticated Upload
-- Users can upload files to their own folder (e.g., avatars/USER_ID/filename)
create policy "Users can upload their own avatar."
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' 
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5. Policy: Authenticated Update
-- Users can replace their own files
create policy "Users can update their own avatar."
  on storage.objects for update
  using (
    bucket_id = 'avatars' 
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 6. Policy: Authenticated Delete
-- Users can delete their own files
create policy "Users can delete their own avatar."
  on storage.objects for delete
  using (
    bucket_id = 'avatars' 
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
