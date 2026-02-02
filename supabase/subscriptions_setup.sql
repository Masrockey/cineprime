-- Create plans table
create table if not exists public.plans (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    price numeric not null,
    duration_days integer not null,
    description text,
    features jsonb default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.plans enable row level security;

-- Policy: Public Read Access
create policy "Plans are viewable by everyone."
  on public.plans for select
  using ( true );

-- Policy: Admin Write Access (Insert)
create policy "Admins can insert plans."
  on public.plans for insert
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Policy: Admin Write Access (Update)
create policy "Admins can update plans."
  on public.plans for update
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Policy: Admin Write Access (Delete)
create policy "Admins can delete plans."
  on public.plans for delete
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
