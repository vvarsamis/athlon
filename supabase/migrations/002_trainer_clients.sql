-- Athlon: Phase 3 step 2
-- Trainer ↔ Client relationship + invite codes

-- 1. Invite code στο profiles (μόνο trainers παίρνουν)
alter table public.profiles add column invite_code text unique;

-- Random 8-char invite code
create or replace function public.generate_invite_code()
returns text
language sql
as $$
  select upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
$$;

-- 2. Ενημερώνω το handle_new_user trigger να δίνει invite_code στους trainers
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  role public.user_role;
  code text;
begin
  role := coalesce((new.raw_user_meta_data->>'user_type')::public.user_role, 'client');
  if role = 'trainer' then
    code := public.generate_invite_code();
  end if;
  insert into public.profiles (id, user_type, full_name, invite_code)
  values (
    new.id,
    role,
    new.raw_user_meta_data->>'full_name',
    code
  );
  return new;
end;
$$;

-- Backfill: υπάρχοντες trainers χωρίς invite_code
update public.profiles
set invite_code = public.generate_invite_code()
where user_type = 'trainer' and invite_code is null;

-- 3. RPC: εύρεση trainer από invite code (χωρίς να εκθέτουμε ολόκληρο profile)
create or replace function public.find_trainer_by_invite_code(code text)
returns table (trainer_id uuid, trainer_name text)
language sql
security definer
set search_path = public
as $$
  select id, full_name
  from public.profiles
  where invite_code = upper(code) and user_type = 'trainer'
  limit 1;
$$;

grant execute on function public.find_trainer_by_invite_code(text) to authenticated;

-- 4. Πίνακας trainer_clients
create type public.trainer_client_status as enum ('active', 'paused', 'ended');

create table public.trainer_clients (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.profiles(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  status public.trainer_client_status not null default 'active',
  joined_at timestamptz not null default now(),
  subscription_end_date date,
  created_at timestamptz not null default now(),
  unique (client_id)  -- ένας πελάτης, ένας trainer
);

create index trainer_clients_trainer_idx on public.trainer_clients (trainer_id);

alter table public.trainer_clients enable row level security;

-- 5. RLS policies
create policy "Trainers can view their clients"
  on public.trainer_clients for select
  using (auth.uid() = trainer_id);

create policy "Clients can view their trainer link"
  on public.trainer_clients for select
  using (auth.uid() = client_id);

create policy "Clients can join a trainer"
  on public.trainer_clients for insert
  with check (auth.uid() = client_id);

create policy "Trainers can update their clients"
  on public.trainer_clients for update
  using (auth.uid() = trainer_id);

create policy "Clients can leave their trainer"
  on public.trainer_clients for delete
  using (auth.uid() = client_id);

-- 6. Επίτρεψε στους πελάτες να διαβάζουν το βασικό profile info του trainer τους
--    (για να δείχνουμε "Προπονητής σου: X" στο /home)
create policy "Clients can view their trainer's basic profile"
  on public.profiles for select
  using (
    exists (
      select 1 from public.trainer_clients tc
      where tc.trainer_id = public.profiles.id
        and tc.client_id = auth.uid()
    )
  );

-- 7. Επίτρεψε στους trainers να διαβάζουν τα profiles των πελατών τους
create policy "Trainers can view their clients' profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.trainer_clients tc
      where tc.client_id = public.profiles.id
        and tc.trainer_id = auth.uid()
    )
  );
