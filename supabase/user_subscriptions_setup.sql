-- Create user_subscriptions table
create table if not exists public.user_subscriptions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    plan_id uuid references public.plans(id) on delete set null,
    status text check (status in ('active', 'canceled', 'expired')) default 'active',
    current_period_end timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id) -- Enforce one subscription per user for now
);

-- Enable RLS
alter table public.user_subscriptions enable row level security;

-- Policy: Users can view their own subscription
create policy "Users can view own subscription."
  on public.user_subscriptions for select
  using ( auth.uid() = user_id );

-- Policy: Admins can view all subscriptions
create policy "Admins can view all subscriptions."
  on public.user_subscriptions for select
  using ( (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' );

-- Policy: Admins can insert subscriptions
create policy "Admins can insert subscriptions."
  on public.user_subscriptions for insert
  with check ( (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' );

-- Policy: Admins can update subscriptions
create policy "Admins can update subscriptions."
  on public.user_subscriptions for update
  using ( (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' );

-- Policy: Admins can delete subscriptions
create policy "Admins can delete subscriptions."
  on public.user_subscriptions for delete
  using ( (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' );
