-- Profiles Policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Studies Policies
create policy "Users can view own studies"
  on public.studies for select
  using ( auth.uid() = owner_id );

create policy "Public studies are viewable by everyone"
  on public.studies for select
  using ( is_public = true );

create policy "Users can insert own studies"
  on public.studies for insert
  with check ( auth.uid() = owner_id );

create policy "Users can update own studies"
  on public.studies for update
  using ( auth.uid() = owner_id );

create policy "Users can delete own studies"
  on public.studies for delete
  using ( auth.uid() = owner_id );
