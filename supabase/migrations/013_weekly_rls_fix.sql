-- 013_weekly_rls_fix.sql
-- Επιτρέπει στους clients να διαβάζουν προγράμματα/πλάνα/ασκήσεις/γεύματα
-- που εμφανίζονται στο εβδομαδιαίο τους πρόγραμμα (weekly_schedule).
-- Χωρίς αυτό, ο client βλέπει το program_id στο weekly_schedule αλλά δεν
-- μπορεί να πάρει τα details (name, title, exercises) από το programs table,
-- γιατί οι υπάρχουσες policies ελέγχουν μόνο assigned_program_id στο
-- trainer_clients.

create policy "Clients see programs in their weekly schedule"
  on public.programs for select
  using (
    exists (
      select 1 from public.client_weekly_schedule cws
      where cws.program_id = public.programs.id
        and cws.client_id = auth.uid()
    )
  );

create policy "Clients see nutrition plans in their weekly schedule"
  on public.nutrition_plans for select
  using (
    exists (
      select 1 from public.client_weekly_schedule cws
      where cws.nutrition_plan_id = public.nutrition_plans.id
        and cws.client_id = auth.uid()
    )
  );

create policy "Clients see exercises of programs in their weekly schedule"
  on public.program_exercises for select
  using (
    exists (
      select 1 from public.client_weekly_schedule cws
      where cws.program_id = public.program_exercises.program_id
        and cws.client_id = auth.uid()
    )
  );

create policy "Clients see meals of plans in their weekly schedule"
  on public.nutrition_meals for select
  using (
    exists (
      select 1 from public.client_weekly_schedule cws
      where cws.nutrition_plan_id = public.nutrition_meals.plan_id
        and cws.client_id = auth.uid()
    )
  );

create policy "Clients see foods of meals in weekly schedule plans"
  on public.nutrition_meal_foods for select
  using (
    exists (
      select 1 from public.nutrition_meals nm
      join public.client_weekly_schedule cws on cws.nutrition_plan_id = nm.plan_id
      where nm.id = public.nutrition_meal_foods.meal_id
        and cws.client_id = auth.uid()
    )
  );
