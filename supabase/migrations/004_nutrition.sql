-- Athlon: Phase 3 step 4
-- Nutrition plans + meals + foods + assignment

-- 1. Nutrition plans (ο trainer φτιάχνει)
create table public.nutrition_plans (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,              -- πχ "Cut Πλάνο · Βασίλης"
  subtitle text,                    -- πχ "Cut · Επίπεδο: Μέτριο"
  target_kcal int,                  -- ημερήσιος στόχος
  target_kcal_min int,              -- εύρος στόχου (πχ 2150)
  target_kcal_max int,              -- εύρος στόχου (πχ 2250)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index nutrition_plans_trainer_idx on public.nutrition_plans (trainer_id);

-- 2. Γεύματα (ordered)
create table public.nutrition_meals (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.nutrition_plans(id) on delete cascade,
  position int not null,
  icon text,                        -- emoji πχ "☀️"
  name text not null,               -- πχ "Πρωινό"
  time text,                        -- πχ "08:00"
  notes text,                       -- σημείωση για το γεύμα
  created_at timestamptz not null default now()
);

create index nutrition_meals_plan_idx on public.nutrition_meals (plan_id, position);

-- 3. Τρόφιμα ανά γεύμα (ordered)
create table public.nutrition_meal_foods (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null references public.nutrition_meals(id) on delete cascade,
  position int not null,
  emoji text,
  name text not null,
  qty text,                         -- πχ "80g", "1 τεμ", "150ml"
  protein_g numeric(6,2),
  carbs_g numeric(6,2),
  fat_g numeric(6,2),
  kcal numeric(6,2),
  created_at timestamptz not null default now()
);

create index nutrition_meal_foods_meal_idx on public.nutrition_meal_foods (meal_id, position);

-- 4. Assignment στο trainer_clients
alter table public.trainer_clients
  add column assigned_nutrition_plan_id uuid references public.nutrition_plans(id) on delete set null;

-- 5. RLS
alter table public.nutrition_plans enable row level security;
alter table public.nutrition_meals enable row level security;
alter table public.nutrition_meal_foods enable row level security;

-- Trainers: πλήρης έλεγχος στα δικά τους nutrition plans
create policy "Trainers manage their nutrition plans"
  on public.nutrition_plans for all
  using (auth.uid() = trainer_id)
  with check (auth.uid() = trainer_id);

-- Clients: βλέπουν το πλάνο που τους έχει ανατεθεί
create policy "Clients see their assigned nutrition plan"
  on public.nutrition_plans for select
  using (
    exists (
      select 1 from public.trainer_clients tc
      where tc.assigned_nutrition_plan_id = public.nutrition_plans.id
        and tc.client_id = auth.uid()
    )
  );

-- Meals: όποιος βλέπει το plan βλέπει και τα γεύματα
create policy "Anyone with plan access can view meals"
  on public.nutrition_meals for select
  using (
    exists (
      select 1 from public.nutrition_plans p
      where p.id = public.nutrition_meals.plan_id
        and (
          p.trainer_id = auth.uid()
          or exists (
            select 1 from public.trainer_clients tc
            where tc.assigned_nutrition_plan_id = p.id
              and tc.client_id = auth.uid()
          )
        )
    )
  );

-- Meals: trainer manage
create policy "Trainers insert meals in their plans"
  on public.nutrition_meals for insert
  with check (
    exists (
      select 1 from public.nutrition_plans p
      where p.id = public.nutrition_meals.plan_id
        and p.trainer_id = auth.uid()
    )
  );

create policy "Trainers update meals in their plans"
  on public.nutrition_meals for update
  using (
    exists (
      select 1 from public.nutrition_plans p
      where p.id = public.nutrition_meals.plan_id
        and p.trainer_id = auth.uid()
    )
  );

create policy "Trainers delete meals in their plans"
  on public.nutrition_meals for delete
  using (
    exists (
      select 1 from public.nutrition_plans p
      where p.id = public.nutrition_meals.plan_id
        and p.trainer_id = auth.uid()
    )
  );

-- Meal foods: όποιος βλέπει το meal βλέπει και τα τρόφιμα
create policy "Anyone with meal access can view foods"
  on public.nutrition_meal_foods for select
  using (
    exists (
      select 1 from public.nutrition_meals m
      join public.nutrition_plans p on p.id = m.plan_id
      where m.id = public.nutrition_meal_foods.meal_id
        and (
          p.trainer_id = auth.uid()
          or exists (
            select 1 from public.trainer_clients tc
            where tc.assigned_nutrition_plan_id = p.id
              and tc.client_id = auth.uid()
          )
        )
    )
  );

create policy "Trainers insert foods in their plans"
  on public.nutrition_meal_foods for insert
  with check (
    exists (
      select 1 from public.nutrition_meals m
      join public.nutrition_plans p on p.id = m.plan_id
      where m.id = public.nutrition_meal_foods.meal_id
        and p.trainer_id = auth.uid()
    )
  );

create policy "Trainers update foods in their plans"
  on public.nutrition_meal_foods for update
  using (
    exists (
      select 1 from public.nutrition_meals m
      join public.nutrition_plans p on p.id = m.plan_id
      where m.id = public.nutrition_meal_foods.meal_id
        and p.trainer_id = auth.uid()
    )
  );

create policy "Trainers delete foods in their plans"
  on public.nutrition_meal_foods for delete
  using (
    exists (
      select 1 from public.nutrition_meals m
      join public.nutrition_plans p on p.id = m.plan_id
      where m.id = public.nutrition_meal_foods.meal_id
        and p.trainer_id = auth.uid()
    )
  );
