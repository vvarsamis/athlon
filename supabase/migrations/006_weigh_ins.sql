-- Athlon: Phase B step 1
-- weigh_ins: μετρήσεις βάρους πελάτη

create table public.weigh_ins (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  weight_kg numeric(5,2) not null,
  notes text,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index weigh_ins_client_idx
  on public.weigh_ins (client_id, recorded_at desc);

alter table public.weigh_ins enable row level security;

-- Clients: πλήρης έλεγχος στις δικές τους μετρήσεις
create policy "Clients manage their weigh-ins"
  on public.weigh_ins for all
  using (auth.uid() = client_id)
  with check (auth.uid() = client_id);

-- Trainers: read-only πρόσβαση στις μετρήσεις των πελατών τους
create policy "Trainers see their clients' weigh-ins"
  on public.weigh_ins for select
  using (
    exists (
      select 1 from public.trainer_clients tc
      where tc.client_id = public.weigh_ins.client_id
        and tc.trainer_id = auth.uid()
    )
  );
