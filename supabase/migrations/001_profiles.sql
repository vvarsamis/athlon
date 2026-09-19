-- Athlon: Phase 3 step 1
-- profiles table + auto-trigger on user signup + RLS

-- 1. Enum για τους ρόλους
create type public.user_role as enum ('client', 'trainer');

-- 2. profiles table (ένα προς ένα με auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_type public.user_role not null default 'client',
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Trigger για αυτόματο profile creation στο signup
--    Παίρνει user_type και full_name από τα user_metadata που δίνει ο client
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, user_type, full_name)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'user_type')::public.user_role, 'client'),
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 4. RLS: κάθε χρήστης βλέπει και ενημερώνει μόνο το δικό του profile
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 5. Backfill: profile για κάθε υπάρχοντα χρήστη (αν υπάρχουν)
insert into public.profiles (id, user_type, full_name)
select
  u.id,
  coalesce((u.raw_user_meta_data->>'user_type')::public.user_role, 'client'),
  u.raw_user_meta_data->>'full_name'
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);
