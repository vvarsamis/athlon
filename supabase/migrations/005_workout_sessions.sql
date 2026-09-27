-- Athlon: Phase A step 1
-- workout_sessions + sets για real workout tracking

-- Session ανά προπόνηση που ξεκινάει ένας πελάτης
create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  program_id uuid references public.programs(id) on delete set null,
  program_title text,          -- snapshot όταν ξεκίνησε (για ιστορικό)
  program_name text,           -- snapshot πχ "Push · Πρωτόκολλο 2"
  started_at timestamptz not null default now(),
  completed_at timestamptz,    -- null = σε εξέλιξη
  duration_sec int,            -- υπολογισμένο στο complete
  notes text,                  -- σχόλιο του πελάτη
  created_at timestamptz not null default now()
);

create index workout_sessions_client_idx on public.workout_sessions (client_id, started_at desc);
create index workout_sessions_completed_idx on public.workout_sessions (client_id, completed_at desc)
  where completed_at is not null;

-- Σετ που έκανε ο πελάτης
create table public.workout_session_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions(id) on delete cascade,
  program_exercise_id uuid references public.program_exercises(id) on delete set null,
  exercise_position int not null,   -- 0, 1, 2...
  exercise_name text not null,      -- snapshot
  set_number int not null,          -- 1, 2, 3
  target_reps text,
  target_weight_kg text,
  actual_reps int,
  actual_weight_kg numeric(6,2),
  done_at timestamptz,              -- null = δεν έχει γίνει
  created_at timestamptz not null default now()
);

create index workout_session_sets_session_idx on public.workout_session_sets (session_id, exercise_position, set_number);

-- RLS
alter table public.workout_sessions enable row level security;
alter table public.workout_session_sets enable row level security;

-- Clients: πλήρης έλεγχος στα δικά τους sessions
create policy "Clients manage their sessions"
  on public.workout_sessions for all
  using (auth.uid() = client_id)
  with check (auth.uid() = client_id);

-- Trainers: βλέπουν sessions των πελατών τους (read-only)
create policy "Trainers see their clients' sessions"
  on public.workout_sessions for select
  using (
    exists (
      select 1 from public.trainer_clients tc
      where tc.client_id = public.workout_sessions.client_id
        and tc.trainer_id = auth.uid()
    )
  );

-- Sets: same rules through parent session
create policy "Clients manage their sets"
  on public.workout_session_sets for all
  using (
    exists (
      select 1 from public.workout_sessions s
      where s.id = public.workout_session_sets.session_id
        and s.client_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workout_sessions s
      where s.id = public.workout_session_sets.session_id
        and s.client_id = auth.uid()
    )
  );

create policy "Trainers see their clients' sets"
  on public.workout_session_sets for select
  using (
    exists (
      select 1 from public.workout_sessions s
      join public.trainer_clients tc on tc.client_id = s.client_id
      where s.id = public.workout_session_sets.session_id
        and tc.trainer_id = auth.uid()
    )
  );
