-- Create History Table
create table public.history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  subject_id text not null,
  type text not null check (type in ('movie', 'series', 'dracin')),
  title text not null,
  poster text,
  season integer, -- Only for series
  episode integer, -- For series and dracin
  last_position integer default 0, -- In seconds
  duration integer default 0, -- In seconds
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Use unique constraint to upsert based on user and content
  unique(user_id, subject_id, type)
);

-- Enable RLS
alter table public.history enable row level security;

-- Policies
create policy "Users can view their own history" 
on public.history for select 
using (auth.uid() = user_id);

create policy "Users can insert their own history" 
on public.history for insert 
with check (auth.uid() = user_id);

create policy "Users can update their own history" 
on public.history for update 
using (auth.uid() = user_id);
