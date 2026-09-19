-- Athlon: Phase 3 step 3
-- programs + program_exercises + assignment through trainer_clients

-- 1. Programs table (ο trainer φτιάχνει)
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,           -- πχ "Push · Πρωτόκολλο 2"
  title text not null,          -- πχ "Στήθος, ώμοι & τρικέφαλα"
  subtitle text,                -- πχ "Δευτέρα + Πέμπτη · ενδιάμεσο επίπεδο"
  estimated_duration_min int,
  estimated_kcal int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index programs_trainer_idx on public.programs (trainer_id);

-- 2. Program exercises (γραμμές ασκήσεων ανά πρόγραμμα)
create table public.program_exercises (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  position int not null,
  name text not null,
  image_url text,
  tags text[] not null default '{}',
  sets text,
  reps text,
  rest_seconds int,
  tempo text,
  notes text,
  created_at timestamptz not null default now()
);

create index program_exercises_program_idx on public.program_exercises (program_id, position);

-- 3. Ανάθεση: όποιος client έχει assigned_program_id βλέπει αυτό το πρόγραμμα
alter table public.trainer_clients
  add column assigned_program_id uuid references public.programs(id) on delete set null;

-- 4. RLS
alter table public.programs enable row level security;
alter table public.program_exercises enable row level security;

-- Trainers: πλήρης έλεγχος στα δικά τους προγράμματα
create policy "Trainers manage their programs"
  on public.programs for all
  using (auth.uid() = trainer_id)
  with check (auth.uid() = trainer_id);

-- Clients: βλέπουν το πρόγραμμα που τους έχει ανατεθεί
create policy "Clients see their assigned program"
  on public.programs for select
  using (
    exists (
      select 1 from public.trainer_clients tc
      where tc.assigned_program_id = public.programs.id
        and tc.client_id = auth.uid()
    )
  );

-- Program exercises: όποιος βλέπει το πρόγραμμα βλέπει και τις ασκήσεις
create policy "Anyone with program access can view exercises"
  on public.program_exercises for select
  using (
    exists (
      select 1 from public.programs p
      where p.id = public.program_exercises.program_id
        and (
          p.trainer_id = auth.uid()
          or exists (
            select 1 from public.trainer_clients tc
            where tc.assigned_program_id = p.id
              and tc.client_id = auth.uid()
          )
        )
    )
  );

-- Trainers μπορούν να διαχειριστούν τις ασκήσεις των δικών τους προγραμμάτων
create policy "Trainers manage exercises in their programs"
  on public.program_exercises for insert
  with check (
    exists (
      select 1 from public.programs p
      where p.id = public.program_exercises.program_id
        and p.trainer_id = auth.uid()
    )
  );

create policy "Trainers update exercises in their programs"
  on public.program_exercises for update
  using (
    exists (
      select 1 from public.programs p
      where p.id = public.program_exercises.program_id
        and p.trainer_id = auth.uid()
    )
  );

create policy "Trainers delete exercises in their programs"
  on public.program_exercises for delete
  using (
    exists (
      select 1 from public.programs p
      where p.id = public.program_exercises.program_id
        and p.trainer_id = auth.uid()
    )
  );
