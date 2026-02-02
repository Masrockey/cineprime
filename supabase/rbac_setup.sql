-- 1. Create a table for public profiles if it doesn't exist
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- 3. Create a trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to prevent duplicates on re-run
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Create logic to sync Profile Role -> Auth Metadata (CRITICAL for Middleware)
create or replace function public.sync_role_to_metadata()
returns trigger as $$
begin
  -- Only update if role has changed
  if new.role <> old.role then
    update auth.users
    set raw_app_meta_data = 
      jsonb_set(coalesce(raw_app_meta_data, '{}'::jsonb), '{role}', to_jsonb(new.role))
    where id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists
drop trigger if exists on_profile_role_update on public.profiles;
create trigger on_profile_role_update
  after update of role on public.profiles
  for each row execute procedure public.sync_role_to_metadata();

-- 5. Backfill existing users (Run this if you have users who signed up before this script)
insert into public.profiles (id, email, role)
select id, email, 'user'
from auth.users
where id not in (select id from public.profiles);

-- 6. MAKE YOURSELF ADMIN (Replace with your email!)
-- This updates the profile, which triggers the sync to app_metadata
update public.profiles
set role = 'admin'
where email = 'admin@admin.com'; 
-- Example: where email = 'masrockey@gmail.com';
