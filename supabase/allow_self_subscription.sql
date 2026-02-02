-- Allow users to insert their own subscription (for purchasing)
create policy "Users can purchase subscription."
  on public.user_subscriptions for insert
  with check ( auth.uid() = user_id );

-- Allow users to update their own subscription (e.g. cancel or change plan)
create policy "Users can update own subscription."
  on public.user_subscriptions for update
  using ( auth.uid() = user_id );
