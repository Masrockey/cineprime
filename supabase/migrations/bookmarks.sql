-- Create Bookmarks Table
create table public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  subject_id text not null,
  type text not null check (type in ('movie', 'dracin')),
  title text not null,
  poster text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Prevent duplicates
  unique(user_id, subject_id, type)
);

-- Enable RLS
alter table public.bookmarks enable row level security;

-- Policies
create policy "Users can view their own bookmarks" 
on public.bookmarks for select 
using (auth.uid() = user_id);

create policy "Users can insert their own bookmarks" 
on public.bookmarks for insert 
with check (auth.uid() = user_id);

create policy "Users can delete their own bookmarks" 
on public.bookmarks for delete 
using (auth.uid() = user_id);
